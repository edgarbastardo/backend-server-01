require( "dotenv" ).config(); //Read the .env file, in the root folder of project

import fs from "fs"; //Load the filesystem module
import cluster from "cluster";

import appRoot from "app-root-path";

import CommonConstants from "./02_system/common/CommonConstants";

import CommonUtilities from "./02_system/common/CommonUtilities";
import SystemUtilities from "./02_system/common/SystemUtilities";

import LoggerManager from "./02_system/common/managers/LoggerManager";
import NotificationManager from "./02_system/common/managers/NotificationManager";
import DBConnectionManager from "./02_system/common/managers/DBConnectionManager";
import CacheManager from "./02_system/common/managers/CacheManager";
import ApplicationServerTaskManager from "./02_system/common/managers/ApplicationServerTaskManager";

let debug = require( "debug" )( "server_task@main_process" );

export default class App {

  static async handlerCleanExit() {

    await NotificationManager.publishOnTopic( "SystemEvent",
                                              {
                                                SystemId: SystemUtilities.getSystemId(),
                                                SystemName: process.env.APP_SERVER_TASK_NAME,
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

  static async proccessEnviromentContainer() {

    let enviromentContainer = {} as any;

    if ( fs.existsSync( SystemUtilities.strBaseRootPath + "/.env.container" ) ) {

      try {

        const strFileContent = fs.readFileSync( SystemUtilities.strBaseRootPath + "/.env.container" );

        const dotenv = require( "dotenv" );

        enviromentContainer = dotenv.parse( strFileContent );

      }
      catch ( error ) {

        //

      }

    }

    if ( enviromentContainer?.SEQUENCE &&
         parseInt( enviromentContainer?.SEQUENCE ) >= 1 ) {

      if ( process.env.APP_PROJECT_NAME?.includes( "@__container_sequence__@" ) ) {

        process.env.APP_PROJECT_NAME = process.env.APP_PROJECT_NAME.replace( "@__container_sequence__@", enviromentContainer?.SEQUENCE );

      }

      if ( process.env.APP_SERVER_DATA_NAME?.includes( "@__container_sequence__@" ) ) {

        process.env.APP_SERVER_DATA_NAME = process.env.APP_SERVER_DATA_NAME.replace( "@__container_sequence__@", enviromentContainer?.SEQUENCE );

      }

      if ( process.env.APP_SERVER_TASK_NAME?.includes( "@__container_sequence__@" ) ) {

        process.env.APP_SERVER_TASK_NAME = process.env.APP_SERVER_TASK_NAME.replace( "@__container_sequence__@", enviromentContainer?.SEQUENCE );

      }

    }

    if ( enviromentContainer?.APP_SERVER_PORT &&
         parseInt( enviromentContainer?.APP_SERVER_PORT ) >= 1 ) {

      process.env.APP_SERVER_PORT = enviromentContainer?.APP_SERVER_PORT;

    }

  }

  static async main() {

    SystemUtilities.startRun = SystemUtilities.getCurrentDateAndTime(); //new Date();

    SystemUtilities.strBaseRunPath = __dirname;
    SystemUtilities.strBaseRootPath = appRoot.path;

    await App.proccessEnviromentContainer(); //Process the enviroment container info

    SystemUtilities.strAPPName = process.env.APP_SERVER_TASK_NAME;

    try {

      let debugMark = debug.extend( "FC96A92FD2FF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      debugMark( "%s", SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Main process started" );
      debugMark( "Running from: [%s]", SystemUtilities.strBaseRunPath );

      LoggerManager.mainLoggerInstance = await LoggerManager.createMainLogger(); //Create the main logger

      CacheManager.currentInstance = await CacheManager.create( LoggerManager.mainLoggerInstance );

      await DBConnectionManager.connect( "*", LoggerManager.mainLoggerInstance ); //Init the connection to db using the orm

      await DBConnectionManager.loadQueryStatement( "*", LoggerManager.mainLoggerInstance );

      process.on( "SIGTERM", async () => {

        //console.info("SIGTERM signal received.");
        debugMark( "SIGTERM signal received." );

        App.handlerCleanExit();

      });

      process.on( "SIGINT", () => {

        //console.info("SIGTERM signal received.");
        debugMark( "SIGINT signal received." );

        App.handlerCleanExit();

      });

      await ApplicationServerTaskManager.create( {},
                                                 LoggerManager.mainLoggerInstance );

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
                                                                         value: process.env.APP_SERVER_TASK_NAME + "-" + process.env.DEPLOY_TARGET,
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

      await ApplicationServerTaskManager.runTasks( {},
                                                   LoggerManager.mainLoggerInstance );

      //setInterval( ServerTask.handlerRunRask, 30000 ); //Every 30 seconds

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = App.name + "." + App.main.name;

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

App.main();
