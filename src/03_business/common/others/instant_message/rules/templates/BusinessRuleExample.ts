import cluster from 'cluster';

//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import CommonConstants from '../../../../../../02_system/common/CommonConstants';

import CommonUtilities from '../../../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../../../02_system/common/SystemUtilities';

import DBConnectionManager from '../../../../../../02_system/common/managers/DBConnectionManager';
import I18NManager from '../../../../../../02_system/common/managers/I18Manager';

const debug = require( 'debug' )( 'BusinessRuleExample' );

export default class BusinessRuleExample {

  static readonly _ID = "BusinessRuleExample";

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

      sourcePosition.method = BusinessRuleExample.name + "." + this.check.name;

      const strMark = "8A59AD9E4675" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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