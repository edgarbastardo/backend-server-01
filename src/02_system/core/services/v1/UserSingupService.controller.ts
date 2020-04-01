import cluster from 'cluster';

import {
  Request,
  //json,
} from 'express';

import CommonConstants from '../../../common/CommonConstants';
import SystemConstants from "../../../common/SystemContants";

import CommonUtilities from "../../../common/CommonUtilities";
import SystemUtilities from "../../../common/SystemUtilities";

import I18NManager from "../../../common/managers/I18Manager";
import NotificationManager from "../../../common/managers/NotificationManager";
import DBConnectionManager from "../../../common/managers/DBConnectionManager";

import SecurityServiceController from './SecurityService.controller';

import SYSUserService from "../../../common/database/master/services/SYSUserService";
import SYSUserGroupService from "../../../common/database/master/services/SYSUserGroupService";
import SYSPersonService from '../../../common/database/master/services/SYSPersonService';
import UserOthersServiceController from './UserOthersService.controller';
import SYSUserSignupService from '../../../common/database/master/services/SYSUserSignupService';
import CipherManager from '../../../common/managers/CipherManager';

const debug = require( 'debug' )( 'UserSingupServiceController' );

export default class UserSingupServiceController {

  static readonly _ID = "UserSingupServiceController";


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

      const bFrontendIdIsAllowed = await UserOthersServiceController.getFrontendIdIsAllowed( context.FrontendId,
                                                                                             request.body.Kind,
                                                                                             currentTransaction,
                                                                                             logger ) >= 0;

      if ( bFrontendIdIsAllowed ) {

        const signupProcessData = await UserOthersServiceController.getConfigSignupProcess( request.body.Kind,
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

              }

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

                      const configData = await UserOthersServiceController.getConfigGeneralDefaultInformation( currentTransaction,
                                                                                                               logger );

                      const strTemplateKind = await UserOthersServiceController.isWebFrontendClient( context.FrontendId,
                                                                                                     currentTransaction,
                                                                                                     logger ) ? "web" : "mobile";

                      const strWebAppURL = await UserOthersServiceController.getConfigFrontendRules( context.FrontendId,
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

                        NotificationManager.publishOnTopic( "SystemEvent",
                                                            {
                                                              SystemId: SystemUtilities.getSystemId(),
                                                              SystemName: process.env.APP_SERVER_DATA_NAME,
                                                              SubSystem: "UserSignup",
                                                              Token: "No apply",
                                                              UserId: "No apply",
                                                              UserName: request.body.Name,
                                                              UserGroupId: "No apply",
                                                              Code: "SUCCESS_USER_SIGNUP",
                                                              EventAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                              Data: {}
                                                            },
                                                            logger );

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

                        NotificationManager.publishOnTopic( "SystemEvent",
                                                            {
                                                              SystemId: SystemUtilities.getSystemId(),
                                                              SystemName: process.env.APP_SERVER_DATA_NAME,
                                                              SubSystem: "UserSignup",
                                                              Token: "No apply",
                                                              UserId: "No apply",
                                                              UserName: request.body.Name,
                                                              UserGroupId: "No apply",
                                                              Code: "ERROR_USER_SIGNUP_CANNOT_SEND_EMAIL",
                                                              EventAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                              Data: {}
                                                            },
                                                            logger );

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

            const bFrontendIdIsAllowed = await UserOthersServiceController.getFrontendIdIsAllowed( context.FrontendId,
                                                                                                   sysUserSignupInDB.Kind,
                                                                                                   currentTransaction,
                                                                                                   logger ) >= 0;

            if ( bFrontendIdIsAllowed ) {

              const signupProcessData = await UserOthersServiceController.getConfigSignupProcess( sysUserSignupInDB.Kind,
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
                        const configData = await UserOthersServiceController.getConfigGeneralDefaultInformation( currentTransaction,
                                                                                                                 logger );

                        const strTemplateKind = await UserOthersServiceController.isWebFrontendClient( context.FrontendId,
                                                                                                       currentTransaction,
                                                                                                       logger ) ? "web" : "mobile";

                        const strWebAppURL = await UserOthersServiceController.getConfigFrontendRules( context.FrontendId,
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

                        NotificationManager.publishOnTopic( "SystemEvent",
                                                            {
                                                              SystemId: SystemUtilities.getSystemId(),
                                                              SystemName: process.env.APP_SERVER_DATA_NAME,
                                                              SubSystem: "UserSignup",
                                                              Token: "No apply",
                                                              UserId: sysUserSignupInDB.Id,
                                                              UserName: sysUserSignupInDB.Name,
                                                              UserGroupId: sysUserGroup.Id,
                                                              Code: "SUCCESS_USER_ACTIVATION",
                                                              EventAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                              Data: {}
                                                            },
                                                            logger );

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

}