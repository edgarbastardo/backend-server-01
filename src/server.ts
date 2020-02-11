require( 'dotenv' ).config(); //Read the .env file, in the root folder of project

import cluster from 'cluster';
//import os from 'os';

import appRoot from 'app-root-path';
//import moment = require('moment-timezone');
//import { createServer } from 'http';
//import { Route } from './system/database/models/Route';

import CommonConstants from './02_system/common/CommonConstants';
import SystemConstants from "./02_system/common/SystemContants";

import CommonUtilities from "./02_system/common/CommonUtilities";
import SystemUtilities from "./02_system/common/SystemUtilities";

import LoggerManager from "./02_system/common/managers/LoggerManager";
import ApplicationManager from './02_system/common/managers/ApplicationManager';
import DBMigrationManager from './02_system/common/managers/DBMigrationManager';
import DBConnectionManager from './02_system/common/managers/DBConnectionManager';
import CacheManager from './02_system/common/managers/CacheManager';
import ModelServiceManager from "./02_system/common/managers/ModelServiceManager";
import ClusterNetworkManager from "./02_system/common/managers/ClusterNetworkManager";
import JobQueueManager from "./02_system/common/managers/JobQueueManager";
import I18NManager from "./02_system/common/managers/I18Manager";
//import NotificationManager from "./02_system/common/managers/NotificationManager";

let debug = null; //require( 'debug' )( 'server' );

if ( process.env.WORKER_KIND === "http_worker_process" ) {

  debug = require( 'debug' )( 'server@http_worker' );

}
else if ( process.env.WORKER_KIND === "job_worker_process" ) {

  debug = require( 'debug' )( 'server@job_worker' );

}
else {

  debug = require( 'debug' )( 'server@main_process' );

}

function httpWorkerProcessExit( httpWorkerProcess: any,
                                strCode: any,
                                strSignal: any,
                                logger: any ) {

  if ( httpWorkerProcess &&
       cluster.isMaster ) {

    let debugMark = debug.extend( "1BF1A2E6B008" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

    if ( strSignal ) {

      debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( `HTTP worker process with id: %s killed by signal: %s. Starting another worker to replace!`, httpWorkerProcess.id, strSignal );

      if ( logger && typeof logger.warning === "function" ) {

        logger.warning( `HTTP worker process with id: %s killed by signal: %s. Starting another worker to replace!`, httpWorkerProcess.id, strSignal );

      }

      httpWorkerProcess = cluster.fork( { WORKER_KIND: "http_worker_process", ...process.env } ); //Start the http worker (Again)

      httpWorkerProcess.on( 'exit', ( strCode: any, strSignal: any ) => {

        httpWorkerProcessExit( httpWorkerProcess, strCode, strSignal, logger );

      });

      httpWorkerProcess.on( 'online', async () => {

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( 'HTTP worker process with id: %d is online', httpWorkerProcess.id );

      });

    }
    else if ( strCode !== 0 ) {

      debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( 'HTTP worker process with id: %s has down, with code: %s. Starting another worker to replace!', httpWorkerProcess.id, strCode );

      if ( logger &&
           typeof logger.warning === "function" ) {

        logger.warning( 'HTTP worker process with id: %s has down, with code: %s. Starting another worker to replace!', httpWorkerProcess.id, strCode );

      }

      httpWorkerProcess = cluster.fork( { WORKER_KIND: "http_worker_process", ...process.env } ); //Start the http worker (Again)

      httpWorkerProcess.on( 'exit', ( strCode: any, strSignal: any ) => {

        httpWorkerProcessExit( httpWorkerProcess, strCode, strSignal, logger );

      });

      httpWorkerProcess.on( 'online', async () => {

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( 'HTTP worker process with id: %d is online', httpWorkerProcess.id );

      });

    }
    else {

      debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( 'HTTP worker process with id: %s success!', httpWorkerProcess.id );

      if ( logger && typeof logger.warning === "function" ) {

        logger.info( 'HTTP worker process with id: %s success!', httpWorkerProcess.id );

      }

    }

  }

}

function jobProcessWorkerExit( jobProcessWorker: any,
                               strCode: any,
                               strSignal: any,
                               logger: any ) {

  if ( jobProcessWorker &&
       cluster.isMaster ) {

    let debugMark = debug.extend( "7CF8309CAA49" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

    if ( strSignal ) {

      debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( `JOB worker process with id: %s killed by signal: %s. Starting another worker to replace!`, jobProcessWorker.id, strSignal );

      if ( logger && typeof logger.warning === "function" ) {

        logger.warning( `JOB worker process with id: %s killed by signal: %s. Starting another worker to replace!`, jobProcessWorker.id, strSignal );

      }

      jobProcessWorker = cluster.fork( { WORKER_KIND: "job_worker_process", ...process.env } ); //Start the http worker (Again)

      jobProcessWorker.on( 'exit', ( strCode: any, strSignal: any ) => {

        jobProcessWorkerExit( jobProcessWorker, strCode, strSignal, logger );

      });

      jobProcessWorker.on( 'online', async () => {

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( 'JOB worker process with id: %d is online', jobProcessWorker.id );

      });

    }
    else if ( strCode !== 0 ) {

      debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( 'JOB worker process with id: %s has down, with code: %s. Starting another worker to replace!', jobProcessWorker.id, strCode );

      if ( logger &&
           typeof logger.warning === "function" ) {

        logger.warning( 'JOB worker process with id: %s has down, with code: %s. Starting another worker to replace!', jobProcessWorker.id, strCode );

      }

      jobProcessWorker = cluster.fork( { WORKER_KIND: "job_worker_process", ...process.env } ); //Start the http worker (Again)

      jobProcessWorker.on( 'exit', ( strCode: any, strSignal: any ) => {

        httpWorkerProcessExit( jobProcessWorker, strCode, strSignal, logger );

      });

      jobProcessWorker.on( 'online', async () => {

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( 'JOB worker process with id: %d is online', jobProcessWorker.id );

      });

    }
    else {

      debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( 'Worker process with id: %s success!', jobProcessWorker.id );

      if ( logger && typeof logger.warning === "function" ) {

        logger.info( 'Worker process with id: %s success!', jobProcessWorker.id );

      }

    }

  }

}

async function main() {

  SystemUtilities.startRun = SystemUtilities.getCurrentDateAndTime(); //new Date();

  SystemUtilities.baseRunPath = __dirname;
  SystemUtilities.baseRootPath = appRoot.path;

  let debugMark = null;

  if ( cluster.isMaster ) {

    debugMark = debug.extend( "FF835436FAE7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

    debugMark( "%s", SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
    debugMark( "Main process started" );
    debugMark( "Running from: [%s]", SystemUtilities.baseRunPath );

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
      ClusterNetworkManager.currentInstance = await ClusterNetworkManager.create( LoggerManager.mainLoggerInstance );

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

    const intHTTPWorkerProcessCount = SystemUtilities.getHTTPWorkerProcessCount();
    const intJOBWorkerProcessCount = SystemUtilities.getJOBWorkerProcessCount();

    await DBMigrationManager.createDatabaseIfNotExits( LoggerManager.mainLoggerInstance ); //Force create database if not exists

    await DBMigrationManager.migrateUsingRawConnection( LoggerManager.mainLoggerInstance ); //Migrate the database using only raw connection

    DBConnectionManager.currentInstance = await DBConnectionManager.create( LoggerManager.mainLoggerInstance ); //Init the connection to db using the orm

    DBConnectionManager.queryStatements = await DBConnectionManager.loadQueryStatement( LoggerManager.mainLoggerInstance );

    await DBMigrationManager.migrateUsingORMConnection( DBConnectionManager.currentInstance,
                                                        LoggerManager.mainLoggerInstance ); //Migrate the database using only orm connection

    await ModelServiceManager.loadModelServices( LoggerManager.mainLoggerInstance );

    if ( intHTTPWorkerProcessCount === 0 ||
         process.env.WORKER_KIND === "http_worker_process" ) {

      ApplicationManager.currentInstance = await ApplicationManager.create( DBConnectionManager.currentInstance,
                                                                            LoggerManager.mainLoggerInstance );

    }

    if ( resourceLocked !== null ) {

      await CacheManager.unlockResource( resourceLocked,
                                         LoggerManager.mainLoggerInstance );

    }

    await I18NManager.create( {},
                              LoggerManager.createMainLogger );

    if ( cluster.isMaster ) {

      const logger = DBConnectionManager.currentInstance;

      if ( intHTTPWorkerProcessCount > 0 ) { //Launch the http worker process

        let debugMark = debug.extend( "8DC0B75CB0A0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( `Creating %d HTTP worker process`, intHTTPWorkerProcessCount );

        let intWorkerCount = 0;

        for ( let intWorker = 0; intWorker < intHTTPWorkerProcessCount; intWorker++ ) {

          //debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );

          //let httpWorker = null;

          //if ( intWorkerCount == 0 ) {

          //init the HTTP worker
          await new Promise<boolean>( ( resolve, reject ) => {

            debugMark( "Forking main process" );
            const httpWorker = cluster.fork( { WORKER_KIND: "http_worker_process", WORKER_INDEX: intWorker, ...process.env } ); //Start the first http worker

            httpWorker.on( "message", async ( msg: any ) => {

              if ( msg.command === "start_done" ) { //VERY IMPORTANT listen for this custom message. To resolve the promise

                debugMark( "HTTP worker process with id %d now started and listen.", httpWorker.id );
                intWorkerCount += 1;
                resolve( true );

              }

            });

            httpWorker.on( 'exit', ( strCode: any, strSignal: any ) => {

              httpWorkerProcessExit( httpWorker,
                                     strCode,
                                     strSignal,
                                     logger );

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

            const jobWorker = cluster.fork( { WORKER_KIND: "job_worker_process", WORKER_INDEX: intWorker, ...process.env } ); //Start the job worker

            jobWorker.on( "message", async ( msg: any ) => {

              if ( msg.command === "start_done" ) { //VERY IMPORTANT listen for this custom message. To resolve the promise

                debugMark( "JOB worker process with id [%d] now started.", jobWorker.id );
                intWorkerCount += 1;
                resolve( true );

              }

            });

            jobWorker.on( 'exit', ( strCode: any, strSignal: any ) => {

              jobProcessWorkerExit( jobWorker,
                                    strCode,
                                    strSignal,
                                    logger );

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

        const intPort = process.env.PORT || 9090;

        ApplicationManager.currentInstance.listen(

          intPort,
          async () => {

            let debugMark = debug.extend( "182DD8473CBE" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

            debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            debugMark( `Main process running on *:%d%s`, intPort, process.env.SERVER_ROOT_PATH );
            debugMark( `Main process running on *:%d%s`, intPort, ApplicationManager.currentInstance.apolloServer.graphqlPath );
            debugMark( `Main process is network leader: ${process.env.IS_NETWORK_LEADER == '1'? "Yes":"No"}` );
            debugMark( `Main process is starting the JobQueueManager` );

            await JobQueueManager.create( null,
                                          ApplicationManager.currentInstance );

          }

        );

      }

    }
    else if ( process.env.WORKER_KIND === "http_worker_process" ) {

      const intPort = process.env.PORT || 9090;

      ApplicationManager.currentInstance.listen(

        intPort,
        async () => {

          let debugMark = debug.extend( "56C70776F9AC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

          debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( `HTTP worker main process is network leader: ${process.env.IS_NETWORK_LEADER == '1'? "Yes":"No"}` );
          debugMark( `HTTP worker process with id: %d running on *:%d%s`, cluster.worker.id, intPort, process.env.SERVER_ROOT_PATH );
          debugMark( `HTTP worker process with id: %d running on *:%d%s`, cluster.worker.id, intPort, ApplicationManager.currentInstance.apolloServer.graphqlPath );
          debugMark( `HTTP worker process with id: %d is starting the JobQueueManager`, cluster.worker.id );

          await JobQueueManager.create( null,
                                        ApplicationManager.currentInstance );

          process.send( { command: "start_done" } ); //VERY IMPORTANT send this custom message to parent process. To allow to continue to parent process

        }

      );

    }
    else if ( process.env.WORKER_KIND === "job_worker_process" ) {

      let debugMark = debug.extend( "12D457F51385" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( `JOB worker main process is network leader: ${process.env.IS_NETWORK_LEADER == '1'? "Yes":"No"}` );
      debugMark( `JOB worker process with id: %d is starting the JobQueueManager`, cluster.worker.id );

      process.send( { command: "start_done" } );  //VERY IMPORTANT send this custom message to parent process. To allow to continue to parent process

      await JobQueueManager.create( null,
                                    ApplicationManager.currentInstance );

    }

  }
  catch ( error ) {

    const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

    sourcePosition.method = "server." + main.name;

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

};

main();
