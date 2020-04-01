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
import NotificationManager from '../../../common/managers/NotificationManager';
import SYSUserSessionDeviceService from '../../../common/database/master/services/SYSUserSessionDeviceService';
import { SYSUserSessionDevice } from "../../../common/database/master/models/SYSUserSessionDevice";

const debug = require( 'debug' )( 'UserPushServiceController' );

export default class UserPushServiceController {

  static readonly _ID = "UserPushServiceController";

  static async pushMessageTest( request: Request,
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

      const strPushProvider = await NotificationManager.getConfigServiceType( "push",
                                                                              logger );

      if ( strPushProvider === "one_signal" ) {

        const sysUserSessionDevice =  await SYSUserSessionDeviceService.getByToken( userSessionStatus.Token,
                                                                                    null,
                                                                                    currentTransaction,
                                                                                    logger );

        if ( sysUserSessionDevice instanceof Error ) {

          const error = sysUserSessionDevice as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: 'ERROR_UNEXPECTED',
                     Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                     Mark: '02C1D1A9AD35' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
        else if ( !sysUserSessionDevice ||
                  !sysUserSessionDevice.PushToken ) {

          result = {
                     StatusCode: 404, //Not found
                     Code: 'ERROR_USER_SESSION_PUSH_TOKEN_NOT_FOUND',
                     Message: await I18NManager.translate( strLanguage, 'User session push token not found' ),
                     Mark: 'B0C41F4E5AA9' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_SESSION_PUSH_TOKEN_NOT_FOUND',
                                 Message: await I18NManager.translate( strLanguage, 'User session push token not found' ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else {

          if ( await NotificationManager.send(
                                               "push",
                                               {
                                                 headings: {
                                                             'en': 'Notification Test Title',
                                                             'es': 'Notificación de Prueba Título',
                                                           },
                                                 contents: {
                                                             'en': 'Notification Text Body',
                                                             'es': 'Notificación de Prueba Cuerpo',
                                                           },
                                                 include_player_ids: [ sysUserSessionDevice.PushToken ],
                                                 // included_segments: [ "Subscribed Users", "Active Users" ],
                                                 data: { Test: 1 },
                                                 // filters: [
                                                 //   { field: 'tag', key: 'level', relation: '>', value: 10 }
                                                 // ]
                                               },
                                               logger
                                             ) ) {

            result = {
                       StatusCode: 200, //Ok
                       Code: 'SUCCESS_SEND_PUSH_TEST_MESSAGE',
                       Message: await I18NManager.translate( strLanguage, 'Success send push test message' ),
                       Mark: 'D80DDA2A6958' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                       StatusCode: 500, //Internal server error
                       Code: 'ERROR_CANNOT_SEND_PUSH_TEST_MESSAGE',
                       Message: await I18NManager.translate( strLanguage, 'Error cannot send the test push message' ),
                       Mark: 'E8058394DA08' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_CANNOT_SEND_PUSH_TEST_MESSAGE',
                                   Message: await I18NManager.translate( strLanguage, 'Error cannot send the test push message' ),
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

      sourcePosition.method = this.name + "." + this.pushMessageTest.name;

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

}