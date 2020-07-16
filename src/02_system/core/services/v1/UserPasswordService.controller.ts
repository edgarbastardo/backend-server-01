import cluster from "cluster";
import { Socket } from "net";

import {
  Request,
  //json,
} from "express";

import CommonConstants from "../../../common/CommonConstants";
import SystemConstants from "../../../common/SystemContants";

import CommonUtilities from "../../../common/CommonUtilities";
import SystemUtilities from "../../../common/SystemUtilities";

import I18NManager from "../../../common/managers/I18Manager";
import NotificationManager from "../../../common/managers/NotificationManager";
import DBConnectionManager from "../../../common/managers/DBConnectionManager";
import ApplicationServerDataManager from "../../../common/managers/ApplicationServerDataManager";

import SecurityServiceController from "./SecurityService.controller";
import UserOthersServiceController from "./UserOthersService.controller";

import SYSUserService from "../../../common/database/master/services/SYSUserService";
import SYSUserGroupService from "../../../common/database/master/services/SYSUserGroupService";
import SYSActionTokenService from "../../../common/database/master/services/SYSActionTokenService";

const debug = require( "debug" )( "UserPasswordServiceController" );

export default class UserPasswordServiceController {

  static readonly _ID = "UserPasswordServiceController";

  static async passwordRecoverCodeSend( request: Request,
                                        transaction: any,
                                        logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      if ( !request.socket ||
           request.socket instanceof Socket === false ||
           ApplicationServerDataManager.checkServiceEnabled( "USER_PASSWORD_RECOVER_CODE_SEND" ) ) {

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
                         Code: "ERROR_USER_GROUP_DISABLED",
                         Message: await I18NManager.translate( strLanguage, "The user group %s is disabled. You cannot recover your password", sysUserInDB.sysUserGroup.Name ),
                         Mark: "39212A25A17D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                         Mark: "2E99F86FF13B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                         Mark: "231463F16B95" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                         Mark: "55C127F50C3B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
            else {

              //ANCHOR userInDB
              const strTransport = CommonUtilities.toLowerCase( request.body.Transport );

              if ( !strTransport ||
                  strTransport === "email" ) {

                if ( !sysUserInDB.sysPerson ||
                    CommonUtilities.isValidEMailList( sysUserInDB.sysPerson.EMail ) === false ) {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: "ERROR_NOT_VALID_EMAIL",
                             Message: await I18NManager.translate( strLanguage, "The user %s not have a valid email address", request.body.Name ),
                             Mark: "CBFE3C19AA9C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: "ERROR_NOT_VALID_EMAIL",
                                         Message: await I18NManager.translate( strLanguage, "The user %s not have a valid email address", request.body.Name ),
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
                             Code: "ERROR_NOT_VALID_PHONE_NUMBER",
                             Message: await I18NManager.translate( strLanguage, "The user %s not have a valid phone number", request.body.Name ),
                             Mark: "CBFE3C19AA9C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: "ERROR_NOT_VALID_PHONE_NUMBER",
                                         Message: await I18NManager.translate( strLanguage, "The user %s not have a valid phone number", request.body.Name ),
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
                           Code: "ERROR_TRANSPORT_NOT_SUPPORTED",
                           Message: await I18NManager.translate( strLanguage, "The transport %s is not supported", strTransport ),
                           Mark: "2E4BC9D07111" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: "ERROR_TRANSPORT_NOT_SUPPORTED",
                                       Message: await I18NManager.translate( strLanguage, "The transport %s is not supported", strTransport ),
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

                        NotificationManager.publishOnTopic( "SystemEvent",
                                                            {
                                                              SystemId: SystemUtilities.getSystemId(),
                                                              SystemName: process.env.APP_SERVER_DATA_NAME,
                                                              SubSystem: "Security",
                                                              Token: context.UserSessionStatus.Token,
                                                              UserId: context.UserSessionStatus.UserId,
                                                              UserName: context.UserSessionStatus.UserName,
                                                              UserGroupId: context.UserSessionStatus.UserGroupId,
                                                              Code: "SUCCESS_SEND_RECOVER_PASSWORD_CODE_EMAIL",
                                                              EventAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                              Data: {}
                                                            },
                                                            logger );

                        result = {
                                   StatusCode: 200, //Ok
                                   Code: "SUCCESS_SEND_RECOVER_PASSWORD_CODE_EMAIL",
                                   Message: await I18NManager.translate( strLanguage, "Success to send recover password code. Please check your mailbox" ),
                                   Mark: "C4F1AF9E67C3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                                   Code: "ERROR_SEND_RECOVER_PASSWORD_CODE_EMAIL",
                                   Message: await I18NManager.translate( strLanguage, "Error cannot send the email to requested address" ),
                                   Mark: "D77EDF617B8B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   LogId: null,
                                   IsError: true,
                                   Errors: [
                                             {
                                               Code: "ERROR_SEND_RECOVER_PASSWORD_CODE_EMAIL",
                                               Message: await I18NManager.translate( strLanguage, "Error cannot send the email to requested address" ),
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
                                                                     text: await I18NManager.translate( strLanguage, "Your recover password code is: %s", strRecoverCode )
                                                                   }
                                                           },
                                                           logger
                                                         ) ) {

                        NotificationManager.publishOnTopic( "SystemEvent",
                                                            {
                                                              SystemId: SystemUtilities.getSystemId(),
                                                              SystemName: process.env.APP_SERVER_DATA_NAME,
                                                              SubSystem: "Security",
                                                              Token: context.UserSessionStatus.Token,
                                                              UserId: context.UserSessionStatus.UserId,
                                                              UserName: context.UserSessionStatus.UserName,
                                                              UserGroupId: context.UserSessionStatus.UserGroupId,
                                                              Code: "SUCCESS_SEND_RECOVER_PASSWORD_CODE_SMS",
                                                              EventAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                              Data: {}
                                                            },
                                                            logger );

                        result = {
                                   StatusCode: 200, //Ok
                                   Code: "SUCCESS_SEND_RECOVER_PASSWORD_CODE_SMS",
                                   Message: await I18NManager.translate( strLanguage, "Success to send recover password code. Please check your phone" ),
                                   Mark: "C4F1AF9E67C3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                                   Code: "ERROR_SEND_RECOVER_PASSWORD_CODE_SMS",
                                   Message: await I18NManager.translate( strLanguage, "Error cannot send the sms to requested phone number" ),
                                   Mark: "C21B85AD2EE1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   LogId: null,
                                   IsError: true,
                                   Errors: [
                                             {
                                               Code: "ERROR_SEND_RECOVER_PASSWORD_CODE_SMS",
                                               Message: await I18NManager.translate( strLanguage, "Error cannot send the sms to requested phone number" ),
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
                               Code: "ERROR_UNEXPECTED",
                               Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                               Mark: "DF70E9F0151D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                             Code: "ERROR_FRONTEND_KIND_NOT_ALLOWED",
                             Message: await I18NManager.translate( strLanguage, "Not allowed to recover password from this the kind of frontend" ),
                             Mark: "1B365FFB8CCB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: "ERROR_FRONTEND_KIND_NOT_ALLOWED",
                                         Message: await I18NManager.translate( strLanguage, "Not allowed to recover password from this the kind of frontend" ),
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
                       Code: "ERROR_USER_NOT_FOUND",
                       Message: await I18NManager.translate( strLanguage, "The user %s not found in database", request.body.Name ),
                       Mark: "7D761301ED89" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_USER_NOT_FOUND",
                                   Message: await I18NManager.translate( strLanguage, "The user %s not found in database", request.body.Name ),
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
                     Code: "ERROR_TOO_MANY_RECOVER_REQUEST",
                     Message: await I18NManager.translate( strLanguage, "The user %s has too many password recovery requests", request.body.Name ),
                     Mark: strMark,
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_TOO_MANY_RECOVER_REQUEST",
                                 Message: await I18NManager.translate( strLanguage, "The user %s has too many password recovery requests", request.body.Name ),
                                 Details: { Count: intCount, Comment: "In last 10 minutes" }
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

          const debugMark = debug.extend( strMark );

          debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( "The user %s has too many password recovery requests", request.body.Name );

          if ( logger &&
               typeof logger.warning === "function" ) {

            logger.warning( "The user %s has too many password recovery requests", request.body.Name );

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
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_PATH_DISABLED",
                   Message: await I18NManager.translate( strLanguage, "Not allowed because the path is disabled" ),
                   Mark: "B97BEA6F6036" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_PATH_DISABLED",
                               Message: await I18NManager.translate( strLanguage, "Not allowed because the path is disabled" ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
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

  static async passwordRecover( request: Request,
                                transaction: any,
                                logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      if ( !request.socket ||
           request.socket instanceof Socket === false ||
           ApplicationServerDataManager.checkServiceEnabled( "USER_PASSWORD_RECOVER" ) ) {

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
                             Code: "ERROR_USER_GROUP_DISABLED",
                             Message: await I18NManager.translate( strLanguage, "The user group %s is disabled. You cannot recover your password", sysUserInDB.sysUserGroup.Name ),
                             Mark: "63C9C6FBCB8F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                             Mark: "9471EA8763E3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                             Mark: "D013A4C4C1D6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                             Mark: "5EE4EEA9A907" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

                      NotificationManager.publishOnTopic( "SystemEvent",
                                                          {
                                                            SystemId: SystemUtilities.getSystemId(),
                                                            SystemName: process.env.APP_SERVER_DATA_NAME,
                                                            SubSystem: "Security",
                                                            Token: context.UserSessionStatus.Token,
                                                            UserId: context.UserSessionStatus.UserId,
                                                            UserName: context.UserSessionStatus.UserName,
                                                            UserGroupId: context.UserSessionStatus.UserGroupId,
                                                            Code: "SUCCESS_PASSWORD_CHANGE",
                                                            EventAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                            Data: {}
                                                          },
                                                          logger );

                      result = {
                                 StatusCode: 200, //Ok
                                 Code: "SUCCESS_PASSWORD_CHANGE",
                                 Message: await I18NManager.translate( strLanguage, "Success to change the password. Remember use it in the next login" ),
                                 Mark: "49E15D297D10" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                                 Code: "ERROR_UNEXPECTED",
                                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                                 Mark: "D5659A5825AC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                               Code: "ERROR_PASSWORD_NOT_VALID",
                               Message: await I18NManager.translate( strLanguage, "The password is not valid" ),
                               Mark: "77B7830DEB04" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                           Code: "ERROR_USER_NOT_FOUND",
                           Message: await I18NManager.translate( strLanguage, "The user with id %s not found in database", sysActionTokenInDB.Owner ),
                           Mark: "7DDC6B0761EE" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: "ERROR_USER_NOT_FOUND",
                                       Message: await I18NManager.translate( strLanguage, "The user with id %s not found in database", sysActionTokenInDB.Owner ),
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
                         Code: "ERROR_RECOVER_PASSWORD_CODE_ALREADY_USED",
                         Message: await I18NManager.translate( strLanguage, "The recover password code %s already used", request.body.Code ),
                         Mark: "9512C5FEBECA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: "ERROR_RECOVER_PASSWORD_CODE_ALREADY_USED",
                                     Message: await I18NManager.translate( strLanguage, "The recover password code %s already used", request.body.Code ),
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
                       Code: "ERROR_RECOVER_PASSWORD_CODE_EXPIRED",
                       Message: await I18NManager.translate( strLanguage, "The recover password code %s is expired", request.body.Code ),
                       Mark: "42E47D603396" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_RECOVER_PASSWORD_CODE_EXPIRED",
                                   Message: await I18NManager.translate( strLanguage, "The recover password code %s is expired", request.body.Code ),
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
                     Code: "ERROR_RECOVER_PASSWORD_CODE_NOT_FOUND",
                     Message: await I18NManager.translate( strLanguage, "The recover password code %s not found in database", request.body.Code ),
                     Mark: "567B7A76F7BB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_RECOVER_PASSWORD_CODE_NOT_FOUND",
                                 Message: await I18NManager.translate( strLanguage, "The recover password code %s not found in database", request.body.Code ),
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
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_PATH_DISABLED",
                   Message: await I18NManager.translate( strLanguage, "Not allowed because the path is disabled" ),
                   Mark: "6829189D28C1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_PATH_DISABLED",
                               Message: await I18NManager.translate( strLanguage, "Not allowed because the path is disabled" ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
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
