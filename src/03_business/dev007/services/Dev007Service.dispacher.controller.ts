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
import InstantMessageServerManager from "../../../02_system/common/managers/InstantMessageServerManager";

import BIZDriverPositionService from "../../common/database/master/services/BIZDriverPositionService";
import BIZDriverInDeliveryZoneService from "../../common/database/master/services/BIZDriverInDeliveryZoneService";
import BIZDriverStatusService from "../../common/database/master/services/BIZDriverStatusService";

import { SYSUser } from "../../../02_system/common/database/master/models/SYSUser";

import { BIZDriverInDeliveryZone } from "../../common/database/master/models/BIZDriverInDeliveryZone";
import { BIZDeliveryZone } from "../../common/database/master/models/BIZDeliveryZone";
import { BIZDriverStatus } from "../../common/database/master/models/BIZDriverStatus";
import SYSUserService from "../../../02_system/common/database/master/services/SYSUserService";
import { SYSUserSessionDevice } from "../../../02_system/common/database/master/models/SYSUserSessionDevice";
import SYSUserSessionDeviceService from "../../../02_system/common/database/master/services/SYSUserSessionDeviceService";
import BIZDeliveryOrderService from "../../common/database/master/services/BIZDeliveryOrderService";

const debug = require( "debug" )( "Dev007ServicesDispatcherController" );

export default class Dev007ServicesDispatcherController extends BaseService {

  //Common business services

  static async getDriverPositionListWithWebsocket( request: Request,
                                                   response: Response,
                                                   transaction: any,
                                                   logger: any ): Promise<any> {

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

        const resultData = await InstantMessageServerManager.getChannelMembers( "Drivers",
                                                                                null, //Take from config
                                                                                logger );

        if ( resultData &&
             resultData.body?.StatusCode === 200 &&
             resultData.body?.Code === "SUCCESS_GET_CHANNEL_MEMBERS" &&
             resultData.body?.Data?.length > 0 ) {

          const membersList = resultData.body?.Data[ 0 ]?.Data?.Drivers || [];

          for ( let intIndex = 0; intIndex < membersList.length; intIndex++ ) {

            //debugMark( "member: %O",  membersList[ intIndex ] );

            const driver = {
                             SupportToken: membersList[ intIndex ].ShortAuth,
                             Id: membersList[ intIndex ].Id,
                             Avatar: membersList[ intIndex ].Avatar,
                             Name: membersList[ intIndex ].Name,
                             FirstName: membersList[ intIndex ].FirstName,
                             LastName: membersList[ intIndex ].LastName,
                             Device: membersList[ intIndex ].Device,
                             JoinedAt: membersList[ intIndex ].JoinedAt,
                             Positions: []
                           };

            driver.Positions = await BIZDriverPositionService.getLastPositionByShortToken(
                                                                                           membersList[ intIndex ].ShortAuth,
                                                                                           request.query.start as string,
                                                                                           request.query.end as string,
                                                                                           parseInt( request.query.limit as string ),
                                                                                           1, //Kind = 1 (Simple only basic field)
                                                                                           currentTransaction,
                                                                                           logger
                                                                                         );

            lastDriverPositionList.push( driver );

          };

          if ( lastDriverPositionList &&
               lastDriverPositionList instanceof Error === false ) {

            result = {
                       StatusCode: 200, //Ok
                       Code: "SUCCESS_GET_DRIVER_POSITION",
                       Message: await I18NManager.translate( strLanguage, "Success get driver position." ),
                       Mark: "F5079489E798" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                       Mark: "1BAB59837C36" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
        else if ( !resultData ) {

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_NO_REPONSE_FROM_IM_MANAGER",
                     Message: await I18NManager.translate( strLanguage, "No response from IM-Manager remote end point" ),
                     Mark: "A7E1EB0872B8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_NO_REPONSE_FROM_IM_MANAGER",
                                 Message: await I18NManager.translate( strLanguage, "No response from IM-Manager remote end point" ),
                                 Details: "resultData === null"
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else if ( !resultData.body ) {

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_NO_REPONSE_BODY_FROM_IM_MANAGER",
                     Message: await I18NManager.translate( strLanguage, "No response body from IM-Manager remote end point" ),
                     Mark: "5B70AF6EA1C1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_NO_BODY_REPONSE_FROM_IM_MANAGER",
                                 Message: await I18NManager.translate( strLanguage, "No response body from IM-Manager remote end point" ),
                                 Details: "resultData.body === null"
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else {

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_IN_RESPONSE_FROM_IM_MANAGER",
                     Message: await I18NManager.translate( strLanguage, "A error code returned from IM-MANAGER remote end point to try get member list" ),
                     Mark: "3B3CD96D21E3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: resultData.body?.Code,
                                 Message: resultData.body?.Message,
                                 Details: {
                                            Mark: resultData.body?.Mark
                                          }
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
                   Mark: "88811FA0E955" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.getDriverPositionListWithWebsocket.name;

      const strMark = "855881234AEB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getDriverPositionListWithDB( request: Request,
                                            response: Response,
                                            transaction: any,
                                            logger: any ): Promise<any> {

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
                              start: [ "present", "date" ],
                              end: [ "present", "date" ],
                              limit: [ "present", "integer", "min:1", "max:25" ],
                            };

      let validator = SystemUtilities.createCustomValidatorSync( request.query,
                                                                 validationRules,
                                                                 null,
                                                                 logger );

      if ( validator.passes() ) { //Validate request.query field values

        let strEndDateTime = SystemUtilities.getCurrentDateAndTime().format();;
        let strStartDateTime = SystemUtilities.getCurrentDateAndTimeFromAndDecMinutes( strEndDateTime, 6 ).format();

        if ( request.query.start ) {

          strStartDateTime = SystemUtilities.getCurrentDateAndTimeFrom( request.query.start ).format();

        }

        if ( request.query.end ) {

          strEndDateTime = SystemUtilities.getCurrentDateAndTimeFrom( request.query.end ).format();

        }

        const lastPositionsInDB = await BIZDriverPositionService.getLastPositionBetween( strStartDateTime,
                                                                                         strEndDateTime,
                                                                                         parseInt( request.query.limit as string ) || 25,
                                                                                         currentTransaction,
                                                                                         logger );

        if ( lastPositionsInDB instanceof Error ) {

          const error = lastPositionsInDB as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "230A50D017EB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

          const lastDriverPositionMapList = new Map<string,any>();

          for ( let intIndex = 0; intIndex < lastPositionsInDB.length; intIndex++ ) {

            let driver = lastDriverPositionMapList.get( lastPositionsInDB[ intIndex ].ShortToken );

            if ( !driver ) {

              const sysUserInDB = await SYSUserService.getById( lastPositionsInDB[ intIndex ].UserId,
                                                                null,
                                                                currentTransaction,
                                                                logger );

              const sysUserSessionDeviceInDB = await SYSUserSessionDeviceService.getByShortToken( lastPositionsInDB[ intIndex ].ShortToken,
                                                                                                  null,
                                                                                                  currentTransaction,
                                                                                                  logger );

              driver = {
                         SupportToken: lastPositionsInDB[ intIndex ].ShortToken,
                         Id: sysUserInDB.Id,
                         Avatar: sysUserInDB.Avatar ? sysUserInDB.Avatar: "",
                         Name: sysUserInDB.Name,
                         FirstName: sysUserInDB.sysPerson?.FirstName ? sysUserInDB.sysPerson?.FirstName: "",
                         LastName: sysUserInDB.sysPerson?.LastName ? sysUserInDB.sysPerson?.LastName: "",
                         Device: sysUserSessionDeviceInDB?.DeviceInfoParsed ? sysUserSessionDeviceInDB?.DeviceInfoParsed: "",
                         Positions: []
                       };

              lastDriverPositionMapList.set( lastPositionsInDB[ intIndex ].ShortToken, driver );

            }

            driver.Positions.push( {
                                     Accuracy: lastPositionsInDB[ intIndex ].Accuracy,
                                     Latitude: lastPositionsInDB[ intIndex ].Latitude,
                                     Longitude: lastPositionsInDB[ intIndex ].Longitude,
                                     Altitude: lastPositionsInDB[ intIndex ].Altitude,
                                     Speed: lastPositionsInDB[ intIndex ].Speed,
                                     Code: lastPositionsInDB[ intIndex ].Code,
                                     CreatedAt: lastPositionsInDB[ intIndex ].CreatedAt,
                                     RowNumber: lastPositionsInDB[ intIndex ].RowNumber,
                                   } );

          }

          let lastDriverPositionList = [];

          lastDriverPositionMapList.forEach( ( value: any, strKey: string, currentMapList: Map<string,any> ) => {

            lastDriverPositionList.push( value );

          } );

          result = {
                     StatusCode: 200, //Ok
                     Code: "SUCCESS_GET_DRIVER_POSITION",
                     Message: await I18NManager.translate( strLanguage, "Success get driver position." ),
                     Mark: "AECC8FB185E4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: lastDriverPositionList.length,
                     Data: lastDriverPositionList
                   };

          bApplyTransaction = true;

        }

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                   Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                   Mark: "DF628DE466B8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.getDriverPositionListWithDB.name;

      const strMark = "680840FE1E93" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getDriverPositionList( request: Request,
                                      response: Response,
                                      transaction: any,
                                      logger: any ): Promise<any> {

    let result = null;

    if ( process.env.DRIVER_POSITION_USE_WEB_SOCKET === "1" ) {

      result = await Dev007ServicesDispatcherController.getDriverPositionListWithWebsocket( request,
                                                                                            response,
                                                                                            transaction,
                                                                                            logger );

    }
    else {

      result = await Dev007ServicesDispatcherController.getDriverPositionListWithDB( request,
                                                                                     response,
                                                                                     transaction,
                                                                                     logger );

    }

    return result;

  }

  static async setDriverDeliveryZone( request: Request,
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

      let bizDriverInDeliveryZoneInDB = await BIZDriverInDeliveryZoneService.getCurrentDeliveryZoneOfDriverAtDate( request.body.UserId,
                                                                                                                   null, //By default use the current date in the server
                                                                                                                   currentTransaction,
                                                                                                                   logger );

      if ( bizDriverInDeliveryZoneInDB &&
           bizDriverInDeliveryZoneInDB instanceof Error === false &&
           bizDriverInDeliveryZoneInDB.EndAt ) {

        bizDriverInDeliveryZoneInDB = null; //This is a closed delivery zone must be ignored and created new one

      }

      //let bizDriverInDeliveryZoneInDB = await BIZDriverInDeliveryZoneService.getDeliveryZone( userSessionStatus.UserId,
      //                                                                                    null, //By default use the current date in the server
      //                                                                                    currentTransaction,
      //                                                                                    logger );

      const bIsAdmin = userSessionStatus?.Role?.includes( "#Administrator#" ) ||
                       userSessionStatus?.Role?.includes( "#BManager_L99#" ) ||
                       userSessionStatus?.Role?.includes( "#Business_Manager#" );

      if ( bizDriverInDeliveryZoneInDB instanceof Error ) {

        const error = bizDriverInDeliveryZoneInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "2BBBCFEEBE9F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      if ( result === null ) {

        let bAddNewEntry = true;

        if ( bizDriverInDeliveryZoneInDB !== null ) {

          if ( bizDriverInDeliveryZoneInDB.DeliveryZoneId !== request.body.DeliveryZoneId ) {

            bizDriverInDeliveryZoneInDB.EndAt = SystemUtilities.getCurrentDateAndTime().format() //Close the entry with the current hour
            bizDriverInDeliveryZoneInDB.UpdatedBy = userSessionStatus.UserName;
            bizDriverInDeliveryZoneInDB.Tag = request.body.Lock === 1 ? "#Dispatcher#": "#Driver#";

            //Update and close the before entry put data in EndAt field
            bizDriverInDeliveryZoneInDB = await BIZDriverInDeliveryZoneService.createOrUpdate(
                                                                                               ( bizDriverInDeliveryZoneInDB as any ).dataValues,
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

                                                                                               UserId: request.body.UserId,
                                                                                               DeliveryZoneId: request.body.DeliveryZoneId,
                                                                                               StartAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                                                               EndAt: null, //Not closed entry
                                                                                               ShortToken: bizDriverInDeliveryZoneInDB?.ShortToken ?
                                                                                                           bizDriverInDeliveryZoneInDB.ShortToken:
                                                                                                           userSessionStatus.ShortToken,
                                                                                               Tag: request.body.Lock === 1 ? "#Dispatcher#": "#Driver#",
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
                                                                   Channels: "Drivers",
                                                                   Message: {
                                                                              Kind:  "DRIVE_DELIVERY_ZONE_CHANGED",
                                                                              Topic: "message",
                                                                              Data: {
                                                                                      SupportToken: bizDriverInDeliveryZoneInDB?.ShortToken ?
                                                                                                    bizDriverInDeliveryZoneInDB.ShortToken:
                                                                                                    userSessionStatus.ShortToken,
                                                                                      UserId: request.body.UserId,
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
                     Code: "SUCCESS_DRIVER_DELIVERY_ZONE_SET",
                     Message: await I18NManager.translate( strLanguage, "Success driver delivery zone set." ),
                     Mark: "807EB995146E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Mark: "FB3CFE434730" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.setDriverDeliveryZone.name;

      const strMark = "7C98BCE82B31" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getDriverDeliveryZone( request: Request,
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

      //let userSessionStatus = context.UserSessionStatus;

      let bizDriverInDeliveryZoneInDB = await BIZDriverInDeliveryZoneService.getCurrentDeliveryZoneOfDriverAtDate( request.body.UserId,
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
                   Mark: "AD11CA16470F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                   Mark: "95B26B33A4B3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_DRIVER_DELIVERY_ZONE_NOT_SET",
                               Message: await I18NManager.translate( strLanguage, "The driver delivery zone not set." ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else {

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

        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_GET_DRIVER_DELIVERY_ZONE",
                   Message: await I18NManager.translate( strLanguage, "Success get the driver delivery zone." ),
                   Mark: "27ED685FDA81" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.getDriverDeliveryZone.name;

      const strMark = "D0D484513893" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getDriverStatusListWithWebsocket( request: Request,
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

      const driverStatusList = await BIZDriverStatusService.getDispatcherDriverStatusAtDate( null, //Use group Id "d7648ed4-1914-4fe4-9902-072a21db1f00"
                                                                                             null, //Use the current date from the server
                                                                                             currentTransaction,
                                                                                             logger );

      if ( driverStatusList &&
           driverStatusList instanceof Error ) {

        const error = driverStatusList as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_TO_GET_DRIVER_STATUS_LIST",
                   Message: await I18NManager.translate( strLanguage, "Cannot get the driver status list from database" ),
                   Mark: "E3A35BBA5CF5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: error.Code,
                               Message: error.Message,
                               Details: await SystemUtilities.processErrorDetails( error ) //error
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else {

        const resultData = await InstantMessageServerManager.getChannelMembers( "Drivers",
                                                                                null, //Take from config
                                                                                logger );

        if ( resultData &&
             resultData.body?.StatusCode === 200 &&
             resultData.body?.Code === "SUCCESS_GET_CHANNEL_MEMBERS" &&
             resultData.body?.Data?.length > 0 ) {

          const driverLiveConnectedList = resultData.body?.Data[ 0 ]?.Data?.Drivers || [];

          for ( let intDriverStatusIndex = 0; intDriverStatusIndex < driverStatusList.length; intDriverStatusIndex++ ) {

            const driverStatus = driverStatusList[ intDriverStatusIndex ];

            if ( driverStatus.StatusCode === 1111 ||
                 driverStatus.StatusCode === 1100 ) {

              let bDriverFound = false;

              //Search in live conntected list
              for ( let intDriverLiveConnectedIndex = 0; intDriverLiveConnectedIndex < driverLiveConnectedList.length; intDriverLiveConnectedIndex++ ) {

                const driverLiveConnected = driverLiveConnectedList[ intDriverLiveConnectedIndex ];

                if ( driverLiveConnected.ShortAuth === driverStatus.SupportToken ) {

                  bDriverFound = true;

                  driverStatus.Live = {

                                        Connected: true,
                                        Reason: await I18NManager.translate( strLanguage, "Live connected" )

                                      }

                }

              }

              if ( bDriverFound === false ) {

                driverStatus.Live = {

                                      Connected: false,
                                      Reason: await I18NManager.translate( strLanguage, "Not found in Drivers channel members" )

                                    }

              }

            }
            else {

              driverStatus.StatusCode = 0;
              driverStatus.StatusDescription = await I18NManager.translate( strLanguage, "Not working" );
              driverStatus.DeliveryZoneId = "";
              driverStatus.DeliveryZone = "";
              driverStatus.Device = "";

              driverStatus.Live = {

                                    Connected: false,
                                    Reason: await I18NManager.translate( strLanguage, "Not working status" )

                                  }

            }

            if ( !driverStatus.DeliveryZoneId ) {

              driverStatus.DeliveryZoneId = "";
              driverStatus.DeliveryZone = "";

            }

            if ( !driverStatus.Device ) {

              driverStatus.Device = "";

            }

          };

        }
        else {

          for ( let intDriverStatusIndex = 0; intDriverStatusIndex < driverStatusList.length; intDriverStatusIndex++ ) {

            const driverStatus = driverStatusList[ intDriverStatusIndex ];

            if ( !driverStatus.StatusCode ) {

              driverStatus.StatusCode = 0;
              driverStatus.StatusDescription = await I18NManager.translate( strLanguage, "Not working" );
              driverStatus.DeliveryZoneId = "";
              driverStatus.DeliveryZone = "";
              driverStatus.Device = "";

              driverStatus.Live = {

                                    Connected: false,
                                    Reason: await I18NManager.translate( strLanguage, "Not working status (N_R_F_IM_S)" )

                                  }

            }
            else {

              driverStatus.Live = {

                                    Connected: false,
                                    Reason: await I18NManager.translate( strLanguage, "No response from IM server" )

                                  }

            }

            if ( !driverStatus.DeliveryZoneId ) {

              driverStatus.DeliveryZoneId = "";
              driverStatus.DeliveryZone = "";

            }

            if ( !driverStatus.Device ) {

              driverStatus.Device = "";

            }

          }

        }

        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_GET_DRIVER_STATUS",
                   Message: await I18NManager.translate( strLanguage, "Success get the driver status." ),
                   Mark: "58210E85B513" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: driverStatusList.length,
                   Data: driverStatusList
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

      sourcePosition.method = this.name + "." + this.getDriverStatusListWithWebsocket.name;

      const strMark = "F013AA5327F0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getDriverStatusListWithDB( request: Request,
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

      const driverStatusList = await BIZDriverStatusService.getDispatcherDriverStatusAtDate( null, //Use group Id "d7648ed4-1914-4fe4-9902-072a21db1f00"
                                                                                             null, //Use the current date from the server
                                                                                             currentTransaction,
                                                                                             logger );

      if ( driverStatusList &&
           driverStatusList instanceof Error ) {

        const error = driverStatusList as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_TO_GET_DRIVER_STATUS_LIST",
                   Message: await I18NManager.translate( strLanguage, "Cannot get the driver status list from database" ),
                   Mark: "D29D63E55760" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: error.Code,
                               Message: error.Message,
                               Details: await SystemUtilities.processErrorDetails( error ) //error
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else {

        for ( let intDriverStatusIndex = 0; intDriverStatusIndex < driverStatusList.length; intDriverStatusIndex++ ) {

          const driverStatus = driverStatusList[ intDriverStatusIndex ];

          if ( !driverStatus.StatusCode ) {

            driverStatus.SupportToken = "";
            driverStatus.StatusCode = 0;
            driverStatus.StatusDescription = await I18NManager.translate( strLanguage, "Not working" );
            driverStatus.DeliveryZoneId = "";
            driverStatus.DeliveryZone = "";
            driverStatus.Device = "";
            driverStatus.ActiveDeliveryOrders = 0;

          }
          else {

            if ( driverStatus.StatusCode === 0 ) {

              driverStatus.SupportToken = "";

            }

            driverStatus.ActiveDeliveryOrders =  await BIZDeliveryOrderService.getCountActiveDeliveryOrdersByDriverId( driverStatus.Id,
                                                                                                                       currentTransaction,
                                                                                                                       logger );

          }

          if ( !driverStatus.DeliveryZoneId ) {

            driverStatus.DeliveryZoneId = "";
            driverStatus.DeliveryZone = "";

          }

          if ( !driverStatus.Device ) {

            driverStatus.Device = "";

          }

        }

        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_GET_DRIVER_STATUS",
                   Message: await I18NManager.translate( strLanguage, "Success get the driver status." ),
                   Mark: "E049943C9F40" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: driverStatusList.length,
                   Data: driverStatusList
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

      sourcePosition.method = this.name + "." + this.getDriverStatusListWithDB.name;

      const strMark = "FA035CA4D80D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getDriverStatusList( request: Request,
                                    response: Response,
                                    transaction: any,
                                    logger: any ):Promise<any> {

    let result = null;

    if ( process.env.DRIVER_POSITION_USE_WEB_SOCKET === "1" ) {

      result = await Dev007ServicesDispatcherController.getDriverStatusListWithWebsocket( request,
                                                                                          response,
                                                                                          transaction,
                                                                                          logger );

    }
    else {

      result = await Dev007ServicesDispatcherController.getDriverStatusListWithDB( request,
                                                                                   response,
                                                                                   transaction,
                                                                                   logger );

    }

    return result;

  }

  static async setDriverStatusStopWork( request: Request,
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
                                                                          request.body.UserId,
                                                                          SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_10 ),
                                                                          currentTransaction,
                                                                          logger
                                                                        );

      if ( bizDriverStatusInDB &&
           bizDriverStatusInDB instanceof Error === false ) {

        const warnings = [];

        if ( bizDriverStatusInDB.Code === 1111 ) { //Working

          let bizDriverInDeliveryZoneInDB = await BIZDriverInDeliveryZoneService.getCurrentDeliveryZoneOfDriverAtDate( request.body.UserId,
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

            if ( !bizDriverInDeliveryZoneInDB.EndAt ||
                  bizDriverInDeliveryZoneInDB.ShortToken !== bizDriverStatusInDB.ShortToken ) {

              bizDriverInDeliveryZoneInDB.EndAt = SystemUtilities.getCurrentDateAndTime().format(), //Close the entry with the current hour
              bizDriverInDeliveryZoneInDB.ShortToken = bizDriverStatusInDB.ShortToken;

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
                                 Message: "Warning to close (Set EndAt field) the current delivery zone from driver",
                                 Details: {
                                            Code: error.name,
                                            Message: error.message,
                                            Details: await SystemUtilities.processErrorDetails( error ) //error
                                          }
                               }
                             );

              }

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

        const intCountActiveDeliveryOrders = await BIZDeliveryOrderService.getCountActiveDeliveryOrdersByDriverId( request.body.UserId,
                                                                                                                   currentTransaction,
                                                                                                                   logger );

        if ( intCountActiveDeliveryOrders === 0 ) {

          bizDriverStatusInDB.Code = 0;
          bizDriverStatusInDB.Description = "Not working";
          bizDriverStatusInDB.UpdatedBy = userSessionStatus.UserName;

        }
        else {

          bizDriverStatusInDB.Code = 1100;
          bizDriverStatusInDB.Description = "Working (Finish)";
          bizDriverStatusInDB.UpdatedBy = userSessionStatus.UserName;

        }

        bizDriverStatusInDB = await BIZDriverStatusService.createOrUpdate(
                                                                           ( bizDriverStatusInDB as any ).dataValues,
                                                                           true,
                                                                           currentTransaction,
                                                                           logger
                                                                         );

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
                                                                 Channels: "Drivers",
                                                                 Message: {
                                                                            Kind:  "DRIVER_STATUS_CHANGED",
                                                                            Topic: "message",
                                                                            Data: {
                                                                                    SupportToken: bizDriverStatusInDB.ShortToken,
                                                                                    UserId: request.body.UserId,
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
                   Mark: "96ED129FA73A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
      else if ( !bizDriverStatusInDB ) {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_DRIVER_NOT_WORKING",
                   Message: await I18NManager.translate( strLanguage, "The driver is not working." ),
                   Mark: "32C8274854E3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_DRIVER_NOT_WORKING",
                               Message: await I18NManager.translate( strLanguage, "The driver is not working." ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else {

        const error = bizDriverStatusInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "A5A23C4274F3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.setDriverStatusStopWork.name;

      const strMark = "59F725906458" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
