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

const debug = require( 'debug' )( 'UpdateOrderTipsJob' );

export default class UpdateOrderTipJob {

  public readonly Name = "UpdateOrderTipsJob";

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

            let debugMark = debug.extend( 'C54B6E1954FA' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );

            debugMark( "Start time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            //debugMark( "Completed JOBS: %O", SampleJob.completedJobs );
            //debugMark( "JOB token: [%s]", jobData.queue.token );
            debugMark( "JOB Id: [%s]", job.data.Id );
            debugMark( "JOB Establishment Id: [%s]", job.data.EstablishmentId );
            debugMark( "JOB Date: [%s]", job.data.Date );
            debugMark( "JOB Path: [%s]", job.data.Path );
            debugMark( "JOB Language: [%s]", job.data.Language );

            const strLanguage = job.data.Language;

            const strResultJobPath = path.join( SystemUtilities.strBaseRootPath, "jobs/result/" + job.data.Id + "/" ); // + job.data.Id + ".result";

            fs.mkdirSync( strResultJobPath, { recursive: true } );

            const strResultJobFile = strResultJobPath + job.data.Id + ".result";

            let currentTransaction = null;

            let bIsLocalTransaction = false;

            let bApplyTransaction = false;

            let intRow = 1;

            try {

              const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

              if ( currentTransaction === null ) {

                currentTransaction = await dbConnection.transaction();

                bIsLocalTransaction = true;

              }

              let intProcessedRows = 0;

              fs.writeFileSync( strResultJobFile, await I18NManager.translate( strLanguage, 'Process started.\n' ) );

              fs.appendFileSync( strResultJobFile, await I18NManager.translate( strLanguage, 'Opening file.\n' ) );

              const excelRows = await xlsxFile( job.data.Path );

              fs.appendFileSync( strResultJobFile, await I18NManager.translate( strLanguage, 'File opened. %s rows found.\n', excelRows.length ) );

              for ( intRow = 1; intRow < excelRows.length; intRow++ ) {

                const strTicket = excelRows[ intRow ][ 2 ];

                if ( strTicket ) {

                  //fs.appendFileSync( strResultJobFile, await I18NManager.translate( strLanguage, 'Processing the row %s.\n', intRow + 1 ) );

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

                  intProcessedRows += 1;

                }
                else {

                  fs.appendFileSync( strResultJobFile, await I18NManager.translate( strLanguage, 'Skipping the row %s. Ticket cell value is blank.\n', intRow + 1 ) );

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

              fs.appendFileSync( strResultJobFile, "[Count]:" + await I18NManager.translate( strLanguage, '%s rows processed.\n', intProcessedRows ) );
              fs.appendFileSync( strResultJobFile, "[Done]:" + await I18NManager.translate( strLanguage, 'Process finished.\n' ) );

            }
            catch ( error ) {

              if ( intRow <= 1 ) {

                fs.appendFileSync( strResultJobFile, "[Error]:" + await I18NManager.translate( strLanguage, 'Error to process [%s].\n', error.message ) );

              }
              else {

                fs.appendFileSync( strResultJobFile, "[Error]:" + await I18NManager.translate( strLanguage, 'Error to process the row %s. [%s].\n', intRow, error.message ) );

              }

              const strMark = "048905BF76A6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      sourcePosition.method = UpdateOrderTipJob.name + "." + this.init.name;

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
