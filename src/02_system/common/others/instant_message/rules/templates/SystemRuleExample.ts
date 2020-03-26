import cluster from 'cluster';

import CommonConstants from '../../../../CommonConstants';

import CommonUtilities from '../../../../CommonUtilities';
import SystemUtilities from '../../../../SystemUtilities';

import DBConnectionManager from '../../../../managers/DBConnectionManager';
import I18NManager from '../../../../managers/I18Manager';
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

const debug = require( 'debug' )( 'SystemRuleExample' );

export default class SystemRuleExample {

  static readonly _ID = "SystemRuleExample";

  async check( userSessionStatus: any,
               jsonMessage: any,
               transaction: any,
               options: any,
               logger: any ): Promise<{
                                        IsError: boolean,
                                        StatusCode: number,
                                        Code: string,
                                        Message: string,
                                        Details: any
                                      }> {

    let result = {
                   IsError: false,
                   StatusCode: 200,
                   Code: "",
                   Message: "",
                   Details: null
                 };

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //Your logic here
      result.Code = "SUCCESS";

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = SystemRuleExample.name + "." + this.check.name;

      const strMark = "705D429B2EF3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

      result = {
                 IsError: true,
                 StatusCode: 500,
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( options.Language, 'Unexpected error. Please read the server log for more details.' ),
                 Details: await SystemUtilities.processErrorDetails( error ) //error
               };

    }

    return result;

  }

}