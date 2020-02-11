import fs from 'fs';
import { promises as fsPromises } from 'fs';
import os from "os";
import path from 'path';
import appRoot from 'app-root-path';
import cluster from 'cluster';

import util from 'util';

import Queue from 'bull';

import CommonConstants from '../../CommonConstants';

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

const debug = require( 'debug' )( 'SampleJob' );

export default class SampleJob {

  public readonly Name = "SampleJob";

  public sampleJobQueue: any;

  //public static completedJobs = [];

  public async init( logger: any ):Promise<boolean> {

    let bResult = false;

    try {

      //SampleJob.completedJobs = []; //Only work if one worker

      //Here your code of init
      this.sampleJobQueue = new Queue(
                                       this.Name,
                                       {
                                         redis: {
                                           host: process.env.REDIS_SERVER_IP,
                                           port: parseInt( process.env.REDIS_SERVER_PORT ),
                                           password: process.env.REDIS_SERVER_PASSWORD
                                         },
                                         settings:{
                                           stalledInterval: 0, //Very important to long task not launnch task repeated 2 times
                                         }
                                       }
                                     );

      if ( process.env.WORKER_KIND === "job_worker_process" ) {

        this.sampleJobQueue.process( ( jobData: any, done: any ) => {

          //if ( SampleJob.completedJobs.includes( jobData.id ) === false ) {

            let debugMark = debug.extend( 'D8726991B32E' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );

            debugMark( "Start time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            //debugMark( "Completed JOBS: %O", SampleJob.completedJobs );
            debugMark( "JOB token: [%s]", jobData.queue.token );
            debugMark( "JOB id: [%s]", jobData.id );

            // n iterations before giving someone else a turn
            for ( let i = 1; i <= 35; i++ ) {

              debugMark( "Working: [%s]", i );
              CommonUtilities.sleep( 1 );
              //console.log(`Iter ${i}`);

            }

            debugMark( "Finish time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            debugMark( "%O", jobData.data );
            jobData.data[ "completed" ] = true;

            //await this.sampleJobQueue.removeRepeatable( this.Name, jobData.opts );
            //SampleJob.completedJobs.push( jobData.id );
            //debugMark( "Completed JOBS: %O", SampleJob.completedJobs );
            //done( null, { result: "ok" } );
            done();

            /*
          }
          else {

            done();

          }
          */

        } );

        const debugMark = debug.extend( "6CDD18E1A4B6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

        debugMark( "Registered process function for the job queue with name: %s, worker id: %s", this.Name, cluster.worker.id );

      }

      bResult = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = SampleJob.name + "." + this.init.name;

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

    return bResult;

  }

  public getJob(): any {

    return this.sampleJobQueue;

  }

}