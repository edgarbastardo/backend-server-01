import cluster from 'cluster';

import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

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
import SYSUserSessionPresenceService from "../../../common/database/services/SYSUserSessionPresenceService";
import InstantMenssageManager from '../../../common/managers/InstantMessageManager';
import MiddlewareManager from '../../../common/managers/MiddlewareManager';
import { SYSUserSessionPresence } from '../../../common/database/models/SYSUserSessionPresence';
import { SYSUser } from '../../../common/database/models/SYSUser';
import { SYSPerson } from '../../../common/database/models/SYSPerson';
import { SYSUserSessionStatus } from '../../../common/database/models/SYSUserSessionStatus';
import PresenceManager from "../../../common/managers/PresenceManager";
import { SYSUserSessionPresenceInRoom } from '../../../common/database/models/SYSUserSessionPresenceInRoom';
import { SYSUserSessionDevice } from "../../../common/database/models/SYSUserSessionDevice";
import { SYSUserGroup } from '../../../common/database/models/SYSUserGroup';

/*
import NotificationManager from '../../../common/managers/NotificationManager';
import SYSUserSessionDeviceService from '../../../common/database/services/SYSUserSessionDeviceService';
import { SYSUserSessionDevice } from "../../../common/database/models/SYSUserSessionDevice";
import { SYSUserSessionPresence } from "../../../common/database/models/SYSUserSessionPresence";
import InstantMenssageManager from "../../../common/managers/InstantMessageManager";
import PresenceManager from "../../../common/managers/PresenceManager";
import { SYSUserSessionPresenceInRoom } from "../../../common/database/models/SYSUserSessionPresenceInRoom";
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

        const warnings = [];

        //Send to instant message server a message to disconnect this user
        await SYSUserSessionPresenceService.disconnectFromInstantMessageServer( userSessionStatus,
                                                                                strSavedSocketToken,
                                                                                strLanguage,
                                                                                warnings,
                                                                                currentTransaction,
                                                                                logger );

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

            let toIdList = [];
            let toNameList = [];
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

                          toIdList.push( checkUserSessionStatus.UserId );
                          toNameList.push( bodyToList[ intToIndex ] );
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

                  toIdList.push( bodyToList[ intToIndex ] );
                  toNameList.push( bodyToList[ intToIndex ] );
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
                                                             FromId: userSessionStatus.UserId,
                                                             FromName: userSessionStatus.UserName,
                                                             Kind: request.body.Kind,
                                                             ToId: toIdList,
                                                             ToName: toNameList,
                                                             ToPresenceId: toPresenceIdList,
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
                         Count: toNameList.length,
                         Data: toNameList
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

  static async presenceRoom( request: Request,
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

      const sysUserSessionPresence = await SYSUserSessionPresenceService.getByToken( userSessionStatus.Token,
                                                                                     null,
                                                                                     currentTransaction,
                                                                                     logger );

      if ( !sysUserSessionPresence ) {

        result = {
                   StatusCode: 404, //Not found
                   Code: 'ERROR_NO_PRESENCE_DATA_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The presence data not found for the current user session.' ),
                   Mark: 'B83DDA0FED39' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_NO_PRESENCE_DATA_FOUND',
                               Message: await I18NManager.translate( strLanguage, 'The presence data not found for the current user session.' ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else if ( sysUserSessionPresence instanceof Error ) {

        const error = sysUserSessionPresence as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: 'ERROR_UNEXPECTED',
                   Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                   Mark: '0A27B82BF359' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        const roomDataList = await SYSUserSessionPresenceService.getUserSessionPresenceRoomList( sysUserSessionPresence.PresenceId,
                                                                                                 currentTransaction,
                                                                                                 logger );

        if ( roomDataList instanceof Error ) {

          const error = roomDataList as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: 'ERROR_UNEXPECTED',
                     Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                     Mark: '72E62FB65722' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

          const roomInfoList = [];

          for ( const currentRoom of roomDataList ) {

            const roomInfo = {
                               Id: currentRoom.Id,
                               Name: currentRoom.Name
                             };

            roomInfoList.push( roomInfo );

          }

          result = {
                     StatusCode: 200, //Ok
                     Code: 'SUCCESS_ROOM_LIST',
                     Message: await I18NManager.translate( strLanguage, 'Success get presence room list.' ),
                     Mark: 'A3F304A84376' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: roomInfoList.length,
                     Data: roomInfoList
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

      sourcePosition.method = this.name + "." + this.presenceRoom.name;

      const strMark = "640F892436D1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async presenceRoomCount( request: Request,
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

      const sysUserSessionPresence = await SYSUserSessionPresenceService.getByToken( userSessionStatus.Token,
                                                                                     null,
                                                                                     currentTransaction,
                                                                                     logger );

      if ( !sysUserSessionPresence ) {

        result = {
                   StatusCode: 404, //Not found
                   Code: 'ERROR_NO_PRESENCE_DATA_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The presence data not found for the current user session.' ),
                   Mark: '0EA89FC0BAE3' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_NO_PRESENCE_DATA_FOUND',
                               Message: await I18NManager.translate( strLanguage, 'The presence data not found for the current user session.' ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else if ( sysUserSessionPresence instanceof Error ) {

        const error = sysUserSessionPresence as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: 'ERROR_UNEXPECTED',
                   Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                   Mark: 'B9564173315E' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        const roomCount = await SYSUserSessionPresenceService.getUserSessionPresenceRoomListCount( sysUserSessionPresence.PresenceId,
                                                                                                   currentTransaction,
                                                                                                   logger );

        if ( roomCount instanceof Error ) {

          const error = roomCount as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: 'ERROR_UNEXPECTED',
                     Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                     Mark: '72E62FB65722' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     StatusCode: 200, //Ok
                     Code: 'SUCCESS_ROOM_LIST_COUNT',
                     Message: await I18NManager.translate( strLanguage, 'Success get presence room list count.' ),
                     Mark: 'A3F304A84376' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: 1,
                     Data: [
                             {
                               Count: roomCount.length > 0 ? roomCount[ 0 ].Count: 0
                             }
                           ]
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

      sourcePosition.method = this.name + "." + this.presenceRoomCount.name;

      const strMark = "325B5BE115D3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async presence( request: Request,
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

      const strTimeZoneId = context.TimeZoneId;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const userSessionStatus = context.UserSessionStatus;

      const sysUserSessionPresence = await SYSUserSessionPresenceService.getByToken( userSessionStatus.Token,
                                                                                     null,
                                                                                     currentTransaction,
                                                                                     logger );

      if ( !sysUserSessionPresence ) {

        result = {
                   StatusCode: 404, //Not found
                   Code: 'ERROR_NO_PRESENCE_DATA_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The presence data not found for the current user session.' ),
                   Mark: 'A80DD97E9086' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_NO_PRESENCE_DATA_FOUND',
                               Message: await I18NManager.translate( strLanguage, 'The presence data not found for the current user session.' ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else if ( sysUserSessionPresence instanceof Error ) {

        const error = sysUserSessionPresence as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: 'ERROR_UNEXPECTED',
                   Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                   Mark: '0D9B7BEAB10F' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        const strSelectField = SystemUtilities.createSelectAliasFromModels(
                                                                            [
                                                                              SYSUserSessionPresenceInRoom,
                                                                              SYSUserSessionPresence,
                                                                              SYSUserSessionStatus,
                                                                              SYSUser,
                                                                              SYSUserGroup,
                                                                              SYSPerson,
                                                                              SYSUserSessionDevice
                                                                            ],
                                                                            [
                                                                              "A",
                                                                              "B",
                                                                              "C",
                                                                              "D",
                                                                              "E",
                                                                              "F",
                                                                              "G"
                                                                            ]
                                                                          );

        let strSQL = DBConnectionManager.getStatement( "master",
                                                       "getUserSessionPresenceList",
                                                       {
                                                         SelectFields: strSelectField,
                                                       },
                                                       logger );

        strSQL = request.query.where ? strSQL + "( " + request.query.where + " )" : strSQL + "( 1 )";

        strSQL = strSQL + " And ( A.RoomId = '" + ( request.query.roomId ? request.query.roomId: "@-Not_Exists_Id-@" ) + "' ) "; // And C.Token != '" + userSessionStatus.Token + "' ) ";

        /*
        const roomList = sysUserSessionPresence.Room.split( "," ).sort();

        for ( let intRoomIndex = 0; intRoomIndex < roomList.length; intRoomIndex++ ) {

          if ( intRoomIndex == 0 ) {

            strSQL = strSQL + ` A.Room Like '%${ roomList[ intRoomIndex ] }%'`;

          }
          else {

            strSQL = strSQL + ` Or A.Room Like '%${ roomList[ intRoomIndex ] }%'`;

          }

        }

        strSQL = strSQL + " ) ";
        */

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

        strSQL = strSQL + " LIMIT " + intLimit.toString() + " OFFSET " + ( request.query.offset && !isNaN( request.query.offset ) ? request.query.offset : "0" );

        //ANCHOR dbConnection.query
        const rows = await dbConnection.query(
                                               strSQL,
                                               {
                                                 raw: true,
                                                 type: QueryTypes.SELECT,
                                                 transaction: currentTransaction
                                               }
                                             );

        const transformedRows = SystemUtilities.transformRowValuesToSingleRootNestedObject(
                                                                                            rows,
                                                                                            [
                                                                                              SYSUserSessionPresenceInRoom,
                                                                                              SYSUserSessionPresence,
                                                                                              SYSUserSessionStatus,
                                                                                              SYSUser,
                                                                                              SYSUserGroup,
                                                                                              SYSPerson,
                                                                                              SYSUserSessionDevice
                                                                                            ],
                                                                                            [
                                                                                              "A",
                                                                                              "B",
                                                                                              "C",
                                                                                              "D",
                                                                                              "E",
                                                                                              "F",
                                                                                              "G"
                                                                                            ]
                                                                                          );

        const filteredRows = await PresenceManager.filterList( userSessionStatus,
                                                               transformedRows,
                                                               currentTransaction,
                                                               {},
                                                               logger );

        //const filteredRows = PresenceManager.filter();
        const convertedRows = [];

        for ( const currentRow of filteredRows ) {

          const strDeviceInfoParsed = currentRow.sysUserSessionDevice ? currentRow.sysUserSessionDevice.DeviceInfoParsed: "{}";

          const jsonDeviceInfoParsed = CommonUtilities.parseJSON( strDeviceInfoParsed,
                                                                  logger );

          const jsonPresenceInfo = {
                                     Id: currentRow.sysUser.Id,
                                     Name: currentRow.sysUser.Name,
                                     FirstName: currentRow.sysPerson ? currentRow.sysPerson.FirstName: null,
                                     LastName: currentRow.sysPerson ? currentRow.sysPerson.LastName: null,
                                     Device: jsonDeviceInfoParsed ? jsonDeviceInfoParsed: "",
                                     UpdatedAt: SystemUtilities.transformToTimeZone( currentRow.sysUserSessionStatus.UpdatedAt,
                                                                                     strTimeZoneId,
                                                                                     null,
                                                                                     logger ),
                                   };

          convertedRows.push( jsonPresenceInfo );
          /*
          const tempModelData = await SYSUserGroup.convertFieldValues(
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
          */

        }

        result = {
                   StatusCode: 200, //Ok
                   Code: 'SUCCESS_PRESENCE_LIST',
                   Message: await I18NManager.translate( strLanguage, 'Success get presence list.' ),
                   Mark: 'A3F304A84376' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: warnings,
                   Count: convertedRows.length,
                   Data: convertedRows
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

      sourcePosition.method = this.name + "." + this.presence.name;

      const strMark = "CE4BA31CB8FD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  /*
  static async presenceCount( request: Request,
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

      sourcePosition.method = this.name + "." + this.presenceCount.name;

      const strMark = "9F4A1B17D45B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
  */

}