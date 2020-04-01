import cluster from 'cluster';

import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import CommonConstants from "../../../CommonConstants";
import SystemConstants from "../../../SystemContants";

import CommonUtilities from "../../../CommonUtilities";
import SystemUtilities from '../../../SystemUtilities';

import DBConnectionManager from "../../../managers/DBConnectionManager";

import BaseService from "./BaseService";

import { SYSUserSessionPresence } from "../models/SYSUserSessionPresence";
import SYSConfigValueDataService from './SYSConfigValueDataService';
import NotificationManager from '../../../managers/NotificationManager';
import I18NManager from '../../../managers/I18Manager';

const debug = require( 'debug' )( 'SYSUserSessionPresenceService' );

export default class SYSUserSessionPresenceService extends BaseService {

  static readonly _ID = "sysUserSessionPresenceService";

  static async getByToken( strToken: string,
                           strTimeZoneId: string,
                           transaction: any,
                           logger: any ): Promise<SYSUserSessionPresence> {

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

        where: { UserSessionStatusToken: strToken },
        transaction: currentTransaction,

      }

      result = await SYSUserSessionPresence.findOne( options );

      if ( CommonUtilities.isValidTimeZone( strTimeZoneId ) ) {

        SystemUtilities.transformModelToTimeZone( result,
                                                  strTimeZoneId,
                                                  logger );

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = SYSUserSessionPresenceService.name + "." + this.getByToken.name;

      const strMark = "88302B2EB84B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getByPresenceId( strPresenceId: string,
                                strTimeZoneId: string,
                                transaction: any,
                                logger: any ): Promise<SYSUserSessionPresence> {

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

        where: { PresenceId: strPresenceId },
        transaction: currentTransaction,

      }

      result = await SYSUserSessionPresence.findOne( options );

      if ( CommonUtilities.isValidTimeZone( strTimeZoneId ) ) {

        SystemUtilities.transformModelToTimeZone( result,
                                                  strTimeZoneId,
                                                  logger );

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = SYSUserSessionPresenceService.name + "." + this.getByPresenceId.name;

      const strMark = "791CF6E44572" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async checkExistsByToken( strToken: string,
                                   transaction: any,
                                   logger: any ): Promise<boolean> {

    return await this.getByToken( strToken,
                                  null,
                                  transaction,
                                  logger ) !== null;

  }

  static async createOrUpdate( createOrUpdateData: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<SYSUserSessionPresence> {

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

        where: { "UserSessionStatusToken": createOrUpdateData.UserSessionStatusToken ? createOrUpdateData.UserSessionStatusToken : "" },
        transaction: currentTransaction,

      }

      let sysUserSessionDeviceInDB = await SYSUserSessionPresence.findOne( options );

      if ( sysUserSessionDeviceInDB === null ) {

        sysUserSessionDeviceInDB = await SYSUserSessionPresence.create(
                                                                        createOrUpdateData,
                                                                        { transaction: currentTransaction }
                                                                      );

      }
      else if ( bUpdate ) {

        if ( !createOrUpdateData.UpdatedBy ) {

          createOrUpdateData.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        }

        await sysUserSessionDeviceInDB.update( createOrUpdateData,
                                               options );

        sysUserSessionDeviceInDB = await SYSUserSessionPresence.findOne( options );

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = sysUserSessionDeviceInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "A123CEA63A5D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteByModel( sysUserSessionPresence: SYSUserSessionPresence,
                              transaction: any,
                              logger: any ): Promise<Error|boolean> {

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

        transaction: currentTransaction,

      }

      await sysUserSessionPresence.destroy( options );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.deleteByModel.name;

      const strMark = "984905888C2D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteUserSessionPresenceByServer( strServer: string,
                                                  transaction: any,
                                                  logger: any ): Promise<Error|boolean> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let strSQL = "";

      if ( strServer !== "*" ) {

        strSQL = DBConnectionManager.getStatement( "master",
                                                   "deleteUserSessionPresenceByServer",
                                                    {
                                                      Server: strServer,
                                                    },
                                                    logger );

      }
      else {

        strSQL = DBConnectionManager.getStatement( "master",
                                                   "deleteUserSessionPresenceAll",
                                                    {},
                                                    logger );

      }

      await dbConnection.query( strSQL,
                                {
                                  raw: true,
                                  type: QueryTypes.DELETE,
                                  transaction: currentTransaction
                                } );

      result = true;

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.deleteByModel.name;

      const strMark = "E906126DF853" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getUserSessionPresenceServerList( strServer: string,
                                                 transaction: any,
                                                 logger: any ): Promise<string[]|Error> {

    let result = [];

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "getUserSessionPresenceServerList",
                                                     {
                                                       Server: strServer,
                                                     },
                                                     logger );

      const rows = await dbConnection.query( strSQL,
                                             {
                                               raw: true,
                                               type: QueryTypes.SELECT,
                                               transaction: currentTransaction
                                             } );

      if ( rows &&
           rows.length > 0 ) {

        result = rows;

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.deleteByModel.name;

      const strMark = "E906126DF853" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getUserSessionPresenceIdByUserName( strServer: string,
                                                   strUserName: string,
                                                   transaction: any,
                                                   logger: any ): Promise<any[]|Error> {

    let result = [];

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "getUserSessionPresenceIdByUserName",
                                                     {
                                                       Server: strServer,
                                                       UserName: strUserName,
                                                     },
                                                     logger );

      const rows = await dbConnection.query( strSQL,
                                             {
                                               raw: true,
                                               type: QueryTypes.SELECT,
                                               transaction: currentTransaction
                                             } );

      if ( rows &&
           rows.length > 0 ) {

        result = rows;

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getUserSessionPresenceIdByUserName.name;

      const strMark = "E90A940BEF18" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getUserSessionPresenceIdByUserNameLite( strUserName: string,
                                                       transaction: any,
                                                       logger: any ): Promise<any[]|Error> {

    let result = [];

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "getUserSessionPresenceIdByUserNameLite",
                                                     {
                                                       UserName: strUserName,
                                                     },
                                                     logger );

      const rows = await dbConnection.query( strSQL,
                                             {
                                               raw: true,
                                               type: QueryTypes.SELECT,
                                               transaction: currentTransaction
                                             } );

      if ( rows &&
           rows.length > 0 ) {

        result = rows;

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getUserSessionPresenceIdByUserNameLite.name;

      const strMark = "38F224A0F71B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getConfigDefaultRooms( userSessionStatus: any,
                                      transaction: any,
                                      logger: any ): Promise<string> {

    let strResult = "";

    try {

      const configData = await SYSConfigValueDataService.getConfigValueDataFromSessionSimple( userSessionStatus,
                                                                                              SystemConstants._CONFIG_ENTRY_IM_Rooms.Id,
                                                                                              SystemConstants._CONFIG_ENTRY_IM_Rooms.Owner,
                                                                                              transaction,
                                                                                              logger );

      if ( configData &&
           configData.rooms ) {

        strResult = configData.rooms;

        strResult = strResult.replace( new RegExp( "#@@UserGroupId@@#", "gi" ), "#" + userSessionStatus.UserGroupId + "#" );

        strResult = strResult.replace( new RegExp( "#@@UserGroupName@@#", "gi" ), "#" + userSessionStatus.UserGroupName + "#" );

        strResult = strResult.replace( new RegExp( "#@@UserId@@#", "gi" ), "#" + userSessionStatus.UserId + "#" );

        strResult = strResult.replace( new RegExp( "#@@UserName@@#", "gi" ), "#" + userSessionStatus.UserName + "#" );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigDefaultRooms.name;

      const strMark = "2D5C972A0793" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    return strResult;

  }

  static async getUserSessionPresenceRoomList( strPresenceId: string,
                                               transaction: any,
                                               logger: any ): Promise<any|Error> {

    let result = [];

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "getUserSessionPresenceRoomList",
                                                     {
                                                        PresenceId: strPresenceId,
                                                     },
                                                     logger );

      const rows = await dbConnection.query( strSQL,
                                             {
                                               raw: true,
                                               type: QueryTypes.SELECT,
                                               transaction: currentTransaction
                                             } );

      if ( rows &&
           rows.length > 0 ) {

        result = rows;

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getUserSessionPresenceRoomList.name;

      const strMark = "50C8005B26D2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getUserSessionPresenceRoomListCount( strPresenceId: string,
                                                    transaction: any,
                                                    logger: any ): Promise<any|Error> {

    let result = [];

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "getUserSessionPresenceRoomListCount",
                                                     {
                                                        PresenceId: strPresenceId,
                                                     },
                                                     logger );

      const rows = await dbConnection.query( strSQL,
                                             {
                                               raw: true,
                                               type: QueryTypes.SELECT,
                                               transaction: currentTransaction
                                             } );

      if ( rows &&
           rows.length > 0 ) {

        result = rows;

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getUserSessionPresenceRoomList.name;

      const strMark = "50C8005B26D2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async disconnectFromInstantMessageServer( userSessionStatus: any,
                                                   strSavedSocketToken: string,
                                                   strLanguage: string,
                                                   warnings: any[],
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

      if ( strSavedSocketToken ) {

        const sysUserSessionPresence = await SYSUserSessionPresenceService.getByToken( userSessionStatus.Token,
                                                                                       null,
                                                                                       currentTransaction,
                                                                                       logger );

        if ( sysUserSessionPresence ) {

          if ( sysUserSessionPresence instanceof Error ) {

            NotificationManager.publishOnTopic( "InstantMessage",
                                                {
                                                  Name: "Disconnect",
                                                  Token: userSessionStatus.Token,
                                                  SocketToken: strSavedSocketToken,
                                                  PresenceId: "@error",
                                                  Server: "@error"
                                                },
                                                logger );

            const error = sysUserSessionPresence as any;

            if ( warnings ) {

              warnings.push(
                            {
                              Code: 'WARNING_PRESENCE_DATA',
                              Message: await I18NManager.translate( strLanguage, 'Error to try to get the data presence' ),
                              Details: await SystemUtilities.processErrorDetails( error ) //error
                            }
                          );

            }

          }
          else {

            NotificationManager.publishOnTopic( "InstantMessage",
                                                {
                                                  Name: "Disconnect",
                                                  Token: userSessionStatus.Token,
                                                  SocketToken: strSavedSocketToken,
                                                  PresenceId: sysUserSessionPresence.PresenceId,
                                                  Server: sysUserSessionPresence.Server
                                                },
                                                logger );

          }

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

      sourcePosition.method = this.name + "." + this.disconnectFromInstantMessageServer.name;

      const strMark = "0F336DF22F35" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  /*
  static async getUserPresenceInRoomList( request: any,
                                          roomList: string[],
                                          transaction: any,
                                          logger: any ): Promise<any> {

    let result = [];

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const strSelectField = SystemUtilities.createSelectAliasFromModels(
                                                                          [
                                                                            SYSUserSessionPresence,
                                                                            SYSUser,
                                                                          ],
                                                                          [
                                                                            "A",
                                                                            "C",
                                                                          ]
                                                                        );

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "getUserSessionPresenceInRoomList",
                                                     {
                                                       SelectFields: strSelectField,
                                                     },
                                                     logger );

      for ( let intRoomIndex = 0; intRoomIndex < roomList.length; intRoomIndex++ ) {

        if ( intRoomIndex == 0 ) {

          strSQL = strSQL + ` A.Room Like '%${ roomList[ intRoomIndex ] }%'`;

        }
        else {

          strSQL = strSQL + ` And A.Room Like '%${ roomList[ intRoomIndex ] }%'`;

        }

      }

      const rows = await dbConnection.query( strSQL,
                                             {
                                               logging: console.log,
                                               raw: true,
                                               type: QueryTypes.SELECT,
                                               transaction: currentTransaction,
                                             } );

      const transformedRows = SystemUtilities.transformRowValuesToSingleRootNestedObject( rows,
                                                                                          [
                                                                                            SYSUserSessionPresence,
                                                                                            SYSUser
                                                                                          ],
                                                                                          [
                                                                                            "A",
                                                                                            "C"
                                                                                          ] );

      result = transformedRows;

      /*
      const convertedRows = [];

      for ( const currentRow of transformedRows ) {

        const tempModelData = await SYSUserGroup.convertFieldValues(
                                                                     {
                                                                       Data: currentRow,
                                                                       FilterFields: 1, //Force to remove fields like password and value
                                                                       TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                       Include: null,
                                                                       Logger: logger,
                                                                       ExtraInfo: {
                                                                                    Request: request
                                                                                  }
                                                                     }
                                                                   );
        if ( tempModelData ) {

          convertedRows.push( tempModelData );

        }
        else {

          convertedRows.push( currentRow );

        }

      }
      */

      /*
      if ( rows &&
           rows.length > 0 ) {

        result = rows;

      }
      * /

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getUserPresenceInRoomList.name;

      const strMark = "1C05D067A415" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
  */

}