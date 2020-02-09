
import SystemConstants from "../../../02_system/common/SystemContants";
import CommonConstants from "../../../02_system/common/CommonConstants";

import SystemUtilities from "../../../02_system/common/SystemUtilities";
import CommonUtilities from "../../../02_system/common/CommonUtilities";

import { Request, Response } from 'express';

//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import DBConnectionManager from '../../../02_system/common/managers/DBConnectionManager';
import BaseService from "../../../02_system/common/database/services/BaseService";
import I18NManager from "../../../02_system/common/managers/I18Manager";

const debug = require( 'debug' )( 'Dev000ServicesController' );

export default class Dev000ServicesController extends BaseService {

    //Common business services

  static async processDev000Example( request: Request,
                                     response: Response,
                                     transaction: any,
                                     logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by MiddlewareManager.middlewareSetContext function

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      //

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.processDev000Example.name;

      const strMark = "A92208DF733";

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
                       StatusCode: 500,
                       Code: 'ERROR_UNEXPECTED',
                       Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                       LogId: error.LogId,
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