import cluster from 'cluster';

//import moment = require("moment-timezone");

import CommonConstants from "../../CommonConstants";
import SystemConstants from "../../SystemContants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from '../../SystemUtilities';

import { UserSessionStatus } from "../models/UserSessionStatus";
import DBConnectionManager from "../../managers/DBConnectionManager";
import BaseService from "./BaseService";

const debug = require( 'debug' )( 'UserSessionStatus' );

export default class UserSessionStatusService extends BaseService {

  static readonly _ID = "UserSessionStatusService";

  static async getUserSessionStatusByToken( strToken: string = "",
                                            transaction: any,
                                            logger: any ): Promise<UserSessionStatus> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const options = {

        where: { Token: strToken },
        transaction: currentTransaction,

      }

      result = await UserSessionStatus.findOne( options );

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getUserSessionStatusByToken.name;

      const strMark = "235192CBAB6D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction != null &&
           bApplyTansaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( ex ) {


        }

      }

    }

    return result;

  }

  static async getUserSessionStatusByShortToken( strShortToken: string = "",
                                                 transaction: any,
                                                 logger: any ): Promise<UserSessionStatus> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const options = {

        where: { ShortToken: strShortToken },
        transaction: currentTransaction,

      }

      result = await UserSessionStatus.findOne( options );

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getUserSessionStatusByToken.name;

      const strMark = "79EDCF769FB8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction != null &&
           bApplyTansaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( ex ) {


        }

      }

    }

    return result;

  }

  static async invalidateOldUserSessions( strUserId: string,
                                          intMaxSessionsAllowed: number,
                                          transaction: any,
                                          logger: any ): Promise<boolean> {

    let bResult = false;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const options = {

        where: { UserId: strUserId, LoggedOutAt: null },
        transaction: currentTransaction,
        //context: { TimeZoneId: "America/Los_Angeles" }
        order: [
          [ 'UpdatedAt', 'DESC' ]
        ],

      }

      const rows = await UserSessionStatus.findAll( options as any );

      let intCurrentSession = 0;

      for ( let row of rows ) {

        if ( intCurrentSession >= intMaxSessionsAllowed ) {

          const currentValues = ( row as any ).dataValues;

          currentValues.LoggedOutBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
          currentValues.LoggedOutAt = SystemUtilities.getCurrentDateAndTime().format();

          ( options as any).where = { UserId: strUserId, Token: currentValues.Token };

          await UserSessionStatus.update( currentValues,
                                          options );

        }

        intCurrentSession += 1;

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

      bResult = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.invalidateOldUserSessions.name;

      const strMark = "52765EC3737C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction != null &&
           bApplyTansaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( ex ) {


        }

      }

    }

    return bResult;

  }

  static async getLastUserLogin( strUserId: string,
                                 strToken: string,
                                 transaction: any,
                                 logger: any ): Promise<string> {

    let strResult = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const options = {

        where: {
                 UserId: {
                           $eq: strUserId
                         },
                 Token: {
                          $ne: strToken
                        },
                LoggedOutAt: null
               },
        transaction: currentTransaction,
        order: [
          [ 'CreatedAt', 'DESC' ]
        ],

      }

      const rows = await UserSessionStatus.findAll( options as any );

      if ( CommonUtilities.isNotNullOrEmpty( rows ) ) {

        strResult = rows[ 0 ].CreatedAt;

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getLastUserLogin.name;

      const strMark = "E97357DBB438" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction != null &&
           bApplyTansaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( ex ) {


        }

      }

    }

    return strResult;

  }

  static async createOrUpdate( strUserId: string,
                               strToken: string,
                               data: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<UserSessionStatus> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      //const strId = SystemUtilities.hashString( intRequestKind + ":" + strPath, 1, null );

      //let debugMark = debug.extend( '3ADAB615F2D9' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
      //debugMark( strId );

      const options = {

        where: { "UserId": strUserId, "Token": strToken },
        transaction: currentTransaction,
        //context: { TimeZoneId: "America/Los_Angeles" }

      }

      let userSessionStatusInDB = null;

      if ( bUpdate ) {

        userSessionStatusInDB = await UserSessionStatus.findOne( options );

      }

      if ( CommonUtilities.isNullOrEmpty( userSessionStatusInDB ) ) {

        userSessionStatusInDB = await UserSessionStatus.create(
                                                                data,
                                                                { transaction: currentTransaction }
                                                              );

      }
      else if ( bUpdate ) {

        if ( userSessionStatusInDB.CreatedBy && !data.CreatedBy ) {

          data.CreatedBy = userSessionStatusInDB.CreatedBy;

        }

        if ( userSessionStatusInDB.CreatedAt && !data.CreatedAt ) {

          data.CreatedAt = userSessionStatusInDB.CreatedAt;

        }

        if ( userSessionStatusInDB.UpdatedBy && !data.UpdatedBy ) {

          data.UpdatedBy = userSessionStatusInDB.UpdatedBy; //SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        }

        const updateResult = await UserSessionStatus.update( data,
                                                             options );

        if ( updateResult.length > 0 &&
             updateResult[ 0 ] >= 1 ) {

          result = await UserSessionStatus.findOne( options );

        }

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

      result = userSessionStatusInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "07EBDB32C37A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction != null &&
           bApplyTansaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( ex ) {


        }

      }

      result = error;

    }

    return result;

  }

}