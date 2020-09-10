import cluster from "cluster";

import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,
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

//import SystemConstants from "../../common/SystemContants";
import SystemConstants, { ICheckUserGroupRoles } from "../../../common/SystemContants";
import CommonConstants from "../../../common/CommonConstants";

import CommonUtilities from "../../../common/CommonUtilities";
import SystemUtilities from "../../../common/SystemUtilities";

import DBConnectionManager from "../../../common/managers/DBConnectionManager";
import I18NManager from "../../../common/managers/I18Manager";

import SYSUserGroupService from "../../../common/database/master/services/SYSUserGroupService";
import SYSConfigValueDataService from "../../../common/database/master/services/SYSConfigValueDataService";

import { SYSUserGroup } from "../../../common/database/master/models/SYSUserGroup";

const debug = require( "debug" )( "UserGroupServiceController" );

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

      let userSessionStatus = context.UserSessionStatus;

      //ANCHOR getUserGroup
      let sysUserGroupInDB = await SYSUserGroupService.getBy( {
                                                                Id: request.query.id as string,
                                                                ShortId: request.query.shortId as string,
                                                                Name: request.query.name as string
                                                              },
                                                              null,
                                                              currentTransaction,
                                                              logger );

      const resultCheckUserRoles = this.checkUserGroupRoleLevel( userSessionStatus,
                                                                 sysUserGroupInDB,
                                                                 "GetUserGroup",
                                                                 logger );

      if ( !resultCheckUserRoles.isAuthorizedAdmin &&
           !resultCheckUserRoles.isAuthorizedL04 &&
           !resultCheckUserRoles.isAuthorizedL03 &&
           !resultCheckUserRoles.isAuthorizedL01 ) {

        resultCheckUserRoles.isNotAuthorized = true;

      }

      if ( resultCheckUserRoles.isNotAuthorized ) {

        result = {
                   StatusCode: 403, //Forbidden
                   Code: "ERROR_CANNOT_GET_USER_GROUP",
                   Message: await I18NManager.translate( strLanguage, "Not allowed to get the user group information" ),
                   Mark: "5A30D29E0DB5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_CANNOT_GET_USER_GROUP",
                               Message: await I18NManager.translate( strLanguage, "Not allowed to get the user group information" ),
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( !sysUserGroupInDB ) {

        const strMessage = await this.getMessageUserGroup(
                                                           strLanguage,
                                                           {
                                                             Id: request.query.id as string,
                                                             ShortId: request.query.shortId as string,
                                                             Name: request.query.name as string
                                                           }
                                                         );

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_USER_GROUP_NOT_FOUND",
                   Message: strMessage,
                   Mark: "5A30D29E0DB5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_USER_GROUP_NOT_FOUND",
                               Message: strMessage,
                               Details: null,
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
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "4C083EAC0B54" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
      else {

        let modelData = ( sysUserGroupInDB as any ).dataValues;

        const tempModelData = await SYSUserGroup.convertFieldValues(
                                                                     {
                                                                       Data: modelData,
                                                                       FilterFields: 1, //Force to remove fields like password and value
                                                                       TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                       Include: null, //[ { model: SYSUser } ],
                                                                       Exclude: null, //[ { model: SYSUser } ],
                                                                       Logger: logger,
                                                                       ExtraInfo: {
                                                                                    Request: request
                                                                                  }
                                                                     }
                                                                   );

        if ( tempModelData ) {

          modelData = tempModelData;

        }

        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_GET_USER_GROUP",
                   Message: await I18NManager.translate( strLanguage, "Success get the user group information." ),
                   Mark: "0A7F78304087" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: 1,
                   Data: [
                           modelData
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

      strResult = await I18NManager.translate( strLanguage, "The user group with name %s not found", by.Name );

    }
    else if ( by.Id ) {

      strResult = await I18NManager.translate( strLanguage, "The user group with id %s not found", by.Id );

    }
    else if ( by.ShortId ) {

      strResult = await I18NManager.translate( strLanguage, "The user group with short id %s not found", by.ShortId );

    }

    return strResult;

  }

  static getConfigAutoAssignRoleSection( strOperation: string,
                                         strRole: string,
                                         strUserGroupName: string,
                                         jsonConfigValue: any ): string {

    let strResult = "";

    try {

      if ( jsonConfigValue ) {

        if ( jsonConfigValue[ strOperation ] ) {

          jsonConfigValue = jsonConfigValue[ strOperation ];

          if ( jsonConfigValue ) {

            const subTag = strRole.split( "+" );

            if ( jsonConfigValue[ subTag[ 0 ] ] ) {

              jsonConfigValue = jsonConfigValue[ subTag[ 0 ] ];

              if ( jsonConfigValue ) {

                if ( jsonConfigValue[ strUserGroupName ] ) {

                  strResult = jsonConfigValue[ strUserGroupName ];

                }
                else if ( jsonConfigValue[ "@__default__@" ] ) {

                  strResult = jsonConfigValue[ "@__default__@" ];

                }

              }

            }
            else if ( jsonConfigValue[ "@__default__@" ] ) {

              jsonConfigValue = jsonConfigValue[ "@__default__@" ];

              if ( jsonConfigValue ) {

                if ( jsonConfigValue[ strUserGroupName ] ) {

                  strResult = jsonConfigValue[ strUserGroupName ];

                }
                else if ( jsonConfigValue[ "@__default__@" ] ) {

                  strResult = jsonConfigValue[ "@__default__@" ];

                }

              }

            }

          }

        }

      }

    }
    catch ( error ) {

      //

    }

    return strResult;

  }

  static async getConfigUserGroupAutoAssignRole( strOperation: string,
                                                 strRoles: string,
                                                 strUserGroupName: string,
                                                 transaction: any,
                                                 logger: any ): Promise<string> {

    let strResult = null;

    try {

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_UserGroupAutoRoleAssign.Id,
                                                                             SystemConstants._CONFIG_ENTRY_UserGroupAutoRoleAssign.Owner,
                                                                             transaction,
                                                                             logger );

      const roleList = strRoles.split( "," );

      let jsonConfigValue = null;
      let jsonConfigDefaultValue = null;

      if ( configData.Value ) {

        jsonConfigValue = CommonUtilities.parseJSON( configData.Value,
                                                     logger );

      }

      if ( configData.Default ) {

        jsonConfigDefaultValue = CommonUtilities.parseJSON( configData.Default,
                                                            logger );

      }

      for ( let intCurrentRole = 0; intCurrentRole < roleList.length; intCurrentRole++ ) {

        const strRole = roleList[ intCurrentRole ];

        let strRoleToAutoAssign = this.getConfigAutoAssignRoleSection( strOperation,
                                                                       strRole,
                                                                       strUserGroupName,
                                                                       jsonConfigValue );

        if ( !strRoleToAutoAssign ) {

          strRoleToAutoAssign = this.getConfigAutoAssignRoleSection( strOperation,
                                                                     strRole,
                                                                     strUserGroupName,
                                                                     jsonConfigDefaultValue );

        }

        if ( strRoleToAutoAssign ) {

          if ( !strResult ) {

            strResult = strRoleToAutoAssign;

          }
          else {

            strResult = strResult + "," + strRoleToAutoAssign;

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigUserGroupAutoAssignRole.name;

      const strMark = "C5FB6039FDEC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    strResult = CommonUtilities.removeTag( strResult, "#Administrator#" );
    strResult = CommonUtilities.removeTag( strResult, "#BManager_L99#" );

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

      let userSessionStatus = context.UserSessionStatus;

      let resultCheckUserGroupRoles = null;

      let sysUserGroupInDB: SYSUserGroup = null;

      let userRules = {
                        Name: [ "required", "min:3", "regex:/^[a-zA-Z0-9\#\@\.\_\-]+$/g" ],
                        ExpireAt: [ "present", "date" ],
                        Business: [ "present" ],
                      };

      let validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                 userRules,
                                                                 null,
                                                                 logger );

      if ( validator.passes() ) { //Validate request.body field values

        delete request.body.CreatedBy;
        delete request.body.CreatedAt;
        delete request.body.UpdatedBy;
        delete request.body.UpdatedAt;
        delete request.body.ExtraData;

        if ( request.body.DisabledBy !== "0" &&
             request.body.DisabledBy !== "1" ) {

          delete request.body.DisabledBy;

        }

        delete request.body.DisabledAt;
        delete request.body.ExtraData;

        sysUserGroupInDB = await SYSUserGroupService.getByName( request.body.Name,
                                                                null,
                                                                currentTransaction,
                                                                logger );

        if ( !sysUserGroupInDB ) {

          resultCheckUserGroupRoles = this.checkUserGroupRoleLevel( userSessionStatus,
                                                                    {
                                                                      Id: request.body.Id,
                                                                      ShortId: request.body.ShortId,
                                                                      Name: request.body.Name
                                                                    },
                                                                    "CreateUserGroup",
                                                                    logger );

          if ( !resultCheckUserGroupRoles.isAuthorizedAdmin &&
               !resultCheckUserGroupRoles.isAuthorizedL04 &&
               !resultCheckUserGroupRoles.isAuthorizedL03 &&
               !resultCheckUserGroupRoles.isAuthorizedL01 ) {

            resultCheckUserGroupRoles.isNotAuthorized = true;

          }

          if ( resultCheckUserGroupRoles.isNotAuthorized ) {

            result = {
                       StatusCode: 403, //Forbidden
                       Code: "ERROR_CANNOT_CREATE_USER_GROUP",
                       Message: await I18NManager.translate( strLanguage, "Not allowed to create the user group" ),
                       Mark: "547980753A97" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_CANNOT_CREATE_USER_GROUP",
                                   Message: await I18NManager.translate( strLanguage, "Not allowed to create the user group" ),
                                   Details: null,
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else {

            const strUserName = context.UserSessionStatus.UserName;

            let strRoleToApply = await this.getConfigUserGroupAutoAssignRole( "create",
                                                                              userSessionStatus.Role,
                                                                              request.body.Name,
                                                                              currentTransaction,
                                                                              logger );

            if ( resultCheckUserGroupRoles.isAuthorizedAdmin &&
                 request.body.Role ) {

              strRoleToApply = SystemUtilities.mergeTokens( request.body.Role,
                                                            strRoleToApply,
                                                            true,
                                                            logger );

            }

            sysUserGroupInDB = await SYSUserGroupService.createOrUpdate(
                                                                         {
                                                                           Name: request.body.Name,
                                                                           Comment: request.body.Comment,
                                                                           ExpireAt: request.body.ExpireAt ? SystemUtilities.getCurrentDateAndTimeFrom( request.body.ExpireAt ).format(): null,
                                                                           Role: strRoleToApply ? strRoleToApply : null, //resultCheckUserRoles.isAuthorizedAdmin && request.body.Role !== undefined ? request.body.Role: null,
                                                                           Tag: resultCheckUserGroupRoles.isAuthorizedAdmin && request.body.Tag ? request.body.Tag: null,
                                                                           ExtraData: request.body.Business ? CommonUtilities.jsonToString( { Business: request.body.Business }, logger ): null,
                                                                           CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                           CreatedAt: null
                                                                         },
                                                                         false,
                                                                         currentTransaction,
                                                                         logger
                                                                       );

            if ( sysUserGroupInDB instanceof Error ) {

              const error = sysUserGroupInDB;

              result = {
                         StatusCode: 500, //Internal server error
                         Code: "ERROR_UNEXPECTED",
                         Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                         Mark: "70055D82C74F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
            else {

              let modelData = ( sysUserGroupInDB as any ).dataValues;

              const tempModelData = await SYSUserGroup.convertFieldValues(
                                                                           {
                                                                             Data: modelData,
                                                                             FilterFields: 1, //Force to remove fields like password and value
                                                                             TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                             Include: null, //[ { model: SYSUser } ],
                                                                             Exclude: null, //[ { model: SYSUser } ],
                                                                             Logger: logger,
                                                                             ExtraInfo: {
                                                                                          Request: request
                                                                                        }
                                                                           }
                                                                         );

              if ( tempModelData ) {

                modelData = tempModelData;

              }

              //ANCHOR success user create
              result = {
                         StatusCode: 200, //Ok
                         Code: "SUCCESS_USER_GROUP_CREATE",
                         Message: await I18NManager.translate( strLanguage, "Success user group create." ),
                         Mark: "E557D1EF4D99" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: false,
                         Errors: [],
                         Warnings: [],
                         Count: 1,
                         Data: [
                                 modelData
                               ]
                       }

              bApplyTransaction = true;

            }

          }

        }
        else if ( sysUserGroupInDB instanceof Error ) {

          const error = sysUserGroupInDB as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "FB0C5D59650D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
        else {

          result = {
                     StatusCode: 400, //Bad request
                     Code: "ERROR_USER_GROUP_NAME_ALREADY_EXISTS",
                     Message: await I18NManager.translate( strLanguage, "The user group name %s already exists.", request.body.Name ),
                     Mark: "7F177E2096F1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_USER_GROUP_NAME_ALREADY_EXISTS",
                                 Message: await I18NManager.translate( strLanguage, "The user group name %s already exists.", request.body.Name ),
                                 Details: validator.errors.all()
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                   Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                   Mark: "7FF89F88B764" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                               Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                               Details: validator.errors.all()
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
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

  static checkUsersEqualsRoleLevel( sysUserGroupInDB: SYSUserGroup,
                                    userSessionStatus: any,
                                    logger: any ): boolean {

    let bResult = false;

    try {

      //const sysUserRole = sysUserInDB.Role ? sysUserInDB.Role.split( "," ): [];
      const sysUserGroupRole = sysUserGroupInDB.Role ? sysUserGroupInDB.Role.split( "," ): [];

      if ( sysUserGroupRole.includes( "#Administrator#" ) ||
           sysUserGroupRole.includes( "#BManager_L99#" ) ) {

        //The user to check is administrator
        bResult = userSessionStatus.Role.includes( "#Administrator#" ) ||
                  userSessionStatus.Role.includes( "#BManager_L99#" ); //Check the current user session is administrator too

      }
      else { //The user is not administrator

        bResult = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkUsersEqualsRoleLevel.name;

      const strMark = "535DC264210D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      let resultCheckUserRoles = null;

      let sysUserGroupInDB: SYSUserGroup = null;

      let userRules = {
                        Id: [ "required", "string", "min:36" ],
                        ShortId: [ "present", "string", "min:8" ],
                        Name: [ "required", "min:3", "regex:/^[a-zA-Z0-9\#\@\.\_\-]+$/g" ],
                        ExpireAt: [ "present", "date" ],
                        Business: [ "present" ],
                      };

      const validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                   userRules,
                                                                   null,
                                                                   logger );

      if ( validator.passes() ) { //Validate request.body field values

        delete request.body.CreatedBy;
        delete request.body.CreatedAt;
        delete request.body.UpdatedBy;
        delete request.body.UpdatedAt;

        if ( request.body.DisabledBy !== "0" &&
             request.body.DisabledBy !== "1" ) {

          delete request.body.DisabledBy;

        }

        delete request.body.DisabledAt;
        delete request.body.ExtraData;

        sysUserGroupInDB = await SYSUserGroupService.getBy(
                                                            {
                                                              Id: request.body.Id,
                                                              ShortId: request.body.ShortId,
                                                              Name: request.body.Name
                                                            },
                                                            null,
                                                            currentTransaction,
                                                            logger
                                                          );

        //ANCHOR checkUserRoleLevel
        resultCheckUserRoles = this.checkUserGroupRoleLevel( userSessionStatus,
                                                             sysUserGroupInDB,
                                                             "UpdateUserGroup",
                                                             logger );

        if ( !resultCheckUserRoles.isAuthorizedAdmin &&
             !resultCheckUserRoles.isAuthorizedL04 &&
             !resultCheckUserRoles.isAuthorizedL03 ) {

          resultCheckUserRoles.isNotAuthorized = true;

        }

        if ( resultCheckUserRoles.isNotAuthorized ) {

          result = {
                     StatusCode: 403, //Forbidden
                     Code: "ERROR_CANNOT_UPDATE_USER_GROUP",
                     Message: await I18NManager.translate( strLanguage, "Not allowed to update the user group" ),
                     Mark: "1331F50D4BEB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_CANNOT_UPDATE_USER_GROUP",
                                 Message: await I18NManager.translate( strLanguage, "Not allowed to update the user group" ),
                                 Details: null,
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else if ( !sysUserGroupInDB ) {

          const strMessage = await this.getMessageUserGroup(
                                                             strLanguage,
                                                             {
                                                               Id: request.body.Id,
                                                               ShortId: request.body.ShortId,
                                                               Name: request.body.Name
                                                             }
                                                           );

          result = {
                     StatusCode: 404, //Not found
                     Code: "ERROR_USER_GROUP_NOT_FOUND",
                     Message: strMessage,
                     Mark: "6BAEBBAF4ADB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_USER_GROUP_NOT_FOUND",
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
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "685C3CF8A9A6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
        else if ( sysUserGroupInDB.Id === userSessionStatus.UserGroupId ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: "ERROR_USER_GROUP_NOT_VALID",
                     Message: await I18NManager.translate( strLanguage, "The user group to update cannot be your user group." ),
                     Mark: "823DBA64229F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_USER_GROUP_NOT_VALID",
                                 Message: await I18NManager.translate( strLanguage, "The user group to update cannot be your user group." ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else if ( await SYSUserGroupService.getNameIsFree( request.body.Id,
                                                           request.body.Name,
                                                           null,
                                                           currentTransaction,
                                                           logger ) !== null ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: "ERROR_USER_GROUP_NAME_ALREADY_EXISTS",
                     Message: await I18NManager.translate( strLanguage, "The user group name %s already exists.", request.body.Name ),
                     Mark: "24091CE72346" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_USER_GROUP_NAME_ALREADY_EXISTS",
                                 Message: await I18NManager.translate( strLanguage, "The user group name %s already exists.", request.body.Name ),
                                 Details: validator.errors.all()
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else if ( this.checkUsersEqualsRoleLevel( sysUserGroupInDB,
                                                  userSessionStatus,
                                                  logger ) === false ) {

          result = {
                     StatusCode: 403, //Forbidden
                     Code: "ERROR_CANNOT_UPDATE_USER_GROUP",
                     Message: await I18NManager.translate( strLanguage, "Not allowed to update the user group. The user group has #Administrator# role, but you not had." ),
                     Mark: "8CD2C6F786E7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_CANNOT_UPDATE_USER_GROUP",
                                 Message: await I18NManager.translate( strLanguage, "Not allowed to update the user group. The user group has #Administrator# role, but you not had." ),
                                 Details: null,
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else {

          const strUserName = context.UserSessionStatus.UserName;

          let strRoleToApply = await this.getConfigUserGroupAutoAssignRole( "update",
                                                                            userSessionStatus.Role,
                                                                            sysUserGroupInDB.Name,
                                                                            currentTransaction,
                                                                            logger );

          if ( resultCheckUserRoles.isAuthorizedAdmin &&
               request.body.Role !== undefined ) {

            strRoleToApply = SystemUtilities.mergeTokens( request.body.Role,
                                                          strRoleToApply,
                                                          true,
                                                          logger );

          }
          else if ( sysUserGroupInDB.Role ) {

            strRoleToApply = SystemUtilities.mergeTokens( sysUserGroupInDB.Role,
                                                          strRoleToApply,
                                                          true,
                                                          logger );

          }

          sysUserGroupInDB.Name = request.body.Name &&
                                  ( resultCheckUserRoles.isAuthorizedAdmin ||
                                    this.checkNameAuthorized( userSessionStatus.Role,
                                                              request.body.Name,
                                                              "UpdateUserGroup" ) ) ?
                                  request.body.Name: sysUserGroupInDB.Name;
          sysUserGroupInDB.Role = strRoleToApply ? strRoleToApply: null;
          sysUserGroupInDB.Tag = resultCheckUserRoles.isAuthorizedAdmin && request.body.Tag !== undefined ? request.body.Tag: sysUserGroupInDB.Tag;
          sysUserGroupInDB.ExpireAt = request.body.ExpireAt ? SystemUtilities.getCurrentDateAndTimeFrom( request.body.ExpireAt ).format(): sysUserGroupInDB.ExpireAt;
          sysUserGroupInDB.Comment = request.body.Comment !== undefined ? request.body.Comment : sysUserGroupInDB.Comment;
          sysUserGroupInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
          sysUserGroupInDB.UpdatedAt = null;
          sysUserGroupInDB.DisabledBy = request.body.DisabledBy === "1"? "1@" + strUserName: "0";

          if ( request.body.Business ) {

            const extraData = CommonUtilities.parseJSON( sysUserGroupInDB.ExtraData, logger );

            if ( extraData ) {

              extraData.Business = { ...request.body.Business };

              sysUserGroupInDB.ExtraData = CommonUtilities.jsonToString( extraData, logger );

            }

          }

          sysUserGroupInDB = await SYSUserGroupService.createOrUpdate(
                                                                       ( sysUserGroupInDB as any ).dataValues,
                                                                       true,
                                                                       currentTransaction,
                                                                       logger
                                                                     );

          if ( sysUserGroupInDB instanceof Error ) {

            const error = sysUserGroupInDB;

            result = {
                       StatusCode: 500, //Internal server error
                       Code: "ERROR_UNEXPECTED",
                       Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                       Mark: "D1F138C94222" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
          else {

            let modelData = ( sysUserGroupInDB as any ).dataValues;

            const tempModelData = await SYSUserGroup.convertFieldValues(
                                                                         {
                                                                           Data: modelData,
                                                                           FilterFields: 1, //Force to remove fields like password and value
                                                                           TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                           Include: null, //[ { model: SYSUser } ],
                                                                           Exclude: null, //[ { model: SYSUser } ],
                                                                           Logger: logger,
                                                                           ExtraInfo: {
                                                                                        Request: request
                                                                                      }
                                                                         }
                                                                       );

            if ( tempModelData ) {

              modelData = tempModelData;

            }

            //ANCHOR success user update
            result = {
                       StatusCode: 200, //Ok
                       Code: "SUCCESS_USER_GROUP_UPDATE",
                       Message: await I18NManager.translate( strLanguage, "Success user group update." ),
                       Mark: "8F44F8676883" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: false,
                       Errors: [],
                       Warnings: [],
                       Count: 1,
                       Data: [
                               modelData
                             ]
                     }

            bApplyTransaction = true;

          }

        }

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                   Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                   Mark: "7968E1B166AB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                               Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                               Details: validator.errors.all()
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
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

  static async bulkUserGroupOperation( strBulkOperation: string,
                                       request: Request,
                                       transaction: any,
                                       logger: any ): Promise<any> {

    let result: any = {
                        data:[],
                        errors:[],
                        warnings: []
                      };

    let strLanguage = null;

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const bulkData = request.body.bulk;

      const userSessionStatus = context.UserSessionStatus;

      for ( let intIndex= 0; intIndex < bulkData.length; intIndex++ ) {

        const bulkUserData = bulkData[ intIndex ];

        try {

          let sysUserGroupInDB = await SYSUserGroupService.getBy(
                                                                  {
                                                                    Id: bulkUserData.Id,
                                                                    ShortId: bulkUserData.ShortId,
                                                                    Name: bulkUserData.Name
                                                                  },
                                                                  null,
                                                                  transaction,
                                                                  logger
                                                                );

          if ( !sysUserGroupInDB ) {

            const strMessage = await this.getMessageUserGroup(
                                                               strLanguage,
                                                               {
                                                                 Id: bulkUserData.Id,
                                                                 ShortId: bulkUserData.ShortId,
                                                                 Name: bulkUserData.Name
                                                               }
                                                             );

            result.errors.push (
                                 {
                                   Id: bulkUserData.Id,
                                   ShortId: bulkUserData.ShortId,
                                   Name: bulkUserData.Name,
                                   Code: "ERROR_USER_GROUP_NOT_FOUND",
                                   Mark: "FB72EC2E1F34" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   Message: strMessage,
                                   Details: null,
                                 }
                               );

          }
          else if ( sysUserGroupInDB instanceof Error ) {

            const error = sysUserGroupInDB as any;

            result.errors.push (
                                 {
                                   Id: bulkUserData.Id,
                                   ShortId: bulkUserData.ShortId,
                                   Name: bulkUserData.Name,
                                   Code: error.name,
                                   Mark: "ADC6F3D48555" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   Message: error.message,
                                   Details: await SystemUtilities.processErrorDetails( error ) //error
                                 }
                               );

          }
          else if ( sysUserGroupInDB.Id === userSessionStatus.UserGroupId ) {

            let strMessage = "";

            if ( strBulkOperation === "deleteUserGroup" ) {

              strMessage = await I18NManager.translate( strLanguage, "The user group to delete cannot be your user group." );

            }
            else {

              strMessage = await I18NManager.translate( strLanguage, "The user group to update cannot be your user group." );

            }

            result.errors.push(
                                {
                                  Id: sysUserGroupInDB.Id,
                                  ShortId: sysUserGroupInDB.ShortId,
                                  Name: sysUserGroupInDB.Name,
                                  Code: "ERROR_USER_GROUP_NOT_VALID",
                                  Mark: "57BF4E4741A1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                  Message: strMessage,
                                  Details: null
                                }
                              );

          }
          else if ( this.checkUsersEqualsRoleLevel( sysUserGroupInDB,
                                                    userSessionStatus, //Current user
                                                    logger ) === false ) {

            let strCode = "";
            let strMessage = "";

            if ( strBulkOperation === "deleteUser" ) {

              strCode = "ERROR_CANNOT_DELETE_USER_GROUP";
              strMessage = await I18NManager.translate( strLanguage, "Not allowed to delete the user group. The user has #Administrator# role, but you NOT has." );

            }
            else {

              strCode = "ERROR_CANNOT_UPDATE_USER_GROUP";
              strMessage = await I18NManager.translate( strLanguage, "Not allowed to update the user group. The user has #Administrator# role, but you NOT has." );

            }

            result.errors.push(
                                {
                                  Id: sysUserGroupInDB.Id,
                                  ShortId: sysUserGroupInDB.ShortId,
                                  Name: sysUserGroupInDB.Name,
                                  Code: strCode,
                                  Message: strMessage,
                                  Mark: "55456312E9BD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                  Details: null,
                                }
                              );

          }
          else {

            //ANCHOR checkUserRoleLevel
            let resultCheckUserGroupRoles = this.checkUserGroupRoleLevel( userSessionStatus,
                                                                          sysUserGroupInDB,
                                                                          strBulkOperation === "deleteUserGroup" ? "DeleteUserGroup": "UpdateUserGroup",
                                                                          logger );

            if ( !resultCheckUserGroupRoles.isAuthorizedAdmin &&
                 !resultCheckUserGroupRoles.isAuthorizedL04 &&
                 !resultCheckUserGroupRoles.isAuthorizedL03 ) {

              resultCheckUserGroupRoles.isNotAuthorized = true;

            }

            if ( resultCheckUserGroupRoles.isNotAuthorized ) {

              if ( strBulkOperation === "deleteUser" ) {

                result.errors.push(
                                    {
                                      Id: sysUserGroupInDB.Id,
                                      ShortId: sysUserGroupInDB.ShortId,
                                      Name: sysUserGroupInDB.Name,
                                      Code: "ERROR_CANNOT_DELETE_USER_GROUP",
                                      Mark: "FA514C304D8C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                      Message: await I18NManager.translate( strLanguage, "Not allowed to delete the user group" ),
                                      Details: null
                                    }
                                  );

              }
              else {

                result.errors.push(
                                    {
                                      Id: sysUserGroupInDB.Id,
                                      ShortId: sysUserGroupInDB.ShortId,
                                      Name: sysUserGroupInDB.Name,
                                      Code: "ERROR_CANNOT_UPDATE_USER_GROUP",
                                      Mark: "ED1C0AAB4ADE" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                      Message: await I18NManager.translate( strLanguage, "Not allowed to update the user group" ),
                                      Details: null
                                    }
                                  );

              }

            }
            else if ( strBulkOperation === "deleteUserGroup" ) {

              const deleteResult = await SYSUserGroupService.deleteByModel( sysUserGroupInDB,
                                                                            transaction,
                                                                            logger );

              if ( deleteResult instanceof Error ) {

                const error = deleteResult as Error;

                result.errors.push(
                                    {
                                      Id: sysUserGroupInDB.Id,
                                      ShortId: sysUserGroupInDB.ShortId,
                                      Name: sysUserGroupInDB.Name,
                                      Code: "ERROR_UNEXPECTED",
                                      Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                                      Mark: "809FD855B3CB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                      Details: await SystemUtilities.processErrorDetails( error ) //error
                                    }
                                  );


              }
              else if ( deleteResult === true ) {

                result.data.push(
                                  {
                                    Id: sysUserGroupInDB.Id,
                                    ShortId: sysUserGroupInDB.ShortId,
                                    Name: sysUserGroupInDB.Name,
                                    Code: "SUCCESS_USER_GROUP_DELETE",
                                    Message: await I18NManager.translate( strLanguage, "Success user group delete." ),
                                    Mark: "2F1C3D99C896" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                    Details: null
                                  }
                                );

              }
              else {

                result.errors.push(
                                    {
                                      Id: sysUserGroupInDB.Id,
                                      ShortId: sysUserGroupInDB.ShortId,
                                      Name: sysUserGroupInDB.Name,
                                      Code: "ERROR_USER_GROUP_DELETE",
                                      Message: await I18NManager.translate( strLanguage, "Error in user group delete." ),
                                      Mark: "BEE0EA50D757" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                      Details: "Method deleteByModel return false"
                                    }
                                  );

              }

            }
            else {

              sysUserGroupInDB.UpdatedBy = userSessionStatus.UserName;
              sysUserGroupInDB.UpdatedAt = null;

              if ( strBulkOperation === "disableUserGroup" ) {

                sysUserGroupInDB.DisabledBy = "1@" + userSessionStatus.UserName;

              }
              else if ( strBulkOperation === "enableUserGroup" ) {

                sysUserGroupInDB.DisabledBy = "0";

              }

              sysUserGroupInDB = await SYSUserGroupService.createOrUpdate( ( sysUserGroupInDB as any ).dataValues,
                                                                            true,
                                                                            transaction,
                                                                            logger );

              if ( sysUserGroupInDB instanceof Error ) {

                const error = sysUserGroupInDB as any;

                result.errors.push(
                                    {
                                      Id: sysUserGroupInDB.Id,
                                      ShortId: sysUserGroupInDB.ShortId,
                                      Name: sysUserGroupInDB.Name,
                                      Code: "ERROR_UNEXPECTED",
                                      Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                                      Mark: "1F3070410157" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                      Details: await SystemUtilities.processErrorDetails( error ) //error
                                    }
                                  );

              }
              else {

                result.data.push(
                                  {
                                    Id: sysUserGroupInDB.Id,
                                    ShortId: sysUserGroupInDB.ShortId,
                                    Name: sysUserGroupInDB.Name,
                                    Code: "SUCCESS_USER_GROUP_UPDATE",
                                    Message: await I18NManager.translate( strLanguage, "Success user group update." ),
                                    Mark: "88A17CFE9558" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                    Details: {
                                               DisabledBy: sysUserGroupInDB.DisabledBy,
                                               DisabledAt: sysUserGroupInDB.DisabledAt
                                             }
                                  }
                                );

              }

            }

          }

        }
        catch ( error ) {

          result.data.push(
                            {
                              Id: bulkUserData.Id,
                              ShortId: bulkUserData.ShortId,
                              Name: bulkUserData.Name,
                              Code: "ERROR_UNEXPECTED",
                              Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                              Mark: "348D1629BE0B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                              Details: await SystemUtilities.processErrorDetails( error ) //error
                            }
                          );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.bulkUserGroupOperation.name;

      const strMark = "D2FE308E9041" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      const bulkResult = await this.bulkUserGroupOperation( "disableUserGroup",
                                                            request,
                                                            currentTransaction,
                                                            logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = "SUCCESS_BULK_USER_GROUP_DISABLE";
        strMessage = await I18NManager.translate( strLanguage, "Success disable ALL user groups" );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = "ERROR_BULK_USER_GROUP_DISABLE";
        strMessage = await I18NManager.translate( strLanguage, "Cannot disable the user groups. Please check the errors and warnings section" );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = "CHECK_DATA_AND_ERRORS_AND_WARNINGS";
        strMessage = await I18NManager.translate( strLanguage, "Not ALL user groups has been disabled. Please check the data and errors and warnings section" );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: "F085BD6A75DB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: bIsError,
                 Errors: bulkResult.errors,
                 Warnings: bulkResult.warnings,
                 Count: request.body.bulk.length - bulkResult.errors.length,
                 Data: bulkResult.data
               };

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

      const bulkResult = await this.bulkUserGroupOperation( "enableUserGroup",
                                                            request,
                                                            currentTransaction,
                                                            logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = "SUCCESS_BULK_USER_GROUP_ENABLE";
        strMessage = await I18NManager.translate( strLanguage, "Success enable ALL user groups" );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = "ERROR_BULK_USER_GROUP_ENABLE";
        strMessage = await I18NManager.translate( strLanguage, "Cannot enable the user groups. Please check the errors and warnings section" );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = "CHECK_DATA_AND_ERRORS_AND_WARNINGS";
        strMessage = await I18NManager.translate( strLanguage, "Not ALL user groups has been enabled. Please check the data and errors and warnings section" );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: "99DA730C8F5C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: bIsError,
                 Errors: bulkResult.errors,
                 Warnings: bulkResult.warnings,
                 Count: request.body.bulk.length - bulkResult.errors.length,
                 Data: bulkResult.data
               };

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

  static checkNameAuthorized( strRole: any,
                              strName: string,
                              strActionRole: string ): boolean {

    let bResult = false;

    try {

      let roleSubTag = CommonUtilities.getSubTagFromComposeTag( strRole, "#Master_L03#" );

      if ( !roleSubTag ||
           roleSubTag.length === 0 ) {

        roleSubTag = CommonUtilities.getSubTagFromComposeTag( strRole, "#" + strActionRole + "L03#" ); // "#Create_User_L03#" );

      }

      if ( !roleSubTag ) {

        roleSubTag = [];

      }

      bResult = strRole ? ( roleSubTag.includes( "#GName:" +  strName + "#" ) ||
                            roleSubTag.includes( "#GName:*#" )  ) : false;

    }
    catch ( error ) {

      //

    }

    return bResult;

  }

  static checkUserGroupRoleLevel( userSessionStatus: any,
                                  sysUserGroup: {
                                                  Id: string,
                                                  ShortId: string,
                                                  Name: string
                                                },
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
                                                          userSessionStatus.Role.includes( "#BManager_L99#" ): false;

      if ( result.isAuthorizedAdmin === false ) {

        result.isAuthorizedL04 = userSessionStatus.Role.includes( "#" + strActionRole + "L04#" );

        if ( result.isAuthorizedL04 === false ) {

          let roleSubTag = null;

          if ( strActionRole === "CreateUserGroup" ||
               strActionRole === "UpdateUserGroup" ||
               strActionRole === "GetUserGroup" ||
               strActionRole === "SearchUserGroup" ||
               strActionRole === "SettingsUserGroup" ) {

            roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Master_L03#" );

            if ( !roleSubTag ||
                 roleSubTag.length === 0 ) {

              roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#" + strActionRole + "L03#" ); // "#Create_User_L03#" );

            }

          }

          if ( !roleSubTag ) {

            roleSubTag = [];

          }

          result.isAuthorizedL03 = userSessionStatus.Role && sysUserGroup ? ( roleSubTag.includes( "#GName:" +  sysUserGroup.Name + "#" ) ||
                                                                              roleSubTag.includes( "#GName:*#" ) ||
                                                                              roleSubTag.includes( "#GId:" +  sysUserGroup.Id + "#" ) ||
                                                                              roleSubTag.includes( "#GId:*#" ) ||
                                                                              roleSubTag.includes( "#GSId:" +  sysUserGroup.ShortId + "#" ) ||
                                                                              roleSubTag.includes( "#GSId:*#" ) ) : false;

          if ( result.isAuthorizedL03 === false ) {

            if ( strActionRole === "GetUserGroup" ||
                 strActionRole === "SearchUserGroup" ||
                 strActionRole === "SettingsUserGroup" ) {

              result.isAuthorizedL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Master_L01#" ) ||
                                                                userSessionStatus.Role.includes( "#" + strActionRole + "L01#" ): false;

              if ( result.isAuthorizedL01 &&
                   ( !sysUserGroup ||
                     ( userSessionStatus.UserGroupName !== sysUserGroup.Name &&
                       userSessionStatus.UserGroupShortId !== sysUserGroup.ShortId &&
                       userSessionStatus.UserGroupId !== sysUserGroup.Id ) ) ) {

                //Uhathorized
                result.isNotAuthorized = true;

              }

              if ( strActionRole === "SettingsUserGroup" &&
                   userSessionStatus.UserGroupId === sysUserGroup.Id  ) {

                result.isNotAuthorized = false;
                result.isAuthorizedL01 = true;

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
                                                                Id: request.query.id as string,
                                                                ShortId: request.query.shortId as string,
                                                                Name: request.query.name as string
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
                   Code: "ERROR_CANNOT_DELETE_USER_GROUP",
                   Message: await I18NManager.translate( strLanguage, "Not allowed to delete the user group" ),
                   Mark: "3E8140B91207" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_CANNOT_DELETE_USER_GROUP",
                               Message: await I18NManager.translate( strLanguage, "Not allowed to delete the user group" ),
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
                   Code: "ERROR_USER_GROUP_NOT_FOUND",
                   Message: strMessage,
                   Mark: "58A44EA21984" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_USER_GROUP_NOT_FOUND",
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
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "F82A2A732532" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                   Code: "ERROR_USER_GROUP_IS_NOT_USER_EMPTY",
                   Message: await I18NManager.translate( strLanguage, "The user group have users assigned" ),
                   Mark: "DF7B8DF79E5B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_USER_GROUP_IS_NOT_USER_EMPTY",
                               Message: await I18NManager.translate( strLanguage, "The user group have users assigned" ),
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( this.checkUsersEqualsRoleLevel( sysUserGroupInDB,
                                                userSessionStatus,
                                                logger ) === false ) {

        result = {
                   StatusCode: 403, //Forbidden
                   Code: "ERROR_CANNOT_DELETE_USER_GROUP",
                   Message: await I18NManager.translate( strLanguage, "Not allowed to delete the user group. The user group has #Administrator# role, but you not had." ),
                   Mark: "28E5A0825F4E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_CANNOT_UPDATE_USER_GROUP",
                               Message: await I18NManager.translate( strLanguage, "Not allowed to delete the user group. The user group has #Administrator# role, but you not had." ),
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
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "75E23A0316B7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Code: "SUCCESS_USER_GROUP_DELETE",
                     Message: await I18NManager.translate( strLanguage, "Success user group %s deleted.", sysUserGroupInDB.Name ),
                     Mark: "D39BA094555F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Code: "ERROR_USER_GROUP_DELETE",
                     Message: await I18NManager.translate( strLanguage, "Error in user group delete." ),
                     Mark: "5CF74478D0E9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [
                               {
                                 Code: "ERROR_METHOD_DELETE_RETURN_FALSE",
                                 Message: "Method deleteByModel return false",
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

      const bulkResult = await this.bulkUserGroupOperation( "deleteUserGroup",
                                                            request,
                                                            currentTransaction,
                                                            logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = "SUCCESS_BULK_USER_GROUP_DELETE";
        strMessage = await I18NManager.translate( strLanguage, "Success delete ALL user groups" );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = "ERROR_BULK_USER_GROUP_DELETE";
        strMessage = await I18NManager.translate( strLanguage, "Cannot delete the user groups. Please check the errors and warnings section" );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = "CHECK_DATA_AND_ERRORS_AND_WARNINGS";
        strMessage = await I18NManager.translate( strLanguage, "Not ALL user groups has been deleted. Please check the data and errors and warnings section" );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: "316990A8DBC6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: bIsError,
                 Errors: bulkResult.errors,
                 Warnings: bulkResult.warnings,
                 Count: request.body.bulk.length - bulkResult.errors.length,
                 Data: bulkResult.data
               };

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
                                                          userSessionStatus.Role.includes( "#BManager_L99#" ) ||
                                                          userSessionStatus.Role.includes( "#Search_User_Group_L04#" ): false;

      let bIsAuthorizedL03 = false;
      let strWhereL03 = "";
      let bIsAuthorizedL01 = false;
      let strWhereL01 = "";

      if ( bIsAuthorizedAdmin === false ) {

        let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Master_L03#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Search_User_Group_L03#" );

        }

        if ( roleSubTag &&
             roleSubTag.length > 0 ) {

          bIsAuthorizedL03 = true;

          strWhereL03 = CommonUtilities.tranformTagListToWhere( roleSubTag, "A", "Or" );

        }

        bIsAuthorizedL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Master_L01#" ) ||
                                                    userSessionStatus.Role.includes( "#Search_User_Group_L01#" ): false;

        if ( bIsAuthorizedL01 ) {

          strWhereL01 = " ( A.Id = '" + userSessionStatus.UserGroupId + "' )";

        }

      }

      const strSelectFields = SystemUtilities.createSelectAliasFromModels(
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
                                                       SelectFields: strSelectFields,
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
           isNaN( parseInt( request.query.limit as string ) ) === false &&
           Number.parseInt( request.query.limit as string ) <= intLimit ) {

        intLimit = parseInt( request.query.limit as string );

      }
      else {

        warnings.push(
                       {
                         Code: "WARNING_DATA_LIMITED_TO_MAX",
                         Message: await I18NManager.translate( strLanguage, "Data limited to the maximun of %s rows", intLimit ),
                         Details: await I18NManager.translate( strLanguage, "To protect to server and client of large result set of data, the default maximun rows is %s, you must use \"offset\" and \"limit\" query parameters to paginate large result set of data.", intLimit )
                       }
                     );

      }

      if ( !bIsAuthorizedAdmin ) {

        warnings.push(
                       {
                         Code: "WARNING_DATA_RESTRICTED",
                         Message: await I18NManager.translate( strLanguage, "It is possible that certain information is not shown due to limitations in their roles" ),
                         Details: {
                                    Role: userSessionStatus.Role
                                  }
                       }
                     );

      }

      strSQL = strSQL + " LIMIT " + intLimit.toString() + " OFFSET " + ( request.query.offset && !isNaN( parseInt( request.query.offset as string ) ) ? request.query.offset : "0" );

      //ANCHOR dbConnection.query
      const rows = await dbConnection.query( strSQL,
                                             {
                                               raw: true,
                                               type: QueryTypes.SELECT,
                                               transaction: currentTransaction
                                             } );

      const transformedRows = SystemUtilities.transformRowValuesToSingleRootNestedObject( rows,
                                                                                          [
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
                                                                       Include: null, //[ { model: SYSUser } ],
                                                                       Exclude: null, //[ { model: SYSUser } ],
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
                 Code: "SUCCESS_SEARCH",
                 Message: await I18NManager.translate( strLanguage, "Success search." ),
                 Mark: "7C478BDFA8F8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                                                          userSessionStatus.Role.includes( "#BManager_L99#" ) ||
                                                          userSessionStatus.Role.includes( "#Search_User_Group_L04#" ): false;

      let bIsAuthorizedL03 = false;
      let strWhereL03 = "";
      let bIsAuthorizedL01 = false;
      let strWhereL01 = "";

      if ( bIsAuthorizedAdmin === false ) {

        let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Master_L03#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Search_User_Group_L03#" );

        }

        if ( roleSubTag &&
             roleSubTag.length > 0 ) {

          bIsAuthorizedL03 = true;

          strWhereL03 = CommonUtilities.tranformTagListToWhere( roleSubTag, "A", "Or" );

        }

        bIsAuthorizedL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Master_L01#" ) ||
                                                    userSessionStatus.Role.includes( "#Search_User_Group_L01#" ): false;

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
                         Code: "WARNING_DATA_RESTRICTED",
                         Message: await I18NManager.translate( strLanguage, "It is possible that certain information is not counted due to limitations in their roles" ),
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
                 Code: "SUCCESS_SEARCH_COUNT",
                 Message: await I18NManager.translate( strLanguage, "Success search count." ),
                 Mark: "660DFC71AA33" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      //ANCHOR setSetting
      const userSessionStatus = context.UserSessionStatus;

      let sysUserGroupInDB = await SYSUserGroupService.getBy( {
                                                                Id: request.query.id as string,
                                                                ShortId: request.query.shortId as string,
                                                                Name: request.query.name as string
                                                              },
                                                              null,
                                                              currentTransaction,
                                                              logger );

      const resultCheckUserRoles = this.checkUserGroupRoleLevel( userSessionStatus,
                                                                 {
                                                                   Id: sysUserGroupInDB ? sysUserGroupInDB.Id: userSessionStatus.UserGroupId,
                                                                   ShortId: sysUserGroupInDB ? sysUserGroupInDB.ShortId: userSessionStatus.UserGroupShortId,
                                                                   Name: sysUserGroupInDB ? sysUserGroupInDB.Name: userSessionStatus.UserGroupName
                                                                 },
                                                                 "SettingsUserGroup",
                                                                 logger );

      if ( !resultCheckUserRoles.isAuthorizedAdmin &&
           !resultCheckUserRoles.isAuthorizedL01 &&
           !resultCheckUserRoles.isAuthorizedL03 &&
           !resultCheckUserRoles.isAuthorizedL04 ) {

        resultCheckUserRoles.isNotAuthorized = true;

      }

      if ( resultCheckUserRoles.isNotAuthorized ) {

        result = {
                   StatusCode: 403, //Forbidden
                   Code: "ERROR_GET_USER_GROUP_SETTINGS",
                   Message: await I18NManager.translate( strLanguage, "Not allowed to get the user group settings" ),
                   Mark: "70E7C8CCE185" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_GET_USER_GROUP_SETTINGS",
                               Message: await I18NManager.translate( strLanguage, "Not allowed to get the user group settings" ),
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else {

        let configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_UserGroup_Settings.Id,
                                                                             sysUserGroupInDB ? sysUserGroupInDB.Id: userSessionStatus.UserGroupId,
                                                                             currentTransaction,
                                                                             logger );

        configData = configData.Value ? configData.Value : configData.Default;

        configData = CommonUtilities.parseJSON( configData, logger );

        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_GET_SETTINGS",
                   Message: await I18NManager.translate( strLanguage, "Success get settings" ),
                   Mark: "6A6B0A77414D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: 1,
                   Data: [
                           configData
                         ]
                 }

        bApplyTransaction = true;

      }

      /*
      let userSessionStatus = context.UserSessionStatus;

      let bProfileOfAnotherUser = false;

      let strAuthorization = context.Authorization;

      if ( context.UserSessionStatus.Role.includes( "#Administrator#" ) ||
           context.UserSessionStatus.Role.includes( "#BManager_L99#" ) ) {

        if ( request.query.shortToken ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByShortToken( request.query.shortToken,
                                                                                                  currentTransaction,
                                                                                                  logger );

          strAuthorization = request.query.shortToken;

        }
        else if ( request.query.token ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByToken( request.query.token,
                                                                                             currentTransaction,
                                                                                             logger );

          strAuthorization = request.query.token;

        }

      }

      if ( bProfileOfAnotherUser &&
           userSessionStatus === null ) {

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_USER_SESSION_NOT_FOUND",
                   Message: await I18NManager.translate( strLanguage, "The session for the token %s not found", strAuthorization ),
                   Mark: "D477E56F3527" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_USER_SESSION_NOT_FOUND",
                               Message: await I18NManager.translate( strLanguage, "The session for the token %s not found", strAuthorization ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else if ( bProfileOfAnotherUser &&
                userSessionStatus instanceof Error ) {

        const error = userSessionStatus;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "1F0895C63110" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
      else {

        let configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_UserGroup_Settings.Id,
                                                                             userSessionStatus.UserGroupId,
                                                                             currentTransaction,
                                                                             logger );

        configData = configData.Value ? configData.Value : configData.Default;

        configData = CommonUtilities.parseJSON( configData, logger );

        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_GET_SETTINGS",
                   Message: await I18NManager.translate( strLanguage, "Success get settings" ),
                   Mark: "6A6B0A77414D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: 1,
                   Data: [
                           configData
                         ]
                 }

        bApplyTransaction = true;

      }
      */

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

      //let strAuthorization = context.Authorization;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //ANCHOR setSetting
      const userSessionStatus = context.UserSessionStatus;

      let sysUserGroupInDB = await SYSUserGroupService.getBy( {
                                                                Id: request.query.id as string,
                                                                ShortId: request.query.shortId as string,
                                                                Name: request.query.name as string
                                                              },
                                                              null,
                                                              currentTransaction,
                                                              logger );

      const resultCheckUserRoles = this.checkUserGroupRoleLevel( userSessionStatus,
                                                                 {
                                                                   Id: sysUserGroupInDB ? sysUserGroupInDB.Id: userSessionStatus.UserGroupId,
                                                                   ShortId: sysUserGroupInDB ? sysUserGroupInDB.ShortId: userSessionStatus.UserGroupShortId,
                                                                   Name: sysUserGroupInDB ? sysUserGroupInDB.Name: userSessionStatus.UserGroupName
                                                                 },
                                                                 "SettingsUserGroup",
                                                                 logger );

      if ( !resultCheckUserRoles.isAuthorizedAdmin &&
           !resultCheckUserRoles.isAuthorizedL01 &&
           !resultCheckUserRoles.isAuthorizedL03 &&
           !resultCheckUserRoles.isAuthorizedL04 ) {

        resultCheckUserRoles.isNotAuthorized = true;

      }

      if ( resultCheckUserRoles.isNotAuthorized ) {

        result = {
                   StatusCode: 403, //Forbidden
                   Code: "ERROR_SET_USER_GROUP_SETTINGS",
                   Message: await I18NManager.translate( strLanguage, "Not allowed to set the user group settings" ),
                   Mark: "70E7C8CCE185" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_SET_USER_GROUP_SETTINGS",
                               Message: await I18NManager.translate( strLanguage, "Not allowed to set the user group settings" ),
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( this.checkUsersEqualsRoleLevel( {
                                                  Role: sysUserGroupInDB ? sysUserGroupInDB.Role: userSessionStatus.Role,
                                                } as any,
                                                userSessionStatus,
                                                logger ) === false ) {

        result = {
                   StatusCode: 403, //Forbidden
                   Code: "ERROR_SET_USER_GROUP_SETTINGS",
                   Message: await I18NManager.translate( strLanguage, "Not allowed to set settings to the user group. The user group has #Administrator# role, but you not had." ),
                   Mark: "366658DFEE18" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_SET_USER_GROUP_SETTINGS",
                               Message: await I18NManager.translate( strLanguage, "Not allowed to set settings to the user group. The user group has #Administrator# role, but you not had." ),
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else {

        const configData = await SYSConfigValueDataService.setConfigValueData( SystemConstants._CONFIG_ENTRY_UserGroup_Settings.Id,
                                                                               sysUserGroupInDB ? sysUserGroupInDB.Id: userSessionStatus.UserGroupId,
                                                                               request.body,
                                                                               currentTransaction,
                                                                               logger );

        if ( configData instanceof Error ) {

          const error = configData as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "AFBF4AA7BE2C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        }
        else if ( !configData ) {

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_CANNOT_CREATE_SETTINGS",
                     Message: await I18NManager.translate( strLanguage, "Cannot create or update the settings entry." ),
                     Mark: "2BCD86F73CE5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_CANNOT_CREATE_SETTINGS",
                                 Message: await I18NManager.translate( strLanguage, "Cannot create or update the settings entry." ),
                                 Details: "Method setConfigValueData return null" //error
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else {

          result = {
                     StatusCode: 200, //Ok
                     Code: "SUCCESS_SET_SETTINGS",
                     Message: await I18NManager.translate( strLanguage, "Success set settings" ),
                     Mark: "B90F830F6786" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: 1,
                     Data: [
                             CommonUtilities.parseJSON( configData.Value, logger )
                           ]
                   }

          bApplyTransaction = true;

        }

      }

      /*
      let userSessionStatus = context.UserSessionStatus;

      let bProfileOfAnotherUser = false;

      if ( context.UserSessionStatus.Role.includes( "#Administrator#" ) ||
           context.UserSessionStatus.Role.includes( "#BManager_L99#" ) ) {

        if ( request.query.shortToken ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByShortToken( request.query.shortToken,
                                                                                                  currentTransaction,
                                                                                                  logger );

          strAuthorization = request.query.shortToken;

        }
        else if ( request.query.token ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByToken( request.query.token,
                                                                                             currentTransaction,
                                                                                             logger );

          strAuthorization = request.query.token;

        }

      }

      if ( bProfileOfAnotherUser &&
           userSessionStatus === null ) {

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_USER_SESSION_NOT_FOUND",
                   Message: await I18NManager.translate( strLanguage, "The session for the token %s not found", strAuthorization ),
                   Mark: "40B9894F6BA4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_USER_SESSION_NOT_FOUND",
                               Message: await I18NManager.translate( strLanguage, "The session for the token %s not found", strAuthorization ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else if ( bProfileOfAnotherUser &&
                userSessionStatus instanceof Error ) {

        const error = userSessionStatus;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "D89E5E762C7B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
      else {

        const configData = await SYSConfigValueDataService.setConfigValueData( SystemConstants._CONFIG_ENTRY_UserGroup_Settings.Id,
                                                                               userSessionStatus.UserGroupId,
                                                                               request.body,
                                                                               currentTransaction,
                                                                               logger );

        if ( configData instanceof Error ) {

          const error = configData as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "AFBF4AA7BE2C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        }
        else if ( !configData ) {

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_CANNOT_CREATE_SETTINGS",
                     Message: await I18NManager.translate( strLanguage, "Cannot create or update the settings entry." ),
                     Mark: "2BCD86F73CE5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_CANNOT_CREATE_SETTINGS",
                                 Message: await I18NManager.translate( strLanguage, "Cannot create or update the settings entry." ),
                                 Details: "Method setConfigValueData return null" //error
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else {

          result = {
                     StatusCode: 200, //Ok
                     Code: "SUCCESS_SET_SETTINGS",
                     Message: await I18NManager.translate( strLanguage, "Success set settings" ),
                     Mark: "B90F830F6786" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: 1,
                     Data: [
                             CommonUtilities.parseJSON( configData.Value, logger )
                           ]
                   }

          bApplyTransaction = true;

        }

      }
      */

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
