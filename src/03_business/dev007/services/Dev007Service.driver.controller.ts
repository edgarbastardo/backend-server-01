import cluster from "cluster";

import {
  Request,
  Response
} from "express";

import CommonConstants from "../../../02_system/common/CommonConstants";

import SystemUtilities from "../../../02_system/common/SystemUtilities";
import CommonUtilities from "../../../02_system/common/CommonUtilities";

import DBConnectionManager from "../../../02_system/common/managers/DBConnectionManager";
import BaseService from "../../../02_system/common/database/master/services/BaseService";
import I18NManager from "../../../02_system/common/managers/I18Manager";
import BIZDriverStatusService from "../../common/database/master/services/BIZDriverStatusService";

import { BIZDriverStatus } from "../../common/database/master/models/BIZDriverStatus";
import { SYSUser } from "../../../02_system/common/database/master/models/SYSUser";
import BIZDriverPositionService from "../../common/database/master/services/BIZDriverPositionService";
import InstantMessageServerManager from "../../../02_system/common/managers/InstantMessageServerManager";
import CacheManager from "../../../02_system/common/managers/CacheManager";

const debug = require( "debug" )( "Dev007DriverServicesController" );

export default class Dev007DriverServicesController extends BaseService {

  //Common business services

  static async setStatus( request: Request,
                          response: Response,
                          transaction: any,
                          logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by MiddlewareManager.middlewareSetContext function

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let userSessionStatus = context.UserSessionStatus;

      let bizDriverStatusInDB = await BIZDriverStatusService.createOrUpdate(
                                                                             {

                                                                               UserId: userSessionStatus.UserId,
                                                                               AtDate: SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_10 ),
                                                                               Status: request.body.Status, //1 = Working, 0 = Not working
                                                                               Description: request.body.Description,
                                                                               CreatedBy: userSessionStatus.UserName,
                                                                               UpdatedBy: userSessionStatus.UserName,

                                                                             },
                                                                             true,
                                                                             currentTransaction,
                                                                             logger
                                                                           );

      if ( bizDriverStatusInDB &&
           bizDriverStatusInDB instanceof Error === false ) {

        let modelData = ( bizDriverStatusInDB as any ).dataValues;

        const tempModelData = await BIZDriverStatus.convertFieldValues(
                                                                        {
                                                                          Data: modelData,
                                                                          FilterFields: 1, //Force to remove fields like password and value
                                                                          TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                          Include: null, //[ { model: SYSUser } ],
                                                                          Exclude: [ { model: SYSUser } ],
                                                                          Logger: logger,
                                                                          ExtraInfo: {
                                                                                        Request: request,
                                                                                        FilterFields: 1
                                                                                     }
                                                                        }
                                                                      );

        if ( tempModelData ) {

          modelData = tempModelData;

        }

        //ANCHOR success user update
        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_DRIVER_STATUS_CHANGED",
                   Message: await I18NManager.translate( strLanguage, "Success driver status changed." ),
                   Mark: "DF04A92ABA0D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
      else {

        const error = bizDriverStatusInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "B7175642027E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.setStatus.name;

      const strMark = "59BE59B1DE0F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.LogId,
                 Mark: "8A8748A321B4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

  static async getStatus( request: Request,
                          response: Response,
                          transaction: any,
                          logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by MiddlewareManager.middlewareSetContext function

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let userSessionStatus = context.UserSessionStatus;

      let bizDriverStatusInDB = await BIZDriverStatusService.getByUserId(
                                                                          userSessionStatus.UserId,
                                                                          SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_10 ),
                                                                          currentTransaction,
                                                                          logger
                                                                        );

      if ( !bizDriverStatusInDB ) { //If not status found in db create default with 0 = Not working

        bizDriverStatusInDB = await BIZDriverStatusService.createOrUpdate(
                                                                           {

                                                                             UserId: userSessionStatus.UserId,
                                                                             AtDate: SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_10 ),
                                                                             Status: 0, //1 = Working, 0 = Not working
                                                                             Description: "Not working",
                                                                             CreatedBy: userSessionStatus.UserName,
                                                                             UpdatedBy: userSessionStatus.UserName,

                                                                           },
                                                                           true,
                                                                           currentTransaction,
                                                                           logger
                                                                         );

      }

      if ( bizDriverStatusInDB &&
           bizDriverStatusInDB instanceof Error === false ) {

        let modelData = ( bizDriverStatusInDB as any ).dataValues;

        const tempModelData = await BIZDriverStatus.convertFieldValues(
                                                                        {
                                                                          Data: modelData,
                                                                          FilterFields: 1, //Force to remove fields like password and value
                                                                          TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                          Include: null, //[ { model: SYSUser } ],
                                                                          Exclude: [ { model: SYSUser } ],
                                                                          Logger: logger,
                                                                          ExtraInfo: {
                                                                                        Request: request,
                                                                                        FilterFields: 1
                                                                                     }
                                                                        }
                                                                      );

        if ( tempModelData ) {

          modelData = tempModelData;

        }

        //ANCHOR success user update
        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_GET_DRIVER_STATUS",
                   Message: await I18NManager.translate( strLanguage, "Success get driver status." ),
                   Mark: "43E7ED8C9CD2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
      else {

        const error = bizDriverStatusInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "F5A795D3BD76" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.getStatus.name;

      const strMark = "A6C6F6EA7618" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.LogId,
                 Mark: "D90BA45EF1C5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

  static async setPosition( request: Request,
                            response: Response,
                            transaction: any,
                            logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by MiddlewareManager.middlewareSetContext function

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let validationRules = {
                              "bulk.*.Id": [ "present", "string" ],
                              "bulk.*.Accuracy": [ "required", "numeric" ],
                              "bulk.*.Latitude": [ "required", "numeric" ],
                              "bulk.*.Longitude": [ "required", "numeric" ],
                              "bulk.*.Altitude": [ "required", "numeric" ],
                              "bulk.*.Speed": [ "required", "numeric" ],
                              "bulk.*.CreatedAt": [ "present", "string" ],
                            };

      let validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                 validationRules,
                                                                 null,
                                                                 logger );

      if ( validator.passes() ) { //Validate request.body field values

        let userSessionStatus = context.UserSessionStatus;

        const bulkResult = await BIZDriverPositionService.bulkCreate(
                                                                      request.body.bulk,
                                                                      userSessionStatus.ShortToken,
                                                                      userSessionStatus.UserId,
                                                                      userSessionStatus.UserName,
                                                                      strLanguage,
                                                                      currentTransaction,
                                                                      logger
                                                                    );

        let intStatusCode = -1;
        let strCode = "";
        let strMessage = "";
        let bIsError = false;

        if ( bulkResult.errors.length === 0 ) {

          intStatusCode = 200
          strCode = "SUCCESS_SET_DRIVER_POSITION";
          strMessage = await I18NManager.translate( strLanguage, "Success set driver position" );

          bApplyTransaction = true;

        }
        else {

          intStatusCode = 400
          strCode = "ERROR_SET_DRIVER_POSITION";
          strMessage = await I18NManager.translate( strLanguage, "Cannot set the driver position" );
          bIsError = true;

        }

        result = {
                   StatusCode: intStatusCode,
                   Code: strCode,
                   Message: strMessage,
                   Mark: "259CAC71028D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: bIsError,
                   Errors: bulkResult.errors,
                   Warnings: [],
                   Count: request.body.bulk.length - bulkResult.errors.length,
                   Data: bulkResult.data
                 };

        if ( InstantMessageServerManager.currentIMInstance?.connected ) {

          let lockUpdate = CacheManager.getData( "Driver_Position_Last_Update", logger ); //Auto deleted every 5 seconds

          if ( !lockUpdate ) {

            let lockedResource = null;

            try {

              //We need write the shared resource and going to block temporally the write access, and prevent from extend the TTL of the entry
              lockedResource = await CacheManager.lockResource( undefined, //Default = CacheManager.currentInstance,
                                                                "Driver_Position:2FF24364A156@lock",
                                                                5 * 1000, //3 seconds
                                                                1, //Only one try
                                                                1000, //1 Seconds
                                                                logger );

              if ( CommonUtilities.isNotNullOrEmpty( lockedResource ) ) { //Stay sure we had the resource locked

                await CacheManager.setDataWithTTL( "Driver_Position_Last_Update",
                                                   SystemUtilities.getCurrentDateAndTime().format(),
                                                   5, //5 seconds
                                                   logger ); //Every 5 seconds is deleted from redis

                InstantMessageServerManager.currentIMInstance?.emit(
                                                                     {
                                                                       Auth: InstantMessageServerManager.strAuthToken,
                                                                       Channels: "Drivers_Position",
                                                                       Message: {
                                                                                  Kind:  "GPS_POSITION_CHANGED",
                                                                                  Topic: "message",
                                                                                  Data: {
                                                                                          ShortToken: userSessionStatus.ShortToken,
                                                                                          Accuracy: request.body.bulk[ 0 ].Accuracy,
                                                                                          Latitude: request.body.bulk[ 0 ].Latitude,
                                                                                          Longitude: request.body.bulk[ 0 ].Longitude,
                                                                                          Altitude: request.body.bulk[ 0 ].Altitude,
                                                                                          Speed: request.body.bulk[ 0 ].Speed,
                                                                                        }
                                                                                }
                                                                     }
                                                                   );

              }

            }
            catch ( error ) {

              const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

              sourcePosition.method = this.name + "." + this.setPosition.name;

              const strMark = "6A9548CA9F36" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

            //Release the write access for another process. VERY IMPORTANT!!!
            if ( CommonUtilities.isNotNullOrEmpty( lockedResource ) ) {

              await CacheManager.unlockResource( lockedResource,
                                                logger );

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
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                   Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                   Mark: "F755FE079D55" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                               Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                               Details: validator.errors.all()
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

      sourcePosition.method = this.name + "." + this.setPosition.name;

      const strMark = "18E4A8B23AC6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.LogId,
                 Mark: "E12BF6DB6F34" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

  static async getPosition( request: Request,
                            response: Response,
                            transaction: any,
                            logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by MiddlewareManager.middlewareSetContext function

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let userSessionStatus = context.UserSessionStatus;

      let validationRules = {
                              session: [ "present", "string" ],
                              start: [ "present", "date" ],
                              end: [ "present", "date" ],
                              limit: [ "present", "integer", "min:1", "max:25" ],
                            };

      let validator = SystemUtilities.createCustomValidatorSync( request.query,
                                                                 validationRules,
                                                                 null,
                                                                 logger );

      if ( validator.passes() ) { //Validate request.query field values

        let lastDriverPositionList = [];

        if ( !request.query.session ||
             ( request.query.session as string ).toLowerCase() === "current" ) {

          lastDriverPositionList = await BIZDriverPositionService.getLastPositionByShortToken(
                                                                                               userSessionStatus.ShortToken,
                                                                                               request.query.start as string,
                                                                                               request.query.end as string,
                                                                                               parseInt( request.query.limit as string ),
                                                                                               0, //0 = Full (All field from table)
                                                                                               currentTransaction,
                                                                                               logger
                                                                                             );

        }
        else {

          lastDriverPositionList = await BIZDriverPositionService.getLastPositionByUserId(
                                                                                           userSessionStatus.UserId,
                                                                                           request.query.start as string,
                                                                                           request.query.end as string,
                                                                                           parseInt( request.query.limit as string ),
                                                                                           currentTransaction,
                                                                                           logger
                                                                                         );

        }

        if ( lastDriverPositionList &&
             lastDriverPositionList instanceof Error === false ) {

          result = {
                     StatusCode: 200, //Ok
                     Code: "SUCCESS_GET_DRIVER_POSITION",
                     Message: await I18NManager.translate( strLanguage, "Success get driver position." ),
                     Mark: "02A84EEC9C0A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: lastDriverPositionList.length,
                     Data: lastDriverPositionList
                   };

          bApplyTransaction = true;

        }
        else {

          const error = lastDriverPositionList as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "2DC29DF23598" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                   Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                   Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                   Mark: "F755FE079D55" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                               Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                               Details: validator.errors.all()
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getPosition.name;

      const strMark = "344AC034143A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.LogId,
                 Mark: "78CA84E654B1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
