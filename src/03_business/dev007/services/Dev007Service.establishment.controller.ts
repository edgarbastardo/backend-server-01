import cluster from "cluster";

import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import {
  Request,
  Response
} from "express";

import CommonConstants from "../../../02_system/common/CommonConstants";
import SystemConstants from "../../../02_system/common/SystemContants";

import SystemUtilities from "../../../02_system/common/SystemUtilities";
import CommonUtilities from "../../../02_system/common/CommonUtilities";

import DBConnectionManager from "../../../02_system/common/managers/DBConnectionManager";
import I18NManager from "../../../02_system/common/managers/I18Manager";

import BaseService from "../../../02_system/common/database/master/services/BaseService";

import BIZEstablishmentService from "../../common/database/master/services/BIZEstablishmentService";
import BIZDeliveryZoneService from "../../common/database/master/services/BIZDeliveryZoneService";

import { BIZEstablishment } from "../../common/database/master/models/BIZEstablishment";
import { BIZDeliveryZone } from "../../common/database/master/models/BIZDeliveryZone";

const debug = require( "debug" )( "Dev007ServicesEstablishmentController" );

export default class Dev007ServicesEstablishmentController extends BaseService {

  static async getEstablishment( request: Request,
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

      let bizEstablishmentInDB = await BIZEstablishmentService.getById( request.query.id as string,
                                                                        currentTransaction,
                                                                        logger );


      if ( !bizEstablishmentInDB ) {

        const strMessage = await I18NManager.translate( strLanguage, "The establishment with id %s. Not found in database", request.query.id as string );

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_ESTABLISHMENT_NOT_FOUND",
                   Message: strMessage,
                   Mark: "003020B3461E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_ESTABLISHMENT_NOT_FOUND",
                               Message: strMessage,
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( bizEstablishmentInDB instanceof Error ) {

        const error = bizEstablishmentInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "E3B8D383C01F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        let modelData = ( bizEstablishmentInDB as any ).dataValues;

        const tempModelData = await BIZEstablishment.convertFieldValues(
                                                                         {
                                                                           Data: modelData,
                                                                           FilterFields: 1, //Force to remove fields like password and value
                                                                           TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                           Include: null, //[ { model: SYSUser } ],
                                                                           Exclude: null, //[ { model: SYSUser } ],
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
                   Code: "SUCCESS_GET_ESTABLISHMENT",
                   Message: await I18NManager.translate( strLanguage, "Success get the establishment information." ),
                   Mark: "949C573BC330" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.getEstablishment.name;

      const strMark = "2585E0B58AFA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async createEstablishment( request: Request,
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

      let establishmentRules = {
                                 DeliveryZoneId: [ "present", "string" ],
                                 CreateDeliveryZone: [ "required", "boolean" ],
                                 Kind: [ "required", "integer", "min:0" ],
                                 Name: [ "required", "string" ],
                                 Address: [ "required", "string" ],
                                 Latitude: [ "required", "string" ],
                                 Longitude: [ "required", "string" ],
                                 EMail: [ "present", "string" ],
                                 Phone: [ "present", "string" ],
                                 Comment: [ "present", "string" ],
                                 Tag: [ "present", "string" ],
                                 Business: [ "present" ],
                                 DisabledBy: [ "required", "string", "min:1", "max:1" ]
                               };

      let validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                 establishmentRules,
                                                                 null,
                                                                 logger );

      if ( validator.passes() ) { //Validate request.body field values

        delete request.body.CreatedBy;
        delete request.body.CreatedAt;
        delete request.body.UpdatedBy;
        delete request.body.UpdatedAt;
        delete request.body.ExtraData;

        if ( request.body.DisabledBy !== "0" &&
             request.body.DisabledBy !== "1" ) {

          delete request.body.DisabledBy;

        }

        delete request.body.DisabledAt;
        delete request.body.ExtraData;

        let bizEstablishmentInDB = await BIZEstablishmentService.getByName( request.body.Name,
                                                                            currentTransaction,
                                                                            logger );

        let strDeliveryZoneId = request.body.DeliveryZoneId;

        let bizDeliveryZoneInDB = null;

        const strUserName = context.UserSessionStatus?.UserName;

        if ( !bizEstablishmentInDB ) {

          if ( !strDeliveryZoneId ) { //No delivery zone send in the request

            if ( request.body.CreateDeliveryZone === true ) {  //Create the delivery zone

              bizDeliveryZoneInDB = await BIZDeliveryZoneService.getById( strDeliveryZoneId,
                                                                          currentTransaction,
                                                                          logger );

              if ( !bizDeliveryZoneInDB ) {

                bizDeliveryZoneInDB = await BIZDeliveryZoneService.getByName( request.body.Name,
                                                                              currentTransaction,
                                                                              logger );

                if ( !bizDeliveryZoneInDB ) {

                  //Create the delivery zone with the same name of the Establishment
                  bizDeliveryZoneInDB = await BIZDeliveryZoneService.createOrUpdate( {
                                                                                       Kind: request.body.Kind,
                                                                                       Name: request.body.Name,
                                                                                       DistanceUnit: 0, //0 = Miles,1 = Kilometers
                                                                                       DistanceCalcKind: 0,
                                                                                       DistanceBase: 4,
                                                                                       DistanceMax: 10,
                                                                                       DistanceExtraCalcKind: 0,
                                                                                       DistanceExtraByUnit: 1.66,
                                                                                       DeliveryByDriverMax: 3,
                                                                                       Comment: "Auto created",
                                                                                       CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                                       CreatedAt: null,
                                                                                       ExtraData: request.body.Business ? CommonUtilities.jsonToString( { Business: request.body.Business }, logger ): null,
                                                                                     },
                                                                                     false,
                                                                                     currentTransaction,
                                                                                     logger );

                  if ( bizDeliveryZoneInDB instanceof Error ) {

                    const error = bizDeliveryZoneInDB;

                    result = {
                               StatusCode: 500, //Internal server error
                               Code: "ERROR_UNEXPECTED",
                               Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                               Mark: "5E7F80200576" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

            }
            else { //No create the delivery zone

              result = {
                         StatusCode: 400, //Bad request
                         Code: "ERROR_DELIVERY_ZONE_ID_IS_EMPTY",
                         Message: await I18NManager.translate( strLanguage, "The delivery zone with id %s. Is empty.", request.body.DeliveryZoneId ),
                         Mark: "744B07F9A837" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: "ERROR_DELIVERY_ZONE_ID_IS_EMPTY",
                                     Message: await I18NManager.translate( strLanguage, "The delivery zone with id %s. Is empty.", request.body.DeliveryZoneId ),
                                     Details: ""
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }

          }
          else {

            bizDeliveryZoneInDB = await BIZDeliveryZoneService.getById( strDeliveryZoneId,
                                                                        currentTransaction,
                                                                        logger );

            if ( !bizDeliveryZoneInDB ) {

              result = {
                         StatusCode: 404, //Not found
                         Code: "ERROR_DELIVERY_ZONE_ID_NOT_FOUND",
                         Message: await I18NManager.translate( strLanguage, "The delivery zone with id %s. Not found in database.", request.body.DeliveryZoneId ),
                         Mark: "B25F21D007C8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: "ERROR_DELIVERY_ZONE_ID_NOT_FOUND",
                                     Message: await I18NManager.translate( strLanguage, "The delivery zone with id %s. Not found in database.", request.body.DeliveryZoneId ),
                                     Details: ""
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }

          }

          if ( result === null ) {

            const bizEstablishmentInDB = await BIZEstablishmentService.createOrUpdate( {
                                                                                         DeliveryZoneId: bizDeliveryZoneInDB.Id,
                                                                                         Kind: request.body.Kind,
                                                                                         Name: request.body.Name,
                                                                                         Address: request.body.Address,
                                                                                         Latitude: request.body.Latitude,
                                                                                         Longitude: request.body.Longitude,
                                                                                         EMail: request.body.EMail || null,
                                                                                         Phone: request.body.Phone || null,
                                                                                         Comment: request.body.Comment || null,
                                                                                         CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                                         CreatedAt: null,
                                                                                         DisabledBy: request.body.DisabledBy === "1" ? "1@" + strUserName: "0",
                                                                                         DisabledAt: null,
                                                                                       },
                                                                                       false,
                                                                                       currentTransaction,
                                                                                       logger );

            if ( bizEstablishmentInDB instanceof Error ) {

              const error = bizEstablishmentInDB;

              result = {
                         StatusCode: 500, //Internal server error
                         Code: "ERROR_UNEXPECTED",
                         Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                         Mark: "57DF6FF1616A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

              let modelData = ( bizEstablishmentInDB as any ).dataValues;

              const tempModelData = await BIZEstablishment.convertFieldValues(
                                                                               {
                                                                                 Data: modelData,
                                                                                 FilterFields: 1, //Force to remove fields like password and value
                                                                                 TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                                 Include: null, //[ { model: SYSUser } ],
                                                                                 Exclude: null, //[ { model: SYSUser } ],
                                                                                 Logger: logger,
                                                                                 ExtraInfo: {
                                                                                              Request: request
                                                                                            }
                                                                               }
                                                                             );

              if ( tempModelData ) {

                modelData = tempModelData;

              }

              //ANCHOR success user create
              result = {
                         StatusCode: 200, //Ok
                         Code: "SUCCESS_ESTABLISHMENT_CREATE",
                         Message: await I18NManager.translate( strLanguage, "Success establishment create." ),
                         Mark: "DD73E2F6A238" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Code: "ERROR_ESTABLISHMENT_NAME_ALREADY_EXISTS",
                     Message: await I18NManager.translate( strLanguage, "The establishment name %s already exists.", request.body.Name ),
                     Mark: "ACDED253B7EC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_ESTABLISHMENT_NAME_ALREADY_EXISTS",
                                 Message: await I18NManager.translate( strLanguage, "The establishment name %s already exists.", request.body.Name ),
                                 Details: ""
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
                   Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                   Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                   Mark: "FB23F6FBDB4D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.createEstablishment.name;

      const strMark = "C0DF7ECF54E0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async modifyEstablishment( request: Request,
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

      let establishmentRules = {
                                 Id: [ "required", "string", "min:36" ],
                                 DeliveryZoneId: [ "present", "string" ],
                                 CreateDeliveryZone: [ "required", "boolean" ],
                                 Kind: [ "required", "integer", "min:0" ],
                                 Name: [ "required", "string" ],
                                 Address: [ "required", "string" ],
                                 Latitude: [ "required", "string" ],
                                 Longitude: [ "required", "string" ],
                                 EMail: [ "present", "string" ],
                                 Phone: [ "present", "string" ],
                                 Comment: [ "present", "string" ],
                                 Business: [ "present" ],
                                 DisabledBy: [ "required", "string", "min:1", "max:1" ]
                               };

      const validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                   establishmentRules,
                                                                   null,
                                                                   logger );

      if ( validator.passes() ) { //Validate request.body field values

        delete request.body.CreatedBy;
        delete request.body.CreatedAt;
        delete request.body.UpdatedBy;
        delete request.body.UpdatedAt;

        if ( request.body.DisabledBy !== "0" &&
             request.body.DisabledBy !== "1" ) {

          delete request.body.DisabledBy;

        }

        delete request.body.DisabledAt;
        delete request.body.ExtraData;

        if ( await BIZEstablishmentService.getNameIsFree( request.body.Id,
                                                          request.body.Name,
                                                          null,
                                                          currentTransaction,
                                                          logger ) !== null ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: "ERROR_ESTABLISHMENT_NAME_ALREADY_EXISTS",
                     Message: await I18NManager.translate( strLanguage, "The establishment name %s already exists.", request.body.Name ),
                     Mark: "8254104C2CC0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_ESTABLISHMENT_NAME_ALREADY_EXISTS",
                                 Message: await I18NManager.translate( strLanguage, "The establishment name %s already exists.", request.body.Name ),
                                 Details: validator.errors.all()
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else {

          let bizEstablishmentInDB = await BIZEstablishmentService.getById( request.body.Id,
                                                                            currentTransaction,
                                                                            logger );

          let strDeliveryZoneId = request.body.DeliveryZoneId;

          let bizDeliveryZoneInDB = null;

          const strUserName = context.UserSessionStatus?.UserName;

          if ( !bizEstablishmentInDB ) {

            result = {
                       StatusCode: 404, //Not found
                       Code: "ERROR_ESTABLISHMENT_NOT_FOUND",
                       Message: await I18NManager.translate( strLanguage, "The establishment with id %s. Not found in database.", request.body.Id ),
                       Mark: "5950C33B04F8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_ESTABLISHMENT_NOT_FOUND",
                                   Message: await I18NManager.translate( strLanguage, "The establishment with id %s. Not found in database.", request.body.Id ),
                                   Details: ""
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else {

            if ( !strDeliveryZoneId ) { //No delivery zone send in the request

              if ( request.body.CreateDeliveryZone === true ) {  //Create the delivery zone

                bizDeliveryZoneInDB = await BIZDeliveryZoneService.getById( strDeliveryZoneId,
                                                                            currentTransaction,
                                                                            logger );

                if ( !bizDeliveryZoneInDB ) {

                  bizDeliveryZoneInDB = await BIZDeliveryZoneService.getByName( request.body.Name,
                                                                                currentTransaction,
                                                                                logger );

                  if ( !bizDeliveryZoneInDB ) {

                    //Create the delivery zone with the same name of the Establishment
                    bizDeliveryZoneInDB = await BIZDeliveryZoneService.createOrUpdate( {
                                                                                         Kind: request.body.Kind,
                                                                                         Name: request.body.Name,
                                                                                         DistanceUnit: 0, //0 = Miles,1 = Kilometers
                                                                                         DistanceCalcKind: 0,
                                                                                         DistanceBase: 4,
                                                                                         DistanceMax: 10,
                                                                                         DistanceExtraCalcKind: 0,
                                                                                         DistanceExtraByUnit: 1.66,
                                                                                         DeliveryByDriverMax: 3,
                                                                                         Comment: "Auto created",
                                                                                         CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                                         CreatedAt: null,
                                                                                         ExtraData: request.body.Business ? CommonUtilities.jsonToString( { Business: request.body.Business }, logger ): null,
                                                                                       },
                                                                                       false,
                                                                                       currentTransaction,
                                                                                       logger );

                    if ( bizDeliveryZoneInDB instanceof Error ) {

                      const error = bizDeliveryZoneInDB;

                      result = {
                                 StatusCode: 500, //Internal server error
                                 Code: "ERROR_UNEXPECTED",
                                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                                 Mark: "BF3A1B38493D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

              }
              else { //No create the delivery zone

                result = {
                           StatusCode: 400, //Bad request
                           Code: "ERROR_DELIVERY_ZONE_ID_IS_EMPTY",
                           Message: await I18NManager.translate( strLanguage, "The delivery zone with id %s. Is empty.", request.body.DeliveryZoneId ),
                           Mark: "6DC1D0038B33" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: "ERROR_DELIVERY_ZONE_ID_IS_EMPTY",
                                       Message: await I18NManager.translate( strLanguage, "The delivery zone with id %s. Is empty.", request.body.DeliveryZoneId ),
                                       Details: ""
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }

            }
            else {

              bizDeliveryZoneInDB = await BIZDeliveryZoneService.getById( strDeliveryZoneId,
                                                                          currentTransaction,
                                                                          logger );

              if ( !bizDeliveryZoneInDB ) {

                result = {
                           StatusCode: 404, //Not found
                           Code: "ERROR_DELIVERY_ZONE_ID_NOT_FOUND",
                           Message: await I18NManager.translate( strLanguage, "The delivery zone with id %s. Not found in database.", request.body.DeliveryZoneId ),
                           Mark: "5E1E8FFF66E1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: "ERROR_DELIVERY_ZONE_ID_NOT_FOUND",
                                       Message: await I18NManager.translate( strLanguage, "The delivery zone with id %s. Not found in database.", request.body.DeliveryZoneId ),
                                       Details: ""
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }

            }

            const intEstablishmentCount = await BIZDeliveryZoneService.getCountEstablishmentAssociated( bizDeliveryZoneInDB.Id,
                                                                                                        currentTransaction,
                                                                                                        logger );

            if ( intEstablishmentCount === 1 ) { //This delivery zone is the same of restaurant

              const bizEstablishmentInDB = await BIZEstablishmentService.getById( request.body.Id,
                                                                                  currentTransaction,
                                                                                  logger );

              if ( bizEstablishmentInDB?.Name === bizDeliveryZoneInDB.Name ) {

                bizDeliveryZoneInDB = await BIZDeliveryZoneService.createOrUpdate( {
                                                                                     Id: bizDeliveryZoneInDB.Id,
                                                                                     Name: request.body.Name, //Only update the name
                                                                                   },
                                                                                   true,
                                                                                   currentTransaction,
                                                                                   logger );

              }

            }

          }

          if ( result === null ) {

            const bizEstablishmentInDB = await BIZEstablishmentService.createOrUpdate( {
                                                                                         Id: request.body.Id,
                                                                                         DeliveryZoneId: bizDeliveryZoneInDB.Id,
                                                                                         Kind: request.body.Kind,
                                                                                         Name: request.body.Name,
                                                                                         Address: request.body.Address,
                                                                                         Latitude: request.body.Latitude,
                                                                                         Longitude: request.body.Longitude,
                                                                                         EMail: request.body.EMail || null,
                                                                                         Phone: request.body.Phone || null,
                                                                                         Comment: request.body.Comment || null,
                                                                                         UpdatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                                         UpdatedAt: null,
                                                                                         DisabledBy: request.body.DisabledBy === "1" ? "1@" + strUserName: "0",
                                                                                         DisabledAt: null,
                                                                                       },
                                                                                       true,
                                                                                       currentTransaction,
                                                                                       logger );

            if ( bizEstablishmentInDB instanceof Error ) {

              const error = bizEstablishmentInDB;

              result = {
                         StatusCode: 500, //Internal server error
                         Code: "ERROR_UNEXPECTED",
                         Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                         Mark: "39B8BD3D014F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

              let modelData = ( bizEstablishmentInDB as any ).dataValues;

              const tempModelData = await BIZEstablishment.convertFieldValues(
                                                                               {
                                                                                 Data: modelData,
                                                                                 FilterFields: 1, //Force to remove fields like password and value
                                                                                 TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                                 Include: null, //[ { model: SYSUser } ],
                                                                                 Exclude: null, //[ { model: SYSUser } ],
                                                                                 Logger: logger,
                                                                                 ExtraInfo: {
                                                                                              Request: request
                                                                                            }
                                                                               }
                                                                             );

              if ( tempModelData ) {

                modelData = tempModelData;

              }

              //ANCHOR success user create
              result = {
                         StatusCode: 200, //Ok
                         Code: "SUCCESS_ESTABLISHMENT_UPDATE",
                         Message: await I18NManager.translate( strLanguage, "Success establishment update." ),
                         Mark: "60A2CDF2EDA7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                   Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                   Mark: "B6E0782DE01E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.modifyEstablishment.name;

      const strMark = "FC24A12FF9DD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async bulkEstablishmentOperation( strBulkOperation: string,
                                           request: Request,
                                           transaction: any,
                                           logger: any ): Promise<any> {

    let result: any = {
                        data:[],
                        errors:[],
                        warnings: []
                      };

    let strLanguage = null;

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const bulkData = request.body.bulk;

      const userSessionStatus = context.UserSessionStatus;

      for ( let intIndex= 0; intIndex < bulkData.length; intIndex++ ) {

        const bulkUserData = bulkData[ intIndex ];

        try {

          let bizEstablishmentInDB = await BIZEstablishmentService.getById( bulkUserData.Id,
                                                                            transaction,
                                                                            logger );

          if ( !bizEstablishmentInDB ) {

            result.errors.push (
                                 {
                                   Id: bulkUserData.Id,
                                   Code: "ERROR_ESTABLISHMENT_NOT_FOUND",
                                   Mark: "55E2EA10486B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   Message: await I18NManager.translate( strLanguage, "The establishment with id %s not found", bulkUserData.Id ),
                                   Details: null,
                                 }
                               );

          }
          else if ( bizEstablishmentInDB instanceof Error ) {

            const error = bizEstablishmentInDB as any;

            result.errors.push (
                                 {
                                   Id: bulkUserData.Id,
                                   Code: error.name,
                                   Mark: "0C913AF6CEC6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   Message: error.message,
                                   Details: await SystemUtilities.processErrorDetails( error ) //error
                                 }
                               );

          }
          else if ( strBulkOperation === "deleteEstablishment" ) {

            const deleteResult = await BIZEstablishmentService.deleteByModel( bizEstablishmentInDB,
                                                                              transaction,
                                                                              logger );

            if ( deleteResult instanceof Error ) {

              const error = deleteResult as Error;

              result.errors.push(
                                  {
                                    Id: bizEstablishmentInDB.Id,
                                    Name: bizEstablishmentInDB.Name,
                                    Code: "ERROR_UNEXPECTED",
                                    Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                                    Mark: "DD6D7F5E44E6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                    Details: await SystemUtilities.processErrorDetails( error ) //error
                                  }
                                );


            }
            else if ( deleteResult === true ) {

              const intCountEstablishments = await BIZDeliveryZoneService.getCountEstablishmentAssociated( bizEstablishmentInDB.DeliveryZoneId,
                                                                                                           transaction,
                                                                                                           logger ) as any;

              if ( intCountEstablishments instanceof Error === false &&
                   intCountEstablishments === 0 ) {

                const bizDeliveryZoneInDB = await BIZDeliveryZoneService.getById( bizEstablishmentInDB.DeliveryZoneId,
                                                                                  transaction,
                                                                                  logger ) as any;

                if ( bizDeliveryZoneInDB &&
                     bizDeliveryZoneInDB instanceof Error === false &&
                     bizDeliveryZoneInDB.Name === bizEstablishmentInDB.Name ) {

                  //Delete the delivery zone too
                  await BIZDeliveryZoneService.deleteByModel( bizDeliveryZoneInDB as any,
                                                              transaction,
                                                              logger );

                }

              };

              result.data.push(
                                {
                                  Id: bizEstablishmentInDB.Id,
                                  Name: bizEstablishmentInDB.Name,
                                  Code: "SUCCESS_ESTABLISHMENT_DELETE",
                                  Message: await I18NManager.translate( strLanguage, "Success establishment delete." ),
                                  Mark: "D116040DA549" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                  Details: null
                                }
                              );

            }
            else {

              result.errors.push(
                                  {
                                    Id: bizEstablishmentInDB.Id,
                                    Name: bizEstablishmentInDB.Name,
                                    Code: "ERROR_ESTABLISHMENT_DELETE",
                                    Message: await I18NManager.translate( strLanguage, "Error in establishment delete." ),
                                    Mark: "09D7224C14A4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                    Details: "Method deleteByModel return false"
                                  }
                                );

            }

          }
          else {

            bizEstablishmentInDB.UpdatedBy = userSessionStatus.UserName;
            bizEstablishmentInDB.UpdatedAt = null;

            if ( strBulkOperation === "disableEstablishment" ) {

              bizEstablishmentInDB.DisabledBy = "1@" + userSessionStatus.UserName;

            }
            else if ( strBulkOperation === "enableEstablishment" ) {

              bizEstablishmentInDB.DisabledBy = "0";

            }

            bizEstablishmentInDB = await BIZEstablishmentService.createOrUpdate( ( bizEstablishmentInDB as any ).dataValues,
                                                                                  true,
                                                                                  transaction,
                                                                                  logger );

            if ( bizEstablishmentInDB instanceof Error ) {

              const error = bizEstablishmentInDB as any;

              result.errors.push(
                                  {
                                    Id: bizEstablishmentInDB.Id,
                                    Name: bizEstablishmentInDB.Name,
                                    Code: "ERROR_UNEXPECTED",
                                    Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                                    Mark: "007F77217AE9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                    Details: await SystemUtilities.processErrorDetails( error ) //error
                                  }
                                );

            }
            else {

              const intCountEstablishments = await BIZDeliveryZoneService.getCountEstablishmentAssociated( bizEstablishmentInDB.DeliveryZoneId,
                                                                                                           transaction,
                                                                                                           logger ) as any;

              if ( intCountEstablishments instanceof Error === false &&
                   intCountEstablishments === 1 ) {

                let strDisabledBy = "";

                if ( strBulkOperation === "disableEstablishment" ) {

                  strDisabledBy = "1@" + userSessionStatus.UserName;

                }
                else if ( strBulkOperation === "enableEstablishment" ) {

                  strDisabledBy = "0";

                }

                //Disable/Enable the delivery zone too
                await BIZDeliveryZoneService.createOrUpdate( {
                                                               Id: bizEstablishmentInDB.DeliveryZoneId,
                                                               DisabledBy: strDisabledBy,
                                                               DisabledAt: null
                                                             },
                                                             true,
                                                             transaction,
                                                             logger );

              };

              result.data.push(
                                {
                                  Id: bizEstablishmentInDB.Id,
                                  Name: bizEstablishmentInDB.Name,
                                  Code: "SUCCESS_ESTABLISHMENT_UPDATE",
                                  Message: await I18NManager.translate( strLanguage, "Success establishment update." ),
                                  Mark: "71F02B3854E5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                  Details: {
                                             DisabledBy: bizEstablishmentInDB.DisabledBy,
                                             DisabledAt: bizEstablishmentInDB.DisabledAt
                                           }
                                }
                              );

            }

          }

        }
        catch ( error ) {

          result.data.push(
                            {
                              Id: bulkUserData.Id,
                              Code: "ERROR_UNEXPECTED",
                              Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                              Mark: "B20FF4530C0C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                              Details: await SystemUtilities.processErrorDetails( error ) //error
                            }
                          );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.bulkEstablishmentOperation.name;

      const strMark = "20F681432897" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result.errors.push(
                          {
                            Code: "ERROR_UNEXPECTED",
                            Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                            Mark: strMark,
                            Details: await SystemUtilities.processErrorDetails( error ) //error
                          }
                        );

    }

    return result;

  }

  static async disableBulkEstablishment( request: Request,
                                         response: Response,
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

      const bulkResult = await this.bulkEstablishmentOperation( "disableEstablishment",
                                                                request,
                                                                currentTransaction,
                                                                logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = "SUCCESS_BULK_ESTABLISHMENT_DISABLE";
        strMessage = await I18NManager.translate( strLanguage, "Success disable ALL establishments" );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = "ERROR_BULK_ESTABLISHMENT_DISABLE";
        strMessage = await I18NManager.translate( strLanguage, "Cannot disable the establishments. Please check the errors and warnings section" );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = "CHECK_DATA_AND_ERRORS_AND_WARNINGS";
        strMessage = await I18NManager.translate( strLanguage, "Not ALL establishments has been disabled. Please check the data and errors and warnings section" );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: "9123C2C105BA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: bIsError,
                 Errors: bulkResult.errors,
                 Warnings: bulkResult.warnings,
                 Count: request.body.bulk.length - bulkResult.errors.length,
                 Data: bulkResult.data
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

      sourcePosition.method = this.name + "." + this.disableBulkEstablishment.name;

      const strMark = "23BF707842DC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async enableBulkEstablishment( request: Request,
                                        response: Response,
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

      const bulkResult = await this.bulkEstablishmentOperation( "enableEstablishment",
                                                                request,
                                                                currentTransaction,
                                                                logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = "SUCCESS_BULK_ESTABLISHMENT_ENABLE";
        strMessage = await I18NManager.translate( strLanguage, "Success enable ALL establishments" );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = "ERROR_BULK_ESTABLISHMENT_ENABLE";
        strMessage = await I18NManager.translate( strLanguage, "Cannot enable the establishments. Please check the errors and warnings section" );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = "CHECK_DATA_AND_ERRORS_AND_WARNINGS";
        strMessage = await I18NManager.translate( strLanguage, "Not ALL establishments has been enabled. Please check the data and errors and warnings section" );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: "2F55595C7C0F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: bIsError,
                 Errors: bulkResult.errors,
                 Warnings: bulkResult.warnings,
                 Count: request.body.bulk.length - bulkResult.errors.length,
                 Data: bulkResult.data
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

      sourcePosition.method = this.name + "." + this.enableBulkEstablishment.name;

      const strMark = "A29D32BC5354" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteEstablishment( request: Request,
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

      let bizEstablishmentInDB = await BIZEstablishmentService.getById( request.query.id as string,
                                                                        currentTransaction,
                                                                        logger );

      if ( !bizEstablishmentInDB ) {

        result = {
                    StatusCode: 404, //Not found
                    Code: "ERROR_ESTABLISHMENT_NOT_FOUND",
                    Message: await I18NManager.translate( strLanguage, "The establishment with id %s. Not found in database.", request.body.Id ),
                    Mark: "C87E1B5F8D72" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                    LogId: null,
                    IsError: true,
                    Errors: [
                              {
                                Code: "ERROR_ESTABLISHMENT_NOT_FOUND",
                                Message: await I18NManager.translate( strLanguage, "The establishment with id %s. Not found in database.", request.body.Id ),
                                Details: ""
                              }
                            ],
                    Warnings: [],
                    Count: 0,
                    Data: []
                  }

      }
      else if ( bizEstablishmentInDB instanceof Error ) {

        const error = bizEstablishmentInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "CDF17EC73A9C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        const intCountEstablishments = await BIZDeliveryZoneService.getCountEstablishmentAssociated( bizEstablishmentInDB.DeliveryZoneId,
                                                                                                     transaction,
                                                                                                     logger ) as any;

        if ( intCountEstablishments instanceof Error === false &&
             intCountEstablishments === 1 ) {

          const bizDeliveryZoneInDB = await BIZDeliveryZoneService.getById( bizEstablishmentInDB.DeliveryZoneId,
                                                                            transaction,
                                                                            logger );

          if ( bizDeliveryZoneInDB &&
               bizDeliveryZoneInDB instanceof Error === false ) {

            //Delete the delivery zone too
            await BIZDeliveryZoneService.deleteByModel( bizDeliveryZoneInDB as any,
                                                        transaction,
                                                        logger );

          }

        }

        const deleteResult = await BIZEstablishmentService.deleteByModel( bizEstablishmentInDB,
                                                                          currentTransaction,
                                                                          logger );

        if ( deleteResult instanceof Error ) {

          const error = deleteResult as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "99B75B631C52" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Code: "SUCCESS_ESTABLISHMENT_DELETE",
                     Message: await I18NManager.translate( strLanguage, "Success establishment %s deleted.", bizEstablishmentInDB.Name ),
                     Mark: "7A278CED1C95" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Code: "ERROR_ESTABLISHMENT_DELETE",
                     Message: await I18NManager.translate( strLanguage, "Error in establishment delete." ),
                     Mark: "6FAD26F43403" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [
                               {
                                 Code: "ERROR_METHOD_DELETE_RETURN_FALSE",
                                 Message: "Method deleteByModel return false",
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

      sourcePosition.method = this.name + "." + this.deleteEstablishment.name;

      const strMark = "2911574659CE" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteBulkEstablishment( request: Request,
                                        response: Response,
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

      const bulkResult = await this.bulkEstablishmentOperation( "deleteEstablishment",
                                                                request,
                                                                currentTransaction,
                                                                logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = "SUCCESS_BULK_ESTABLISHMENT_DELETE";
        strMessage = await I18NManager.translate( strLanguage, "Success delete ALL establishments" );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = "ERROR_BULK_ESTABLISHMENT_DELETE";
        strMessage = await I18NManager.translate( strLanguage, "Cannot delete the establishments. Please check the errors and warnings section" );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = "CHECK_DATA_AND_ERRORS_AND_WARNINGS";
        strMessage = await I18NManager.translate( strLanguage, "Not ALL establishments has been deleted. Please check the data and errors and warnings section" );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: "EE3F6DDE7D00" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: bIsError,
                 Errors: bulkResult.errors,
                 Warnings: bulkResult.warnings,
                 Count: request.body.bulk.length - bulkResult.errors.length,
                 Data: bulkResult.data
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

      sourcePosition.method = this.name + "." + this.deleteBulkEstablishment.name;

      const strMark = "7BCA658CF5E8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async searchEstablishment( request: Request,
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

      const strSelectField = SystemUtilities.createSelectAliasFromModels(
                                                                          [
                                                                            BIZEstablishment,
                                                                            BIZDeliveryZone
                                                                          ],
                                                                          [
                                                                            "A",
                                                                            "B"
                                                                          ]
                                                                        );

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "searchEstablishment",
                                                     {
                                                       SelectFields: strSelectField,
                                                     },
                                                     logger );

      const querystring = require( "querystring" );

      strSQL = request.query.where ? strSQL + "( " + querystring.unescape( request.query.where as string ) + " )" : strSQL + "( 1 )";

      strSQL = request.query.orderBy ? strSQL + " Order By " + request.query.orderBy: strSQL;

      let intLimit = 200;

      const warnings = [];

      if ( request.query.limit &&
           isNaN( parseInt( request.query.limit as string ) ) === false &&
           Number.parseInt( request.query.limit as string ) <= intLimit ) {

        intLimit = parseInt( request.query.limit as string );

      }
      else {

        warnings.push(
                       {
                         Code: "WARNING_DATA_LIMITED_TO_MAX",
                         Message: await I18NManager.translate( strLanguage, "Data limited to the maximun of %s rows", intLimit ),
                         Details: await I18NManager.translate( strLanguage, "To protect to server and client of large result set of data, the default maximun rows is %s, you must use \"offset\" and \"limit\" query parameters to paginate large result set of data.", intLimit )
                       }
                     );

      }
      strSQL = strSQL + " LIMIT " + intLimit.toString() + " OFFSET " + ( request.query.offset && !isNaN( parseInt( request.query.offset as string ) ) ? request.query.offset : "0" );

      //ANCHOR dbConnection.query
      const rows = await dbConnection.query( strSQL,
                                             {
                                               raw: true,
                                               type: QueryTypes.SELECT,
                                               transaction: currentTransaction
                                             } );

      const transformedRows = SystemUtilities.transformRowValuesToSingleRootNestedObject( rows,
                                                                                          [
                                                                                            BIZEstablishment,
                                                                                            BIZDeliveryZone
                                                                                          ],
                                                                                          [
                                                                                            "A",
                                                                                            "B"
                                                                                          ] );

      const convertedRows = [];

      for ( const currentRow of transformedRows ) {

        const tempModelData = await BIZEstablishment.convertFieldValues(
                                                                         {
                                                                           Data: currentRow,
                                                                           FilterFields: 1, //Force to remove fields like password and value
                                                                           TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                           Include: null, //[ { model: SYSUser } ],
                                                                           Exclude: null, //[ { model: SYSUser } ],
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

      }

      result = {
                 StatusCode: 200, //Ok
                 Code: "SUCCESS_SEARCH",
                 Message: await I18NManager.translate( strLanguage, "Success search." ),
                 Mark: "A7136759C832" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: false,
                 Errors: [],
                 Warnings: warnings,
                 Count: convertedRows.length,
                 Data: convertedRows
               }

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

      sourcePosition.method = this.name + "." + this.searchEstablishment.name;

      const strMark = "B0451F84AA99" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async searchCountEstablishment( request: Request,
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

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "searchCountEstablishment",
                                                     {
                                                       //SelectFields: strSelectField,
                                                     },
                                                     logger );

      const querystring = require( "querystring" );

      strSQL = request.query.where ? strSQL + "( " + querystring.unescape( request.query.where ) + " )" : strSQL + "( 1 )";

      const rows = await dbConnection.query( strSQL, {
                                                       raw: true,
                                                       type: QueryTypes.SELECT,
                                                       transaction: currentTransaction
                                                     } );

      result = {
                 StatusCode: 200, //Ok
                 Code: "SUCCESS_SEARCH_COUNT",
                 Message: await I18NManager.translate( strLanguage, "Success search count." ),
                 Mark: "45485FDD6D14" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: false,
                 Errors: [],
                 Warnings: [],
                 Count: 1,
                 Data: [
                         {
                           Count: rows.length > 0 ? rows[ 0 ].Count: 0
                         }
                       ]
               }

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

      sourcePosition.method = this.name + "." + this.searchCountEstablishment.name;

      const strMark = "5B79EF12E312" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
