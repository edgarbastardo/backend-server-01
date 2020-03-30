import cluster from 'cluster';

//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import {
  //Router,
  Request,
  //Response,
  //NextFunction
} from 'express';

//import bcrypt from 'bcrypt';
//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

//import SystemConstants from "../../common/SystemContants";

import CommonUtilities from "../../../common/CommonUtilities";
import SystemUtilities from "../../../common/SystemUtilities";

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
import DBConnectionManager from "../../../common/managers/DBConnectionManager";
//import SYSConfigValueDataService from "../../common/database/services/SYSConfigValueDataService";
//import SYSUserService from "../../common/database/services/SYSUserService";
import CommonConstants from "../../../common/CommonConstants";
//import SecurityServiceController from "./SecurityService.controller";
//import SYSUserGroupService from "../../../common/database/services/SYSUserGroupService";
//import NotificationManager from "../../common/managers/NotificationManager";
//import SYSUserSignupService from "../../common/database/services/SYSUserSignupService";
//import CipherManager from "../../common/managers/CipherManager";
//import SYSPersonService from "../../common/database/services/SYSPersonService";
import I18NManager from "../../../common/managers/I18Manager";
import SYSUserSessionDeviceService from '../../../common/database/services/SYSUserSessionDeviceService';
import SystemConstants from '../../../common/SystemContants';

import { SYSUserSessionDevice } from '../../../common/database/models/SYSUserSessionDevice';
//import SYSUserSessionStatusService from '../../../common/database/services/SYSUserSessionStatusService';
//import CacheManager from '../../../common/managers/CacheManager';
//import SYSActionTokenService from "../../common/database/services/SYSActionTokenService";
//import JobQueueManager from "../../common/managers/JobQueueManager";
//import SYSUserSessionStatusService from '../../common/database/services/SYSUserSessionStatusService';
//import GeoMapGoogle from "../../common/implementations/geomaps/GeoMapGoogle";
//import GeoMapManager from "../../common/managers/GeoMapManager";
//import { SYSUser } from "../../common/database/models/SYSUser";
//import { ModelToRestAPIServiceController } from './ModelToRestAPIService.controller';
//import { SYSPerson } from '../../common/database/models/SYSPerson';
//import { SYSUserGroup } from "../../common/database/models/SYSUserGroup";
//import dbConnection from "../../../common/managers/DBConnectionManager";
//import { error } from 'winston';
//import NotificationManager from "../../../common/managers/NotificationManager";


const debug = require( 'debug' )( 'UserDeviceServiceController' );

export default class UserDeviceServiceController {

  static readonly _ID = "UserDeviceServiceController";

  static async register( request: Request,
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

      let userSessionStatus = context.UserSessionStatus;

      let userSessionDeviceRules = {
                                     PushToken: [ 'present', 'string', 'min:10' ],
                                     Device: [ 'required', 'string', 'min:10' ],
                                   };

      let validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                 userSessionDeviceRules,
                                                                 null,
                                                                 logger );

      if ( validator.passes() ) { //Validate request.body field values

        const strUserName = context.UserSessionStatus.UserName;

        let sysUserSessionDeviceInDB = await SYSUserSessionDeviceService.getByToken( userSessionStatus.Token,
                                                                                     context.TimeZoneId,
                                                                                     currentTransaction,
                                                                                     logger );

        if ( sysUserSessionDeviceInDB instanceof Error ) {

          const error = sysUserSessionDeviceInDB as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: 'ERROR_UNEXPECTED',
                     Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                     Mark: 'ABA6B492E924' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

          let userSessionDeviceData = {} as any;

          if ( sysUserSessionDeviceInDB === null ) {

            const deviceInfoParsed =  SystemUtilities.getParseDeviceInfo( request.body.Device );

            userSessionDeviceData = {
                                      UserSessionStatusToken: userSessionStatus.Token,
                                      PushToken: request.body.PushToken ? request.body.PushToken: null,
                                      DeviceInfoRaw: request.body.Device,
                                      DeviceInfoParsed: CommonUtilities.jsonToString( deviceInfoParsed, logger ),
                                      CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      CreatedAt: null,
                                    };

          }
          else {

            const deviceInfoParsed =  SystemUtilities.getParseDeviceInfo( request.body.Device );

            userSessionDeviceData = ( sysUserSessionDeviceInDB as any ).dataValues;
            userSessionDeviceData.PushToken = request.body.PushToken ? request.body.PushToken: null;
            userSessionDeviceData.DeviceInfoRaw = request.body.Device;
            userSessionDeviceData.DeviceInfoParsed = CommonUtilities.jsonToString( deviceInfoParsed, logger );
            userSessionDeviceData.UpdateBy = strUserName || SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
            userSessionDeviceData.UpdateBy = null;

          }

          sysUserSessionDeviceInDB = await SYSUserSessionDeviceService.createOrUpdate(
                                                                                       userSessionDeviceData,
                                                                                       true,
                                                                                       currentTransaction,
                                                                                       logger
                                                                                     );

          if ( sysUserSessionDeviceInDB instanceof Error ) {

            const error = sysUserSessionDeviceInDB;

            result = {
                       StatusCode: 500, //Internal server error
                       Code: 'ERROR_UNEXPECTED',
                       Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                       Mark: 'ABA6B492E924' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
            let modelData = ( sysUserSessionDeviceInDB as any ).dataValues;

            const tempModelData = await SYSUserSessionDevice.convertFieldValues(
                                                                                 {
                                                                                   Data: modelData,
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

              modelData = tempModelData;

            }

            result = {
                       StatusCode: 200, //Ok
                       Code: 'SUCCESS_REGISTER_USER_SESSION_DEVICE',
                       Message: await I18NManager.translate( strLanguage, 'Success user session register the device' ),
                       Mark: 'FB1554689D98' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: false,
                       Errors: [],
                       Warnings: [],
                       Count: 1,
                       Data: [
                               modelData
                             ]
                     }

            bApplyTransaction = true;

          }

        }

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                   Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid' ),
                   Mark: '291F1CE8AC13' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      /*
      await NotificationManager.send( "redis",
                                      {
                                        Connection: "default",
                                        Topic: "TestTopic01",
                                        Message: "Test Message 01"
                                      },
                                      logger );

      await NotificationManager.send( "redis",
                                      {
                                        Connection: "default",
                                        Topic: "TestTopic02",
                                        Message: "Test Message 02"
                                      },
                                      logger );
      */


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

      sourcePosition.method = this.name + "." + this.register.name;

      const strMark = "3810B5CC3A9C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async delete( request: Request,
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

      let userSessionStatus = context.UserSessionStatus;

      let sysUserSessionDeviceInDB = await SYSUserSessionDeviceService.getByToken( userSessionStatus.Token,
                                                                                   context.TimeZoneId,
                                                                                   currentTransaction,
                                                                                   logger );

      if ( !sysUserSessionDeviceInDB ) {

        result = {
                   StatusCode: 404, //Not found
                   Code: 'ERROR_USER_SESSION_DEVICE_NOT_FOUND',
                   Message: I18NManager.translate( strLanguage, 'The user session device not found' ),
                   Mark: '5DE544182042' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_SESSION_DEVICE_NOT_FOUND',
                               Message: I18NManager.translate( strLanguage, 'The user session device not found' ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( sysUserSessionDeviceInDB instanceof Error ) {

        const error = sysUserSessionDeviceInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: 'ERROR_UNEXPECTED',
                   Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                   Mark: 'DDEB6E862560' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        const deleteResult = await SYSUserSessionDeviceService.deleteByModel(
                                                                              sysUserSessionDeviceInDB,
                                                                              currentTransaction,
                                                                              logger
                                                                            );

        if ( deleteResult instanceof Error ) {

          const error = deleteResult as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: 'ERROR_UNEXPECTED',
                     Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                     Mark: '582B8CBEC6EF' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
        else if ( deleteResult === true ) {

          result = {
                     StatusCode: 200, //Ok
                     Code: 'SUCCESS_DELETE_USER_SESSION_DEVICE',
                     Message: await I18NManager.translate( strLanguage, 'Success user session device deleted.' ),
                     Mark: '86029E2AF0C2' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     StatusCode: 500, //Ok
                     Code: 'ERROR_DELETE_USER_SESSION_DEVICE',
                     Message: await I18NManager.translate( strLanguage, 'Error in user session device delete.' ),
                     Mark: '75B021C3A78A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [
                               {
                                 Code: 'ERROR_METHOD_DELETE_RETURN_FALSE',
                                 Message: 'Method deleteByModel return false',
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
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

      sourcePosition.method = this.name + "." + this.delete.name;

      const strMark = "8CB8BCC01F95" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
