require( 'dotenv' ).config(); //Read the .env file, in the root folder of project

import fs from 'fs'; //Load the filesystem module
import cluster from 'cluster';

import appRoot from 'app-root-path';

import xlsxFile from 'read-excel-file/node';

import CommonConstants from './02_system/common/CommonConstants';

import CommonUtilities from "./02_system/common/CommonUtilities";
import SystemUtilities from "./02_system/common/SystemUtilities";

import LoggerManager from "./02_system/common/managers/LoggerManager";
import NotificationManager from './02_system/common/managers/NotificationManager';
import DBConnectionManager from './02_system/common/managers/DBConnectionManager';
import CacheManager from './02_system/common/managers/CacheManager';
//import ApplicationServerTaskManager from "./02_system/common/managers/ApplicationServerTaskManager";
import { OdinRequestServiceV1 } from "./04_test/standalone/OdinRequestServiceV1";
import I18NManager from "./02_system/common/managers/I18Manager";

let debug = require( 'debug' )( 'generic_run@main_process' );

const argv = require('yargs').argv;

export default class GeneriRun {

  /*
  static bRunningTask = false;

  static fibo( n: number ): number {

    if ( n < 2 ) {

      return 1;

    }
    else {

      return ServerTask.fibo( n - 2 ) + ServerTask.fibo( n - 1 );

    }

  }

  static async handlerRunRask(): Promise<boolean> {

    let bResult = false;

    let currentTransaction = null;

    const strMark = "B6BF8BB0C7C6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

    const debugMark = debug.extend( strMark );

    debugMark( "handlerRunRask - start" );

    try {

      if ( ServerTask.bRunningTask === false ) {

        ServerTask.bRunningTask = true;

        const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

        if ( currentTransaction === null ) {

          currentTransaction = await dbConnection.transaction();

        }

        //ServerTask.fibo( 9999 );

        if ( currentTransaction !== null &&
            currentTransaction.finished !== "rollback" ) {

          await currentTransaction.commit();

        }

        ServerTask.bRunningTask = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = ServerTask.name + "." + ServerTask.handlerRunRask.name;

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

      if ( currentTransaction !== null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    debugMark( "handlerRunRask - finish" );

    return bResult;

  }
  */

  static async handlerCleanExit() {

    await NotificationManager.publishOnTopic( "SystemEvent",
                                              {
                                                SystemId: SystemUtilities.getSystemId(),
                                                SystemName: process.env.APP_SERVER_IM_NAME,
                                                SubSystem: "Server",
                                                Token: "No apply",
                                                UserId: "No apply",
                                                UserName: "No apply",
                                                UserGroupId: "No apply",
                                                Code: "SERVER_TASK_SHUTDOWN",
                                                EventAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                Data: {}
                                              },
                                              LoggerManager.mainLoggerInstance );

    if ( process.env.ENV !== "dev" ) {

      //

    }

    process.exit( 0 ); //Finish the process

  }

  static async bulkCreateOrder() {

    try {

      //npm run start:run -- --file=ruta-sergios-702.xlsx --server=test01.weknock-tech.com --authorization=8f5f0014-062a-492f-aa65-14d0cd25becb
      //npm run start:run -- --file=ruta-sergios-702.xlsx

      let debugMark = debug.extend( '9159DCAEB587' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      debugMark( 'bulkCreateOrder' );

      debugMark( 'Argument file: %s', argv.file );
      debugMark( 'Argument server: %s', argv.server );

      if ( argv.file ) {

        debugMark( SystemUtilities.strBaseRootPath );

        const strFullFilePath = SystemUtilities.strBaseRootPath + '/data/' + SystemUtilities.getHostName() + "/" + argv.file;

        if ( fs.existsSync( strFullFilePath ) ) {

          const strFullFilePathResult = strFullFilePath + '.result';
          const strFullFilePathInput = strFullFilePath + '.input';
          const strFullFilePathOutput = strFullFilePath + '.output';

          if ( !fs.existsSync( strFullFilePathResult ) ) {

            let strMessage = I18NManager.translateSync( 'en_US', 'Reading the file %s', strFullFilePath );

            debugMark( strMessage );
            fs.writeFileSync( strFullFilePathResult, strMessage + "\n" );

            const excelRows = await xlsxFile( strFullFilePath );

            strMessage = I18NManager.translateSync( 'en_US', '%s Rows found', excelRows.length );

            debugMark( strMessage );
            fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

            let intRow = 1;

            let strDefaultAuthorization = argv.authorization ? argv.authorization: process.env.ODIN_API_KEY1;

            if ( !argv.authorization ) {

              strMessage = I18NManager.translateSync( 'en_US', 'Warning the parameter --authorization=??? not defined using %s by default', strDefaultAuthorization );

              debugMark( strMessage );

              fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

            }
            else {

              strMessage = I18NManager.translateSync( 'en_US', 'Using authorization %s', strDefaultAuthorization );

              debugMark( strMessage );

              fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

            }

            const headers = {

              'Content-Type': 'application/json',
              'Authorization': strDefaultAuthorization,

            }

            const strDefaultServer = argv.server ? argv.server : 'http://test01.weknock-tech.com';

            if ( !argv.server ) {

              strMessage = I18NManager.translateSync( 'en_US', 'Warning the parameter --server=??? not defined using %s by default', strDefaultServer );

              debugMark( strMessage );

              fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

            }
            else {

              strMessage = I18NManager.translateSync( 'en_US', 'Using server %s', strDefaultServer );

              debugMark( strMessage );

              fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

            }

            const backend = {

              url: [ strDefaultServer ]

            }

            let intProcesedRows = 0;

            for ( intRow = 1; intRow < excelRows.length; intRow++ ) {

              const intPhone = parseInt( CommonUtilities.clearSpecialChars( excelRows[ intRow ][ 6 ], "-() " ) );

              const body = {

                establishment_id: excelRows[ intRow ][ 0 ],
                zip_code: excelRows[ intRow ][ 4 ],
                phone: intPhone !== NaN ? intPhone: 7868062108,
                address: excelRows[ intRow ][ 3 ],
                city: excelRows[ intRow ][ 5 ],
                address_type: 'residential',
                payment_method: 'cash',
                note: excelRows[ intRow ][ 7 ] + ", " + excelRows[ intRow ][ 2 ],
                driver_id: excelRows[ intRow ][ 8 ],

              }

              strMessage = I18NManager.translateSync( 'en_US', 'Processing the row number %s', intRow );

              debugMark( strMessage );

              fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

              const result = await OdinRequestServiceV1.callCreateOrder( backend,
                                                                         headers,
                                                                         body ) as any;

              if ( result ) {

                if ( result.input ) {

                  fs.appendFileSync( strFullFilePathInput, JSON.stringify( result.input, null, 2 ) + '\n' );

                }

                if ( result.output ) {

                  fs.appendFileSync( strFullFilePathOutput, JSON.stringify( result.output, null, 2 ) + '\n' );

                  if  ( result.output.status >= 200 &&
                        result.output.status < 300 ) {

                    strMessage = I18NManager.translateSync( 'en_US', 'ok:%s:%s', intRow, result.output.body.data.id );

                    debugMark( strMessage );

                    fs.appendFileSync( strFullFilePathResult, strMessage + '\n' );

                    intProcesedRows += 1;

                  }
                  else {

                    strMessage = I18NManager.translateSync( 'en_US', 'error:%s:%s:%s', intRow, result.output.status, result.output.statusText );

                    debugMark( strMessage );

                    fs.appendFileSync( strFullFilePathResult, strMessage + '\n' );

                  }

                }
                else if ( result.error ) {

                  strMessage = I18NManager.translateSync( 'en_US', 'error:%s:%s', intRow, result.error.message );

                  debugMark( strMessage );

                  fs.appendFileSync( strFullFilePathResult, strMessage + '\n' );

                }
                else {

                  strMessage = I18NManager.translateSync( 'en_US', 'error:%s:error_no_result', intRow );

                  debugMark( strMessage );

                  fs.appendFileSync( strFullFilePathResult, strMessage + '\n' );

                }

              }
              else {

                strMessage = I18NManager.translateSync( 'en_US', 'error:%s:error_no_response', intRow );

                debugMark( strMessage );

                fs.appendFileSync( strFullFilePathResult, strMessage + '\n' );

              }

            }

            strMessage = I18NManager.translateSync( 'en_US', 'Processed %s rows, Total: %s rows', intProcesedRows, excelRows.length );

            debugMark( strMessage );

            fs.appendFileSync( strFullFilePathResult, strMessage + '\n' );

          }
          else {

            debugMark( 'The file in the path %s already processed. If you need process again delete the .result file', SystemUtilities.strBaseRootPath + "/temp/" + argv.file );

          }

        }
        else {

          debugMark( 'The file in the path %s not exists', SystemUtilities.strBaseRootPath + "/temp/" + argv.file );

        }

      }
      else {

        debugMark( 'No argument --file=??? defined. You must define using `npm run start:run --file=myfile.xlsx` with not quotes' );

      }

      //const args = process.argv.slice( 2 );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.main.name;

      const strMark = "F71332BCED7B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

    }

  }

  static async main() {

    SystemUtilities.startRun = SystemUtilities.getCurrentDateAndTime(); //new Date();

    SystemUtilities.strBaseRunPath = __dirname;
    SystemUtilities.strBaseRootPath = appRoot.path;
    SystemUtilities.strAPPName = process.env.APP_SERVER_IM_NAME;

    try {

      let debugMark = debug.extend( "FC96A92FD2FF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      debugMark( "%s", SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Main process started" );
      debugMark( "Running from: [%s]", SystemUtilities.strBaseRunPath );

      LoggerManager.mainLoggerInstance = await LoggerManager.createMainLogger(); //Create the main logger

      CacheManager.currentInstance = await CacheManager.create( LoggerManager.mainLoggerInstance );

      await DBConnectionManager.connect( "*", LoggerManager.mainLoggerInstance ); //Init the connection to db using the orm

      await DBConnectionManager.loadQueryStatement( "*", LoggerManager.mainLoggerInstance );

      process.on( 'SIGTERM', async () => {

        //console.info('SIGTERM signal received.');
        debugMark( "SIGTERM signal received." );

        GeneriRun.handlerCleanExit();

      });

      process.on( 'SIGINT', () => {

        //console.info('SIGTERM signal received.');
        debugMark( "SIGINT signal received." );

        GeneriRun.handlerCleanExit();

      });

      /*
      await ApplicationServerTaskManager.create( {},
                                                 LoggerManager.mainLoggerInstance );
                                                 */

      await NotificationManager.publishToExternal(
                                                   {
                                                     body: {
                                                             kind: "notification",
                                                             text: "Start running",
                                                             fields: [
                                                                       {
                                                                         title: "Date",
                                                                         value: SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ),
                                                                         short: false
                                                                       },
                                                                       {
                                                                         title: "Host",
                                                                         value: SystemUtilities.getHostName(),
                                                                         short: false
                                                                       },
                                                                       {
                                                                         title: "Application",
                                                                         value: "Generic Run",
                                                                         short: false
                                                                       },
                                                                       {
                                                                         title: "Running from",
                                                                         value: SystemUtilities.strBaseRunPath,
                                                                         short: false
                                                                       }
                                                                     ],
                                                             footer: "BB38437F5AE3",
                                                           }
                                                   },
                                                   LoggerManager.mainLoggerInstance
                                                 );

      //setInterval( ServerTask.handlerRunRask, 30000 ); //Every 30 seconds

      await GeneriRun.bulkCreateOrder();

      process.exit( 0 );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.main.name;

      const strMark = "E65067AADF92" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

    }

  }

}

GeneriRun.main();
