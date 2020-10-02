
import cluster from "cluster";
import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import path from "path";
import fs from "fs"; //Load the filesystem module

import {
  Request,
  Response
} from "express";
//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from "uuid/v4";
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

//import SystemConstants from "../../../02_system/common/SystemContants";
import CommonConstants from "../../../../02_system/common/CommonConstants";
import SystemUtilities from "../../../../02_system/common/SystemUtilities";
import CommonUtilities from "../../../../02_system/common/CommonUtilities";
import DBConnectionManager from "../../../../02_system/common/managers/DBConnectionManager";
import I18NManager from "../../../../02_system/common/managers/I18Manager";
import BaseService from "../../../../02_system/common/database/master/services/BaseService";
import phoneService from "../../../common/database/secondary/services/phonesService";

const debug = require( "debug" )( "Dev798ServicesPhoneController" );

export default class Dev798ServicesPhoneController extends BaseService {

  //Common business services

  static async createPhone( request: Request,
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

      let PhoneRules = {
                           id: [ "present", "string" ],
                           Phone: [ "required", "string" ],
                          };

      let validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                 PhoneRules,
                                                                 null,
                                                                 logger );

      if ( validator.passes() ) { //Validate request.body field values

        const PhoneInDB = await phoneService.createOrUpdate( {
                                                                    id: request.body.id,
                                                                    phone: request.body.phone,
                                                                    created_at: null,
                                                                    update_at:null},
                                                                    false,
                                                                    currentTransaction,
                                                                    logger );

        if ( PhoneInDB instanceof Error ) {

          const error = PhoneInDB;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "ECE00D3385F9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

          let modelData = ( PhoneInDB as any ).dataValues;

          result = {
                    StatusCode: 200, //Ok
                    Code: "SUCCESS_PHONE_CREATE",
                    Message: await I18NManager.translate( strLanguage, "Success phone create." ),
                    Mark: "E2B5B7B9EEC2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                   Mark: "1CBCCAD4D7DB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.createPhone.name;

      const strMark = "5F704A1548B8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

static async deletePhone( request: Request,
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

      let PhoneInDB = await phoneService.getById( request.query.id as string,
                                                                        currentTransaction,
                                                                        logger );

      if ( !PhoneInDB ) {

        result = {
                    StatusCode: 404, //Not found
                    Code: "ERROR_PHONE_NOT_FOUND",
                    Message: await I18NManager.translate( strLanguage, "The phone with id %s. Not found in database.", request.body.Id ),
                    Mark: "2DF37E44FA9E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                    LogId: null,
                    IsError: true,
                    Errors: [
                              {
                                Code: "ERROR_PHONE_NOT_FOUND",
                                Message: await I18NManager.translate( strLanguage, "The phone with id %s. Not found in database.", request.body.Id ),
                                Details: ""
                              }
                            ],
                    Warnings: [],
                    Count: 0,
                    Data: []
                  }

      }
      else if ( PhoneInDB instanceof Error ) {

        const error = PhoneInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "F67C1CE22D6D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        const deleteResult = await phoneService.deleteByModel( PhoneInDB,
                                                                          currentTransaction,
                                                                          logger );

        if ( deleteResult instanceof Error ) {

          const error = deleteResult as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "6B22922E8AA0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Code: "SUCCESS_PHONE_DELETE",
                     Message: await I18NManager.translate( strLanguage, "Success phone %s deleted.", PhoneInDB.id ),
                     Mark: "5550532CA02B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     Code: "ERROR_PHONE_DELETE",
                     Message: await I18NManager.translate( strLanguage, "Error in phone delete." ),
                     Mark: "0A500F31C905" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.deletePhone.name;

      const strMark = "3F8894D2CCBC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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