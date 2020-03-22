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

/*
import NotificationManager from '../../../common/managers/NotificationManager';
import SYSUserSessionDeviceService from '../../../common/database/services/SYSUserSessionDeviceService';
import { SYSUserSessionDevice } from "../../../common/database/models/SYSUserSessionDevice";
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

      if ( CommonUtilities.isNullOrEmpty( userSessionStatus.BinaryDataToken ) ||
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

        strSocketToken = userSessionStatus.BinaryDataToken;

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

        const strSocketToken = userSessionStatus.SocketToken;

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

        NotificationManager.publishOnTopic( "InstantMessage",
                                            {
                                              Name: "Disconnect",
                                              Token: userSessionStatus.Token,
                                              SocketToken: strSocketToken
                                            },
                                            logger );

        result = {
                   StatusCode: 200, //Ok
                   Code: 'SUCCESS_AUTH_TOKEN_DELETED',
                   Message: await I18NManager.translate( strLanguage, 'The instant message authorization token has been success deleted.' ),
                   Mark: 'DE4E39A7EE92' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
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