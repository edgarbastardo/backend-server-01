import cluster from "cluster";
import Redlock from "redlock";
//import uuidv4 from 'uuid/v4';

import CommonConstants from "../CommonConstants";

import CommonUtilities from "../CommonUtilities";
import SystemUtilities from "../SystemUtilities";

const debug = require( 'debug' )( 'CacheManager' );

export default class CacheManager {

  static currentInstance: any = null;

  static async create( logger: any ): Promise<any> {

    let redisClient = null;

    try {

      if ( process.env.USE_CACHE === "1" ) {

        redisClient = await require( "ioredis" ).createClient( { port: process.env.REDIS_SERVER_PORT,
                                                                host: process.env.REDIS_SERVER_IP,
                                                                password: process.env.REDIS_SERVER_PASSWORD } );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.create.name;

      const strMark = "39FEEE47CC45" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    return redisClient;

  }

  static async lockResource( redisClient: any = CacheManager.currentInstance,
                             strResourceName: string,
                             intTTL: number,
                             intRetryCount: number = 12,
                             intRetryDelay: number = 5 * 1000,
                             logger: any ): Promise<any> {

    let result: any = null;

    try {

      if ( redisClient ) {

        const redlock = new Redlock(
          // you should have one client for each independent redis node
          // or cluster
          [ redisClient ],
          {
              // the expected clock drift; for more details
              // see http://redis.io/topics/distlock
              driftFactor: 0.01, // time in ms

              // the max number of times Redlock will attempt
              // to lock a resource before erroring
              retryCount:  intRetryCount, //12

              // the time in ms between attempts
              retryDelay:  intRetryDelay, //1000 * 5, // time in ms

              // the max time in ms randomly added to retries
              // to improve performance under high contention
              // see https://www.awsarchitectureblog.com/2015/03/backoff.html
              retryJitter:  2000  // time in ms
          }

        );

        result = await redlock.lock( strResourceName, intTTL ); //Try for 1 minute

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.lockResource.name;

      const strMark = "FDDE29A4E794" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    return result;

  }

  static async unlockResource( redLock: any,
                               logger: any ): Promise<boolean> {

    let bResult : boolean;

    try {

      if ( redLock ) {

        await redLock.unlock();

        let debugMark = debug.extend( "DAD04DE7C94F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( `Success unlock the redis resource` );

        bResult = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.unlockResource.name;

      const strMark = "95A71EC38900" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async setData( strKeyName: String,
                        keyData: any,
                        logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      if ( CacheManager.currentInstance ) {

        await CacheManager.currentInstance.set( strKeyName,
                                                keyData );

        bResult = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.setData.name;

      const strMark = "9CEDB846E59A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async setDataWithTTL( strKeyName: String,
                               keyData: any,
                               intTTL: number,
                               logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      if ( CacheManager.currentInstance ) {

        await CacheManager.currentInstance.set( strKeyName,
                                                keyData,
                                                "EX",
                                                intTTL );

        bResult = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.setDataWithTTL.name;

      const strMark = "5771EB786591" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getData( strKeyName: String,
                        logger: any ):Promise<any> {

    let result = null;

    try {

      if ( CacheManager.currentInstance ) {

        result = await CacheManager.currentInstance.get( strKeyName );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getData.name;

      const strMark = "A60AFEB4BD531" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    return result;

  }

  static async deleteData( strKeyName: String,
                           logger: any ):Promise<any> {

    let result = null;

    try {

      if ( CacheManager.currentInstance ) {

        result = await CacheManager.currentInstance.del( strKeyName );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getData.name;

      const strMark = "69489A614583" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    return result;

  }


}