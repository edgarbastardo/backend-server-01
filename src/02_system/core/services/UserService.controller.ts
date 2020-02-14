import cluster from 'cluster';

import SystemConstants from "../../common/SystemContants";

import CommonUtilities from "../../common/CommonUtilities";
import SystemUtilities from "../../common/SystemUtilities";

//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,
import {
  //Router,
  Request,
  //Response,
  //NextFunction
} from 'express';
import bcrypt from 'bcrypt';

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
import ConfigValueDataService from "../../common/database/services/ConfigValueDataService";
import UserService from "../../common/database/services/UserService";
import CommonConstants from "../../common/CommonConstants";
import SecurityServiceController from "./SecurityService.controller";
import UserGroupService from "../../common/database/services/UserGroupService";
import NotificationManager from "../../common/managers/NotificationManager";
import UserSignupService from "../../common/database/services/UserSignupService";
import CipherManager from "../../common/managers/CipherManager";
import PersonService from "../../common/database/services/PersonService";
import I18NManager from "../../common/managers/I18Manager";
import ActionTokenService from "../../common/database/services/ActionTokenService";
import JobQueueManager from "../../common/managers/JobQueueManager";
import UserSessionStatusService from '../../common/database/services/UserSessionStatusService';

const debug = require( 'debug' )( 'UserServiceController' );

export default class UserServiceController {

  static readonly _ID = "UserServiceController";

  static async getConfigUserSignupControl( strFrontendId: string,
                                           transaction: any,
                                           logger: any ): Promise<any> {

    let result = { denied: null, allowed: "*" }

    try {

      const configData = await ConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_Frontend_Rules.Id, //SystemConstants._CONFIG_ENTRY_UserSignupControl.Id,
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

      const configData = await ConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_General_Default_Information.Id,
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

      const configData = await ConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_UserSignupProcess.Id,
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

      const configData = await ConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_Frontend_Rules.Id,
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

    let bApplyTansaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

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
                        FirstName: [ 'required', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                        LastName:  [ 'required', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                      };

          const validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                       rules,
                                                                       null,
                                                                       logger );

          if ( validator.passes() ) { //Validate reqeust.body field values

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

                const bUserGroupExists = await UserGroupService.checkExistsByName( signupProcessData.group !== "@__FromName__@" ? signupProcessData.group : request.body.Name,
                                                                                   currentTransaction,
                                                                                   logger );

                if ( signupProcessData.createGroup === false &&
                     bUserGroupExists === false ) {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_USER_GROUP_NOT_EXISTS',
                             Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s not exists', signupProcessData.group, request.body.Kind ),
                             Mark: '49EEF768004F' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_USER_GROUP_NOT_EXISTS',
                                         Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s not exists', signupProcessData.group, request.body.Kind ),
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
                          await UserGroupService.checkDisabledByName( signupProcessData.group !== "@__FromName__@" ? signupProcessData.group : request.body.Name,
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
                          await UserGroupService.checkExpiredByName( signupProcessData.group !== "@__FromName__@" ? signupProcessData.group : request.body.Name,
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
                else if ( await UserService.checkExistsByName( request.body.Name,
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

                  const userSignup = await UserSignupService.createOrUpdate(
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
                                                                               ExpireAt: expireAt ? expireAt.format(): null
                                                                             },
                                                                             false,
                                                                             currentTransaction,
                                                                             logger
                                                                           );

                  if ( userSignup !== null &&
                       userSignup instanceof Error === false ) {

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

                    }

                  }
                  else if ( userSignup instanceof Error  ) {

                    const error = userSignup as any;

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

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

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

  static async signupActivate( request: Request,
                               transaction: any,
                               logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const userSignup = await UserSignupService.getByToken( request.body.Activation,
                                                             context.TimeZoneId,
                                                             currentTransaction,
                                                             logger );

      if ( userSignup !== null &&
           userSignup instanceof Error === false ) {

        if ( userSignup.Status >= 0 && userSignup.Status < 50 ) {

          if ( !userSignup.ExpireAt ||
              SystemUtilities.isDateAndTimeBefore( userSignup.ExpireAt ) ) {

            const bFrontendIdIsAllowed = await this.getFrontendIdIsAllowed( context.FrontendId,
                                                                            userSignup.Kind,
                                                                            currentTransaction,
                                                                            logger ) >= 0;

            if ( bFrontendIdIsAllowed ) {

              const signupProcessData = await this.getConfigSignupProcess( userSignup.Kind,
                                                                           currentTransaction,
                                                                           logger );

              if ( signupProcessData &&
                   signupProcessData.group &&
                   signupProcessData.group.trim() !== "" &&
                   signupProcessData.group.trim().toLowerCase() !== "@__error__@" ) {

                const bUserGroupExists = await UserGroupService.checkExistsByName( signupProcessData.group !== "@__FromName__@" ? signupProcessData.group : userSignup.Name,
                                                                                   currentTransaction,
                                                                                   logger );

                if ( signupProcessData.createGroup === false &&
                     bUserGroupExists === false ) {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_USER_GROUP_NOT_EXISTS',
                             Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s not exists', signupProcessData.group, userSignup.Kind ),
                             Mark: '0EA9AC54E217' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_USER_GROUP_NOT_EXISTS',
                                         Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s not exists', signupProcessData.group, userSignup.Kind ),
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
                             Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s already exists', signupProcessData.group, userSignup.Kind ),
                             Mark: '832157FFA57C' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_USER_GROUP_ALREADY_EXISTS',
                                         Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s already exists', signupProcessData.group, userSignup.Kind ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           }

                }
                else if ( bUserGroupExists &&
                          await UserGroupService.checkDisabledByName( signupProcessData.group !== "@__FromName__@" ? signupProcessData.group : userSignup.Name,
                                                                      currentTransaction,
                                                                      logger ) ) {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_USER_GROUP_DISABLED',
                             Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s is disabled. You cannot signup new users', signupProcessData.group, userSignup.Kind ),
                             Mark: '74E11EE1CFE2' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_USER_GROUP_DISABLED',
                                         Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s is disabled. You cannot signup new users', signupProcessData.group, userSignup.Kind ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           }

                }
                else if ( bUserGroupExists &&
                          await UserGroupService.checkExpiredByName( signupProcessData.group !== "@__FromName__@" ? signupProcessData.group : userSignup.Name,
                                                                     currentTransaction,
                                                                     logger ) ) {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_USER_GROUP_EXPIRED',
                             Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s is expired. You cannot signup new users', signupProcessData.group, userSignup.Kind ),
                             Mark: '2E99F86FF13B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_USER_GROUP_EXPIRED',
                                         Message: await I18NManager.translate( strLanguage, 'The user group %s defined by signup kind %s is expired. You cannot signup new users', signupProcessData.group, userSignup.Kind ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           }

                }
                else if ( await UserService.checkExistsByName( userSignup.Name,
                                                               currentTransaction,
                                                               logger ) ) {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                             Message: await I18NManager.translate( strLanguage, 'The user name %s already exists.', userSignup.Name ),
                             Mark: '46F913842BF5' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                                         Message: await I18NManager.translate( strLanguage, 'The user name %s already exists.', userSignup.Name ),
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

                  let userGroup = null;
                  let person = null;
                  let user = null;

                  if ( signupProcessData.createGroup ) {

                    const expireAt = signupProcessData.groupExpireAt !== -1 ? SystemUtilities.getCurrentDateAndTimeIncMinutes( signupProcessData.groupExpireAt ): null;

                    const strRole = signupProcessData.groupRole.replace( "@__FromName__@", userSignup.Name );

                    const strTag = signupProcessData.groupTag.replace( "@__FromName__@", userSignup.Name );

                    //Create new group
                    userGroup = await UserGroupService.createOrUpdate(
                                                                       {
                                                                         Name: userSignup.Name,
                                                                         Role: strRole ? strRole: null,
                                                                         Tag: strTag ? strTag: null,
                                                                         ExpireAt: expireAt ? expireAt.format(): null,
                                                                         CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                         Comment: userSignup.Comment
                                                                       },
                                                                       false,
                                                                       currentTransaction,
                                                                       logger
                                                                     );

                  }
                  else {

                    userGroup = await UserGroupService.getByName( signupProcessData.group,
                                                                  context.TimeZoneId,
                                                                  currentTransaction,
                                                                  logger );

                  }

                  if ( userGroup &&
                       userGroup instanceof Error === false ) {

                    person = await PersonService.createOrUpdate(
                                                                 {
                                                                   FirstName: userSignup.FirstName,
                                                                   LastName: userSignup.LastName,
                                                                   Phone: userSignup.Phone ? userSignup.Phone : null,
                                                                   EMail: userSignup.EMail,
                                                                   Comment: userSignup.Comment ? userSignup.Comment : null,
                                                                   CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                 },
                                                                 false,
                                                                 currentTransaction,
                                                                 logger
                                                               );

                    if ( person &&
                         person instanceof Error === false ) {

                      const strPassword = await CipherManager.decrypt( userSignup.Password, logger );

                      const expireAt = signupProcessData.userExpireAt !== -1 ? SystemUtilities.getCurrentDateAndTimeIncMinutes( signupProcessData.userExpireAt ) : null;

                      const strRole = signupProcessData.userRole.replace( "@__FromName__@", userSignup.Name );

                      const strTag = signupProcessData.userTag.replace( "@__FromName__@", userSignup.Name );

                      //Create new user
                      user = await UserService.createOrUpdate(
                                                               {
                                                                 Id: person.Id,
                                                                 PersonId: person.Id,
                                                                 GroupId: userGroup.Id,
                                                                 Name: userSignup.Name,
                                                                 Password: strPassword,
                                                                 Role: strRole ? strRole : null,
                                                                 Tag: strTag ? strTag : null,
                                                                 ExpireAt: expireAt ? expireAt.format(): null,
                                                                 Comment: userSignup.Comment,
                                                                 CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                               },
                                                               false,
                                                               currentTransaction,
                                                               logger
                                                             );

                      if ( user &&
                           user instanceof Error === false ) {

                        userSignup.Status = 50; //Activated
                        userSignup.UpdatedBy = strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET;

                        await UserSignupService.createOrUpdate( ( userSignup as any ).dataValues,
                                                                true,
                                                                currentTransaction,
                                                                logger );

                        result = {
                                   StatusCode: 200, //Ok
                                   Code: 'SUCCESS_USER_ACTIVATION',
                                   Message: await I18NManager.translate( strLanguage, 'Success to made the user activation' ),
                                   Mark: '1E74B6B63B07' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   LogId: null,
                                   IsError: false,
                                   Errors: [],
                                   Warnings: [],
                                   Count: 0,
                                   Data: []
                                 }

                        //ANCHOR send email sucess
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
                                                          to: userSignup.EMail,
                                                          subject: await I18NManager.translate( strLanguage, "USER ACCOUNT ACTIVATION SUCCESS" ),
                                                          body: {
                                                                  kind: "template",
                                                                  file: `email-user-activation-${strTemplateKind}.pug`,
                                                                  language: context.Language,
                                                                  variables: {
                                                                               user_name: userSignup.Name,
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
                                                      );

                      }
                      else {

                        const error = user as any;

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

                      const error = person as any;

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
                  else if ( userGroup instanceof Error  ) {

                    const error = userGroup as any;

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
                           Message: await I18NManager.translate( strLanguage, 'The signup kind %s is not valid', userSignup.Kind ),
                           Mark: 'C632418EF717' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_SIGNUP_KIND_NOT_VALID',
                                       Message: await I18NManager.translate( strLanguage, 'The signup kind %s is not valid', userSignup.Kind ),
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
                                   Details: userSignup.ExpireAt
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }

        }
        else if ( userSignup.Status === 50 ) {

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

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

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

  static async passwordRecoverCodeSend( request: Request,
                                        transaction: any,
                                        logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const intCount = await ActionTokenService.getCountActionTokenOnLastMinutes( "password_recover",
                                                                                  request.body.Name,
                                                                                  10,
                                                                                  currentTransaction,
                                                                                  logger );

      if ( intCount < 20 ) {

        const userInDB = await UserService.getByName( request.body.Name,
                                                      context.TimeZoneId,
                                                      transaction,
                                                      logger );

        if ( userInDB != null &&
             userInDB instanceof Error === false ) {

          if ( await UserGroupService.checkDisabledByName( userInDB.UserGroup.Name,
                                                           currentTransaction,
                                                           logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_GROUP_DISABLED',
                       Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot recover your password', userInDB.UserGroup.Name ),
                       Mark: '39212A25A17D' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_GROUP_DISABLED',
                                   Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot recover your password', userInDB.UserGroup.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await UserGroupService.checkExpiredByName( userInDB.UserGroup.Name,
                                                               currentTransaction,
                                                               logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_GROUP_EXPIRED',
                       Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot recover your password', userInDB.UserGroup.Name ),
                       Mark: '2E99F86FF13B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_GROUP_EXPIRED',
                                   Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot recover your password', userInDB.UserGroup.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await UserService.checkDisabledByName( userInDB.Name,
                                                           currentTransaction,
                                                           logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_DISABLED',
                       Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot recover your password', userInDB.Name ),
                       Mark: '231463F16B95' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_DISABLED',
                                   Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot recover your password', userInDB.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await UserService.checkExpiredByName( userInDB.Name,
                                                          currentTransaction,
                                                          logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_EXPIRED',
                       Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot recover your password', userInDB.Name ),
                       Mark: '55C127F50C3B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_EXPIRED',
                                   Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot recover your password', userInDB.Name ),
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

              if ( !userInDB.UserPerson ||
                   CommonUtilities.isValidEMailList( userInDB.UserPerson.EMail ) === false ) {

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

              if ( !userInDB.UserPerson ||
                  CommonUtilities.isValidPhoneNumberList( userInDB.UserPerson.Phone ) === false ) {

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
                                                                                                   userInDB.UserGroup.Id,
                                                                                                   userInDB.UserGroup.Name,
                                                                                                   userInDB.UserGroup.Tag,
                                                                                                   userInDB.Id,
                                                                                                   userInDB.Name,
                                                                                                   userInDB.Tag,
                                                                                                   currentTransaction,
                                                                                                   logger ) >= 0;

              if ( bFrontendIdIsAllowed ) {

                //ANCHOR
                const strUserName = SystemUtilities.getInfoFromSessionStatus( context.UserSessionStatus,
                                                                              "UserName",
                                                                              logger );

                const strRecoverCode = SystemUtilities.hashString( SystemUtilities.getCurrentDateAndTime().format(), 1, logger );

                const expireAt = SystemUtilities.getCurrentDateAndTimeIncMinutes( 60 );

                const actionToken = await ActionTokenService.createOrUpdate(
                                                                             {
                                                                               Kind: "password_recover",
                                                                               Owner: userInDB.Name,
                                                                               Token: strRecoverCode,
                                                                               Status: 1,
                                                                               CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                               ExpireAt: expireAt.format(),
                                                                             },
                                                                             false,
                                                                             currentTransaction,
                                                                             logger
                                                                           );

                if ( actionToken &&
                     actionToken instanceof Error === false ) {

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
                                                          to: userInDB.UserPerson.EMail,
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
                                Count: 0,
                                Data: [
                                        {
                                          EMail: CommonUtilities.maskEMailList( userInDB.UserPerson.EMail )
                                        }
                                      ]
                              }

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
                                                        EMail: CommonUtilities.maskEMailList( userInDB.UserPerson.EMail )
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
                                                           to: userInDB.UserPerson.Phone,
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
                                 Count: 0,
                                 Data: [
                                         {
                                           Phone: CommonUtilities.maskPhoneList( userInDB.UserPerson.Phone )
                                         }
                                       ]
                               }

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
                                                        EMail: CommonUtilities.maskPhoneList( userInDB.UserPerson.Phone )
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

                  const error = actionToken as any;

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
                   StatusCode: 400, //Bad request
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

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

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

  static async passwordRecover( request: Request,
                                transaction: any,
                                logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const actionTokenInDB = await ActionTokenService.getByToken( request.body.Code,
                                                                   "password_recover",
                                                                   context.TimeZoneId,
                                                                   transaction,
                                                                   logger );

      if ( actionTokenInDB !== null &&
           actionTokenInDB instanceof Error === false ) {

        if ( actionTokenInDB.ExpireAt &&
             SystemUtilities.isDateAndTimeBefore( actionTokenInDB.ExpireAt ) ) {

          if ( actionTokenInDB.Status === 1 ) { //Waiting for use

            const userInDB = await UserService.getById( actionTokenInDB.Owner,
                                                        context.TimeZoneId,
                                                        transaction,
                                                        logger );

            if ( userInDB != null &&
                 userInDB instanceof Error === false ) {

              if ( await UserGroupService.checkDisabledByName( userInDB.UserGroup.Name,
                                                               currentTransaction,
                                                               logger ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_USER_GROUP_DISABLED',
                           Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot recover your password', userInDB.UserGroup.Name ),
                           Mark: '63C9C6FBCB8F' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_GROUP_DISABLED',
                                       Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot recover your password', userInDB.UserGroup.Name ),
                                       Details: null
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }
              else if ( await UserGroupService.checkExpiredByName( userInDB.UserGroup.Name,
                                                                   currentTransaction,
                                                                   logger ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_USER_GROUP_EXPIRED',
                           Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot recover your password', userInDB.UserGroup.Name ),
                           Mark: '9471EA8763E3' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_GROUP_EXPIRED',
                                       Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot recover your password', userInDB.UserGroup.Name ),
                                       Details: null
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }
              else if ( await UserService.checkDisabledByName( userInDB.Name,
                                                               currentTransaction,
                                                               logger ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_USER_DISABLED',
                           Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot recover your password', userInDB.Name ),
                           Mark: 'D013A4C4C1D6' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_DISABLED',
                                       Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot recover your password', userInDB.Name ),
                                       Details: null
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }
              else if ( await UserService.checkExpiredByName( userInDB.Name,
                                                              currentTransaction,
                                                              logger ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_USER_EXPIRED',
                           Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot recover your password', userInDB.Name ),
                           Mark: '5EE4EEA9A907' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_EXPIRED',
                                       Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot recover your password', userInDB.Name ),
                                       Details: null
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }
              else {

                const strTag = "#" + userInDB.Id + "#,#" + userInDB.Name + "#,#" + userInDB.UserGroup.Id + "#,#" + userInDB.UserGroup.Name + "#";

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

                  userInDB.Password = request.body.Password;
                  userInDB.PasswordSetAt = SystemUtilities.getCurrentDateAndTime().format();
                  userInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

                  const userWithPasswordChanged = UserService.createOrUpdate( ( userInDB as any ).dataValues,
                                                                              true,
                                                                              currentTransaction,
                                                                              logger );

                  if ( userWithPasswordChanged !== null &&
                      userWithPasswordChanged instanceof Error === false ) {

                    actionTokenInDB.Status = 0;
                    actionTokenInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

                    const warnings = [];

                    const actionTokenUpdated = await ActionTokenService.createOrUpdate( ( actionTokenInDB as any ).dataValues,
                                                                                        true,
                                                                                        currentTransaction,
                                                                                        logger );

                    //ANCHOR update the token
                    if ( actionTokenUpdated instanceof Error ) {

                      const error = actionTokenUpdated as any;

                      warnings.push(
                                     {
                                       Code: error.name,
                                       Message: error.message,
                                       Details: await SystemUtilities.processErrorDetails( error )
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

                    if ( userInDB.UserPerson &&
                         CommonUtilities.isValidEMailList( userInDB.UserPerson.EMail ) ) {

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
                                                        to: userInDB.UserPerson.EMail,
                                                        subject: await I18NManager.translate( strLanguage, "USER PASSWORD CHANGE SUCCESS" ),
                                                        body: {
                                                                kind: "template",
                                                                file: `email-user-password-change-${strTemplateKind}.pug`,
                                                                language: context.Language,
                                                                variables: {
                                                                             user_name: userInDB.Name,
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
                  else if ( userWithPasswordChanged instanceof Error  ) {

                    const error = userWithPasswordChanged as any;

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
                         Message: await I18NManager.translate( strLanguage, 'The user with id %s not found in database', actionTokenInDB.Owner ),
                         Mark: '7DDC6B0761EE' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_NOT_FOUND',
                                     Message: await I18NManager.translate( strLanguage, 'The user with id %s not found in database', actionTokenInDB.Owner ),
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

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

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

  static async passwordChange( request: Request,
                               transaction: any,
                               logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    let bCheckCurrentPassword = true;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      if ( context.Authorization.startsWith( "p:" ) === false ) {

        let userSessionStatus = context.UserSessionStatus;

        let bIsNotAuthorized = false;

        let bUpdateSessionStatus = true;

        let userInDB = null;

        if ( request.body.User ||
             request.body.UserId ) {

          if ( request.body.UserId ) {

            userInDB = await UserService.getById( request.body.UserId,
                                                  null,
                                                  currentTransaction,
                                                  logger );

          }
          else {

            userInDB = await UserService.getByName( request.body.User,
                                                    null,
                                                    currentTransaction,
                                                    logger );

          }

          const bIsAdministrator = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Administrator#" ): false;
          let bIsMasterL01 = false;

          if ( bIsAdministrator === false ) {

            bIsMasterL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#MasterL01#" ) ||
                                                 userSessionStatus.Role.includes( "#" +  userInDB.UserGroup.Name + "#" ): false;

            if ( bIsMasterL01 &&
                 userSessionStatus.UserGroupId !== userInDB.UserGroup.Id ) {

              //Uhathorized
              bIsNotAuthorized = true;

            }

          }

          if ( userInDB.Id !== userSessionStatus.UserId ) {

            if ( bIsAdministrator ||
                bIsMasterL01 ) {

              bUpdateSessionStatus = false;
              bCheckCurrentPassword = false;

            }

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

          userInDB = await UserService.getById( userSessionStatus.UserId,
                                                null,
                                                currentTransaction,
                                                logger );

        }

        if ( bIsNotAuthorized ) {

          result = {
                     StatusCode: 401, //Unauthorized
                     Code: 'ERROR_CANNOT_CHANGE_PASSWORD',
                     Message: await I18NManager.translate( strLanguage, 'Not authorized to change the password to the user %s', userInDB.Name ),
                     Mark: 'CD5990E0CBD1' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_CANNOT_CHANGE_PASSWORD',
                                 Message: await I18NManager.translate( strLanguage, 'Not authorized to change the password to the user %s', userInDB.Name ),
                                 Details: null,
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else if ( userInDB != null &&
                  userInDB instanceof Error === false ) {

          if ( await UserGroupService.checkDisabledByName( userInDB.UserGroup.Name,
                                                           currentTransaction,
                                                           logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_GROUP_DISABLED',
                       Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot recover your password', userInDB.UserGroup.Name ),
                       Mark: '34B74D7BDF33' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_GROUP_DISABLED',
                                   Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot recover your password', userInDB.UserGroup.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await UserGroupService.checkExpiredByName( userInDB.UserGroup.Name,
                                                               currentTransaction,
                                                               logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_GROUP_EXPIRED',
                       Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot recover your password', userInDB.UserGroup.Name ),
                       Mark: '933C3B47067B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_GROUP_EXPIRED',
                                   Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot recover your password', userInDB.UserGroup.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await UserService.checkDisabledByName( userInDB.Name,
                                                           currentTransaction,
                                                           logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_DISABLED',
                       Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot recover your password', userInDB.Name ),
                       Mark: '57D0268A40C3' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_DISABLED',
                                   Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot recover your password', userInDB.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await UserService.checkExpiredByName( userInDB.Name,
                                                          currentTransaction,
                                                          logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_EXPIRED',
                       Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot recover your password', userInDB.Name ),
                       Mark: 'C90533CFEFF0' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_EXPIRED',
                                   Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot recover your password', userInDB.Name ),
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
                 await bcrypt.compare( strCurrentPassword, userInDB.Password ) ) {

              const strNewPassword = request.body.NewPassword;

              //ANCHOR check password Strength
              const strTag = "#" + userInDB.Id + "#,#" + userInDB.Name + "#,#" + userInDB.UserGroup.Id + "#,#" + userInDB.UserGroup.Name + "#";

              const passwordStrengthParameters = await SecurityServiceController.getConfigPasswordStrengthParameters( strTag,
                                                                                                                      currentTransaction,
                                                                                                                      logger );

              const checkPasswordStrengthResult = await SecurityServiceController.checkPasswordStrength( passwordStrengthParameters,
                                                                                                         strNewPassword,
                                                                                                         logger );

              if ( checkPasswordStrengthResult.code === 1 ) {

                userInDB.Password = strNewPassword;
                userInDB.ForceChangePassword = 0;
                userInDB.PasswordSetAt = SystemUtilities.getCurrentDateAndTime().format();
                userInDB.UpdatedBy = userSessionStatus.UserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

                const userWithPasswordChanged = await UserService.createOrUpdate( ( userInDB as any).dataValues,
                                                                                  true,
                                                                                  currentTransaction,
                                                                                  logger );

                if ( userWithPasswordChanged !== null &&
                     userWithPasswordChanged instanceof Error === false ) {

                  const warnings = [];

                  if ( bUpdateSessionStatus ) {

                    userSessionStatus.Tag = userSessionStatus.Tag.replace( /#FORCE_CHANGE_PASSSWORD#(,)?/g, "" );
                    userSessionStatus.Tag = userSessionStatus.Tag.replace( /(,)?#FORCE_CHANGE_PASSSWORD#/g, "" );
                    userSessionStatus.Tag = userSessionStatus.Tag.replace( /#PASSSWORD_EXPIRED#(,)?/g, "" );
                    userSessionStatus.Tag = userSessionStatus.Tag.replace( /(,)?#PASSSWORD_EXPIRED#/g, "" );
                    userSessionStatus.UpdatedBy = userSessionStatus.UserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET;

                    //ANCHOR update the session
                    const userSessionStatusUpdated = await SystemUtilities.createOrUpdateUserSessionStatus( context.Authorization,
                                                                                                            userSessionStatus,
                                                                                                            false, //Set roles?
                                                                                                            null,
                                                                                                            null,
                                                                                                            true,     //Force update?
                                                                                                            3,        //3 tries
                                                                                                            3 * 1000, //Second
                                                                                                            transaction,
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
                                      Code: "WARNING_FAILED_UPDATE_USER_SESSION_STATUS",
                                      Message: "Failed to update the user session status. You are required to close the session and start another",
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

                  if ( userInDB.UserPerson &&
                       CommonUtilities.isValidEMailList( userInDB.UserPerson.EMail ) ) {

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
                                                      to: userInDB.UserPerson.EMail,
                                                      subject: await I18NManager.translate( strLanguage, "USER PASSWORD CHANGE SUCCESS" ),
                                                      body: {
                                                              kind: "template",
                                                              file: `email-user-password-change-${strTemplateKind}.pug`,
                                                              language: context.Language,
                                                              variables: {
                                                                           user_name: userInDB.Name,
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

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

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

  static async emailChangeCodeSend( request: Request,
                                    transaction: any,
                                    logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const userSessionStatus = context.UserSessionStatus;

      const intCount = await ActionTokenService.getCountActionTokenOnLastMinutes( "email_change",
                                                                                  userSessionStatus ? userSessionStatus.UserId : "",
                                                                                  10,
                                                                                  currentTransaction,
                                                                                  logger );

      if ( intCount < 20 ) {

        const userInDB = await UserService.getByName( userSessionStatus.UserName,
                                                      context.TimeZoneId,
                                                      transaction,
                                                      logger );

        if ( userInDB != null &&
             userInDB instanceof Error === false ) {

          if ( await UserGroupService.checkDisabledByName( userInDB.UserGroup.Name,
                                                           currentTransaction,
                                                           logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_GROUP_DISABLED',
                       Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change the email', userInDB.UserGroup.Name ),
                       Mark: 'B308899A1A43' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_GROUP_DISABLED',
                                   Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change the email', userInDB.UserGroup.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await UserGroupService.checkExpiredByName( userInDB.UserGroup.Name,
                                                               currentTransaction,
                                                               logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_GROUP_EXPIRED',
                       Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change the email', userInDB.UserGroup.Name ),
                       Mark: '0A4F7A24E7F9' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_GROUP_EXPIRED',
                                   Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change the email', userInDB.UserGroup.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await UserService.checkDisabledByName( userInDB.Name,
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
          else if ( await UserService.checkExpiredByName( userInDB.Name,
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

                const actionToken = await ActionTokenService.createOrUpdate(
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

                if ( actionToken &&
                    actionToken instanceof Error === false ) {

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
                               Count: 0,
                               Data: [
                                       {
                                         EMail: CommonUtilities.maskEMailList( request.body.EMail )
                                       }
                                     ]
                             }

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

                  const error = actionToken as any;

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
                   StatusCode: 400, //Bad request
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

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

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

  static async emailChange( request: Request,
                            transaction: any,
                            logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const actionTokenInDB = await ActionTokenService.getByToken( request.body.Code,
                                                                   "email_change",
                                                                   context.TimeZoneId,
                                                                   transaction,
                                                                   logger );

      if ( actionTokenInDB !== null &&
           actionTokenInDB instanceof Error === false ) {

        if ( actionTokenInDB.ExpireAt &&
             SystemUtilities.isDateAndTimeBefore( actionTokenInDB.ExpireAt ) ) {

          if ( actionTokenInDB.Status === 1 ) { //Waiting for use

            let userInDB = await UserService.getById( actionTokenInDB.Owner,
                                                      context.TimeZoneId,
                                                      transaction,
                                                      logger );

            if ( userInDB != null &&
                 userInDB instanceof Error === false ) {

              if ( await UserGroupService.checkDisabledByName( userInDB.UserGroup.Name,
                                                               currentTransaction,
                                                               logger ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_USER_GROUP_DISABLED',
                           Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change the email', userInDB.UserGroup.Name ),
                           Mark: 'C29DB5D3E5B9' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_GROUP_DISABLED',
                                       Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change the email', userInDB.UserGroup.Name ),
                                       Details: null
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }
              else if ( await UserGroupService.checkExpiredByName( userInDB.UserGroup.Name,
                                                                   currentTransaction,
                                                                   logger ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_USER_GROUP_EXPIRED',
                           Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change the email', userInDB.UserGroup.Name ),
                           Mark: '3C05036866E6' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_GROUP_EXPIRED',
                                       Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change the email', userInDB.UserGroup.Name ),
                                       Details: null
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }
              else if ( await UserService.checkDisabledByName( userInDB.Name,
                                                               currentTransaction,
                                                               logger ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_USER_DISABLED',
                           Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot change the email', userInDB.Name ),
                           Mark: 'D70CB73D33AB' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
              else if ( await UserService.checkExpiredByName( userInDB.Name,
                                                              currentTransaction,
                                                              logger ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_USER_EXPIRED',
                           Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot change the email', userInDB.Name ),
                           Mark: 'EE18C1A52A3C' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

                const jsonExtraData = CommonUtilities.parseJSON( actionTokenInDB.ExtraData, logger );

                if ( jsonExtraData &&
                     CommonUtilities.isValidEMailList( jsonExtraData.NewEMail ) ) {

                  const strUserName = SystemUtilities.getInfoFromSessionStatus( context.UserSessionStatus,
                                                                                "UserName",
                                                                                logger );

                  let personInDB = null;
                  let personWithEMailChanged = null;

                  if ( !userInDB.UserPerson ) {

                    jsonExtraData.OldEmail = ""; //Create empty field, no old person assoicated

                    personWithEMailChanged = await PersonService.createOrUpdate(
                                                                                 {
                                                                                   Id: userInDB.Id,
                                                                                   FirstName: " ",
                                                                                   EMail: jsonExtraData.NewEMail,
                                                                                   CreatedBy: strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET,
                                                                                   CreatedAt: null
                                                                                 },
                                                                                 false,
                                                                                 currentTransaction,
                                                                                 logger
                                                                               );

                    personInDB = personWithEMailChanged;

                    if ( personInDB &&
                         personInDB instanceof Error === false ) {

                      userInDB.PersonId = personInDB.Id;
                      userInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
                      userInDB.UpdatedAt = null;

                      userInDB = await UserService.createOrUpdate( ( userInDB as any ).dataValues,
                                                                   true,
                                                                   currentTransaction,
                                                                   logger );

                    }

                  }
                  else {

                    personInDB = userInDB.UserPerson;

                    jsonExtraData.OldEmail = personInDB.EMail; //Save the the current person email

                    personInDB.EMail = jsonExtraData.NewEMail;
                    personInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
                    personInDB.UpdatedAt = null;

                    personWithEMailChanged = await PersonService.createOrUpdate( ( personInDB as any ).dataValues,
                                                                                 true,
                                                                                 currentTransaction,
                                                                                 logger );

                  }

                  if ( personWithEMailChanged instanceof Error  ) {

                    const error = personWithEMailChanged as any;

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
                  else if ( userInDB instanceof Error ) {

                    const error = userInDB as any;

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

                    actionTokenInDB.Status = 0;
                    actionTokenInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
                    actionTokenInDB.ExtraData = JSON.stringify( jsonExtraData ); //Save the old email and new email

                    const warnings = [];

                    const actionTokenUpdated = await ActionTokenService.createOrUpdate( ( actionTokenInDB as any ).dataValues,
                                                                                        true,
                                                                                        currentTransaction,
                                                                                        logger );

                    //ANCHOR update the token
                    if ( actionTokenUpdated instanceof Error ) {

                      const error = actionTokenUpdated as any;

                      warnings.push(
                                     {
                                       Code: error.name,
                                       Message: error.message,
                                       Details: await SystemUtilities.processErrorDetails( error )
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
                                                      to: jsonExtraData.NewEMail,
                                                      subject: await I18NManager.translate( strLanguage, "USER EMAIL CHANGE SUCCESS" ),
                                                      body: {
                                                              kind: "template",
                                                              file: `email-user-email-change-success-${strTemplateKind}.pug`,
                                                              language: context.Language,
                                                              variables: {
                                                                           user_name: userInDB.Name,
                                                                           user_email: CommonUtilities.maskPassword( jsonExtraData.NewEMail ),
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
                         Message: await I18NManager.translate( strLanguage, 'The user with id %s not found in database', actionTokenInDB.Owner ),
                         Mark: '81CBFCD7E4E8' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_NOT_FOUND',
                                     Message: await I18NManager.translate( strLanguage, 'The user with id %s not found in database', actionTokenInDB.Owner ),
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

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

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

  static async phoneChangeCodeSend( request: Request,
                                    transaction: any,
                                    logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }


      const userSessionStatus = context.UserSessionStatus;

      const intCount = await ActionTokenService.getCountActionTokenOnLastMinutes( "phone_number_change",
                                                                                  userSessionStatus ? userSessionStatus.UserId : "",
                                                                                  10,
                                                                                  currentTransaction,
                                                                                  logger );

      if ( intCount < 20 ) {

        const userInDB = await UserService.getByName( userSessionStatus.UserName,
                                                      context.TimeZoneId,
                                                      transaction,
                                                      logger );

        if ( userInDB != null &&
             userInDB instanceof Error === false ) {

          if ( await UserGroupService.checkDisabledByName( userInDB.UserGroup.Name,
                                                           currentTransaction,
                                                           logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_GROUP_DISABLED',
                       Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change the phone number', userInDB.UserGroup.Name ),
                       Mark: '98366EF44736' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_GROUP_DISABLED',
                                   Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change the phone number', userInDB.UserGroup.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await UserGroupService.checkExpiredByName( userInDB.UserGroup.Name,
                                                               currentTransaction,
                                                               logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_GROUP_EXPIRED',
                       Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change the phone number', userInDB.UserGroup.Name ),
                       Mark: '563CBF3EE2A5' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_GROUP_EXPIRED',
                                   Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change the phone number', userInDB.UserGroup.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await UserService.checkDisabledByName( userInDB.Name,
                                                           currentTransaction,
                                                           logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_DISABLED',
                       Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot change the phone number', userInDB.Name ),
                       Mark: '6D46A46F3106' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_DISABLED',
                                   Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot change the phone number', userInDB.Name ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( await UserService.checkExpiredByName( userInDB.Name,
                                                          currentTransaction,
                                                          logger ) ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_USER_EXPIRED',
                       Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot change the phone number', userInDB.Name ),
                       Mark: 'B722C2897726' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_USER_EXPIRED',
                                   Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot change the phone number', userInDB.Name ),
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

              const strWellFormatedPhoneNumberList = CommonUtilities.wellFormatedPhoneNumberList( request.body.Phone );

              if ( CommonUtilities.isValidPhoneNumberList( strWellFormatedPhoneNumberList ) ) {

                const strClearFormatedPhoneNumberList = CommonUtilities.clearFormatPhoneNumberList( strWellFormatedPhoneNumberList );

                //ANCHOR getInfoFromSessionStatus
                const strUserName = SystemUtilities.getInfoFromSessionStatus( context.UserSessionStatus,
                                                                              "UserName",
                                                                              logger );

                const strChangeCode = SystemUtilities.hashString( SystemUtilities.getCurrentDateAndTime().format(), 1, logger );

                const expireAt = SystemUtilities.getCurrentDateAndTimeIncMinutes( 60 );

                const actionToken = await ActionTokenService.createOrUpdate(
                                                                             {
                                                                               Kind: "phone_number_change",
                                                                               Owner: userInDB.Id,
                                                                               Token: strChangeCode,
                                                                               Status: 1,
                                                                               CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                               ExpireAt: expireAt.format(),
                                                                               ExtraData: `{ "NewPhoneNumber": "${strWellFormatedPhoneNumberList}" }`
                                                                             },
                                                                             false,
                                                                             currentTransaction,
                                                                             logger
                                                                           );

                if ( actionToken &&
                     actionToken instanceof Error === false ) {

                  //Send immediately the sms with the change code
                  if ( await NotificationManager.send(
                                                       "sms",
                                                       {
                                                         to: strClearFormatedPhoneNumberList,
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
                               Count: 0,
                               Data: [
                                       {
                                         Phone: CommonUtilities.maskPhoneList( request.body.Phone )
                                       }
                                     ]
                             }

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

                  const error = actionToken as any;

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
                   StatusCode: 400, //Bad request
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

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

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

  static async phoneNumberChange( request: Request,
                                  transaction: any,
                                  logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const actionTokenInDB = await ActionTokenService.getByToken( request.body.Code,
                                                                   "phone_number_change",
                                                                   context.TimeZoneId,
                                                                   transaction,
                                                                   logger );

      if ( actionTokenInDB !== null &&
           actionTokenInDB instanceof Error === false ) {

        if ( actionTokenInDB.ExpireAt &&
             SystemUtilities.isDateAndTimeBefore( actionTokenInDB.ExpireAt ) ) {

          if ( actionTokenInDB.Status === 1 ) { //Waiting for use

            let userInDB = await UserService.getById( actionTokenInDB.Owner,
                                                      context.TimeZoneId,
                                                      transaction,
                                                      logger );

            if ( userInDB != null &&
                 userInDB instanceof Error === false ) {

              if ( await UserGroupService.checkDisabledByName( userInDB.UserGroup.Name,
                                                               currentTransaction,
                                                               logger ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_USER_GROUP_DISABLED',
                           Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change the phone number', userInDB.UserGroup.Name ),
                           Mark: 'EAA7E9E5C6FA' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_GROUP_DISABLED',
                                       Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled. You cannot change the phone number', userInDB.UserGroup.Name ),
                                       Details: null
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }
              else if ( await UserGroupService.checkExpiredByName( userInDB.UserGroup.Name,
                                                                   currentTransaction,
                                                                   logger ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_USER_GROUP_EXPIRED',
                           Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change the phone number', userInDB.UserGroup.Name ),
                           Mark: 'E52573CD2052' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_GROUP_EXPIRED',
                                       Message: await I18NManager.translate( strLanguage, 'The user group %s is expired. You cannot change the phone number', userInDB.UserGroup.Name ),
                                       Details: null
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }
              else if ( await UserService.checkDisabledByName( userInDB.Name,
                                                               currentTransaction,
                                                               logger ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_USER_DISABLED',
                           Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot change the phone number', userInDB.Name ),
                           Mark: '8AB386DAE87B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_DISABLED',
                                       Message: await I18NManager.translate( strLanguage, 'The user %s is disabled. You cannot change the phone number', userInDB.Name ),
                                       Details: null
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }
              else if ( await UserService.checkExpiredByName( userInDB.Name,
                                                              currentTransaction,
                                                              logger ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_USER_EXPIRED',
                           Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot change the phone number', userInDB.Name ),
                           Mark: '15CB6C1B117B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_EXPIRED',
                                       Message: await I18NManager.translate( strLanguage, 'The user %s is expired. You cannot change the phone number', userInDB.Name ),
                                       Details: null
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }
              else {

                const jsonExtraData = CommonUtilities.parseJSON( actionTokenInDB.ExtraData, logger );

                if ( jsonExtraData &&
                     CommonUtilities.isValidPhoneNumberList( jsonExtraData.NewPhoneNumber ) ) {

                  const strUserName = SystemUtilities.getInfoFromSessionStatus( context.UserSessionStatus,
                                                                                "UserName",
                                                                                logger );

                  let personInDB = null;
                  let personWithPhoneChanged = null;

                  if ( !userInDB.UserPerson ) {

                    jsonExtraData.OldPhoneNumber = ""; //Create empty field, phone number person assoicated

                    personWithPhoneChanged = await PersonService.createOrUpdate(
                                                                                 {
                                                                                   Id: userInDB.Id,
                                                                                   FirstName: " ",
                                                                                   Phone: jsonExtraData.NewPhoneNumber,
                                                                                   CreatedBy: strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET,
                                                                                   CreatedAt: null
                                                                                 },
                                                                                 false,
                                                                                 currentTransaction,
                                                                                 logger
                                                                               );

                    personInDB = personWithPhoneChanged;

                    if ( personInDB &&
                         personInDB instanceof Error === false ) {

                      userInDB.PersonId = personInDB.Id;
                      userInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
                      userInDB.UpdatedAt = null;

                      userInDB = await UserService.createOrUpdate( ( userInDB as any ).dataValues,
                                                                   true,
                                                                   currentTransaction,
                                                                   logger );

                    }

                  }
                  else {

                    personInDB = userInDB.UserPerson;

                    jsonExtraData.OldPhoneNumber = personInDB.Phone; //Save the the current person phone number

                    personInDB.Phone = jsonExtraData.NewPhoneNumber;
                    personInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
                    personInDB.UpdatedAt = null;

                    personWithPhoneChanged = await PersonService.createOrUpdate( ( personInDB as any ).dataValues,
                                                                                 true,
                                                                                 currentTransaction,
                                                                                 logger );

                  }

                  if ( personWithPhoneChanged instanceof Error  ) {

                    const error = personWithPhoneChanged as any;

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
                  else if ( userInDB instanceof Error ) {

                    const error = userInDB as any;

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

                    actionTokenInDB.Status = 0;
                    actionTokenInDB.UpdatedBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
                    actionTokenInDB.ExtraData = JSON.stringify( jsonExtraData ); //Save the old phone number and new phone number

                    const warnings = [];

                    const actionTokenUpdated = await ActionTokenService.createOrUpdate( ( actionTokenInDB as any ).dataValues,
                                                                                        true,
                                                                                        currentTransaction,
                                                                                        logger );

                    //ANCHOR update the token
                    if ( actionTokenUpdated instanceof Error ) {

                      const error = actionTokenUpdated as any;

                      warnings.push(
                                     {
                                       Code: error.name,
                                       Message: error.message,
                                       Details: await SystemUtilities.processErrorDetails( error )
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

                    await NotificationManager.send(
                                                    "sms",
                                                    {
                                                      to: userInDB.UserPerson.Phone,
                                                      //context: "AMERICA/NEW_YORK",
                                                      foreign_data: `{ "user": ${strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET}  }`,
                                                      //device_id: "*",
                                                      body: {
                                                              kind: "self",
                                                              text: await I18NManager.translate( strLanguage, 'Phone number change success!' )
                                                            }
                                                    },
                                                    logger
                                                  );
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
                         Message: await I18NManager.translate( strLanguage, 'The user with id %s not found in database', actionTokenInDB.Owner ),
                         Mark: '17B6D60D5199' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_NOT_FOUND',
                                     Message: await I18NManager.translate( strLanguage, 'The user with id %s not found in database', actionTokenInDB.Owner ),
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

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

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

  static async profileGet( request: Request,
                           transaction: any,
                           logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      let strUserName = context.UserSessionStatus.UserName;

      let strAutorization = context.Authorization;

      let userSessionStatus = null;

      let bProfileOfAnotherUser = false;

      if ( context.UserSessionStatus.Role.includes( "#Administrator#" ) ) {

        if ( request.query.ShortToken ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await UserSessionStatusService.getUserSessionStatusByShortToken( request.query.ShortToken,
                                                                                               currentTransaction,
                                                                                               logger );

          if ( userSessionStatus &&
               userSessionStatus instanceof Error == false ) {

            strAutorization = userSessionStatus.Token ? userSessionStatus.Token : request.query.ShortToken;

            strUserName = userSessionStatus.UserName ? userSessionStatus.UserName : null;

          }
          else {

            strAutorization = request.query.ShortToken;

          }

        }
        else if ( request.query.Token ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await UserSessionStatusService.getUserSessionStatusByToken( strAutorization,
                                                                                          currentTransaction,
                                                                                          logger );

          if ( userSessionStatus &&
               userSessionStatus instanceof Error == false ) {

            strAutorization = userSessionStatus.Token ? userSessionStatus.Token : request.query.Token;

            strUserName = userSessionStatus.UserName ? userSessionStatus.UserName : null;

          }
          else {

            strAutorization = request.query.Token;

          }

        }

      }

      if ( bProfileOfAnotherUser &&
           userSessionStatus === null ) {

        result = {
                   StatusCode: 404, //Not found
                   Code: 'ERROR_USER_SESSION_NOT_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAutorization ),
                   Mark: '6AD438512BFA' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_SESSION_NOT_FOUND',
                               Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAutorization ),
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
                   Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAutorization ),
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
                                                                         authorization: strAutorization,
                                                                         code: "SUCESS_GET_SESSION_PROFILE",
                                                                         message: "Sucess get the user session profile information",
                                                                         mark: "1CB1DC7063D8",
                                                                         useSecondaryUserToCreatedBy: false,
                                                                         updateCreatedAt: request.query.CreatedAt === "1"
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

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.profileGet.name;

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

  static async profileSet( request: Request,
                           transaction: any,
                           logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      //

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.profileSet.name;

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

}