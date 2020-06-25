//import fs from 'fs';
//import { promises as fsPromises } from 'fs';
//import os from "os";
//import path from 'path';
//import appRoot from 'app-root-path';
import cluster from 'cluster';

//import util from 'util';

import Queue from 'bull';

import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import path from 'path';
import fs from 'fs'; //Load the filesystem module

import xlsxFile from 'read-excel-file/node';

import CommonConstants from '../../../../02_system/common/CommonConstants';

import CommonUtilities from "../../../../02_system/common/CommonUtilities";
import SystemUtilities from "../../../../02_system/common/SystemUtilities";
import RedisConnectionManager from "../../../../02_system/common/managers/RedisConnectionManager";
import DBConnectionManager from '../../../../02_system/common/managers/DBConnectionManager';
import I18NManager from '../../../../02_system/common/managers/I18Manager';
//import { Redis, Cluster } from 'ioredis';

const debug = require( 'debug' )( 'OrderTipUberUpdateJob' );

export default class OrderTipUberUpdateJob {

  public readonly Name = "OrderTipUberUpdateJob";

  public updateTipJobQueue: any;

  //public static completedJobs = [];

  public async init( params: any, logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      if ( RedisConnectionManager.useRedis() ) {

        //SampleJob.completedJobs = []; //Only work if one worker
        //await RedisConnectionManager.connect( "bullQueueClient", logger );
        //await RedisConnectionManager.connect( "bullQueueSubscriber", logger );
        //await RedisConnectionManager.connect( "bullQueueDefault", logger );

        const options = {

                          createClient: function ( type: string ) {

                            let result = null;

                            const strConnectionId = Math.floor( Math.random() * 10000 ) + 1000;

                            switch ( type ) {

                              case 'client': {

                                result = RedisConnectionManager.connectSync( "bullQueueClient-" + strConnectionId, logger );

                              }
                              case 'subscriber': {

                                result = RedisConnectionManager.connectSync( "bullQueueSubscriber-" + strConnectionId, logger );

                              }
                              default: {

                                result = RedisConnectionManager.connectSync( "bullQueueDefault-" + strConnectionId, logger );

                              }

                            }

                            return result;

                          },
                          /*
                          redis: {

                            host: process.env.REDIS_SERVER_IP,
                            port: parseInt( process.env.REDIS_SERVER_PORT ),
                            password: process.env.REDIS_SERVER_PASSWORD

                          },
                          */
                          settings: {

                            stalledInterval: 0, //Very important to long task not launch task repeated 2 times

                          }

                        };

        //Here your code of init
        this.updateTipJobQueue = new Queue(
                                            this.Name,
                                            options
                                          );

        if ( process.env.WORKER_KIND === "job_worker_process" ) {

          this.updateTipJobQueue.process( async ( job: any, done: any ) => {

            let debugMark = debug.extend( 'AB00868E3AE5' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );

            debugMark( "Start time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            //debugMark( "Completed JOBS: %O", SampleJob.completedJobs );
            //debugMark( "JOB token: [%s]", jobData.queue.token );
            debugMark( "JOB Id: [%s]", job.data.Id );
            debugMark( "JOB Establishment Id: [%s]", job.data.EstablishmentId );
            debugMark( "JOB Date: [%s]", job.data.Date );
            debugMark( "JOB Path: [%s]", job.data.Path );
            debugMark( "JOB Language: [%s]", job.data.Language );

            const strLanguage = job.data.Language;

            const strOutputJobPath = path.join( SystemUtilities.strBaseRootPath,
                                                "jobs/output/" + job.data.Id + "/" );

            fs.mkdirSync( strOutputJobPath, { recursive: true } );

            const strResultJobFile = strOutputJobPath + job.data.Id + ".result";
            const strStatusJobFile = strOutputJobPath + job.data.Id + ".status";

            let currentTransaction = null;

            let bIsLocalTransaction = false;

            let bApplyTransaction = false;

            let intRow = 1;

            const jsonStatusJob = {
                                    Progress: 0,
                                    Total: 0,
                                    Kind: "regular",
                                    Status: await I18NManager.translate( strLanguage, 'Process started...' )
                                  };

            try {

              const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

              if ( currentTransaction === null ) {

                currentTransaction = await dbConnection.transaction();

                bIsLocalTransaction = true;

              }

              let intUpdatedRows = 0;
              let intProcessedRows = 0;

              jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'Process started.' );

              fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

              fs.writeFileSync( strResultJobFile, jsonStatusJob.Status + "\n" );

              fs.appendFileSync( strResultJobFile, await I18NManager.translate( strLanguage, 'Opening file.\n' ) );

              const excelRows = await xlsxFile( job.data.Path );

              fs.appendFileSync( strResultJobFile, await I18NManager.translate( strLanguage, 'File opened. %s rows found.\n', excelRows.length ) );

              jsonStatusJob.Progress = 0;
              jsonStatusJob.Total = excelRows.length;
              jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'Process started.' );

              fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

              for ( intRow = 1; intRow < excelRows.length; intRow++ ) {

                let strTicket = excelRows[ intRow ][ 2 ];

                if ( strTicket ) {

                  if ( strTicket.startsWith( "#" ) ) {

                    strTicket = strTicket.substring( 1 ); //Remove # in start string

                  }

                  jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'Processing the row %s.', intRow + 1 );

                  fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

                  fs.appendFileSync( strResultJobFile, jsonStatusJob.Status + '\n' );

                  const dblTip = parseFloat( excelRows[ intRow ][ 14 ] );

                  const strSQL = DBConnectionManager.getStatement( "secondary",
                                                                   "updateOrderTip",
                                                                   {
                                                                     EstablishmentId: job.data.EstablishmentId,
                                                                     Date: job.data.Date,
                                                                     Ticket: strTicket,
                                                                     Tip: dblTip
                                                                   },
                                                                   job.data.logger );

                  const rows = await dbConnection.query( strSQL, {
                                                                   raw: true,
                                                                   type: QueryTypes.UPDATE,
                                                                   transaction: currentTransaction
                                                                 } );

                  if ( rows &&
                       rows.length > 1 &&
                       rows[ 1 ] === 1 ) {

                     intUpdatedRows += 1;

                  }

                  debugMark( "Ticket: %s, rows: %O", strTicket, rows );

                  jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'Row %s processed.', intRow + 1 );
                  jsonStatusJob.Progress = intRow + 1;

                  fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

                  fs.appendFileSync( strResultJobFile, jsonStatusJob.Status + '\n' );

                  intProcessedRows += 1;

                }
                else {

                  jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'Skipping the row %s. Ticket cell value is blank.', intRow + 1 )
                  jsonStatusJob.Progress = intRow + 1;

                  fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

                  fs.appendFileSync( strResultJobFile, jsonStatusJob.Status + '\n' );

                }

              }

              bApplyTransaction = true;

              if ( currentTransaction !== null &&
                   currentTransaction.finished !== "rollback" &&
                   bIsLocalTransaction ) {

                if ( bApplyTransaction ) {

                  await currentTransaction.commit();

                }
                else {

                  await currentTransaction.rollback();

                }

              }

              jsonStatusJob.Kind = "done";
              jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'Success. %s rows updated, %s rows in total.', intUpdatedRows, excelRows.length );

              fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

              fs.appendFileSync( strResultJobFile, await I18NManager.translate( strLanguage, '%s rows processed.\n', intProcessedRows ) );
              fs.appendFileSync( strResultJobFile, await I18NManager.translate( strLanguage, '%s rows updated.\n', intUpdatedRows ) );
              fs.appendFileSync( strResultJobFile, await I18NManager.translate( strLanguage, 'Total %s rows.\n', excelRows.length ) );
              fs.appendFileSync( strResultJobFile, await I18NManager.translate( strLanguage, 'Success completed the job.\n' ) );

            }
            catch ( error ) {

              jsonStatusJob.Kind = "error_and_stop";

              if ( intRow === 1 ) {

                jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'Error to process [%s].', error.message );

              }
              else {

                jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'In the row %s. Error: [%s].', intRow, error.message );

              }

              fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

              fs.appendFileSync( strResultJobFile, jsonStatusJob.Status + '\n' );

              const strMark = "B6061DE6D6C9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

              const debugMark = debug.extend( strMark );

              debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
              debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
              //debugMark( "Catched on: %O", sourcePosition );

              if ( currentTransaction !== null &&
                   bIsLocalTransaction ) {

                try {

                  await currentTransaction.rollback();

                }
                catch ( error ) {

                  //

                }

              }

            }

            debugMark( "Finish time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            //debugMark( "%O", job.data );
            job.data[ "completed" ] = true;

            done();

          } );

          const debugMark = debug.extend( "6CD318B45E4E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

          debugMark( "Registered process function for the job queue with name: %s, worker id: %s", this.Name, cluster.worker.id );

        }

        bResult = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = OrderTipUberUpdateJob.name + "." + this.init.name;

      const strMark = "78E5FC38F35D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return bResult;

  }

  public getJob(): any {

    return this.updateTipJobQueue;

  }

}
