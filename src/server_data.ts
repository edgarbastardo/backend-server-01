require( 'dotenv' ).config(); //Read the .env file, in the root folder of project

import fs from 'fs'; //Load the filesystem module
import cluster from 'cluster';
//import os from 'os';

import appRoot from 'app-root-path';
//import moment = require('moment-timezone');
//import { createServer } from 'http';

import CommonConstants from './02_system/common/CommonConstants';
import SystemConstants from "./02_system/common/SystemContants";

import CommonUtilities from "./02_system/common/CommonUtilities";
import SystemUtilities from "./02_system/common/SystemUtilities";

import LoggerManager from "./02_system/common/managers/LoggerManager";
import ApplicationServerDataManager from './02_system/common/managers/ApplicationServerDataManager';
import DBMigrationManager from './02_system/common/managers/DBMigrationManager';
import DBConnectionManager from "./02_system/common/managers/DBConnectionManager";
import CacheManager from './02_system/common/managers/CacheManager';
import ModelServiceManager from "./02_system/common/managers/ModelServiceManager";
import NetworkLeaderManager from "./02_system/common/managers/NetworkLeaderManager";
import JobQueueManager from "./02_system/common/managers/JobQueueManager";
import I18NManager from "./02_system/common/managers/I18Manager";
import NotificationManager from './02_system/common/managers/NotificationManager';
//import InstantMenssageManager from './02_system/common/managers/InstantMessageManager';
//import NotificationManager from './02_system/common/managers/NotificationManager';
//import RedisConnectionManager from "./02_system/common/managers/RedisConnectionManager";

import SYSSystemEventLogService from './02_system/common/database/master/services/SYSSystemEventLogService';
//import PresenceManager from './02_system/common/managers/PresenceManager';

//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

let debug = null; //require( 'debug' )( 'server' );

if ( process.env.WORKER_KIND === "http_worker_process" ) {

  debug = require( 'debug' )( 'server_data@http_worker' );

}
else if ( process.env.WORKER_KIND === "job_worker_process" ) {

  debug = require( 'debug' )( 'server_data@job_worker' );

}
else {

  debug = require( 'debug' )( 'server_data@main_process' );

}

export default class ServerMain {

  static intCountHTTPWorkerKilled = 0;
  static intCountProcessWorkerKilled = 0;

  static async httpWorkerProcessExit( httpWorker: any,
                                      strCode: any,
                                      strSignal: any,
                                      logger: any ) {

    if ( httpWorker &&
         cluster.isMaster ) {

      let debugMark = debug.extend( "F79A4FFC66ED" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );
      debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );

      ServerMain.intCountHTTPWorkerKilled += 1;

      if ( ServerMain.intCountHTTPWorkerKilled >= parseInt( process.env.MAX_KILLED_HTTP_WORKER_COUNT ) ) {

        debugMark( `Max HTTP worker process killed count: %s`, process.env.MAX_KILLED_HTTP_WORKER_COUNT );
        debugMark( `HTTP worker process killed count: %s`, ServerMain.intCountHTTPWorkerKilled );

        debugMark( `To much HTTP worker process killed. Aborting main process execution.` );

        await NotificationManager.publishToExternal(
                                                     {
                                                       body: {
                                                               kind: "error",
                                                               text: "To much HTTP worker process killed. Aborting main process execution.",
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
                                                                 footer: "56C402B90E51",
                                                                 // `Date: ${SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 )}\nHost: ${SystemUtilities.getHostName()}\nApplication: ${process.env.APP_SERVER_DATA_NAME}\nRunning from: ${SystemUtilities.strBaseRunPath}`
                                                             }
                                                     },
                                                     LoggerManager.mainLoggerInstance
                                                   );

        process.abort();

      }
      else {

        debugMark( `Max HTTP worker process killed count: %s`, process.env.MAX_KILLED_HTTP_WORKER_COUNT );
        debugMark( `HTTP worker process killed count: %s`, ServerMain.intCountHTTPWorkerKilled );

      }

      if ( strSignal ) {

        debugMark( `HTTP worker process with id: %s killed by signal: %s. Starting another worker to replace!`, httpWorker.id, strSignal );

        if ( logger && typeof logger.warning === "function" ) {

          logger.warning( `HTTP worker process with id: %s killed by signal: %s. Starting another worker to replace!`, httpWorker.id, strSignal );

        }

        httpWorker = cluster.fork(
                                   {
                                     WORKER_KIND: "http_worker_process",
                                     ...process.env
                                   }
                                 ); //Start the http worker (Again)

        httpWorker.on( "message", async ( message: any ) => {

          if ( message.command === "start_done" ) {

            //

          }

        });

        httpWorker.on( 'exit', async ( strCode: any, strSignal: any ) => {

          await ServerMain.httpWorkerProcessExit( httpWorker,
                                                  strCode,
                                                  strSignal,
                                                  logger );

        });

        httpWorker.on( 'online', async () => {

          debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( 'HTTP worker process with id: %d is online', httpWorker.id );

        });

      }
      else if ( strCode !== 0 ) {

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( 'HTTP worker process with id: %s has down, with code: %s. Starting another worker to replace!', httpWorker.id, strCode );

        if ( logger &&
             typeof logger.warning === "function" ) {

          logger.warning( 'HTTP worker process with id: %s has down, with code: %s. Starting another worker to replace!', httpWorker.id, strCode );

        }

        httpWorker = cluster.fork(
                                   {
                                     WORKER_KIND: "http_worker_process",
                                     ...process.env
                                   }
                                 ); //Start the http worker (Again)

        httpWorker.on( "message", async ( message: any ) => {

          if ( message.command === "start_done" ) {

            //

          }

        });

        httpWorker.on( 'exit', async ( strCode: any, strSignal: any ) => {

          await ServerMain.httpWorkerProcessExit( httpWorker,
                                                  strCode,
                                                  strSignal,
                                                  logger );

        });

        httpWorker.on( 'online', async () => {

          debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( 'HTTP worker process with id: %d is online', httpWorker.id );

        });

      }
      else {

        //debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( 'HTTP worker process with id: %s success!', httpWorker.id );

        if ( logger && typeof logger.warning === "function" ) {

          logger.info( 'HTTP worker process with id: %s success!', httpWorker.id );

        }

      }

    }

  }

  static async jobWorkerProcessExit( jobWorker: any,
                                     strCode: any,
                                     strSignal: any,
                                     logger: any ) {

    if ( jobWorker &&
         cluster.isMaster ) {

      let debugMark = debug.extend( "7CF8309CAA49" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );
      debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );

      ServerMain.intCountProcessWorkerKilled += 1;

      if ( ServerMain.intCountProcessWorkerKilled >= parseInt( process.env.MAX_KILLED_JOB_WORKER_COUNT ) ) {

        debugMark( `Max JOB worker process killed count: %s`, process.env.MAX_KILLED_JOB_WORKER_COUNT );
        debugMark( `JOB worker process killed count: %s`, ServerMain.intCountProcessWorkerKilled );

        debugMark( `To much JOB worker process killed. Aborting main process execution.` );

        await NotificationManager.publishToExternal(
                                                     {
                                                       body: {
                                                               kind: "error",
                                                               text: "To much JOB worker process killed. Aborting main process execution.",
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
                                                                 footer: "4B6CC1C6B04B",
                                                             }
                                                     },
                                                     LoggerManager.mainLoggerInstance
                                                   );

        process.abort();

      }
      else {

        debugMark( `Max JOB worker process killed count: $s`, process.env.MAX_KILLED_JOB_WORKER_COUNT );
        debugMark( `JOB worker process killed count: $s`, ServerMain.intCountProcessWorkerKilled );

      }

      if ( strSignal ) {

        //debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( `JOB worker process with id: %s killed by signal: %s. Starting another worker to replace!`, jobWorker.id, strSignal );

        if ( logger && typeof logger.warning === "function" ) {

          logger.warning( `JOB worker process with id: %s killed by signal: %s. Starting another worker to replace!`, jobWorker.id, strSignal );

        }

        jobWorker = cluster.fork(
                                  {
                                    WORKER_KIND: "job_worker_process",
                                    ...process.env
                                  }
                                ); //Start the job worker (Again)

        jobWorker.on( "message", async ( message: any ) => {

          if ( message.command === "start_done" ) {

            //

          }

        });

        jobWorker.on( 'exit', async ( strCode: any, strSignal: any ) => {

          await ServerMain.jobWorkerProcessExit( jobWorker,
                                                 strCode,
                                                 strSignal,
                                                 logger );

        });

        jobWorker.on( 'online', async () => {

          debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( 'JOB worker process with id: %d is online', jobWorker.id );

        });

      }
      else if ( strCode !== 0 ) {

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( 'JOB worker process with id: %s has down, with code: %s. Starting another worker to replace!', jobWorker.id, strCode );

        if ( logger &&
             typeof logger.warning === "function" ) {

          logger.warning( 'JOB worker process with id: %s has down, with code: %s. Starting another worker to replace!', jobWorker.id, strCode );

        }

        jobWorker = cluster.fork(
                                  {
                                    WORKER_KIND: "job_worker_process",
                                    ...process.env
                                  }
                                ); //Start the job worker (Again)

        jobWorker.on( "message", async ( message: any ) => {

          if ( message.command === "start_done" ) {

            //

          }

        });

        jobWorker.on( 'exit', async ( strCode: any, strSignal: any ) => {

          await ServerMain.jobWorkerProcessExit( jobWorker,
                                                 strCode,
                                                 strSignal,
                                                 logger );

        });

        jobWorker.on( 'online', async () => {

          debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( 'JOB worker process with id: %d is online', jobWorker.id );

        });

      }
      else {

        //debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( 'Worker process with id: %s success!', jobWorker.id );

        if ( logger && typeof logger.warning === "function" ) {

          logger.info( 'Worker process with id: %s success!', jobWorker.id );

        }

      }

    }

  }

  static async startServerListen( debugMark: any,
                                  logger: any ) {

    const intPort = process.env.APP_SERVER_DATA_PORT || 9090;

    ApplicationServerDataManager.currentInstance.listen(

      intPort,
      async () => {

        let debugMark = debug.extend( "182DD8473CBE" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( `Main process running on *:%d%s`, intPort, process.env.SERVER_ROOT_PATH );
        debugMark( `Main process running on *:%d%s`, intPort, ApplicationServerDataManager.currentInstance.apolloServer.graphqlPath );
        debugMark( `Main process is network leader: ${process.env.IS_NETWORK_LEADER === '1'? "Yes":"No"}` );
        debugMark( `Main process is starting the JobQueueManager` );

        await JobQueueManager.create( null,
                                      LoggerManager.mainLoggerInstance );

        if ( process.env.WORKER_KIND === "http_worker_process" ) {

          process.on( "message", ( message: any ) => {

            if ( message.command === "network_leader_info" ) {

              SystemUtilities.strNetworkId = message.networkLeader.Id;
              SystemUtilities.bIsNetworkLeader = message.networkLeader.IsLeader;
              SystemUtilities.NetworkLeaderFrom = message.networkLeader.From ? SystemUtilities.getCurrentDateAndTimeFrom( message.networkLeader.From ): null;

            }

          } );

          process.send(
                        {
                          command: "start_done"
                        }
                      ); //VERY IMPORTANT send this custom message to parent process. To allow to continue to parent process

        }

      }

    );

  }

  static async handlerListenOnTopic( strTopic: string,
                                     strMessage: string ): Promise<void> {

    const strMark = "DE270DD9C1FA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

    const debugMark = debug.extend( strMark );

    try {

      if ( strTopic &&
           strMessage ) {

        const jsonMessage = CommonUtilities.parseJSON( strMessage,
                                                       LoggerManager.mainLoggerInstance );

        if ( strTopic === "SystemEvent" ) {

          jsonMessage.CreatedBy = jsonMessage.UserName;

          const sysSystemEventLogService = await SYSSystemEventLogService.create( jsonMessage,
                                                                                  null,
                                                                                  LoggerManager.mainLoggerInstance );


          if ( !sysSystemEventLogService ) {

            debugMark( "Fail to save the instant message log. sysSystemEventLogService is null" );

          }
          else if ( sysSystemEventLogService instanceof Error ) {

            debugMark( "Fail to save the instant message log. With the next error %O", sysSystemEventLogService );

          }
          /*
          else {

            debugMark( "Success save the instant message log with Id %s", ( sysSystemEventLogService as any ).Id );

          }
          */

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = ServerMain.name + "." + ServerMain.handlerListenOnTopic.name;

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

  static async checkHealthDBConnections() {

    //Check the health of database connections
    let intCheckHealthDBConnectionsInterval = parseInt( process.env.CHECK_HEALTH_DB_CONNECTIONS_INTERVAL );

    if ( intCheckHealthDBConnectionsInterval > 0 ) {

      let debugMark = debug.extend( "D9998B45D1CF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      debugMark( `Checking health of database connections every %s seconds`, intCheckHealthDBConnectionsInterval / 1000 );

      setInterval( async () => {

        //debugMark( `Checking health of database connections` );

        if ( await DBConnectionManager.checkHealthOfConnections( "*", LoggerManager.mainLoggerInstance ) === false ) {

          debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( `Check of health of database connections failed. Aborting main process execution.` );

          await NotificationManager.publishToExternal(
                                                       {
                                                         body: {
                                                                 kind: "error",
                                                                 text: "Check of health of database connections failed. Aborting main process execution.",
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
                                                                 footer: "FA93D7C63EA9",
                                                               }
                                                       },
                                                       LoggerManager.mainLoggerInstance
                                                     );

          process.abort();

        }
        /*
        else {

          debugMark( `Checking health of database connections success.` );

        }
        */

      }, intCheckHealthDBConnectionsInterval );

    }

  }

  static async main() {

    SystemUtilities.startRun = SystemUtilities.getCurrentDateAndTime(); //new Date();

    SystemUtilities.strBaseRunPath = __dirname;
    SystemUtilities.strBaseRootPath = appRoot.path;
    SystemUtilities.strAPPName = process.env.APP_SERVER_DATA_NAME;

    if ( fs.existsSync( appRoot.path + "/info.json" ) ) {

      SystemUtilities.info = require( appRoot.path + "/info.json" );

    }
    else {

      SystemUtilities.info.release = `No info.json file found in the folder ${appRoot.path}`;

    }

    let debugMark = null;

    if ( cluster.isMaster ) {

      debugMark = debug.extend( "FF835436FAE7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      debugMark( "%s", SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Main process started" );
      debugMark( "Running from: [%s]", SystemUtilities.strBaseRunPath );

    }
    else if ( process.env.WORKER_KIND === "http_worker_process" ) {

      debugMark = debug.extend( "00E0873DACD7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      debugMark( "%s", SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "HTTP worker process started with id: %d", cluster.worker.id );

    }
    else if ( process.env.WORKER_KIND === "job_worker_process" ) {

      debugMark = debug.extend( "FD9CA65E15F1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      debugMark( "%s", SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "JOB worker process started with id: %d", cluster.worker.id );

    }

    try {

      LoggerManager.mainLoggerInstance = await LoggerManager.createMainLogger(); //Create the main logger

      CacheManager.currentInstance = await CacheManager.create( LoggerManager.mainLoggerInstance );

      let resourceLocked = null;

      if ( cluster.isMaster ) { //Only the master process lock

        //Register in the net cluster manager
        NetworkLeaderManager.currentInstance = await NetworkLeaderManager.create(
                                                                                  {
                                                                                    Discover: {
                                                                                                port: parseInt( process.env.APP_SERVER_DATA_INSTANCES_DISCOVER_PORT )
                                                                                              },
                                                                                    OnPromotion: null,
                                                                                    OnDemotion: null,
                                                                                    OnNewNetworkLeader: null,
                                                                                    OnAdded: null,
                                                                                    OnRemoved: null
                                                                                  },
                                                                                  LoggerManager.mainLoggerInstance
                                                                                );

        if ( process.env.ENV === "prod" ||
             process.env.ENV === "test" ) {

          resourceLocked = await CacheManager.lockResource( undefined, //Deault = CacheManager.currentInstance,
                                                            SystemConstants._LOCK_RESOURCE_START,
                                                            1000 * 60 * 1, //For 1 Minute TTL of the redis lock
                                                            undefined, //Default 12 try
                                                            undefined, //Default 5000 milliseconds
                                                            LoggerManager.mainLoggerInstance );

          let debugMark = debug.extend( "A9B7C8761DA4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

          if ( resourceLocked ) {

            debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            debugMark( "Success to lock the resource [%s]", SystemConstants._LOCK_RESOURCE_START );

          }
          else {

            debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            debugMark( "Failed to lock the resource [%s]", SystemConstants._LOCK_RESOURCE_START );

          }

        }

      }

      /*
      const handlerFunction = ( strTopic: string, message: any ) => {

        debugMark( `Received message "%s", in topic "%s"`, message, strTopic );

      };

      await NotificationManager.listen(
                                        "redis",
                                        {
                                          Connection: "listenConnection",
                                          Topic: "TestTopic01",
                                          Handler: handlerFunction
                                        },
                                        LoggerManager.mainLoggerInstance
                                      );

      await NotificationManager.listen(
                                        "redis",
                                        {
                                          Connection: "listenConnection",
                                          Topic: "TestTopic02",
                                          Handler: handlerFunction
                                        },
                                        LoggerManager.mainLoggerInstance
                                      );
                                      */

      /*
      const redisConnection1 = await RedisConnectionManager.connect( "listenConnection", LoggerManager.mainLoggerInstance );

      await redisConnection1.on( "message", handlerFunction );

      await redisConnection1.subscribe( "TestTopic01" );
      */

      /*
      const redisConnection2 = await RedisConnectionManager.connect( "default", LoggerManager.mainLoggerInstance );

      redisConnection2.publish( "TestTopic01", "Hello" );
      */

      const intHTTPWorkerProcessCount = SystemUtilities.getHTTPWorkerProcessCount();
      const intJOBWorkerProcessCount = SystemUtilities.getJOBWorkerProcessCount();

      if ( process.env.DB_AUTO_MIGRATION === "1" ) {

        await DBMigrationManager.createDatabaseIfNotExits( "*", LoggerManager.mainLoggerInstance ); //Force create database if not found

        await DBMigrationManager.migrateUsingRawConnection( "*", LoggerManager.mainLoggerInstance ); //Migrate the database using only raw connection

      }

      //DBConnectionManager.dbConnection =
      await DBConnectionManager.connect( "*", LoggerManager.mainLoggerInstance ); //Init the connection to db using the orm

      //DBConnectionManager.queryStatements =
      await DBConnectionManager.loadQueryStatement( "*", LoggerManager.mainLoggerInstance );

      if ( process.env.DB_AUTO_MIGRATION === "1" ) {

        await DBMigrationManager.migrateUsingORMConnection( "*",
                                                            //DBConnectionManager.getDBConnection( "master" ),
                                                            LoggerManager.mainLoggerInstance ); //Migrate the database using only orm connection

      }

      await ModelServiceManager.loadModelServices( "*", LoggerManager.mainLoggerInstance );

      if ( intHTTPWorkerProcessCount === 0 ||
           process.env.WORKER_KIND === "http_worker_process" ) {

        ApplicationServerDataManager.currentInstance = await ApplicationServerDataManager.create( DBConnectionManager.getDBConnection( "master" ),
                                                                                                  LoggerManager.mainLoggerInstance );

      }

      /*
      const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

      //And DATE( b.created_at ) = '2020-06-22'
      // const strSQL = "Update deliveries as a inner join orders as b on a.order_id=b.id Set a.tip = 10.10 Where b.establishment_id = '02a4ad90-e251-4ada-98a7-e84d6c9d49c8' And b.ticket = '#05054' And DATE( b.created_at ) = '2020-06-22'";  And DATE( b.created_at ) = ?
      const strSQL = "Select a.tip, b.ticket, b.created_at From deliveries as a inner join orders as b on a.order_id=b.id Where b.establishment_id = '02a4ad90-e251-4ada-98a7-e84d6c9d49c8' And b.ticket = '#05054' And DATE( b.created_at ) = '2020-06-22'";
      //const strSQL = "Select NOW()";

      const rows = await dbConnection.query( strSQL, {
                                                      raw: true,
                                                      type: QueryTypes.SELECT,
                                                      transaction: null,
                                                      //replacements: [ new Date( 2020, 6, 22 ) ]
                                                    } );

      debugMark( rows );
      */

      if ( resourceLocked !== null ) {

        await CacheManager.unlockResource( resourceLocked,
                                           LoggerManager.mainLoggerInstance );

      }

      await I18NManager.create( {},
                                LoggerManager.createMainLogger );

      //await InstantMenssageManager.loadRules( LoggerManager.mainLoggerInstance );

      //await PresenceManager.loadFilters( LoggerManager.mainLoggerInstance );

      if ( cluster.isMaster ) {

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
                                                                           value: process.env.APP_SERVER_DATA_NAME,
                                                                           short: false
                                                                         },
                                                                         {
                                                                           title: "Running from",
                                                                           value: SystemUtilities.strBaseRunPath,
                                                                           short: false
                                                                         }
                                                                       ],
                                                               footer: "CCDAB718266A",
                                                             }
                                                     },
                                                     LoggerManager.mainLoggerInstance
                                                   );

        if ( !cluster.settings.execArgv ) {

          cluster.settings.execArgv = [];

        }

        let intDebugPort = 9229; //Default debug port for nodejs

        if ( intHTTPWorkerProcessCount > 0 ) { //Launch the http worker process

          let debugMark = debug.extend( "8DC0B75CB0A0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

          debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( `Creating %d HTTP worker process`, intHTTPWorkerProcessCount );

          let intWorkerCount = 0;

          for ( let intWorker = 0; intWorker < intHTTPWorkerProcessCount; intWorker++ ) {

            //debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );

            //let httpWorker = null;

            //if ( intWorkerCount === 0 ) {

            //init the HTTP worker
            await new Promise<boolean>( ( resolve, reject ) => {

              debugMark( "Forking main process" );

              if ( process.env.ENV === "dev" ) {

                intDebugPort = intDebugPort + 1;

                debugMark( "Child process debug port: %d", intDebugPort );

                cluster.settings.execArgv.push( "--inspect-brk=" + intDebugPort );

              }

              const httpWorker = cluster.fork( { WORKER_KIND: "http_worker_process", WORKER_INDEX: intWorker, ...process.env } ); //Start the first http worker

              if ( process.env.ENV === "dev" ) {

                cluster.settings.execArgv.pop();

              }

              httpWorker.on( "message", async ( msg: any ) => {

                if ( msg.command === "start_done" ) { //VERY IMPORTANT listen for this custom message. To resolve the promise

                  debugMark( "HTTP worker process with id %d now started and listen.", httpWorker.id );
                  intWorkerCount += 1;

                  /*
                  SystemUtilities.broadcastMessageToWorkers(
                                                            {
                                                              command: "network_leader_info",
                                                              networkLeader: {
                                                                                Id: SystemUtilities.strNetworkId,
                                                                                IsLeader: SystemUtilities.bIsNetworkLeader,
                                                                                From: SystemUtilities.NetworkLeaderFrom ? SystemUtilities.NetworkLeaderFrom.format(): null
                                                                              }
                                                            }
                                                          );
                  */

                  httpWorker.send(
                                   {
                                     command: "network_leader_info",
                                     networkLeader: {
                                                      Id: SystemUtilities.strNetworkId,
                                                      IsLeader: SystemUtilities.bIsNetworkLeader,
                                                      From: SystemUtilities.NetworkLeaderFrom ? SystemUtilities.NetworkLeaderFrom.format(): null
                                                    }
                                   }
                                 );

                  resolve( true );

                }

              });

              httpWorker.on( 'exit', async ( strCode: any, strSignal: any ) => {

                await ServerMain.httpWorkerProcessExit( httpWorker,
                                                        strCode,
                                                        strSignal,
                                                        LoggerManager.mainLoggerInstance );

              });

              httpWorker.on( 'online', async () => {

                debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
                debugMark( 'HTTP worker process with id: %d is online', httpWorker.id );

              });

            });

            //intWorkerCount = SystemUtilities.countWorkers( cluster.workers );

              /*
            }
            else {

              httpWorker = cluster.fork( { WORKER_KIND: "http_worker_process", ...process.env } ); //Start the http worker

              httpWorker.on( "message", async ( msg: any ) => {

                if ( msg.command === "listen" ) {

                  debugMark( "HTTP worker process with id [%d] now listen", httpWorker.id );

                }

              });

            }
            */

          }

          debugMark( "Started and listen HTTP worker process count: %d", intWorkerCount );

        }

        if ( intJOBWorkerProcessCount > 0 ) { //Launch the job worker process

          let debugMark = debug.extend( "967512E9AC03" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

          debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( `Creating %d JOB worker process`, intJOBWorkerProcessCount );

          let intWorkerCount = 0;

          for ( let intWorker = 0; intWorker < intJOBWorkerProcessCount; intWorker++ ) {

            //debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );

            //init the HTTP worker
            await new Promise<boolean>( ( resolve, reject ) => {

              debugMark( "Forking main process" );

              if ( process.env.ENV === "dev" ) {

                intDebugPort = intDebugPort + 1;

                debugMark( "Child process debug port: %d", intDebugPort );

                cluster.settings.execArgv.push( "--inspect-brk" ); // + intDebugPort );

              }

              const jobWorker = cluster.fork( { WORKER_KIND: "job_worker_process", WORKER_INDEX: intWorker, ...process.env } ); //Start the job worker

              if ( process.env.ENV === "dev" ) {

                cluster.settings.execArgv.pop();

              }

              jobWorker.on( "message", async ( message: any ) => {

                if ( message.command === "start_done" ) { //VERY IMPORTANT listen for this custom message. To resolve the promise

                  debugMark( "JOB worker process with id [%d] now started.", jobWorker.id );
                  intWorkerCount += 1;
                  resolve( true );

                }

              });

              jobWorker.on( 'exit', async ( strCode: any, strSignal: any ) => {

                await ServerMain.jobWorkerProcessExit( jobWorker,
                                                       strCode,
                                                       strSignal,
                                                       LoggerManager.mainLoggerInstance );

              });

              jobWorker.on( 'online', async () => {

                debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
                debugMark( 'JOB worker process with id: %d is online', jobWorker.id );

              });

            });

          }

          debugMark( "Started JOB worker process count: %d", intWorkerCount );

        }

        if ( intHTTPWorkerProcessCount === 0 ) { //Launch the main to handle the http request

          await ServerMain.startServerListen( debugMark,
                                              LoggerManager.mainLoggerInstance );

          /*
          const intPort = process.env.APP_SERVER_DATA_PORT || 9090;

          ApplicationServerDataManager.currentInstance.listen(

            intPort,
            async () => {

              let debugMark = debug.extend( "182DD8473CBE" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

              debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
              debugMark( `Main process running on *:%d%s`, intPort, process.env.SERVER_ROOT_PATH );
              debugMark( `Main process running on *:%d%s`, intPort, ApplicationServerDataManager.currentInstance.apolloServer.graphqlPath );
              debugMark( `Main process is network leader: ${process.env.IS_NETWORK_LEADER === '1'? "Yes":"No"}` );
              debugMark( `Main process is starting the JobQueueManager` );

              await JobQueueManager.create( null,
                                            LoggerManager.mainLoggerInstance );

            }

          );
          */

        }

        //Listen on
        await NotificationManager.listenOnTopic( "connectionListenOnTopicSystemEvent",
                                                 "SystemEvent",
                                                 ServerMain.handlerListenOnTopic,
                                                 LoggerManager.mainLoggerInstance );

        ServerMain.checkHealthDBConnections();

      }
      else if ( process.env.WORKER_KIND === "http_worker_process" ) {

        await ServerMain.startServerListen( debugMark,
                                            LoggerManager.mainLoggerInstance );

        /*
        const intPort = process.env.APP_SERVER_DATA_PORT || 9090;

        ApplicationServerDataManager.currentInstance.listen(

          intPort,
          async () => {

            let debugMark = debug.extend( "56C70776F9AC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

            debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            debugMark( `HTTP worker main process is network leader: ${process.env.IS_NETWORK_LEADER === '1'? "Yes":"No"}` );
            debugMark( `HTTP worker process with id: %d running on *:%d%s`, cluster.worker.id, intPort, process.env.SERVER_ROOT_PATH );
            debugMark( `HTTP worker process with id: %d running on *:%d%s`, cluster.worker.id, intPort, ApplicationServerDataManager.currentInstance.apolloServer.graphqlPath );
            debugMark( `HTTP worker process with id: %d is starting the JobQueueManager`, cluster.worker.id );

            await JobQueueManager.create( null,
                                          ApplicationServerDataManager.currentInstance );

            process.on( "message", ( message: any ) => {

              if ( message.command === "network_leader_info" ) {

                SystemUtilities.strNetworkId = message.networkLeader.Id;
                SystemUtilities.bIsNetworkLeader = message.networkLeader.IsLeader;
                SystemUtilities.NetworkLeaderFrom = message.networkLeader.From ? SystemUtilities.getCurrentDateAndTimeFrom( message.networkLeader.From ): null;

              }

            } );

            process.send(
                          {
                            command: "start_done"
                          }
                        ); //VERY IMPORTANT send this custom message to parent process. To allow to continue to parent process

          }

        );
        */

      }
      else if ( process.env.WORKER_KIND === "job_worker_process" ) {

        let debugMark = debug.extend( "12D457F51385" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( `JOB worker main process is network leader: ${process.env.IS_NETWORK_LEADER === '1'? "Yes":"No"}` );
        debugMark( `JOB worker process with id: %d is starting the JobQueueManager`, cluster.worker.id );

        process.send(
                      {
                        command: "start_done"
                      }
                    );  //VERY IMPORTANT send this custom message to parent process. To allow to continue to parent process

        await JobQueueManager.create( null,
                                      ApplicationServerDataManager.currentInstance );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = ServerMain.name + "." + ServerMain.main.name;

      const strMark = "54117181D87F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance && typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

    }

  }

}

ServerMain.main();
