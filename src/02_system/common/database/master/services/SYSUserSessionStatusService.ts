import cluster from 'cluster';

//import moment = require("moment-timezone");

import CommonConstants from "../../../CommonConstants";
import SystemConstants from "../../../SystemContants";

import CommonUtilities from "../../../CommonUtilities";
import SystemUtilities from '../../../SystemUtilities';

import { SYSUserSessionStatus } from "../models/SYSUserSessionStatus";

import DBConnectionManager from "../../../managers/DBConnectionManager";

import BaseService from "./BaseService";

const debug = require( 'debug' )( 'SYSUserSessionStatus' );

export default class SYSUserSessionStatusService extends BaseService {

  static readonly _ID = "sysUserSessionStatusService";

  static async getUserSessionStatusByToken( strToken: string = "",
                                            transaction: any,
                                            logger: any ): Promise<SYSUserSessionStatus> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { Token: strToken },
        transaction: currentTransaction,

      }

      result = await SYSUserSessionStatus.findOne( options );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

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

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return result;

  }

  static async getUserSessionStatusByShortToken( strShortToken: string = "",
                                                 transaction: any,
                                                 logger: any ): Promise<SYSUserSessionStatus> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { ShortToken: strShortToken },
        transaction: currentTransaction,

      }

      result = await SYSUserSessionStatus.findOne( options );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getUserSessionStatusByShortToken.name;

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

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return result;

  }

    static async getUserSessionStatusBySocketToken( strSocketToken: string = "",
                                                    transaction: any,
                                                    logger: any ): Promise<SYSUserSessionStatus> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { SocketToken: strSocketToken },
        transaction: currentTransaction,

      }

      result = await SYSUserSessionStatus.findOne( options );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getUserSessionStatusBySocketToken.name;

      const strMark = "C70864AB8CD1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
        catch ( error ) {


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

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { UserId: strUserId, LoggedOutAt: null },
        transaction: currentTransaction,
        //context: { TimeZoneId: "America/Los_Angeles" }
        order: [
          [ 'UpdatedAt', 'DESC' ]
        ],

      }

      const rows = await SYSUserSessionStatus.findAll( options as any );

      let intCurrentSession = 0;

      for ( let row of rows ) {

        if ( intCurrentSession >= intMaxSessionsAllowed ) {

          /*
          const currentValues = ( row as any ).dataValues;

          currentValues.LoggedOutBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
          currentValues.LoggedOutAt = SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_ISO8601_Millis );

          ( options as any ).where = { UserId: strUserId, Token: currentValues.Token };

          await SYSUserSessionStatus.update( currentValues,
                                             options );

          */
         const userSessionStatus = ( row as any ).dataValues;

         userSessionStatus.LoggedOutBy = userSessionStatus.UserName; //UserInfo.Name;
         userSessionStatus.LoggedOutAt = SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_ISO8601_Millis );

         await SystemUtilities.createOrUpdateUserSessionStatus( userSessionStatus.Token,
                                                                userSessionStatus,
                                                                {
                                                                  updateAt: true,        //Update the field updatedAt
                                                                  setRoles: false,       //Set roles?
                                                                  groupRoles: null,      //User group roles
                                                                  userRoles: null,       //User roles
                                                                  forceUpdate: true,     //Force update?
                                                                  tryLock: 1,            //Only 1 try
                                                                  lockSeconds: 7 * 1000, //Second
                                                                },
                                                                /*
                                                                false,    //Set roles?
                                                                null,     //User group Roles
                                                                null,     //User Roles
                                                                true,     //Force update?
                                                                1,        //Only 1 try
                                                                7 * 1000, //Second
                                                                */
                                                                currentTransaction,
                                                                logger );

        }

        intCurrentSession += 1;

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

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

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


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

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

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

      const rows = await SYSUserSessionStatus.findAll( options as any );

      if ( CommonUtilities.isNotNullOrEmpty( rows ) ) {

        strResult = rows[ 0 ].CreatedAt;

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

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

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return strResult;

  }

  static async createOrUpdate( strUserId: string,
                               strToken: string,
                               createOrUpdateData: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<SYSUserSessionStatus> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { "UserId": strUserId, "Token": strToken },
        transaction: currentTransaction,

      }

      let sysUserSessionStatusInDB = null;

      if ( bUpdate ) {

        sysUserSessionStatusInDB = await SYSUserSessionStatus.findOne( options );

      }

      if ( sysUserSessionStatusInDB === null ) {

        sysUserSessionStatusInDB = await SYSUserSessionStatus.create(
                                                                      createOrUpdateData,
                                                                      { transaction: currentTransaction }
                                                                    );

      }
      else if ( bUpdate ) {

        /*
        if ( sysUserSessionStatusInDB.CreatedBy && !createOrUpdateData.CreatedBy ) {

          createOrUpdateData.CreatedBy = sysUserSessionStatusInDB.CreatedBy;

        }

        if ( sysUserSessionStatusInDB.CreatedAt && !createOrUpdateData.CreatedAt ) {

          createOrUpdateData.CreatedAt = sysUserSessionStatusInDB.CreatedAt;

        }
        */

        if ( !createOrUpdateData.UpdatedBy ) { //sysUserSessionStatusInDB.UpdatedBy &&

          createOrUpdateData.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET; //sysUserSessionStatusInDB.UpdatedBy;

        }

        ( options as any ).notUpdateAt = true;

        await sysUserSessionStatusInDB.update( createOrUpdateData,
                                               options );

        sysUserSessionStatusInDB = await SYSUserSessionStatus.findOne( options );

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = sysUserSessionStatusInDB;

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

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

      result = error;

    }

    return result;

  }

}
