
import cluster from 'cluster';

import {
  Request,
  Response
} from 'express';
//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

//import SystemConstants from "../../../02_system/common/SystemContants";
import CommonConstants from "../../../../02_system/common/CommonConstants";

import SystemUtilities from "../../../../02_system/common/SystemUtilities";
import CommonUtilities from "../../../../02_system/common/CommonUtilities";

import DBConnectionManager from '../../../../02_system/common/managers/DBConnectionManager';
import BaseService from "../../../../02_system/common/database/master/services/BaseService";
import I18NManager from "../../../../02_system/common/managers/I18Manager";

const debug = require( 'debug' )( 'Dev798ServicesController' );

export default class Dev798ServicesController extends BaseService {

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

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

// aqui necesito el codigo para hacer post















      //Custom logic code is here

      result = {
                 StatusCode: 200, //Ok
                 Code: 'SUCCESS_DEV798_EXAMPLE',
                 Message: await I18NManager.translate( strLanguage, 'Success get the information' ),
                 Mark: 'AE017C2830B1' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: false,
                 Errors: [],
                 Warnings: [],
                 Count: 1,
                 Data: [
                         {
                           Example: "Dev798"
                         }
                       ]
               };

      //Custom logic code is here

      //If everything is ok, turn on the flag and apply the transaction
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

      sourcePosition.method = this.name + "." + this.createTicketImage.name;

      const strMark = "71990E6BA49D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.logId,
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
