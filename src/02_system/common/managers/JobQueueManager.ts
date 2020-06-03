import fs from 'fs';
//import { promises as fsPromises } from 'fs';
//import os from "os";
import path from 'path';
//import appRoot from 'app-root-path';
import cluster from 'cluster';

import CommonConstants from "../CommonConstants";

import SystemUtilities from "../SystemUtilities";
import CommonUtilities from "../CommonUtilities";

//import LoggerManager from "./LoggerManager";

//import util from 'util';

const debug = require( 'debug' )( 'JobQueueManager' );

export default class JobQueueManager {

  private static _jobQueueList: {};

  //private static _jobQueueOptionsList: {};

  static async _scan( directory: any,
                      params: any,
                      logger: any ): Promise<any> {

    try {

      const files = fs.readdirSync( directory )
                      .filter( file => fs.lstatSync( path.join( directory, file ) ).isFile() )
                      .filter( file => file.indexOf( '.' ) !== 0 && ( file.slice( -3 ) === '.js' || file.slice( -3 ) === '.ts' ) );

      const dirs = fs.readdirSync( directory )
                     .filter( file => fs.lstatSync( path.join( directory, file ) ).isDirectory() );

      //const pathParts = directory.split( "/" );

      for ( const file of files ) {

        if ( path.join( directory, file ) !== __filename ) {

          const importModule = await import( path.join( directory, file ) );

          if ( CommonUtilities.isNotNullOrEmpty( importModule ) &&
               CommonUtilities.isNotNullOrEmpty( importModule.default ) ) {

            const jobQueue = new importModule.default();

            if ( jobQueue.Name ) {

              if ( await jobQueue.init( params, logger ) ) {

                const debugMark = debug.extend( "F7F2BB72585D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

                if ( cluster.isMaster ) {

                  debugMark( "Added job queue with name: %s, in master process", jobQueue.Name );

                }
                else {

                  debugMark( "Added job queue with name: %s, in worker process with id: %s", jobQueue.Name, cluster.worker.id );

                }

                this._jobQueueList[ jobQueue.Name ] = jobQueue.getJob();

              }

            }

          }

        }

      }

      for ( const dir of dirs ) {

        if ( dir !== "template" &&
             dir !== "disabled" &&
             dir.startsWith( "disabled_" ) === false  ) {

          await this._scan( path.join( directory, dir ),
                            params,
                            logger );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = JobQueueManager.name + "." + this._scan.name;

      const strMark = "01CFA74A6BAC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  }

  static async create( params: any,
                       logger: any ): Promise<void> {

    //let result = null;

    try {

      this._jobQueueList = {};

      /*
      await this._scan( __dirname + "/../others/jobs/",
                        params,
                        logger );

      await this._scan( __dirname + "/../../../03_business/common/others/jobs/",
                        params,
                        logger );
                        */


      const pathToScan : any[] = JSON.parse( process.env.JOBS_PATH_TO_SCAN );

      for ( let intIndex = 0; intIndex < pathToScan.length; intIndex++ ) {

        let strPath = SystemUtilities.strBaseRunPath + pathToScan[ intIndex ];

        try {

          if ( fs.existsSync( strPath ) ) {

            await JobQueueManager._scan( strPath,
                                         params,
                                         logger );

          }

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = this.name + "." + this.create.name;

          const strMark = "B6B0D571794B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      }


    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.create.name;

      const strMark = "50359D84152E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    //return result;

  }

  public static async addJobToQueue( strQueueName: string,
                                     jobData: any,
                                     jobOptions: any,
                                     logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const debugMark = debug.extend( "ADB1784F0B00" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      if ( this._jobQueueList &&
           this._jobQueueList[ strQueueName ] ) {

        //const jobAddResult =
        if ( jobOptions ) {

          await this._jobQueueList[ strQueueName ].add( jobData, jobOptions );

        }
        else {

          await this._jobQueueList[ strQueueName ].add( jobData );

        }
        //this._jobQueueOptionsList[ strQueueName ] = jobOptions;

        if ( cluster.isMaster ) {

          debugMark( "Added job to the queue with name: %s, in master process", strQueueName );

        }
        else {

          debugMark( "Added job to the queue with name: %s, in worker process with id: %s", strQueueName, cluster.worker.id );

        }

      }
      else {

        if ( cluster.isMaster ) {

          debugMark( "Job queue with name: %s NOT FOUND, in master process", strQueueName );

        }
        else {

          debugMark( "Job queue with name: %s NOT FOUND, in worker process with id: %s", strQueueName, cluster.worker.id );

        }

      }

    }
    catch( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.addJobToQueue.name;

      const strMark = "21C16F31EC4C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

}
