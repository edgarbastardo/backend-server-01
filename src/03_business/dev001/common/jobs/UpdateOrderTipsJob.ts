//import fs from 'fs';
//import { promises as fsPromises } from 'fs';
//import os from "os";
//import path from 'path';
//import appRoot from 'app-root-path';
import cluster from 'cluster';

//import util from 'util';

import Queue from 'bull';

import CommonConstants from '../../../../02_system/common/CommonConstants';

import CommonUtilities from "../../../../02_system/common/CommonUtilities";
import SystemUtilities from "../../../../02_system/common/SystemUtilities";
import RedisConnectionManager from "../../../../02_system/common/managers/RedisConnectionManager";
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

                            stalledInterval: 0, //Very important to long task not launnch task repeated 2 times

                          }

                        };

        //Here your code of init
        this.updateTipJobQueue = new Queue(
                                            this.Name,
                                            options
                                          );

        if ( process.env.WORKER_KIND === "job_worker_process" ) {

          this.updateTipJobQueue.process( ( job: any, done: any ) => {

            //if ( SampleJob.completedJobs.includes( jobData.id ) === false ) {

              let debugMark = debug.extend( 'C54B6E1954FA' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );

              debugMark( "Start time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
              //debugMark( "Completed JOBS: %O", SampleJob.completedJobs );
              //debugMark( "JOB token: [%s]", jobData.queue.token );
              debugMark( "JOB Id: [%s]", job.data.Id );
              debugMark( "JOB Establishment Id: [%s]", job.data.EstablishmentId );
              debugMark( "JOB Date: [%s]", job.data.Date );
              debugMark( "JOB Path: [%s]", job.data.Path );

              // n iterations before giving someone else a turn
              for ( let i = 1; i <= 3; i++ ) {

                debugMark( "Working: [%s]", i );
                CommonUtilities.sleep( 1 );
                //console.log(`Iter ${i}`);

              }

              debugMark( "Finish time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
              debugMark( "%O", job.data );
              job.data[ "completed" ] = true;

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
