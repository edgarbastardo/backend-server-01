import cluster from "cluster";

import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import CommonConstants from "../../../../../02_system/common/CommonConstants";
import SystemConstants from "../../../../../02_system/common/SystemContants";

import CommonUtilities from "../../../../../02_system/common/CommonUtilities";
import SystemUtilities from "../../../../../02_system/common/SystemUtilities";

import BaseService from "../../../../../02_system/common/database/master/services/BaseService";

import DBConnectionManager from "../../../../../02_system/common/managers/DBConnectionManager";

import { SYSUser } from "../../../../../02_system/common/database/master/models/SYSUser";

//import { BIZDeliveryZone } from "../models/BIZDeliveryZone";
import { BIZDeliveryOrder } from "../models/BIZDeliveryOrder";
import { BIZDriverRoute } from "../models/BIZDriverRoute";
import { BIZOrigin } from "../models/BIZOrigin";
import { BIZDestination } from "../models/BIZDestination";

const debug = require( "debug" )( "BIZDeliveryOrderService" );

export default class BIZDeliveryOrderService extends BaseService {

  static readonly _ID = "bizDeliveryOrderService";

  static async createOrUpdate( createOrUpdateData: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<BIZDeliveryOrder> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { "Id": createOrUpdateData.Id ? createOrUpdateData.Id : "" },
        transaction: currentTransaction,
        include: [
                   {
                     model: BIZDriverRoute,
                   },
                   {
                     model: BIZOrigin,
                   },
                   {
                     model: BIZDestination,
                   },
                   {
                     model: SYSUser,
                   },
                 ]

      }

      let bizDeliveryOrderInDB = await BIZDeliveryOrder.findOne( options );

      if ( bizDeliveryOrderInDB === null ) {

        bizDeliveryOrderInDB = await BIZDeliveryOrder.create(
                                                              createOrUpdateData,
                                                              {
                                                                transaction: currentTransaction,
                                                              }
                                                            );

        options.where.Id = bizDeliveryOrderInDB.Id;

        bizDeliveryOrderInDB = await BIZDeliveryOrder.findOne( options );

      }
      else if ( bUpdate ) {

        if ( !createOrUpdateData.UpdatedBy ) {

          createOrUpdateData.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        }

        await bizDeliveryOrderInDB.update( createOrUpdateData,
                                           options );

        bizDeliveryOrderInDB = await BIZDeliveryOrder.findOne( options );

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = bizDeliveryOrderInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "621C682F4534" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getById( strId: string,
                        transaction: any,
                        logger: any ): Promise<BIZDeliveryOrder> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { "Id": strId ? strId : "" },
        transaction: currentTransaction,
        include: [
                   {
                     model: BIZDriverRoute,
                   },
                   {
                     model: BIZOrigin,
                   },
                   {
                     model: BIZDestination,
                   },
                   {
                     model: SYSUser,
                   }
                 ]

      }

      let bizDeliveryOrderInDB = await BIZDeliveryOrder.findOne( options );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = bizDeliveryOrderInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getById.name;

      const strMark = "98CE5B18BEAB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteByModel( bizDeliveryOrder: BIZDeliveryOrder,
                              transaction: any,
                              logger: any ): Promise<boolean|Error> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        transaction: currentTransaction,

      }

      await bizDeliveryOrder.destroy( options );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.deleteByModel.name;

      const strMark = "A7D5C159BAD8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getActiveOrderByDriverId( strDriverId: string,
                                         transaction: any,
                                         logger: any ): Promise<any> {

    let result = [];

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "getActiveOrderByDriverId",
                                                     {
                                                       DriverId: strDriverId,
                                                     },
                                                     logger );

      result = await dbConnection.query( strSQL,
                                         {
                                           raw: true,
                                           type: QueryTypes.SELECT,
                                           transaction: currentTransaction
                                         } );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getActiveOrderByDriverId.name;

      const strMark = "23D3A89C1DDA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getCountActiveDeliveryOrdersByDriverId( strDriverId: string,
                                                       transaction: any,
                                                       logger: any ): Promise<number> {

    let intResult = -1;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "getCountActiveOrderByDriverId",
                                                     {
                                                       DriverId: strDriverId,
                                                     },
                                                     logger );

      const rows = await dbConnection.query( strSQL,
                                             {
                                               raw: true,
                                               type: QueryTypes.SELECT,
                                               transaction: currentTransaction
                                             } );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      intResult = rows.length > 0 ? rows[ 0 ].Count: 0;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getCountActiveDeliveryOrdersByDriverId.name;

      const strMark = "56AE184C7541" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      intResult = error;

    }

    return intResult;

  }

  static async getDeliveryOrdersInProgressStatusByDriverId( strDriverId: string,
                                                            transaction: any,
                                                            logger: any ): Promise<BIZDeliveryOrder[]> {

    let result = [];

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const strSelectFields = SystemUtilities.createSelectAliasFromModels(
                                                                           [
                                                                             BIZDeliveryOrder
                                                                           ],
                                                                           [
                                                                             "A",
                                                                           ]
                                                                         );

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "getDeliveryOrderInProgressStatusByDriverId",
                                                     {
                                                       SelectFields: strSelectFields,
                                                       DriverId: strDriverId
                                                     },
                                                     logger );

      const rows = await dbConnection.query( strSQL,
                                             {
                                               raw: true,
                                               type: QueryTypes.SELECT,
                                               transaction: currentTransaction
                                             } );

      const transformedRows = SystemUtilities.transformRowValuesToSingleRootNestedObject( rows,
                                                                                          [
                                                                                            BIZDeliveryOrder
                                                                                          ],
                                                                                          [
                                                                                            "A"
                                                                                          ] );

      result = transformedRows;

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getDeliveryOrdersInProgressStatusByDriverId.name;

      const strMark = "CA40613EA2B4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
