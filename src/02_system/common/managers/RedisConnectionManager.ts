import cluster from 'cluster';

import Redis from "ioredis";

import CommonConstants from '../CommonConstants';

import CommonUtilities from '../CommonUtilities';
import SystemUtilities from '../SystemUtilities';

const debug = require( 'debug' )( 'RedisConnectionManager' );

export default class RedisConnectionManager {

  private static redisConnection: any = null;
  private static redisConnectionOn: any = null;

  static useRedis(): boolean {

    return process.env.USE_REDIS === "1";

  }

  static getRedisConnection( strConnection: string ): any {

    return this.redisConnection ? this.redisConnection[ strConnection ]: null;

  }

  static getRedisConnectionOn( strConnection: string ): any {

    return this.redisConnectionOn ? this.redisConnectionOn[ strConnection ]: null;

  }

  static getAllRedisConnection(): any {

    return this.redisConnection;

  }

  static getAllRedisConnectionOn(): any {

    return this.redisConnectionOn;

  }

  static async connect( strConnection: string, logger: any ): Promise<any> {

    let result: any = {};

    try {

      if ( !RedisConnectionManager.redisConnection ) {

        RedisConnectionManager.redisConnection = {};
        RedisConnectionManager.redisConnectionOn = {};
        /*
        let defaultClient = await require( "ioredis" ).createClient(
                                                                     {
                                                                       port: process.env.REDIS_SERVER_PORT,
                                                                       host: process.env.REDIS_SERVER_IP,
                                                                       password: process.env.REDIS_SERVER_PASSWORD
                                                                     }
                                                                   );
                                                                   */

        let defaultClient = new Redis(
                                       {
                                         port: parseInt( process.env.REDIS_SERVER_PORT ),
                                         host: process.env.REDIS_SERVER_IP,
                                         password: process.env.REDIS_SERVER_PASSWORD
                                       }
                                    );

        RedisConnectionManager.redisConnection[ "default" ] = defaultClient;
        RedisConnectionManager.redisConnectionOn[ "default" ] = false;

      }

      if ( !RedisConnectionManager.redisConnection[ strConnection ] ) {

        /*
        let redisClient = await require( "ioredis" ).createClient(
                                                                   {
                                                                     port: process.env.REDIS_SERVER_PORT,
                                                                     host: process.env.REDIS_SERVER_IP,
                                                                     password: process.env.REDIS_SERVER_PASSWORD
                                                                   }
                                                                 );
                                                                 */

        let redisClient = new Redis(
                                      {
                                        port: parseInt( process.env.REDIS_SERVER_PORT ),
                                        host: process.env.REDIS_SERVER_IP,
                                        password: process.env.REDIS_SERVER_PASSWORD
                                      }
                                   );

        RedisConnectionManager.redisConnection[ strConnection ] = redisClient;
        RedisConnectionManager.redisConnectionOn[ strConnection ] = false;

        result = redisClient;

      }
      else {

        result = this.redisConnection[ strConnection ];

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.connect.name;

      const strMark = "644B99BF7204" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return result;

  }

  static connectSync( strConnection: string, logger: any ): any {

    let result: any = {};

    try {

      if ( !RedisConnectionManager.redisConnection ) {

        RedisConnectionManager.redisConnection = {};
        RedisConnectionManager.redisConnectionOn = {};

        /*
        let defaultClient = await require( "ioredis" ).createClient(
                                                                     {
                                                                       port: process.env.REDIS_SERVER_PORT,
                                                                       host: process.env.REDIS_SERVER_IP,
                                                                       password: process.env.REDIS_SERVER_PASSWORD
                                                                     }
                                                                   );
                                                                   */

        let defaultClient = new Redis(
                                       {
                                         port: parseInt( process.env.REDIS_SERVER_PORT ),
                                         host: process.env.REDIS_SERVER_IP,
                                         password: process.env.REDIS_SERVER_PASSWORD
                                       }
                                    );

        RedisConnectionManager.redisConnection[ "default" ] = defaultClient;
        RedisConnectionManager.redisConnectionOn[ "default" ] = false;

      }

      if ( !RedisConnectionManager.redisConnection[ strConnection ] ) {

        /*
        let redisClient = await require( "ioredis" ).createClient(
                                                                   {
                                                                     port: process.env.REDIS_SERVER_PORT,
                                                                     host: process.env.REDIS_SERVER_IP,
                                                                     password: process.env.REDIS_SERVER_PASSWORD
                                                                   }
                                                                 );
                                                                 */

        let redisClient = new Redis(
                                      {
                                        port: parseInt( process.env.REDIS_SERVER_PORT ),
                                        host: process.env.REDIS_SERVER_IP,
                                        password: process.env.REDIS_SERVER_PASSWORD
                                      }
                                   );

        RedisConnectionManager.redisConnection[ strConnection ] = redisClient;
        RedisConnectionManager.redisConnectionOn[ strConnection ] = false;

        result = redisClient;

      }
      else {

        result = this.redisConnection[ strConnection ];

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.connectSync.name;

      const strMark = "5C7827ACEDC5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return result;

  }

  static async close( strConnection: string, logger: any ):Promise<boolean> {

    let bResult = false;

    try {

      if ( RedisConnectionManager.redisConnection &&
           RedisConnectionManager.redisConnection[ strConnection ] ) {

        await RedisConnectionManager.getRedisConnection( strConnection ).disconnect();

        delete RedisConnectionManager.redisConnection[ strConnection ];
        delete RedisConnectionManager.redisConnectionOn[ strConnection ];

        bResult = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.close.name;

      const strMark = "0F07800FD89B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async publish( strConnection: string,
                        strTopic: string,
                        message: any ): Promise<boolean> {

    let bResult = false;

    const redisConnection = RedisConnectionManager.getRedisConnection( strConnection || "default" );

    if ( redisConnection ) {

      if ( message instanceof Object ) {

        redisConnection.publish( strTopic, JSON.stringify( message ) );

      }
      else {

        redisConnection.publish( strTopic, message );

      }
      //Not wait to publish

      bResult = true;

    }

    return bResult;

  }

  static async subscribe( strConnection: string = null,
                          strTopic: string,
                          callback: ( strTopic: string, message: any ) => any,
                          logger: any ): Promise<boolean> {

    let bResult = false;

    const redisConnection = await RedisConnectionManager.connect( strConnection, logger );

    if ( redisConnection &&
         strTopic &&
         callback ) {

      if ( !RedisConnectionManager.redisConnectionOn[ strConnection ] ) {

        await redisConnection.on( "message", callback );
        RedisConnectionManager.redisConnectionOn[ strConnection ] = true;

      }

      await redisConnection.subscribe( strTopic );

      bResult = true;

    }

    return bResult;

  }

  static async unsubscribe( strConnection: string = null,
                            strTopic: string,
                            logger: any ): Promise<boolean> {

    let bResult = false;

    const redisConnection = await RedisConnectionManager.connect( strConnection, logger );

    if ( redisConnection &&
         strTopic ) {

      if ( RedisConnectionManager.redisConnectionOn[ strConnection ] ) {

        RedisConnectionManager.redisConnectionOn[ strConnection ] = false;

        await redisConnection.removeListener( "message" );

        await redisConnection.unsubscribe( strTopic );

        bResult = true;

      }

    }

    return bResult;

  }

}

//export default dbConnection;