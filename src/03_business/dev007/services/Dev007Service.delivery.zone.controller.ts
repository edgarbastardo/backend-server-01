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

import BIZDeliveryZoneService from "../../common/database/master/services/BIZDeliveryZoneService";

import { BIZDeliveryZone } from "../../common/database/master/models/BIZDeliveryZone";

const debug = require( "debug" )( "Dev007ServicesDeliveryZoneController" );

export default class Dev007ServicesDeliveryZoneController extends BaseService {

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

      //let userSessionStatus = context.UserSessionStatus;

      let sysDeliveryZoneInDB = await BIZDeliveryZoneService.getById( request.query.id as string,
                                                                      currentTransaction,
                                                                      logger );


      if ( !sysDeliveryZoneInDB ) {

        const strMessage = await I18NManager.translate( strLanguage, "The delivery zone with id %s, not found in database", request.query.id as string );

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_DELIVERY_ZONE_NOT_FOUND",
                   Message: strMessage,
                   Mark: "97986E43F1DC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_DELIVERY_ZONE_NOT_FOUND",
                               Message: strMessage,
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( sysDeliveryZoneInDB instanceof Error ) {

        const error = sysDeliveryZoneInDB as any;

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

        let modelData = ( sysDeliveryZoneInDB as any ).dataValues;

        const tempModelData = await BIZDeliveryZone.convertFieldValues(
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
                   Code: "SUCCESS_GET_DELIVERY_ZONE",
                   Message: await I18NManager.translate( strLanguage, "Success get the delivery zone information." ),
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

      sourcePosition.method = this.name + "." + this.getDeliveryZone.name;

      const strMark = "8B481ED7351C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async createDeliveryZone( request: Request,
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

      let deliveryZoneRules = {
                                Kind: [ "required", "integer", "min:0" ],
                                Name: [ "required", "string" ],
                                DistanceUnit: [ "required", "integer", "min:0", "max:1" ],
                                DistanceCalcKind: [ "required", "integer", "min:0" ],
                                DistanceBase: [ "required", "numeric", "min:0" ],
                                DistanceMax: [ "required", "numeric", "min:0" ],
                                DistanceExtraCalcKind: [ "required", "integer", "min:0" ],
                                DistanceExtraByUnit: [ "required", "numeric", "min:0" ],
                                DeliveryByDriverMax: [ "required", "integer", "min:0" ],
                                Comment: [ "present", "string" ],
                                Tag: [ "present", "string" ],
                                Business: [ "present" ],
                                DisabledBy: [ "required", "string", "min:1", "max:1" ]
                              };

      let validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                 deliveryZoneRules,
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

        let bizDeliveryZoneInDB = await BIZDeliveryZoneService.getByName( request.body.Name,
                                                                          currentTransaction,
                                                                          logger );

        const strUserName = context.UserSessionStatus?.UserName;

        if ( !bizDeliveryZoneInDB ) {

          bizDeliveryZoneInDB = await BIZDeliveryZoneService.createOrUpdate( {
                                                                               Kind: request.body.Kind,
                                                                               Name: request.body.Name,
                                                                               Distance: request.body.Distance,
                                                                               Quantity: request.body.Quantity,
                                                                               Comment: request.body.Comment || null,
                                                                               CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                               CreatedAt: null,
                                                                               DisabledBy: request.body.DisabledBy === "1" ? "1@" + strUserName: "0",
                                                                               DisabledAt: null,
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
                         Mark: "A03E520AC7AB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

              let modelData = ( bizDeliveryZoneInDB as any ).dataValues;

              const tempModelData = await BIZDeliveryZone.convertFieldValues(
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
                         Code: "SUCCESS_DELIVERY_ZONE_CREATE",
                         Message: await I18NManager.translate( strLanguage, "Success delivery zone create." ),
                         Mark: "096C591A80C5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
        else {

          result = {
                     StatusCode: 400, //Bad request
                     Code: "ERROR_DELIVERY_ZONE_NAME_ALREADY_EXISTS",
                     Message: await I18NManager.translate( strLanguage, "The delivery zone name %s already exists.", request.body.Name ),
                     Mark: "ACDED253B7EC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_DELIVERY_ZONE_NAME_ALREADY_EXISTS",
                                 Message: await I18NManager.translate( strLanguage, "The delivery zone name %s already exists.", request.body.Name ),
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

      sourcePosition.method = this.name + "." + this.createDeliveryZone.name;

      const strMark = "842F68BEABC5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async modifyDeliveryZone( request: Request,
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

      let deliveryZoneRules = {
                                Id: [ "required", "string", "min:36" ],
                                Kind: [ "required", "integer", "min:0" ],
                                Name: [ "required", "string" ],
                                DistanceUnit: [ "required", "integer", "min:0", "max:1" ],
                                DistanceCalcKind: [ "required", "integer", "min:0" ],
                                DistanceBase: [ "required", "numeric", "min:0" ],
                                DistanceMax: [ "required", "numeric", "min:0" ],
                                DistanceExtraCalcKind: [ "required", "integer", "min:0" ],
                                DistanceExtraByUnit: [ "required", "numeric", "min:0" ],
                                DeliveryByDriverMax: [ "required", "integer", "min:0" ],
                                Comment: [ "present", "string" ],
                                Tag: [ "present", "string" ],
                                Business: [ "present" ],
                                DisabledBy: [ "required", "string", "min:1", "max:1" ]
                              };

      const validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                   deliveryZoneRules,
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

        if ( await BIZDeliveryZoneService.getNameIsFree( request.body.Id,
                                                         request.body.Name,
                                                         null,
                                                         currentTransaction,
                                                         logger ) !== null ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: "ERROR_DELIVERY_ZONE_NAME_ALREADY_EXISTS",
                     Message: await I18NManager.translate( strLanguage, "The delivery zone name %s already exists.", request.body.Name ),
                     Mark: "1125A181D277" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_DELIVERY_ZONE_NAME_ALREADY_EXISTS",
                                 Message: await I18NManager.translate( strLanguage, "The delivery zone name %s already exists.", request.body.Name ),
                                 Details: validator.errors.all()
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else {

          let bizDeliveryZoneInDB = await BIZDeliveryZoneService.getById( request.body.Id,
                                                                          currentTransaction,
                                                                          logger ) as any;

          const strUserName = context.UserSessionStatus?.UserName;

          if ( !bizDeliveryZoneInDB ) {

            result = {
                       StatusCode: 404, //Not found
                       Code: "ERROR_DELIVERY_ZONE_NOT_FOUND",
                       Message: await I18NManager.translate( strLanguage, "The delivery zone with id %s. Not found in database.", request.body.Id ),
                       Mark: "23CA5CA9FE65" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_DELIVERY_ZONE_NOT_FOUND",
                                   Message: await I18NManager.translate( strLanguage, "The delivery zone with id %s. Not found in database.", request.body.Id ),
                                   Details: ""
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }

          if ( result === null ) {

            bizDeliveryZoneInDB = await BIZDeliveryZoneService.createOrUpdate( {
                                                                                 Id: request.body.Id,
                                                                                 Kind: request.body.Kind,
                                                                                 Name: request.body.Name,
                                                                                 Distance: request.body.Distance,
                                                                                 Quantity: request.body.Quantity,
                                                                                 Comment: request.body.Comment || null,
                                                                                 UpdatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                                 UpdatedAt: null,
                                                                                 DisabledBy: request.body.DisabledBy === "1" ? "1@" + strUserName: "0",
                                                                                 DisabledAt: null,
                                                                               },
                                                                               true,
                                                                               currentTransaction,
                                                                               logger );

            if ( bizDeliveryZoneInDB instanceof Error ) {

              const error = bizDeliveryZoneInDB;

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

              if ( request.body.DisabledBy === "1" ) {

                await BIZDeliveryZoneService.disableEstablishmentAssociated( request.body.Id,
                                                                             strUserName,
                                                                             SystemUtilities.getCurrentDateAndTime().format(),
                                                                             currentTransaction,
                                                                             logger );

              }

              let modelData = ( bizDeliveryZoneInDB as any ).dataValues;

              const tempModelData = await BIZDeliveryZone.convertFieldValues(
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
                         Code: "SUCCESS_DELIVERY_ZONE_UPDATE",
                         Message: await I18NManager.translate( strLanguage, "Success delivery zone update." ),
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

      sourcePosition.method = this.name + "." + this.modifyDeliveryZone.name;

      const strMark = "05426F959D4E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async bulkDeliveryZoneOperation( strBulkOperation: string,
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

          let bizDeliveryZoneInDB = await BIZDeliveryZoneService.getById( bulkUserData.Id,
                                                                          transaction,
                                                                          logger );

          if ( !bizDeliveryZoneInDB ) {

            result.errors.push (
                                 {
                                   Id: bulkUserData.Id,
                                   ShortId: bulkUserData.ShortId,
                                   Name: bulkUserData.Name,
                                   Code: "ERROR_DELIVERY_ZONE_NOT_FOUND",
                                   Mark: "57A976ED3322" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   Message: await I18NManager.translate( strLanguage, "The delivery zone with id %s not found", bulkUserData.Id ),
                                   Details: null,
                                 }
                               );

          }
          else if ( bizDeliveryZoneInDB instanceof Error ) {

            const error = bizDeliveryZoneInDB as any;

            result.errors.push (
                                 {
                                   Id: bulkUserData.Id,
                                   ShortId: bulkUserData.ShortId,
                                   Name: bulkUserData.Name,
                                   Code: error.name,
                                   Mark: "E85800D8FF0B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   Message: error.message,
                                   Details: await SystemUtilities.processErrorDetails( error ) //error
                                 }
                               );

          }
          else if ( strBulkOperation === "deleteDeliveryZone" ) {

            const intEstablishmentCount = await BIZDeliveryZoneService.getEstablishmentCountAssociated( bizDeliveryZoneInDB.Id,
                                                                                                        transaction,
                                                                                                        logger );

            if ( intEstablishmentCount === 0 ) {

              const deleteResult = await BIZDeliveryZoneService.deleteByModel( bizDeliveryZoneInDB,
                                                                              transaction,
                                                                              logger );

              if ( deleteResult instanceof Error ) {

                const error = deleteResult as Error;

                result.errors.push(
                                    {
                                      Id: bizDeliveryZoneInDB.Id,
                                      Name: bizDeliveryZoneInDB.Name,
                                      Code: "ERROR_UNEXPECTED",
                                      Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                                      Mark: "F916925E55A0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                      Details: await SystemUtilities.processErrorDetails( error ) //error
                                    }
                                  );


              }
              else if ( deleteResult === true ) {

                result.data.push(
                                  {
                                    Id: bizDeliveryZoneInDB.Id,
                                    Name: bizDeliveryZoneInDB.Name,
                                    Code: "SUCCESS_DELIVERY_ZONE_DELETE",
                                    Message: await I18NManager.translate( strLanguage, "Success delivery zone delete." ),
                                    Mark: "6C1530273A22" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                    Details: null
                                  }
                                );

              }
              else {

                result.errors.push(
                                    {
                                      Id: bizDeliveryZoneInDB.Id,
                                      Name: bizDeliveryZoneInDB.Name,
                                      Code: "ERROR_DELIVERY_ZONE_DELETE",
                                      Message: await I18NManager.translate( strLanguage, "Error in delivery zone delete." ),
                                      Mark: "376AFF9843DD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                      Details: "Method deleteByModel return false"
                                    }
                                  );

              }

            }
            else {

              result.errors.push(
                                  {
                                    Id: bizDeliveryZoneInDB.Id,
                                    Name: bizDeliveryZoneInDB.Name,
                                    Code: "ERROR_DELIVERY_ZONE_IS_NOT_EMPTY",
                                    Message: await I18NManager.translate( strLanguage, "The delivery zone has " + intEstablishmentCount + " establishment associated" ),
                                    Mark: "01897EB07B70" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                    Details: intEstablishmentCount
                                  }
                                );

            }

          }
          else {

            bizDeliveryZoneInDB.UpdatedBy = userSessionStatus.UserName;
            bizDeliveryZoneInDB.UpdatedAt = null;

            if ( strBulkOperation === "disableDeliveryZone" ) {

              bizDeliveryZoneInDB.DisabledBy = "1@" + userSessionStatus.UserName;

              await BIZDeliveryZoneService.disableEstablishmentAssociated( request.body.Id,
                                                                           userSessionStatus.UserName,
                                                                           SystemUtilities.getCurrentDateAndTime().format(),
                                                                           transaction,
                                                                           logger );

            }
            else if ( strBulkOperation === "enableDeliveryZone" ) {

              bizDeliveryZoneInDB.DisabledBy = "0";

            }

            bizDeliveryZoneInDB = await BIZDeliveryZoneService.createOrUpdate( ( bizDeliveryZoneInDB as any ).dataValues,
                                                                               true,
                                                                               transaction,
                                                                               logger );

            if ( bizDeliveryZoneInDB instanceof Error ) {

              const error = bizDeliveryZoneInDB as any;

              result.errors.push(
                                  {
                                    Id: bizDeliveryZoneInDB.Id,
                                    Name: bizDeliveryZoneInDB.Name,
                                    Code: "ERROR_UNEXPECTED",
                                    Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                                    Mark: "3C9D3A87CF5D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                    Details: await SystemUtilities.processErrorDetails( error ) //error
                                  }
                                );

            }
            else {

              result.data.push(
                                {
                                  Id: bizDeliveryZoneInDB.Id,
                                  Name: bizDeliveryZoneInDB.Name,
                                  Code: "SUCCESS_DELIVERY_ZONE_UPDATE",
                                  Message: await I18NManager.translate( strLanguage, "Success delivery zone update." ),
                                  Mark: "A3B5A9AF9D4E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                  Details: {
                                             DisabledBy: bizDeliveryZoneInDB.DisabledBy,
                                             DisabledAt: bizDeliveryZoneInDB.DisabledAt
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
                              Mark: "FE0907D0A73B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                              Details: await SystemUtilities.processErrorDetails( error ) //error
                            }
                          );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.bulkDeliveryZoneOperation.name;

      const strMark = "CDE532319425" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async disableBulkDeliveryZone( request: Request,
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

      const bulkResult = await this.bulkDeliveryZoneOperation( "disableDeliveryZone",
                                                                request,
                                                                currentTransaction,
                                                                logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = "SUCCESS_BULK_DELIVERY_ZONE_DISABLE";
        strMessage = await I18NManager.translate( strLanguage, "Success disable ALL delivery zones" );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = "ERROR_BULK_DELIVERY_ZONE_DISABLE";
        strMessage = await I18NManager.translate( strLanguage, "Cannot disable the delivery zones. Please check the errors and warnings section" );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = "CHECK_DATA_AND_ERRORS_AND_WARNINGS";
        strMessage = await I18NManager.translate( strLanguage, "Not ALL delivery zones has been disabled. Please check the data and errors and warnings section" );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: "6915A9FB37CF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.disableBulkDeliveryZone.name;

      const strMark = "317656E30B6A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async enableBulkDeliveryZone( request: Request,
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

      const bulkResult = await this.bulkDeliveryZoneOperation( "enableDeliveryZone",
                                                                request,
                                                                currentTransaction,
                                                                logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = "SUCCESS_BULK_DELIVERY_ZONE_ENABLE";
        strMessage = await I18NManager.translate( strLanguage, "Success enable ALL delivery zones" );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = "ERROR_BULK_DELIVERY_ZONE_ENABLE";
        strMessage = await I18NManager.translate( strLanguage, "Cannot enable the delivery zones. Please check the errors and warnings section" );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = "CHECK_DATA_AND_ERRORS_AND_WARNINGS";
        strMessage = await I18NManager.translate( strLanguage, "Not ALL delivery zones has been enabled. Please check the data and errors and warnings section" );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: "CB7C1C6BE7D6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.enableBulkDeliveryZone.name;

      const strMark = "92641BD190AA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteDeliveryZone( request: Request,
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

      let bizDeliveryZoneInDB = await BIZDeliveryZoneService.getById( request.query.id as string,
                                                                      currentTransaction,
                                                                      logger );

      if ( !bizDeliveryZoneInDB ) {

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_DELIVERY_ZONE_NOT_FOUND",
                   Message: await I18NManager.translate( strLanguage, "The delivery zone with id %s. Not found in database.", request.body.Id ),
                   Mark: "9A872A740CF2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_DELIVERY_ZONE_NOT_FOUND",
                               Message: await I18NManager.translate( strLanguage, "The delivery zone with id %s. Not found in database.", request.body.Id ),
                               Details: ""
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                  }

      }
      else if ( bizDeliveryZoneInDB instanceof Error ) {

        const error = bizDeliveryZoneInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "817407AC82E1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        const intEstablishmentCount = await BIZDeliveryZoneService.getEstablishmentCountAssociated( bizDeliveryZoneInDB.Id,
                                                                                                    transaction,
                                                                                                    logger );

        if ( intEstablishmentCount === 0 ) {

          const deleteResult = await BIZDeliveryZoneService.deleteByModel( bizDeliveryZoneInDB,
                                                                           currentTransaction,
                                                                           logger );

          if ( deleteResult instanceof Error ) {

            const error = deleteResult as any;

            result = {
                       StatusCode: 500, //Internal server error
                       Code: "ERROR_UNEXPECTED",
                       Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                       Mark: "A8D375B8DD6D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                       Code: "SUCCESS_DELIVERY_ZONE_DELETE",
                       Message: await I18NManager.translate( strLanguage, "Success delivery zone %s deleted.", bizDeliveryZoneInDB.Name ),
                       Mark: "C34FF8C3D5F2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                       Code: "ERROR_DELIVERY_ZONE_DELETE",
                       Message: await I18NManager.translate( strLanguage, "Error in delivery zone delete." ),
                       Mark: "5ED724F83EA3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
        else {

          result = {
                     StatusCode: 400, //Ok
                     Code: "ERROR_DELIVERY_ZONE_IS_NOT_EMPTY",
                     Message: await I18NManager.translate( strLanguage, "The delivery zone has " + intEstablishmentCount + " establishment associated" ),
                     Mark: "11592CB8CAF1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_DELIVERY_ZONE_IS_NOT_EMPTY",
                                 Message: await I18NManager.translate( strLanguage, "The delivery zone has " + intEstablishmentCount + " establishment associated" ),
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

      sourcePosition.method = this.name + "." + this.deleteDeliveryZone.name;

      const strMark = "1D8B54BBAD11" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteBulkDeliveryZone( request: Request,
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

      const bulkResult = await this.bulkDeliveryZoneOperation( "deleteDeliveryZone",
                                                                request,
                                                                currentTransaction,
                                                                logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = "SUCCESS_BULK_DELIVERY_ZONE_DELETE";
        strMessage = await I18NManager.translate( strLanguage, "Success delete ALL delivery zones" );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = "ERROR_BULK_DELIVERY_ZONE_DELETE";
        strMessage = await I18NManager.translate( strLanguage, "Cannot delete the delivery zones. Please check the errors and warnings section" );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = "CHECK_DATA_AND_ERRORS_AND_WARNINGS";
        strMessage = await I18NManager.translate( strLanguage, "Not ALL delivery zones has been deleted. Please check the data and errors and warnings section" );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: "B93292601959" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.deleteBulkDeliveryZone.name;

      const strMark = "8579D8AD5E42" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async searchDeliveryZone( request: Request,
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
                                                                            BIZDeliveryZone
                                                                          ],
                                                                          [
                                                                            "A",
                                                                          ]
                                                                        );

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "searchDeliveryZone",
                                                     {
                                                       SelectFields: strSelectField,
                                                     },
                                                     logger );

      const querystring = require( "querystring" );

      strSQL = request.query.where ? strSQL + "( " + querystring.unescape( request.query.where ) + " )" : strSQL + "( 1 )";

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
                                                                                            BIZDeliveryZone,
                                                                                          ],
                                                                                          [
                                                                                            "A",
                                                                                          ] );

      const convertedRows = [];

      for ( const currentRow of transformedRows ) {

        const tempModelData = await BIZDeliveryZone.convertFieldValues(
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
                 Mark: "56D326697A4F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.searchDeliveryZone.name;

      const strMark = "5AC2710F467A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async searchCountDeliveryZone( request: Request,
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
                                                     "searchCountDeliveryZone",
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
                 Mark: "E95F8A76B9EE" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.searchCountDeliveryZone.name;

      const strMark = "8B20999E89AA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
