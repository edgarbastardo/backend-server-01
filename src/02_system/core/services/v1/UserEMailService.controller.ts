import cluster from "cluster";

import {
  Request,
  //json,
} from "express";
import bcrypt from "bcrypt";

import CommonConstants from "../../../common/CommonConstants";
import SystemConstants from "../../../common/SystemContants";

import CommonUtilities from "../../../common/CommonUtilities";
import SystemUtilities from "../../../common/SystemUtilities";

import I18NManager from "../../../common/managers/I18Manager";
import NotificationManager from "../../../common/managers/NotificationManager";
import DBConnectionManager from "../../../common/managers/DBConnectionManager";

import UserOthersServiceController from "./UserOthersService.controller";

import SYSUserService from "../../../common/database/master/services/SYSUserService";
import SYSPersonService from "../../../common/database/master/services/SYSPersonService";
import SYSActionTokenService from "../../../common/database/master/services/SYSActionTokenService";
import SYSUserGroupService from "../../../common/database/master/services/SYSUserGroupService";

const debug = require( "debug" )( "UserEMailServiceController" );

export default class UserEMailServiceController {

  static readonly _ID = "UserEMailServiceController";


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
                       Code: "ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT",
                       Message: await I18NManager.translate( strLanguage, "Authorization token provided is persistent. You cannot change the email" ),
                       Mark: "EF21E15D0ACA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT",
                                   Message: await I18NManager.translate( strLanguage, "Authorization token provided is persistent. You cannot change the email" ),
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
                       Code: "ERROR_USER_GROUP_DISABLED",
                       Message: await I18NManager.translate( strLanguage, "The user group %s is disabled. You cannot change the email", userInDB.sysUserGroup.Name ),
                       Mark: "B308899A1A43" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_USER_GROUP_DISABLED",
                                   Message: await I18NManager.translate( strLanguage, "The user group %s is disabled. You cannot change the email", userInDB.sysUserGroup.Name ),
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
                       Code: "ERROR_USER_GROUP_EXPIRED",
                       Message: await I18NManager.translate( strLanguage, "The user group %s is expired. You cannot change the email", userInDB.sysUserGroup.Name ),
                       Mark: "0A4F7A24E7F9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_USER_GROUP_EXPIRED",
                                   Message: await I18NManager.translate( strLanguage, "The user group %s is expired. You cannot change the email", userInDB.sysUserGroup.Name ),
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
                       Code: "ERROR_USER_DISABLED",
                       Message: await I18NManager.translate( strLanguage, "The user %s is disabled. You cannot change the email", userInDB.Name ),
                       Mark: "E5543FAB4485" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_USER_DISABLED",
                                   Message: await I18NManager.translate( strLanguage, "The user %s is disabled. You cannot change the email", userInDB.Name ),
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
                       Code: "ERROR_USER_EXPIRED",
                       Message: await I18NManager.translate( strLanguage, "The user %s is expired. You cannot change the email", userInDB.Name ),
                       Mark: "1BD2335313DC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_USER_EXPIRED",
                                   Message: await I18NManager.translate( strLanguage, "The user %s is expired. You cannot change the email", userInDB.Name ),
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
                               Code: "SUCCESS_SEND_EMAIL_CHANGE_CODE_EMAIL",
                               Message: await I18NManager.translate( strLanguage, "Success to send email change code. Please check your mailbox" ),
                               Mark: "9145ACBE178E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                               Code: "ERROR_SEND_EMAIL_CHANGE_CODE_EMAIL",
                               Message: await I18NManager.translate( strLanguage, "Error cannot send the email to requested address" ),
                               Mark: "150A614E67B7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: null,
                               IsError: true,
                               Errors: [
                                         {
                                           Code: "ERROR_SEND_EMAIL_CHANGE_CODE_EMAIL",
                                           Message: await I18NManager.translate( strLanguage, "Error cannot send the email to requested address" ),
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
                             Code: "ERROR_UNEXPECTED",
                             Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                             Mark: "E739AB104B52" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                           Code: "ERROR_EMAIL_IS_INVALID",
                           Message: await I18NManager.translate( strLanguage, "The email is not valid" ),
                           Mark: "01E51F2FB37F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: "ERROR_EMAIL_IS_INVALID",
                                       Message: await I18NManager.translate( strLanguage, "The email is not valid" ),
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
                         Code: "ERROR_WRONG_PASSWORD",
                         Message: await I18NManager.translate( strLanguage, "Your current password not match" ),
                         Mark: "70AFDA615BD7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Message: await I18NManager.translate( strLanguage, "The user %s not found in database", request.body.Name ),
                     Mark: "4FC2BD9354AD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        const strMark = "DD514B770B97" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

        result = {
                   StatusCode: 429, //Too Many Requests
                   Code: "ERROR_TOO_MANY_EMAIL_CHANGE_REQUEST",
                   Message: await I18NManager.translate( strLanguage, "The user %s has too many email change requests", request.body.Name ),
                   Mark: strMark,
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_TOO_MANY_EMAIL_CHANGE_REQUEST",
                               Message: await I18NManager.translate( strLanguage, "The user %s has too many email change requests", request.body.Name ),
                               Details: { Count: intCount, Comment: "In last 10 minutes" }
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

        const debugMark = debug.extend( strMark );

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( "The user %s has too many email change requests", request.body.Name );

        if ( logger &&
             typeof logger.warning === "function" ) {

          logger.warning( "The user %s has too many email change requests", request.body.Name );

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
                           Code: "ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT",
                           Message: await I18NManager.translate( strLanguage, "Authorization token provided is persistent. You cannot change the email" ),
                           Mark: "B4381A42D579" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: "ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT",
                                       Message: await I18NManager.translate( strLanguage, "Authorization token provided is persistent. You cannot change the email" ),
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
                           Message: await I18NManager.translate( strLanguage, "The user group %s is disabled. You cannot change the email", sysUserInDB.sysUserGroup.Name ),
                           Mark: "C29DB5D3E5B9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: "ERROR_USER_GROUP_DISABLED",
                                       Message: await I18NManager.translate( strLanguage, "The user group %s is disabled. You cannot change the email", sysUserInDB.sysUserGroup.Name ),
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
                           Message: await I18NManager.translate( strLanguage, "The user group %s is expired. You cannot change the email", sysUserInDB.sysUserGroup.Name ),
                           Mark: "3C05036866E6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: "ERROR_USER_GROUP_EXPIRED",
                                       Message: await I18NManager.translate( strLanguage, "The user group %s is expired. You cannot change the email", sysUserInDB.sysUserGroup.Name ),
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
                           Message: await I18NManager.translate( strLanguage, "The user %s is disabled. You cannot change the email", sysUserInDB.Name ),
                           Mark: "D70CB73D33AB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: "ERROR_USER_DISABLED",
                                       Message: await I18NManager.translate( strLanguage, "The user %s is disabled. You cannot change the email", sysUserInDB.Name ),
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
                           Message: await I18NManager.translate( strLanguage, "The user %s is expired. You cannot change the email", sysUserInDB.Name ),
                           Mark: "EE18C1A52A3C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: "ERROR_USER_EXPIRED",
                                       Message: await I18NManager.translate( strLanguage, "The user %s is expired. You cannot change the email", sysUserInDB.Name ),
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
                               Code: "ERROR_UNEXPECTED",
                               Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                               Mark: "D111D4B14F3D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                               Code: "ERROR_UNEXPECTED",
                               Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                               Mark: "A73E92AF2757" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                               Code: "SUCCESS_EMAIL_CHANGE",
                               Message: await I18NManager.translate( strLanguage, "Success to change the user email." ),
                               Mark: "D460632D4A2E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                             Code: "ERROR_EMAIL_NOT_VALID",
                             Message: await I18NManager.translate( strLanguage, "The email is not valid" ),
                             Mark: "B4A37DF40A10" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: "ERROR_EMAIL_NOT_VALID",
                                         Message: await I18NManager.translate( strLanguage, "The email is not valid" ),
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
                         Code: "ERROR_USER_NOT_FOUND",
                         Message: await I18NManager.translate( strLanguage, "The user with id %s not found in database", sysActionTokenInDB.Owner ),
                         Mark: "81CBFCD7E4E8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                       Code: "ERROR_EMAIL_CHANGE_CODE_ALREADY_USED",
                       Message: await I18NManager.translate( strLanguage, "The email change code %s already used", request.body.Code ),
                       Mark: "EBB44FAB84DB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_EMAIL_CHANGE_CODE_ALREADY_USED",
                                   Message: await I18NManager.translate( strLanguage, "The email change code %s already used", request.body.Code ),
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
                     Code: "ERROR_EMAIL_CHANGE_CODE_EXPIRED",
                     Message: await I18NManager.translate( strLanguage, "The email change code %s is expired", request.body.Code ),
                     Mark: "B810BD062AF4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_EMAIL_CHANGE_CODE_EXPIRED",
                                 Message: await I18NManager.translate( strLanguage, "The email change code %s is expired", request.body.Code ),
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
                   Code: "ERROR_EMAIL_CHANGE_CODE_NOT_FOUND",
                   Message: await I18NManager.translate( strLanguage, "The email change code %s not found in database", request.body.Code ),
                   Mark: "5241B773D358" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_EMAIL_CHANGE_CODE_NOT_FOUND",
                               Message: await I18NManager.translate( strLanguage, "The email change code %s not found in database", request.body.Code ),
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
