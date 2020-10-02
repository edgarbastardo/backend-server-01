import cluster from "cluster";
import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import path from "path";
import fs from "fs"; //Load the filesystem module

import {
  Request,
  Response
} from "express";

import CommonConstants from "../../../../02_system/common/CommonConstants";
import SystemUtilities from "../../../../02_system/common/SystemUtilities";
import CommonUtilities from "../../../../02_system/common/CommonUtilities";
import DBConnectionManager from "../../../../02_system/common/managers/DBConnectionManager";
import I18NManager from "../../../../02_system/common/managers/I18Manager";
import BaseService from "../../../../02_system/common/database/master/services/BaseService";
import ticket_imagesService from "../../../common/database/secondary/services/ticket_imagesService";

const debug = require( "debug" )( "Dev798ServicesTicketImageController" );

export default class Dev798ServicesTicketImageController extends BaseService {

  //Common business services

  static async createTicketImage( request: Request,
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

      const dbConnection = DBConnectionManager.getDBConnection( "secundary" );  //edgar preguntar si es master o secundary

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //let userSessionStatus = context.UserSessionStatus;

      let TicketImagesRules = {
                                id: [ "present", "string" ],
                                order_id: [ "required", "string" ],
                                image: [ "present", "string" ],
                                migrated: [ "present", "integer" ],
                                url: [ "present", "string" ],
                                lock: [ "present", "string" ],
                              };

      let validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                 TicketImagesRules,
                                                                 null,
                                                                 logger );

      if ( validator.passes() ) { //Validate request.body field values

        const ticketImageInDB = await ticket_imagesService.createOrUpdate( {
                                                                            id: request.body.id,
                                                                            order_id: request.body.order_id,
                                                                            image: request.body.image,
                                                                            migrated: request.body.migrated,
                                                                            url: request.body.url,
                                                                            lock: request.body.lock,
                                                                            created_at: null},
                                                                            false,
                                                                            currentTransaction,
                                                                            logger );

        if ( ticketImageInDB instanceof Error ) {

          const error = ticketImageInDB;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "2573352AAD9B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

          let modelData = ( ticketImageInDB as any ).dataValues;

          result = {
                    StatusCode: 200, //Ok
                    Code: "SUCCESS_TICKET_IMAGE_CREATE",
                    Message: await I18NManager.translate( strLanguage, "Success ticket_image create." ),
                    Mark: "39CE37312B5B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                   Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                   Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                   Mark: "364818CC4C3F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.createTicketImage.name;

      const strMark = "3E1B75987C95" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

static async deleteTicketImage( request: Request,
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

      const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //let userSessionStatus = context.UserSessionStatus;

      let ticketImageInDB = await ticket_imagesService.getById( request.query.id as string,
                                                                        currentTransaction,
                                                                        logger );

      if ( !ticketImageInDB ) {

        result = {
                    StatusCode: 404, //Not found
                    Code: "ERROR_TICKET_IMAGE_NOT_FOUND",
                    Message: await I18NManager.translate( strLanguage, "The ticket_image with id %s. Not found in database.", request.body.Id ),
                    Mark: "B149D7C7156A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                    LogId: null,
                    IsError: true,
                    Errors: [
                              {
                                Code: "ERROR_TICKET_IMAGE_NOT_FOUND",
                                Message: await I18NManager.translate( strLanguage, "The ticket_image with id %s. Not found in database.", request.body.Id ),
                                Details: ""
                              }
                            ],
                    Warnings: [],
                    Count: 0,
                    Data: []
                  }

      }
      else if ( ticketImageInDB instanceof Error ) {

        const error = ticketImageInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "0286F4A421C2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        const deleteResult = await ticket_imagesService.deleteByModel( ticketImageInDB,
                                                                          currentTransaction,
                                                                          logger );

        if ( deleteResult instanceof Error ) {

          const error = deleteResult as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "57E323C7ABBB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Code: "SUCCESS_TICKET_IMAGE_DELETE",
                     Message: await I18NManager.translate( strLanguage, "Success ticket_image %s deleted.", ticketImageInDB.id ),
                     Mark: "009C02909CC6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Code: "ERROR_TICKET_IMAGE_DELETE",
                     Message: await I18NManager.translate( strLanguage, "Error in ticket_image delete." ),
                     Mark: "53424E0C7851" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.deleteTicketImage.name;

      const strMark = "85C3ACB6686C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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