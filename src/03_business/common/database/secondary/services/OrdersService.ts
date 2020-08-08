import cluster from 'cluster';

import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import BaseService from '../../../../../02_system/common/database/master/services/BaseService';

import CommonConstants from "../../../../../02_system/common/CommonConstants";
import SystemConstants from '../../../../../02_system/common/SystemContants';

import CommonUtilities from '../../../../../02_system/common/CommonUtilities';
import SystemUtilities from "../../../../../02_system/common/SystemUtilities";

import DBConnectionManager from '../../../../../02_system/common/managers/DBConnectionManager';

//import { TicketImages } from '../models/TicketImages';
import { Orders } from '../models/Orders';

const debug = require( 'debug' )( 'OrdersService' );

export default class OrdersService extends BaseService {

  static readonly _ID = "orders_service";

  //Check the file src/01_database/05_query/secondary/mysql/BusinessQuery.ts to add more queries a centralized place
  //DBConnectionManager.getStatement( "secondary", "getLastTicketImages",

  //Every method call to diferent db tables

  static async getNewOrdersWithNoDriver( transaction: any,
                                         logger: any ): Promise<any[]|Error> {

    let result = [];

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let strSelectField = SystemUtilities.createSelectAliasFromModels(
                                                                        [
                                                                          Orders, //you must define the model see the import { Orders } from '../models/Orders'; in top of file
                                                                        ],
                                                                        [
                                                                          "A",
                                                                        ]
                                                                      );

      //strSelectField = strSelectField + ",B.created_at As B_created_at";

      let strSQL = DBConnectionManager.getStatement( "secondary",
                                                     "getNewOrdersWithNoDriver", //Check the file src/01_database/05_query/secondary/mysql/BusinessQuery.ts to add more queries a centralized place
                                                     {
                                                       SelectFields: strSelectField,
                                                       MaxRows: process.env.ODIN_ORDERS_MAX_ROWS ? parseInt( process.env.ODIN_ORDERS_MAX_ROWS ): 30
                                                     },
                                                     logger );

      const rows = await dbConnection.query( strSQL,
                                             {
                                               raw: true,
                                               type: QueryTypes.SELECT,
                                               transaction: currentTransaction
                                             } );

      if ( rows &&
           rows.length > 0 ) {

        const transformedRows = SystemUtilities.transformRowValuesToSingleRootNestedObject( rows,
                                                                                            [
                                                                                              Orders,
                                                                                              /* Fake model to avoid Squealize formal model definition
                                                                                              {
                                                                                                name: "orders",
                                                                                                rawAttributes : {
                                                                                                                  created_at: {
                                                                                                                                field:"created_at",
                                                                                                                                //fieldName:"created_at",
                                                                                                                                //type:"TIMESTAMP"
                                                                                                                              }
                                                                                                                }
                                                                                              }
                                                                                              */
                                                                                            ],
                                                                                            [
                                                                                              "A",
                                                                                              "B"
                                                                                            ] );

        result = transformedRows;

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getNewOrdersWithNoDriver.name;

      const strMark = "E62F2303A933" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = error;

    }

    return result;

  }

}
