
import cluster from 'cluster';
import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import path from 'path';
import fs from 'fs'; //Load the filesystem module

import {
  Request,
  Response
} from 'express';
//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

//import SystemConstants from "../../../02_system/common/SystemContants";
import CommonConstants from "../../../02_system/common/CommonConstants";

import SystemUtilities from "../../../02_system/common/SystemUtilities";
import CommonUtilities from "../../../02_system/common/CommonUtilities";

import DBConnectionManager from '../../../02_system/common/managers/DBConnectionManager';
import BaseService from "../../../02_system/common/database/master/services/BaseService";
import I18NManager from "../../../02_system/common/managers/I18Manager";
import JobQueueManager from "../../../02_system/common/managers/JobQueueManager";

const debug = require( 'debug' )( 'Dev001ServicesController' );

export default class Dev001ServicesController extends BaseService {

  //Common business services

  static async getEstablishmentList( request: Request,
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

      const strSQL = DBConnectionManager.getStatement( "secondary", "getEstablishments", null, context.logger );

      const rows = await dbConnection.query( strSQL, {
                                                       raw: true,
                                                       type: QueryTypes.SELECT,
                                                       transaction: currentTransaction
                                                     } );

      result = {
                 StatusCode: 200, //Ok
                 Code: 'SUCCESS_GET_ESTABLISHMENTS_LIST',
                 Message: await I18NManager.translate( strLanguage, 'Sucess get the information' ),
                 Mark: 'FF2D5A3F83E6' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: false,
                 Errors: [],
                 Warnings: [],
                 Count: 1,
                 Data: rows
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

      sourcePosition.method = this.name + "." + this.getEstablishmentList.name;

      const strMark = "ED0D5D1FABC0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.LogId,
                 Mark: 'A141D683118A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

  static async startOrderTipUberUpdateJob( request: Request,
                                           response: Response,
                                           logger: any ):Promise<any> {

    let result = null;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      strLanguage = context.Language;

      if ( await JobQueueManager.addJobToQueue( "OrderTipUberUpdateJob",
                                                {
                                                  Id: request.body.Id,
                                                  EstablishmentId: request.body.EstablishmentId,
                                                  Date: request.body.Date,
                                                  Path: request.body.Path,
                                                  Language: strLanguage,
                                                  JobStartedBy: context.UserSessionStatus.UserName
                                                },
                                                {
                                                  jobId: request.body.Id
                                                }, //{ jobId: SystemUtilities.getUUIDv4(), attempts: 0, timeout: 99999999, removeOnComplete: true, removeOnFail: true, backoff: 0 }, //{ repeat: { cron: '* * * * *' } },
                                                logger ) ) {

        result = {
                   StatusCode: 200, //Ok
                   Code: 'SUCCESS_JOB_CREATION',
                   Message: await I18NManager.translate( strLanguage, 'Sucess job creation for order tip uber update' ),
                   Mark: 'F307A51174EC' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: 1,
                   Data: [
                           {
                             Id: request.body.Id
                           }
                         ]
                 };

      }
      else {

        result = {
                   StatusCode: 500, //Internal server error
                   Code: 'ERROR_CANNOT_CREATE_THE_JOB',
                   Message: await I18NManager.translate( strLanguage, 'Cannot create the job' ),
                   LogId: null,
                   Mark: 'C9C15674A81D',
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_CANNOT_CREATE_THE_JOB',
                               Message: await I18NManager.translate( strLanguage, 'Cannot create the job' ),
                               Details: 'JobQueueManager.addJobToQueue returned false'
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

      sourcePosition.method = this.name + "." + this.startOrderTipUberUpdateJob.name;

      const strMark = "4E8745E32647" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return result;

  }

  static async getJobStatus( request: Request,
                             response: Response,
                             logger: any ):Promise<any> {

    let result = null;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      strLanguage = context.Language;

      if ( request.query.Id ) {

        const strOutputJobPath = path.join( SystemUtilities.strBaseRootPath, "jobs/output/" + request.query.Id + "/" );

        let strOutputJobFile = "";

        if ( request.query.Output === "result" ) {

          strOutputJobFile = strOutputJobPath + request.query.Id + ".result";

        }
        else {

          strOutputJobFile = strOutputJobPath + request.query.Id + ".status";

        }

        if ( fs.existsSync( strOutputJobFile ) ) {

          let outputContent = fs.readFileSync( strOutputJobFile, "utf8" ) as any;

          const debugMark = debug.extend( '6BD49AF2E6BE' );

          //debugMark( "Result: [%s]", outputContent );

          if ( request.query.Output === "result" ) {

            outputContent = {

              result: outputContent

            };

          }
          else {

            let jsonStatusJob = CommonUtilities.parseJSON( outputContent, logger );

            if ( !jsonStatusJob ||
                Object.keys( jsonStatusJob ).length === 0 ) {

              jsonStatusJob = {
                                Progress: 0,
                                Total: -1,
                                Kind: "",
                                Status: ""
                              };

            }

            outputContent = jsonStatusJob;

          }

          result = {
                     StatusCode: 200, //Ok
                     Code: 'SUCCESS_GET_JOB_OUTPUT',
                     Message: await I18NManager.translate( strLanguage, 'Sucess get job output' ),
                     Mark: 'F9C63B69C3FF' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: 1,
                     Data: [
                             outputContent
                           ]
                   };

        }
        else {

          result = {
                     StatusCode: 404, //Bad request
                     Code: 'ERROR_JOB_ID_NOT_FOUND',
                     Message: await I18NManager.translate( strLanguage, 'The job with id not found' ),
                     Mark: '555DD8D4C4B8' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_JOB_ID_NOT_FOUND',
                                 Message: await I18NManager.translate( strLanguage, 'The job with id not found' ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: 'ERROR_FIELD_ID_MISSING',
                   Message: await I18NManager.translate( strLanguage, 'The field id is missing' ),
                   Mark: '5AA705EE0690' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_FIELD_ID_MISSING',
                               Message: await I18NManager.translate( strLanguage, 'The field is is missing' ),
                               Details: null
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

      sourcePosition.method = this.name + "." + this.getJobStatus.name;

      const strMark = "67236D6C9E05" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return result;

  }

  static async getDriverList( request: Request,
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

      const strSQL = DBConnectionManager.getStatement( "secondary", "getDrivers", null, context.logger );

      const rows = await dbConnection.query( strSQL, {
                                                       raw: true,
                                                       type: QueryTypes.SELECT,
                                                       transaction: currentTransaction
                                                     } );

      result = {
                 StatusCode: 200, //Ok
                 Code: 'SUCCESS_GET_DRIVERS_LIST',
                 Message: await I18NManager.translate( strLanguage, 'Sucess get the information' ),
                 Mark: '47BB5F21C2B6' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: false,
                 Errors: [],
                 Warnings: [],
                 Count: 1,
                 Data: rows
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

      sourcePosition.method = this.name + "." + this.getDriverList.name;

      const strMark = "CAF3637ADCE4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.LogId,
                 Mark: '3799619EDB99' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

  static async startBulkOrderCreateJob( request: Request,
                                        response: Response,
                                        logger: any ):Promise<any> {

    let result = null;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      strLanguage = context.Language;

      if ( await JobQueueManager.addJobToQueue( "BulkOrderCreateJob",
                                                {
                                                  Simulate: request.body.Simulate,
                                                  Id: request.body.Id,
                                                  EstablishmentId: request.body.EstablishmentId,
                                                  DriverId: request.body.DriverId,
                                                  CreatedAt: request.body.CreatedAt,
                                                  FileName: request.body.FileName,
                                                  Path: request.body.Path,
                                                  Language: strLanguage,
                                                  CheckAddressAndCustomer: request.body.CheckAddressAndCustomer,
                                                  Backend: request.body.Backend,
                                                  JobStartedBy: context.UserSessionStatus.UserName
                                                },
                                                {
                                                  jobId: SystemUtilities.getUUIDv4(), //request.body.Id
                                                }, //{ jobId: SystemUtilities.getUUIDv4(), attempts: 0, timeout: 99999999, removeOnComplete: true, removeOnFail: true, backoff: 0 }, //{ repeat: { cron: '* * * * *' } },
                                                logger ) ) {

        result = {
                   StatusCode: 200, //Ok
                   Code: 'SUCCESS_JOB_CREATION',
                   Message: await I18NManager.translate( strLanguage, 'Sucess job creation for bulk order create' ),
                   Mark: 'F13258318914' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: 1,
                   Data: [
                           {
                             Id: request.body.Id
                           }
                         ]
                 };

      }
      else {

        result = {
                   StatusCode: 500, //Internal server error
                   Code: 'ERROR_CANNOT_CREATE_THE_JOB',
                   Message: await I18NManager.translate( strLanguage, 'Cannot create the job' ),
                   LogId: null,
                   Mark: 'C69FBC40C312',
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_CANNOT_CREATE_THE_JOB',
                               Message: await I18NManager.translate( strLanguage, 'Cannot create the job' ),
                               Details: 'JobQueueManager.addJobToQueue returned false'
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

      sourcePosition.method = this.name + "." + this.startBulkOrderCreateJob.name;

      const strMark = "28A7E540D0E4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return result;

  }

}
