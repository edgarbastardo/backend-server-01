import cluster from 'cluster';

import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,
import {
  //Router,
  Request,
  //Response,
  //NextFunction
} from 'express';

//import bcrypt from 'bcrypt';
//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

//import SystemConstants from "../../common/SystemContants";
import { ICheckUserGroupRoles } from '../../../common/SystemContants';
import CommonConstants from "../../../common/CommonConstants";

import CommonUtilities from "../../../common/CommonUtilities";
import SystemUtilities from "../../../common/SystemUtilities";

import DBConnectionManager from '../../../common/managers/DBConnectionManager';

import SYSUserGroupService from "../../../common/database/services/SYSUserGroupService";
import I18NManager from "../../../common/managers/I18Manager";
import { SYSUserGroup } from '../../../common/database/models/SYSUserGroup';

const debug = require( 'debug' )( 'UserGroupServiceController' );

export default class UserGroupServiceController {

  static readonly _ID = "UserGroupServiceController";

  static async getUserGroup( request: Request,
                             transaction: any,
                             logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //ANCHOR getUserGroup
      let userSessionStatus = context.UserSessionStatus;

      //

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

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getUserGroup.name;

      const strMark = "C047F9539EDF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

  static async getMessageUserGroup( strLanguage: string,
                                    by: {
                                          Id: string,
                                          ShortId: string,
                                          Name: string
                                        } ): Promise<string> {

    let strResult = "";

    if ( by.Name ) {

      strResult = await I18NManager.translate( strLanguage, 'The user group with name %s not exists', by.Name );

    }
    else if ( by.Id ) {

      strResult = await I18NManager.translate( strLanguage, 'The user group with id %s not exists', by.Id );

    }
    else if ( by.ShortId ) {

      strResult = await I18NManager.translate( strLanguage, 'The user group with short id %s not exists', by.ShortId );

    }

    return strResult;

  }

  static async createUserGroup( request: Request,
                                transaction: any,
                                logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //ANCHOR createUserGroup
      let userSessionStatus = context.UserSessionStatus;

      //

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

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createUserGroup.name;

      const strMark = "0733432C5BA1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

  static async updateUserGroup( request: Request,
                                transaction: any,
                                logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //ANCHOR updateUserGroup
      let userSessionStatus = context.UserSessionStatus;

      //

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

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.updateUserGroup.name;

      const strMark = "4FF35734443E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

  static async disableBulkUserGroup( request: Request,
                                     transaction: any,
                                     logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //ANCHOR updateUserGroup
      let userSessionStatus = context.UserSessionStatus;

      //

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

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.disableBulkUserGroup.name;

      const strMark = "AEAECBA9202F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

  static async enableBulkUserGroup( request: Request,
                                    transaction: any,
                                    logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //ANCHOR updateUserGroup
      let userSessionStatus = context.UserSessionStatus;

      //

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

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.enableBulkUserGroup.name;

      const strMark = "55F974E46609" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

  static checkUserGroupRoleLevel( userSessionStatus: any,
                                  sysUserGroup: { Id: string, ShortId: string, Name: string },
                                  strActionRole: string,
                                  logger: any ): ICheckUserGroupRoles {

    let result: ICheckUserGroupRoles = {
                                         isAuthorizedAdmin: false,
                                         isAuthorizedL01: false,
                                         isAuthorizedL03: false,
                                         isAuthorizedL04: false,
                                         isNotAuthorized: false
                                       };

    try {

      result.isAuthorizedAdmin = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Administrator#" ) ||
                                                          userSessionStatus.Role.includes( "#BManagerL99#" ): false;

      if ( result.isAuthorizedAdmin === false ) {

        result.isAuthorizedL04 = userSessionStatus.Role.includes( "#" + strActionRole + "L04#" );

        if ( result.isAuthorizedL04 === false ) {

          let roleSubTag = null;

          if ( strActionRole === "GetUserGroup" ||
               strActionRole === "SearchUserGroup" ||
               strActionRole === "SettingsUserGroup" ) {

            roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#MasterL03#" );

          }

          if ( !roleSubTag ||
                roleSubTag.length === 0 ) {

            roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#" + strActionRole + "L03#" ); // "#CreateUserL03#" );

          }

          result.isAuthorizedL03 = userSessionStatus.Role ? ( roleSubTag.includes( "#GName:" +  sysUserGroup.Name + "#" ) ||
                                                              roleSubTag.includes( "#GName:*#" ) ||
                                                              roleSubTag.includes( "#GId:" +  sysUserGroup.Id + "#" ) ||
                                                              roleSubTag.includes( "#GSId:" +  sysUserGroup.ShortId + "#" ) ) : false;

          if ( result.isAuthorizedL03 === false ) {

            if ( strActionRole === "GetUserGroup" ||
                 strActionRole === "SearchUserGroup" ||
                 strActionRole === "SettingsUserGroup" ) {

              result.isAuthorizedL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#MasterL01#" ) ||
                                                                userSessionStatus.Role.includes( "#" + strActionRole + "L01#" ): false;

              if ( result.isAuthorizedL01 &&
                  ( userSessionStatus.UserGroupName !== sysUserGroup.Name &&
                    userSessionStatus.UserGroupShortId !== sysUserGroup.ShortId &&
                    userSessionStatus.UserGroupId !== sysUserGroup.Id ) ) {

                //Uhathorized
                result.isNotAuthorized = true;

              }

            }

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkUserGroupRoleLevel.name;

      const strMark = "E1C0D723CB80" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteUserGroup( request: Request,
                                transaction: any,
                                logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //ANCHOR deleteUserGroup
      const userSessionStatus = context.UserSessionStatus;

      let sysUserGroupInDB = await SYSUserGroupService.getBy( {
                                                                Id: request.query.id,
                                                                ShortId: request.query.shortId,
                                                                Name: request.query.name
                                                              },
                                                              null,
                                                              currentTransaction,
                                                              logger );

      const resultCheckUserRoles = this.checkUserGroupRoleLevel( userSessionStatus,
                                                                 {
                                                                   Id: request.body.Id,
                                                                   ShortId: request.body.ShortId,
                                                                   Name: request.body.Name
                                                                 },
                                                                 "deleteUserGroup",
                                                                 logger );

      if ( !resultCheckUserRoles.isAuthorizedAdmin &&
           !resultCheckUserRoles.isAuthorizedL03 &&
           !resultCheckUserRoles.isAuthorizedL04 ) {

        resultCheckUserRoles.isNotAuthorized = true;

      }

      if ( resultCheckUserRoles.isNotAuthorized ) {

        result = {
                   StatusCode: 403, //Forbidden
                   Code: 'ERROR_CANNOT_DELETE_USER_GROUP',
                   Message: await I18NManager.translate( strLanguage, 'Not allowed to delete the user group' ),
                   Mark: '3E8140B91207' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_CANNOT_DELETE_USER_GROUP',
                               Message: await I18NManager.translate( strLanguage, 'Not allowed to delete the user group' ),
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( !sysUserGroupInDB ) {

        const strMessage = await this.getMessageUserGroup( strLanguage, {
                                                                          Id: request.body.Id,
                                                                          ShortId: request.body.ShortId,
                                                                          Name: request.body.Name
                                                                        } );

        result = {
                   StatusCode: 404, //Not found
                   Code: 'ERROR_USER_GROUP_NOT_FOUND',
                   Message: strMessage,
                   Mark: '58A44EA21984' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_GROUP_NOT_FOUND',
                               Message: strMessage,
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( sysUserGroupInDB instanceof Error ) {

        const error = sysUserGroupInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: 'ERROR_UNEXPECTED',
                   Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                   Mark: 'F82A2A732532' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
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

      }
      else if ( await SYSUserGroupService.countUsers( sysUserGroupInDB.Id,
                                                      currentTransaction,
                                                      logger ) > 0 ) {

        result = {
                   StatusCode: 400, //Bad Request
                   Code: 'ERROR_USER_GROUP_IS_NOT_USER_EMPTY',
                   Message: await I18NManager.translate( strLanguage, 'The user group have users assigned' ),
                   Mark: 'DF7B8DF79E5B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_GROUP_IS_NOT_USER_EMPTY',
                               Message: await I18NManager.translate( strLanguage, 'The user group have users assigned' ),
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else {

        const deleteResult = await SYSUserGroupService.deleteByModel( sysUserGroupInDB,
                                                                      currentTransaction,
                                                                      logger );

        if ( deleteResult instanceof Error ) {

          const error = deleteResult as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: 'ERROR_UNEXPECTED',
                     Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                     Mark: '75E23A0316B7' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
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


        }
        else if ( deleteResult === true ) {

          result = {
                     StatusCode: 200, //Ok
                     Code: 'SUCCESS_USER_GROUP_DELETE',
                     Message: await I18NManager.translate( strLanguage, 'Success user group %s deleted.', sysUserGroupInDB.Name ),
                     Mark: 'D39BA094555F' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

          bApplyTransaction = true;

        }
        else {

          result = {
                     StatusCode: 500, //Ok
                     Code: 'ERROR_USER_GROUP_DELETE',
                     Message: await I18NManager.translate( strLanguage, 'Error in user group delete.' ),
                     Mark: '5CF74478D0E9' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [
                               {
                                 Code: 'ERROR_METHOD_DELETE_RETURN_FALSE',
                                 Message: 'Method delete return false',
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }

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

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.deleteUserGroup.name;

      const strMark = "8AC6F5568561" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

  static async deleteBulkUserGroup( request: Request,
                                    transaction: any,
                                    logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //ANCHOR updateUserGroup
      let userSessionStatus = context.UserSessionStatus;

      //

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

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.deleteBulkUserGroup.name;

      const strMark = "621629BC6E22" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

  static async searchUserGroup( request: Request,
                                transaction: any,
                                logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const userSessionStatus = context.UserSessionStatus;

      const bIsAuthorizedAdmin = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Administrator#" ) ||
                                                          userSessionStatus.Role.includes( "#BManagerL99#" ) ||
                                                          userSessionStatus.Role.includes( "#SearchUserGroupL04#" ): false;

      let bIsAuthorizedL03 = false;
      let strWhereL03 = "";
      let bIsAuthorizedL01 = false;
      let strWhereL01 = "";

      if ( bIsAuthorizedAdmin === false ) {

        let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#MasterL03#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#SearchUserGroupL03#" );

        }

        if ( roleSubTag &&
             roleSubTag.length > 0 ) {

          bIsAuthorizedL03 = true;

          strWhereL03 = CommonUtilities.tranformTagListToWhere( roleSubTag, "A", "Or" );

        }

        bIsAuthorizedL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#MasterL01#" ) ||
                                                    userSessionStatus.Role.includes( "#SearchUserGroupL01#" ): false;

        if ( bIsAuthorizedL01 ) {

          strWhereL01 = " ( A.Id = '" + userSessionStatus.UserGroupId + "' )";

        }

      }

      const strSelectField = SystemUtilities.createSelectAliasFromModels(
                                                                          [
                                                                            SYSUserGroup
                                                                          ],
                                                                          [
                                                                            "A",
                                                                          ]
                                                                        );

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "searchUserGroup",
                                                     {
                                                       SelectFields: strSelectField,
                                                     },
                                                     logger );

      strSQL = request.query.where ? strSQL + "( " + request.query.where + " )" : strSQL + "( 1 )";

      if ( !bIsAuthorizedAdmin ) {

        let strBeforeParenthesis = " And ( ";

        if ( bIsAuthorizedL03 ) {

          strSQL = strSQL + strBeforeParenthesis + strWhereL03;

          strBeforeParenthesis = "";

        }

        if ( bIsAuthorizedL01 ) {

          if ( !strBeforeParenthesis ) {

            strSQL = strSQL + " Or " + strBeforeParenthesis + strWhereL01;

          }
          else {

            strSQL = strSQL + strBeforeParenthesis + strWhereL01;
            strBeforeParenthesis = "";

          }

        }

        if ( !strBeforeParenthesis ) {

          strSQL = strSQL + " )";

        }

      }

      strSQL = request.query.orderBy ? strSQL + " Order By " + request.query.orderBy: strSQL;

      let intLimit = 200;

      const warnings = [];

      if ( request.query.limit &&
           isNaN( request.query.limit ) === false &&
           parseInt( request.query.limit ) <= intLimit ) {

        intLimit = parseInt( request.query.limit );

      }
      else {

        warnings.push(
                       {
                         Code: 'WARNING_DATA_LIMITED_TO_MAX',
                         Message: await I18NManager.translate( strLanguage, 'Data limited to the maximun of %s rows', intLimit ),
                         Details: await I18NManager.translate( strLanguage, 'To protect to server and client of large result set of data, the default maximun rows is %s, you must use \'offset\' and \'limit\' query parameters to paginate large result set of data.', intLimit )
                       }
                     );

      }

      if ( !bIsAuthorizedAdmin ) {

        warnings.push(
                       {
                         Code: 'WARNING_DATA_RESTRICTED',
                         Message: await I18NManager.translate( strLanguage, 'It is possible that certain information is not shown due to limitations in their roles' ),
                         Details: {
                                    Role: userSessionStatus.Role
                                  }
                       }
                     );

      }

      strSQL = strSQL + " LIMIT " + intLimit.toString() + " OFFSET " + ( request.query.offset && !isNaN( request.query.offset ) ? request.query.offset : "0" );

      //ANCHOR dbConnection.query
      const rows = await dbConnection.query( strSQL, {
                                                       raw: true,
                                                       type: QueryTypes.SELECT,
                                                       transaction: currentTransaction
                                                     } );

      const transformedRows = SystemUtilities.transformRowValuesToSingleRootNestedObject( rows, [
                                                                                                  SYSUserGroup,
                                                                                                ],
                                                                                                [
                                                                                                  "A",
                                                                                                ] );

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

      result = {
                 StatusCode: 200, //Ok
                 Code: 'SUCCESS_SEARCH',
                 Message: await I18NManager.translate( strLanguage, 'Success search.' ),
                 Mark: '7C478BDFA8F8' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: false,
                 Errors: [],
                 Warnings: warnings,
                 Count: convertedRows.length,
                 Data: convertedRows
               }

      bApplyTransaction = true;

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

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.searchUserGroup.name;

      const strMark = "CF32E88EB366" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

  static async searchUserGroupCount( request: Request,
                                     transaction: any,
                                     logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const userSessionStatus = context.UserSessionStatus;

      const bIsAuthorizedAdmin = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Administrator#" ) ||
                                                          userSessionStatus.Role.includes( "#BManagerL99#" ) ||
                                                          userSessionStatus.Role.includes( "#SearchUserGroupL04#" ): false;

      let bIsAuthorizedL03 = false;
      let strWhereL03 = "";
      let bIsAuthorizedL01 = false;
      let strWhereL01 = "";

      if ( bIsAuthorizedAdmin === false ) {

        let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#MasterL03#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#SearchUserGroupL03#" );

        }

        if ( roleSubTag &&
             roleSubTag.length > 0 ) {

          bIsAuthorizedL03 = true;

          strWhereL03 = CommonUtilities.tranformTagListToWhere( roleSubTag, "A", "Or" );

        }

        bIsAuthorizedL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#MasterL01#" ) ||
                                                    userSessionStatus.Role.includes( "#SearchUserGroupL01#" ): false;

        if ( bIsAuthorizedL01 ) {

          strWhereL01 = " ( A.Id = '" + userSessionStatus.UserGroupId + "' )";

        }

      }

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "searchCountUserGroup",
                                                     {
                                                       //SelectFields: strSelectField,
                                                     },
                                                     logger );

      strSQL = request.query.where ? strSQL + "( " + request.query.where + " )" : strSQL + "( 1 )";

      if ( !bIsAuthorizedAdmin ) {

        let strBeforeParenthesis = " And ( ";

        if ( bIsAuthorizedL03 ) {

          strSQL = strSQL + strBeforeParenthesis + strWhereL03;

          strBeforeParenthesis = "";

        }

        if ( bIsAuthorizedL01 ) {

          if ( !strBeforeParenthesis ) {

            strSQL = strSQL + " Or " + strBeforeParenthesis + strWhereL01;

          }
          else {

            strSQL = strSQL + strBeforeParenthesis + strWhereL01;
            strBeforeParenthesis = "";

          }

        }

        if ( !strBeforeParenthesis ) {

          strSQL = strSQL + " )";

        }

      }

      const warnings = [];

      if ( !bIsAuthorizedAdmin ) {

        warnings.push(
                       {
                         Code: 'WARNING_DATA_RESTRICTED',
                         Message: await I18NManager.translate( strLanguage, 'It is possible that certain information is not counted due to limitations in their roles' ),
                         Details: {
                                    Role: userSessionStatus.Role
                                  }
                       }
                     );

      }

      const rows = await dbConnection.query( strSQL, {
                                                       raw: true,
                                                       type: QueryTypes.SELECT,
                                                       transaction: currentTransaction
                                                     } );

      result = {
                 StatusCode: 200, //Ok
                 Code: 'SUCCESS_SEARCH_COUNT',
                 Message: await I18NManager.translate( strLanguage, 'Success search count.' ),
                 Mark: '660DFC71AA33' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: false,
                 Errors: [],
                 Warnings: warnings,
                 Count: 1,
                 Data: [
                         {
                           Count: rows.length > 0 ? rows[ 0 ].Count: 0
                         }
                       ]
               }

      bApplyTransaction = true;

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

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.searchUserGroupCount.name;

      const strMark = "843C1B2A7963" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

  static async getSettings( request: Request,
                            transaction: any,
                            logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //ANCHOR updateUserGroup
      let userSessionStatus = context.UserSessionStatus;

      //

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

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getSettings.name;

      const strMark = "3F54F1AD829E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

  static async setSettings( request: Request,
                            transaction: any,
                            logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //ANCHOR updateUserGroup
      let userSessionStatus = context.UserSessionStatus;

      //

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

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.setSettings.name;

      const strMark = "CF8E4986C5AA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

  /*
  static async setSettings( request: Request,
                            transaction: any,
                            logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //ANCHOR updateUserGroup
      let userSessionStatus = context.UserSessionStatus;

      //

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

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.setSettings.name;

      const strMark = "EF05E51DA6CB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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
