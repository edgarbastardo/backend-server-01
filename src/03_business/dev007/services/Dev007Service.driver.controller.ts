import cluster from "cluster";

import {
  Request,
  Response
} from "express";

import CommonConstants from "../../../02_system/common/CommonConstants";

import SystemUtilities from "../../../02_system/common/SystemUtilities";
import CommonUtilities from "../../../02_system/common/CommonUtilities";

import DBConnectionManager from "../../../02_system/common/managers/DBConnectionManager";
import InstantMessageServerManager from "../../../02_system/common/managers/InstantMessageServerManager";
import CacheManager from "../../../02_system/common/managers/CacheManager";
import I18NManager from "../../../02_system/common/managers/I18Manager";

import BaseService from "../../../02_system/common/database/master/services/BaseService";

import BIZDriverStatusService from "../../common/database/master/services/BIZDriverStatusService";
import BIZDriverPositionService from "../../common/database/master/services/BIZDriverPositionService";
import BIZDriverInDeliveryZoneService from "../../common/database/master/services/BIZDriverInDeliveryZoneService";

import { SYSUser } from "../../../02_system/common/database/master/models/SYSUser";

import { BIZDriverStatus } from "../../common/database/master/models/BIZDriverStatus";
import { BIZDriverInDeliveryZone } from "../../common/database/master/models/BIZDriverInDeliveryZone";
import { BIZDeliveryZone } from "../../common/database/master/models/BIZDeliveryZone";

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
                                                                               ShortToken: userSessionStatus.ShortToken,
                                                                               Code: request.body.Code, //1111 = Working, 1100 = Working (Finishing), 0 = Not working
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

        const warnings = [];

        if ( request.body.Status === 0 ) { //Not wokring

          let bizDriverInDeliveryZoneInDB = await BIZDriverInDeliveryZoneService.getCurrentDeliveryZoneOfDriverAtDate( userSessionStatus.UserId,
                                                                                                                       null, //By default use the current date in the server
                                                                                                                       currentTransaction,
                                                                                                                       logger );

          if ( bizDriverInDeliveryZoneInDB instanceof Error === true ) {

            const error = bizDriverInDeliveryZoneInDB as any;

            warnings.push(
                           {
                             Code: "WARNING_CANNOT_GET_DELIVERY_ZONE",
                             Message: "Warning to get the current delivery zone from driver",
                             Details: {
                                        Code: error.name,
                                        Message: error.message,
                                        Details: await SystemUtilities.processErrorDetails( error ) //error
                                      }
                           }
                         );

          }
          else if ( bizDriverInDeliveryZoneInDB ) {

            bizDriverInDeliveryZoneInDB.EndAt = SystemUtilities.getCurrentDateAndTime().format(), //Close the entry with the current hour
            bizDriverInDeliveryZoneInDB.ShortToken = userSessionStatus.ShortToken;

            bizDriverInDeliveryZoneInDB = await BIZDriverInDeliveryZoneService.createOrUpdate(
                                                                                               ( bizDriverInDeliveryZoneInDB as any ).dataValues,
                                                                                               true,
                                                                                               currentTransaction,
                                                                                               logger
                                                                                             );

            if ( bizDriverInDeliveryZoneInDB instanceof Error === true ) {

              const error = bizDriverInDeliveryZoneInDB as any;

              warnings.push(
                             {
                               Code: "WARNING_CANNOT_CLOSE_DELIVERY_ZONE",
                               Message: "Warning to close the current delivery zone from driver",
                               Details: {
                                          Code: error.name,
                                          Message: error.message,
                                          Details: await SystemUtilities.processErrorDetails( error ) //error
                                        }
                             }
                           );

            }

          }
          else {

            warnings.push(
                           {
                             Code: "WARNING_NO_DELIVERY_ZONE_SET",
                             Message: "Warning no delivery zone set for this driver",
                             Details: "bizDriverInDeliveryZoneInDB === null"
                           }
                         );

          }

        }

        let modelData = ( bizDriverStatusInDB as any ).dataValues;

        const tempModelData = await BIZDriverStatus.convertFieldValues(
                                                                        {
                                                                          Data: modelData,
                                                                          FilterFields: 1, //Force to remove fields like password and value
                                                                          TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                          Include: null, //[ { model: SYSUser } ],
                                                                          Exclude: [
                                                                                     {
                                                                                       model: SYSUser
                                                                                     }
                                                                                   ],
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

        if ( InstantMessageServerManager.currentIMInstance?.connected ) {

          InstantMessageServerManager.currentIMInstance?.emit(
                                                               "Command:SendMessage",
                                                               {
                                                                 Auth: InstantMessageServerManager.strAuthToken,
                                                                 Channels: "Dispatchers",
                                                                 Message: {
                                                                            Kind:  "DRIVER_STATUS_CHANGED",
                                                                            Topic: "message",
                                                                            Data: {
                                                                                    SupportToken: userSessionStatus.ShortToken,
                                                                                    UserId: userSessionStatus.UserId,
                                                                                    DeliveryZoneId: request.body.DeliveryZoneId,
                                                                                    By: userSessionStatus.UserName
                                                                                  }
                                                                          }
                                                               }
                                                             );

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
                   Warnings: warnings,
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
                 Mark: strMark,
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
                                                                             Code: 0, //1111 = Working, 1100 = Working (Finishing), 0 = Not working
                                                                             Description: "Not working",
                                                                             ShortToken: userSessionStatus.ShortToken,
                                                                             CreatedBy: userSessionStatus.UserName,
                                                                             UpdatedBy: userSessionStatus.UserName,

                                                                           },
                                                                           true,
                                                                           currentTransaction,
                                                                           logger
                                                                         );

      }
      else if ( bizDriverStatusInDB.ShortToken !== userSessionStatus.ShortToken ) {

        bizDriverStatusInDB.ShortToken = userSessionStatus.ShortToken; //Force to update the current session short token
        bizDriverStatusInDB.UpdatedBy = userSessionStatus.UserName,

        bizDriverStatusInDB = await BIZDriverStatusService.createOrUpdate(
                                                                           ( bizDriverStatusInDB as any ).dataValues,
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
                 Mark: strMark,
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
                              "bulk.*.Code": [ "present", "numeric" ],
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

          let lockUpdate = await CacheManager.getData( "Driver_Position_Last_Update", logger ); //Auto deleted every 5 seconds

          if ( !lockUpdate ) {

            let lockedResource = null;

            try {

              //We need write the shared resource and going to block temporally the write access, and prevent from extend the TTL of the entry
              lockedResource = await CacheManager.lockResource( undefined, //Default = CacheManager.currentInstance,
                                                                "Driver_Position:2FF24364A156@lock",
                                                                2 * 1000, //2 seconds
                                                                1, //Only one try
                                                                1000, //1 Seconds
                                                                logger );

              if ( CommonUtilities.isNotNullOrEmpty( lockedResource ) ) { //Stay sure we had the resource locked

                await CacheManager.setDataWithTTL( "Driver_Position_Last_Update",
                                                   SystemUtilities.getCurrentDateAndTime().format(),
                                                   2, //2 seconds
                                                   logger ); //Every 2 seconds is deleted from redis

                InstantMessageServerManager.currentIMInstance?.emit(
                                                                     "Command:SendMessage",
                                                                     {
                                                                       Auth: InstantMessageServerManager.strAuthToken,
                                                                       Channels: "Drivers_Position",
                                                                       Message: {
                                                                                  Kind:  "GPS_POSITION_CHANGED",
                                                                                  Topic: "message",
                                                                                  Data: {
                                                                                          SupportToken: userSessionStatus.ShortToken,
                                                                                          UserId: userSessionStatus.UserId,
                                                                                          Accuracy: request.body.bulk[ 0 ].Accuracy,
                                                                                          Latitude: request.body.bulk[ 0 ].Latitude,
                                                                                          Longitude: request.body.bulk[ 0 ].Longitude,
                                                                                          Altitude: request.body.bulk[ 0 ].Altitude,
                                                                                          Speed: request.body.bulk[ 0 ].Speed,
                                                                                          By: userSessionStatus.UserName
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
                 Mark: strMark,
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
                 Mark: strMark,
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

  static async setDeliveryZone( request: Request,
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

      if ( bizDriverStatusInDB &&
           bizDriverStatusInDB.Code === 1111 ) { //Only working can set yout delivery zone

        let bizDriverInDeliveryZoneInDB = await BIZDriverInDeliveryZoneService.getCurrentDeliveryZoneOfDriverAtDate( userSessionStatus.UserId,
                                                                                                                     null, //By default use the current date in the server
                                                                                                                     currentTransaction,
                                                                                                                     logger );

        if ( bizDriverInDeliveryZoneInDB &&
             bizDriverInDeliveryZoneInDB instanceof Error === false &&
             bizDriverInDeliveryZoneInDB.EndAt ) {

          bizDriverInDeliveryZoneInDB = null; //This is a closed delivery zone must be ignored and created new one

        }

        //let bizDriverInDeliveryZoneInDB = await BIZDriverInDeliveryZoneService.getDeliveryZone( userSessionStatus.UserId,
        //                                                                                        null, //By default use the current date in the server
        //                                                                                        currentTransaction,
        //                                                                                        logger );

        const bIsAdmin = userSessionStatus?.Role?.includes( "#Administrator#" ) ||
                         userSessionStatus?.Role?.includes( "#BManager_L99#" ) ||
                         userSessionStatus?.Role?.includes( "#Business_Manager#" );

        if ( bizDriverInDeliveryZoneInDB instanceof Error ) {

          const error = bizDriverInDeliveryZoneInDB as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "C6F92ABD8EE9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
        else if ( bizDriverInDeliveryZoneInDB &&
                  bizDriverInDeliveryZoneInDB.Tag &&
                  bIsAdmin === false &&
                  userSessionStatus?.Role?.includes( bizDriverInDeliveryZoneInDB.Tag ) === false ) {

          result = {
                     StatusCode: 403, //Forbidden
                     Code: "ERROR_DRIVER_NOT_ALLOWED",
                     Message: await I18NManager.translate( strLanguage, "The driver not allowed to set/change the delivery zone." ),
                     Mark: "233A7F9D16A8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        };

        if ( result === null ) {

          let bAddNewEntry = true;

          if ( bizDriverInDeliveryZoneInDB !== null ) {

            if ( bizDriverInDeliveryZoneInDB.DeliveryZoneId === request.body.DeliveryZoneId ) {

              bAddNewEntry = false; //No need to create new entry in the database. Keep the old one

            }
            else {

              //Update and close the before entry put data in EndAt field
              bizDriverInDeliveryZoneInDB = await BIZDriverInDeliveryZoneService.createOrUpdate(
                                                                                                 {

                                                                                                   UserId: bizDriverInDeliveryZoneInDB.UserId,
                                                                                                   DeliveryZoneId: bizDriverInDeliveryZoneInDB.DeliveryZoneId,
                                                                                                   StartAt: bizDriverInDeliveryZoneInDB.StartAt,
                                                                                                   EndAt: SystemUtilities.getCurrentDateAndTime().format(), //Close the entry with the current hour
                                                                                                   ShortToken: bizDriverInDeliveryZoneInDB.ShortToken,
                                                                                                   LockTag: "#Driver#",
                                                                                                   UpdatedBy: userSessionStatus.UserName,

                                                                                                 },
                                                                                                 true,
                                                                                                 currentTransaction,
                                                                                                 logger
                                                                                               );

              if ( !bizDriverInDeliveryZoneInDB ||
                  bizDriverInDeliveryZoneInDB instanceof Error ) { //Error the try to close the old entry

                bAddNewEntry = false; //Not add the new entry in the database

              }

            }

          }

          if ( bAddNewEntry ) {

            //Create the new entry in the database
            bizDriverInDeliveryZoneInDB = await BIZDriverInDeliveryZoneService.createOrUpdate(
                                                                                               {

                                                                                                 UserId: userSessionStatus.UserId,
                                                                                                 DeliveryZoneId: request.body.DeliveryZoneId,
                                                                                                 StartAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                                                                 EndAt: null, //Not closed entry
                                                                                                 ShortToken: userSessionStatus.ShortToken,
                                                                                                 LockTag: "#Driver#",
                                                                                                 CreatedBy: userSessionStatus.UserName,

                                                                                               },
                                                                                               false,
                                                                                               currentTransaction,
                                                                                               logger
                                                                                             );

          }

          if ( bizDriverInDeliveryZoneInDB &&
              bizDriverInDeliveryZoneInDB instanceof Error === false ) {

            let modelData = ( bizDriverInDeliveryZoneInDB as any ).dataValues;

            const tempModelData = await BIZDriverInDeliveryZone.convertFieldValues(
                                                                                    {
                                                                                      Data: modelData,
                                                                                      IncludeFields: [
                                                                                                       "Id",
                                                                                                       "Name",
                                                                                                     ],
                                                                                      TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                                      Include: [
                                                                                                 {
                                                                                                   model: SYSUser
                                                                                                 },
                                                                                                 {
                                                                                                   model: BIZDeliveryZone
                                                                                                 }
                                                                                               ],
                                                                                      Exclude: null, //[ { model: SYSUser } ],
                                                                                      Logger: logger,
                                                                                      ExtraInfo: {
                                                                                                   Request: request,
                                                                                                 }
                                                                                    }
                                                                                  );

            if ( tempModelData ) {

              modelData = tempModelData;

            }

            if ( InstantMessageServerManager.currentIMInstance?.connected ) {

              InstantMessageServerManager.currentIMInstance?.emit(
                                                                   "Command:SendMessage",
                                                                   {
                                                                     Auth: InstantMessageServerManager.strAuthToken,
                                                                     Channels: "Dispatchers",
                                                                     Message: {
                                                                                Kind:  "DRIVER_DELIVERY_ZONE_CHANGED",
                                                                                Topic: "message",
                                                                                Data: {
                                                                                        SupportToken: userSessionStatus.ShortToken,
                                                                                        UserId: userSessionStatus.UserId,
                                                                                        DeliveryZoneId: request.body.DeliveryZoneId,
                                                                                        By: userSessionStatus.UserName
                                                                                      }
                                                                              }
                                                                   }
                                                                 );

            }

            result = {
                       StatusCode: 200, //Ok
                       Code: "SUCCESS_DRIVER_DELIVERY_ZONE_SET",
                       Message: await I18NManager.translate( strLanguage, "Success driver delivery zone set." ),
                       Mark: "D2F8D4512DF9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

            const error = bizDriverInDeliveryZoneInDB as any;

            result = {
                       StatusCode: 500, //Internal server error
                       Code: "ERROR_UNEXPECTED",
                       Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                       Mark: "E720AE75720E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        }

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_CURRENT_DRIVER_STATUS_MUST_BE_WORKING",
                   Message: await I18NManager.translate( strLanguage, "The current driver status must be working = 1111" ),
                   Mark: "B6FCFED8E996" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [],
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

      sourcePosition.method = this.name + "." + this.setDeliveryZone.name;

      const strMark = "625CCCC1FBB7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 Mark: strMark,
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

  static async getDeliveryZone( request: Request,
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

      let bizDriverInDeliveryZoneInDB = await BIZDriverInDeliveryZoneService.getCurrentDeliveryZoneOfDriverAtDate( userSessionStatus.UserId,
                                                                                                                   null, //By default use the current date in the server
                                                                                                                   currentTransaction,
                                                                                                                   logger );

      if ( bizDriverInDeliveryZoneInDB &&
           bizDriverInDeliveryZoneInDB instanceof Error === false &&
           bizDriverInDeliveryZoneInDB.EndAt &&
           ( !request.body.Last ||
             request.body.Last === 0 ) ) {

        bizDriverInDeliveryZoneInDB = null; //This is a closed delivery zone must be ignored and created new one

      }

      //let bizDriverInDeliveryZoneInDB = await BIZDriverInDeliveryZoneService.getDeliveryZone( userSessionStatus.UserId,
      //                                                                                        null, //By default the current date in the server
      //                                                                                        currentTransaction,
      //                                                                                        logger );

      if ( bizDriverInDeliveryZoneInDB instanceof Error ) {

        const error = bizDriverInDeliveryZoneInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "93120CCD85CC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
      else if ( !bizDriverInDeliveryZoneInDB ) {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_DRIVER_DELIVERY_ZONE_NOT_SET",
                   Message: await I18NManager.translate( strLanguage, "The driver delivery zone not set." ),
                   Mark: "A724A27AA4F4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else {

        if ( userSessionStatus.ShortToken !== bizDriverInDeliveryZoneInDB.ShortToken ) {

          await BIZDriverInDeliveryZoneService.createOrUpdate(
                                                               {

                                                                 UserId: bizDriverInDeliveryZoneInDB.UserId,
                                                                 DeliveryZoneId: bizDriverInDeliveryZoneInDB.DeliveryZoneId,
                                                                 StartAt: bizDriverInDeliveryZoneInDB.StartAt,
                                                                 ShortToken: userSessionStatus.ShortToken, //Force Update with right short token to database
                                                                 UpdatedBy: userSessionStatus.UserName,

                                                               },
                                                               true,
                                                               currentTransaction,
                                                               logger
                                                             );

          bizDriverInDeliveryZoneInDB.ShortToken = userSessionStatus.ShortToken; //Update the short token

        }

        let modelData = ( bizDriverInDeliveryZoneInDB as any ).dataValues;

        const tempModelData = await BIZDriverInDeliveryZone.convertFieldValues(
                                                                                {
                                                                                  Data: modelData,
                                                                                  IncludeFields: [
                                                                                                   "Id",
                                                                                                   "Name",
                                                                                                 ],
                                                                                  TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                                  Include: [
                                                                                             {
                                                                                               model: SYSUser
                                                                                             },
                                                                                             {
                                                                                               model: BIZDeliveryZone
                                                                                             }
                                                                                           ],
                                                                                  Exclude: null, //[ { model: SYSUser } ],
                                                                                  Logger: logger,
                                                                                  ExtraInfo: {
                                                                                               Request: request,
                                                                                             }
                                                                                }
                                                                              );

          if ( tempModelData ) {

            modelData = tempModelData;

          }

          //ANCHOR success user update
          result = {
                     StatusCode: 200, //Ok
                     Code: "SUCCESS_GET_DRIVER_DELIVERY_ZONE",
                     Message: await I18NManager.translate( strLanguage, "Success get the driver delivery zone." ),
                     Mark: "635C2229C003" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.getDeliveryZone.name;

      const strMark = "0BE03CB21E95" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 Mark: strMark,
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
