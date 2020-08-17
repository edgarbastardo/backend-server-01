import cluster from "cluster";
import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import CommonConstants from "../../../../../02_system/common/CommonConstants";
//import SystemConstants from "../../../../../02_system/common/SystemContants";

import CommonUtilities from "../../../../../02_system/common/CommonUtilities";
import SystemUtilities from "../../../../../02_system/common/SystemUtilities";

import BaseService from "../../../../../02_system/common/database/master/services/BaseService";

import DBConnectionManager from "../../../../../02_system/common/managers/DBConnectionManager";

//import { BIZDriverStatus } from "../models/BIZDriverStatus";
//import { SYSUser } from "../../../../../02_system/common/database/master/models/SYSUser";
import { BIZDriverPosition } from "../models/BIZDriverPosition";
import I18NManager from "../../../../../02_system/common/managers/I18Manager";

const debug = require( "debug" )( "BIZDriverPositionService" );

export default class BIZDriverPositionService extends BaseService {

  static readonly _ID = "bizDriverPositionService";

  static async create( createData: any,
                       transaction: any,
                       logger: any ): Promise<BIZDriverPosition> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let bizDriverStatusInDB = await BIZDriverPosition.create(
                                                                createData,
                                                                { transaction: currentTransaction }
                                                              );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = bizDriverStatusInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.create.name;

      const strMark = "BE86BDFB6AFB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

      result = error;

    }

    return result;

  }

  static async bulkCreate( bulkData: any,
                           strShortToken: string,
                           strUserId: string,
                           strUserName: string,
                           strLanguage: string,
                           transaction: any,
                           logger: any ): Promise<any> {

    let result: any = {
                        data:[],
                        errors:[],
                        warnings: []
                      };

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const sleep = require( "util" ).promisify( setTimeout );

      for ( let intIndex = 0; intIndex < bulkData.length; intIndex++ ) {

        if ( bulkData[ intIndex ].CreatedAt &&
             SystemUtilities.isValidDateTime( bulkData[ intIndex ].CreatedAt ) ) {

          bulkData[ intIndex ].CreatedAt = SystemUtilities.transformToTimeZone( bulkData[ intIndex ].CreatedAt,
                                                                                CommonUtilities.getCurrentTimeZoneId(),
                                                                                null,
                                                                                logger );

        }

        if ( bulkData.length > 1 &&
             !bulkData[ intIndex ].CreatedAt ) {

          await sleep( 10 ); //Wait for 10 millisecond before create new entry

        }

        const bizDriverPositionInDB = await BIZDriverPositionService.create(
                                                                             {
                                                                               Id: bulkData[ intIndex ].Id || null,
                                                                               UserId: strUserId,
                                                                               ShortToken: strShortToken,
                                                                               Accuracy: bulkData[ intIndex ].Accuracy,
                                                                               Latitude: bulkData[ intIndex ].Latitude,
                                                                               Longitude: bulkData[ intIndex ].Longitude,
                                                                               Altitude: bulkData[ intIndex ].Altitude,
                                                                               Speed: bulkData[ intIndex ].Speed,
                                                                               Code: bulkData[ intIndex ].Code,
                                                                               CreatedBy: strUserName,
                                                                               CreatedAt: bulkData[ intIndex ].CreatedAt ||
                                                                                          SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ),
                                                                               Status: bulkData[ intIndex ].CreatedAt ? 0: 1 //0 = offline, 1 = online
                                                                             },
                                                                             currentTransaction,
                                                                             logger
                                                                           );

        if ( bizDriverPositionInDB &&
             bizDriverPositionInDB instanceof Error === false ) {

          let driverPositionInDB = CommonUtilities.deleteObjectFields( ( bizDriverPositionInDB as any ).dataValues,
                                                                       [
                                                                         "UserId",
                                                                         //"ShortToken",
                                                                         "CreatedBy",
                                                                         //"CreatedAt",
                                                                       ],
                                                                       logger );

          result.data.push( driverPositionInDB );

        }
        else {

          const error = bizDriverPositionInDB as any;

          result.errors.push(
                              {
                                Code: error.name,
                                Message: error.message,
                                Details: {
                                           Index: intIndex,
                                           Id: bulkData[ intIndex ].Id,
                                           Error: await SystemUtilities.processErrorDetails( error ) //error
                                         }
                              }
                            );

        }

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.bulkCreate.name;

      const strMark = "AB9152A24F14" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

      result.errors.push(
                          {
                            Code: "ERROR_UNEXPECTED",
                            Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                            Mark: strMark,
                            Details: await SystemUtilities.processErrorDetails( error ) //error
                          }
                        );

    }

    return result;

  }

  static async getLastPositionByUserId( strUserId: string,
                                        strStartDateTime: string,
                                        strEndDateTime: string,
                                        intLimit: number,
                                        transaction: any,
                                        logger: any ): Promise<any[]> {

    let result = [];

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }


      let strSQL = null;

      if ( strStartDateTime &&
           strEndDateTime ) {

        strSQL = DBConnectionManager.getStatement( "master",
                                                   "getLastPositionBetweenByUserId",
                                                    {
                                                      UserId: strUserId,
                                                      StartDateTime: strStartDateTime,
                                                      EndDateTime: strEndDateTime,
                                                      Limit: intLimit
                                                    },
                                                    logger );

      }
      else {

        strSQL = DBConnectionManager.getStatement( "master",
                                                   "getLastPositionByUserId",
                                                   {
                                                     UserId: strUserId,
                                                     Limit: intLimit
                                                   },
                                                   logger );

      }

      const rows = await dbConnection.query( strSQL, {
                                                       raw: true,
                                                       type: QueryTypes.SELECT,
                                                       transaction: currentTransaction
                                                     } );

      if ( rows &&
           rows.length >= 1 ) {

        let strSavedSessionShortToken = null;
        let strSavedUserName = null;

        //let intSessionIndex = 1;

        let userNameSessionList = {};
        let sessionPoints = [];

        for ( let intIndex = 0; intIndex < rows.length; intIndex++ ) {

          if ( strSavedSessionShortToken === null ) {

            strSavedSessionShortToken = rows[ intIndex ].ShortToken;
            strSavedUserName = rows[ intIndex ].Name;

            delete rows[ intIndex ].Name;
            delete rows[ intIndex ].ShortToken;

            sessionPoints.push( rows[ intIndex ] );

          }
          else if ( strSavedSessionShortToken === rows[ intIndex ].ShortToken ) {

            strSavedUserName = rows[ intIndex ].Name;

            delete rows[ intIndex ].Name;
            delete rows[ intIndex ].ShortToken;

            sessionPoints.push( rows[ intIndex ] );

          }
          else if ( strSavedSessionShortToken !== rows[ intIndex ].ShortToken ) {

            userNameSessionList[ strSavedUserName ] = { [ strSavedSessionShortToken ] : [ ...sessionPoints ] };

            strSavedSessionShortToken = rows[ intIndex ].ShortToken;
            strSavedUserName = rows[ intIndex ].Name;

            delete rows[ intIndex ].Name;
            delete rows[ intIndex ].ShortToken;

            sessionPoints = [ rows[ intIndex ] ];

            //intSessionIndex += 1;

          }

        }

        userNameSessionList[ strSavedUserName ] = {
                                                    ...userNameSessionList[ strSavedUserName ],
                                                    [ strSavedSessionShortToken ] : [ ...sessionPoints ]
                                                  };

        result.push( userNameSessionList );

      }
      else  {

        result = [];

      };

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getLastPositionByUserId.name;

      const strMark = "B70076C9AAEF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

      result = error;

    }

    return result;

  }

  static async getLastPositionByShortToken( strShortToken: string,
                                            strStartDateTime: string,
                                            strEndDateTime: string,
                                            intLimit: number,
                                            intKind: number,
                                            transaction: any,
                                            logger: any ): Promise<[]> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }


      let strSQL = null;

      if ( intKind === 0 ) {

        if ( strStartDateTime &&
             strEndDateTime ) {

          strSQL = DBConnectionManager.getStatement( "master",
                                                     "getLastPositionBetweenByShortToken",
                                                     {
                                                       ShortToken: strShortToken,
                                                       StartDateTime: strStartDateTime,
                                                       EndDateTime: strEndDateTime,
                                                       Limit: intLimit
                                                     },
                                                     logger );

        }
        else {

          strSQL = DBConnectionManager.getStatement( "master",
                                                     "getLastPositionByShortToken",
                                                     {
                                                       ShortToken: strShortToken,
                                                       Limit: intLimit
                                                     },
                                                     logger );

        }

      }
      else {

        if ( strStartDateTime &&
             strEndDateTime ) {

          strSQL = DBConnectionManager.getStatement( "master",
                                                     "getLastPositionBetweenByShortTokenB",
                                                     {
                                                       ShortToken: strShortToken,
                                                       StartDateTime: strStartDateTime,
                                                       EndDateTime: strEndDateTime,
                                                       Limit: intLimit
                                                     },
                                                     logger );

        }
        else {

          strSQL = DBConnectionManager.getStatement( "master",
                                                     "getLastPositionByShortTokenB",
                                                     {
                                                       ShortToken: strShortToken,
                                                       Limit: intLimit
                                                     },
                                                     logger );

        }

      }

      const rows = await dbConnection.query( strSQL, {
                                                       raw: true,
                                                       type: QueryTypes.SELECT,
                                                       transaction: currentTransaction
                                                     } );

      if ( rows && rows.length > 0 ) {

        result = rows;

      }
      else  {

        result = [];

      };

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getLastPositionByShortToken.name;

      const strMark = "6C88978630BD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

      result = error;

    }

    return result;

  }

}
