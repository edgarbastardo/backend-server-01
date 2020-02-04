import CommonUtilities from "../../common/CommonUtilities";
import SystemUtilities from "../../common/SystemUtilities";

import { Router, Request, Response, NextFunction } from 'express';

//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,
import bcrypt from 'bcrypt';

import DBConnectionManager from '../../common/managers/DBConnectionManager';
//import { Role } from "../models/Role";
import SystemConstants from "../../common/SystemContants";
import { User } from "../../common/database/models/User";
//import { UserSessionStatus } from "../models/UserSessionStatus";
import { UserGroup } from "../../common/database/models/UserGroup";
import { Person } from "../../common/database/models/Person";
import ConfigValueDataService from "../../common/database/services/ConfigValueDataService";
import UserSessionStatusService from "../../common/database/services/UserSessionStatusService";
import CacheManager from "../../common/managers/CacheManager";
import UserService from "../../common/database/services/UserService";
import CommonConstants from "../../common/CommonConstants";
import SecurityServiceController from "./SecurityService.controller";
import { PasswordParameters } from "./SecurityService.controller";
import UserGroupService from "../../common/database/services/UserGroupService";
import { UserSignup } from "../../common/database/models/UserSignup";
import NotificationManager from "../../common/managers/NotificationManager";
import { UserSessionStatus } from "../../common/database/models/UserSessionStatus";
import UserSignupService from "../../common/database/services/UserSignupService";
import CipherManager from "../../common/managers/CipherManager";
import PersonService from "../../common/database/services/PersonService";

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

      const strMark = "062260B81ABA";

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

      const strMark = "D3DD67D5851E";

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

      const strMark = "08E4E489430A";

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

      const strMark = "0CCFCCA4180C";

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

      const strMark = "B7DACA6CCE2F";

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

      const strMark = "08A795BE10E0";

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

      const strMark = "08A795BE10E0";

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

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const context = ( request as any ).context;

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

          let strTag = "";

          if ( signupProcessData.group !== "@__FromName__@" ) {

            strTag = !signupProcessData.passwordParameterTag ? "#" + signupProcessData.group + "#" : "";

          }
          else {

            strTag = !signupProcessData.passwordParameterTag ? "#" + request.body.Name + "#" : "";

          };

          strTag = signupProcessData.passwordParameterTag ? signupProcessData.passwordParameterTag : strTag;

          const passwordStrengthParameters = await SecurityServiceController.getConfigPasswordStrengthParameters( strTag,
                                                                                                                  transaction,
                                                                                                                  logger );


          const checkPasswordStrengthResult = await SecurityServiceController.checkPasswordStrength( passwordStrengthParameters,
                                                                                                     request.body.Password,
                                                                                                     logger );
          if ( checkPasswordStrengthResult.code === 1 ) {

            const bUserGroupExists = await UserGroupService.checkExistsByName( signupProcessData.group,
                                                                               transaction,
                                                                               logger );

            if ( signupProcessData.createGroup === false &&
                 bUserGroupExists === false ) {

              result = {
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_USER_GROUP_NOT_EXISTS',
                         Message: `The user group ${signupProcessData.group} defined by signup kind ${request.body.Kind} not exists`,
                         Mark: '49EEF768004F',
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_NOT_EXISTS',
                                     Message: `The user group ${signupProcessData.group} defined by signup kind ${request.body.Kind} not exists`,
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
                         Message: `The user group [${signupProcessData.group}] defined by signup kind [${request.body.Kind}] already exists`,
                         Mark: '3BAC1FA1D2A2',
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_ALREADY_EXISTS',
                                     Message: `The user group [${signupProcessData.group}] defined by signup kind [${request.body.Kind}] already exists`,
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( bUserGroupExists &&
                      await UserGroupService.checkDisabledByName( signupProcessData.group,
                                                                  transaction,
                                                                  logger ) ) {

              result = {
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_USER_GROUP_DISABLED',
                         Message: `The user group [${signupProcessData.group}] defined by signup kind [${request.body.Kind}] is disabled. You cannot signup new users`,
                         Mark: '88C3AE24AB5E',
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_DISABLED',
                                     Message: `The user group [${signupProcessData.group}] defined by signup kind [${request.body.Kind}] is disabled. You cannot signup new users`,
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( bUserGroupExists &&
                      await UserGroupService.checkExpiredByName( signupProcessData.group,
                                                                 transaction,
                                                                 logger ) ) {

              result = {
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_USER_GROUP_EXPIRED',
                         Message: `The user group [${signupProcessData.group}] defined by signup kind [${request.body.Kind}] is expired. You cannot signup new users`,
                         Mark: '53EC3D039492',
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_EXPIRED',
                                     Message: `The user group [${signupProcessData.group}] defined by signup kind [${request.body.Kind}] is expired. You cannot signup new users`,
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( await UserService.checkExistsByName( request.body.Name,
                                                           transaction,
                                                           logger ) ) {

              result = {
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                         Message: `The user name [${request.body.Name}] already exists.`,
                         Mark: 'B43E4A5C0D8D',
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                                     Message: `The user name [${request.body.Name}] already exists.`,
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else {

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

                const strUserName = SystemUtilities.getInfoFromSessionStatus( context.UserSessionStatus,
                                                                              "UserName",
                                                                              logger );
                const strId = SystemUtilities.getUUIDv4();
                const strToken = SystemUtilities.hashString( strId,
                                                             2,
                                                             logger ); //CRC32

                const strExpireAt = SystemUtilities.getCurrentDateAndTimeIncMinutes( signupProcessData.expireAt ).format();

                const userSignup = await UserSignup.create(
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
                                                              ExpireAt: strExpireAt
                                                            }
                                                          );

                if ( userSignup !== null ) {

                  if ( signupProcessData.status === 1 ) { //Automatic send activation code to email address

                    const configData = await this.getConfigGeneralDefaultInformation( transaction,
                                                                                      logger );

                    const strTemplateKind = await this.isWebFrontendClient( context.FrontendId,
                                                                            transaction,
                                                                            logger ) ? "web" : "mobile";

                    const strWebAppURL = await this.getConfigFrontendRules( context.FrontendId,
                                                                            "url",
                                                                            transaction,
                                                                            logger );

                    const strExpireAtInTimeZone = SystemUtilities.transformToTimeZone( strExpireAt,
                                                                                       context.TimeZoneId,
                                                                                       CommonConstants._DATE_TIME_LONG_FORMAT_04,
                                                                                       logger );

                    //Send immediately the mail for auto activate the new user account
                    if ( await NotificationManager.send(
                                                         "email",
                                                         {
                                                           from: configData[ "no_response_email" ] || "no-response@no-response.com",
                                                           to: request.body.EMail,
                                                           subject: "SIGNUP FOR NEW USER ACCOUNT",
                                                           body: {
                                                                   kind: "template",
                                                                   file: `email-signup-${strTemplateKind}.pug`,
                                                                   language: context.Language,
                                                                   variables: {
                                                                                user_name: request.body.Name,
                                                                                activation_code: strToken,
                                                                                web_app_url: strWebAppURL,
                                                                                expire_at: strExpireAtInTimeZone,
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
                                 StatusCode: 200, //ok
                                 Code: 'SUCCESS_USER_SIGNUP',
                                 Message: `Success to made the user signup. Now you need check for your mailbox`,
                                 Mark: 'B3F0B0AF21AC',
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
                                 StatusCode: 500, //ok
                                 Code: 'ERROR_USER_SIGNUP_CANNOT_SEND_EMAIL',
                                 Message: `Error cannot send the email to requested address`,
                                 Mark: '5B91FA66FE6D',
                                 LogId: null,
                                 IsError: true,
                                 Errors: [
                                           {
                                             Code: 'ERROR_USER_SIGNUP_CANNOT_SEND_EMAIL',
                                             Message: `Error cannot send the email to requested address`,
                                             Details: {
                                                        "EMails": request.body.EMail
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
                               StatusCode: 200, //ok
                               Code: 'SUCCESS_USER_SIGNUP_MANUAL_ACTIVATION',
                               Message: `Success to made the user signup. But you need wait to system administrator activate your new account`,
                               Mark: 'AE4751429BC8',
                               LogId: null,
                               IsError: false,
                               Errors: [],
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
                           Message: `One or more field values are invalid`,
                           Mark: 'F01229E593EE',
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                                       Message: `One or more field values are invalid`,
                                       Details: validator.errors.all()
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }

              /*
              if ( bUserGroupExists === false ) {

                await UserGroup.create(
                                        {
                                          Name: request.body.Name,
                                          Role: signupProcessData.groupRole,
                                          Comment: "Created by signup process",
                                          Tag: signupProcessData.groupTag
                                        }
                                      );

              }
              */

            }

          }
          else {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_PASSWORD_NOT_VALID',
                       Message: `The password is not valid`,
                       Mark: '24742802D110',
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
                     Code: 'ERROR_SIGNUP_KIND_NOT_VALID',
                     Message: `The singup kind ${request.body.Kind} for singup is not valid`,
                     Mark: 'E0E3A7CC1A6A',
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_SIGNUP_KIND_NOT_VALID',
                                 Message: `The singup kind ${request.body.Kind} is not valid`,
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
                   Message: 'Not allowed to signup from this the kind of frontend',
                   Mark: '9333A33809AD',
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_FRONTEND_KIND_NOT_ALLOWED',
                               Message: `Not allowed to signup from this the kind of frontend`,
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

      const strMark = "309DBDE7EEAF";

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
                 StatusCode: 500,
                 Code: 'ERROR_UNEXPECTED',
                 Message: 'Unexpected error. Please read the server log for more details.',
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

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const context = ( request as any ).context;

      const userSignup = await UserSignupService.getByToken( request.body.Activation,
                                                             context.TimeZoneId,
                                                             currentTransaction,
                                                             logger );

      if ( userSignup !== null &&
           userSignup instanceof Error === false ) {

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

              const bUserGroupExists = await UserGroupService.checkExistsByName( signupProcessData.group,
                                                                                 transaction,
                                                                                 logger );

              if ( signupProcessData.createGroup === false &&
                   bUserGroupExists === false ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_USER_GROUP_NOT_EXISTS',
                           Message: `The user group ${signupProcessData.group} defined by signup kind ${userSignup.Kind} not exists`,
                           Mark: '0EA9AC54E217',
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_GROUP_NOT_EXISTS',
                                       Message: `The user group ${signupProcessData.group} defined by signup kind ${userSignup.Kind} not exists`,
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
                           Message: `The user group [${signupProcessData.group}] defined by signup kind [${userSignup.Kind}] already exists`,
                           Mark: '832157FFA57C',
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_GROUP_ALREADY_EXISTS',
                                       Message: `The user group [${signupProcessData.group}] defined by signup kind [${userSignup.Kind}] already exists`,
                                       Details: null
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }
              else if ( bUserGroupExists &&
                        await UserGroupService.checkDisabledByName( signupProcessData.group,
                                                                    transaction,
                                                                    logger ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_USER_GROUP_DISABLED',
                           Message: `The user group [${signupProcessData.group}] defined by signup kind [${userSignup.Kind}] is disabled. You cannot signup new users`,
                           Mark: '74E11EE1CFE2',
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_GROUP_DISABLED',
                                       Message: `The user group [${signupProcessData.group}] defined by signup kind [${userSignup.Kind}] is disabled. You cannot signup new users`,
                                       Details: null
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }
              else if ( bUserGroupExists &&
                        await UserGroupService.checkExpiredByName( signupProcessData.group,
                                                                   transaction,
                                                                   logger ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_USER_GROUP_EXPIRED',
                           Message: `The user group [${signupProcessData.group}] defined by signup kind [${userSignup.Kind}] is expired. You cannot signup new users`,
                           Mark: '2E99F86FF13B',
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_GROUP_EXPIRED',
                                       Message: `The user group [${signupProcessData.group}] defined by signup kind [${userSignup.Kind}] is expired. You cannot signup new users`,
                                       Details: null
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }
              else if ( await UserService.checkExistsByName( userSignup.Name,
                                                             transaction,
                                                             logger ) ) {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                           Message: `The user name [${userSignup.Name}] already exists.`,
                           Mark: '46F913842BF5',
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                                       Message: `The user name [${userSignup.Name}] already exists.`,
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

                let userGroup = null;
                let person = null;
                let user = null;

                if ( signupProcessData.createGroup ) {

                  //Create new group
                  userGroup = await UserGroupService.createOrUpdate(
                                                                     {
                                                                       Name: userSignup.Name,
                                                                       Role: signupProcessData.groupRole,
                                                                       Tag: signupProcessData.groupTag,
                                                                       ExpireAt: SystemUtilities.getCurrentDateAndTimeIncMinutes( signupProcessData.groupExpireAt ),
                                                                       CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                       Comment: userSignup.Comment
                                                                     },
                                                                     false,
                                                                     transaction,
                                                                     logger
                                                                   );

                }
                else {

                  userGroup = await UserGroupService.getByName( signupProcessData.group,
                                                                context.TimeZoneId,
                                                                transaction,
                                                                logger );

                }

                if ( userGroup &&
                     userGroup instanceof Error === false ) {

                  person = PersonService.createOrUpdate(
                                                         {
                                                           FirstName: userSignup.FirstName,
                                                           LastName: userSignup.LastName,
                                                           Phone: userSignup.Phone,
                                                           EMail: userSignup.EMail,
                                                           Comment: userSignup.Comment
                                                         },
                                                         false,
                                                         transaction,
                                                         logger
                                                       );

                  if ( person instanceof Error === false ) {

                    //Create new user
                    user = await UserService.createOrUpdate(
                                                             {
                                                               Id: person.Id,
                                                               PersonId: person.Id,
                                                               GroupId: userGroup.Id,
                                                               Name: userSignup.Name,
                                                               Password: await CipherManager.decrypt( userSignup.Password, logger ),
                                                               Role: signupProcessData.userRole ? signupProcessData.userRole : null,
                                                               Tag: signupProcessData.userTag ? signupProcessData.userTag : null,
                                                               ExpireAt: SystemUtilities.getCurrentDateAndTimeIncMinutes( signupProcessData.userExpireAt ),
                                                               Comment: userSignup.Comment,
                                                               CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                             },
                                                             false,
                                                             transaction,
                                                             logger
                                                           );

                    if ( user instanceof Error === false ) {

                      //

                    }
                    else {

                      let error = user as any;

                      result = {
                                 StatusCode: 500,
                                 Code: 'ERROR_UNEXPECTED',
                                 Message: 'Unexpected error. Please read the server log for more details.',
                                 Mark: '0FA42BB1DE80',
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

                    let error = person as any;

                    result = {
                               StatusCode: 500,
                               Code: 'ERROR_UNEXPECTED',
                               Message: 'Unexpected error. Please read the server log for more details.',
                               Mark: 'AB370C6C4B51',
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

                  let error = userGroup as any;

                  result = {
                             StatusCode: 500,
                             Code: 'ERROR_UNEXPECTED',
                             Message: 'Unexpected error. Please read the server log for more details.',
                             Mark: '91F9DE73ECDB',
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
                         Message: `The singup kind ${request.body.Kind} for singup is not valid`,
                         Mark: 'C632418EF717',
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_SIGNUP_KIND_NOT_VALID',
                                     Message: `The singup kind ${request.body.Kind} is not valid`,
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
                       Message: 'Not allowed to signup from this the kind of frontend',
                       Mark: '2A8CD841F553',
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_FRONTEND_KIND_NOT_ALLOWED',
                                   Message: `Not allowed to signup from this the kind of frontend`,
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
                     Message: 'Activation code is expired',
                     Mark: 'B212EA552AEA',
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_ACTIVATION_CODE_EXPIRED',
                                 Message: `Activation code is expired`,
                                 Details: userSignup.ExpireAt
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
                   Message: 'Activation code is not found',
                   Mark: '7A446BC21A83',
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_ACTIVATION_CODE_NOT_FOUND',
                               Message: `Activation code is not found`,
                               Details: { ExpiredAt: userSignup.ExpireAt }
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

      const strMark = "5362D0AECBD3";

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
                 StatusCode: 500,
                 Code: 'ERROR_UNEXPECTED',
                 Message: 'Unexpected error. Please read the server log for more details.',
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