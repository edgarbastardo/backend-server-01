require( 'dotenv' ).config(); //Read the .env file, in the root folder of project

//import { createServer } from 'http';
//import { Route } from './system/database/models/Route';
import cluster from 'cluster';
import os from 'os';

import CommonUtilities from "./02_system/common/CommonUtilities";

import LoggerManager from './02_system/common/managers/LoggerManager';

import ApplicationManager from './02_system/common/managers/ApplicationManager';
import DBMigrationManager from './02_system/common/managers/DBMigrationManager';
import DBConnectionManager from './02_system/common/managers/DBConnectionManager';
import CacheManager from './02_system/common/managers/CacheManager';

import SystemUtilities from "./02_system/common/SystemUtilities";
//import moment = require('moment-timezone');
//import Route from './02_system/common/database/models/Route';

//import uuidv4 from 'uuid/v4';
import SystemConstants from "./02_system/common/SystemContants";
import ModelServiceManager from "./02_system/common/managers/ModelServiceManager";
import appRoot from 'app-root-path';
import ClusterNetworkManager from "./02_system/common/managers/ClusterNetworkManager";
import CommonConstants from './02_system/common/CommonConstants';

const debug = require( 'debug' )( 'server' );


//import moment = require('moment-timezone');

/*
async function testData01( logger: any ) {

  try {

    const options = {

      where: { "RequestKind": 1, "Path" : "/test/test" },
      context: { TimeZoneId: "America/Los_Angeles" }

    }

    const route = await Route.findOne( options );

    if ( CommonUtilities.isNullOrEmpty( route ) ) {


      const route = await Route.create( {
                                          AccessKind: 2,
                                          RequestKind: 1,
                                          Path: "/test/test",
                                          CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
                                        } );

      if ( CommonUtilities.checkObjectWithFunctionDefined( logger, "info" ) ) {

        logger.info( 'Test route created', { logId: uuidv4(), Id: ( route as any ).dataValues.Id } );

      }

      //Route.create( route );


    }
    else {

      route.set( "UpdatedBy", SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET; );

      await Route.update( ( route as any ).dataValues, { where: { Id: route.Id } } );

      if ( CommonUtilities.checkObjectWithFunctionDefined( logger, "info" ) ) {

        logger.info( 'Test route updated', { logId: uuidv4(), Id: ( route as any ).dataValues.Id } );

      }

    }

  }
  catch ( error ) {

    const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

    sourcePosition.method = Server.name + "." + this.testData01.name;

    const strMark = "34B657B50D77";

    const debugMark = debug.extend( strMark );

    debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
    debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
    debugMark( "Catched on: %O", sourcePosition );

    error.mark = strMark;
    error.logId = SystemUtilities.getUUIDv4();

    if ( logger && typeof logger.error === "function" ) {

      ex.CatchedOn = sourcePosition;
      logger.error( error );

    }

    //next(e);

  }

}
*/

async function main() {

  SystemUtilities.startRun = SystemUtilities.getCurrentDateAndTime(); //new Date();

  SystemUtilities.baseRunPath = __dirname;
  SystemUtilities.baseRootPath = appRoot.path;

  let debugMark = debug.extend( "FF835436FAE7" );

  if ( cluster.isMaster ) {

    debugMark( "%s", SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
    debugMark( "Main process started" );
    debugMark( "Running from: [%s]", SystemUtilities.baseRunPath );

  }
  else {

    debugMark( "%s", SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
    debugMark( "Worker process started with id: [%d]", cluster.worker.id );

  }

  try {

    LoggerManager.mainLoggerInstance = await LoggerManager.createMainLogger(); //Create the main logger

    CacheManager.currentInstance = await CacheManager.create( LoggerManager.mainLoggerInstance );

    let resourceLocked = null;

    if ( cluster.isMaster ) { //Only the master process lock

      //Register in the net cluster manager
      ClusterNetworkManager.currentInstance = await ClusterNetworkManager.create( LoggerManager.mainLoggerInstance );

      if ( process.env.ENV === "prod" ||
           process.env.ENV === "test" ) {

        resourceLocked = await CacheManager.lockResource( undefined, //Deault = CacheManager.currentInstance,
                                                          SystemConstants._LOCK_RESOURCE_START,
                                                          1000 * 60 * 1, //For 1 Minute TTL of the redis lock
                                                          undefined, //Default 12 try
                                                          undefined, //Default 5000 milliseconds
                                                          LoggerManager.mainLoggerInstance );

        let debugMark = debug.extend( "A9B7C8761DA4" );

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

    await DBMigrationManager.createDatabaseIfNotExits( LoggerManager.mainLoggerInstance ); //Force create database if not exists

    await DBMigrationManager.migrateUsingRawConnection( LoggerManager.mainLoggerInstance ); //Migrate the database using only raw connection

    DBConnectionManager.currentInstance = await DBConnectionManager.create( LoggerManager.mainLoggerInstance ); //Init the connection to db using the orm

    DBConnectionManager.queryStatements = await DBConnectionManager.loadQueryStatement( LoggerManager.mainLoggerInstance );

    await DBMigrationManager.migrateUsingORMConnection( DBConnectionManager.currentInstance,
                                                        LoggerManager.mainLoggerInstance ); //Migrate the database using only orm connection

    await ModelServiceManager.loadModelServices( LoggerManager.mainLoggerInstance );

    //await testData01( LoggerManager.mainLoggerInstance );
    let strProccessWorkers = process.env.PROCESS_WORKERS;
    let intProccessWorkers = 0;

    if ( strProccessWorkers === "detect" ) {

      intProccessWorkers = os.cpus().length;

    }
    else if ( parseInt( strProccessWorkers ) !== NaN ) {

      intProccessWorkers = +strProccessWorkers;

    }

    if ( intProccessWorkers === 0 ||
         cluster.isMaster === false ) {

      ApplicationManager.currentInstance = await ApplicationManager.create( DBConnectionManager.currentInstance,
                                                                            LoggerManager.mainLoggerInstance );

    }

    if ( resourceLocked !== null ) {

      await CacheManager.unlockResource( resourceLocked,
                                         LoggerManager.mainLoggerInstance );

    }

    /*
    setTimeout( async () => {


    }, 1000 );
    */

    /*
    const { Parser } = require('node-sql-parser');
    const parser = new Parser();
    const ast = parser.astify( `SELECT * FROM t Where ( A = 'Hola' Or A = 'c' ) And B Is Not Null` ); // mysql sql grammer parsed by default

    */

    if ( intProccessWorkers > 0 &&
         cluster.isMaster ) {

      const logger = DBConnectionManager.currentInstance;

      let debugMark = debug.extend( "8DC0B75CB0A0" );

      debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( `Creating %d worker process`, intProccessWorkers );

      for ( let intWorker = 0; intWorker < intProccessWorkers; intWorker++ ) {

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( "Forking main process" );

        let intWorkerCount = 0;

        for ( const intId in cluster.workers ) {

          intWorkerCount += 1;

        }

        debugMark( "Online porcess worker count: %d", intWorkerCount );

        if ( intWorkerCount == 0 ) {

          //Only init the first worker
          await new Promise<boolean>( ( resolve, reject ) => {

            const worker = cluster.fork( process.env );

            worker.on( "message", ( msg: any ) => {

              if ( msg.command === "listen" ) {

                debugMark( "Process worker with id [%s] now listen. Continue the fork of another process workers", worker.id );
                resolve( true );

              }

            });

          } );

        }
        else {

          const worker = cluster.fork(); //Start the others workers

          worker.on( "message", ( msg: any ) => {

            if ( msg.command === "listen" ) {

              debugMark( "Process worker with id [%s] now listen", worker.id );
              //resolve( true );

            }

          });

        }

      }

      cluster.on( 'exit', ( worker, strCode, strSignal ) => {

        if ( worker && cluster.isMaster ) {

          if ( strSignal ) {

            debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            debugMark( `Worker process with id: %s killed by signal: %s. Starting another worker to replace!`, worker.id, strSignal );

            if ( logger && typeof logger.warning === "function" ) {

              logger.warning( `Worker process with id: %s killed by signal: %s. Starting another worker to replace!`, worker.id, strSignal );

            }

            cluster.fork();

          }
          else if ( strCode !== 0 ) {

            debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            debugMark( 'Worker process with id: %s has down, with code: %s. Starting another worker to replace!', worker.id, strCode );

            if ( logger && typeof logger.warning === "function" ) {

              logger.warning( 'Worker process with id: %s has down, with code: %s. Starting another worker to replace!', worker.id, strCode );

            }

            cluster.fork( process.env );

          }
          else {

            debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            debugMark( 'Worker process with id: %s success!', worker.id );

            if ( logger && typeof logger.warning === "function" ) {

              logger.info( 'Worker process with id: %s success!', worker.id );

            }

          }

        }

      });

      cluster.on( 'online', ( worker ) => {

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( 'Worker process with id: %d is online', worker.id );

      });

    }
    else {

      const intPort = process.env.PORT || 9090;

      ApplicationManager.currentInstance.listen(

        intPort,
        () => {

          let debugMark = debug.extend( "182DD8473CBE" );

          if ( cluster.isMaster ) {

            debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            debugMark( `Main process running on *:%d%s`, intPort, process.env.SERVER_ROOT_PATH );
            debugMark( `Main process running on *:%d%s`, intPort, ApplicationManager.currentInstance.apolloServer.graphqlPath );
            debugMark( `Main process is network leader: ${process.env.IS_NETWORK_LEADER == '1'? "Yes":"No"}` );

          }
          else {

            debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            debugMark( `Worker process with id: %d running on *:%d%s`, cluster.worker.id, intPort, process.env.SERVER_ROOT_PATH );
            debugMark( `Worker process with id: %d running on *:%d%s`, cluster.worker.id, intPort, ApplicationManager.currentInstance.apolloServer.graphqlPath );
            debugMark( `Worker main process is network leader: ${process.env.IS_NETWORK_LEADER == '1'? "Yes":"No"}` );

            process.send( { command: "listen" } );

          }

        }

      );

    }


    /*
    createServer( ApplicationManager.currentInstance ).listen(

      intPort,
      () => {

        console.info( `Server running on port ${intPort}` );

      }

    );
    */

  }
  catch ( error ) {

    const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

    sourcePosition.method = "server." + main.name;

    const strMark = "54117181D87F";

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

};

main();
