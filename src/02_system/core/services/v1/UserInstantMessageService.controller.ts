import cluster from 'cluster';

import {
  Request,
  //json,
} from 'express';

import CommonConstants from '../../../common/CommonConstants';

import CommonUtilities from "../../../common/CommonUtilities";
import SystemUtilities from "../../../common/SystemUtilities";

import I18NManager from "../../../common/managers/I18Manager";
import DBConnectionManager from "../../../common/managers/DBConnectionManager";
import CacheManager from '../../../common/managers/CacheManager';
import NotificationManager from "../../../common/managers/NotificationManager";
import SYSUserSessionPresenceService from '../../../common/database/services/SYSUserSessionPresenceService';
import InstantMenssageManager from '../../../common/managers/InstantMessageManager';
import MiddlewareManager from '../../../common/managers/MiddlewareManager';

/*
import NotificationManager from '../../../common/managers/NotificationManager';
import SYSUserSessionDeviceService from '../../../common/database/services/SYSUserSessionDeviceService';
import { SYSUserSessionDevice } from "../../../common/database/models/SYSUserSessionDevice";
import { SYSUserSessionPresence } from "../../../common/database/models/SYSUserSessionPresence";
import InstantMenssageManager from "../../../common/managers/InstantMessageManager";
*/

const debug = require( 'debug' )( 'UserInstantMessageServiceController' );

export default class UserInstantMessageServiceController {

  static readonly _ID = "UserInstantMessageServiceController";

  static async createInstantMessageAuthorization( request: Request,
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

      let strSocketToken = null;

      if ( CommonUtilities.isNullOrEmpty( userSessionStatus.SocketToken ) ||
           ( request.query.Force === "1" /*&&
             userSessionStatus.Token.startsWith( "p:" ) === false*/ ) ) {

        const strId = SystemUtilities.getUUIDv4();

        strSocketToken = SystemUtilities.hashString( strId, 1, logger ); //xx hash

        userSessionStatus.SocketToken = strSocketToken;

        //Update the cache and database
        await SystemUtilities.createOrUpdateUserSessionStatus( userSessionStatus.Token,
                                                               userSessionStatus,
                                                               false,    //Set roles?
                                                               null,     //User group roles
                                                               null,     //User roles
                                                               true,     //Force update?
                                                               2,        //Only 1 try
                                                               4 * 1000, //Second
                                                               currentTransaction,
                                                               logger );

        await CacheManager.setData( strSocketToken,
                                    userSessionStatus.Token,
                                    logger ); //Save to cache the association between generated binary data Auth Token and the main Authorization Token

      }
      else {

        await CacheManager.setData( strSocketToken,
                                    userSessionStatus.Token,
                                    logger ); //Save to cache the association between generated binary data Auth Token and the main Authorization Token

        strSocketToken = userSessionStatus.SocketToken;

      }

      result = {
                 StatusCode: 200, //Ok
                 Code: 'SUCCESS_AUTH_TOKEN_CREATED',
                 Message: await I18NManager.translate( strLanguage, 'The instant message authorization token has been success created.' ),
                 Mark: '8508AF872A19' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: false,
                 Errors: [],
                 Warnings: [],
                 Count: 1,
                 Data: [
                         {
                           Auth: strSocketToken,
                         }
                       ]
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

      sourcePosition.method = this.name + "." + this.createInstantMessageAuthorization.name;

      const strMark = "4C8737D64088" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteInstantMessageAuthorization( request: Request,
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

      if ( userSessionStatus.SocketToken ) {

        const strSavedSocketToken = userSessionStatus.SocketToken;

        await CacheManager.deleteData( userSessionStatus.SocketToken,
                                       logger ); //Remove from cache

        userSessionStatus.SocketToken = null;

        //Update the cache and database
        await SystemUtilities.createOrUpdateUserSessionStatus( userSessionStatus.Token,
                                                               userSessionStatus,
                                                               false,    //Set roles?
                                                               null,     //User group roles
                                                               null,     //User roles
                                                               true,     //Force update?
                                                               2,        //Only 1 try
                                                               4 * 1000, //Second
                                                               currentTransaction,
                                                               logger );

        const sysUserSessionPresence = await SYSUserSessionPresenceService.getByToken( userSessionStatus.Token,
                                                                                       null,
                                                                                       currentTransaction,
                                                                                       logger );

        const warnings = [];

        if ( sysUserSessionPresence ) {

          if ( sysUserSessionPresence instanceof Error ) {

            NotificationManager.publishOnTopic( "InstantMessage",
                                                {
                                                  Name: "Disconnect",
                                                  Token: userSessionStatus.Token,
                                                  SocketToken: strSavedSocketToken,
                                                  PresenceId: "@error",
                                                  Server: "@error"
                                                },
                                                logger );

            const error = sysUserSessionPresence as any;

            warnings.push(
                           {
                             Code: 'WARNING_PRESENCE_DATA',
                             Message: await I18NManager.translate( strLanguage, 'Error to try to get the data presence' ),
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         );
          }
          else {

            NotificationManager.publishOnTopic( "InstantMessage",
                                                {
                                                  Name: "Disconnect",
                                                  Token: userSessionStatus.Token,
                                                  SocketToken: strSavedSocketToken,
                                                  PresenceId: sysUserSessionPresence.PresenceId,
                                                  Server: sysUserSessionPresence.Server
                                                },
                                                logger );

          }

        }

        result = {
                   StatusCode: 200, //Ok
                   Code: 'SUCCESS_AUTH_TOKEN_DELETED',
                   Message: await I18NManager.translate( strLanguage, 'The instant message authorization token has been success deleted.' ),
                   Mark: 'DE4E39A7EE92' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: warnings,
                   Count: 0,
                   Data: []
                 };

        bApplyTransaction = true;

      }
      else {

        result = {
                    StatusCode: 404, //Not found
                    Code: 'ERROR_AUTH_TOKEN_NOT_FOUND',
                    Message: await I18NManager.translate( strLanguage, 'The instant message authorization token not found.' ),
                    Mark: '358DDC2ACD70' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                    LogId: null,
                    IsError: true,
                    Errors: [
                              {
                                Code: 'ERROR_AUTH_TOKEN_NOT_FOUND',
                                Message: await I18NManager.translate( strLanguage, 'The instant message authorization token not found.' ),
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

      sourcePosition.method = this.name + "." + this.deleteInstantMessageAuthorization.name;

      const strMark = "0EA2FB8132E3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async createInstantMessage( request: Request,
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

      let messageRules = {
                           To: [ 'required', 'array' ],
                           Kind: [ 'required', 'min:5' ],
                           Body: [ 'required' ],
                         };

      let validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                 messageRules,
                                                                 null,
                                                                 logger );

      if ( validator.passes() ) { //Validate request.body field values

        const bodyToList = request.body.To;

        if ( bodyToList.length === 0 ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: 'ERROR_TO_LIST_EMPTY',
                     Message: await I18NManager.translate( strLanguage, 'The To list cannot be empty' ),
                     Mark: '3861F18052F1' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_TO_LIST_EMPTY',
                                 Message: await I18NManager.translate( strLanguage, 'The To list cannot be empty' ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else if ( bodyToList.length > 15 ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: 'ERROR_TO_LIST_IS_TOO_BIG',
                     Message: await I18NManager.translate( strLanguage, 'The To list is too big. Cannot contains more than 15 elements' ),
                     Mark: 'BDA9B2DBE31E' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_TO_LIST_EMPTY',
                                 Message: await I18NManager.translate( strLanguage, 'The To list is too big. Cannot contains more than 15 elements' ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else if ( Object.keys( request.body.Body ).length == 0 ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: 'ERROR_BODY_IS_EMPTY',
                     Message: await I18NManager.translate( strLanguage, 'The body object cannot be empty' ),
                     Mark: 'DE4C1C97566F' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_TO_LIST_EMPTY',
                                 Message: await I18NManager.translate( strLanguage, 'The body object cannot be empty' ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else {

          const checkResult = await InstantMenssageManager.check( userSessionStatus,
                                                                  request.body,
                                                                  currentTransaction,
                                                                  context,
                                                                  logger );

          if ( checkResult.IsError === false ) {

            let toList = [];
            let toPresenceIdList = [];
            let toWarningList = [];
            let toErrorList = [];

            for ( let intToIndex = 0; intToIndex < bodyToList.length; intToIndex++ ) {

              if ( bodyToList[ intToIndex ] ) {

                if ( bodyToList[ intToIndex ].startsWith( "room://" ) === false ) {

                  let userSessionPresenceList = await SYSUserSessionPresenceService.getUserSessionPresenceIdByUserNameLite( bodyToList[ intToIndex ],
                                                                                                                            currentTransaction,
                                                                                                                            logger );

                  if ( userSessionPresenceList instanceof Error === false ) {

                    userSessionPresenceList = userSessionPresenceList as [];

                    if ( userSessionPresenceList.length > 0 ) {

                      for ( let intIndex = 0; intIndex < userSessionPresenceList.length; intIndex++ ) {

                        let checkRequest = {
                                             context: {
                                                        Logger: logger,
                                                        UserSessionStatus: null,
                                                        Languaje: strLanguage
                                                      },
                                           };

                        let checkUserSessionStatus = await SystemUtilities.getUserSessionStatus( userSessionPresenceList[ intIndex ].UserSessionStatusToken,
                                                                                                 null,
                                                                                                 false,
                                                                                                 false,
                                                                                                 currentTransaction,
                                                                                                 logger );

                        checkRequest.context.UserSessionStatus = checkUserSessionStatus;

                        ( checkRequest as any ).returnResult = 1; //Force to return the result

                        //Check for valid session token
                        let resultData = await MiddlewareManager.middlewareCheckIsAuthenticated( checkRequest as any,
                                                                                                 null, //Not write response back
                                                                                                 null );

                        if ( resultData &&
                             resultData.StatusCode === 200 ) { //Ok the authorization token is valid

                          toList.push( bodyToList[ intToIndex ] );
                          toPresenceIdList.push( userSessionPresenceList[ intIndex ].PresenceId );

                        }

                      }

                    }
                    else {

                      toWarningList.push(
                                          {
                                            Code: "WARNING_CANNOT_GET_PRESENCE_ID_FROM_USER",
                                            Message: await I18NManager.translate( strLanguage, "Cannot get the presence id from the user %s", bodyToList[ intToIndex ] ),
                                            Details: null
                                          }
                                        );

                    }

                  }
                  else {

                    const error = userSessionPresenceList;

                    toErrorList.push(
                                      {
                                        Code: "ERROR_CANNOT_GET_PRESENCE_ID_FROM_USER",
                                        Message: await I18NManager.translate( strLanguage, "Cannot get the presence id from the user %s", bodyToList[ intToIndex ] ),
                                        Details: await SystemUtilities.processErrorDetails( error ) //error
                                      }
                                    );

                  }

                }
                else {

                  toList.push( bodyToList[ intToIndex ] );
                  toPresenceIdList.push( bodyToList[ intToIndex ] );

                }

              }
              else {

                toWarningList.push(
                                    {
                                      Code: "WARNING_USER_IS_EMPTY_OR_NULL",
                                      Message: await I18NManager.translate( strLanguage, "The user is empty o null. Ignoring" ),
                                      Details: {
                                                 Index: intToIndex
                                               }
                                    }
                                  );

              }

            }

            if ( await NotificationManager.publishOnTopic( "InstantMessage",
                                                           {
                                                             Name: "Send",
                                                             FromId: userSessionStatus.UserNameId,
                                                             From: userSessionStatus.UserName,
                                                             Kind: request.body.Kind,
                                                             To: toList,
                                                             ToPresence: toPresenceIdList,
                                                             Body: request.body.Body
                                                           },
                                                           logger ) === true ) {

              let intStatusCode = -1;
              let strCode = "";
              let strMessage = "";
              let bIsError = false;

              if ( toErrorList.length === 0 &&
                   toWarningList.length === 0 ) {

                intStatusCode = 200
                strCode = 'SUCCESS_SEND_MESSAGE';
                strMessage = await I18NManager.translate( strLanguage, 'Success message send to all users' );

              }
              else if ( toErrorList.length === bodyToList.length ) {

                intStatusCode = 400
                strCode = 'ERROR_SEND_MESSAGE';
                strMessage = await I18NManager.translate( strLanguage, 'Cannot send the message to any users. Please check the errors and warnings section' );
                bIsError = true;

              }
              else {

                intStatusCode = 202
                strCode = 'CHECK_DATA_AND_ERRORS_AND_WARNINGS';
                strMessage = await I18NManager.translate( strLanguage, 'The message cannot delivered to ALL users. Please check the data and errors and warnings section' );
                bIsError = toErrorList.length > 0;

              }

              result = {
                         StatusCode: intStatusCode, //Ok
                         Code: strCode,
                         Message: strMessage,
                         Mark: 'B88547D5233C' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: false,
                         Errors: toErrorList,
                         Warnings: toWarningList,
                         Count: toList.length,
                         Data: toList
                       };

            }
            else {

              result = {
                         StatusCode: 500, //Internal server error
                         Code: 'ERROR_UNEXPECTED',
                         Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                         Mark: "922C0DA98C93" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'FAIL_TO_PUBLISH_ON_TOPIC',
                                     Message: 'Cannot publish on topic the method publishOnTopic return false',
                                     Details: null
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
                       StatusCode: checkResult.StatusCode,
                       Code: checkResult.Code,
                       Message: checkResult.Message,
                       Mark: '888C716A0C2D' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: checkResult.Code,
                                   Message: checkResult.Message,
                                   Details: checkResult.Details
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     };

          }

        }

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                   Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid.' ),
                   Mark: 'D8FDD5B300C8' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                               Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid.' ),
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

      sourcePosition.method = this.name + "." + this.createInstantMessage.name;

      const strMark = "0696C843CBE1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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