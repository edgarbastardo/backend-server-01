import cluster from 'cluster';

//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,
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

import CommonUtilities from "../../common/CommonUtilities";
import SystemUtilities from "../../common/SystemUtilities";

//import { Role } from "../models/Role";
//import { User } from "../../common/database/models/User";
//import { UserSessionStatus } from "../models/UserSessionStatus";
//import { UserGroup } from "../../common/database/models/UserGroup";
//import { Person } from "../../common/database/models/Person";
//import UserSessionStatusService from "../../common/database/services/UserSessionStatusService";
//import CacheManager from "../../common/managers/CacheManager";
//import { PasswordParameters } from "./SecurityService.controller";
//import { UserSignup } from "../../common/database/models/UserSignup";
//import { UserSessionStatus } from "../../common/database/models/UserSessionStatus";
import DBConnectionManager from '../../common/managers/DBConnectionManager';
//import SYSConfigValueDataService from "../../common/database/services/SYSConfigValueDataService";
//import SYSUserService from "../../common/database/services/SYSUserService";
import CommonConstants from "../../common/CommonConstants";
//import SecurityServiceController from "./SecurityService.controller";
import SYSUserGroupService from "../../common/database/services/SYSUserGroupService";
//import NotificationManager from "../../common/managers/NotificationManager";
//import SYSUserSignupService from "../../common/database/services/SYSUserSignupService";
//import CipherManager from "../../common/managers/CipherManager";
//import SYSPersonService from "../../common/database/services/SYSPersonService";
import I18NManager from "../../common/managers/I18Manager";
//import SYSActionTokenService from "../../common/database/services/SYSActionTokenService";
//import JobQueueManager from "../../common/managers/JobQueueManager";
//import SYSUserSessionStatusService from '../../common/database/services/SYSUserSessionStatusService';
//import GeoMapGoogle from "../../common/implementations/geomaps/GeoMapGoogle";
//import GeoMapManager from "../../common/managers/GeoMapManager";
//import { SYSUser } from "../../common/database/models/SYSUser";
//import { ModelToRestAPIServiceController } from './ModelToRestAPIService.controller';
//import { SYSPerson } from '../../common/database/models/SYSPerson';
//import { SYSUserGroup } from "../../common/database/models/SYSUserGroup";

const debug = require( 'debug' )( 'UserGroupServiceController' );

export interface ICheckUserGroupRoles {

  isAuthorizedAdmin: boolean,
  //isAuthorizedL01: boolean,
  //isAuthorizedL02: boolean,
  isAuthorizedL03: boolean,
  isNotAuthorized: boolean

}

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

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //ANCHOR getUserGroup
      let userSessionStatus = context.UserSessionStatus;

      //

      if ( currentTransaction != null &&
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

      if ( currentTransaction != null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( ex ) {


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

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //ANCHOR createUserGroup
      let userSessionStatus = context.UserSessionStatus;

      //

      if ( currentTransaction != null &&
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

      if ( currentTransaction != null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( ex ) {


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

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //ANCHOR updateUserGroup
      let userSessionStatus = context.UserSessionStatus;

      //

      if ( currentTransaction != null &&
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

      if ( currentTransaction != null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( ex ) {


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
                                    isAuthorizedL03: false,
                                    //isAuthorizedL02: false,
                                    //isAuthorizedL01: false,
                                    isNotAuthorized: false
                                  };

    try {

      result.isAuthorizedAdmin = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Administrator#" ) ||
                                                          userSessionStatus.Role.includes( "#BManagerL99#" ): false;

      if ( result.isAuthorizedAdmin === false ) {

        let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#" + strActionRole + "L03#" ); // "#CreateUserL03#" );

        result.isAuthorizedL03 = userSessionStatus.Role ? ( roleSubTag.includes( "#Name:" +  sysUserGroup.Name + "#" ) ||
                                                            roleSubTag.includes( "#Name:*#" ) ||
                                                            roleSubTag.includes( "#Id:" +  sysUserGroup.Id + "#" ) ||
                                                            roleSubTag.includes( "#SId:" +  sysUserGroup.ShortId + "#" ) ) : false;

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

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //ANCHOR deleteUserGroup
      const userSessionStatus = context.UserSessionStatus;

      let sysUserGroupInDB = await SYSUserGroupService.getBy( {
                                                                Id: request.body.Id,
                                                                ShortId: request.body.ShortId,
                                                                Name: request.body.Name
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
            !resultCheckUserRoles.isAuthorizedL03 ) {

        resultCheckUserRoles.isNotAuthorized = true;

      }

      if ( resultCheckUserRoles.isNotAuthorized ) {

        result = {
                   StatusCode: 403, //Forbidden
                   Code: 'ERROR_CANNOT_DELETE_THE_INFORMATION',
                   Message: await I18NManager.translate( strLanguage, 'Not allowed to delete the information' ),
                   Mark: '3E8140B91207' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_CANNOT_DELETE_THE_INFORMATION',
                               Message: await I18NManager.translate( strLanguage, 'Not allowed to delete the information' ),
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

      if ( currentTransaction != null &&
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

      if ( currentTransaction != null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( ex ) {


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

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //ANCHOR searchUserGroup
      let userSessionStatus = context.UserSessionStatus;

      //

      if ( currentTransaction != null &&
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

      const strMark = "F0940A4AA57E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction != null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( ex ) {


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

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //ANCHOR searchUserGroupCount
      let userSessionStatus = context.UserSessionStatus;

      //

      if ( currentTransaction != null &&
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

      if ( currentTransaction != null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( ex ) {


        }

      }

    }

    return result;

  }

}
