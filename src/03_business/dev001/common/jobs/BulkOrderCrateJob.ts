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

import CommonConstants from "../../../../02_system/common/CommonConstants";

import CommonUtilities from "../../../../02_system/common/CommonUtilities";
import SystemUtilities from "../../../../02_system/common/SystemUtilities";

import RedisConnectionManager from "../../../../02_system/common/managers/RedisConnectionManager";
import NotificationManager from '../../../../02_system/common/managers/NotificationManager';
import LoggerManager from '../../../../02_system/common/managers/LoggerManager';
//import DBConnectionManager from '../../../../02_system/common/managers/DBConnectionManager';
import I18NManager from '../../../../02_system/common/managers/I18Manager';

//import { Redis, Cluster } from 'ioredis';
import { OdinRequestServiceV1 } from "../../../common/services/OdinRequestServiceV1";

const debug = require( 'debug' )( 'BulkOrderCreateJob' );

export default class BulkOrderCreateJob {

  public readonly Name = "BulkOrderCreateJob";

  public updateTipJobQueue: any;

  //public static completedJobs = [];

  public async notify( strKind: string,
                       strJobId: string,
                       strUserName: string,
                       strFileName: string,
                       strStatus: string ) {

    await NotificationManager.publishToExternal(
                                                 {
                                                   body: {
                                                           kind: strKind,
                                                           text: "Bulk order create job.\nJob: " + strJobId + "\nUser: " + strUserName + "\nFile: " + strFileName + "\nStatus: " + strStatus,
                                                           fields: [
                                                                     {
                                                                       title: "Date",
                                                                       value: SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ),
                                                                       short: false
                                                                     },
                                                                     {
                                                                       title: "Host",
                                                                       value: SystemUtilities.getHostName(),
                                                                       short: false
                                                                     },
                                                                     {
                                                                       title: "Application",
                                                                       value: process.env.APP_SERVER_DATA_NAME,
                                                                       short: false
                                                                     },
                                                                     {
                                                                     title: "Running from",
                                                                     value: SystemUtilities.strBaseRunPath,
                                                                     short: false
                                                                     }
                                                                 ],
                                                           footer: "787735A48D5F",
                                                           // `Date: ${SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 )}\nHost: ${SystemUtilities.getHostName()}\nApplication: ${process.env.APP_SERVER_DATA_NAME}\nRunning from: ${SystemUtilities.strBaseRunPath}`
                                                         }
                                                 },
                                                 LoggerManager.mainLoggerInstance
                                               );

  }

  public static detectColumnDataPositions( headers: string[], logger: any ): {} {

    let result = {

      Establishment: -1,
      Ticket: -1,
      Name: -1,
      Address: -1,
      ZipCode: -1,
      City: -1,
      Phone: -1,
      Note: -1,
      Driver: -1,
      CreatedAt: -1

    }

    let intFieldsCount = Object.keys( result ).length;
    let intFoundFieldsCount = 0;

    try {

      for ( let intIndexHeader = 0; intIndexHeader < headers.length; intIndexHeader++ ) {

        if ( headers[ intIndexHeader ] ) {

          const strHeader = headers[ intIndexHeader ].trim().toLowerCase();

          if ( strHeader === "establishment" ) {

            if ( result.Establishment === -1 ) {

              result.Establishment = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader  === "#ticket" ||
                    strHeader  === "ticket" ) {

            if ( result.Ticket === -1 ) {

              result.Ticket = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader === "name" ) {

            if ( result.Name === -1 ) {

              result.Name = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader === "address" ) {

            if ( result.Address === -1 ) {

              result.Address = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader === "zipcode" ||
                    strHeader === "zip code" ||
                    strHeader === "zip_code" ) {

            if ( result.ZipCode === -1 ) {

              result.ZipCode = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader === "city" ) {

            if ( result.City === -1 ) {

              result.City = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader === "phone" ) {

            if ( result.Phone === -1 ) {

              result.Phone = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader === "note" ) {

            if ( result.Note === -1 ) {

              result.Note = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader === "driver" ) {

            if ( result.Driver === -1 ) {

              result.Driver = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader === "created_at" ||
                    strHeader === "created at" ||
                    strHeader === "createdat" ) {

            if ( result.CreatedAt === -1 ) {

              result.CreatedAt = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = BulkOrderCreateJob.name + "." + this.detectColumnDataPositions.name;

      const strMark = "45924FF5765D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    result[ "FieldsCount" ] = intFieldsCount;
    result[ "FoundFieldsCount" ] = intFoundFieldsCount;

    return result;

  }

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

            let debugMark = debug.extend( 'CFF57391F709' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );

            debugMark( "Start time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            //debugMark( "Completed JOBS: %O", SampleJob.completedJobs );
            //debugMark( "JOB token: [%s]", jobData.queue.token );
            debugMark( "JOB Id: [%s]", job.data.Id );
            debugMark( "JOB Establishment Id: [%s]", job.data.EstablishmentId );
            debugMark( "JOB Date: [%s]", job.data.CreatedAt );
            debugMark( "JOB Path: [%s]", job.data.Path );
            debugMark( "JOB Language: [%s]", job.data.Language );

            this.notify( "notification",
                         job.data.Id,
                         job.data.JobStartedBy,
                         job.data.FileName,
                         "Job start running" );

            const strLanguage = job.data.Language;

            const strOutputJobPath = path.join( SystemUtilities.strBaseRootPath,
                                                "jobs/output/" + job.data.Id + "/" );

            fs.mkdirSync( strOutputJobPath, { recursive: true } );

            const strResultJobFile = strOutputJobPath + job.data.Id + ".result";
            const strStatusJobFile = strOutputJobPath + job.data.Id + ".status";
            const strDetailsJobFile = strOutputJobPath + job.data.Id + ".details";

            let intRow = 0;

            let intProcessedRows = 0;

            const jsonStatusJob = {
                                    Progress: 0,
                                    Total: 0,
                                    Kind: "regular",
                                    Status: await I18NManager.translate( strLanguage, 'Process started...' ),
                                    Warnings: 0,
                                    Errors: 0
                                  };

            const jsonDetailsProcess = {

              Row: intRow,
              Kind: "regular",
              Status: "Default",
              Result: null

            };

            fs.writeFileSync( strResultJobFile, await I18NManager.translate( strLanguage, 'Job Id %s.\n', job.data.Id ) );

            try {

              jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'Process started...' );

              fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

              fs.appendFileSync( strResultJobFile, jsonStatusJob.Status + "\n" );

              fs.appendFileSync( strResultJobFile, await I18NManager.translate( strLanguage, 'Opening file.\n' ) );

              const excelRows = await xlsxFile( job.data.Path );

              fs.appendFileSync( strResultJobFile, await I18NManager.translate( strLanguage, 'File opened. %s rows found.\n', excelRows.length ) );

              jsonStatusJob.Progress = 0;
              jsonStatusJob.Total = excelRows.length;
              jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'Process started.' );
              jsonStatusJob.Warnings = 0;
              jsonStatusJob.Errors = 0;

              fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

              const headers = {

                'Content-Type': 'application/json',
                'Authorization': process.env.ODIN_API_KEY1

              }

              const backend = {

                url: [ job.data.Backend ]

              }

              let createdAt = null;

              //Send the haders to detect the order
              const columnDataPositions = BulkOrderCreateJob.detectColumnDataPositions( excelRows[ 0 ], logger ) as any;

              for ( intRow = 1; intRow < excelRows.length; intRow++ ) {

                /*
                if ( excelRows[ intRow ][ 1 ] &&  //Ticket
                     excelRows[ intRow ][ 2 ] &&  //Customer Name
                     excelRows[ intRow ][ 3 ] &&  //Address
                     excelRows[ intRow ][ 4 ] &&  //Zip Code
                     excelRows[ intRow ][ 5 ] &&  //City
                     excelRows[ intRow ][ 7 ] ) { //Note
                      */
                if ( columnDataPositions.FoundFieldsCount === columnDataPositions.FieldsCount ) {

                  const intPhone = parseInt( CommonUtilities.clearSpecialChars( excelRows[ intRow ][ columnDataPositions.Phone ], "-() " ) );  //excelRows[ intRow ][ 6 ], "-() " ) ); //Phone

                  if ( createdAt === null ) {

                    createdAt = SystemUtilities.getCurrentDateAndTimeFrom( job.data.CreatedAt );

                  }
                  else {

                    //Increment by 1 minute every delivery
                    createdAt = SystemUtilities.getCurrentDateAndTimeFromAndIncMinutes( createdAt, 1 );

                  }

                  const body = {

                    ticket: excelRows[ intRow ][ columnDataPositions.Ticket ], //excelRows[ intRow ][ 1 ], //Ticket
                    establishment_id: job.data.EstablishmentId, //Establishment
                    zip_code: excelRows[ intRow ][ columnDataPositions.ZipCode ], //excelRows[ intRow ][ 4 ], //Zip code
                    phone: intPhone !== NaN ? intPhone: 7868062108,
                    address: excelRows[ intRow ][ columnDataPositions.Address ], //excelRows[ intRow ][ 3 ], //Address
                    address_type: 'residential',
                    city: excelRows[ intRow ][ columnDataPositions.City ], //excelRows[ intRow ][ 5 ], //City
                    payment_method: 'cash',
                    note: excelRows[ intRow ][ columnDataPositions.Note ] + ", " + excelRows[ intRow ][ columnDataPositions.Name ], //excelRows[ intRow ][ 7 ] + ", " + excelRows[ intRow ][ 2 ], //Note + Customer Name
                    client_name: excelRows[ intRow ][ columnDataPositions.Name ], //excelRows[ intRow ][ 2 ], //Customer name
                    driver_id: job.data.DriverId,
                    created_at: createdAt.format( CommonConstants._DATE_TIME_LONG_FORMAT_09 ),
                    tip: 0,
                    tip_method: 'cash',

                    simulate: job.data.Simulate,
                    check_address_and_customer: job.data.CheckAddressAndCustomer

                  }

                  jsonStatusJob.Kind = "regular";
                  jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'Processing the row number %s', intRow );

                  fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

                  fs.appendFileSync( strResultJobFile, jsonStatusJob.Status + "\n" );

                  const result = await OdinRequestServiceV1.callCreateOrder( backend,
                                                                             headers,
                                                                             body ) as any;

                  if ( result ) {

                    if ( result.output ) {

                      if  ( result.output.status >= 200 &&
                            result.output.status < 300 ) {

                        jsonStatusJob.Kind = "regular";
                        jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'OK: row number %s. Order Id: %s', intRow, result.output.body.data.id );
                        jsonStatusJob.Progress = intRow + 1;
                        jsonStatusJob.Progress = intRow + 1;

                        fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

                        fs.appendFileSync( strResultJobFile, jsonStatusJob.Status + "\n" );

                        jsonDetailsProcess.Row = intRow;
                        jsonDetailsProcess.Kind = jsonStatusJob.Kind;
                        jsonDetailsProcess.Status = jsonStatusJob.Status;
                        jsonDetailsProcess.Result = result; //Save the result to details

                        debugMark( jsonStatusJob.Status );

                        intProcessedRows += 1;

                      }
                      else {

                        jsonStatusJob.Kind = "error_and_continue";
                        jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'Error: row number %s. Result %s %s', intRow, result.output.status, result.output.statusText );
                        jsonStatusJob.Progress = intRow + 1;
                        jsonStatusJob.Errors += 1;

                        fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

                        fs.appendFileSync( strResultJobFile, jsonStatusJob.Status + "\n" );

                        jsonDetailsProcess.Row = intRow;
                        jsonDetailsProcess.Kind = jsonStatusJob.Kind;
                        jsonDetailsProcess.Status = jsonStatusJob.Status;
                        jsonDetailsProcess.Result = result; //Save the result to details

                        debugMark( jsonStatusJob.Status );

                        this.notify( "error",
                                     job.data.Id,
                                     job.data.JobStartedBy,
                                     job.data.FileName,
                                     jsonStatusJob.Status );

                      }

                    }
                    else if ( result.error ) {

                      jsonStatusJob.Kind = "error_and_continue";
                      jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'Error: row number %s. Message: %s', intRow, result.error.message );
                      jsonStatusJob.Progress = intRow + 1;
                      jsonStatusJob.Errors += 1;

                      fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

                      fs.appendFileSync( strResultJobFile, jsonStatusJob.Status + "\n" );

                      jsonDetailsProcess.Row = intRow;
                      jsonDetailsProcess.Kind = jsonStatusJob.Kind;
                      jsonDetailsProcess.Status = jsonStatusJob.Status;
                      jsonDetailsProcess.Result = result; //Save the result to details

                      debugMark( jsonStatusJob.Status );

                      this.notify( "error",
                                   job.data.Id,
                                   job.data.JobStartedBy,
                                   job.data.FileName,
                                   jsonStatusJob.Status );

                    }
                    else {

                      jsonStatusJob.Kind = "error_and_continue";
                      jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'Error: row number %s. No result', intRow );
                      jsonStatusJob.Progress = intRow + 1;
                      jsonStatusJob.Errors += 1;

                      fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

                      fs.appendFileSync( strResultJobFile, jsonStatusJob.Status + "\n" );

                      jsonDetailsProcess.Row = intRow;
                      jsonDetailsProcess.Kind = jsonStatusJob.Kind;
                      jsonDetailsProcess.Status = jsonStatusJob.Status;
                      jsonDetailsProcess.Result = result; //Save the result to details

                      debugMark( jsonStatusJob.Status );

                      this.notify( "error",
                                   job.data.Id,
                                   job.data.JobStartedBy,
                                   job.data.FileName,
                                   jsonStatusJob.Status );

                    }

                  }
                  else {

                    jsonStatusJob.Kind = "error_and_continue";
                    jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'Error: row number %s. No response', intRow );
                    jsonStatusJob.Progress = intRow + 1;
                    jsonStatusJob.Errors += 1;

                    fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

                    fs.appendFileSync( strResultJobFile, jsonStatusJob.Status + "\n" );

                    jsonDetailsProcess.Row = intRow;
                    jsonDetailsProcess.Kind = jsonStatusJob.Kind;
                    jsonDetailsProcess.Status = jsonStatusJob.Status;
                    jsonDetailsProcess.Result = result; //Save the result to details

                    debugMark( jsonStatusJob.Status );

                    this.notify( "error",
                                 job.data.Id,
                                 job.data.JobStartedBy,
                                 job.data.FileName,
                                 jsonStatusJob.Status );

                  }

                }
                else {

                  jsonStatusJob.Kind = "warning_and_continue";
                  jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'Warning: row number %s. One or more cell values are blank or missing data.', intRow + 1 )
                  jsonStatusJob.Progress = intRow + 1;
                  jsonStatusJob.Warnings += 1;

                  fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

                  fs.appendFileSync( strResultJobFile, jsonStatusJob.Status + '\n' );

                  jsonDetailsProcess.Row = intRow;
                  jsonDetailsProcess.Kind = jsonStatusJob.Kind;
                  jsonDetailsProcess.Status = jsonStatusJob.Status;
                  jsonDetailsProcess.Result = null; //Save the result to details

                  debugMark( jsonStatusJob.Status );

                  this.notify( "warning",
                               job.data.Id,
                               job.data.JobStartedBy,
                               job.data.FileName,
                               jsonStatusJob.Status );

                }

                //Save to result file
                fs.appendFileSync( strDetailsJobFile, JSON.stringify( jsonDetailsProcess, null, 2 ) + ',\n' );

              }

              jsonStatusJob.Kind = "done";
              jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'Success. %s rows processed, %s rows in total.', intProcessedRows, excelRows.length );

              debugMark( jsonStatusJob.Status );

              fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

              let strMessage = await I18NManager.translate( strLanguage, '%s rows processed.', intProcessedRows );

              fs.appendFileSync( strResultJobFile, strMessage + "\n" );

              debugMark( strMessage );

              strMessage = await I18NManager.translate( strLanguage, 'Total %s rows.', excelRows.length );

              fs.appendFileSync( strResultJobFile, strMessage + "\n" );

              debugMark( strMessage );

              if ( jsonStatusJob.Errors === 0 &&
                   jsonStatusJob.Warnings === 0 ) {

                strMessage = await I18NManager.translate( strLanguage, 'Success completed the job.' );

                fs.appendFileSync( strResultJobFile, strMessage + "\n" );

                this.notify( "notification",
                             job.data.Id,
                             job.data.JobStartedBy,
                             job.data.FileName,
                             strMessage );

              }
              else {

                strMessage = await I18NManager.translate( strLanguage,
                                                          '*** Job completed with %s errors and %s warnings. ***\n',
                                                          jsonStatusJob.Errors,
                                                          jsonStatusJob.Warnings );

                fs.appendFileSync( strResultJobFile, strMessage );

                this.notify( "warning",
                             job.data.Id,
                             job.data.JobStartedBy,
                             job.data.FileName,
                             strMessage );

              }

              debugMark( strMessage );

            }
            catch ( error ) {

              jsonStatusJob.Kind = "error_and_stop";
              jsonStatusJob.Errors += 1;

              if ( intRow === 1 ) {

                jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'Error to process [%s].', error.message );

              }
              else {

                jsonStatusJob.Status = await I18NManager.translate( strLanguage, 'In the row %s. Error: [%s].', intRow, error.message );

              }

              fs.writeFileSync( strStatusJobFile, JSON.stringify( jsonStatusJob ) );

              fs.appendFileSync( strResultJobFile, jsonStatusJob.Status + '\n' );

              jsonDetailsProcess.Row = intRow;
              jsonDetailsProcess.Kind = jsonStatusJob.Kind;
              jsonDetailsProcess.Status = jsonStatusJob.Status;
              jsonDetailsProcess.Result = error;

              fs.appendFileSync( strDetailsJobFile, JSON.stringify( jsonDetailsProcess, null, 2 ) + ',\n' );

              const strMark = "B6061DE6D6C9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

              const debugMark = debug.extend( strMark );

              debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
              debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );

              this.notify( "error",
                           job.data.Id,
                           job.data.JobStartedBy,
                           job.data.FileName,
                           error.message ? error.message : "No error message available" );

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

      sourcePosition.method = BulkOrderCreateJob.name + "." + this.init.name;

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
