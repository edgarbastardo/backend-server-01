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

import SYSUserService from "../../../common/database/master/services/SYSUserService";
import SYSUserGroupService from "../../../common/database/master/services/SYSUserGroupService";
import SYSPersonService from "../../../common/database/master/services/SYSPersonService";
import SYSActionTokenService from "../../../common/database/master/services/SYSActionTokenService";

const debug = require( "debug" )( "UserPhoneServiceController" );

export default class UserPhoneServiceController {

  static readonly _ID = "UserPhoneServiceController";


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
                       Code: "ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT",
                       Message: await I18NManager.translate( strLanguage, "Authorization token provided is persistent. You cannot change the phone number" ),
                       Mark: "4FB3974048ED" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT",
                                   Message: await I18NManager.translate( strLanguage, "Authorization token provided is persistent. You cannot change the phone number" ),
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
                       Message: await I18NManager.translate( strLanguage, "The user group %s is disabled. You cannot change the phone number", sysUserInDB.sysUserGroup.Name ),
                       Mark: "98366EF44736" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_USER_GROUP_DISABLED",
                                   Message: await I18NManager.translate( strLanguage, "The user group %s is disabled. You cannot change the phone number", sysUserInDB.sysUserGroup.Name ),
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
                       Message: await I18NManager.translate( strLanguage, "The user group %s is expired. You cannot change the phone number", sysUserInDB.sysUserGroup.Name ),
                       Mark: "563CBF3EE2A5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_USER_GROUP_EXPIRED",
                                   Message: await I18NManager.translate( strLanguage, "The user group %s is expired. You cannot change the phone number", sysUserInDB.sysUserGroup.Name ),
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
                       Message: await I18NManager.translate( strLanguage, "The user %s is disabled. You cannot change the phone number", sysUserInDB.Name ),
                       Mark: "6D46A46F3106" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_USER_DISABLED",
                                   Message: await I18NManager.translate( strLanguage, "The user %s is disabled. You cannot change the phone number", sysUserInDB.Name ),
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
                       Message: await I18NManager.translate( strLanguage, "The user %s is expired. You cannot change the phone number", sysUserInDB.Name ),
                       Mark: "B722C2897726" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_USER_EXPIRED",
                                   Message: await I18NManager.translate( strLanguage, "The user %s is expired. You cannot change the phone number", sysUserInDB.Name ),
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
                                                                 text: await I18NManager.translate( strLanguage, "Your phone number change code is: %s", strChangeCode )
                                                               }
                                                       },
                                                       logger
                                                     ) ) {

                    result = {
                               StatusCode: 200, //Ok
                               Code: "SUCCESS_SEND_PHONE_NUMBER_CHANGE_CODE_SMS",
                               Message: await I18NManager.translate( strLanguage, "Success to send phone number change code. Please check your phone" ),
                               Mark: "B6EFE4864DA7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                               Code: "ERROR_SEND_PHONE_NUMBER_CHANGE_CODE_SMS",
                               Message: await I18NManager.translate( strLanguage, "Error cannot send the sms to requested phone number" ),
                               Mark: "3657E857AF1F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: null,
                               IsError: true,
                               Errors: [
                                         {
                                           Code: "ERROR_SEND_PHONE_NUMBER_CHANGE_CODE_SMS",
                                           Message: await I18NManager.translate( strLanguage, "Error cannot send the sms to requested phone number" ),
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
                             Code: "ERROR_UNEXPECTED",
                             Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                             Mark: "B035AEB41192" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                           Code: "ERROR_PHONE_NUMBER_IS_INVALID",
                           Message: await I18NManager.translate( strLanguage, "The phone number is not valid" ),
                           Mark: "01E51F2FB37F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: "ERROR_PHONE_NUMBER_IS_INVALID",
                                       Message: await I18NManager.translate( strLanguage, "The phone number is not valid" ),
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
                         Code: "ERROR_WRONG_PASSWORD",
                         Message: await I18NManager.translate( strLanguage, "Your current password not match" ),
                         Mark: "920F14EFBDE7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Mark: "00FB818E026E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        const strMark = "49F9083D3F81" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

        result = {
                   StatusCode: 429, //Too Many Requests
                   Code: "ERROR_TOO_MANY_PHONE_NUMBER_CHANGE_REQUEST",
                   Message: await I18NManager.translate( strLanguage, "The user %s has too many phone number change requests", request.body.Name ),
                   Mark: strMark,
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_TOO_MANY_PHONE_CHANGE_REQUEST",
                               Message: await I18NManager.translate( strLanguage, "The user %s has too many phone number change requests", request.body.Name ),
                               Details: { Count: intCount, Comment: "In last 10 minutes" }
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

        const debugMark = debug.extend( strMark );

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( "The user %s has too many phone change requests", request.body.Name );

        if ( logger &&
             typeof logger.warning === "function" ) {

          logger.warning( "The user %s has too many phone change requests", request.body.Name );

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
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
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
                           Code: "ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT",
                           Message: await I18NManager.translate( strLanguage, "Authorization token provided is persistent. You cannot change the phone number" ),
                           Mark: "4FB3974048ED" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: "ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT",
                                       Message: await I18NManager.translate( strLanguage, "Authorization token provided is persistent. You cannot change the phone number" ),
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
                           Message: await I18NManager.translate( strLanguage, "The user group %s is disabled. You cannot change the phone number", sysUserInDB.sysUserGroup.Name ),
                           Mark: "EAA7E9E5C6FA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: "ERROR_USER_GROUP_DISABLED",
                                       Message: await I18NManager.translate( strLanguage, "The user group %s is disabled. You cannot change the phone number", sysUserInDB.sysUserGroup.Name ),
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
                           Message: await I18NManager.translate( strLanguage, "The user group %s is expired. You cannot change the phone number", sysUserInDB.sysUserGroup.Name ),
                           Mark: "E52573CD2052" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: "ERROR_USER_GROUP_EXPIRED",
                                       Message: await I18NManager.translate( strLanguage, "The user group %s is expired. You cannot change the phone number", sysUserInDB.sysUserGroup.Name ),
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
                           Message: await I18NManager.translate( strLanguage, "The user %s is disabled. You cannot change the phone number", sysUserInDB.Name ),
                           Mark: "8AB386DAE87B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: "ERROR_USER_DISABLED",
                                       Message: await I18NManager.translate( strLanguage, "The user %s is disabled. You cannot change the phone number", sysUserInDB.Name ),
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
                           Message: await I18NManager.translate( strLanguage, "The user %s is expired. You cannot change the phone number", sysUserInDB.Name ),
                           Mark: "15CB6C1B117B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: "ERROR_USER_EXPIRED",
                                       Message: await I18NManager.translate( strLanguage, "The user %s is expired. You cannot change the phone number", sysUserInDB.Name ),
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
                               Code: "ERROR_UNEXPECTED",
                               Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                               Mark: "16C6BCD6839E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                               Mark: "BE0B313EAA02" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                                                                   text: await I18NManager.translate( strLanguage, "Phone number change success!" )
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
                               Code: "SUCCESS_PHONE_NUMBER_CHANGE",
                               Message: await I18NManager.translate( strLanguage, "Success to change the user phone number." ),
                               Mark: "1DF00A420467" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                             Code: "ERROR_PHONE_NUMBER_NOT_VALID",
                             Message: await I18NManager.translate( strLanguage, "The phone number is not valid" ),
                             Mark: "8AC35D3BD025" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: "ERROR_PHONE_NUMBER_NOT_VALID",
                                         Message: await I18NManager.translate( strLanguage, "The phone number is not valid" ),
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
                         Code: "ERROR_USER_NOT_FOUND",
                         Message: await I18NManager.translate( strLanguage, "The user with id %s not found in database", sysActionTokenInDB.Owner ),
                         Mark: "17B6D60D5199" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                       Code: "ERROR_PHONE_NUMBER_CHANGE_CODE_ALREADY_USED",
                       Message: await I18NManager.translate( strLanguage, "The phone number change code %s already used", request.body.Code ),
                       Mark: "6CDB3A2649DA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_PHONE_NUMBER_CHANGE_CODE_ALREADY_USED",
                                   Message: await I18NManager.translate( strLanguage, "The phone number change code %s already used", request.body.Code ),
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
                     Code: "ERROR_PHONE_NUMBER_CHANGE_CODE_EXPIRED",
                     Message: await I18NManager.translate( strLanguage, "The phone number change code %s is expired", request.body.Code ),
                     Mark: "3B86B9F1AD0E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_PHONE_NUMBER_CHANGE_CODE_EXPIRED",
                                 Message: await I18NManager.translate( strLanguage, "The phone number change code %s is expired", request.body.Code ),
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
                   Code: "ERROR_PHONE_NUMBER_CHANGE_CODE_NOT_FOUND",
                   Message: await I18NManager.translate( strLanguage, "The phone number change code %s not found in database", request.body.Code ),
                   Mark: "C0A61871B549" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_PHONE_NUMBER_CHANGE_CODE_NOT_FOUND",
                               Message: await I18NManager.translate( strLanguage, "The phone number change code %s not found in database", request.body.Code ),
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
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
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
