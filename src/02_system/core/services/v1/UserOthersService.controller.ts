import cluster from "cluster";

import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,
import {
  //Router,
  Request,
  //json,
  //Response,
  //NextFunction
} from "express";
import bcrypt from "bcrypt";
//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from "uuid/v4";
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import CommonConstants from "../../../common/CommonConstants";
import SystemConstants, { ICheckUserRoles } from "../../../common/SystemContants";

import CommonUtilities from "../../../common/CommonUtilities";
import SystemUtilities from "../../../common/SystemUtilities";

import I18NManager from "../../../common/managers/I18Manager";
import DBConnectionManager from "../../../common/managers/DBConnectionManager";
import NotificationManager from "../../../common/managers/NotificationManager";
import GeoMapManager from "../../../common/managers/GeoMapManager";
//import JobQueueManager from "../../common/managers/JobQueueManager";

import SecurityServiceController from "./SecurityService.controller";

import SYSUserGroupService from "../../../common/database/master/services/SYSUserGroupService";
import SYSPersonService from "../../../common/database/master/services/SYSPersonService";
import SYSUserSessionStatusService from "../../../common/database/master/services/SYSUserSessionStatusService";
import SYSRoleHasRouteService from "../../../common/database/master/services/SYSRoleHasRouteService";
import SYSConfigValueDataService from "../../../common/database/master/services/SYSConfigValueDataService";
import SYSUserService from "../../../common/database/master/services/SYSUserService";

import { SYSPerson } from "../../../common/database/master/models/SYSPerson";
import { SYSUser } from "../../../common/database/master/models/SYSUser";
import { SYSUserGroup } from "../../../common/database/master/models/SYSUserGroup";

const debug = require( "debug" )( "UserOthersServiceController" );

export default class UserOthersServiceController {

  static readonly _ID = "UserOthersServiceController";

  static async getConfigUserSignupControl( strFrontendId: string,
                                           transaction: any,
                                           logger: any ): Promise<any> {

    let result = { denied: null, allowed: "*" }

    try {

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_Frontend_Rules.Id, //SystemConstants._CONFIG_ENTRY_UserSignupControl.Id,
                                                                             SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                                             transaction,
                                                                             logger );

      let bSet = false;

      if ( CommonUtilities.isNotNullOrEmpty( configData.Value ) ) {

        const jsonConfigData = CommonUtilities.parseJSON( configData.Value,
                                                          logger );

        if ( jsonConfigData[ "#" + strFrontendId + "#" ] &&
             jsonConfigData[ "#" + strFrontendId + "#" ].user_signup_control ) {

          result.denied = jsonConfigData[ "#" + strFrontendId + "#" ].user_signup_control.denied;
          result.allowed = jsonConfigData[ "#" + strFrontendId + "#" ].user_signup_control.allowed;
          bSet = true;

        }
        else if ( jsonConfigData[ "@__default__@" ] &&
                  jsonConfigData[ "@__default__@" ].user_signup_control ) {

          result.denied = jsonConfigData[ "@__default__@" ].user_signup_control.denied;
          result.allowed = jsonConfigData[ "@__default__@" ].user_signup_control.allowed;
          bSet = true;

        }

      }

      if ( bSet === false &&
          CommonUtilities.isNotNullOrEmpty( configData.Default ) ) {

        const jsonConfigData = CommonUtilities.parseJSON( configData.Default,
                                                          logger );

        if ( jsonConfigData[ "@__default__@" ] &&
             jsonConfigData[ "@__default__@" ].user_signup_control ) {

          result.denied = jsonConfigData[ "@__default__@" ].user_signup_control.denied;
          result.allowed = jsonConfigData[ "@__default__@" ].user_signup_control.allowed;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigSignupProcess.name;

      const strMark = "062260B81ABA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getFrontendIdIsAllowed( strFrontendId: string,
                                       strKind: string,
                                       transaction: any,
                                       logger: any ): Promise<number> {

    let intResult = 0;

    try {

      const configData = await this.getConfigUserSignupControl( strFrontendId,
                                                                transaction,
                                                                logger );

      let strDeniedValue = configData.denied;
      let strAllowedValue = configData.allowed;

      if ( CommonUtilities.isNotNullOrEmpty( strDeniedValue ) ) {

        if ( strDeniedValue === SystemConstants._VALUE_ANY ||
             strDeniedValue.includes( "#" + strKind + "#" ) ) {

          intResult = -1; //Explicit denied

        }

      }

      if ( intResult === 0 &&
          CommonUtilities.isNotNullOrEmpty( strAllowedValue ) ) {

        if ( strAllowedValue === SystemConstants._VALUE_ANY ||
             strAllowedValue.includes( "#" + strKind + "#" ) ) {

          intResult = 1; //Explicit allowed

        }

      }

      if ( intResult === 0 ) {

        intResult = 1;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getFrontendIdIsAllowed.name;

      const strMark = "D3DD67D5851E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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


    return intResult;

  }

  static async getConfigGeneralDefaultInformation( transaction: any,
                                                   logger: any ): Promise<any> {

    let result = null;

    try {

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_General_Default_Information.Id,
                                                                             SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                                             transaction,
                                                                             logger );

      let bSet = false;

      if ( CommonUtilities.isNotNullOrEmpty( configData.Value ) ) {

        const jsonConfigData = CommonUtilities.parseJSON( configData.Value,
                                                          logger );

        result = jsonConfigData !== null ? jsonConfigData : null;
        bSet = true;

      }

      if ( bSet === false &&
          CommonUtilities.isNotNullOrEmpty( configData.Default ) ) {

        const jsonConfigData = CommonUtilities.parseJSON( configData.Default,
                                                          logger );

        result = jsonConfigData !== null ? jsonConfigData : null;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigGeneralDefaultInformation.name;

      const strMark = "08E4E489430A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getConfigSignupProcess( strKind: string,
                                       transaction: any,
                                       logger: any ): Promise<any> {

    let result = null;

    try {

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_UserSignupProcess.Id,
                                                                             SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                                             transaction,
                                                                             logger );

      let bSet = false;

      if ( CommonUtilities.isNotNullOrEmpty( configData.Value ) ) {

        const jsonConfigData = CommonUtilities.parseJSON( configData.Value,
                                                           logger );

        if ( jsonConfigData[ "#" + strKind + "#" ] ) {

          result = jsonConfigData[ "#" + strKind + "#" ];
          bSet = true;

        }
        else if ( jsonConfigData[ "@__default__@" ] ) {

          result = jsonConfigData[ "@__default__@" ];
          bSet = true;

        }

      }

      if ( bSet === false &&
          CommonUtilities.isNotNullOrEmpty( configData.Default ) ) {

        const jsonConfigData = CommonUtilities.parseJSON( configData.Default,
                                                          logger );

        if ( jsonConfigData[ "@__default__@" ] ) {

          result = jsonConfigData[ "@__default__@" ];

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigSignupProcess.name;

      const strMark = "0CCFCCA4180C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getConfigFrontendRules( strFrontendId: string,
                                       strFieldName: string,
                                       transaction: any,
                                       logger: any ): Promise<string> {

    let strResult = "";

    try {

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_Frontend_Rules.Id,
                                                                             SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                                             transaction,
                                                                             logger );

      let bSet = false;

      if ( CommonUtilities.isNotNullOrEmpty( configData.Value ) ) {

        const jsonConfigData = CommonUtilities.parseJSON( configData.Value,
                                                          logger );

        if ( jsonConfigData[ "#" + strFrontendId + "#" ] &&
             jsonConfigData[ "#" + strFrontendId + "#" ][ strFieldName ] ) {

          strResult = jsonConfigData[ "#" + strFrontendId + "#" ][ strFieldName ];
          bSet = true;

        }
        else if ( jsonConfigData[ "@__default__@" ] &&
                  jsonConfigData[ "@__default__@" ][ strFieldName ] ) {

          strResult = jsonConfigData[ "@__default__@" ][ strFieldName ];
          bSet = true;

        }

      }

      if ( bSet === false &&
          CommonUtilities.isNotNullOrEmpty( configData.Default ) ) {

        const jsonConfigData = CommonUtilities.parseJSON( configData.Default,
                                                          logger );

        if ( jsonConfigData[ "@__default__@" ] &&
             jsonConfigData[ "@__default__@" ].tag ) {

          strResult = jsonConfigData[ "@__default__@" ].tag;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigFrontendRules.name;

      const strMark = "B7DACA6CCE2F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async isWebFrontendClient( strFrontendId: string,
                                    transaction: any,
                                    logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const strTag = await this.getConfigFrontendRules( strFrontendId,
                                                        "tag",
                                                        transaction,
                                                        logger );

      bResult = strTag.includes( "#web#" );

    }
    catch ( error ) {


      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.isWebFrontendClient.name;

      const strMark = "08A795BE10E0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async isMobileFrontendClient( strFrontendId: string,
                                       transaction: any,
                                       logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const strTag = await this.getConfigFrontendRules( strFrontendId,
                                                        "tag",
                                                        transaction,
                                                        logger );

      bResult = strTag.includes( "#mobile#" );

    }
    catch ( error ) {


      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.isWebFrontendClient.name;

      const strMark = "08A795BE10E0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  //ANCHOR checkUserRoleLevel
  static checkUserRoleLevel( userSessionStatus: any,
                             sysUserInDB: SYSUser,
                             strActionRole: string,
                             logger: any ): ICheckUserRoles {

    let result: ICheckUserRoles = {
                                    isAuthorizedAdmin: false,
                                    isAuthorizedL03: false,
                                    isAuthorizedL02: false,
                                    isAuthorizedL01: false,
                                    isNotAuthorized: false
                                  };

    try {

      result.isAuthorizedAdmin = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Administrator#" ) ||
                                                          userSessionStatus.Role.includes( "#BManager_L99#" ) ||
                                                          userSessionStatus.Role.includes( "#" + strActionRole + "L99#" ): false;

      if ( result.isAuthorizedAdmin === false ) {

        let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Master_L03#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#" + strActionRole + "L03#" ); // "#ChangeUserPasswordL03#" );

        }

        if ( !roleSubTag ) {

          roleSubTag = [];

        }

        result.isAuthorizedL03 = userSessionStatus.Role && sysUserInDB ? ( roleSubTag.includes( "#GName:" +  sysUserInDB.sysUserGroup.Name + "#" ) ||
                                                                           roleSubTag.includes( "#GName:*#" ) ||
                                                                           roleSubTag.includes( "#GId:" +  sysUserInDB.sysUserGroup.Id + "#" ) ||
                                                                           roleSubTag.includes( "#GId:*#" ) ||
                                                                           roleSubTag.includes( "#GSId:" +  sysUserInDB.sysUserGroup.ShortId + "#" ) ||
                                                                           roleSubTag.includes( "#GSId:*#" ) ): false;

        if ( result.isAuthorizedL03 === false ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Master_L02#" );

          if ( !roleSubTag ||
                roleSubTag.length === 0 ) {

            roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#" + strActionRole + "L02#" );

          }

          if ( !roleSubTag ) {

            roleSubTag = [];

          }

          result.isAuthorizedL02 = userSessionStatus.Role && sysUserInDB ? ( roleSubTag.includes( "#UName:" +  sysUserInDB.Name + "#" ) ||
                                                                             roleSubTag.includes( "#UName:*#" ) ||
                                                                             roleSubTag.includes( "#UId:" +  sysUserInDB.Id + "#" ) ||
                                                                             roleSubTag.includes( "#UId:*#" ) ||
                                                                             roleSubTag.includes( "#USId:" +  sysUserInDB.ShortId + "#" ) ||
                                                                             roleSubTag.includes( "#USId:*#" ) ) : false;

          if ( result.isAuthorizedL02 === false ) {

            result.isAuthorizedL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Master_L01#" ) ||
                                                              userSessionStatus.Role.includes( "#" + strActionRole + "L01#" ): false;

            if ( result.isAuthorizedL01 &&
                 ( !sysUserInDB ||
                   userSessionStatus.UserGroupId !== sysUserInDB.sysUserGroup.Id ) ) {

              //Uhathorized
              result.isNotAuthorized = true;

            }

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkUserRoleLevel.name;

      const strMark = "3F9FEF587ABA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async passwordChange( request: Request,
                               transaction: any,
                               logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let bCheckCurrentPassword = true;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      if ( context.Authorization.startsWith( "p:" ) === false ) {

        // ANCHOR password change
        let userSessionStatus = context.UserSessionStatus;

        //let bIsNotAuthorized = false;

        let resultCheckUserRoles = null;

        let bUpdateSessionStatus = true;

        let sysUserInDB = null;

        if ( request.body.User ||
             request.body.UserId ) {

          if ( request.body.UserId ) {

            sysUserInDB = await SYSUserService.getById( request.body.UserId,
                                                        null,
                                                        currentTransaction,
                                                        logger );

          }
          else {

            sysUserInDB = await SYSUserService.getByName( request.body.User,
                                                          null,
                                                          currentTransaction,
                                                          logger );

          }

          resultCheckUserRoles = this.checkUserRoleLevel( userSessionStatus,
                                                          sysUserInDB,
                                                          "ChangeUserPassword",
                                                          logger );

          if ( resultCheckUserRoles.isAuthorizedAdmin ||
               resultCheckUserRoles.isAuthorizedL03 ||
               resultCheckUserRoles.isAuthorizedL02 ||
               resultCheckUserRoles.isAuthorizedL01 ) {

            bUpdateSessionStatus = false;
            bCheckCurrentPassword = false;

          }
          else {

            resultCheckUserRoles.isNotAuthorized = true;

          }

        }
        else {

          //Force to read from DB the user session status. To try to get more fresh version possible
          userSessionStatus = await SystemUtilities.getUserSessionStatus( context.Authorization,
                                                                          context,
                                                                          false,    //No update at field
                                                                          true,     //Force from db
                                                                          currentTransaction,
                                                                          logger );

          sysUserInDB = await SYSUserService.getById( userSessionStatus.UserId,
                                                      null,
                                                      currentTransaction,
                                                      logger );

        }

        if ( resultCheckUserRoles &&
             resultCheckUserRoles.isNotAuthorized ) {

          result = {
                     StatusCode: 403, //Forbidden
                     Code: "ERROR_CANNOT_CHANGE_PASSWORD",
                     Message: await I18NManager.translate( strLanguage, "Not allowed to change the password to the user %s", sysUserInDB.Name ),
                     Mark: "CD5990E0CBD1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_CANNOT_CHANGE_PASSWORD",
                                 Message: await I18NManager.translate( strLanguage, "Not allowed to change the password to the user %s", sysUserInDB.Name ),
                                 Details: null,
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else if ( sysUserInDB != null &&
                  sysUserInDB instanceof Error === false ) {

          if ( await SYSUserGroupService.checkDisabledByName( sysUserInDB.sysUserGroup.Name,
                                                              currentTransaction,
                                                              logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: "ERROR_USER_GROUP_DISABLED",
                       Message: await I18NManager.translate( strLanguage, "The user group %s is disabled. You cannot recover your password", sysUserInDB.sysUserGroup.Name ),
                       Mark: "34B74D7BDF33" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_USER_GROUP_DISABLED",
                                   Message: await I18NManager.translate( strLanguage, "The user group %s is disabled. You cannot recover your password", sysUserInDB.sysUserGroup.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await SYSUserGroupService.checkExpiredByName( sysUserInDB.sysUserGroup.Name,
                                                                  currentTransaction,
                                                                  logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: "ERROR_USER_GROUP_EXPIRED",
                       Message: await I18NManager.translate( strLanguage, "The user group %s is expired. You cannot recover your password", sysUserInDB.sysUserGroup.Name ),
                       Mark: "933C3B47067B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_USER_GROUP_EXPIRED",
                                   Message: await I18NManager.translate( strLanguage, "The user group %s is expired. You cannot recover your password", sysUserInDB.sysUserGroup.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await SYSUserService.checkDisabledByName( sysUserInDB.Name,
                                                              currentTransaction,
                                                              logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: "ERROR_USER_DISABLED",
                       Message: await I18NManager.translate( strLanguage, "The user %s is disabled. You cannot recover your password", sysUserInDB.Name ),
                       Mark: "57D0268A40C3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_USER_DISABLED",
                                   Message: await I18NManager.translate( strLanguage, "The user %s is disabled. You cannot recover your password", sysUserInDB.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await SYSUserService.checkExpiredByName( sysUserInDB.Name,
                                                             currentTransaction,
                                                             logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: "ERROR_USER_EXPIRED",
                       Message: await I18NManager.translate( strLanguage, "The user %s is expired. You cannot recover your password", sysUserInDB.Name ),
                       Mark: "C90533CFEFF0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_USER_EXPIRED",
                                   Message: await I18NManager.translate( strLanguage, "The user %s is expired. You cannot recover your password", sysUserInDB.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await bcrypt.compare( request.body.NewPassword, sysUserInDB.Password ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: "ERROR_NEW_PASSWORD_NOT_VALID",
                       Message: await I18NManager.translate( strLanguage, "The new password is invalid", sysUserInDB.Name ),
                       Mark: "7E91B5B3AED1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_NEW_PASSWORD_NOT_VALID",
                                   Message: await I18NManager.translate( strLanguage, "The new password is invalid", sysUserInDB.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else {

            const strCurrentPassword = request.body.CurrentPassword;

            if ( bCheckCurrentPassword === false ||
                 await bcrypt.compare( strCurrentPassword, sysUserInDB.Password ) ) {

              const strNewPassword = request.body.NewPassword;

              //ANCHOR check password Strength
              const strTag = "#" + sysUserInDB.Id + "#,#" + sysUserInDB.Name + "#,#" + sysUserInDB.sysUserGroup.Id + "#,#" + sysUserInDB.sysUserGroup.Name + "#";

              const passwordStrengthParameters = await SecurityServiceController.getConfigPasswordStrengthParameters( strTag,
                                                                                                                      currentTransaction,
                                                                                                                      logger );

              const checkPasswordStrengthResult = await SecurityServiceController.checkPasswordStrength( passwordStrengthParameters,
                                                                                                         strNewPassword,
                                                                                                         logger );

              if ( checkPasswordStrengthResult.code === 1 ) {

                sysUserInDB.Password = strNewPassword;
                sysUserInDB.ForceChangePassword = 0;
                sysUserInDB.PasswordSetAt = SystemUtilities.getCurrentDateAndTime().format();
                sysUserInDB.UpdatedBy = userSessionStatus.UserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

                const userWithPasswordChanged = await SYSUserService.createOrUpdate( ( sysUserInDB as any ).dataValues,
                                                                                     true,
                                                                                     currentTransaction,
                                                                                     logger );

                if ( userWithPasswordChanged !== null &&
                     userWithPasswordChanged instanceof Error === false ) {

                  const warnings = [];

                  if ( bUpdateSessionStatus ) {

                    /*
                    userSessionStatus.Tag = userSessionStatus.Tag.replace( /#FORCE_CHANGE_PASSSWORD#(,)?/g, "" );
                    userSessionStatus.Tag = userSessionStatus.Tag.replace( /(,)?#FORCE_CHANGE_PASSSWORD#/g, "" );
                    userSessionStatus.Tag = userSessionStatus.Tag.replace( /#PASSSWORD_EXPIRED#(,)?/g, "" );
                    userSessionStatus.Tag = userSessionStatus.Tag.replace( /(,)?#PASSSWORD_EXPIRED#/g, "" );
                    */
                    userSessionStatus.Tag = CommonUtilities.removeTag( userSessionStatus.Tag, "#FORCE_CHANGE_PASSSWORD#" );
                    userSessionStatus.Tag = CommonUtilities.removeTag( userSessionStatus.Tag, "#PASSSWORD_EXPIRED#" );
                    userSessionStatus.UpdatedBy = userSessionStatus.UserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET;

                    //ANCHOR update the session
                    const userSessionStatusUpdated = await SystemUtilities.createOrUpdateUserSessionStatus( context.Authorization,
                                                                                                            userSessionStatus,
                                                                                                            {
                                                                                                              updateAt: true,        //Update the field updatedAt
                                                                                                              setRoles: false,       //Set roles?
                                                                                                              groupRoles: null,      //User group roles
                                                                                                              userRoles: null,       //User roles
                                                                                                              forceUpdate: true,     //Force update?
                                                                                                              tryLock: 3,            //Only 1 try
                                                                                                              lockSeconds: 3 * 1000, //Second
                                                                                                            },
                                                                                                            /*
                                                                                                            false,    //Set roles?
                                                                                                            null,     //User group roles
                                                                                                            null,     //User roles
                                                                                                            true,     //Force update?
                                                                                                            3,        //3 tries
                                                                                                            3 * 1000, //Second
                                                                                                            */
                                                                                                            currentTransaction,
                                                                                                            logger );

                    if ( userSessionStatusUpdated instanceof Error ) {

                      const error = userWithPasswordChanged as any;

                      warnings.push(
                                    {
                                      Code: error.name,
                                      Message: error.message,
                                      Details: await SystemUtilities.processErrorDetails( error )
                                    }
                                  );

                      warnings.push(
                                    {
                                      Code: "WARNING_FAILED_UPDATE_USER_DATA_SESSION",
                                      Message: await I18NManager.translate( strLanguage, "Failed to update the user session status. You are required to close the session and start another" ),
                                      Details: null
                                    }
                                  );

                    }

                  }

                  result = {
                             StatusCode: 200, //Ok
                             Code: "SUCCESS_PASSWORD_CHANGE",
                             Message: await I18NManager.translate( strLanguage, "Success to change the password. Remember use it in the next login" ),
                             Mark: "EDCDE884CDA5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: false,
                             Errors: [],
                             Warnings: warnings,
                             Count: 0,
                             Data: []
                           }

                  bApplyTransaction = true;

                  if ( sysUserInDB.SYSPerson &&
                       CommonUtilities.isValidEMailList( sysUserInDB.SYSPerson.EMail ) ) {

                    const configData = await this.getConfigGeneralDefaultInformation( currentTransaction,
                                                                                      logger );

                    const strTemplateKind = await this.isWebFrontendClient( context.FrontendId,
                                                                            currentTransaction,
                                                                            logger ) ? "web" : "mobile";

                    const strWebAppURL = await this.getConfigFrontendRules( context.FrontendId,
                                                                            "url",
                                                                            currentTransaction,
                                                                            logger );

                    await NotificationManager.send(
                                                    "email",
                                                    {
                                                      from: configData[ "no_response_email" ] || "no-response@no-response.com",
                                                      to: sysUserInDB.SYSPerson.EMail,
                                                      subject: await I18NManager.translate( strLanguage, "USER PASSWORD CHANGE SUCCESS" ),
                                                      body: {
                                                              kind: "template",
                                                              file: `email-user-password-change-${strTemplateKind}.pug`,
                                                              language: context.Language,
                                                              variables: {
                                                                           user_name: sysUserInDB.Name,
                                                                           user_password: CommonUtilities.maskData( request.body.Password ),
                                                                           web_app_url: strWebAppURL,
                                                                           ... configData
                                                                         }
                                                              //kind: "embedded",
                                                              //text: "Hello",
                                                              //html: "<b>Hello</b>"
                                                            }
                                                    },
                                                    logger
                                                  );

                  }

                }
                else if ( userWithPasswordChanged instanceof Error ) {

                  const error = userWithPasswordChanged as any;

                  result = {
                             StatusCode: 500, //Internal server error
                             Code: "ERROR_UNEXPECTED",
                             Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                             Mark: "9F94B6BFC8F5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: error.logId,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: error.name,
                                         Message: error.Message,
                                         Details: await SystemUtilities.processErrorDetails( error ) //error
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
                           Code: "ERROR_NEW_PASSWORD_NOT_VALID",
                           Message: await I18NManager.translate( strLanguage, "The new password is not valid" ),
                           Mark: "A5DCC6ACADE4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: checkPasswordStrengthResult.code,
                                       Message: checkPasswordStrengthResult.message,
                                       Details: passwordStrengthParameters
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
                         StatusCode: 401, //Unauthorized
                         Code: "ERROR_WRONG_PASSWORD",
                         Message: await I18NManager.translate( strLanguage, "Your current password not match" ),
                         Mark: "CD291726B853" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: "ERROR_WRONG_PASSWORD",
                                     Message: await I18NManager.translate( strLanguage, "Your current password not match" ),
                                     Details: null,
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }

          }

        }
        else {

          result = {
                     StatusCode: 404, //Not found
                     Code: "ERROR_USER_NOT_FOUND",
                     Message: await I18NManager.translate( strLanguage, "The user %s not found in database", userSessionStatus.UserName ),
                     Mark: "1533BE3C3918" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_USER_NOT_FOUND",
                                 Message: await I18NManager.translate( strLanguage, "The user %s not found in database", userSessionStatus.UserName ),
                                 Details: null,
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
                   Code: "ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT",
                   Message: await I18NManager.translate( strLanguage, "Authorization token provided is persistent. You cannot made change password" ),
                   Mark: "43977750A573" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT",
                               Message: await I18NManager.translate( strLanguage, "Authorization token provided is persistent. You cannot change password" ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                };

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

      sourcePosition.method = this.name + "." + this.passwordChange.name;

      const strMark = "987FA955F3CC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getProfile( request: Request,
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

      let strUserName = context.UserSessionStatus.UserName;

      let strAuthorization = context.Authorization;

      let userSessionStatus = null;

      let bProfileOfAnotherUser = false;

      if ( context.UserSessionStatus.Role.includes( "#Administrator#" ) ||
           context.UserSessionStatus.Role.includes( "#BManager_L99#" ) ) {

        if ( request.query.shortToken ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByShortToken( request.query.shortToken as string,
                                                                                                  currentTransaction,
                                                                                                  logger );

          if ( userSessionStatus &&
               userSessionStatus instanceof Error === false ) {

            strAuthorization = userSessionStatus.Token ? userSessionStatus.Token : request.query.shortToken;

            strUserName = userSessionStatus.UserName ? userSessionStatus.UserName : null;

          }
          else {

            strAuthorization = request.query.shortToken;

          }

        }
        else if ( request.query.token ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByToken( request.query.token as string,
                                                                                             currentTransaction,
                                                                                             logger );

          if ( userSessionStatus &&
               userSessionStatus instanceof Error === false ) {

            strAuthorization = userSessionStatus.Token ? userSessionStatus.Token : request.query.Token;

            strUserName = userSessionStatus.UserName ? userSessionStatus.UserName : null;

          }
          else {

            strAuthorization = request.query.Token;

          }

        }

      }

      if ( bProfileOfAnotherUser &&
           userSessionStatus === null ) {

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_USER_SESSION_NOT_FOUND",
                   Message: await I18NManager.translate( strLanguage, "The session for the token %s not found", strAuthorization ),
                   Mark: "6AD438512BFA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                   Mark: "578DFED7CD84" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        result = await SecurityServiceController.processSessionStatus( context,
                                                                       {
                                                                         operation: "UserGetProfile",
                                                                         checkFrontendId: false,
                                                                         checkPassword: false,
                                                                         useSoftCheck: true,
                                                                         notProcessExpireOn: true,
                                                                         useCustomResponse: true,
                                                                         authorization: strAuthorization,
                                                                         code: "SUCCESS_GET_SESSION_PROFILE",
                                                                         message: "Success get the user session profile information",
                                                                         mark: "1CB1DC7063D8",
                                                                         useSecondaryUserToCreatedBy: false,
                                                                         updateCreatedAt: request.query.createdAt === "1"
                                                                       },
                                                                       strUserName,
                                                                       "",
                                                                       context.UserSessionStatus.UserName,
                                                                       currentTransaction,
                                                                       logger );

      }

      /*
      await JobQueueManager.addJobToQueue( "SampleJob",
                                           { mydata: "my data" },
                                           null, //{ jobId: SystemUtilities.getUUIDv4(), attempts: 0, timeout: 99999999, removeOnComplete: true, removeOnFail: true, backoff: 0 }, //{ repeat: { cron: "* * * * *" } },
                                           logger );

      result = {
                 StatusCode: 200, //Ok
                 Code: "SUCCESS_ADD_JOB_TO_QUEUE",
                 Message: await I18NManager.translate( strLanguage, "Success to add the job to queue" ),
                 Mark: "731042C8407C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: false,
                 Errors: [],
                 Warnings: [],
                 Count: 0,
                 Data: []
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

      sourcePosition.method = this.name + "." + this.getProfile.name;

      const strMark = "DBA7E36C5D40" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async setProfile( request: Request,
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

      let strUserName = context.UserSessionStatus.UserName;

      //let strAuthorization = context.Authorization;

      let sysUserInDB = await SYSUserService.getByName( strUserName,
                                                        context.TimeZoneId,
                                                        transaction,
                                                        logger );

      if ( sysUserInDB != null &&
           sysUserInDB instanceof Error === false ) {

        if ( context.Authorization.startsWith( "p:" ) ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: "ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT",
                     Message: await I18NManager.translate( strLanguage, "Authorization token provided is persistent. You cannot change your profile information" ),
                     Mark: "4FB3974048ED" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT",
                                 Message: await I18NManager.translate( strLanguage, "Authorization token provided is persistent. You cannot change your profile information" ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else if ( await SYSUserGroupService.checkDisabledByName( sysUserInDB.sysUserGroup.Name,
                                                                 currentTransaction,
                                                                 logger ) ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: "ERROR_USER_GROUP_DISABLED",
                     Message: await I18NManager.translate( strLanguage, "The user group %s is disabled. You cannot change your profile information", sysUserInDB.sysUserGroup.Name ),
                     Mark: "CA03218D26D4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_USER_GROUP_DISABLED",
                                 Message: await I18NManager.translate( strLanguage, "The user group %s is disabled. You cannot change your profile information", sysUserInDB.sysUserGroup.Name ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else if ( await SYSUserGroupService.checkExpiredByName( sysUserInDB.sysUserGroup.Name,
                                                                currentTransaction,
                                                                logger ) ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: "ERROR_USER_GROUP_EXPIRED",
                     Message: await I18NManager.translate( strLanguage, "The user group %s is expired. You cannot change your profile information", sysUserInDB.sysUserGroup.Name ),
                     Mark: "4F0F53813715" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_USER_GROUP_EXPIRED",
                                 Message: await I18NManager.translate( strLanguage, "The user group %s is expired. You cannot change you profile information", sysUserInDB.sysUserGroup.Name ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else if ( await SYSUserService.checkDisabledByName( sysUserInDB.Name,
                                                            currentTransaction,
                                                            logger ) ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: "ERROR_USER_DISABLED",
                     Message: await I18NManager.translate( strLanguage, "The user %s is disabled. You cannot change your profile information", sysUserInDB.Name ),
                     Mark: "8362FE646A8D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_USER_DISABLED",
                                 Message: await I18NManager.translate( strLanguage, "The user %s is disabled. You cannot change your profile information", sysUserInDB.Name ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else if ( await SYSUserService.checkExpiredByName( sysUserInDB.Name,
                                                           currentTransaction,
                                                           logger ) ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: "ERROR_USER_EXPIRED",
                     Message: await I18NManager.translate( strLanguage, "The user %s is expired. You cannot change your profile", sysUserInDB.Name ),
                     Mark: "D9E15CB1BA2A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_USER_EXPIRED",
                                 Message: await I18NManager.translate( strLanguage, "The user %s is expired. You cannot change your profile", sysUserInDB.Name ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else {

          let personData = {} as any;

          if ( sysUserInDB.sysPerson ) {

            personData = ( sysUserInDB.sysPerson as any ).dataValues;

            personData.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
            personData.UpdatedAt = null;

          }
          else {

            personData.Id = sysUserInDB.Id;
            personData.CreatedBy = strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET;
            personData.CreatedAt = null;

          }

          let rules = {
                        Title: [ "present", "min:1", "regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g" ],
                        FirstName: [ "required", "min:2", "regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g" ],
                        LastName: [ "present", "min:1", "regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g" ],
                        NickName: [ "present", "min:1", "regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g" ],
                        Abbreviation: [ "present", "min:1", "regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g" ],
                        Gender: [ "present", "between:0,100" ],
                        BirthDate: "present|dateInFormat01", //<-- dateInFormat01 is a custom validator defined in SystemUtilities.createCustomValidatorSync
                        Address: [ "present", "min:10", "regex:/^[a-zA-Z0-9\#\@\.\_\-\\s\:\,ñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g" ],
                        Avatar: [ "present", "min:36", "regex:/^[a-zA-Z0-9\#\@\.\_\-\\s\:ñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g" ],
                      };

          const validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                       rules,
                                                                       null,
                                                                       logger );

          if ( validator.passes() ) { //Validate request.body field values

            personData.Title = request.body.Title ? request.body.Title : personData.Title;
            personData.FirstName = request.body.FirstName ? CommonUtilities.normalizeWhitespaces( request.body.FirstName ) : personData.FirstName;
            personData.LastName = request.body.LastName ? CommonUtilities.normalizeWhitespaces( request.body.LastName ): personData.LastName;
            personData.NickName = request.body.NickName ? request.body.NickName : personData.NickName;

            if ( request.body.Abbreviation ) {

              personData.Abbreviation = request.body.Abbreviation;

            }
            else if ( !personData.Abbreviation ) {

              const fistNameAbbreviation = CommonUtilities.getFirstLetters( request.body.FirstName );
              const lastNameAbbreviation = CommonUtilities.getFirstLetters( request.body.LastName );

              personData.Abbreviation = fistNameAbbreviation.join( "" ) + lastNameAbbreviation.join( "" );

            }

            personData.Gender = request.body.Gender && parseInt( request.body.Gender ) >= 0 ? request.body.Gender : personData.Gender;
            personData.BirthDate = request.body.BirthDate ? request.body.BirthDate : personData.BirthDate;
            personData.Address = request.body.Address ? request.body.Address : personData.Address;

            if ( personData.Address &&
                 await GeoMapManager.getConfigServiceType( "geocode", logger ) !== "@__none__@" ) {

              const geocodeResult = await GeoMapManager.geocodeServiceUsingAddress( [ personData.Address ],
                                                                                    true,
                                                                                    logger );

              if ( !geocodeResult ||
                    geocodeResult.length === 0 ||
                    ( geocodeResult[ 0 ].formattedAddressParts &&
                      geocodeResult[ 0 ].formattedAddressParts.length < 4 ) ) {

                personData.Tag = CommonUtilities.addTag( personData.Tag, "#ADDRESS_NOT_FOUND#" );

              }
              else {

                personData.Address = geocodeResult[ 0 ].formattedAddress;
                personData.Tag = CommonUtilities.removeTag( personData.Tag, "#ADDRESS_NOT_FOUND#" );

              }

              personData.Tag = personData.Tag ? personData.Tag: null;

            }

            const sysPersonInDB = await SYSPersonService.createOrUpdate( personData,
                                                                         true,
                                                                         currentTransaction,
                                                                         logger );

            if ( sysPersonInDB &&
                 sysPersonInDB instanceof Error === false ) {

              const warnings = [];

              if ( ( request.body.Avatar !== undefined &&
                     sysUserInDB.Avatar !== request.body.Avatar ) ||
                   sysUserInDB.PersonId !== sysPersonInDB.Id ) {

                sysUserInDB.PersonId = sysPersonInDB.Id;

                if ( request.body.Avatar === undefined ||
                     request.body.Avatar !== "" ) {

                  sysUserInDB.Avatar = request.body.Avatar &&
                                       sysUserInDB.Avatar !== request.body.Avatar ?
                                       request.body.Avatar : sysUserInDB.Avatar;

                }
                else {

                  sysUserInDB.Avatar = null;

                }

                sysUserInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
                sysUserInDB.UpdatedAt = null;

                sysUserInDB = await SYSUserService.createOrUpdate( ( sysUserInDB as any ).dataValues,
                                                                   true,
                                                                   currentTransaction,
                                                                   logger );

                if ( sysUserInDB instanceof Error ) {

                  const error = sysUserInDB as any;

                  warnings.push(
                                 {
                                   Code: error.name,
                                   Message: error.message,
                                   Details: await SystemUtilities.processErrorDetails( error )
                                 }
                               );

                  warnings.push(
                                 {
                                   Code: "WARNING_CANNOT_UPDATE_USER_DATA",
                                   Message: "Cannot update the user information.",
                                   Details: {
                                              Avatar: "Avatar field cannot updated"
                                            }
                                 }
                               );

                }

              }

              personData = ( sysPersonInDB as any ).dataValues;

              delete personData.ImageId;
              delete personData.Comment;
              delete personData.ExtraData;

              result = {
                         StatusCode: 200, //Ok
                         Code: "SUCCESS_PROFILE_INFORMATION_CHANGE",
                         Message: await I18NManager.translate( strLanguage, "Success to change the user profile information." ),
                         Mark: "54CAE0BF0C38" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: false,
                         Errors: [],
                         Warnings: warnings,
                         Count: 1,
                         Data: [
                                 personData
                               ]
                       }

              bApplyTransaction = true;

            }
            else {

              const error = sysPersonInDB as any;

              result = {
                         StatusCode: 500, //Internal server error
                         Code: "ERROR_UNEXPECTED",
                         Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                         Mark: "FEFFF7F8CFDC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

          }
          else {

            result = {
                       StatusCode: 400, //Bad request
                       Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                       Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                       Mark: "35F2EDA66821" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        }

      }
      else {

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_USER_NOT_FOUND",
                   Message: await I18NManager.translate( strLanguage, "The user %s not found in database", strUserName ),
                   Mark: "C11A63D5568C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_USER_NOT_FOUND",
                               Message: await I18NManager.translate( strLanguage, "The user %s not found in database", strUserName ),
                               Details: null,
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

      sourcePosition.method = this.name + "." + this.setProfile.name;

      const strMark = "59582149A69D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getUser( request: Request,
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

      //ANCHOR getUser
      let userSessionStatus = context.UserSessionStatus;

      let sysUserInDB = await SYSUserService.getBy( {
                                                      Id: request.query.id as string,
                                                      ShortId: request.query.shortId as string,
                                                      Name: request.query.name as string
                                                    },
                                                    null,
                                                    currentTransaction,
                                                    logger );

      const resultCheckUserRoles = this.checkUserRoleLevel( userSessionStatus,
                                                            sysUserInDB,
                                                            "GetUser",
                                                            logger );

      if ( !resultCheckUserRoles.isAuthorizedAdmin &&
           !resultCheckUserRoles.isAuthorizedL03 &&
           !resultCheckUserRoles.isAuthorizedL02 &&
           !resultCheckUserRoles.isAuthorizedL01 ) {

        resultCheckUserRoles.isNotAuthorized = true;

      }

      if ( resultCheckUserRoles.isNotAuthorized ) {

        result = {
                   StatusCode: 403, //Forbidden
                   Code: "ERROR_CANNOT_GET_USER",
                   Message: await I18NManager.translate( strLanguage, "Not allowed to get the user information" ),
                   Mark: "49BC23FE5772" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_CANNOT_GET_USER",
                               Message: await I18NManager.translate( strLanguage, "Not allowed to get the user information" ),
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( !sysUserInDB ) {

        const strMessage = await this.getMessageUser(
                                                      strLanguage,
                                                      {
                                                        Id: request.query.id as string,
                                                        ShortId: request.query.shortId as string,
                                                        Name: request.query.name as string
                                                      }
                                                    );

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_USER_NOT_FOUND",
                   Message: strMessage,
                   Mark: "C0A0710239A6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_USER_NOT_FOUND",
                               Message: strMessage,
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( sysUserInDB instanceof Error ) {

        const error = sysUserInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "FCB0F3218AD0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        let modelData = ( sysUserInDB as any ).dataValues;

        const tempModelData = await SYSUser.convertFieldValues(
                                                                {
                                                                  Data: modelData,
                                                                  FilterFields: 1, //Force to remove fields like password and value
                                                                  TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                  Include: [
                                                                             {
                                                                               model: SYSPerson
                                                                             },
                                                                             {
                                                                               model: SYSUserGroup
                                                                             }
                                                                           ],
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
                   Code: "SUCCESS_GET_USER",
                   Message: await I18NManager.translate( strLanguage, "Success get the user information." ),
                   Mark: "54CAE0BF0C38" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.getUser.name;

      const strMark = "63E5C8D66751" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static checkUserGroupRoleLevel( userSessionStatus: any,
                                  sysUserGroup: {
                                                  Id: string,
                                                  ShortId: string,
                                                  Name: string
                                                },
                                  strActionRole: string,
                                  logger: any ): ICheckUserRoles {

    let result: ICheckUserRoles = {
                                    isAuthorizedAdmin: false,
                                    isAuthorizedL03: false,
                                    isAuthorizedL02: false,
                                    isAuthorizedL01: false,
                                    isNotAuthorized: false
                                  };

    try {

      result.isAuthorizedAdmin = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Administrator#" ) ||
                                                          userSessionStatus.Role.includes( "#BManager_L99#" ): false;

      if ( result.isAuthorizedAdmin === false ) {

        let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Master_L03#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#" + strActionRole + "L03#" ); // "#Create_User_L03#" );

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

  static async getMessageUser( strLanguage: string,
                               by: {
                                     Id: string,
                                     ShortId: string,
                                     Name: string
                                   } ): Promise<string> {

    let strResult = "";

    if ( by.Name ) {

      strResult = await I18NManager.translate( strLanguage, "The user with name %s not found", by.Name );

    }
    else if ( by.Id ) {

      strResult = await I18NManager.translate( strLanguage, "The user with id %s not found", by.Id );

    }
    else if ( by.ShortId ) {

      strResult = await I18NManager.translate( strLanguage, "The user with short id %s not found", by.ShortId );

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

      const strMark = "632D97A75420" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getConfigUserAutoAssignRole( strOperation: string,
                                            strRoles: string,
                                            strUserGroupName: string,
                                            transaction: any,
                                            logger: any ): Promise<string> {

    let strResult = null;

    try {

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_UserAutoRoleAssign.Id,
                                                                             SystemConstants._CONFIG_ENTRY_UserAutoRoleAssign.Owner,
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

      sourcePosition.method = this.name + "." + this.getConfigUserAutoAssignRole.name;

      const strMark = "6C7D124BE728" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static checkUsersEqualsRoleLevel( sysUserInDB: SYSUser,
                                    userSessionStatus: any,
                                    logger: any ): boolean {

    let bResult = false;

    try {

      const sysUserRole = sysUserInDB.Role ? sysUserInDB.Role.split( "," ): [];
      const sysUserGroupRole = sysUserInDB.sysUserGroup.Role ? sysUserInDB.sysUserGroup.Role.split( "," ): [];

      if ( sysUserRole.includes( "#Administrator#" ) ||
           sysUserRole.includes( "#BManager_L99#" ) ||
           sysUserGroupRole.includes( "#Administrator#" ) ||
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

      const strMark = "7BE2B8FC2DCF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async searchUser( request: Request,
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
                                                          userSessionStatus.Role.includes( "#BManager_L99#" ): false;

      let bIsAuthorizedL03 = false;
      let strWhereL03 = "";
      let bIsAuthorizedL02 = false;
      let strWhereL02 = "";
      let bIsAuthorizedL01 = false;
      let strWhereL01 = "";

      if ( bIsAuthorizedAdmin === false ) {

        let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Master_L03#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Search_User_L03#" );

        }

        if ( roleSubTag &&
             roleSubTag.length > 0 ) {

          bIsAuthorizedL03 = true;

          strWhereL03 = CommonUtilities.tranformTagListToWhere( roleSubTag, "B", "Or" );

        }

        roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Master_L02#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Search_User_L02#" );

        }

        if ( roleSubTag &&
            roleSubTag.length > 0 ) {

          bIsAuthorizedL02 = true;

          strWhereL02 = CommonUtilities.tranformTagListToWhere( roleSubTag, "A", "Or" );

        }

        bIsAuthorizedL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Master_L01#" ) ||
                                                    userSessionStatus.Role.includes( "#Search_User_L01#" ): false;

        if ( bIsAuthorizedL01 ) {

          strWhereL01 = " ( B.Id = '" + userSessionStatus.UserGroupId + "' )";

        }

      }

      const strSelectField = SystemUtilities.createSelectAliasFromModels(
                                                                          [
                                                                            SYSUser,
                                                                            SYSUserGroup,
                                                                            SYSPerson
                                                                          ],
                                                                          [
                                                                            "A",
                                                                            "B",
                                                                            "C"
                                                                          ]
                                                                        );

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "searchUser",
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

        if ( bIsAuthorizedL02 ) {

          if ( !strBeforeParenthesis ) {

            strSQL = strSQL + " Or " + strBeforeParenthesis + strWhereL02;

          }
          else {

            strSQL = strSQL + strBeforeParenthesis + strWhereL02;
            strBeforeParenthesis = "";

          }

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

      //if ( DBConnectionManager.currentInstance.options.dialect === "mysql" ) {

      strSQL = strSQL + " LIMIT " + intLimit.toString() + " OFFSET " + ( request.query.offset && !isNaN( request.query.offset as any ) ? request.query.offset : "0" );

      //}

      //ANCHOR dbConnection.query
      const rows = await dbConnection.query( strSQL, {
                                                       raw: true,
                                                       type: QueryTypes.SELECT,
                                                       transaction: currentTransaction
                                                     } );

      const transformedRows = SystemUtilities.transformRowValuesToSingleRootNestedObject( rows, [
                                                                                                  SYSUser,
                                                                                                  SYSUserGroup,
                                                                                                  SYSPerson
                                                                                                ],
                                                                                                [
                                                                                                  "A",
                                                                                                  "B",
                                                                                                  "C"
                                                                                                ] );

      const convertedRows = [];

      for ( const currentRow of transformedRows ) {

        const tempModelData = await SYSUser.convertFieldValues(
                                                                {
                                                                  Data: currentRow,
                                                                  FilterFields: 1, //Force to remove fields like password and value
                                                                  TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                  Include: [
                                                                             {
                                                                               model: SYSPerson
                                                                             },
                                                                             {
                                                                               model: SYSUserGroup
                                                                             }
                                                                           ],
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
                 Mark: "C89386280047" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.searchUser.name;

      const strMark = "52299BDE0903" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async searchCountUser( request: Request,
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
                                                          userSessionStatus.Role.includes( "#BManager_L99#" ): false;

      let bIsAuthorizedL03 = false;
      let strWhereL03 = "";
      let bIsAuthorizedL02 = false;
      let strWhereL02 = "";
      let bIsAuthorizedL01 = false;
      let strWhereL01 = "";

      if ( bIsAuthorizedAdmin === false ) {

        let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Master_L03#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Search_User_L03#" );

        }

        if ( roleSubTag &&
             roleSubTag.length > 0 ) {

          bIsAuthorizedL03 = true;

          strWhereL03 = CommonUtilities.tranformTagListToWhere( roleSubTag, "B", "Or" );

        }

        roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Master_L02#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Search_User_L02#" );

        }

        if ( roleSubTag &&
            roleSubTag.length > 0 ) {

          bIsAuthorizedL02 = true;

          strWhereL02 = CommonUtilities.tranformTagListToWhere( roleSubTag, "A", "Or" );

        }

        bIsAuthorizedL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Master_L01#" ) ||
                                                    userSessionStatus.Role.includes( "#Search_User_L01#" ): false;

        if ( bIsAuthorizedL01 ) {

          strWhereL01 = " ( B.Id = '" + userSessionStatus.UserGroupId + "' )";

        }

      }

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "searchCountUser",
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

        if ( bIsAuthorizedL02 ) {

          if ( !strBeforeParenthesis ) {

            strSQL = strSQL + " Or " + strBeforeParenthesis + strWhereL02;

          }
          else {

            strSQL = strSQL + strBeforeParenthesis + strWhereL02;
            strBeforeParenthesis = "";

          }

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
                 Mark: "C89386280047" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.searchCountUser.name;

      const strMark = "AF049675D770" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      let userSessionStatus = context.UserSessionStatus;

      let bProfileOfAnotherUser = false;

      let strAuthorization = context.Authorization;

      if ( context.UserSessionStatus.Role.includes( "#Administrator#" ) ||
           context.UserSessionStatus.Role.includes( "#BManager_L99#" ) ) {

        if ( request.query.shortToken ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByShortToken( request.query.shortToken as string,
                                                                                                  currentTransaction,
                                                                                                  logger );

          strAuthorization = request.query.shortToken;

        }
        else if ( request.query.token ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByToken( request.query.token as string,
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
                   Mark: "A27B33E165F1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                   Mark: "3D8CA79D0E51" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        let configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_User_Settings.Id,
                                                                             userSessionStatus.UserId,
                                                                             currentTransaction,
                                                                             logger );

        configData = configData.Value ? configData.Value : configData.Default;

        configData = CommonUtilities.parseJSON( configData, logger );

        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_GET_SETTINGS",
                   Message: await I18NManager.translate( strLanguage, "Success get settings" ),
                   Mark: "63AD7918CB3E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      const strMark = "CAE041CFD8FB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      let strAuthorization = context.Authorization;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let userSessionStatus = context.UserSessionStatus;

      let bProfileOfAnotherUser = false;

      if ( context.UserSessionStatus.Role.includes( "#Administrator#" ) ||
           context.UserSessionStatus.Role.includes( "#BManager_L99#" ) ) {

        if ( request.query.shortToken ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByShortToken( request.query.shortToken as string,
                                                                                                  currentTransaction,
                                                                                                  logger );

          strAuthorization = request.query.shortToken;

        }
        else if ( request.query.token ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByToken( request.query.token as string,
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
                   Mark: "A27B33E165F1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                   Mark: "565583BCF8EB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        const configData = await SYSConfigValueDataService.setConfigValueData( SystemConstants._CONFIG_ENTRY_User_Settings.Id,
                                                                               userSessionStatus.UserId,
                                                                               request.body,
                                                                               currentTransaction,
                                                                               logger );

        if ( configData instanceof Error ) {

          const error = configData as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "BA37B863BC6C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Mark: "7AF91E5F4B19" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Mark: "286871B2895A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      const strMark = "D3085AC4BCAC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getRoutes( request: Request,
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

      let strAuthorization = context.Authorization;

      let bProfileOfAnotherUser = false;

      if ( userSessionStatus.Role.includes( "#Administrator#" ) ||
           userSessionStatus.Role.includes( "#BManager_L99#" ) ) {

        if ( request.query.shortToken ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByShortToken( request.query.shortToken as string,
                                                                                                  currentTransaction,
                                                                                                  logger );

          strAuthorization = request.query.shortToken;

        }
        else if ( request.query.token ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByToken( request.query.token as string,
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
                   Mark: "A27B33E165F1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                   StatusCode: 404, //Not found
                   Code: "ERROR_USER_SESSION_NOT_FOUND",
                   Message: await I18NManager.translate( strLanguage, "The session for the token %s not found", strAuthorization ),
                   Mark: "8EF2F7BCEADB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        let routes = await SYSRoleHasRouteService.listRoutesOfRoles( userSessionStatus.Role,
                                                                     context.FrontendId,
                                                                     request.query.format as string,
                                                                     currentTransaction,
                                                                     logger );

        let intCount = 0;

        if ( routes ) {

          intCount = Object.keys( routes ).length;

          /*
          if ( request.query.format === "1" ) {

            intCount = routes.length;

          }
          else {


          }
          */

        }

        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_GET_ROUTES",
                   Message: await I18NManager.translate( strLanguage, "Success get routes" ),
                   Mark: "29DB5C3384E6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: intCount,
                   Data: routes
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

      sourcePosition.method = this.name + "." + this.getRoutes.name;

      const strMark = "41C94BFA2E31" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getActions( request: Request,
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

      let strAuthorization = context.Authorization;

      let bProfileOfAnotherUser = false;

      if ( userSessionStatus &&
           ( userSessionStatus.Role.includes( "#Administrator#" ) ||
             userSessionStatus.Role.includes( "#BManager_L99#" ) ) ) {

        if ( request.query.shortToken ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByShortToken( request.query.shortToken as string,
                                                                                                  currentTransaction,
                                                                                                  logger );

          strAuthorization = request.query.shortToken;

        }
        else if ( request.query.token ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByToken( request.query.token as string,
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
                   Mark: "67BBAF7CF958" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                   StatusCode: 404, //Not found
                   Code: "ERROR_USER_SESSION_NOT_FOUND",
                   Message: await I18NManager.translate( strLanguage, "The session for the token %s not found", strAuthorization ),
                   Mark: "8A28319A3F79" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        let routes = await SYSRoleHasRouteService.listActionsOfRoles( userSessionStatus ? userSessionStatus.Role: "#Public#",
                                                                      context.FrontendId,
                                                                      request.query.format as string,
                                                                      currentTransaction,
                                                                      logger );

        let intCount = 0;

        if ( routes ) {

          intCount = Object.keys( routes ).length;

        }

        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_GET_ACTIONS",
                   Message: await I18NManager.translate( strLanguage, "Success get actions" ),
                   Mark: "5F755F2C8169" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: intCount,
                   Data: [ routes ]
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

      sourcePosition.method = this.name + "." + this.getActions.name;

      const strMark = "2A8E754AB2A9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

}
