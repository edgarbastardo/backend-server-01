import cluster from "cluster";

//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import {
  Request,
  Response
} from "express";

import CommonConstants from "../../../02_system/common/CommonConstants";

import SystemUtilities from "../../../02_system/common/SystemUtilities";
import CommonUtilities from "../../../02_system/common/CommonUtilities";

import DBConnectionManager from "../../../02_system/common/managers/DBConnectionManager";
import I18NManager from "../../../02_system/common/managers/I18Manager";

import BaseService from "../../../02_system/common/database/master/services/BaseService";
import { BIZDeliveryOrder } from "../../common/database/master/models/BIZDeliveryOrder";
import BIZDeliveryOrderService from "../../common/database/master/services/BIZDeliveryOrderService";
import { BIZDeliveryOrderImage } from "../../common/database/master/models/BIZDeliveryOrderImage";
import BIZDeliveryOrderImageService from "../../common/database/master/services/BIZDeliveryOrderImageService";

const debug = require( "debug" )( "Dev007ServicesDriverDeliveryOrderImageController" );

export default class Dev007ServicesDriverDeliveryOrderImageController extends BaseService {

  //Common business services

  static async getDeliveryOrderImageList( request: Request,
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

      let bizDeliveryOrderInDB = await BIZDeliveryOrderService.getById( request.query.Id as string,
                                                                        currentTransaction,
                                                                        logger );

      if ( bizDeliveryOrderInDB instanceof Error ) {

        const error = bizDeliveryOrderInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "0E48A3C6674F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
      else if ( !bizDeliveryOrderInDB ) {

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_DELIVERY_ORDER_NOT_FOUND",
                   Message: await I18NManager.translate( strLanguage, "The delivery order with id %s. Not found in database.", request.body.EstablishmentId ),
                   Mark: "488D431739CF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_DELIVERY_ORDER_NOT_FOUND",
                               Message: await I18NManager.translate( strLanguage, "The delivery order with id %s. Not found in database.", request.body.EstablishmentId ),
                               Details: ""
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( bizDeliveryOrderInDB.UserId !== userSessionStatus.UserId ) {

        result = {
                   StatusCode: 403, //Fobidden
                   Code: "ERROR_DRIVER_NOT_ASSIGNED_TO_ORDER",
                   Message: await I18NManager.translate( strLanguage, "The delivery order with id %s. Not is not assigned to you.", request.body.Id ),
                   Mark: "4DBFF2D71374" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_DRIVER_NOT_ASSIGNED_TO_ORDER",
                               Message: await I18NManager.translate( strLanguage, "The delivery order with id %s. Not is not assigned to you.", request.body.Id ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else {

        const bizDeliveryOrderImageList = await BIZDeliveryOrderImageService.getByDeliveryOrderId( request.query.Id as string,
                                                                                                   currentTransaction,
                                                                                                   logger );

        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_GET_DELIVERY_ORDER_IMAGE_LIST",
                   Message: await I18NManager.translate( strLanguage, "" ),
                   Mark: "800EA54A92AC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: bizDeliveryOrderImageList.length,
                   Data: bizDeliveryOrderImageList
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

      sourcePosition.method = this.name + "." + this.getDeliveryOrderImageList.name;

      const strMark = "B9D024610C48" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async createDeliveryOrderImage( request: Request,
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

      let deliveryOrderRules = {
                                 DeliveryOrderId: [ "required", "string", "min:36" ],
                                 Title: [ "required", "string" ],
                                 Image: [ "required", "string", "min:36" ],
                                 Comment: [ "present", "string" ],
                               };

      let validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                 deliveryOrderRules,
                                                                 null,
                                                                 logger );

      if ( validator.passes() ) { //Validate request.body field values

        const bizDeliveryOrderInDB = await BIZDeliveryOrderService.getById( request.body.DeliveryOrderId,
                                                                            currentTransaction,
                                                                            logger );

        if ( bizDeliveryOrderInDB instanceof Error ) {

          const error = bizDeliveryOrderInDB as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "6B6B7206A46E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
        else if ( !bizDeliveryOrderInDB ) {

          result = {
                     StatusCode: 404, //Not found
                     Code: "ERROR_DELIVERY_ORDER_NOT_FOUND",
                     Message: await I18NManager.translate( strLanguage, "The delivery order with id %s. Not found in database.", request.body.DeliveryOrderId ),
                     Mark: "313AE9965D36" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_DELIVERY_ORDER_NOT_FOUND",
                                 Message: await I18NManager.translate( strLanguage, "The delivery order with id %s. Not found in database.", request.body.DeliveryOrderId ),
                                 Details: ""
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else if ( bizDeliveryOrderInDB.UserId !== userSessionStatus.UserId ) {

          result = {
                     StatusCode: 403, //Fobidden
                     Code: "ERROR_DRIVER_NOT_ASSIGNED_TO_ORDER",
                     Message: await I18NManager.translate( strLanguage, "The delivery order with id %s. Not is not assigned to you.", request.body.DeliveryOrderId ),
                     Mark: "34BDA19237ED" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_DRIVER_NOT_ASSIGNED_TO_ORDER",
                                 Message: await I18NManager.translate( strLanguage, "The delivery order with id %s. Not is not assigned to you.", request.body.DeliveryOrderId ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else {

          const bizDeliveryOrderImageInDB = await BIZDeliveryOrderImageService.createOrUpdate(
                                                                                               {
                                                                                                 DeliveryOrderId: request.body.DeliveryOrderId,
                                                                                                 Title: request.body.Title,
                                                                                                 Image: request.body.Image,
                                                                                                 Comment: request.body.Comment,
                                                                                                 CreatedBy: userSessionStatus.UserName
                                                                                               },
                                                                                               true,
                                                                                               currentTransaction,
                                                                                               logger
                                                                                             );

          if ( bizDeliveryOrderImageInDB &&
               bizDeliveryOrderImageInDB instanceof Error === false ) {

            let modelData = ( bizDeliveryOrderImageInDB as any ).dataValues;

            const tempModelData = await BIZDeliveryOrderImage.convertFieldValues(
                                                                                  {
                                                                                    Data: modelData,
                                                                                    FilterFields: 1,
                                                                                    TimeZoneId: context.TimeZoneId,
                                                                                    Include: [
                                                                                               {
                                                                                                 model: BIZDeliveryOrder,
                                                                                               }
                                                                                             ],
                                                                                    Exclude: null,
                                                                                            /*
                                                                                            [
                                                                                              {
                                                                                                  model: SYSUser
                                                                                              }
                                                                                            ],
                                                                                            */
                                                                                    IncludeFields: {
                                                                                                     "bizDeliveryOrder": [
                                                                                                                           "Id",
                                                                                                                           "Kind",
                                                                                                                           "StatusSequence",
                                                                                                                           "StatusCode",
                                                                                                                           "StatusDescription",
                                                                                                                           "RoutePriority"
                                                                                                                         ]
                                                                                                   },
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
                       Code: "SUCCESS_CREATE_DELIVERY_ORDER_IMAGE",
                       Message: await I18NManager.translate( strLanguage, "" ),
                       Mark: "117F845A14A1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

            const error = bizDeliveryOrderImageInDB as any;

            result = {
                       StatusCode: 500, //Internal server error
                       Code: "ERROR_UNEXPECTED",
                       Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                       Mark: "36161D3CDCB7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        }

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                   Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                   Mark: "30D0523EDEFE" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.createDeliveryOrderImage.name;

      const strMark = "916918C43327" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async updateDeliveryOrderImage( request: Request,
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

      let deliveryOrderRules = {
                                 Id: [ "required", "string", "min:36" ],
                                 Title: [ "required", "string" ],
                                 Image: [ "required", "string", "min:36" ],
                                 Comment: [ "present", "string" ],
                               };

      let validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                 deliveryOrderRules,
                                                                 null,
                                                                 logger );

      if ( validator.passes() ) { //Validate request.body field values

        let bizDeliveryOrderImageInDB = await BIZDeliveryOrderImageService.getById( request.body.Id,
                                                                                    currentTransaction,
                                                                                    logger );

        if ( bizDeliveryOrderImageInDB instanceof Error ) {

          const error = bizDeliveryOrderImageInDB as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "54B7D5B9137E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
        else if ( !bizDeliveryOrderImageInDB ) {

          result = {
                     StatusCode: 404, //Not found
                     Code: "ERROR_DELIVERY_ORDER_IMAGE_NOT_FOUND",
                     Message: await I18NManager.translate( strLanguage, "The delivery order image with id %s. Not found in database.", request.body.Id ),
                     Mark: "E6C0E700654D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_DELIVERY_ORDER_IMAGE_NOT_FOUND",
                                 Message: await I18NManager.translate( strLanguage, "The delivery order image with id %s. Not found in database.", request.body.Id ),
                                 Details: ""
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else if ( bizDeliveryOrderImageInDB.bizDeliveryOrder.UserId != userSessionStatus.UserId ) {

          result = {
                     StatusCode: 403, //Fobidden
                     Code: "ERROR_DRIVER_NOT_ASSIGNED_TO_ORDER",
                     Message: await I18NManager.translate( strLanguage, "The delivery order with id %s. Not is not assigned to you.", bizDeliveryOrderImageInDB.bizDeliveryOrder.Id ),
                     Mark: "000B6CFB4CC7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_DRIVER_NOT_ASSIGNED_TO_ORDER",
                                 Message: await I18NManager.translate( strLanguage, "The delivery order with id %s. Not is not assigned to you.", bizDeliveryOrderImageInDB.bizDeliveryOrder.Id ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else {

          bizDeliveryOrderImageInDB.Title = request.body.Title;
          bizDeliveryOrderImageInDB.Image = request.body.Image;
          bizDeliveryOrderImageInDB.Comment = request.body.Comment;

          bizDeliveryOrderImageInDB = await BIZDeliveryOrderImageService.createOrUpdate(
                                                                                         ( bizDeliveryOrderImageInDB as any ).dataValues,
                                                                                         true,
                                                                                         currentTransaction,
                                                                                         logger
                                                                                       );

          if ( bizDeliveryOrderImageInDB &&
               bizDeliveryOrderImageInDB instanceof Error === false ) {

            let modelData = ( bizDeliveryOrderImageInDB as any ).dataValues;

            const tempModelData = await BIZDeliveryOrderImage.convertFieldValues(
                                                                                  {
                                                                                    Data: modelData,
                                                                                    FilterFields: 1,
                                                                                    TimeZoneId: context.TimeZoneId,
                                                                                    Include: [
                                                                                               {
                                                                                                 model: BIZDeliveryOrder,
                                                                                               }
                                                                                             ],
                                                                                    Exclude: null,
                                                                                             /*
                                                                                             [
                                                                                               {
                                                                                                  model: SYSUser
                                                                                               }
                                                                                             ],
                                                                                             */
                                                                                    IncludeFields: {
                                                                                                     "bizDeliveryOrder": [
                                                                                                                           "Id",
                                                                                                                           "Kind",
                                                                                                                           "StatusSequence",
                                                                                                                           "StatusCode",
                                                                                                                           "StatusDescription",
                                                                                                                           "RoutePriority"
                                                                                                                         ]
                                                                                                   },
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
                       Code: "SUCCESS_UPDATE_DELIVERY_ORDER_IMAGE",
                       Message: await I18NManager.translate( strLanguage, "" ),
                       Mark: "004E9D4DFCF2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

            const error = bizDeliveryOrderImageInDB as any;

            result = {
                       StatusCode: 500, //Internal server error
                       Code: "ERROR_UNEXPECTED",
                       Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                       Mark: "AD9C17321D49" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        }

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                   Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                   Mark: "13AF1F279D33" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.updateDeliveryOrderImage.name;

      const strMark = "E0AD9DE20FAF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteDeliveryOrderImage( request: Request,
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

      let bizDeliveryOrderImageInDB = await BIZDeliveryOrderImageService.getById( request.query.Id as string,
                                                                                  currentTransaction,
                                                                                  logger );

      if ( bizDeliveryOrderImageInDB instanceof Error ) {

        const error = bizDeliveryOrderImageInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "532DC5D9063B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
      else if ( !bizDeliveryOrderImageInDB ) {

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_DELIVERY_ORDER_IMAGE_NOT_FOUND",
                   Message: await I18NManager.translate( strLanguage, "The delivery order image with id %s. Not found in database.", request.query.Id ),
                   Mark: "56E68E11BB20" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_DELIVERY_ORDER_IMAGE_NOT_FOUND",
                               Message: await I18NManager.translate( strLanguage, "The delivery order image with id %s. Not found in database.", request.query.Id ),
                               Details: "bizDeliveryOrderImageInDB is null"
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( bizDeliveryOrderImageInDB.bizDeliveryOrder.UserId != userSessionStatus.UserId ) {

        result = {
                   StatusCode: 403, //Fobidden
                   Code: "ERROR_DRIVER_NOT_ASSIGNED_TO_ORDER",
                   Message: await I18NManager.translate( strLanguage, "The delivery order with id %s. Not is not assigned to you.", bizDeliveryOrderImageInDB.bizDeliveryOrder.Id ),
                   Mark: "623E8F9714C1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_DRIVER_NOT_ASSIGNED_TO_ORDER",
                               Message: await I18NManager.translate( strLanguage, "The delivery order with id %s. Not is not assigned to you.", bizDeliveryOrderImageInDB.bizDeliveryOrder.Id ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else {

        const deleteResult = await BIZDeliveryOrderImageService.deleteByModel( bizDeliveryOrderImageInDB,
                                                                               currentTransaction,
                                                                               logger );

        if ( deleteResult instanceof Error ) {

          const error = deleteResult as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "DD3CFC2E8F9D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Code: "SUCCESS_DELIVERY_ORDER_IMAGE_DELETE",
                     Message: await I18NManager.translate( strLanguage, "Success delivery order image with id %s deleted.", bizDeliveryOrderImageInDB.Id ),
                     Mark: "BEF1D6D336E2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Code: "ERROR_DELIVERY_ORDER_IMAGE_DELETE",
                     Message: await I18NManager.translate( strLanguage, "Error in delivery order image delete." ),
                     Mark: "F00C9D4C5794" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.deleteDeliveryOrderImage.name;

      const strMark = "52FF6C180EC1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
