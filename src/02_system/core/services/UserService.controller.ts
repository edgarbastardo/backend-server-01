import cluster from 'cluster';

import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,
import {
  //Router,
  Request, json,
  //Response,
  //NextFunction
} from 'express';
import bcrypt from 'bcrypt';
//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import SystemConstants, { ICheckUserRoles } from "../../common/SystemContants";

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
import SYSConfigValueDataService from "../../common/database/services/SYSConfigValueDataService";
import SYSUserService from "../../common/database/services/SYSUserService";
import CommonConstants from "../../common/CommonConstants";
import SecurityServiceController from "./SecurityService.controller";
import SYSUserGroupService from "../../common/database/services/SYSUserGroupService";
import NotificationManager from "../../common/managers/NotificationManager";
import SYSUserSignupService from "../../common/database/services/SYSUserSignupService";
import CipherManager from "../../common/managers/CipherManager";
import SYSPersonService from "../../common/database/services/SYSPersonService";
import I18NManager from "../../common/managers/I18Manager";
import SYSActionTokenService from "../../common/database/services/SYSActionTokenService";
//import JobQueueManager from "../../common/managers/JobQueueManager";
import SYSUserSessionStatusService from '../../common/database/services/SYSUserSessionStatusService';
//import GeoMapGoogle from "../../common/implementations/geomaps/GeoMapGoogle";
import GeoMapManager from "../../common/managers/GeoMapManager";
import { SYSUser } from "../../common/database/models/SYSUser";
//import { ModelToRestAPIServiceController } from './ModelToRestAPIService.controller';
import { SYSPerson } from '../../common/database/models/SYSPerson';
import { SYSUserGroup } from "../../common/database/models/SYSUserGroup";
import SYSRoleHasRouteService from '../../common/database/services/SYSRoleHasRouteService';

const debug = require( 'debug' )( 'UserServiceController' );

export default class UserServiceController {

  static readonly _ID = "UserServiceController";

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
             jsonConfigData[ "#" + strFrontendId + "#" ].userSignupControl ) {

          result.denied = jsonConfigData[ "#" + strFrontendId + "#" ].userSignupControl.denied;
          result.allowed = jsonConfigData[ "#" + strFrontendId + "#" ].userSignupControl.allowed;
          bSet = true;

        }
        else if ( jsonConfigData[ "@__default__@" ] &&
                  jsonConfigData[ "@__default__@" ].userSignupControl ) {

          result.denied = jsonConfigData[ "@__default__@" ].userSignupControl.denied;
          result.allowed = jsonConfigData[ "@__default__@" ].userSignupControl.allowed;
          bSet = true;

        }

      }

      if ( bSet === false &&
          CommonUtilities.isNotNullOrEmpty( configData.Default ) ) {

        const jsonConfigData = CommonUtilities.parseJSON( configData.Default,
                                                          logger );

        if ( jsonConfigData[ "@__default__@" ] &&
             jsonConfigData[ "@__default__@" ].userSignupControl ) {

          result.denied = jsonConfigData[ "@__default__@" ].userSignupControl.denied;
          result.allowed = jsonConfigData[ "@__default__@" ].userSignupControl.allowed;

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

        if ( strDeniedValue === SystemConstants._VALUE_ANY ) {

           intResult = -1; //Explicit denied

        }
        else if ( strDeniedValue.includes( "#" + strKind + "#" ) ) {

           intResult = -1; //Explicit denied

        }

      }

      if ( intResult == 0 &&
          CommonUtilities.isNotNullOrEmpty( strAllowedValue ) ) {

        if ( strAllowedValue === SystemConstants._VALUE_ANY ) {

          intResult = 1; //Explicit allowed

        }
        else if ( strAllowedValue.includes( "#" + strKind + "#" ) ) {

          intResult = 1; //Explicit allowed

        }

      }

      if ( intResult == 0 ) {

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

  static async signup( request: Request,
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

      const bFrontendIdIsAllowed = await this.getFrontendIdIsAllowed( context.FrontendId,
                                                                      request.body.Kind,
                                                                      currentTransaction,
                                                                      logger ) >= 0;

      if ( bFrontendIdIsAllowed ) {

        const signupProcessData = await this.getConfigSignupProcess( request.body.Kind,
                                                                     currentTransaction,
                                                                     logger );

        if ( signupProcessData &&
             signupProcessData.group &&
             signupProcessData.group.trim() !== "" &&
             signupProcessData.group.trim().toLowerCase() !== "@__error__@" ) {

          let rules = {
                        Name: [ 'required', 'min:3', 'regex:/^[a-zA-Z0-9\#\@\.\_\-]+$/g' ],
                        EMail: 'required|emailList', //<-- emailList is a custom validator defined in SystemUtilities.createCustomValidatorSync
                        Phone: 'present|phoneUSList', //<-- phoneUSList is a custom validator defined in SystemUtilities.createCustomValidatorSync
                        FirstName: [ 'required', 'min:2', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                        LastName: [ 'required', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                      };

          const validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                       rules,
                                                                       null,
                                                                       logger );

          if ( validator.passes() ) { //ANCHOR Validate request.body field values

            const checkFieldValueResults = {};

            if ( request.body.Name.includes( "@system.net" ) ) {

              checkFieldValueResults[ "Name" ] = await I18NManager.translate( strLanguage, 'The user name %s is invalid', request.body.Name );

            }

            if ( Object.keys( checkFieldValueResults ).length === 0 ) {

              let strTag = "";

              if ( signupProcessData.group !== "@__FromName__@" ) {

                strTag = !signupProcessData.passwordParameterTag ? "#" + signupProcessData.group + "#" : "";

              }
              else {

                strTag = !signupProcessData.passwordParameterTag ? "#" + request.body.Name + "#" : "";

              };

              strTag = signupProcessData.passwordParameterTag ? signupProcessData.passwordParameterTag : strTag;

              //ANCHOR check password Strength
              const passwordStrengthParameters = await SecurityServiceController.getConfigPasswordStrengthParameters( strTag,
                                                                                                                      currentTransaction,
                                                                                                                      logger );

              const checkPasswordStrengthResult = await SecurityServiceController.checkPasswordStrength( passwordStrengthParameters,
                                                                                                         request.body.Password,
                                                                                                         logger );
              if ( checkPasswordStrengthResult.code === 1 ) {

                const bUserGroupExists = await SYSUserGroupService.checkExistsByName( signupProcessData.group !== "@__FromName__@" ? signupProcessData.group : request.body.Name,
                                                                                      currentTransaction,
                                                                                      logger );

                if ( signupProcessData.createGroup === false &&
                     bUserGroupExists === false ) {

                  result = {
                             StatusCode: 404, //Not found
                             Code: 'ERROR_USER_GROUP_NOT_FOUND',
                             Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s not found', signupProcessData.group, request.body.Kind ),
                             Mark: '49EEF768004F' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_USER_GROUP_NOT_FOUND',
                                         Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s not found', signupProcessData.group, request.body.Kind ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           }

                }
                else if ( signupProcessData.createGroup &&
                          bUserGroupExists ) {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_USER_GROUP_ALREADY_EXISTS',
                             Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s already exists', signupProcessData.group, request.body.Kind ),
                             Mark: '3BAC1FA1D2A2' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_USER_GROUP_ALREADY_EXISTS',
                                         Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s already exists', signupProcessData.group, request.body.Kind ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           }

                }
                else if ( bUserGroupExists &&
                          await SYSUserGroupService.checkDisabledByName( signupProcessData.group !== "@__FromName__@" ? signupProcessData.group : request.body.Name,
                                                                         currentTransaction,
                                                                         logger ) ) {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_USER_GROUP_DISABLED',
                             Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s is disabled. You cannot signup new users', signupProcessData.group, request.body.Kind ),
                             Mark: '88C3AE24AB5E' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_USER_GROUP_DISABLED',
                                         Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s is disabled. You cannot signup new users', signupProcessData.group, request.body.Kind ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           }

                }
                else if ( bUserGroupExists &&
                          await SYSUserGroupService.checkExpiredByName( signupProcessData.group !== "@__FromName__@" ? signupProcessData.group : request.body.Name,
                                                                        currentTransaction,
                                                                        logger ) ) {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_USER_GROUP_EXPIRED',
                             Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s is expired. You cannot signup new users', signupProcessData.group, request.body.Kind ),
                             Mark: '53EC3D039492' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_USER_GROUP_EXPIRED',
                                         Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s is expired. You cannot signup new users', signupProcessData.group, request.body.Kind ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           }

                }
                else if ( await SYSUserService.checkExistsByName( request.body.Name,
                                                                  currentTransaction,
                                                                  logger ) ) {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                             Message: await I18NManager.translate( strLanguage, 'The user name %s already exists.', request.body.Name ),
                             Mark: 'B43E4A5C0D8D' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                                         Message: await I18NManager.translate( strLanguage, 'The user name %s already exists.', request.body.Name ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           }

                }
                else {

                  const strUserName = SystemUtilities.getInfoFromSessionStatus( context.UserSessionStatus,
                                                                                "UserName",
                                                                                logger );
                  const strId = SystemUtilities.getUUIDv4();
                  const strToken = SystemUtilities.hashString( strId,
                                                               2,
                                                               logger ); //CRC32

                  const expireAt = signupProcessData.expireAt !== -1 ? SystemUtilities.getCurrentDateAndTimeIncMinutes( signupProcessData.expireAt ): null;

                  const sysUserSignup = await SYSUserSignupService.createOrUpdate(
                                                                                   {
                                                                                     Id: strId,
                                                                                     Kind: request.body.Kind,
                                                                                     FrontendId: context.FrontendId,
                                                                                     Token: strToken,
                                                                                     Status: signupProcessData.status,
                                                                                     Name: request.body.Name,
                                                                                     FirstName: request.body.FirstName,
                                                                                     LastName: request.body.LastName,
                                                                                     EMail: request.body.EMail,
                                                                                     Phone: CommonUtilities.isNotNullOrEmpty( request.body.Phone ) ? request.body.Phone: null,
                                                                                     Password: request.body.Password,
                                                                                     Comment: CommonUtilities.isNotNullOrEmpty( request.body.Comment ) ? request.body.Comment : null,
                                                                                     CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                                     CreatedAt: null,
                                                                                     ExpireAt: expireAt ? expireAt.format(): null
                                                                                   },
                                                                                   false,
                                                                                   currentTransaction,
                                                                                   logger
                                                                                 );

                  if ( sysUserSignup !== null &&
                       sysUserSignup instanceof Error === false ) {

                    if ( signupProcessData.status === 1 ) { //Automatic send activation code to email address

                      const configData = await this.getConfigGeneralDefaultInformation( currentTransaction,
                                                                                        logger );

                      const strTemplateKind = await this.isWebFrontendClient( context.FrontendId,
                                                                              currentTransaction,
                                                                              logger ) ? "web" : "mobile";

                      const strWebAppURL = await this.getConfigFrontendRules( context.FrontendId,
                                                                              "url",
                                                                              currentTransaction,
                                                                              logger );

                      const strExpireAtInTimeZone = expireAt ? SystemUtilities.transformToTimeZone( expireAt.format(),
                                                                                                    context.TimeZoneId,
                                                                                                    CommonConstants._DATE_TIME_LONG_FORMAT_04,
                                                                                                    logger ): null;

                      //ANCHOR Send immediately the mail for auto activate the new user account
                      if ( await NotificationManager.send(
                                                           "email",
                                                           {
                                                             from: configData[ "no_response_email" ] || "no-response@no-response.com",
                                                             to: request.body.EMail,
                                                             subject: await I18NManager.translate( strLanguage, "SIGNUP FOR NEW USER ACCOUNT" ),
                                                             body: {
                                                                     kind: "template",
                                                                     file: `email-user-signup-${strTemplateKind}.pug`,
                                                                     language: context.Language,
                                                                     variables: {
                                                                                  user_name: request.body.Name,
                                                                                  activation_code: strToken,
                                                                                  web_app_url: strWebAppURL,
                                                                                  expire_at: strExpireAtInTimeZone ? strExpireAtInTimeZone : null,
                                                                                  ... configData
                                                                                }
                                                                     //kind: "embedded",
                                                                     //text: "Hello",
                                                                     //html: "<b>Hello</b>"
                                                                   }
                                                           },
                                                           logger
                                                         ) ) {

                        result = {
                                   StatusCode: 200, //Ok
                                   Code: 'SUCCESS_USER_SIGNUP',
                                   Message: await I18NManager.translate( strLanguage, 'Success to made the user signup. Now you need check for your mailbox' ),
                                   Mark: 'B3F0B0AF21AC' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                                   StatusCode: 500, //Internal server error //ok
                                   Code: 'ERROR_USER_SIGNUP_CANNOT_SEND_EMAIL',
                                   Message: await I18NManager.translate( strLanguage, 'Error cannot send the email to requested address' ),
                                   Mark: '5B91FA66FE6D' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   LogId: null,
                                   IsError: true,
                                   Errors: [
                                             {
                                               Code: 'ERROR_USER_SIGNUP_CANNOT_SEND_EMAIL',
                                               Message: await I18NManager.translate( strLanguage, 'Error cannot send the email to requested address' ),
                                               Details: {
                                                         EMail: request.body.EMail
                                                       }
                                             }
                                           ],
                                   Warnings: [],
                                   Count: 0,
                                   Data: []
                                 }

                      }

                    }
                    else { //Manual activation

                      result = {
                                 StatusCode: 200, //Ok
                                 Code: 'SUCCESS_USER_SIGNUP_MANUAL_ACTIVATION',
                                 Message: await I18NManager.translate( strLanguage, 'Success to made the user signup. But you need wait to system administrator activate your new account' ),
                                 Mark: 'AE4751429BC8' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                 LogId: null,
                                 IsError: false,
                                 Errors: [],
                                 Warnings: [],
                                 Count: 0,
                                 Data: []
                               }

                      bApplyTransaction = true;

                    }

                  }
                  else if ( sysUserSignup instanceof Error  ) {

                    const error = sysUserSignup as any;

                    result = {
                               StatusCode: 500, //Internal server error
                               Code: 'ERROR_UNEXPECTED',
                               Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                               Mark: '619404BC65B1' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

              }
              else {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_PASSWORD_NOT_VALID',
                           Message: await I18NManager.translate( strLanguage, 'The password is not valid' ),
                           Mark: '24742802D110' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_CHECK_FIELD_VALUES_FAILED',
                         Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid' ),
                         Mark: '2AE9478D6D22' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_CHECK_FIELD_VALUES_FAILED',
                                     Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid' ),
                                     Details: checkFieldValueResults
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
                       Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                       Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid' ),
                       Mark: 'F01229E593EE' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                                   Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid' ),
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
                     Code: 'ERROR_SIGNUP_KIND_NOT_VALID',
                     Message: await I18NManager.translate( strLanguage, 'The signup kind %s is not valid', request.body.Kind ),
                     Mark: 'E0E3A7CC1A6A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_SIGNUP_KIND_NOT_VALID',
                                 Message: await I18NManager.translate( strLanguage, 'The signup kind %s is not valid', request.body.Kind ),
                                 Details: null
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
                   Code: 'ERROR_FRONTEND_KIND_NOT_ALLOWED',
                   Message: await I18NManager.translate( strLanguage, 'Not allowed to signup from this the kind of frontend' ),
                   Mark: '9333A33809AD' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_FRONTEND_KIND_NOT_ALLOWED',
                               Message: await I18NManager.translate( strLanguage, 'Not allowed to signup from this the kind of frontend' ),
                               Details: null
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

      sourcePosition.method = this.name + "." + this.signup.name;

      const strMark = "309DBDE7EEAF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async signupActivate( request: Request,
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

      let sysUserSignupInDB = await SYSUserSignupService.getByToken( request.body.Activation,
                                                                  context.TimeZoneId,
                                                                  currentTransaction,
                                                                  logger );

      if ( sysUserSignupInDB !== null &&
           sysUserSignupInDB instanceof Error === false ) {

        if ( sysUserSignupInDB.Status >= 0 && sysUserSignupInDB.Status < 50 ) {

          if ( !sysUserSignupInDB.ExpireAt ||
              SystemUtilities.isDateAndTimeBefore( sysUserSignupInDB.ExpireAt ) ) {

            const bFrontendIdIsAllowed = await this.getFrontendIdIsAllowed( context.FrontendId,
                                                                            sysUserSignupInDB.Kind,
                                                                            currentTransaction,
                                                                            logger ) >= 0;

            if ( bFrontendIdIsAllowed ) {

              const signupProcessData = await this.getConfigSignupProcess( sysUserSignupInDB.Kind,
                                                                           currentTransaction,
                                                                           logger );

              if ( signupProcessData &&
                   signupProcessData.group &&
                   signupProcessData.group.trim() !== "" &&
                   signupProcessData.group.trim().toLowerCase() !== "@__error__@" ) {

                const bUserGroupExists = await SYSUserGroupService.checkExistsByName( signupProcessData.group !== "@__FromName__@" ? signupProcessData.group : sysUserSignupInDB.Name,
                                                                                      currentTransaction,
                                                                                      logger );

                if ( signupProcessData.createGroup === false &&
                     bUserGroupExists === false ) {

                  result = {
                             StatusCode: 404, //Not found
                             Code: 'ERROR_USER_GROUP_NOT_FOUND',
                             Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s not found', signupProcessData.group, sysUserSignupInDB.Kind ),
                             Mark: '0EA9AC54E217' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_USER_GROUP_NOT_FOUND',
                                         Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s not found', signupProcessData.group, sysUserSignupInDB.Kind ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           }

                }
                else if ( signupProcessData.createGroup &&
                          bUserGroupExists ) {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_USER_GROUP_ALREADY_EXISTS',
                             Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s already exists', signupProcessData.group, sysUserSignupInDB.Kind ),
                             Mark: '832157FFA57C' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_USER_GROUP_ALREADY_EXISTS',
                                         Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s already exists', signupProcessData.group, sysUserSignupInDB.Kind ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           }

                }
                else if ( bUserGroupExists &&
                          await SYSUserGroupService.checkDisabledByName( signupProcessData.group !== "@__FromName__@" ? signupProcessData.group : sysUserSignupInDB.Name,
                                                                         currentTransaction,
                                                                         logger ) ) {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_USER_GROUP_DISABLED',
                             Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s is disabled. You cannot signup new users', signupProcessData.group, sysUserSignupInDB.Kind ),
                             Mark: '74E11EE1CFE2' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_USER_GROUP_DISABLED',
                                         Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s is disabled. You cannot signup new users', signupProcessData.group, sysUserSignupInDB.Kind ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           }

                }
                else if ( bUserGroupExists &&
                          await SYSUserGroupService.checkExpiredByName( signupProcessData.group !== "@__FromName__@" ? signupProcessData.group : sysUserSignupInDB.Name,
                                                                        currentTransaction,
                                                                        logger ) ) {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_USER_GROUP_EXPIRED',
                             Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s is expired. You cannot signup new users', signupProcessData.group, sysUserSignupInDB.Kind ),
                             Mark: '2E99F86FF13B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_USER_GROUP_EXPIRED',
                                         Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s is expired. You cannot signup new users', signupProcessData.group, sysUserSignupInDB.Kind ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           }

                }
                else if ( await SYSUserService.checkExistsByName( sysUserSignupInDB.Name,
                                                                  currentTransaction,
                                                                  logger ) ) {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                             Message: await I18NManager.translate( strLanguage, 'The user name %s already exists.', sysUserSignupInDB.Name ),
                             Mark: '46F913842BF5' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                                         Message: await I18NManager.translate( strLanguage, 'The user name %s already exists.', sysUserSignupInDB.Name ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           }

                }
                else {

                  //ANCHOR Extract username
                  const strUserName = SystemUtilities.getInfoFromSessionStatus( context.UserSessionStatus,
                                                                                "UserName",
                                                                                logger );

                  let sysUserGroup = null;
                  let sysUser = null;
                  let sysPerson = null;

                  if ( signupProcessData.createGroup ) {

                    const expireAt = signupProcessData.groupExpireAt !== -1 ? SystemUtilities.getCurrentDateAndTimeIncMinutes( signupProcessData.groupExpireAt ): null;

                    const strRole = signupProcessData.groupRole.replace( "@__FromName__@", sysUserSignupInDB.Name );

                    const strTag = signupProcessData.groupTag.replace( "@__FromName__@", sysUserSignupInDB.Name );

                    //Create new group
                    sysUserGroup = await SYSUserGroupService.createOrUpdate(
                                                                             {
                                                                               Name: sysUserSignupInDB.Name,
                                                                               Role: strRole ? strRole: null,
                                                                               Tag: strTag ? strTag: null,
                                                                               ExpireAt: expireAt ? expireAt.format(): null,
                                                                               CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                               Comment: sysUserSignupInDB.Comment
                                                                             },
                                                                             false,
                                                                             currentTransaction,
                                                                             logger
                                                                           );

                  }
                  else {

                    sysUserGroup = await SYSUserGroupService.getByName( signupProcessData.group,
                                                                        context.TimeZoneId,
                                                                        currentTransaction,
                                                                        logger );

                  }

                  if ( sysUserGroup &&
                       sysUserGroup instanceof Error === false ) {

                    sysPerson = await SYSPersonService.createOrUpdate(
                                                                       {
                                                                         FirstName: sysUserSignupInDB.FirstName,
                                                                         LastName: sysUserSignupInDB.LastName,
                                                                         Phone: sysUserSignupInDB.Phone ? sysUserSignupInDB.Phone : null,
                                                                         EMail: sysUserSignupInDB.EMail,
                                                                         Comment: sysUserSignupInDB.Comment ? sysUserSignupInDB.Comment : null,
                                                                         CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                       },
                                                                       false,
                                                                       currentTransaction,
                                                                       logger
                                                                     );

                    if ( sysPerson &&
                         sysPerson instanceof Error === false ) {

                      const strPassword = await CipherManager.decrypt( sysUserSignupInDB.Password, logger );

                      const expireAt = signupProcessData.userExpireAt !== -1 ? SystemUtilities.getCurrentDateAndTimeIncMinutes( signupProcessData.userExpireAt ) : null;

                      const strRole = signupProcessData.userRole.replace( "@__FromName__@", sysUserSignupInDB.Name );

                      const strTag = signupProcessData.userTag.replace( "@__FromName__@", sysUserSignupInDB.Name );

                      //ANCHOR Create new user
                      sysUser = await SYSUserService.createOrUpdate(
                                                                     {
                                                                       Id: sysPerson.Id,
                                                                       PersonId: sysPerson.Id,
                                                                       GroupId: sysUserGroup.Id,
                                                                       Name: sysUserSignupInDB.Name,
                                                                       Password: strPassword,
                                                                       Role: strRole ? strRole : null,
                                                                       Tag: strTag ? strTag : null,
                                                                       ExpireAt: expireAt ? expireAt.format(): null,
                                                                       Comment: sysUserSignupInDB.Comment,
                                                                       CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                     },
                                                                     false,
                                                                     currentTransaction,
                                                                     logger
                                                                   );

                      if ( sysUser &&
                           sysUser instanceof Error === false ) {

                        const warnings = [];

                        sysUserSignupInDB.Status = 50; //Activated
                        sysUserSignupInDB.UpdatedBy = strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET;

                        sysUserSignupInDB = await SYSUserSignupService.createOrUpdate( ( sysUserSignupInDB as any ).dataValues,
                                                                                       true,
                                                                                       currentTransaction,
                                                                                       logger );

                        if ( sysUserSignupInDB instanceof Error ) {

                          const error = sysUserSignupInDB as any;

                          warnings.push(
                                         {
                                           Code: error.name,
                                           Message: error.message,
                                           Details: await SystemUtilities.processErrorDetails( error )
                                         }
                                       );

                          warnings.push(
                                         {
                                           Code: "WARNING_FAILED_UPDATE_SIGNUP_STATUS",
                                           Message: await I18NManager.translate( strLanguage, "Failed to update the signup status." ),
                                           Details: null
                                         }
                                       );

                        }

                        //ANCHOR send email success
                        const configData = await this.getConfigGeneralDefaultInformation( currentTransaction,
                                                                                          logger );

                        const strTemplateKind = await this.isWebFrontendClient( context.FrontendId,
                                                                                currentTransaction,
                                                                                logger ) ? "web" : "mobile";

                        const strWebAppURL = await this.getConfigFrontendRules( context.FrontendId,
                                                                                "url",
                                                                                currentTransaction,
                                                                                logger );

                        if ( await NotificationManager.send(
                                                             "email",
                                                             {
                                                               from: configData[ "no_response_email" ] || "no-response@no-response.com",
                                                               to: sysUserSignupInDB.EMail,
                                                               subject: await I18NManager.translate( strLanguage, "USER ACCOUNT ACTIVATION SUCCESS" ),
                                                               body: {
                                                                       kind: "template",
                                                                       file: `email-user-activation-${strTemplateKind}.pug`,
                                                                       language: context.Language,
                                                                       variables: {
                                                                                    user_name: sysUserSignupInDB.Name,
                                                                                    user_password: CommonUtilities.maskPassword( strPassword ),
                                                                                    web_app_url: strWebAppURL,
                                                                                    ... configData
                                                                                  }
                                                                       //kind: "embedded",
                                                                       //text: "Hello",
                                                                       //html: "<b>Hello</b>"
                                                                     }
                                                             },
                                                             logger
                                                           ) === false ) {

                          warnings.push(
                                         {
                                           Code: "WARNING_CANNOT_SEND_EMAIL",
                                           Message: await I18NManager.translate( strLanguage, "Cannot send the notification email to the user" ),
                                           Details: {
                                                      Reason: await I18NManager.translate( strLanguage, "The transport returned false" )
                                                    }
                                         }
                                       );

                        }

                        result = {
                                   StatusCode: 200, //Ok
                                   Code: 'SUCCESS_USER_ACTIVATION',
                                   Message: await I18NManager.translate( strLanguage, 'Success to made the user activation' ),
                                   Mark: '1E74B6B63B07' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   LogId: null,
                                   IsError: false,
                                   Errors: [],
                                   Warnings: warnings,
                                   Count: 0,
                                   Data: []
                                 }

                        bApplyTransaction = true;

                      }
                      else {

                        const error = sysUser as any;

                        result = {
                                   StatusCode: 500, //Internal server error
                                   Code: 'ERROR_UNEXPECTED',
                                   Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                                   Mark: '0FA42BB1DE80' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

                      const error = sysPerson as any;

                      result = {
                                 StatusCode: 500, //Internal server error
                                 Code: 'ERROR_UNEXPECTED',
                                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                                 Mark: 'AB370C6C4B51' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                  else if ( sysUserGroup instanceof Error  ) {

                    const error = sysUserGroup as any;

                    result = {
                               StatusCode: 500, //Internal server error
                               Code: 'ERROR_UNEXPECTED',
                               Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                               Mark: '91F9DE73ECDB' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

              }
              else {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_SIGNUP_KIND_NOT_VALID',
                           Message: await I18NManager.translate( strLanguage, 'The signup kind %s is not valid', sysUserSignupInDB.Kind ),
                           Mark: 'C632418EF717' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_SIGNUP_KIND_NOT_VALID',
                                       Message: await I18NManager.translate( strLanguage, 'The signup kind %s is not valid', sysUserSignupInDB.Kind ),
                                       Details: null
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
                         Code: 'ERROR_FRONTEND_KIND_NOT_ALLOWED',
                         Message: await I18NManager.translate( strLanguage, 'Not allowed to signup from this the kind of frontend' ),
                         Mark: '2A8CD841F553' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_FRONTEND_KIND_NOT_ALLOWED',
                                     Message: await I18NManager.translate( strLanguage, 'Not allowed to signup from this the kind of frontend' ),
                                     Details: null
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
                       Code: 'ERROR_ACTIVATION_CODE_EXPIRED',
                       Message: await I18NManager.translate( strLanguage, 'Activation code is expired' ),
                       Mark: 'B212EA552AEA' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_ACTIVATION_CODE_EXPIRED',
                                   Message: await I18NManager.translate( strLanguage, 'Activation code is expired' ),
                                   Details: sysUserSignupInDB.ExpireAt
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }

        }
        else if ( sysUserSignupInDB.Status === 50 ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: 'ERROR_ACTIVATION_CODE_ALREADY_USED',
                     Message: await I18NManager.translate( strLanguage, 'Activation code is already used' ),
                     Mark: 'B212EA552AEA' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_ACTIVATION_CODE_ALREADY_USED',
                                 Message: await I18NManager.translate( strLanguage, 'Activation code is already used' ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else {

          result = {
                     StatusCode: 400, //Bad request
                     Code: 'ERROR_ACTIVATION_CODE_INVALID_STATUS',
                     Message: await I18NManager.translate( strLanguage, 'Activation code has invalid status' ),
                     Mark: '925EA3C66617' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_ACTIVATION_CODE_INVALID_STATUS',
                                 Message: await I18NManager.translate( strLanguage, 'Activation code has invalid status' ),
                                 Details: null
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
                   StatusCode: 404, //Not found
                   Code: 'ERROR_ACTIVATION_CODE_NOT_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'Activation code is not found' ),
                   Mark: '7A446BC21A83' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_ACTIVATION_CODE_NOT_FOUND',
                               Message: await I18NManager.translate( strLanguage, 'Activation code is not found' ),
                               Details: null
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

      sourcePosition.method = this.name + "." + this.signupActivate.name;

      const strMark = "5362D0AECBD3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async passwordRecoverCodeSend( request: Request,
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

      const intCount = await SYSActionTokenService.getCountActionTokenOnLastMinutes( "password_recover",
                                                                                     request.body.Name,
                                                                                     10,
                                                                                     currentTransaction,
                                                                                     logger );

      if ( intCount < 20 ) {

        const sysUserInDB = await SYSUserService.getByName( request.body.Name,
                                                            context.TimeZoneId,
                                                            transaction,
                                                            logger );

        if ( sysUserInDB != null &&
             sysUserInDB instanceof Error === false ) {

          if ( await SYSUserGroupService.checkDisabledByName( sysUserInDB.sysUserGroup.Name,
                                                              currentTransaction,
                                                              logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_GROUP_DISABLED',
                       Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot recover your password', sysUserInDB.sysUserGroup.Name ),
                       Mark: '39212A25A17D' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_GROUP_DISABLED',
                                   Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot recover your password', sysUserInDB.sysUserGroup.Name ),
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
                       Code: 'ERROR_USER_GROUP_EXPIRED',
                       Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot recover your password', sysUserInDB.sysUserGroup.Name ),
                       Mark: '2E99F86FF13B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_GROUP_EXPIRED',
                                   Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot recover your password', sysUserInDB.sysUserGroup.Name ),
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
                       Code: 'ERROR_USER_DISABLED',
                       Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot recover your password', sysUserInDB.Name ),
                       Mark: '231463F16B95' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_DISABLED',
                                   Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot recover your password', sysUserInDB.Name ),
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
                       Code: 'ERROR_USER_EXPIRED',
                       Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot recover your password', sysUserInDB.Name ),
                       Mark: '55C127F50C3B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_EXPIRED',
                                   Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot recover your password', sysUserInDB.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else {

            //ANCHOR userInDB
            const strTransport = CommonUtilities.toLowerCase( request.body.Transport );

            if ( !strTransport ||
                 strTransport === "email" ) {

              if ( !sysUserInDB.sysPerson ||
                   CommonUtilities.isValidEMailList( sysUserInDB.sysPerson.EMail ) === false ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_NOT_VALID_EMAIL',
                           Message: await I18NManager.translate( strLanguage, 'The user %s not have a valid email address', request.body.Name ),
                           Mark: 'CBFE3C19AA9C' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_NOT_VALID_EMAIL',
                                       Message: await I18NManager.translate( strLanguage, 'The user %s not have a valid email address', request.body.Name ),
                                       Details: null,
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }

            }
            else if ( strTransport === "sms" ) {

              if ( !sysUserInDB.sysPerson ||
                   CommonUtilities.isValidPhoneNumberList( sysUserInDB.sysPerson.Phone ) === false ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_NOT_VALID_PHONE_NUMBER',
                           Message: await I18NManager.translate( strLanguage, 'The user %s not have a valid phone number', request.body.Name ),
                           Mark: 'CBFE3C19AA9C' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_NOT_VALID_PHONE_NUMBER',
                                       Message: await I18NManager.translate( strLanguage, 'The user %s not have a valid phone number', request.body.Name ),
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
                         Code: 'ERROR_TRANSPORT_NOT_SUPPORTED',
                         Message: await I18NManager.translate( strLanguage, 'The transport %s is not supported', strTransport ),
                         Mark: '2E4BC9D07111' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_TRANSPORT_NOT_SUPPORTED',
                                     Message: await I18NManager.translate( strLanguage, 'The transport %s is not supported', strTransport ),
                                     Details: null,
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }

            if ( result === null ) {

              //Use the config of _CONFIG_ENTRY_Frontend_Rules.userLoginControl
              const bFrontendIdIsAllowed = await SecurityServiceController.getFrontendIdIsAllowed( context.FrontendId,
                                                                                                   sysUserInDB.sysUserGroup.Id,
                                                                                                   sysUserInDB.sysUserGroup.Name,
                                                                                                   sysUserInDB.sysUserGroup.Tag,
                                                                                                   sysUserInDB.Id,
                                                                                                   sysUserInDB.Name,
                                                                                                   sysUserInDB.Tag,
                                                                                                   currentTransaction,
                                                                                                   logger ) >= 0;

              if ( bFrontendIdIsAllowed ) {

                //ANCHOR FroentIdIsAllowed
                const strUserName = SystemUtilities.getInfoFromSessionStatus( context.UserSessionStatus,
                                                                              "UserName",
                                                                              logger );

                const strRecoverCode = SystemUtilities.hashString( SystemUtilities.getCurrentDateAndTime().format(), 1, logger );

                const expireAt = SystemUtilities.getCurrentDateAndTimeIncMinutes( 60 );

                const sysActionToken = await SYSActionTokenService.createOrUpdate(
                                                                                   {
                                                                                     Kind: "password_recover",
                                                                                     Owner: sysUserInDB.Id,
                                                                                     Token: strRecoverCode,
                                                                                     Status: 1,
                                                                                     CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                                     ExpireAt: expireAt.format(),
                                                                                     ExtraData: JSON.stringify( { UserName: sysUserInDB.Name } )
                                                                                   },
                                                                                   false,
                                                                                   currentTransaction,
                                                                                   logger
                                                                                 );

                if ( sysActionToken &&
                     sysActionToken instanceof Error === false ) {

                  if ( strTransport === "email" ) {

                    const configData = await this.getConfigGeneralDefaultInformation( currentTransaction,
                                                                                      logger );

                    const strTemplateKind = await this.isWebFrontendClient( context.FrontendId,
                                                                            currentTransaction,
                                                                            logger ) ? "web" : "mobile";

                    const strWebAppURL = await this.getConfigFrontendRules( context.FrontendId,
                                                                            "url",
                                                                            currentTransaction,
                                                                            logger );

                    const strExpireAtInTimeZone = expireAt ? SystemUtilities.transformToTimeZone( expireAt.format(),
                                                                                                  context.TimeZoneId,
                                                                                                  CommonConstants._DATE_TIME_LONG_FORMAT_04,
                                                                                                  logger ): null;

                    //Send immediately the mail for auto activate the new user account
                    if ( await NotificationManager.send(
                                                        "email",
                                                        {
                                                          from: configData[ "no_response_email" ] || "no-response@no-response.com",
                                                          to: sysUserInDB.sysPerson.EMail,
                                                          subject: await I18NManager.translate( strLanguage, "PASSWORD RECOVER CODE" ),
                                                          body: {
                                                                  kind: "template",
                                                                  file: `email-user-recover-password-${strTemplateKind}.pug`,
                                                                  language: context.Language,
                                                                  variables: {
                                                                               user_name: request.body.Name,
                                                                               web_app_url: strWebAppURL,
                                                                               recover_code: strRecoverCode,
                                                                               expire_at: strExpireAtInTimeZone ? strExpireAtInTimeZone : null,
                                                                               ... configData
                                                                             }
                                                                  //kind: "embedded",
                                                                  //text: "Hello",
                                                                  //html: "<b>Hello</b>"
                                                                }
                                                        },
                                                        logger
                                                      ) ) {

                      result = {
                                 StatusCode: 200, //Ok
                                 Code: 'SUCCESS_SEND_RECOVER_PASSWORD_CODE_EMAIL',
                                 Message: await I18NManager.translate( strLanguage, 'Success to send recover password code. Please check your mailbox' ),
                                 Mark: 'C4F1AF9E67C3' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                 LogId: null,
                                 IsError: false,
                                 Errors: [],
                                 Warnings: [],
                                 Count: 1,
                                 Data: [
                                         {
                                           EMail: CommonUtilities.maskEMailList( sysUserInDB.sysPerson.EMail )
                                         }
                                       ]
                               }

                      bApplyTransaction = true;

                    }
                    else {

                      result = {
                                 StatusCode: 500, //Internal server error
                                 Code: 'ERROR_SEND_RECOVER_PASSWORD_CODE_EMAIL',
                                 Message: await I18NManager.translate( strLanguage, 'Error cannot send the email to requested address' ),
                                 Mark: 'D77EDF617B8B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                 LogId: null,
                                 IsError: true,
                                 Errors: [
                                           {
                                             Code: 'ERROR_SEND_RECOVER_PASSWORD_CODE_EMAIL',
                                             Message: await I18NManager.translate( strLanguage, 'Error cannot send the email to requested address' ),
                                             Details: {
                                                        EMail: CommonUtilities.maskEMailList( sysUserInDB.sysPerson.EMail )
                                                      }
                                           }
                                         ],
                                 Warnings: [],
                                 Count: 0,
                                 Data: []
                               }

                    }

                  }
                  else if ( strTransport === "sms" ) {

                    if ( await NotificationManager.send(
                                                         "sms",
                                                         {
                                                           to: sysUserInDB.sysPerson.Phone,
                                                           //context: "AMERICA/NEW_YORK",
                                                           foreign_data: `{ "user": ${strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET}  }`,
                                                           //device_id: "*",
                                                           body: {
                                                                   kind: "self",
                                                                   text: await I18NManager.translate( strLanguage, 'Your recover password code is: %s', strRecoverCode )
                                                                 }
                                                         },
                                                         logger
                                                       ) ) {

                      result = {
                                 StatusCode: 200, //Ok
                                 Code: 'SUCCESS_SEND_RECOVER_PASSWORD_CODE_SMS',
                                 Message: await I18NManager.translate( strLanguage, 'Success to send recover password code. Please check your phone' ),
                                 Mark: 'C4F1AF9E67C3' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                 LogId: null,
                                 IsError: false,
                                 Errors: [],
                                 Warnings: [],
                                 Count: 1,
                                 Data: [
                                         {
                                           Phone: CommonUtilities.maskPhoneList( sysUserInDB.sysPerson.Phone )
                                         }
                                       ]
                               }

                      bApplyTransaction = true;

                    }
                    else {

                      result = {
                                 StatusCode: 500, //Internal server error
                                 Code: 'ERROR_SEND_RECOVER_PASSWORD_CODE_SMS',
                                 Message: await I18NManager.translate( strLanguage, 'Error cannot send the sms to requested phone number' ),
                                 Mark: 'C21B85AD2EE1' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                 LogId: null,
                                 IsError: true,
                                 Errors: [
                                           {
                                             Code: 'ERROR_SEND_RECOVER_PASSWORD_CODE_SMS',
                                             Message: await I18NManager.translate( strLanguage, 'Error cannot send the sms to requested phone number' ),
                                             Details: {
                                                        EMail: CommonUtilities.maskPhoneList( sysUserInDB.sysPerson.Phone )
                                                      }
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

                  const error = sysActionToken as any;

                  result = {
                             StatusCode: 500, //Internal server error
                             Code: 'ERROR_UNEXPECTED',
                             Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                             Mark: 'DF70E9F0151D' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                           Code: 'ERROR_FRONTEND_KIND_NOT_ALLOWED',
                           Message: await I18NManager.translate( strLanguage, 'Not allowed to recover password from this the kind of frontend' ),
                           Mark: '1B365FFB8CCB' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_FRONTEND_KIND_NOT_ALLOWED',
                                       Message: await I18NManager.translate( strLanguage, 'Not allowed to recover password from this the kind of frontend' ),
                                       Details: null
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }

            }

          }

        }
        else {

          result = {
                     StatusCode: 404, //Not found
                     Code: 'ERROR_USER_NOT_FOUND',
                     Message: await I18NManager.translate( strLanguage, 'The user %s not found in database', request.body.Name ),
                     Mark: '7D761301ED89' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_NOT_FOUND',
                                 Message: await I18NManager.translate( strLanguage, 'The user %s not found in database', request.body.Name ),
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

        const strMark = "D1DC7AD9A293" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

        result = {
                   StatusCode: 429, //Too Many Requests
                   Code: 'ERROR_TOO_MANY_RECOVER_REQUEST',
                   Message: await I18NManager.translate( strLanguage, 'The user %s has too many password recovery requests', request.body.Name ),
                   Mark: strMark,
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_TOO_MANY_RECOVER_REQUEST',
                               Message: await I18NManager.translate( strLanguage, 'The user %s has too many password recovery requests', request.body.Name ),
                               Details: { Count: intCount, Comment: "In last 10 minutes" }
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

        const debugMark = debug.extend( strMark );

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( 'The user %s has too many password recovery requests', request.body.Name );

        if ( logger &&
             typeof logger.warning === "function" ) {

          logger.warning( 'The user %s has too many password recovery requests', request.body.Name );

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

      sourcePosition.method = this.name + "." + this.passwordRecoverCodeSend.name;

      const strMark = "1BC6AC3165D4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async passwordRecover( request: Request,
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

      const sysActionTokenInDB = await SYSActionTokenService.getByToken( request.body.Code,
                                                                         "password_recover",
                                                                         context.TimeZoneId,
                                                                         transaction,
                                                                         logger );

      if ( sysActionTokenInDB !== null &&
           sysActionTokenInDB instanceof Error === false ) {

        if ( sysActionTokenInDB.ExpireAt &&
             SystemUtilities.isDateAndTimeBefore( sysActionTokenInDB.ExpireAt ) ) {

          if ( sysActionTokenInDB.Status === 1 ) { //Waiting for use

            const sysUserInDB = await SYSUserService.getById( sysActionTokenInDB.Owner,
                                                              context.TimeZoneId,
                                                              transaction,
                                                              logger );

            if ( sysUserInDB != null &&
                 sysUserInDB instanceof Error === false ) {

              if ( await SYSUserGroupService.checkDisabledByName( sysUserInDB.sysUserGroup.Name,
                                                                  currentTransaction,
                                                                  logger ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_USER_GROUP_DISABLED',
                           Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot recover your password', sysUserInDB.sysUserGroup.Name ),
                           Mark: '63C9C6FBCB8F' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_GROUP_DISABLED',
                                       Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot recover your password', sysUserInDB.sysUserGroup.Name ),
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
                           Code: 'ERROR_USER_GROUP_EXPIRED',
                           Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot recover your password', sysUserInDB.sysUserGroup.Name ),
                           Mark: '9471EA8763E3' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_GROUP_EXPIRED',
                                       Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot recover your password', sysUserInDB.sysUserGroup.Name ),
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
                           Code: 'ERROR_USER_DISABLED',
                           Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot recover your password', sysUserInDB.Name ),
                           Mark: 'D013A4C4C1D6' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_DISABLED',
                                       Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot recover your password', sysUserInDB.Name ),
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
                           Code: 'ERROR_USER_EXPIRED',
                           Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot recover your password', sysUserInDB.Name ),
                           Mark: '5EE4EEA9A907' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_EXPIRED',
                                       Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot recover your password', sysUserInDB.Name ),
                                       Details: null
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }
              else {

                const strTag = "#" + sysUserInDB.Id + "#,#" + sysUserInDB.Name + "#,#" + sysUserInDB.sysUserGroup.Id + "#,#" + sysUserInDB.sysUserGroup.Name + "#";

                //ANCHOR check password Strength
                const passwordStrengthParameters = await SecurityServiceController.getConfigPasswordStrengthParameters( strTag,
                                                                                                                        currentTransaction,
                                                                                                                        logger );

                const checkPasswordStrengthResult = await SecurityServiceController.checkPasswordStrength( passwordStrengthParameters,
                                                                                                          request.body.Password,
                                                                                                          logger );
                if ( checkPasswordStrengthResult.code === 1 ) {

                  const strUserName = SystemUtilities.getInfoFromSessionStatus( context.UserSessionStatus,
                                                                                "UserName",
                                                                                logger );

                  sysUserInDB.Password = request.body.Password;
                  sysUserInDB.PasswordSetAt = SystemUtilities.getCurrentDateAndTime().format();
                  sysUserInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

                  const sysUserWithPasswordChanged = SYSUserService.createOrUpdate( ( sysUserInDB as any ).dataValues,
                                                                                    true,
                                                                                    currentTransaction,
                                                                                    logger );

                  if ( sysUserWithPasswordChanged !== null &&
                      sysUserWithPasswordChanged instanceof Error === false ) {

                    sysActionTokenInDB.Status = 0;
                    sysActionTokenInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

                    const warnings = [];

                    const sysActionTokenUpdated = await SYSActionTokenService.createOrUpdate( ( sysActionTokenInDB as any ).dataValues,
                                                                                              true,
                                                                                              currentTransaction,
                                                                                              logger );

                    //ANCHOR update the token
                    if ( sysActionTokenUpdated instanceof Error ) {

                      const error = sysActionTokenUpdated as any;

                      warnings.push(
                                     {
                                       Code: error.name,
                                       Message: error.message,
                                       Details: await SystemUtilities.processErrorDetails( error )
                                     }
                                   );

                      warnings.push(
                                     {
                                       Code: "WARNING_FAILED_UPDATE_TOKEN_STATUS",
                                       Message: await I18NManager.translate( strLanguage, "Failed to update the token status." ),
                                       Details: null
                                     }
                                   );

                    }

                    if ( sysUserInDB.sysPerson &&
                         CommonUtilities.isValidEMailList( sysUserInDB.sysPerson.EMail ) ) {

                      const configData = await this.getConfigGeneralDefaultInformation( currentTransaction,
                                                                                        logger );

                      const strTemplateKind = await this.isWebFrontendClient( context.FrontendId,
                                                                              currentTransaction,
                                                                              logger ) ? "web" : "mobile";

                      const strWebAppURL = await this.getConfigFrontendRules( context.FrontendId,
                                                                              "url",
                                                                              currentTransaction,
                                                                              logger );

                      if ( await NotificationManager.send(
                                                           "email",
                                                           {
                                                             from: configData[ "no_response_email" ] || "no-response@no-response.com",
                                                             to: sysUserInDB.sysPerson.EMail,
                                                             subject: await I18NManager.translate( strLanguage, "USER PASSWORD CHANGE SUCCESS" ),
                                                             body: {
                                                                     kind: "template",
                                                                     file: `email-user-password-change-${strTemplateKind}.pug`,
                                                                     language: context.Language,
                                                                     variables: {
                                                                                  user_name: sysUserInDB.Name,
                                                                                  user_password: CommonUtilities.maskPassword( request.body.Password ),
                                                                                  web_app_url: strWebAppURL,
                                                                                  ... configData
                                                                                }
                                                                     //kind: "embedded",
                                                                     //text: "Hello",
                                                                     //html: "<b>Hello</b>"
                                                                   }
                                                           },
                                                           logger
                                                         ) === false ) {

                        warnings.push(
                                       {
                                         Code: "WARNING_CANNOT_SEND_EMAIL",
                                         Message: await I18NManager.translate( strLanguage, "Cannot send the notification email to the user" ),
                                         Details: {
                                                    Reason: await I18NManager.translate( strLanguage, "The transport returned false" )
                                                  }
                                       }
                                     );

                      }

                    }
                    else {

                      warnings.push(
                                     {
                                       Code: "WARNING_CANNOT_SEND_EMAIL",
                                       Message: await I18NManager.translate( strLanguage, "Cannot send the notification email to the user" ),
                                       Details: {
                                                  Reason: await I18NManager.translate( strLanguage, "No valid email associated to the user" )
                                                }
                                     }
                                   );

                    }

                    result = {
                               StatusCode: 200, //Ok
                               Code: 'SUCCESS_PASSWORD_CHANGE',
                               Message: await I18NManager.translate( strLanguage, 'Success to change the password. Remember use it in the next login' ),
                               Mark: '49E15D297D10' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: null,
                               IsError: false,
                               Errors: [],
                               Warnings: warnings,
                               Count: 0,
                               Data: []
                             }

                    bApplyTransaction = true;

                  }
                  else if ( sysUserWithPasswordChanged instanceof Error  ) {

                    const error = sysUserWithPasswordChanged as any;

                    result = {
                               StatusCode: 500, //Internal server error
                               Code: 'ERROR_UNEXPECTED',
                               Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                               Mark: 'D5659A5825AC' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                             Code: 'ERROR_PASSWORD_NOT_VALID',
                             Message: await I18NManager.translate( strLanguage, 'The password is not valid' ),
                             Mark: '77B7830DEB04' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

            }
            else {

              result = {
                         StatusCode: 404, //Not found
                         Code: 'ERROR_USER_NOT_FOUND',
                         Message: await I18NManager.translate( strLanguage, 'The user with id %s not found in database', sysActionTokenInDB.Owner ),
                         Mark: '7DDC6B0761EE' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_NOT_FOUND',
                                     Message: await I18NManager.translate( strLanguage, 'The user with id %s not found in database', sysActionTokenInDB.Owner ),
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
                       Code: 'ERROR_RECOVER_PASSWORD_CODE_ALREADY_USED',
                       Message: await I18NManager.translate( strLanguage, 'The recover password code %s already used', request.body.Code ),
                       Mark: '9512C5FEBECA' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_RECOVER_PASSWORD_CODE_ALREADY_USED',
                                   Message: await I18NManager.translate( strLanguage, 'The recover password code %s already used', request.body.Code ),
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
                      Code: 'ERROR_RECOVER_PASSWORD_CODE_EXPIRED',
                      Message: await I18NManager.translate( strLanguage, 'The recover password code %s is expired', request.body.Code ),
                      Mark: '42E47D603396' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                      LogId: null,
                      IsError: true,
                      Errors: [
                                {
                                  Code: 'ERROR_RECOVER_PASSWORD_CODE_EXPIRED',
                                  Message: await I18NManager.translate( strLanguage, 'The recover password code %s is expired', request.body.Code ),
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
                   StatusCode: 404, //Not found
                   Code: 'ERROR_RECOVER_PASSWORD_CODE_NOT_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The recover password code %s not found in database', request.body.Code ),
                   Mark: '567B7A76F7BB' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_RECOVER_PASSWORD_CODE_NOT_FOUND',
                               Message: await I18NManager.translate( strLanguage, 'The recover password code %s not found in database', request.body.Code ),
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

      sourcePosition.method = this.name + "." + this.passwordRecover.name;

      const strMark = "0E2B5CC808F4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                                                          userSessionStatus.Role.includes( "#BManagerL99#" ): false;

      if ( result.isAuthorizedAdmin === false ) {

        let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#MasterL03#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#" + strActionRole + "L03#" ); // "#ChangeUserPasswordL03#" );

        }

        result.isAuthorizedL03 = userSessionStatus.Role ? ( roleSubTag.includes( "#GName:" +  sysUserInDB.sysUserGroup.Name + "#" ) ||
                                                            roleSubTag.includes( "#GName:*#" ) ||
                                                            roleSubTag.includes( "#GId:" +  sysUserInDB.sysUserGroup.Id + "#" ) ||
                                                            roleSubTag.includes( "#GSId:" +  sysUserInDB.sysUserGroup.ShortId + "#" ) ) : false;

        if ( result.isAuthorizedL03 === false ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#MasterL02#" );

          if ( !roleSubTag ||
                roleSubTag.length === 0 ) {

            roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#" + strActionRole + "L02#" );

          }

          result.isAuthorizedL02 = userSessionStatus.Role ? ( roleSubTag.includes( "#UName:" +  sysUserInDB.Name + "#" ) ||
                                                              roleSubTag.includes( "#UId:" +  sysUserInDB.Id + "#" ) ||
                                                              roleSubTag.includes( "#USId:" +  sysUserInDB.ShortId + "#" ) ) : false;

          if ( result.isAuthorizedL02 === false ) {

            result.isAuthorizedL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#MasterL01#" ) ||
                                                              userSessionStatus.Role.includes( "#" + strActionRole + "L01#" ): false;

            if ( result.isAuthorizedL01 &&
                 userSessionStatus.UserGroupId !== sysUserInDB.sysUserGroup.Id ) {

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

          /*
          //ANCHOR check roles password change
          const bIsAuthorizedAdmin = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Administrator#" ) ||
                                                              userSessionStatus.Role.includes( "#BManagerL99#" ): false;
          let bIsAuthorizedL01 = false;
          let bIsAuthorizedL02 = false;
          let bIsAuthorizedL03 = false;

          if ( bIsAuthorizedAdmin === false ) {

            let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#MasterL03#" );

            if ( !roleSubTag ||
                  roleSubTag.length === 0 ) {

              roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#ChangeUserPasswordL03#" );

            }

            bIsAuthorizedL03 = userSessionStatus.Role ? ( roleSubTag.includes( "#GName:" +  userInDB.UserGroup.Name + "#" ) ||
                                                          roleSubTag.includes( "#GId:" +  userInDB.UserGroup.Id + "#" ) ||
                                                          roleSubTag.includes( "#GSId:" +  userInDB.UserGroup.ShortId + "#" ) ) : false;

            if ( bIsAuthorizedL03 === false ) {

              roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#MasterL02#" );

              if ( !roleSubTag ||
                    roleSubTag.length === 0 ) {

                roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#ChangeUserPasswordL02#" );

              }

              bIsAuthorizedL02 = userSessionStatus.Role ? ( roleSubTag.includes( "#UName:" +  userInDB.Name + "#" ) ||
                                                            roleSubTag.includes( "#UId:" +  userInDB.Id + "#" ) ||
                                                            roleSubTag.includes( "#USId:" +  userInDB.ShortId + "#" ) ) : false;

              if ( bIsAuthorizedL02 === false ) {

                bIsAuthorizedL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#MasterL01#" ) ||
                                                            userSessionStatus.Role.includes( "#ChangeUserPasswordL01#" ): false;

                if ( bIsAuthorizedL01 &&
                     userSessionStatus.UserGroupId !== userInDB.sysUserGroup.Id ) {

                  //Uhathorized
                  bIsNotAuthorized = true;

                }

              }

            }

          }
          */

          //if ( userInDB.Id !== userSessionStatus.UserId ) {

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

          //}

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
                     Code: 'ERROR_CANNOT_CHANGE_PASSWORD',
                     Message: await I18NManager.translate( strLanguage, 'Not allowed to change the password to the user %s', sysUserInDB.Name ),
                     Mark: 'CD5990E0CBD1' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_CANNOT_CHANGE_PASSWORD',
                                 Message: await I18NManager.translate( strLanguage, 'Not allowed to change the password to the user %s', sysUserInDB.Name ),
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
                       Code: 'ERROR_USER_GROUP_DISABLED',
                       Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot recover your password', sysUserInDB.sysUserGroup.Name ),
                       Mark: '34B74D7BDF33' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_GROUP_DISABLED',
                                   Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot recover your password', sysUserInDB.sysUserGroup.Name ),
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
                       Code: 'ERROR_USER_GROUP_EXPIRED',
                       Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot recover your password', sysUserInDB.sysUserGroup.Name ),
                       Mark: '933C3B47067B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_GROUP_EXPIRED',
                                   Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot recover your password', sysUserInDB.sysUserGroup.Name ),
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
                       Code: 'ERROR_USER_DISABLED',
                       Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot recover your password', sysUserInDB.Name ),
                       Mark: '57D0268A40C3' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_DISABLED',
                                   Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot recover your password', sysUserInDB.Name ),
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
                       Code: 'ERROR_USER_EXPIRED',
                       Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot recover your password', sysUserInDB.Name ),
                       Mark: 'C90533CFEFF0' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_EXPIRED',
                                   Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot recover your password', sysUserInDB.Name ),
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
                       Code: 'ERROR_NEW_PASSWORD_NOT_VALID',
                       Message: await I18NManager.translate( strLanguage, 'The new password is invalid', sysUserInDB.Name ),
                       Mark: '7E91B5B3AED1' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_NEW_PASSWORD_NOT_VALID',
                                   Message: await I18NManager.translate( strLanguage, 'The new password is invalid', sysUserInDB.Name ),
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

                const userWithPasswordChanged = await SYSUserService.createOrUpdate( ( sysUserInDB as any).dataValues,
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
                                                                                                            false,    //Set roles?
                                                                                                            null,     //User group roles
                                                                                                            null,     //User roles
                                                                                                            true,     //Force update?
                                                                                                            3,        //3 tries
                                                                                                            3 * 1000, //Second
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
                             Code: 'SUCCESS_PASSWORD_CHANGE',
                             Message: await I18NManager.translate( strLanguage, 'Success to change the password. Remember use it in the next login' ),
                             Mark: 'EDCDE884CDA5' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                                                                           user_password: CommonUtilities.maskPassword( request.body.Password ),
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
                             Code: 'ERROR_UNEXPECTED',
                             Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                             Mark: '9F94B6BFC8F5' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                           Code: 'ERROR_NEW_PASSWORD_NOT_VALID',
                           Message: await I18NManager.translate( strLanguage, 'The new password is not valid' ),
                           Mark: 'A5DCC6ACADE4' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                         Code: 'ERROR_WRONG_PASSWORD',
                         Message: await I18NManager.translate( strLanguage, 'Your current password not match' ),
                         Mark: 'CD291726B853' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_WRONG_PASSWORD',
                                     Message: await I18NManager.translate( strLanguage, 'Your current password not match' ),
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
                     Code: 'ERROR_USER_NOT_FOUND',
                     Message: await I18NManager.translate( strLanguage, 'The user %s not found in database', userSessionStatus.UserName ),
                     Mark: '1533BE3C3918' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_NOT_FOUND',
                                 Message: await I18NManager.translate( strLanguage, 'The user %s not found in database', userSessionStatus.UserName ),
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
                   Code: 'ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT',
                   Message: await I18NManager.translate( strLanguage, 'Authorization token provided is persistent. You cannot made change password' ),
                   Mark: '43977750A573' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT',
                               Message: await I18NManager.translate( strLanguage, 'Authorization token provided is persistent. You cannot change password' ),
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

  static async emailChangeCodeSend( request: Request,
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

      const intCount = await SYSActionTokenService.getCountActionTokenOnLastMinutes( "email_change",
                                                                                     userSessionStatus ? userSessionStatus.UserId : "",
                                                                                     10,
                                                                                     currentTransaction,
                                                                                     logger );

      if ( intCount < 20 ) {

        const userInDB = await SYSUserService.getByName( userSessionStatus.UserName,
                                                         context.TimeZoneId,
                                                         transaction,
                                                         logger );

        if ( userInDB != null &&
             userInDB instanceof Error === false ) {

          if ( context.Authorization.startsWith( "p:" ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT',
                       Message: await I18NManager.translate( strLanguage, 'Authorization token provided is persistent. You cannot change the email' ),
                       Mark: 'EF21E15D0ACA' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT',
                                   Message: await I18NManager.translate( strLanguage, 'Authorization token provided is persistent. You cannot change the email' ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     };

          }
          else if ( await SYSUserGroupService.checkDisabledByName( userInDB.sysUserGroup.Name,
                                                                   currentTransaction,
                                                                   logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_GROUP_DISABLED',
                       Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change the email', userInDB.sysUserGroup.Name ),
                       Mark: 'B308899A1A43' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_GROUP_DISABLED',
                                   Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change the email', userInDB.sysUserGroup.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await SYSUserGroupService.checkExpiredByName( userInDB.sysUserGroup.Name,
                                                                  currentTransaction,
                                                                  logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_GROUP_EXPIRED',
                       Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change the email', userInDB.sysUserGroup.Name ),
                       Mark: '0A4F7A24E7F9' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_GROUP_EXPIRED',
                                   Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change the email', userInDB.sysUserGroup.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await SYSUserService.checkDisabledByName( userInDB.Name,
                                                              currentTransaction,
                                                              logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_DISABLED',
                       Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot change the email', userInDB.Name ),
                       Mark: 'E5543FAB4485' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_DISABLED',
                                   Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot change the email', userInDB.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await SYSUserService.checkExpiredByName( userInDB.Name,
                                                             currentTransaction,
                                                             logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_EXPIRED',
                       Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot change the email', userInDB.Name ),
                       Mark: '1BD2335313DC' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_EXPIRED',
                                   Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot change the email', userInDB.Name ),
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

            if ( await bcrypt.compare( strCurrentPassword, userInDB.Password ) ) {

              if ( CommonUtilities.isValidEMailList( request.body.EMail ) ) {

                //ANCHOR getInfoFromSessionStatus
                const strUserName = SystemUtilities.getInfoFromSessionStatus( context.UserSessionStatus,
                                                                              "UserName",
                                                                              logger );

                const strChangeCode = SystemUtilities.hashString( SystemUtilities.getCurrentDateAndTime().format(), 1, logger );

                const expireAt = SystemUtilities.getCurrentDateAndTimeIncMinutes( 60 );

                const sysActionToken = await SYSActionTokenService.createOrUpdate(
                                                                                   {
                                                                                     Kind: "email_change",
                                                                                     Owner: userInDB.Id,
                                                                                     Token: strChangeCode,
                                                                                     Status: 1,
                                                                                     CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                                     ExpireAt: expireAt.format(),
                                                                                     ExtraData: `{ "NewEMail": "${request.body.EMail}" }`
                                                                                   },
                                                                                   false,
                                                                                   currentTransaction,
                                                                                   logger
                                                                                 );

                if ( sysActionToken &&
                    sysActionToken instanceof Error === false ) {

                  const configData = await this.getConfigGeneralDefaultInformation( currentTransaction,
                                                                                    logger );

                  const strTemplateKind = await this.isWebFrontendClient( context.FrontendId,
                                                                          currentTransaction,
                                                                          logger ) ? "web" : "mobile";

                  const strWebAppURL = await this.getConfigFrontendRules( context.FrontendId,
                                                                          "url",
                                                                          currentTransaction,
                                                                          logger );

                  const strExpireAtInTimeZone = expireAt ? SystemUtilities.transformToTimeZone( expireAt.format(),
                                                                                                context.TimeZoneId,
                                                                                                CommonConstants._DATE_TIME_LONG_FORMAT_04,
                                                                                                logger ): null;

                  //Send immediately the mail for auto activate the new user account
                  if ( await NotificationManager.send(
                                                       "email",
                                                       {
                                                         from: configData[ "no_response_email" ] || "no-response@no-response.com",
                                                         to: request.body.EMail,
                                                         subject: await I18NManager.translate( strLanguage, "EMAIL CHANGE CODE" ),
                                                         body: {
                                                                 kind: "template",
                                                                 file: `email-user-email-change-${strTemplateKind}.pug`,
                                                                 language: context.Language,
                                                                 variables: {
                                                                              user_name: request.body.Name,
                                                                              web_app_url: strWebAppURL,
                                                                              change_code: strChangeCode,
                                                                              expire_at: strExpireAtInTimeZone ? strExpireAtInTimeZone : null,
                                                                              ... configData
                                                                            }
                                                                 //kind: "embedded",
                                                                 //text: "Hello",
                                                                 //html: "<b>Hello</b>"
                                                               }
                                                       },
                                                       logger
                                                     ) ) {

                    result = {
                               StatusCode: 200, //Ok
                               Code: 'SUCCESS_SEND_EMAIL_CHANGE_CODE_EMAIL',
                               Message: await I18NManager.translate( strLanguage, 'Success to send email change code. Please check your mailbox' ),
                               Mark: '9145ACBE178E' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: null,
                               IsError: false,
                               Errors: [],
                               Warnings: [],
                               Count: 1,
                               Data: [
                                       {
                                         EMail: CommonUtilities.maskEMailList( request.body.EMail )
                                       }
                                     ]
                             }

                    bApplyTransaction = true;

                  }
                  else {

                    result = {
                               StatusCode: 500, //Internal server error
                               Code: 'ERROR_SEND_EMAIL_CHANGE_CODE_EMAIL',
                               Message: await I18NManager.translate( strLanguage, 'Error cannot send the email to requested address' ),
                               Mark: '150A614E67B7' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: null,
                               IsError: true,
                               Errors: [
                                         {
                                           Code: 'ERROR_SEND_EMAIL_CHANGE_CODE_EMAIL',
                                           Message: await I18NManager.translate( strLanguage, 'Error cannot send the email to requested address' ),
                                           Details: {
                                                      EMail: CommonUtilities.maskEMailList( request.body.EMail )
                                                    }
                                         }
                                       ],
                               Warnings: [],
                               Count: 0,
                               Data: []
                             }

                  }

                }
                else {

                  const error = sysActionToken as any;

                  result = {
                             StatusCode: 500, //Internal server error
                             Code: 'ERROR_UNEXPECTED',
                             Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                             Mark: 'E739AB104B52' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                           Code: 'ERROR_EMAIL_IS_INVALID',
                           Message: await I18NManager.translate( strLanguage, 'The email is not valid' ),
                           Mark: '01E51F2FB37F' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_EMAIL_IS_INVALID',
                                       Message: await I18NManager.translate( strLanguage, 'The email is not valid' ),
                                       Details: {
                                                  EMail: request.body.EMail
                                                }
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
                         Code: 'ERROR_WRONG_PASSWORD',
                         Message: await I18NManager.translate( strLanguage, 'Your current password not match' ),
                         Mark: '70AFDA615BD7' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_WRONG_PASSWORD',
                                     Message: await I18NManager.translate( strLanguage, 'Your current password not match' ),
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
                     Code: 'ERROR_USER_NOT_FOUND',
                     Message: await I18NManager.translate( strLanguage, 'The user %s not found in database', request.body.Name ),
                     Mark: '4FC2BD9354AD' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_NOT_FOUND',
                                 Message: await I18NManager.translate( strLanguage, 'The user %s not found in database', request.body.Name ),
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

        const strMark = "DD514B770B97" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

        result = {
                   StatusCode: 429, //Too Many Requests
                   Code: 'ERROR_TOO_MANY_EMAIL_CHANGE_REQUEST',
                   Message: await I18NManager.translate( strLanguage, 'The user %s has too many email change requests', request.body.Name ),
                   Mark: strMark,
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_TOO_MANY_EMAIL_CHANGE_REQUEST',
                               Message: await I18NManager.translate( strLanguage, 'The user %s has too many email change requests', request.body.Name ),
                               Details: { Count: intCount, Comment: "In last 10 minutes" }
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

        const debugMark = debug.extend( strMark );

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( 'The user %s has too many email change requests', request.body.Name );

        if ( logger &&
             typeof logger.warning === "function" ) {

          logger.warning( 'The user %s has too many email change requests', request.body.Name );

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

      sourcePosition.method = this.name + "." + this.emailChangeCodeSend.name;

      const strMark = "41A535450035" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async emailChange( request: Request,
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

      const sysActionTokenInDB = await SYSActionTokenService.getByToken( request.body.Code,
                                                                         "email_change",
                                                                         context.TimeZoneId,
                                                                         transaction,
                                                                         logger );

      if ( sysActionTokenInDB !== null &&
           sysActionTokenInDB instanceof Error === false ) {

        if ( sysActionTokenInDB.ExpireAt &&
             SystemUtilities.isDateAndTimeBefore( sysActionTokenInDB.ExpireAt ) ) {

          if ( sysActionTokenInDB.Status === 1 ) { //Waiting for use

            let sysUserInDB = await SYSUserService.getById( sysActionTokenInDB.Owner,
                                                            context.TimeZoneId,
                                                            transaction,
                                                            logger );

            if ( sysUserInDB != null &&
                 sysUserInDB instanceof Error === false ) {

              if ( context.Authorization.startsWith( "p:" ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT',
                           Message: await I18NManager.translate( strLanguage, 'Authorization token provided is persistent. You cannot change the email' ),
                           Mark: 'B4381A42D579' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT',
                                       Message: await I18NManager.translate( strLanguage, 'Authorization token provided is persistent. You cannot change the email' ),
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
                           Code: 'ERROR_USER_GROUP_DISABLED',
                           Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change the email', sysUserInDB.sysUserGroup.Name ),
                           Mark: 'C29DB5D3E5B9' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_GROUP_DISABLED',
                                       Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change the email', sysUserInDB.sysUserGroup.Name ),
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
                           Code: 'ERROR_USER_GROUP_EXPIRED',
                           Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change the email', sysUserInDB.sysUserGroup.Name ),
                           Mark: '3C05036866E6' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_GROUP_EXPIRED',
                                       Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change the email', sysUserInDB.sysUserGroup.Name ),
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
                           Code: 'ERROR_USER_DISABLED',
                           Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot change the email', sysUserInDB.Name ),
                           Mark: 'D70CB73D33AB' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_DISABLED',
                                       Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot change the email', sysUserInDB.Name ),
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
                           Code: 'ERROR_USER_EXPIRED',
                           Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot change the email', sysUserInDB.Name ),
                           Mark: 'EE18C1A52A3C' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_EXPIRED',
                                       Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot change the email', sysUserInDB.Name ),
                                       Details: null
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }
              else {

                const jsonExtraData = CommonUtilities.parseJSON( sysActionTokenInDB.ExtraData, logger );

                if ( jsonExtraData &&
                     CommonUtilities.isValidEMailList( jsonExtraData.NewEMail ) ) {

                  const strUserName = SystemUtilities.getInfoFromSessionStatus( context.UserSessionStatus,
                                                                                "UserName",
                                                                                logger );

                  let sysPersonInDB = null;
                  let sysPersonWithEMailChanged = null;

                  if ( !sysUserInDB.sysPerson ) {

                    jsonExtraData.OldEmail = ""; //Create empty field, no old person assoicated

                    sysPersonWithEMailChanged = await SYSPersonService.createOrUpdate(
                                                                                       {
                                                                                         Id: sysUserInDB.Id,
                                                                                         FirstName: " ",
                                                                                         EMail: jsonExtraData.NewEMail,
                                                                                         CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                                         CreatedAt: null
                                                                                       },
                                                                                       false,
                                                                                       currentTransaction,
                                                                                       logger
                                                                                     );

                    sysPersonInDB = sysPersonWithEMailChanged;

                    if ( sysPersonInDB &&
                         sysPersonInDB instanceof Error === false ) {

                      sysUserInDB.PersonId = sysPersonInDB.Id;
                      sysUserInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
                      sysUserInDB.UpdatedAt = null;

                      sysUserInDB = await SYSUserService.createOrUpdate( ( sysUserInDB as any ).dataValues,
                                                                         true,
                                                                         currentTransaction,
                                                                         logger );

                    }

                  }
                  else {

                    sysPersonInDB = sysUserInDB.sysPerson;

                    jsonExtraData.OldEmail = sysPersonInDB.EMail; //Save the the current person email

                    sysPersonInDB.EMail = jsonExtraData.NewEMail;
                    sysPersonInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
                    sysPersonInDB.UpdatedAt = null;

                    sysPersonWithEMailChanged = await SYSPersonService.createOrUpdate( ( sysPersonInDB as any ).dataValues,
                                                                                       true,
                                                                                       currentTransaction,
                                                                                       logger );

                  }

                  if ( sysPersonWithEMailChanged instanceof Error  ) {

                    const error = sysPersonWithEMailChanged as any;

                    result = {
                               StatusCode: 500, //Internal server error
                               Code: 'ERROR_UNEXPECTED',
                               Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                               Mark: 'D111D4B14F3D' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                             }

                  }
                  else if ( sysUserInDB instanceof Error ) {

                    const error = sysUserInDB as any;

                    result = {
                               StatusCode: 500, //Internal server error
                               Code: 'ERROR_UNEXPECTED',
                               Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                               Mark: 'A73E92AF2757' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                             }

                  }
                  else {

                    sysActionTokenInDB.Status = 0;
                    sysActionTokenInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
                    sysActionTokenInDB.ExtraData = JSON.stringify( jsonExtraData ); //Save the old email and new email

                    const warnings = [];

                    const sysActionTokenUpdated = await SYSActionTokenService.createOrUpdate( ( sysActionTokenInDB as any ).dataValues,
                                                                                              true,
                                                                                              currentTransaction,
                                                                                              logger );

                    //ANCHOR update the token
                    if ( sysActionTokenUpdated instanceof Error ) {

                      const error = sysActionTokenUpdated as any;

                      warnings.push(
                                     {
                                       Code: error.name,
                                       Message: error.message,
                                       Details: await SystemUtilities.processErrorDetails( error )
                                     }
                                   );

                      warnings.push(
                                     {
                                       Code: "WARNING_FAILED_UPDATE_TOKEN_STATUS",
                                       Message: await I18NManager.translate( strLanguage, "Failed to update the token status." ),
                                       Details: null
                                     }
                                   );

                    }

                    const configData = await this.getConfigGeneralDefaultInformation( currentTransaction,
                                                                                      logger );

                    const strTemplateKind = await this.isWebFrontendClient( context.FrontendId,
                                                                            currentTransaction,
                                                                            logger ) ? "web" : "mobile";

                    const strWebAppURL = await this.getConfigFrontendRules( context.FrontendId,
                                                                            "url",
                                                                            currentTransaction,
                                                                            logger );

                    if ( await NotificationManager.send(
                                                         "email",
                                                         {
                                                           from: configData[ "no_response_email" ] || "no-response@no-response.com",
                                                           to: jsonExtraData.NewEMail,
                                                           subject: await I18NManager.translate( strLanguage, "USER EMAIL CHANGE SUCCESS" ),
                                                           body: {
                                                                   kind: "template",
                                                                   file: `email-user-email-change-success-${strTemplateKind}.pug`,
                                                                   language: context.Language,
                                                                   variables: {
                                                                                user_name: sysUserInDB.Name,
                                                                                user_email: CommonUtilities.maskEMailList( jsonExtraData.NewEMail ),
                                                                                web_app_url: strWebAppURL,
                                                                                ... configData
                                                                              }
                                                                   //kind: "embedded",
                                                                   //text: "Hello",
                                                                   //html: "<b>Hello</b>"
                                                                 }
                                                         },
                                                         logger
                                                       ) === false ) {

                      warnings.push(
                                     {
                                       Code: "WARNING_CANNOT_SEND_EMAIL",
                                       Message: await I18NManager.translate( strLanguage, "Cannot send the notification email to the user" ),
                                       Details: {
                                                  Reason: await I18NManager.translate( strLanguage, "The transport returned false" )
                                                }
                                     }
                                   );

                    }

                    result = {
                               StatusCode: 200, //Ok
                               Code: 'SUCCESS_EMAIL_CHANGE',
                               Message: await I18NManager.translate( strLanguage, 'Success to change the user email.' ),
                               Mark: 'D460632D4A2E' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: null,
                               IsError: false,
                               Errors: [],
                               Warnings: warnings,
                               Count: 0,
                               Data: []
                             }

                    bApplyTransaction = true;

                  }

                }
                else {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_EMAIL_NOT_VALID',
                             Message: await I18NManager.translate( strLanguage, 'The email is not valid' ),
                             Mark: 'B4A37DF40A10' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_EMAIL_NOT_VALID',
                                         Message: await I18NManager.translate( strLanguage, 'The email is not valid' ),
                                         Details: {
                                                    EMail: request.body.EMail
                                                  }
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
                         Code: 'ERROR_USER_NOT_FOUND',
                         Message: await I18NManager.translate( strLanguage, 'The user with id %s not found in database', sysActionTokenInDB.Owner ),
                         Mark: '81CBFCD7E4E8' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_NOT_FOUND',
                                     Message: await I18NManager.translate( strLanguage, 'The user with id %s not found in database', sysActionTokenInDB.Owner ),
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
                       Code: 'ERROR_EMAIL_CHANGE_CODE_ALREADY_USED',
                       Message: await I18NManager.translate( strLanguage, 'The email change code %s already used', request.body.Code ),
                       Mark: 'EBB44FAB84DB' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_EMAIL_CHANGE_CODE_ALREADY_USED',
                                   Message: await I18NManager.translate( strLanguage, 'The email change code %s already used', request.body.Code ),
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
                     Code: 'ERROR_EMAIL_CHANGE_CODE_EXPIRED',
                     Message: await I18NManager.translate( strLanguage, 'The email change code %s is expired', request.body.Code ),
                     Mark: 'B810BD062AF4' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_EMAIL_CHANGE_CODE_EXPIRED',
                                 Message: await I18NManager.translate( strLanguage, 'The email change code %s is expired', request.body.Code ),
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
                   StatusCode: 404, //Not found
                   Code: 'ERROR_EMAIL_CHANGE_CODE_NOT_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The email change code %s not found in database', request.body.Code ),
                   Mark: '5241B773D358' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_EMAIL_CHANGE_CODE_NOT_FOUND',
                               Message: await I18NManager.translate( strLanguage, 'The email change code %s not found in database', request.body.Code ),
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

      sourcePosition.method = this.name + "." + this.emailChange.name;

      const strMark = "00CBBF80A7C0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async phoneChangeCodeSend( request: Request,
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

      const intCount = await SYSActionTokenService.getCountActionTokenOnLastMinutes( "phone_number_change",
                                                                                     userSessionStatus ? userSessionStatus.UserId : "",
                                                                                     10,
                                                                                     currentTransaction,
                                                                                     logger );

      if ( intCount < 20 ) {

        const sysUserInDB = await SYSUserService.getByName( userSessionStatus.UserName,
                                                            context.TimeZoneId,
                                                            transaction,
                                                            logger );

        if ( sysUserInDB != null &&
             sysUserInDB instanceof Error === false ) {

          if ( context.Authorization.startsWith( "p:" ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT',
                       Message: await I18NManager.translate( strLanguage, 'Authorization token provided is persistent. You cannot change the phone number' ),
                       Mark: '4FB3974048ED' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT',
                                   Message: await I18NManager.translate( strLanguage, 'Authorization token provided is persistent. You cannot change the phone number' ),
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
                       Code: 'ERROR_USER_GROUP_DISABLED',
                       Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change the phone number', sysUserInDB.sysUserGroup.Name ),
                       Mark: '98366EF44736' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_GROUP_DISABLED',
                                   Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change the phone number', sysUserInDB.sysUserGroup.Name ),
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
                       Code: 'ERROR_USER_GROUP_EXPIRED',
                       Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change the phone number', sysUserInDB.sysUserGroup.Name ),
                       Mark: '563CBF3EE2A5' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_GROUP_EXPIRED',
                                   Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change the phone number', sysUserInDB.sysUserGroup.Name ),
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
                       Code: 'ERROR_USER_DISABLED',
                       Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot change the phone number', sysUserInDB.Name ),
                       Mark: '6D46A46F3106' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_DISABLED',
                                   Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot change the phone number', sysUserInDB.Name ),
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
                       Code: 'ERROR_USER_EXPIRED',
                       Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot change the phone number', sysUserInDB.Name ),
                       Mark: 'B722C2897726' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_EXPIRED',
                                   Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot change the phone number', sysUserInDB.Name ),
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

            if ( await bcrypt.compare( strCurrentPassword, sysUserInDB.Password ) ) {

              const strWellFormattedPhoneNumberList = CommonUtilities.wellFormattedPhoneNumberList( request.body.Phone );

              if ( CommonUtilities.isValidPhoneNumberList( strWellFormattedPhoneNumberList ) ) {

                const strClearFormattedPhoneNumberList = CommonUtilities.clearFormatPhoneNumberList( strWellFormattedPhoneNumberList );

                //ANCHOR getInfoFromSessionStatus
                const strUserName = SystemUtilities.getInfoFromSessionStatus( context.UserSessionStatus,
                                                                              "UserName",
                                                                              logger );

                const strChangeCode = SystemUtilities.hashString( SystemUtilities.getCurrentDateAndTime().format(), 1, logger );

                const expireAt = SystemUtilities.getCurrentDateAndTimeIncMinutes( 60 );

                const sysActionToken = await SYSActionTokenService.createOrUpdate(
                                                                                   {
                                                                                     Kind: "phone_number_change",
                                                                                     Owner: sysUserInDB.Id,
                                                                                     Token: strChangeCode,
                                                                                     Status: 1,
                                                                                     CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                                     ExpireAt: expireAt.format(),
                                                                                     ExtraData: `{ "NewPhoneNumber": "${strWellFormattedPhoneNumberList}" }`
                                                                                   },
                                                                                   false,
                                                                                   currentTransaction,
                                                                                   logger
                                                                                 );

                if ( sysActionToken &&
                     sysActionToken instanceof Error === false ) {

                  //Send immediately the sms with the change code
                  if ( await NotificationManager.send(
                                                       "sms",
                                                       {
                                                         to: strClearFormattedPhoneNumberList,
                                                         //context: "AMERICA/NEW_YORK",
                                                         foreign_data: `{ "user": ${strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET}  }`,
                                                         //device_id: "*",
                                                         body: {
                                                                 kind: "self",
                                                                 text: await I18NManager.translate( strLanguage, 'Your phone number change code is: %s', strChangeCode )
                                                               }
                                                       },
                                                       logger
                                                     ) ) {

                    result = {
                               StatusCode: 200, //Ok
                               Code: 'SUCCESS_SEND_PHONE_NUMBER_CHANGE_CODE_SMS',
                               Message: await I18NManager.translate( strLanguage, 'Success to send phone number change code. Please check your phone' ),
                               Mark: 'B6EFE4864DA7' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: null,
                               IsError: false,
                               Errors: [],
                               Warnings: [],
                               Count: 1,
                               Data: [
                                       {
                                         Phone: CommonUtilities.maskPhoneList( request.body.Phone )
                                       }
                                     ]
                             }

                    bApplyTransaction = true;

                  }
                  else {

                    result = {
                               StatusCode: 500, //Internal server error
                               Code: 'ERROR_SEND_PHONE_NUMBER_CHANGE_CODE_SMS',
                               Message: await I18NManager.translate( strLanguage, 'Error cannot send the sms to requested phone number' ),
                               Mark: '3657E857AF1F' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: null,
                               IsError: true,
                               Errors: [
                                         {
                                           Code: 'ERROR_SEND_PHONE_NUMBER_CHANGE_CODE_SMS',
                                           Message: await I18NManager.translate( strLanguage, 'Error cannot send the sms to requested phone number' ),
                                           Details: {
                                                      Phone: CommonUtilities.maskPhoneList( request.body.Phone )
                                                    }
                                         }
                                       ],
                               Warnings: [],
                               Count: 0,
                               Data: []
                             }

                  }

                }
                else {

                  const error = sysActionToken as any;

                  result = {
                             StatusCode: 500, //Internal server error
                             Code: 'ERROR_UNEXPECTED',
                             Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                             Mark: 'B035AEB41192' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                           Code: 'ERROR_PHONE_NUMBER_IS_INVALID',
                           Message: await I18NManager.translate( strLanguage, 'The phone number is not valid' ),
                           Mark: '01E51F2FB37F' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_PHONE_NUMBER_IS_INVALID',
                                       Message: await I18NManager.translate( strLanguage, 'The phone number is not valid' ),
                                       Details: {
                                                  EMail: request.body.Phone
                                                }
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
                         Code: 'ERROR_WRONG_PASSWORD',
                         Message: await I18NManager.translate( strLanguage, 'Your current password not match' ),
                         Mark: '920F14EFBDE7' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_WRONG_PASSWORD',
                                     Message: await I18NManager.translate( strLanguage, 'Your current password not match' ),
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
                     Code: 'ERROR_USER_NOT_FOUND',
                     Message: await I18NManager.translate( strLanguage, 'The user %s not found in database', request.body.Name ),
                     Mark: '00FB818E026E' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_NOT_FOUND',
                                 Message: await I18NManager.translate( strLanguage, 'The user %s not found in database', request.body.Name ),
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

        const strMark = "49F9083D3F81" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

        result = {
                   StatusCode: 429, //Too Many Requests
                   Code: 'ERROR_TOO_MANY_PHONE_NUMBER_CHANGE_REQUEST',
                   Message: await I18NManager.translate( strLanguage, 'The user %s has too many phone number change requests', request.body.Name ),
                   Mark: strMark,
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_TOO_MANY_PHONE_CHANGE_REQUEST',
                               Message: await I18NManager.translate( strLanguage, 'The user %s has too many phone number change requests', request.body.Name ),
                               Details: { Count: intCount, Comment: "In last 10 minutes" }
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

        const debugMark = debug.extend( strMark );

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( 'The user %s has too many phone change requests', request.body.Name );

        if ( logger &&
             typeof logger.warning === "function" ) {

          logger.warning( 'The user %s has too many phone change requests', request.body.Name );

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

      sourcePosition.method = this.name + "." + this.phoneChangeCodeSend.name;

      const strMark = "C05ECD83072C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async phoneNumberChange( request: Request,
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

      const sysActionTokenInDB = await SYSActionTokenService.getByToken( request.body.Code,
                                                                         "phone_number_change",
                                                                         context.TimeZoneId,
                                                                         transaction,
                                                                         logger );

      if ( sysActionTokenInDB !== null &&
           sysActionTokenInDB instanceof Error === false ) {

        if ( sysActionTokenInDB.ExpireAt &&
             SystemUtilities.isDateAndTimeBefore( sysActionTokenInDB.ExpireAt ) ) {

          if ( sysActionTokenInDB.Status === 1 ) { //Waiting for use

            let sysUserInDB = await SYSUserService.getById( sysActionTokenInDB.Owner,
                                                            context.TimeZoneId,
                                                            transaction,
                                                            logger );

            if ( sysUserInDB != null &&
                 sysUserInDB instanceof Error === false ) {

              if ( context.Authorization.startsWith( "p:" ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT',
                           Message: await I18NManager.translate( strLanguage, 'Authorization token provided is persistent. You cannot change the phone number' ),
                           Mark: '4FB3974048ED' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT',
                                       Message: await I18NManager.translate( strLanguage, 'Authorization token provided is persistent. You cannot change the phone number' ),
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
                           Code: 'ERROR_USER_GROUP_DISABLED',
                           Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change the phone number', sysUserInDB.sysUserGroup.Name ),
                           Mark: 'EAA7E9E5C6FA' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_GROUP_DISABLED',
                                       Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change the phone number', sysUserInDB.sysUserGroup.Name ),
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
                           Code: 'ERROR_USER_GROUP_EXPIRED',
                           Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change the phone number', sysUserInDB.sysUserGroup.Name ),
                           Mark: 'E52573CD2052' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_GROUP_EXPIRED',
                                       Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change the phone number', sysUserInDB.sysUserGroup.Name ),
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
                           Code: 'ERROR_USER_DISABLED',
                           Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot change the phone number', sysUserInDB.Name ),
                           Mark: '8AB386DAE87B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_DISABLED',
                                       Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot change the phone number', sysUserInDB.Name ),
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
                           Code: 'ERROR_USER_EXPIRED',
                           Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot change the phone number', sysUserInDB.Name ),
                           Mark: '15CB6C1B117B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_EXPIRED',
                                       Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot change the phone number', sysUserInDB.Name ),
                                       Details: null
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }
              else {

                const jsonExtraData = CommonUtilities.parseJSON( sysActionTokenInDB.ExtraData, logger );

                if ( jsonExtraData &&
                     CommonUtilities.isValidPhoneNumberList( jsonExtraData.NewPhoneNumber ) ) {

                  const strUserName = SystemUtilities.getInfoFromSessionStatus( context.UserSessionStatus,
                                                                                "UserName",
                                                                                logger );

                  let sysPersonInDB = null;
                  let sysPersonWithPhoneChanged = null;

                  if ( !sysUserInDB.sysPerson ) {

                    jsonExtraData.OldPhoneNumber = ""; //Create empty field, phone number person assoicated

                    sysPersonWithPhoneChanged = await SYSPersonService.createOrUpdate(
                                                                                       {
                                                                                         Id: sysUserInDB.Id,
                                                                                         FirstName: " ",
                                                                                         Phone: jsonExtraData.NewPhoneNumber,
                                                                                         CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                                         CreatedAt: null
                                                                                       },
                                                                                       false,
                                                                                       currentTransaction,
                                                                                       logger
                                                                                     );

                    sysPersonInDB = sysPersonWithPhoneChanged;

                    if ( sysPersonInDB &&
                         sysPersonInDB instanceof Error === false ) {

                      sysUserInDB.PersonId = sysPersonInDB.Id;
                      sysUserInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
                      sysUserInDB.UpdatedAt = null;

                      sysUserInDB = await SYSUserService.createOrUpdate( ( sysUserInDB as any ).dataValues,
                                                                         true,
                                                                         currentTransaction,
                                                                         logger );

                    }

                  }
                  else {

                    sysPersonInDB = sysUserInDB.sysPerson;

                    jsonExtraData.OldPhoneNumber = sysPersonInDB.Phone; //Save the the current person phone number

                    sysPersonInDB.Phone = jsonExtraData.NewPhoneNumber;
                    sysPersonInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
                    sysPersonInDB.UpdatedAt = null;

                    sysPersonWithPhoneChanged = await SYSPersonService.createOrUpdate( ( sysPersonInDB as any ).dataValues,
                                                                                       true,
                                                                                       currentTransaction,
                                                                                       logger );

                  }

                  if ( sysPersonWithPhoneChanged instanceof Error  ) {

                    const error = sysPersonWithPhoneChanged as any;

                    result = {
                               StatusCode: 500, //Internal server error
                               Code: 'ERROR_UNEXPECTED',
                               Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                               Mark: '16C6BCD6839E' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                             }

                  }
                  else if ( sysUserInDB instanceof Error ) {

                    const error = sysUserInDB as any;

                    result = {
                               StatusCode: 500, //Internal server error
                               Code: 'ERROR_UNEXPECTED',
                               Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                               Mark: 'BE0B313EAA02' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                             }

                  }
                  else {

                    sysActionTokenInDB.Status = 0;
                    sysActionTokenInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
                    sysActionTokenInDB.ExtraData = JSON.stringify( jsonExtraData ); //Save the old phone number and new phone number

                    const warnings = [];

                    const sysActionTokenUpdated = await SYSActionTokenService.createOrUpdate( ( sysActionTokenInDB as any ).dataValues,
                                                                                              true,
                                                                                              currentTransaction,
                                                                                              logger );

                    //ANCHOR update the token
                    if ( sysActionTokenUpdated instanceof Error ) {

                      const error = sysActionTokenUpdated as any;

                      warnings.push(
                                     {
                                       Code: error.name,
                                       Message: error.message,
                                       Details: await SystemUtilities.processErrorDetails( error )
                                     }
                                   );

                      warnings.push(
                                     {
                                       Code: "WARNING_FAILED_UPDATE_TOKEN_STATUS",
                                       Message: await I18NManager.translate( strLanguage, "Failed to update the token status." ),
                                       Details: null
                                     }
                                   );

                    }

                    if ( await NotificationManager.send(
                                                         "sms",
                                                         {
                                                           to: sysUserInDB.sysPerson.Phone,
                                                           //context: "AMERICA/NEW_YORK",
                                                           foreign_data: `{ "user": ${strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET}  }`,
                                                           //device_id: "*",
                                                           body: {
                                                                   kind: "self",
                                                                   text: await I18NManager.translate( strLanguage, 'Phone number change success!' )
                                                                 }
                                                         },
                                                         logger
                                                       ) === false ) {

                      warnings.push(
                                     {
                                       Code: "WARNING_CANNOT_SEND_SMS",
                                       Message: await I18NManager.translate( strLanguage, "Cannot send the notification sms to the user" ),
                                       Details: {
                                                  Reason: await I18NManager.translate( strLanguage, "The transport returned false" )
                                                }
                                     }
                                   );

                    }

                    result = {
                               StatusCode: 200, //Ok
                               Code: 'SUCCESS_PHONE_NUMBER_CHANGE',
                               Message: await I18NManager.translate( strLanguage, 'Success to change the user phone number.' ),
                               Mark: '1DF00A420467' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: null,
                               IsError: false,
                               Errors: [],
                               Warnings: warnings,
                               Count: 0,
                               Data: []
                             }

                    bApplyTransaction = true;

                  }

                }
                else {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_PHONE_NUMBER_NOT_VALID',
                             Message: await I18NManager.translate( strLanguage, 'The phone number is not valid' ),
                             Mark: '8AC35D3BD025' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_PHONE_NUMBER_NOT_VALID',
                                         Message: await I18NManager.translate( strLanguage, 'The phone number is not valid' ),
                                         Details: {
                                                    Phone: request.body.Phone
                                                  }
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
                         Code: 'ERROR_USER_NOT_FOUND',
                         Message: await I18NManager.translate( strLanguage, 'The user with id %s not found in database', sysActionTokenInDB.Owner ),
                         Mark: '17B6D60D5199' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_NOT_FOUND',
                                     Message: await I18NManager.translate( strLanguage, 'The user with id %s not found in database', sysActionTokenInDB.Owner ),
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
                       Code: 'ERROR_PHONE_NUMBER_CHANGE_CODE_ALREADY_USED',
                       Message: await I18NManager.translate( strLanguage, 'The phone number change code %s already used', request.body.Code ),
                       Mark: '6CDB3A2649DA' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_PHONE_NUMBER_CHANGE_CODE_ALREADY_USED',
                                   Message: await I18NManager.translate( strLanguage, 'The phone number change code %s already used', request.body.Code ),
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
                     Code: 'ERROR_PHONE_NUMBER_CHANGE_CODE_EXPIRED',
                     Message: await I18NManager.translate( strLanguage, 'The phone number change code %s is expired', request.body.Code ),
                     Mark: '3B86B9F1AD0E' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_PHONE_NUMBER_CHANGE_CODE_EXPIRED',
                                 Message: await I18NManager.translate( strLanguage, 'The phone number change code %s is expired', request.body.Code ),
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
                   StatusCode: 404, //Not found
                   Code: 'ERROR_PHONE_NUMBER_CHANGE_CODE_NOT_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The phone number change code %s not found in database', request.body.Code ),
                   Mark: 'C0A61871B549' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_PHONE_NUMBER_CHANGE_CODE_NOT_FOUND',
                               Message: await I18NManager.translate( strLanguage, 'The phone number change code %s not found in database', request.body.Code ),
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

      sourcePosition.method = this.name + "." + this.phoneNumberChange.name;

      const strMark = "540DF2DAAA60" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
           context.UserSessionStatus.Role.includes( "#BManagerL99#" ) ) {

        if ( request.query.shortToken ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByShortToken( request.query.shortToken,
                                                                                                  currentTransaction,
                                                                                                  logger );

          if ( userSessionStatus &&
               userSessionStatus instanceof Error == false ) {

            strAuthorization = userSessionStatus.Token ? userSessionStatus.Token : request.query.shortToken;

            strUserName = userSessionStatus.UserName ? userSessionStatus.UserName : null;

          }
          else {

            strAuthorization = request.query.shortToken;

          }

        }
        else if ( request.query.token ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByToken( request.query.token,
                                                                                             currentTransaction,
                                                                                             logger );

          if ( userSessionStatus &&
               userSessionStatus instanceof Error == false ) {

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
                   Code: 'ERROR_USER_SESSION_NOT_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAuthorization ),
                   Mark: '6AD438512BFA' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_SESSION_NOT_FOUND',
                               Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAuthorization ),
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
                   Code: 'ERROR_USER_SESSION_NOT_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAuthorization ),
                   Mark: '20E77DDE1001' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                                           null, //{ jobId: SystemUtilities.getUUIDv4(), attempts: 0, timeout: 99999999, removeOnComplete: true, removeOnFail: true, backoff: 0 }, //{ repeat: { cron: '* * * * *' } },
                                           logger );

      result = {
                 StatusCode: 200, //Ok
                 Code: 'SUCCESS_ADD_JOB_TO_QUEUE',
                 Message: await I18NManager.translate( strLanguage, 'Success to add the job to queue' ),
                 Mark: '731042C8407C' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      //let strAutorization = context.Authorization;

      let sysUserInDB = await SYSUserService.getByName( strUserName,
                                                        context.TimeZoneId,
                                                        transaction,
                                                        logger );

      if ( sysUserInDB != null &&
           sysUserInDB instanceof Error === false ) {

        if ( context.Authorization.startsWith( "p:" ) ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: 'ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT',
                     Message: await I18NManager.translate( strLanguage, 'Authorization token provided is persistent. You cannot change your profile information' ),
                     Mark: '4FB3974048ED' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT',
                                 Message: await I18NManager.translate( strLanguage, 'Authorization token provided is persistent. You cannot change your profile information' ),
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
                     Code: 'ERROR_USER_GROUP_DISABLED',
                     Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change your profile information', sysUserInDB.sysUserGroup.Name ),
                     Mark: 'CA03218D26D4' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_GROUP_DISABLED',
                                 Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change your profile information', sysUserInDB.sysUserGroup.Name ),
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
                     Code: 'ERROR_USER_GROUP_EXPIRED',
                     Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change your profile information', sysUserInDB.sysUserGroup.Name ),
                     Mark: '4F0F53813715' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_GROUP_EXPIRED',
                                 Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change you profile information', sysUserInDB.sysUserGroup.Name ),
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
                     Code: 'ERROR_USER_DISABLED',
                     Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot change your profile information', sysUserInDB.Name ),
                     Mark: '8362FE646A8D' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_DISABLED',
                                 Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot change your profile information', sysUserInDB.Name ),
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
                     Code: 'ERROR_USER_EXPIRED',
                     Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot change your profile', sysUserInDB.Name ),
                     Mark: 'D9E15CB1BA2A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_EXPIRED',
                                 Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot change your profile', sysUserInDB.Name ),
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
                        Title: [ 'present', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                        FirstName: [ 'required', 'min:2', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                        LastName: [ 'present', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                        NickName: [ 'present', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                        Abbreviation: [ 'present', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                        Gender: [ 'present', 'between:0,100' ],
                        BirthDate: 'present|dateInFormat01', //<-- dateInFormat01 is a custom validator defined in SystemUtilities.createCustomValidatorSync
                        Address: [ 'present', 'min:10', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\s\:\,ñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                        Avatar: [ 'present', 'min:36', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\s\:ñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
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

                  sysUserInDB.Avatar = request.body.Avatar && sysUserInDB.Avatar !== request.body.Avatar ? request.body.Avatar : sysUserInDB.Avatar;

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
                                   Code: 'WARNING_CANNOT_UPDATE_USER_DATA',
                                   Message: 'Cannot update the user information.',
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
                         Code: 'SUCCESS_PROFILE_INFORMATION_CHANGE',
                         Message: await I18NManager.translate( strLanguage, 'Success to change the user profile information.' ),
                         Mark: '54CAE0BF0C38' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                         Code: 'ERROR_UNEXPECTED',
                         Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                         Mark: 'FEFFF7F8CFDC' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                       Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                       Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid' ),
                       Mark: '35F2EDA66821' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                                   Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid' ),
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
                   Code: 'ERROR_USER_NOT_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The user %s not found in database', strUserName ),
                   Mark: 'C11A63D5568C' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_NOT_FOUND',
                               Message: await I18NManager.translate( strLanguage, 'The user %s not found in database', strUserName ),
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

      //let bIsNotAuthorized = false;

      /*
      let sysUserInDB = null;

      if ( request.query.id ) {

        sysUserInDB = await SYSUserService.getById( request.query.id,
                                                 null,
                                                 currentTransaction,
                                                 logger );

      }
      if ( request.query.shortId ) {

        sysUserInDB = await SYSUserService.getByShortId( request.query.shortId,
                                                      null,
                                                      currentTransaction,
                                                      logger );

      }
      else {

        sysUserInDB = await SYSUserService.getByName( request.query.name,
                                                   null,
                                                   currentTransaction,
                                                   logger );

      }
      */

     let sysUserInDB = await SYSUserService.getBy( {
                                                     Id: request.query.id,
                                                     ShortId: request.query.shortId,
                                                     Name: request.query.name
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
                   Code: 'ERROR_CANNOT_GET_THE_INFORMATION',
                   Message: await I18NManager.translate( strLanguage, 'Not allowed to get the information' ),
                   Mark: '49BC23FE5772' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_CANNOT_GET_THE_INFORMATION',
                               Message: await I18NManager.translate( strLanguage, 'Not allowed to get the information' ),
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      } //ANCHOR getUser
      else if ( sysUserInDB != null &&
                sysUserInDB instanceof Error === false ) {

        let modelData = ( sysUserInDB as any ).dataValues;

        const tempModelData = await SYSUser.convertFieldValues(
                                                                {
                                                                  Data: modelData,
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

          modelData = tempModelData;

        }

        /*
        if ( !resultCheckUserRoles.isAuthorizedAdmin &&
             modelData.Person ) {

          delete modelData.Person.ImageId;

        }
        */

        result = {
                   StatusCode: 200, //Ok
                   Code: 'SUCCESS_GET_INFORMATION',
                   Message: await I18NManager.translate( strLanguage, 'Success get the information.' ),
                   Mark: '54CAE0BF0C38' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
      else {

        const error = sysUserInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: 'ERROR_UNEXPECTED',
                   Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                   Mark: 'FCB0F3218AD0' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      /*
      //let userSessionStatus = context.UserSessionStatus;
      //let strUserName = context.UserSessionStatus.UserName;

      request.query.include = [ { "model": "Person" }, { "model": "UserGroup" } ];
      delete request.query.attributes;

      const resultData = await ModelToRestAPIServiceController.get( User,
                                                                    request,
                                                                    null,
                                                                    logger );

      result = resultData;
      */

      /*
      if ( resultData.statusCode === 200 ) {

        result = {
                   StatusCode: 200, //Ok
                   Code: 'SUCCESS_GET_USER',
                   Message: await I18NManager.translate( strLanguage, 'Success get the user.' ),
                   Mark: '3E14265E7A10' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: null,
                   Count: 0,
                   Data: [
                           userData
                         ]
                 }

      }
      else {

        result = {
                   StatusCode: 404, //Not found
                   Code: 'ERROR_USER_NOT_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'User not found in database' ),
                   Mark: '454854885291' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_NOT_FOUND',
                               Message: await I18NManager.translate( strLanguage, 'The user not found in database' ),
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
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
                                                          userSessionStatus.Role.includes( "#BManagerL99#" ): false;

      if ( result.isAuthorizedAdmin === false ) {

        let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#MasterL03#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#" + strActionRole + "L03#" ); // "#CreateUserL03#" );

        }

        result.isAuthorizedL03 = userSessionStatus.Role ? ( roleSubTag.includes( "#GName:" +  sysUserGroup.Name + "#" ) ||
                                                            roleSubTag.includes( "#GName:*#" ) ||
                                                            roleSubTag.includes( "#GId:" +  sysUserGroup.Id + "#" ) ||
                                                            roleSubTag.includes( "#GSId:" +  sysUserGroup.ShortId + "#" ) ) : false;

        if ( result.isAuthorizedL03 === false ) {

          result.isAuthorizedL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#MasterL01#" ) ||
                                                            userSessionStatus.Role.includes( "#" + strActionRole + "L01#" ): false;

          if ( result.isAuthorizedL01 &&
                ( userSessionStatus.UserGroupName !== sysUserGroup.Name &&
                  userSessionStatus.UserGroupShortId !== sysUserGroup.ShortId &&
                  userSessionStatus.GroupId !== sysUserGroup.Id ) ) {

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

  static async getMessageUser( strLanguage: string,
                               by: {
                                     Id: string,
                                     ShortId: string,
                                     Name: string
                                   } ): Promise<string> {

    let strResult = "";

    if ( by.Name ) {

      strResult = await I18NManager.translate( strLanguage, 'The user with name %s not exists', by.Name );

    }
    else if ( by.Id ) {

      strResult = await I18NManager.translate( strLanguage, 'The user with id %s not exists', by.Id );

    }
    else if ( by.ShortId ) {

      strResult = await I18NManager.translate( strLanguage, 'The user with short id %s not exists', by.ShortId );

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

  static async getConfigAutoAssignRole( strOperation: string,
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

      sourcePosition.method = this.name + "." + this.getConfigAutoAssignRole.name;

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
    strResult = CommonUtilities.removeTag( strResult, "#BManagerL99#" );

    return strResult;

  }

  static async createUser( request: Request,
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

      let resultCheckUserRoles = null;

      let sysUserGroupInDB: SYSUserGroup = null;

      let sysUserInDB: SYSUser = null;

      let userRules = {
                        Avatar: [ 'present', 'string', 'min:36' ],
                        Name: [ 'required', 'min:3', 'regex:/^[a-zA-Z0-9\#\@\.\_\-]+$/g' ],
                        //UserGroupId: [ 'present', 'string', 'min:36' ],
                        //UserGroupSId: [ 'present', 'string', 'min:8' ],
                        //UserGroup: [ 'present', 'string', 'min:3' ],
                        //CreateGroup: [ 'present', 'boolean' ],
                        ExpireAt: [ 'present', 'date' ],
                        Notify: [ 'present', 'min:3' ],
                        ForceChangePassword: [ 'present', 'boolean' ],
                        ChangePasswordEvery: [ 'present', 'integer', 'min:0' ],
                        SessionsLimit: [ 'present', 'integer', 'min:0' ],
                        sysUserGroup: {
                                        Create: [ 'required', 'boolean' ],
                                        Id: [ 'present', 'string', 'min:36' ],
                                        Name: [ 'present', 'min:3', 'regex:/^[a-zA-Z0-9\#\@\.\_\-]+$/g' ],
                                        Role: [ 'present', 'string' ],
                                        Tag: [ 'present', 'string' ],
                                      },
                        sysPerson: [ 'present' ],
                        Business: [ 'present' ],
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
        delete request.body.ExtraData;

        if ( request.body.DisabledBy !== "0" &&
             request.body.DisabledBy !== "1" ) {

          delete request.body.DisabledBy;

        }

        delete request.body.DisabledAt;
        delete request.body.ExtraData;

        delete request.body.sysUserGroup.CreatedBy;
        delete request.body.sysUserGroup.CreatedAt;
        delete request.body.sysUserGroup.UpdatedBy;
        delete request.body.sysUserGroup.UpdatedAt;
        delete request.body.sysUserGroup.DisableBy;
        delete request.body.sysUserGroup.DisableAt;
        delete request.body.sysUserGroup.ExtraData;

        sysUserInDB = await SYSUserService.getByName( request.body.Name,
                                                      null,
                                                      currentTransaction,
                                                      logger );

        if ( !sysUserInDB ) {

          const strPassword = request.body.Password;

          //ANCHOR check password Strength (createUser)
          const strTag = "#" + request.body.Name + "#,#" + request.body.sysUserGroup.Name + "#,#" + request.body.sysUserGroup.Id + "#,#" + request.body.sysUserGroup.ShortId + "#";

          const passwordStrengthParameters = await SecurityServiceController.getConfigPasswordStrengthParameters( strTag,
                                                                                                                  currentTransaction,
                                                                                                                  logger );

          const checkPasswordStrengthResult = await SecurityServiceController.checkPasswordStrength( passwordStrengthParameters,
                                                                                                     strPassword,
                                                                                                     logger );

          if ( checkPasswordStrengthResult.code === 1 ) {

            const strUserName = context.UserSessionStatus.UserName;

            let bIsAuthorizedCreateGroup = userSessionStatus.Role.includes( "#CreateUserGroupL01#" );

            let bIsAllowedAddInDisabledGroup = userSessionStatus.Role.includes( "#AllowAddInDisabledGroupL01#" );

            if ( !request.body.sysUserGroup.Id &&
                 !request.body.sysUserGroup.ShortId &&
                 !request.body.sysUserGroup.Name ) {

              if ( userSessionStatus.Role &&
                   userSessionStatus.Role.includes( "#MasterL01#" ) &&
                   request.body.sysUserGroup.Create === false ) {

                request.body.sysUserGroup.Name = userSessionStatus.UserGroupName; //Create the user in the same group

              }
              else {

                request.body.sysUserGroup.Name = request.body.Name;

              }

            }

            //ANCHOR checkUserGroupRoleLevel
            resultCheckUserRoles = this.checkUserGroupRoleLevel( userSessionStatus,
                                                                 {
                                                                   Id: request.body.sysUserGroup.Id,
                                                                   ShortId: request.body.sysUserGroup.ShortId,
                                                                   Name: request.body.sysUserGroup.Name
                                                                 },
                                                                 "CreateUser",
                                                                 logger );

            if ( resultCheckUserRoles.isAuthorizedAdmin ) {

              bIsAuthorizedCreateGroup = request.body.sysUserGroup.Create === true;

              bIsAllowedAddInDisabledGroup = true;

            }
            else if ( !resultCheckUserRoles.isAuthorizedL03 &&
                      !resultCheckUserRoles.isAuthorizedL01 ) {

              resultCheckUserRoles.isNotAuthorized = true;

            }

            sysUserGroupInDB = await SYSUserGroupService.getBy( {
                                                                  Id: request.body.sysUserGroup.Id,
                                                                  ShortId: request.body.sysUserGroup.ShortId,
                                                                  Name: request.body.sysUserGroup.Name || request.body.Name
                                                                },
                                                                null,
                                                                currentTransaction,
                                                                logger );

            if ( resultCheckUserRoles.isNotAuthorized ) {

              result = {
                         StatusCode: 403, //Forbidden
                         Code: 'ERROR_CANNOT_CREATE_USER',
                         Message: await I18NManager.translate( strLanguage, 'Not allowed to create the user' ),
                         Mark: 'EDF5D29CE61C' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_CANNOT_CREATE_USER',
                                     Message: await I18NManager.translate( strLanguage, 'Not allowed to create the user' ),
                                     Details: null,
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( sysUserGroupInDB instanceof Error ) {

              const error = sysUserGroupInDB;

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
            else if ( sysUserGroupInDB &&
                      SYSUserGroupService.checkDisabled( sysUserGroupInDB ) &&
                      bIsAllowedAddInDisabledGroup === false ) {

              result = {
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_USER_GROUP_DISABLED',
                         Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled.', sysUserGroupInDB.Name ),
                         Mark: 'A9FBA806248A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_DISABLED',
                                     Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled.', sysUserGroupInDB.Name ),
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( sysUserGroupInDB &&
                      SYSUserGroupService.checkExpired( sysUserGroupInDB ) &&
                      bIsAllowedAddInDisabledGroup === false ) {

              result = {
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_USER_GROUP_EXPIRED',
                         Message: await I18NManager.translate( strLanguage, 'The user group %s is expired.', sysUserGroupInDB.Name ),
                         Mark: 'C70A2903EC1F' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_EXPIRED',
                                     Message: await I18NManager.translate( strLanguage, 'The user group %s is expired.', sysUserGroupInDB.Name ),
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( sysUserGroupInDB &&
                      request.body.sysUserGroup.Create ) {

              result = {
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_USER_GROUP_ALREADY_EXISTS',
                         Message: await I18NManager.translate( strLanguage, 'The user group %s already exists.', sysUserGroupInDB.Name ),
                         Mark: '5C5B23E9219A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_ALREADY_EXISTS',
                                     Message: await I18NManager.translate( strLanguage, 'The user group %s already exists.', sysUserGroupInDB.Name ),
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( !sysUserGroupInDB &&
                      request.body.sysUserGroup.Create == false ) {

              const strMessage = await this.getMessageUserGroup( strLanguage, {
                                                                                Id: request.body.sysUserGroup.Id,
                                                                                ShortId: request.body.sysUserGroup.ShortId,
                                                                                Name: request.body.sysUserGroup.Name
                                                                              } );

              result = {
                         StatusCode: 404, //Not found
                         Code: 'ERROR_USER_GROUP_NOT_FOUND',
                         Message: strMessage,
                         Mark: 'C0171BD3B328' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
            else if ( !sysUserGroupInDB &&
                      request.body.sysUserGroup.Create &&
                      bIsAuthorizedCreateGroup === true &&
                      !request.body.sysUserGroup.Id &&
                      !request.body.sysUserGroup.ShortId &&
                      !request.body.sysUserGroup.Name ) {

              result = {
                         StatusCode: 403, //Forbidden
                         Code: 'ERROR_USER_GROUP_INVALID',
                         Message: await I18NManager.translate( strLanguage, 'The user group is invalid.' ),
                         Mark: '5EBD3F13F67B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_INVALID',
                                     Message: await I18NManager.translate( strLanguage, 'The user group is invalid.' ),
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( !sysUserGroupInDB &&
                      request.body.sysUserGroup.Create &&
                      bIsAuthorizedCreateGroup === false ) {

              result = {
                         StatusCode: 403, //Forbidden
                         Code: 'ERROR_CANNOT_CREATE_USER_GROUP',
                         Message: await I18NManager.translate( strLanguage, 'The creation of user group is forbidden.' ),
                         Mark: '5EBD3F13F67B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_CANNOT_CREATE_USER_GROUP',
                                     Message: await I18NManager.translate( strLanguage, 'The creation of user group is forbidden.' ),
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( !sysUserGroupInDB &&
                      request.body.sysUserGroup.Create &&
                      bIsAuthorizedCreateGroup ) {

              sysUserGroupInDB = await SYSUserGroupService.createOrUpdate(
                                                                           {
                                                                             Name: request.body.sysUserGroup.Name,
                                                                             Comment: request.body.Comment,
                                                                             Role: resultCheckUserRoles.isAuthorizedAdmin && request.body.sysUserGroup.Role ? request.body.sysUserGroup.Role: null,
                                                                             Tag: resultCheckUserRoles.isAuthorizedAdmin && request.body.sysUserGroup.Tag ? request.body.sysUserGroup.Tag: null,
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
                           Code: 'ERROR_UNEXPECTED',
                           Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                           Mark: '8DBA87D7ABE2' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

            if ( !result ) {

              let personData = {} as any;

              personData.CreatedBy = strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET;
              personData.CreatedAt = null;

              let rules = {
                            Title: [ 'present', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            FirstName: [ 'required', 'min:2', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            LastName: [ 'present', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            NickName: [ 'present', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            Abbreviation: [ 'present', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            Gender: [ 'present', 'between:0,100' ],
                            BirthDate: 'present|dateInFormat01', //<-- dateInFormat01 is a custom validator defined in SystemUtilities.createCustomValidatorSync
                            Address: [ 'present', 'min:10', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\s\:\,ñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            EMail: 'required|emailList', //<-- emailList is a custom validator defined in SystemUtilities.createCustomValidatorSync
                            Phone: 'present|phoneUSList', //<-- phoneUSList is a custom validator defined in SystemUtilities.createCustomValidatorSync
                          };

              const validator = SystemUtilities.createCustomValidatorSync( request.body.sysPerson,
                                                                           rules,
                                                                           null,
                                                                           logger );

              if ( validator.passes() ) { //Validate request.body field values

                delete request.body.sysPerson.CreatedBy;
                delete request.body.sysPerson.CreatedAt;
                delete request.body.sysPerson.UpdatedBy;
                delete request.body.sysPerson.UpdatedAt;
                delete request.body.sysPerson.ExtraData;

                personData.Title = request.body.sysPerson.Title ? request.body.sysPerson.Title : personData.Title;
                personData.FirstName = request.body.sysPerson.FirstName ? CommonUtilities.normalizeWhitespaces( request.body.sysPerson.FirstName ) : personData.FirstName;
                personData.LastName = request.body.sysPerson.LastName ? CommonUtilities.normalizeWhitespaces( request.body.sysPerson.LastName ): personData.LastName;
                personData.NickName = request.body.sysPerson.NickName ? request.body.sysPerson.NickName : personData.NickName;

                if ( request.body.Abbreviation ) {

                  personData.Abbreviation = request.body.sysPerson.Abbreviation;

                }
                else if ( !personData.Abbreviation ) {

                  const fistNameAbbreviation = CommonUtilities.getFirstLetters( request.body.sysPerson.FirstName );
                  const lastNameAbbreviation = CommonUtilities.getFirstLetters( request.body.sysPerson.LastName );

                  personData.Abbreviation = fistNameAbbreviation.join( "" ) + lastNameAbbreviation.join( "" );

                }

                personData.Gender = request.body.sysPerson.Gender && parseInt( request.body.sysPerson.Gender ) >= 0 ? request.body.sysPerson.Gender : personData.Gender;
                personData.BirthDate = request.body.sysPerson.BirthDate ? request.body.sysPerson.BirthDate : personData.BirthDate;
                personData.EMail = request.body.sysPerson.EMail; // ? request.body.sysPerson.EMail : null;
                personData.Phone = request.body.sysPerson.Phone ? request.body.sysPerson.Phone : null;
                personData.Address = request.body.sysPerson.Address ? request.body.sysPerson.Address : personData.Address;

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

                  let strRoleToApply = await this.getConfigAutoAssignRole( "create",
                                                                           userSessionStatus.Role,
                                                                           sysUserGroupInDB.Name,
                                                                           currentTransaction,
                                                                           logger );

                  if ( resultCheckUserRoles.isAuthorizedAdmin && request.body.Role ) {

                    strRoleToApply = SystemUtilities.mergeTokens( request.body.Role,
                                                                  strRoleToApply,
                                                                  true,
                                                                  logger );

                  }

                  //ANCHOR create new user
                  sysUserInDB = await SYSUserService.createOrUpdate(
                                                                     {
                                                                       Id: sysPersonInDB.Id,
                                                                       PersonId: sysPersonInDB.Id,
                                                                       GroupId: sysUserGroupInDB.Id,
                                                                       Name: request.body.Name,
                                                                       Password: request.body.Password,
                                                                       Role: strRoleToApply ? strRoleToApply : null, //resultCheckUserRoles.isAuthorizedAdmin && request.body.Role !== undefined ? request.body.Role: null,
                                                                       Tag: resultCheckUserRoles.isAuthorizedAdmin && request.body.Tag !== undefined ? request.body.Tag: null,
                                                                       ForceChangePassword: request.body.ForceChangePassword,
                                                                       ChangePasswordEvery: request.body.ChangePasswordEvery,
                                                                       SessionsLimit: request.body.SessionsLimit,
                                                                       ExtraData: request.body.Business ? CommonUtilities.jsonToString( { Business: request.body.Business }, logger ): null,
                                                                       ExpireAt: request.body.ExpireAt ? SystemUtilities.getCurrentDateAndTimeFrom( request.body.ExpireAt ).format(): null,
                                                                       Comment: request.body.Comment,
                                                                       CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                       CreatedAt: null,
                                                                       DisabledBy: request.body.DisabledBy === "1"? "1@" + strUserName: "0"
                                                                     },
                                                                     false,
                                                                     currentTransaction,
                                                                     logger
                                                                   );

                  if ( sysUserInDB &&
                       sysUserInDB instanceof Error === false ) {

                    const warnings = [];

                    if ( request.body.Notify ) {

                      const transportList = request.body.Notify.split( "," );

                      if ( transportList.includes( "email" ) ) {

                        //ANCHOR send email success
                        const configData = await this.getConfigGeneralDefaultInformation( currentTransaction,
                                                                                          logger );

                        const strTemplateKind = await this.isWebFrontendClient( context.FrontendId,
                                                                                currentTransaction,
                                                                                logger ) ? "web" : "mobile";

                        const strWebAppURL = await this.getConfigFrontendRules( context.FrontendId,
                                                                                "url",
                                                                                currentTransaction,
                                                                                logger );

                        if ( await NotificationManager.send(
                                                             "email",
                                                             {
                                                               from: configData[ "no_response_email" ] || "no-response@no-response.com",
                                                               to: personData.EMail,
                                                               subject: await I18NManager.translate( strLanguage, "USER ACCOUNT CREATION SUCCESS" ),
                                                               body: {
                                                                       kind: "template",
                                                                       file: `email-user-creation-${strTemplateKind}.pug`,
                                                                       language: context.Language,
                                                                       variables: {
                                                                                    user_name: request.body.Name,
                                                                                    user_email: request.body.EMail,
                                                                                    user_phone: request.body.Phone,
                                                                                    user_password: request.body.Password,
                                                                                    web_app_url: strWebAppURL,
                                                                                    ... configData
                                                                                  }
                                                                       //kind: "embedded",
                                                                       //text: "Hello",
                                                                       //html: "<b>Hello</b>"
                                                                     }
                                                             },
                                                             logger
                                                           ) === false ) {

                          warnings.push(
                                         {
                                           Code: "WARNING_CANNOT_SEND_EMAIL",
                                           Message: await I18NManager.translate( strLanguage, "Cannot send the notification email to the user" ),
                                           Details: {
                                                      Reason: await I18NManager.translate( strLanguage, "The transport returned false" )
                                                    }
                                         }
                                       );

                        }

                      }

                      if ( transportList.includes( "sms" ) ) {

                        if ( personData.Phone ) {

                          if ( await NotificationManager.send(
                                                               "sms",
                                                               {
                                                                 to: personData.Phone,
                                                                 //context: "AMERICA/NEW_YORK",
                                                                 foreign_data: `{ "user": ${strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET}  }`,
                                                                 //device_id: "*",
                                                                 body: {
                                                                         kind: "self",
                                                                         text: await I18NManager.translate( strLanguage, 'User account creation success.\n%s\n%s', request.body.Name, request.body.Password )
                                                                       }
                                                               },
                                                               logger
                                                             ) === false ) {

                            warnings.push(
                                           {
                                             Code: "WARNING_CANNOT_SEND_SMS",
                                             Message: await I18NManager.translate( strLanguage, "Cannot send the notification sms to the user" ),
                                             Details: {
                                                        Reason: await I18NManager.translate( strLanguage, "The transport returned false" )
                                                      }
                                           }
                                         );

                          }

                        }
                        else {

                          warnings.push(
                                         {
                                           Code: "WARNING_CANNOT_SEND_SMS",
                                           Message: await I18NManager.translate( strLanguage, "Cannot send the notification sms to the user" ),
                                           Details: {
                                                      Reason: await I18NManager.translate( strLanguage, "The transport returned false" )
                                                    }
                                         }
                                       );

                        }

                      }

                    }

                    sysUserInDB = await SYSUserService.getById( sysUserInDB.Id,
                                                                null,
                                                                currentTransaction,
                                                                logger );

                    let modelData = ( sysUserInDB as any ).dataValues;

                    const tempModelData = await SYSUser.convertFieldValues(
                                                                            {
                                                                              Data: modelData,
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

                      modelData = tempModelData;

                    }

                    //ANCHOR success user create
                    result = {
                               StatusCode: 200, //Ok
                               Code: 'SUCCESS_USER_CREATE',
                               Message: await I18NManager.translate( strLanguage, 'Success user create.' ),
                               Mark: 'B9779ACDB9EB' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: null,
                               IsError: false,
                               Errors: [],
                               Warnings: warnings,
                               Count: 1,
                               Data: [
                                       modelData
                                     ]
                             }

                    bApplyTransaction = true;

                  }
                  else {

                    const error = sysUserInDB as any;

                    result = {
                               StatusCode: 500, //Internal server error
                               Code: 'ERROR_UNEXPECTED',
                               Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                               Mark: 'C4B8A26D4B57' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

                  const error = sysPersonInDB as any;

                  result = {
                             StatusCode: 500, //Internal server error
                             Code: 'ERROR_UNEXPECTED',
                             Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                             Mark: '8E230246A1AD' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                           Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                           Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid. Inside of sysPerson' ),
                           Mark: 'E905A810E2D0' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                                       Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid. Inside of sysPerson' ),
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

            //ANCHOR password not valid (createUser)
            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_PASSWORD_NOT_VALID',
                       Message: await I18NManager.translate( strLanguage, 'The password is not valid' ),
                       Mark: 'F9F02C3E2859' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
        else if ( sysUserInDB instanceof Error ) {

          const error = sysUserInDB as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: 'ERROR_UNEXPECTED',
                     Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                     Mark: '726AB9ABEFE9' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                     Message: await I18NManager.translate( strLanguage, 'The user name %s already exists.', request.body.Name ),
                     Mark: '61B8AA67F498' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                                 Message: await I18NManager.translate( strLanguage, 'The user name %s already exists.', request.body.Name ),
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
                   Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                   Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid' ),
                   Mark: '78706654C68B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                               Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid' ),
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

      sourcePosition.method = this.name + "." + this.createUser.name;

      const strMark = "F754B87531BC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static checkUsersEqualsRoleLevel( sysUserInDB: SYSUser,
                                    userSessionStatus: any,
                                    logger: any ): boolean {

    let bResult = false;

    try {

      const sysUserRole = sysUserInDB.Role ? sysUserInDB.Role.split( "," ): [];
      const sysUserGroupRole = sysUserInDB.sysUserGroup.Role ? sysUserInDB.sysUserGroup.Role.split( "," ): [];

      if ( sysUserRole.includes( "#Administrator#" ) ||
           sysUserRole.includes( "#BManagerL99#" ) ||
           sysUserGroupRole.includes( "#Administrator#" ) ||
           sysUserGroupRole.includes( "#BManagerL99#" ) ) {

        //The user to check is administrator
        bResult = userSessionStatus.Role.includes( "#Administrator#" ) ||
                  userSessionStatus.Role.includes( "#BManagerL99#" ); //Check the current user session is administrator too

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

  static async updateUser( request: Request,
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

      let resultCheckUserRoles = null;

      let sysUserGroupInDB: SYSUserGroup = null;

      let sysUserInDB: SYSUser = null;

      let userRules = {
                        Avatar: [ 'present', 'string', 'min:36' ],
                        Id: [ 'required', 'string', 'min:36' ],
                        ShortId: [ 'present', 'string', 'min:8' ],
                        Name: [ 'required', 'min:3', 'regex:/^[a-zA-Z0-9\#\@\.\_\-]+$/g' ],
                        ExpireAt: [ 'present', 'date' ],
                        Notify: [ 'present', 'min:3' ],
                        ForceChangePassword: [ 'present', 'boolean' ],
                        ChangePasswordEvery: [ 'present', 'integer', 'min:0' ],
                        SessionsLimit: [ 'present', 'integer', 'min:0' ],
                        sysUserGroup: {
                          Create: [ 'required', 'boolean' ],
                          Id: [ 'present', 'string', 'min:36' ],
                          ShortId: [ 'present', 'string', 'min:8' ],
                          Name: [ 'present', 'min:3', 'regex:/^[a-zA-Z0-9\#\@\.\_\-]+$/g' ],
                          Role: [ 'present', 'string' ],
                          Tag: [ 'present', 'string' ],
                        },
                        sysPerson: [ 'present' ],
                        Business: [ 'present' ],
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

        delete request.body.sysUserGroup.CreatedBy;
        delete request.body.sysUserGroup.CreatedAt;
        delete request.body.sysUserGroup.UpdatedBy;
        delete request.body.sysUserGroup.UpdatedAt;
        delete request.body.sysUserGroup.DisableBy;
        delete request.body.sysUserGroup.DisableAt;
        delete request.body.sysUserGroup.ExtraData;

        sysUserInDB = await SYSUserService.getBy(
                                                  {
                                                    Id: request.body.Id,
                                                    ShortId: request.body.ShortId,
                                                    Name: request.body.Name
                                                  },
                                                  null,
                                                  currentTransaction,
                                                  logger
                                                );

        if ( !sysUserInDB ) {

          const strMessage = await this.getMessageUser(
                                                        strLanguage,
                                                        {
                                                          Id: request.body.Id,
                                                          ShortId: request.body.ShortId,
                                                          Name: request.body.Name
                                                        }
                                                      );

          result = {
                     StatusCode: 404, //Not found
                     Code: 'ERROR_USER_NOT_FOUND',
                     Message: strMessage,
                     Mark: '4CE574F8D33C' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_NOT_FOUND',
                                 Message: strMessage,
                                 Details: null
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
                     Code: 'ERROR_UNEXPECTED',
                     Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                     Mark: 'D8666345BB41' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
        else if ( sysUserInDB.Id === userSessionStatus.UserId ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: 'ERROR_USER_NOT_VALID',
                     Message: await I18NManager.translate( strLanguage, 'The user to update cannot be yourself.' ),
                     Mark: '823DBA64229F' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_NOT_VALID',
                                 Message: await I18NManager.translate( strLanguage, 'The user to update cannot be yourself.' ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else if ( this.checkUsersEqualsRoleLevel( sysUserInDB,
                                                  userSessionStatus,
                                                  logger ) === false ) {

          result = {
                     StatusCode: 403, //Forbidden
                     Code: 'ERROR_CANNOT_UDPATE_USER',
                     Message: await I18NManager.translate( strLanguage, 'Not allowed to update the user. The user has #Administrator# role, but yout not had.' ),
                     Mark: 'BD7C3154E5D3' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_CANNOT_UPDATE_USER',
                                 Message: await I18NManager.translate( strLanguage, 'Not allowed to update the user. The user has #Administrator# role, but yout not had.' ),
                                 Details: null,
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else if ( await SYSUserService.getNameIsFree( request.body.Id,
                                                      request.body.Name,
                                                      null,
                                                      currentTransaction,
                                                      logger ) !== null ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                     Message: await I18NManager.translate( strLanguage, 'The user name %s already exists.', request.body.Name ),
                     Mark: 'F14ADFA7FE9D' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                                 Message: await I18NManager.translate( strLanguage, 'The user name %s already exists.', request.body.Name ),
                                 Details: validator.errors.all()
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else if ( this.checkUsersEqualsRoleLevel( sysUserInDB,
                                                  userSessionStatus,
                                                  logger ) === false ) {

          result = {
                     StatusCode: 403, //Forbidden
                     Code: 'ERROR_CANNOT_UDPATE_USER',
                     Message: await I18NManager.translate( strLanguage, 'Not allowed to update the user. The user has #Administrator# role, but you not had.' ),
                     Mark: 'BD7C3154E5D3' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_CANNOT_UPDATE_USER',
                                 Message: await I18NManager.translate( strLanguage, 'Not allowed to update the user. The user has #Administrator# role, but you not had.' ),
                                 Details: null,
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else {

          let passwordStrengthParameters = null;
          let checkPasswordStrengthResult = null;

          if ( request.body.Password ) {

            const strPassword = request.body.Password;

            //ANCHOR check password Strength (updateUser)
            const strTag = "#" + request.body.Name + "#,#" + request.body.Id + "#,#" + request.body.sysUserGroup.Name + "#,#" + request.body.sysUserGroup.Id + "#,#" + request.body.sysUserGroup.ShortId + "#";

            passwordStrengthParameters = await SecurityServiceController.getConfigPasswordStrengthParameters( strTag,
                                                                                                              currentTransaction,
                                                                                                              logger );

            checkPasswordStrengthResult = await SecurityServiceController.checkPasswordStrength( passwordStrengthParameters,
                                                                                                 strPassword,
                                                                                                 logger );

          }

          if ( !request.body.Password ||
               checkPasswordStrengthResult.code === 1 ) {

            const strUserName = context.UserSessionStatus.UserName;

            let bIsAuthorizedCreateGroup = userSessionStatus.Role.includes( "#CreateUserGroupL01#" );

            let bIsAllowedAddInDisabledGroup = userSessionStatus.Role.includes( "#AllowAddInDisabledGroupL01#" );

            if ( !request.body.sysUserGroup.Id &&
                 !request.body.sysUserGroup.ShortId &&
                 !request.body.sysUserGroup.Name ) {

              request.body.stsUserGroup.Name = request.body.Name;

            }

            sysUserGroupInDB = await SYSUserGroupService.getBy( {
                                                                  Id: request.body.sysUserGroup.Id,
                                                                  ShortId: request.body.sysUserGroup.ShortId,
                                                                  Name: request.body.sysUserGroup.Name || request.body.Name
                                                                },
                                                                null,
                                                                currentTransaction,
                                                                logger );

            //ANCHOR checkUserRoleLevel
            resultCheckUserRoles = this.checkUserRoleLevel( userSessionStatus,
                                                            sysUserInDB,
                                                            "UpdateUser",
                                                            logger );

            if ( resultCheckUserRoles.isAuthorizedAdmin ) {

              bIsAuthorizedCreateGroup = request.body.sysUserGroup.Create === true;

              bIsAllowedAddInDisabledGroup = true;

            }
            else if ( !resultCheckUserRoles.isAuthorizedL03 &&
                      !resultCheckUserRoles.isAuthorizedL02 &&
                      !resultCheckUserRoles.isAuthorizedL01 ) {

              resultCheckUserRoles.isNotAuthorized = true;

            }

            if ( resultCheckUserRoles.isNotAuthorized ) {

              result = {
                         StatusCode: 403, //Forbidden
                         Code: 'ERROR_CANNOT_UDPATE_USER',
                         Message: await I18NManager.translate( strLanguage, 'Not allowed to update the user' ),
                         Mark: '649C2E456688' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_CANNOT_UPDATE_USER',
                                     Message: await I18NManager.translate( strLanguage, 'Not allowed to update the user' ),
                                     Details: null,
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( sysUserGroupInDB instanceof Error ) {

              const error = sysUserGroupInDB;

              result = {
                         StatusCode: 500, //Internal server error
                         Code: 'ERROR_UNEXPECTED',
                         Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                         Mark: '4BCF34A0662D' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
            else if ( sysUserGroupInDB &&
                      SYSUserGroupService.checkDisabled( sysUserGroupInDB ) &&
                      bIsAllowedAddInDisabledGroup === false ) {

              result = {
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_USER_GROUP_DISABLED',
                         Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled.', sysUserGroupInDB.Name ),
                         Mark: '4FC2BC4D3209' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_DISABLED',
                                     Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled.', sysUserGroupInDB.Name ),
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( sysUserGroupInDB &&
                      SYSUserGroupService.checkExpired( sysUserGroupInDB ) &&
                      bIsAllowedAddInDisabledGroup === false ) {

              result = {
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_USER_GROUP_EXPIRED',
                         Message: await I18NManager.translate( strLanguage, 'The user group %s is expired.', sysUserGroupInDB.Name ),
                         Mark: '9951957659E5' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_EXPIRED',
                                     Message: await I18NManager.translate( strLanguage, 'The user group %s is expired.', sysUserGroupInDB.Name ),
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( sysUserGroupInDB &&
                      request.body.sysUserGroup.Create ) {

              result = {
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_USER_GROUP_ALREADY_EXISTS',
                         Message: await I18NManager.translate( strLanguage, 'The user group %s already exists.', sysUserGroupInDB.Name ),
                         Mark: 'C02BDD5D7F85' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_ALREADY_EXISTS',
                                     Message: await I18NManager.translate( strLanguage, 'The user group %s already exists.', sysUserGroupInDB.Name ),
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( !sysUserGroupInDB &&
                      request.body.sysUserGroup.Create == false ) {

              const strMessage = await this.getMessageUserGroup( strLanguage, {
                                                                                Id: request.body.sysUserGroup.Id,
                                                                                ShortId: request.body.sysUserGroup.ShortId,
                                                                                Name: request.body.sysUserGroup.Name
                                                                              } );

              result = {
                         StatusCode: 404, //Not found
                         Code: 'ERROR_USER_GROUP_NOT_FOUND',
                         Message: strMessage,
                         Mark: '140885E9DB9B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
            else if ( !sysUserGroupInDB &&
                      request.body.sysUserGroup.Create &&
                      bIsAuthorizedCreateGroup === true &&
                      !request.body.sysUserGroup.Id &&
                      !request.body.sysUserGroup.ShortId &&
                      !request.body.sysUserGroup.Name ) {

              result = {
                         StatusCode: 400, //Bas request
                         Code: 'ERROR_USER_GROUP_INVALID',
                         Message: await I18NManager.translate( strLanguage, 'The user group is invalid.' ),
                         Mark: '754CE1444A44' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_INVALID',
                                     Message: await I18NManager.translate( strLanguage, 'The user group is invalid.' ),
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( !sysUserGroupInDB &&
                      request.body.sysUserGroup.Create &&
                      bIsAuthorizedCreateGroup === false ) {

              result = {
                         StatusCode: 403, //Forbidden
                         Code: 'ERROR_CANNOT_CREATE_USER_GROUP',
                         Message: await I18NManager.translate( strLanguage, 'The creation of user group is forbidden.' ),
                         Mark: 'BC1E68690F49' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_CANNOT_CREATE_USER_GROUP',
                                     Message: await I18NManager.translate( strLanguage, 'The creation of user group is forbidden.' ),
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( !sysUserGroupInDB &&
                      request.body.sysUserGroup.Create &&
                      bIsAuthorizedCreateGroup ) {

              sysUserGroupInDB = await SYSUserGroupService.createOrUpdate(
                                                                           {
                                                                             Name: request.body.sysUserGroup.Name,
                                                                             Comment: request.body.Comment,
                                                                             Role: resultCheckUserRoles.isAuthorizedAdmin && request.body.sysUserGroup.Role ? request.body.sysUserGroup.Role: null,
                                                                             Tag: resultCheckUserRoles.isAuthorizedAdmin && request.body.sysUserGroup.Tag ? request.body.sysUserGroup.Tag: null,
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
                           Code: 'ERROR_UNEXPECTED',
                           Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                           Mark: '3ADACE44BB5B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

            if ( !result ) {

              let personData = sysUserInDB.sysPerson ? ( sysUserInDB.sysPerson as any ).dataValues: {} as any;

              personData.UpdatedBy = strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET;
              personData.UpdatedAt = null;

              let rules = {
                            Id: [ 'required', 'string', 'min:36' ],
                            Title: [ 'present', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            FirstName: [ 'required', 'min:2', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            LastName: [ 'present', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            NickName: [ 'present', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            Abbreviation: [ 'present', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            Gender: [ 'present', 'between:0,100' ],
                            BirthDate: 'present|dateInFormat01', //<-- dateInFormat01 is a custom validator defined in SystemUtilities.createCustomValidatorSync
                            Address: [ 'present', 'min:10', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\s\:\,ñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            EMail: 'required|emailList', //<-- emailList is a custom validator defined in SystemUtilities.createCustomValidatorSync
                            Phone: 'present|phoneUSList', //<-- phoneUSList is a custom validator defined in SystemUtilities.createCustomValidatorSync
                          };

              const validator = SystemUtilities.createCustomValidatorSync( request.body.sysPerson,
                                                                           rules,
                                                                           null,
                                                                           logger );

              if ( validator.passes() ) { //Validate request.body field values

                delete request.body.sysPerson.CreatedBy;
                delete request.body.sysPerson.CreatedAt;
                delete request.body.sysPerson.UpdatedBy;
                delete request.body.sysPerson.UpdatedAt;
                delete request.body.sysPerson.ExtraData;

                personData.Id = request.body.sysPerson.Id ? request.body.sysPerson.Id : personData.Id;
                personData.Title = request.body.sysPerson.Title ? request.body.sysPerson.Title : personData.Title;
                personData.FirstName = request.body.sysPerson.FirstName ? CommonUtilities.normalizeWhitespaces( request.body.sysPerson.FirstName ) : personData.FirstName;
                personData.LastName = request.body.sysPerson.LastName ? CommonUtilities.normalizeWhitespaces( request.body.sysPerson.LastName ): personData.LastName;
                personData.NickName = request.body.sysPerson.NickName ? request.body.sysPerson.NickName : personData.NickName;

                if ( request.body.Abbreviation ) {

                  personData.Abbreviation = request.body.sysPerson.Abbreviation;

                }
                else if ( !personData.Abbreviation ) {

                  const fistNameAbbreviation = CommonUtilities.getFirstLetters( request.body.sysPerson.FirstName );
                  const lastNameAbbreviation = CommonUtilities.getFirstLetters( request.body.sysPerson.LastName );

                  personData.Abbreviation = fistNameAbbreviation.join( "" ) + lastNameAbbreviation.join( "" );

                }

                personData.Gender = request.body.sysPerson.Gender && parseInt( request.body.sysPerson.Gender ) >= 0 ? request.body.sysPerson.Gender : personData.Gender;
                personData.BirthDate = request.body.sysPerson.BirthDate ? request.body.sysPerson.BirthDate: personData.BirthDate;
                personData.EMail = request.body.sysPerson.EMail ? request.body.sysPerson.EMail: personData.EMail; // ? request.body.sysPerson.EMail : null;
                personData.Phone = request.body.sysPerson.Phone ? request.body.sysPerson.Phone: personData.Phone;
                personData.Address = request.body.sysPerson.Address ? request.body.sysPerson.Address: personData.Address;

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

                  let strRoleToApply = await this.getConfigAutoAssignRole( "update",
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
                  else if ( sysUserInDB.Role ) {

                    strRoleToApply = SystemUtilities.mergeTokens( sysUserInDB.Role,
                                                                  strRoleToApply,
                                                                  true,
                                                                  logger );

                  }

                  //ANCHOR update user
                  sysUserInDB.GroupId = sysUserGroupInDB.Id;
                  sysUserInDB.Name = request.body.Name ? request.body.Name: sysUserInDB.Name;
                  sysUserInDB.ForceChangePassword = request.body.ForceChangePassword;
                  sysUserInDB.ChangePasswordEvery = request.body.ChangePasswordEvery;
                  sysUserInDB.SessionsLimit = request.body.SessionsLimit;
                  sysUserInDB.Password = request.body.Password ? request.body.Password: sysUserInDB.Password;
                  sysUserInDB.Role = strRoleToApply ? strRoleToApply: null, //resultCheckUserRoles.isAuthorizedAdmin && request.body.Role !== undefined ? request.body.Role: sysUserInDB.Role;
                  sysUserInDB.Tag = resultCheckUserRoles.isAuthorizedAdmin && request.body.Tag !== undefined ? request.body.Tag: sysUserInDB.Tag;

                  if ( request.body.Business ) {

                    const extraData = CommonUtilities.parseJSON( sysUserInDB.ExtraData, logger );

                    if ( extraData ) {

                      extraData.Business = { ...request.body.Business };

                      sysUserInDB.ExtraData = CommonUtilities.jsonToString( extraData, logger );

                    }

                  }

                  sysUserInDB.ExpireAt = request.body.ExpireAt ? SystemUtilities.getCurrentDateAndTimeFrom( request.body.ExpireAt ).format(): null;
                  sysUserInDB.Comment = request.body.Comment !== undefined ? request.body.Comment : sysUserInDB.Comment;
                  sysUserInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
                  sysUserInDB.UpdatedAt = null;
                  sysUserInDB.DisabledBy = request.body.DisabledBy === "1"? "1@" + strUserName: "0";

                  sysUserInDB = await SYSUserService.createOrUpdate(
                                                                     ( sysUserInDB as any ).dataValues,
                                                                     true,
                                                                     currentTransaction,
                                                                     logger
                                                                   );

                  if ( sysUserInDB &&
                       sysUserInDB instanceof Error === false ) {

                    const warnings = [];

                    if ( request.body.Notify ) {

                      const transportList = request.body.Notify.split( "," );

                      if ( transportList.includes( "email" ) ) {

                        //ANCHOR send email success
                        const configData = await this.getConfigGeneralDefaultInformation( currentTransaction,
                                                                                          logger );

                        const strTemplateKind = await this.isWebFrontendClient( context.FrontendId,
                                                                                currentTransaction,
                                                                                logger ) ? "web" : "mobile";

                        const strWebAppURL = await this.getConfigFrontendRules( context.FrontendId,
                                                                                "url",
                                                                                currentTransaction,
                                                                                logger );

                        if ( await NotificationManager.send(
                                                             "email",
                                                             {
                                                               from: configData[ "no_response_email" ] || "no-response@no-response.com",
                                                               to: personData.EMail,
                                                               subject: await I18NManager.translate( strLanguage, "USER ACCOUNT MODIFICATION SUCCESS" ),
                                                               body: {
                                                                       kind: "template",
                                                                       file: `email-user-modification-${strTemplateKind}.pug`,
                                                                       language: context.Language,
                                                                       variables: {
                                                                                    user_name: request.body.Name,
                                                                                    user_password: request.body.Password ? request.body.Password: null,
                                                                                    user_email: request.body.EMail,
                                                                                    user_phone: request.body.Phone ? request.body.Phone: null,
                                                                                    web_app_url: strWebAppURL,
                                                                                    ... configData
                                                                                  }
                                                                       //kind: "embedded",
                                                                       //text: "Hello",
                                                                       //html: "<b>Hello</b>"
                                                                     }
                                                             },
                                                             logger
                                                           ) === false ) {

                          warnings.push(
                                         {
                                           Code: "WARNING_CANNOT_SEND_EMAIL",
                                           Message: await I18NManager.translate( strLanguage, "Cannot send the notification email to the user" ),
                                           Details: {
                                                      Reason: await I18NManager.translate( strLanguage, "The transport returned false" )
                                                    }
                                         }
                                       );

                        }

                      }

                      if ( transportList.includes( "sms" ) ) {

                        if ( personData.Phone ) {

                          if ( await NotificationManager.send(
                                                               "sms",
                                                               {
                                                                 to: personData.Phone,
                                                                 //context: "AMERICA/NEW_YORK",
                                                                 foreign_data: `{ "user": ${strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET}  }`,
                                                                 //device_id: "*",
                                                                 body: {
                                                                         kind: "self",
                                                                         text: await I18NManager.translate( strLanguage, 'User account modification success.\n%s\n%s', request.body.Name, request.body.Password )
                                                                       }
                                                               },
                                                               logger
                                                             ) === false ) {

                            warnings.push(
                                           {
                                             Code: "WARNING_CANNOT_SEND_SMS",
                                             Message: await I18NManager.translate( strLanguage, "Cannot send the notification sms to the user" ),
                                             Details: {
                                                        Reason: await I18NManager.translate( strLanguage, "The transport returned false" )
                                                      }
                                           }
                                         );

                          }

                        }
                        else {

                          warnings.push(
                                         {
                                           Code: "WARNING_CANNOT_SEND_SMS",
                                           Message: await I18NManager.translate( strLanguage, "Cannot send the notification sms to the user" ),
                                           Details: {
                                                      Reason: await I18NManager.translate( strLanguage, "The transport returned false" )
                                                    }
                                         }
                                       );

                        }

                      }

                    }

                    let modelData = ( sysUserInDB as any ).dataValues;

                    const tempModelData = await SYSUser.convertFieldValues(
                                                                            {
                                                                              Data: modelData,
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

                      modelData = tempModelData;

                    }

                    //ANCHOR success user update
                    result = {
                               StatusCode: 200, //Ok
                               Code: 'SUCCESS_USER_UPDATE',
                               Message: await I18NManager.translate( strLanguage, 'Success user update.' ),
                               Mark: '34F3D558BD74' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: null,
                               IsError: false,
                               Errors: [],
                               Warnings: warnings,
                               Count: 1,
                               Data: [
                                       modelData
                                     ]
                             }

                    bApplyTransaction = true;

                  }
                  else {

                    const error = sysUserInDB as any;

                    result = {
                               StatusCode: 500, //Internal server error
                               Code: 'ERROR_UNEXPECTED',
                               Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                               Mark: 'CFEA59FE0AA3' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

                  const error = sysPersonInDB as any;

                  result = {
                             StatusCode: 500, //Internal server error
                             Code: 'ERROR_UNEXPECTED',
                             Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                             Mark: 'D80E1396B8C9' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                           Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                           Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid. Inside or sysPerson' ),
                           Mark: '28D2B22DC85C' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                                       Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid. Inside or sysPerson' ),
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

            //ANCHOR password not valid (UpdateUser)
            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_PASSWORD_NOT_VALID',
                       Message: await I18NManager.translate( strLanguage, 'The password is not valid' ),
                       Mark: '6FBA9E138C03' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                   Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid' ),
                   Mark: '39F4B9428B50' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                               Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid' ),
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

      sourcePosition.method = this.name + "." + this.updateUser.name;

      const strMark = "C1CB15FAF087" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async bulkUserOperation( strBulkOperation: string,
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

          let sysUserInDB = await SYSUserService.getBy(
                                                        {
                                                          Id: bulkUserData.Id,
                                                          ShortId: bulkUserData.ShortId,
                                                          Name: bulkUserData.Name
                                                        },
                                                        null,
                                                        transaction,
                                                        logger
                                                      );

          if ( !sysUserInDB ) {

            const strMessage = await this.getMessageUser(
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
                                   Code: 'ERROR_USER_NOT_FOUND',
                                   Mark: 'AF5B2A2B856B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   Message: strMessage,
                                   Details: null,
                                 }
                               );

          }
          else if ( sysUserInDB instanceof Error ) {

            const error = sysUserInDB as any;

            result.errors.push (
                                 {
                                   Id: bulkUserData.Id,
                                   ShortId: bulkUserData.ShortId,
                                   Name: bulkUserData.Name,
                                   Code: error.name,
                                   Mark: '4D8DB096189E' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   Message: error.message,
                                   Details: await SystemUtilities.processErrorDetails( error ) //error
                                 }
                               );

          }
          else if ( sysUserInDB.Id === userSessionStatus.UserId ) {

            let strMessage = "";

            if ( strBulkOperation === "deleteUser" ) {

              strMessage = await I18NManager.translate( strLanguage, 'The user to delete cannot be yourself.' );

            }
            else {

              strMessage = await I18NManager.translate( strLanguage, 'The user to update cannot be yourself.' );

            }

            result.errors.push(
                                {
                                  Id: sysUserInDB.Id,
                                  ShortId: sysUserInDB.ShortId,
                                  Name: sysUserInDB.Name,
                                  Code: 'ERROR_USER_NOT_VALID',
                                  Mark: 'DB0BF01CAA7A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                  Message: strMessage,
                                  Details: null
                                }
                              );

          }
          else if ( this.checkUsersEqualsRoleLevel( sysUserInDB,
                                                    userSessionStatus, //Current user
                                                    logger ) === false ) {

            let strCode = "";
            let strMessage = "";

            if ( strBulkOperation === "deleteUser" ) {

              strCode = 'ERROR_CANNOT_DELETE_USER';
              strMessage = await I18NManager.translate( strLanguage, 'Not allowed to delete the user. The user has #Administrator# role, but you not had.' );

            }
            else {

              strCode = 'ERROR_CANNOT_UPDATE_USER';
              strMessage = await I18NManager.translate( strLanguage, 'Not allowed to update the user. The user has #Administrator# role, but you not had.' );

            }

            result.errors.push(
                                {
                                  Id: sysUserInDB.Id,
                                  ShortId: sysUserInDB.ShortId,
                                  Name: sysUserInDB.Name,
                                  Code: strCode,
                                  Message: strMessage,
                                  Mark: '3BA7F38FA6DD' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                  Details: null,
                                }
                              );

          }
          else {

            //ANCHOR checkUserRoleLevel
            let resultCheckUserRoles = this.checkUserRoleLevel( userSessionStatus,
                                                                sysUserInDB,
                                                                strBulkOperation === "deleteUser" ? "DeleteUser": "UpdateUser",
                                                                logger );

            if ( !resultCheckUserRoles.isAuthorizedAdmin &&
                 !resultCheckUserRoles.isAuthorizedL03 &&
                 !resultCheckUserRoles.isAuthorizedL02 &&
                 !resultCheckUserRoles.isAuthorizedL01 ) {

              resultCheckUserRoles.isNotAuthorized = true;

            }

            if ( resultCheckUserRoles.isNotAuthorized ) {

              if ( strBulkOperation === "deleteUser" ) {

                result.errors.push(
                                    {
                                      Id: sysUserInDB.Id,
                                      ShortId: sysUserInDB.ShortId,
                                      Name: sysUserInDB.Name,
                                      Code: 'ERROR_CANNOT_DELETE_USER',
                                      Mark: '3CEF42A3B047' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                      Message: await I18NManager.translate( strLanguage, 'Not allowed to delete the user' ),
                                      Details: null
                                    }
                                  );

              }
              else {

                result.errors.push(
                                    {
                                      Id: sysUserInDB.Id,
                                      ShortId: sysUserInDB.ShortId,
                                      Name: sysUserInDB.Name,
                                      Code: 'ERROR_CANNOT_UDPATE_USER',
                                      Mark: 'AF5B2A2B856B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                      Message: await I18NManager.translate( strLanguage, 'Not allowed to update the user' ),
                                      Details: null
                                    }
                                  );

              };

            }
            else {

              if ( strBulkOperation === "moveToUserGroup" ) {

                resultCheckUserRoles = this.checkUserGroupRoleLevel(
                                                                     userSessionStatus,
                                                                     {
                                                                       Id: bulkUserData.sysUserGroup.Id,
                                                                       ShortId: bulkUserData.sysUserGroup.ShortId,
                                                                       Name: bulkUserData.sysUserGroup.Name,
                                                                     },
                                                                     "UpdateUser",
                                                                     logger
                                                                   );

              }

            }

            if ( !resultCheckUserRoles.isAuthorizedAdmin &&
                 !resultCheckUserRoles.isAuthorizedL03 &&
                 !resultCheckUserRoles.isAuthorizedL02 &&
                 !resultCheckUserRoles.isAuthorizedL01 ) {

              result.errors.push(
                                  {
                                    Id: sysUserInDB.Id,
                                    ShortId: sysUserInDB.ShortId,
                                    Name: sysUserInDB.Name,
                                    Code: 'ERROR_CANNOT_UDPATE_USER',
                                    Mark: '7E8570FF7D8A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                    Message: await I18NManager.translate( strLanguage, 'Not allowed to move the user to the target user group' ),
                                    Details: null
                                  }
                                );

            }
            else {

              let sysUserGroupInDB = null;

              sysUserInDB.UpdatedBy = userSessionStatus.UserName;
              sysUserInDB.UpdatedAt = null;

              if ( strBulkOperation === "moveToUserGroup" ) {

                sysUserGroupInDB = await SYSUserGroupService.getBy(
                                                                    {
                                                                      Id: bulkUserData.sysUserGroup.Id,
                                                                      ShortId: bulkUserData.sysUserGroup.ShortId,
                                                                      Name: bulkUserData.sysUserGroup.Name,
                                                                    },
                                                                    null,
                                                                    transaction,
                                                                    logger
                                                                  );

                if ( sysUserGroupInDB !== null ) {

                  sysUserInDB.GroupId = sysUserGroupInDB.Id;

                }
                else {

                  result.errors.push(
                                      {
                                        Id: sysUserInDB.Id,
                                        ShortId: sysUserInDB.ShortId,
                                        Name: sysUserInDB.Name,
                                        Code: 'ERROR_CANNOT_UDPATE_USER',
                                        Mark: '97BAA8711727' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                        Message: await I18NManager.translate( strLanguage, 'The target user group not found in database' ),
                                        Details: null
                                      }
                                    );

                  sysUserInDB = null;

                }

              }
              else if ( strBulkOperation === "disableUser" ) {

                sysUserInDB.DisabledBy = "1@" + userSessionStatus.UserName;

              }
              else if ( strBulkOperation === "enableUser" ) {

                sysUserInDB.DisabledBy = "0";

              }

              if (  sysUserInDB !== null ) {

                if ( strBulkOperation === "deleteUser" ) {

                  const deleteResult = await SYSUserService.deleteByModel( sysUserInDB,
                                                                           transaction,
                                                                           logger );

                  if ( deleteResult instanceof Error ) {

                    const error = deleteResult as Error;

                    result.errors.push(
                                        {
                                          Id: sysUserInDB.Id,
                                          ShortId: sysUserInDB.ShortId,
                                          Name: sysUserInDB.Name,
                                          Code: 'ERROR_UNEXPECTED',
                                          Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                                          Mark: '4B1421967200' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                          Details: await SystemUtilities.processErrorDetails( error ) //error
                                        }
                                      );


                  }
                  else if ( deleteResult === true ) {

                    result.data.push(
                                      {
                                        Id: sysUserInDB.Id,
                                        ShortId: sysUserInDB.ShortId,
                                        Name: sysUserInDB.Name,
                                        Code: 'SUCCESS_USER_DELETE',
                                        Message: await I18NManager.translate( strLanguage, 'Success user delete.' ),
                                        Mark: 'D746E4B3913A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                        Details: null
                                      }
                                    );

                  }
                  else {

                    result.errors.push(
                                        {
                                          Id: sysUserInDB.Id,
                                          ShortId: sysUserInDB.ShortId,
                                          Name: sysUserInDB.Name,
                                          Code: 'ERROR_USER_DELETE',
                                          Message: await I18NManager.translate( strLanguage, 'Error in user delete.' ),
                                          Mark: '26ECAA#E77AAA' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                          Details: "Method delete return false"
                                        }
                                      );

                  }

                }
                else {

                  sysUserInDB = await SYSUserService.createOrUpdate( ( sysUserInDB as any ).dataValues,
                                                                     true,
                                                                     transaction,
                                                                     logger );

                  if ( sysUserInDB instanceof Error ) {

                    const error = sysUserInDB as any;

                    result.errors.push(
                                        {
                                          Id: sysUserInDB.Id,
                                          ShortId: sysUserInDB.ShortId,
                                          Name: sysUserInDB.Name,
                                          Code: 'ERROR_UNEXPECTED',
                                          Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                                          Mark: '1F3070410157' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                          Details: await SystemUtilities.processErrorDetails( error ) //error
                                        }
                                      );

                  }
                  else {

                    let details = {};

                    if ( strBulkOperation === "moveToUserGroup" ) {

                      details = {
                                  sysUserGroup: {
                                                  Id: sysUserGroupInDB.Id,
                                                  ShortId: sysUserGroupInDB.ShortId,
                                                  Name: sysUserGroupInDB.Name
                                                },
                                };

                    }
                    else {

                      details = {
                                  DisabledBy: sysUserInDB.DisabledBy,
                                  DisabledAt: sysUserInDB.DisabledAt
                                };

                    }

                    result.data.push(
                                      {
                                        Id: sysUserInDB.Id,
                                        ShortId: sysUserInDB.ShortId,
                                        Name: sysUserInDB.Name,
                                        Code: 'SUCCESS_USER_UPDATE',
                                        Message: await I18NManager.translate( strLanguage, 'Success user update.' ),
                                        Mark: '14B48DBC5ECC' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                        Details: details
                                      }
                                    );

                  }

                }

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
                              Code: 'ERROR_UNEXPECTED',
                              Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                              Mark: 'AB36DD82F682' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                              Details: await SystemUtilities.processErrorDetails( error ) //error
                            }
                          );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.bulkUserOperation.name;

      const strMark = "6C6A61A8A08B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                            Code: 'ERROR_UNEXPECTED',
                            Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                            Mark: '14B48DBC5ECC' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                            Details: await SystemUtilities.processErrorDetails( error ) //error
                          }
                        );

    }

    return result;

  }

  static async disableBulkUser( request: Request,
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

      const bulkResult = await this.bulkUserOperation( "disableUser",
                                                       request,
                                                       currentTransaction,
                                                       logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = 'SUCCESS_BULK_USER_DISABLE';
        strMessage = await I18NManager.translate( strLanguage, 'Success disable ALL users' );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = 'ERROR_BULK_USER_DISABLE';
        strMessage = await I18NManager.translate( strLanguage, 'Cannot disable the users. Please check the errors and warnings section' );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = 'CHECK_DATA_AND_ERRORS_AND_WARNINGS';
        strMessage = await I18NManager.translate( strLanguage, 'Not ALL users has been disabled. Please check the data and errors and warnings section' );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: 'F750518D59A8' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.disableBulkUser.name;

      const strMark = "A1CFD3F24A43" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async enableBulkUser( request: Request,
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

      const bulkResult = await this.bulkUserOperation( "enableUser",
                                                       request,
                                                       currentTransaction,
                                                       logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = 'SUCCESS_BULK_USER_ENABLE';
        strMessage = await I18NManager.translate( strLanguage, 'Success enable ALL users' );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = 'ERROR_BULK_USER_ENABLE';
        strMessage = await I18NManager.translate( strLanguage, 'Cannot enable the users. Please check the errors and warnings section' );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = 'CHECK_DATA_AND_ERRORS_AND_WARNINGS';
        strMessage = await I18NManager.translate( strLanguage, 'Not ALL users has been enabled. Please check the data and errors and warnings section' );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: 'B8A5ED6E6C21' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.enableBulkUser.name;

      const strMark = "93AE7BE3681B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async moveBulkUser( request: Request,
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

      const bulkResult = await this.bulkUserOperation( "moveToUserGroup",
                                                       request,
                                                       currentTransaction,
                                                       logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = 'SUCCESS_BULK_USER_MOVE';
        strMessage = await I18NManager.translate( strLanguage, 'Success move ALL users to the user group' );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = 'ERROR_BULK_USER_MOVE';
        strMessage = await I18NManager.translate( strLanguage, 'Cannot move the users. Please check the errors and warnings section' );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = 'CHECK_DATA_AND_ERRORS_AND_WARNINGS';
        strMessage = await I18NManager.translate( strLanguage, 'Not ALL users has been moved. Please check the data and errors and warnings section' );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: '340268D12456' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.moveBulkUser.name;

      const strMark = "F8A432B3DEB9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  //ANCHOR deleteUser
  static async deleteUser( request: Request,
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

      //let strUserName = context.UserSessionStatus.UserName;

      let sysUserInDB = await SYSUserService.getBy( {
                                                      Id: request.query.id,
                                                      ShortId: request.query.shortId,
                                                      Name: request.query.name
                                                    },
                                                    null,
                                                    currentTransaction,
                                                    logger );

      const resultCheckUserRoles = this.checkUserRoleLevel( userSessionStatus,
                                                            sysUserInDB,
                                                            "DeleteUser",
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
                   Code: 'ERROR_CANNOT_DELETE_USER',
                   Message: await I18NManager.translate( strLanguage, 'Not allowed to delete the user' ),
                   Mark: 'BA7F0A12AD3C' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_CANNOT_DELETE_USER',
                               Message: await I18NManager.translate( strLanguage, 'Not allowed to delete the user' ),
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
                                                        Id: request.body.Id,
                                                        ShortId: request.body.ShortId,
                                                        Name: request.body.Name
                                                      }
                                                    );

        result = {
                   StatusCode: 404, //Not found
                   Code: 'ERROR_USER_NOT_FOUND',
                   Message: strMessage,
                   Mark: '58A44EA21984' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_NOT_FOUND',
                               Message: strMessage,
                               Details: null
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
                   Code: 'ERROR_UNEXPECTED',
                   Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                   Mark: 'D8666345BB41' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
      else if ( sysUserInDB.Id === userSessionStatus.UserId ) {

        result = {
                   StatusCode: 400, //Bad request
                   Code: 'ERROR_USER_NOT_VALID',
                   Message: await I18NManager.translate( strLanguage, 'The user to delete cannot be yourself.' ),
                   Mark: '3576DA16A5CA' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_NOT_VALID',
                               Message: await I18NManager.translate( strLanguage, 'The user to delete cannot be yourself.' ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( this.checkUsersEqualsRoleLevel( sysUserInDB,
                                                userSessionStatus, //Current user
                                                logger ) === false ) {

        result = {
                   StatusCode: 403, //Forbidden
                   Code: 'ERROR_CANNOT_DELETE_USER',
                   Message: await I18NManager.translate( strLanguage, 'Not allowed to delete the user. The user has #Administrator# role, but you not had.' ),
                   Mark: '883398A57F61' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_CANNOT_DELETE_USER',
                               Message: await I18NManager.translate( strLanguage, 'Not allowed to delete the user. The user has #Administrator# role, but you not had.' ),
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else {

        const strPersonId = sysUserInDB.sysPerson ? sysUserInDB.sysPerson.Id: null;

        if ( strPersonId &&
             await SYSUserService.countUsersWithPerson( strPersonId,
                                                        currentTransaction,
                                                        logger ) === 1 ) {

          await SYSPersonService.deleteByModel( sysUserInDB.sysPerson,
                                                currentTransaction,
                                                logger );

        }

        const deleteResult = await SYSUserService.deleteByModel( sysUserInDB,
                                                                 currentTransaction,
                                                                 logger );

        if ( deleteResult instanceof Error ) {

          const error = deleteResult as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: 'ERROR_UNEXPECTED',
                     Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                     Mark: 'CC964294E67E' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Code: 'SUCCESS_USER_DELETE',
                     Message: await I18NManager.translate( strLanguage, 'Success user %s deleted.', sysUserInDB.Name ),
                     Mark: 'BEF1D6D336E2' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Code: 'ERROR_USER_DELETE',
                     Message: await I18NManager.translate( strLanguage, 'Error in user delete.' ),
                     Mark: '34335D14522F' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.deleteUser.name;

      const strMark = "A68F177F4DBF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteBulkUser( request: Request,
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

      const bulkResult = await this.bulkUserOperation( "deleteUser",
                                                       request,
                                                       currentTransaction,
                                                       logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = 'SUCCESS_BULK_USER_DELETE';
        strMessage = await I18NManager.translate( strLanguage, 'Success delete ALL users to the user group' );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = 'ERROR_BULK_USER_DELETE';
        strMessage = await I18NManager.translate( strLanguage, 'Cannot delete the users. Please check the errors and warnings section' );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = 'CHECK_DATA_AND_ERRORS_AND_WARNINGS';
        strMessage = await I18NManager.translate( strLanguage, 'Not ALL users has been deleted. Please check the data and errors and warnings section' );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: '6AEBEABDD14A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.deleteBulkUser.name;

      const strMark = "0020061E70E8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                                                          userSessionStatus.Role.includes( "#BManagerL99#" ): false;

      let bIsAuthorizedL03 = false;
      let strWhereL03 = "";
      let bIsAuthorizedL02 = false;
      let strWhereL02 = "";
      let bIsAuthorizedL01 = false;
      let strWhereL01 = "";

      if ( bIsAuthorizedAdmin === false ) {

        let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#MasterL03#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#SearchUserL03#" );

        }

        if ( roleSubTag &&
             roleSubTag.length > 0 ) {

          bIsAuthorizedL03 = true;

          strWhereL03 = CommonUtilities.tranformTagListToWhere( roleSubTag, "B", "Or" );

        }

        roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#MasterL02#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#SearchUserL02#" );

        }

        if ( roleSubTag &&
            roleSubTag.length > 0 ) {

          bIsAuthorizedL02 = true;

          strWhereL02 = CommonUtilities.tranformTagListToWhere( roleSubTag, "A", "Or" );

        }

        bIsAuthorizedL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#MasterL01#" ) ||
                                                    userSessionStatus.Role.includes( "#SearchUserL01#" ): false;

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

      //if ( DBConnectionManager.currentInstance.options.dialect === "mysql" ) {

      strSQL = strSQL + " LIMIT " + intLimit.toString() + " OFFSET " + ( request.query.offset && !isNaN( request.query.offset ) ? request.query.offset : "0" );

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
                 Mark: 'C89386280047' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                                                          userSessionStatus.Role.includes( "#BManagerL99#" ): false;

      let bIsAuthorizedL03 = false;
      let strWhereL03 = "";
      let bIsAuthorizedL02 = false;
      let strWhereL02 = "";
      let bIsAuthorizedL01 = false;
      let strWhereL01 = "";

      if ( bIsAuthorizedAdmin === false ) {

        let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#MasterL03#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#SearchUserL03#" );

        }

        if ( roleSubTag &&
             roleSubTag.length > 0 ) {

          bIsAuthorizedL03 = true;

          strWhereL03 = CommonUtilities.tranformTagListToWhere( roleSubTag, "B", "Or" );

        }

        roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#MasterL02#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#SearchUserL02#" );

        }

        if ( roleSubTag &&
            roleSubTag.length > 0 ) {

          bIsAuthorizedL02 = true;

          strWhereL02 = CommonUtilities.tranformTagListToWhere( roleSubTag, "A", "Or" );

        }

        bIsAuthorizedL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#MasterL01#" ) ||
                                                    userSessionStatus.Role.includes( "#SearchUserL01#" ): false;

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
                 Mark: 'C89386280047' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      let userSessionStatus = context.UserSessionStatus;

      let bProfileOfAnotherUser = false;

      let strAuthorization = context.Authorization;

      if ( context.UserSessionStatus.Role.includes( "#Administrator#" ) ||
           context.UserSessionStatus.Role.includes( "#BManagerL99#" ) ) {

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
                   Code: 'ERROR_USER_SESSION_NOT_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAuthorization ),
                   Mark: 'A27B33E165F1' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_SESSION_NOT_FOUND',
                               Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAuthorization ),
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
                   Code: 'ERROR_USER_SESSION_NOT_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAuthorization ),
                   Mark: '8EF2F7BCEADB' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        let configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_General_User_Settings.Id,
                                                                             userSessionStatus.UserId,
                                                                             currentTransaction,
                                                                             logger );

        configData = configData.Value ? configData.Value : configData.Default;

        configData = CommonUtilities.parseJSON( configData, logger );

        result = {
                   StatusCode: 200, //Ok
                   Code: 'SUCCESS_GET_SETTINGS',
                   Message: await I18NManager.translate( strLanguage, 'Success get settings' ),
                   Mark: '63AD7918CB3E' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      let strAuthorization = context.Authorization;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let userSessionStatus = context.UserSessionStatus;

      let bProfileOfAnotherUser = false;

      if ( context.UserSessionStatus.Role.includes( "#Administrator#" ) ||
           context.UserSessionStatus.Role.includes( "#BManagerL99#" ) ) {

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
                   Code: 'ERROR_USER_SESSION_NOT_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAuthorization ),
                   Mark: 'A27B33E165F1' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_SESSION_NOT_FOUND',
                               Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAuthorization ),
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
                   Code: 'ERROR_USER_SESSION_NOT_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAuthorization ),
                   Mark: '8EF2F7BCEADB' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        const configData = await SYSConfigValueDataService.setConfigValueData( SystemConstants._CONFIG_ENTRY_General_User_Settings.Id,
                                                                               userSessionStatus.UserId,
                                                                               request.body,
                                                                               currentTransaction,
                                                                               logger );

        if ( configData instanceof Error ) {

          const error = configData as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: 'ERROR_UNEXPECTED',
                     Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                     Mark: "BA37B863BC6C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        }
        else {

          result = {
                     StatusCode: 200, //Ok
                     Code: 'SUCCESS_SET_SETTINGS',
                     Message: await I18NManager.translate( strLanguage, 'Success set settings' ),
                     Mark: '286871B2895A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      let bProfileOfAnotherUser = false;

      let strAuthorization = context.Authorization;

      if ( context.UserSessionStatus.Role.includes( "#Administrator#" ) ||
           context.UserSessionStatus.Role.includes( "#BManagerL99#" ) ) {

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
                   Code: 'ERROR_USER_SESSION_NOT_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAuthorization ),
                   Mark: 'A27B33E165F1' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_SESSION_NOT_FOUND',
                               Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAuthorization ),
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
                   Code: 'ERROR_USER_SESSION_NOT_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAuthorization ),
                   Mark: '8EF2F7BCEADB' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                                                                     request.query.format,
                                                                     currentTransaction,
                                                                     logger );

        let intCount = 0;

        if ( routes ) {

          if ( request.query.format === "1" ) {

            intCount = routes.length;

          }
          else {

            intCount = Object.keys( routes ).length;

          }

        }

        result = {
                   StatusCode: 200, //Ok
                   Code: 'SUCCESS_GET_ROUTES',
                   Message: await I18NManager.translate( strLanguage, 'Success get routes' ),
                   Mark: '29DB5C3384E6' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

}