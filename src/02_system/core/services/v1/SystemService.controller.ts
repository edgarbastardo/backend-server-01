import cluster from "cluster";

//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import {
  //Router,
  Request,
  //Response,
  //NextFunction
} from "express";

//import bcrypt from "bcrypt";
//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from "uuid/v4";
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import CommonConstants from "../../../common/CommonConstants";

import CommonUtilities from "../../../common/CommonUtilities";
import SystemUtilities from "../../../common/SystemUtilities";

import DBConnectionManager from "../../../common/managers/DBConnectionManager";
import I18NManager from "../../../common/managers/I18Manager";
import CacheManager from "../../../common/managers/CacheManager";

import RedisConnectionManager from "../../../common/managers/RedisConnectionManager";
import InstantMessageServerManager from "../../../common/managers/InstantMessageServerManager";

const debug = require( "debug" )( "SystemServiceController" );

export default class SystemServiceController {

  static readonly _ID = "SystemServiceController";

  static async getStatus( request: Request,
                          transaction: any,
                          logger: any ): Promise<any> {

    let result = null;

    //let currentTransaction = transaction;

    //let bIsLocalTransaction = false;

    //let bApplyTransaction = false;

    let strLanguage = "";

    try {

      //const context = ( request as any ).context;

      //strLanguage = context.Language;

      const databaseList = Object.keys( DBConnectionManager.getAllDBConfig() );

      const databaseStatus = { success: {}, fail: {} };

      let bConnectionToDbFailed = false;

      const error = {};
      const warning = {};

      for ( let intDatabaseIndex = 0; intDatabaseIndex < databaseList.length; intDatabaseIndex++ ) {

        if ( DBConnectionManager.getDBConnection( databaseList[ intDatabaseIndex ] ) === null ) {

          //Database with no connection
          const error = DBConnectionManager.getDBConnectionError( databaseList[ intDatabaseIndex ] );

          databaseStatus.fail[ databaseList[ intDatabaseIndex ] ] = {
                                                                      Code: error.name,
                                                                      Message: error.message,
                                                                      Details: await SystemUtilities.processErrorDetails( error ) //error
                                                                    };
          bConnectionToDbFailed = true;

        }
        else {

          databaseStatus.success[ databaseList[ intDatabaseIndex ] ] = {
                                                                         Code: "SUCCESS_CONNECTED_DATABASE",
                                                                         Message: await I18NManager.translate( strLanguage, "Success connection to database" ),
                                                                         Details: null
                                                                       };

        }

      }

      if ( bConnectionToDbFailed ) {

        error[ "database" ] = { ...databaseStatus.fail };

      }

      const configData = await InstantMessageServerManager.getConfigInstantMessageServerService( null, logger );

      const instanMessageStatus = {
                                    Auth: CommonUtilities.maskData( configData?.auth?.api_key ),
                                    hostLiveDomain: configData?.host_live_domain,
                                    hostLivePath: configData?.host_live_path,
                                    connected: InstantMessageServerManager.currentIMInstance?.connected === true
                                  }


      const data = {
                     app: process.env.APP_PROJECT_NAME,
                     appServerDataName: process.env.APP_SERVER_DATA_NAME,
                     appServerTaskName: process.env.APP_SERVER_TASK_NAME,
                     appServerPort: process.env.APP_SERVER_PORT,
                     info: SystemUtilities.info,
                     date: SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_ISO8601_Millis ),
                     startedAt: SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_ISO8601_Millis ),
                     isNetworkLeader: SystemUtilities.bIsNetworkLeader,
                     isNetworkLeaderFrom: SystemUtilities.NetworkLeaderFrom ? SystemUtilities.NetworkLeaderFrom.format( CommonConstants._DATE_TIME_LONG_FORMAT_ISO8601_Millis ) : "",
                     networkId: SystemUtilities.strNetworkId,
                     host: SystemUtilities.getHostName(),
                     server: SystemUtilities.getSystemId(),
                     rootPath: SystemUtilities.strBaseRootPath,
                     runPath: SystemUtilities.strBaseRunPath,
                     worker: cluster.worker && cluster.worker.id ? cluster.worker.id : "master",
                     database: databaseStatus.success,
                     instantMessage: instanMessageStatus,
                     cache: {}
                   }

      const cacheStatus = {
                            Code: "",
                            Message: "",
                            Details: null,
                          }

      if ( CacheManager.currentInstance === null ) {

        if ( process.env.USE_CACHE === "1" )  {

          cacheStatus.Code = "ERROR_NOT_CONNECTED_CACHE"
          cacheStatus.Message = await I18NManager.translate( strLanguage, "Failed connection to cache" );
          cacheStatus.Details = "CacheManager.currentInstance === null";

          error[ "cache" ] = cacheStatus;

        }
        else {

          cacheStatus.Code = "WARNING_DISABLED_CACHE"
          cacheStatus.Message = await I18NManager.translate( strLanguage, "Cache disabled by config entry" );
          cacheStatus.Details = "env.USE_CACHE = 0";

          warning[ "cache" ] = cacheStatus;

        }

      }
      else {

        const strStatus = CacheManager.currentInstance.status;

        if ( strStatus === "ready" ) { //strStatus === "connecting" || strStatus === "reconnecting" ) {

          cacheStatus.Code = "SUCCESS_CONNECTED_CACHE"
          cacheStatus.Message = await I18NManager.translate( strLanguage, "Success connection to cache" );
          cacheStatus.Details = null;

          data[ "cache" ] = cacheStatus;

        }
        else {

          cacheStatus.Code = "ERROR_NOT_CONNECTED_CACHE"
          cacheStatus.Message = await I18NManager.translate( strLanguage, "Failed o delayed connection to cache" );
          cacheStatus.Details = `CacheManager.currentInstance.status === "${strStatus}"`;

          error[ "cache" ] = cacheStatus;

        }

      }

      if ( RedisConnectionManager.useRedis() ) {

        data[ "redis" ] = [];

        const redisConnectionList = Object.keys( RedisConnectionManager.getAllRedisConnection() );

        for ( let intRedisConnectionIndex = 0; intRedisConnectionIndex < redisConnectionList.length; intRedisConnectionIndex++ ) {

          data[ "redis" ].push(
                                {
                                  name: redisConnectionList[ intRedisConnectionIndex ],
                                  subscribed: RedisConnectionManager.getRedisConnectionOn( redisConnectionList[ intRedisConnectionIndex ] )
                                }
                              );

        }

      }

      if ( Object.keys( error ).length > 0 ) {

        const errors = [];
        const warnings = [];

        errors.push( error );

        if ( Object.keys( warning ).length > 0 ) {

          warnings.push( warning );

        }

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_DATABASE_CONNECTION_FAILED",
                   Message: await I18NManager.translate( strLanguage, "One o more database connection failed" ),
                   Mark: "DA13E1748E25" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: errors,
                   Warnings: warnings,
                   Count: 1,
                   Data: [
                           data
                         ]
                 };

      }
      else {

        const warnings = [];

        if ( Object.keys( warning ).length > 0 ) {

          warnings.push( warning );

        }

        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_STATUS",
                   Message: await I18NManager.translate( strLanguage, "Success status" ),
                   Mark: "620A7376DB42" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: warnings,
                   Count: 1,
                   Data: [
                           data
                         ]
                 }

      }

      /*
      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }



      if ( !CacheManager.getCurrent ) {

        let dbConfig = DBConnectionManager.getDBConnection( "master" );

        delete dbConfig.Password;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_NOT_DATABASE_CONNECTION",
                   Message: await I18NManager.translate( strLanguage, "Not database connection open" ),
                   Mark: "DA13E1748E25" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_NOT_DATABASE_CONNECTION",
                               Message: await I18NManager.translate( strLanguage, "Not database connection open" ),
                               Details: dbConfig
                             }
                           ],
                   Warnings: [],
                   Count: 1,
                   Data: [
                           SystemUtilities.info
                         ]
                 };

      }
      else {

        let dbConfig = DBConnectionManager.getDBConfig( "master" );

        delete dbConfig.Password;

        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_GET_STATUS",
                   Message: await I18NManager.translate( strLanguage, "Success get the status" ),
                   Mark: "620A7376DB42" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: 1,
                   Data: [
                           SystemUtilities.info
                         ]
                 }

        bApplyTransaction = true;

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }
      */

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getStatus.name;

      const strMark = "9BF93C78A920" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = {
                 StatusCode: 500, //Internal server error
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                 Mark: strMark,
                 LogId: error.logId,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

      /*
      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }
      */

    }

    return result;

  }


}
