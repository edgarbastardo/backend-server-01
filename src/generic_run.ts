require( 'dotenv' ).config(); //Read the .env file, in the root folder of project

import cluster from 'cluster';

import appRoot from 'app-root-path';

import CommonConstants from './02_system/common/CommonConstants';

import CommonUtilities from "./02_system/common/CommonUtilities";
import SystemUtilities from "./02_system/common/SystemUtilities";

import LoggerManager from "./02_system/common/managers/LoggerManager";
import NotificationManager from './02_system/common/managers/NotificationManager';
import DBConnectionManager from './02_system/common/managers/DBConnectionManager';
import CacheManager from './02_system/common/managers/CacheManager';

import BulkCreateOrder from "./05_generic_run/BulkCreateOrder";

let debug = require( 'debug' )( 'generic_run@main_process' );

const argv = require('yargs').argv;

export default class GeneriRun {

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

      await BulkCreateOrder.bulkCreateOrder( LoggerManager.mainLoggerInstance );

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
