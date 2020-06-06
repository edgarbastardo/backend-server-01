
import cluster from 'cluster';
import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,


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

    /*
  static async processDev000Example( request: Request,
                                     response: Response,
                                     transaction: any,
                                     logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by MiddlewareManager.middlewareSetContext function

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.processDev000Example.name;

      const strMark = "A92208DF733" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      const result = {
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
  */

  static async getEstablishmentsList( request: Request,
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

      sourcePosition.method = this.name + "." + this.getEstablishmentsList.name;

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

  static async startUpdateOrderTipsJob( request: Request,
                                        response: Response,
                                        logger: any ):Promise<any> {

    let result = null;

    /*
    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;
    */

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      strLanguage = context.Language;

      if ( await JobQueueManager.addJobToQueue( "UpdateOrderTipsJob",
                                                {
                                                  Id: request.body.Id,
                                                  EstablishmentId: request.body.EstablishmentId,
                                                  Date: request.body.Date,
                                                  Path: request.body.Path,
                                                },
                                                {
                                                  jobId: request.body.Id
                                                }, //{ jobId: SystemUtilities.getUUIDv4(), attempts: 0, timeout: 99999999, removeOnComplete: true, removeOnFail: true, backoff: 0 }, //{ repeat: { cron: '* * * * *' } },
                                                logger ) ) {

        result = {
                   StatusCode: 200, //Ok
                   Code: 'SUCCESS_JOB_CREATION',
                   Message: await I18NManager.translate( strLanguage, 'Sucess job creation for update order tip' ),
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
                   Message: await I18NManager.translate( strLanguage, 'Cannot create the job for update order tip' ),
                   LogId: null,
                   Mark: 'C9C15674A81D',
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_CANNOT_CREATE_THE_JOB',
                               Message: await I18NManager.translate( strLanguage, 'Cannot create the job for update order tip' ),
                               Details: 'JobQueueManager.addJobToQueue returned false'
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }

      /*
      const context = ( request as any ).context; //context is injected by MiddlewareManager.middlewareSetContext function

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //const strId = request.body.Id;

      const strSQL = DBConnectionManager.getStatement( "secondary",
                                                       "updateOrderTip",
                                                       request.body,
                                                       context.logger );

      const rows = await dbConnection.query( strSQL,{
                                                      raw: true,
                                                      type: QueryTypes.UPDATE,
                                                      transaction: currentTransaction
                                                    } );

      result = {
                 StatusCode: 200, //Ok
                 Code: 'SUCCESS_UPDATE_ORDER_TIP',
                 Message: await I18NManager.translate( strLanguage, 'Sucess update order tip' ),
                 Mark: '8F6D8B8A63B4' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: false,
                 Errors: [],
                 Warnings: [],
                 Count: 1,
                 Data: [
                         rows
                       ]
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
      */

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.startUpdateOrderTipsJob.name;

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

      /*
      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {

        }

      }
      */

    }

    return result;

  }

  static async getUpdateOrderTipsJobStatus( request: Request,
                                            response: Response,
                                            logger: any ):Promise<any> {

    let result = null;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      strLanguage = context.Language;

      //

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getUpdateOrderTipsJobStatus.name;

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

}
