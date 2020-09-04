import cluster from "cluster";

import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import CommonConstants from "../../../../../02_system/common/CommonConstants";
import SystemConstants from "../../../../../02_system/common/SystemContants";

import CommonUtilities from "../../../../../02_system/common/CommonUtilities";
import SystemUtilities from "../../../../../02_system/common/SystemUtilities";

import BaseService from "../../../../../02_system/common/database/master/services/BaseService";

import DBConnectionManager from "../../../../../02_system/common/managers/DBConnectionManager";

//import { SYSUser } from "../../../../../02_system/common/database/master/models/SYSUser";

//import { BIZDeliveryZone } from "../models/BIZDeliveryZone";
//import { BIZDeliveryOrder } from "../models/BIZDeliveryOrder";
//import { BIZDriverRoute } from "../models/BIZDriverRoute";
//import { BIZOrigin } from "../models/BIZOrigin";
//import { BIZDestination } from "../models/BIZDestination";
//import { BIZDeliveryOrderStatus } from "../models/BIZDeliveryOrderStatus";
import { BIZDeliveryOrderStatusStep } from "../models/BIZDeliveryOrderStatusStep";

const debug = require( "debug" )( "BIZDeliveryOrderStatusStepService" );

export default class BIZDeliveryOrderStatusStepService extends BaseService {

  static readonly _ID = "bizDeliveryOrderStatusStepService";

  static async createOrUpdate( createOrUpdateData: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<BIZDeliveryOrderStatusStep> {

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

      }

      let bizDeliveryOrderStatusStepInDB = await BIZDeliveryOrderStatusStep.findOne( options );

      if ( bizDeliveryOrderStatusStepInDB === null ) {

        bizDeliveryOrderStatusStepInDB = await BIZDeliveryOrderStatusStep.create(
                                                                                  createOrUpdateData,
                                                                                  { transaction: currentTransaction }
                                                                                );

        options.where.Id = bizDeliveryOrderStatusStepInDB.Id;

        bizDeliveryOrderStatusStepInDB = await BIZDeliveryOrderStatusStep.findOne( options );

      }
      else if ( bUpdate ) {

        if ( !createOrUpdateData.UpdatedBy ) {

          createOrUpdateData.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        }

        await bizDeliveryOrderStatusStepInDB.update( createOrUpdateData,
                                                     options );

        bizDeliveryOrderStatusStepInDB = await BIZDeliveryOrderStatusStep.findOne( options );

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = bizDeliveryOrderStatusStepInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "FE76A401D241" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                        logger: any ): Promise<BIZDeliveryOrderStatusStep> {

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

      }

      let bizDeliveryOrderStatusStepInDB = await BIZDeliveryOrderStatusStep.findOne( options );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = bizDeliveryOrderStatusStepInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getById.name;

      const strMark = "47E143730250" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteByModel( bizDeliveryOrderStatusStep: BIZDeliveryOrderStatusStep,
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

      await bizDeliveryOrderStatusStep.destroy( options );

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

      const strMark = "A9910FBDB087" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getDeliveryOrderCurrentStatusStepByKind( intKind: number,
                                                        intSequence: number,
                                                        transaction: any,
                                                        logger: any ): Promise<BIZDeliveryOrderStatusStep> {

    let result = null;

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
                                                                             BIZDeliveryOrderStatusStep
                                                                           ],
                                                                           [
                                                                             "A",
                                                                           ]
                                                                         );

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "getDeliveryOrderCurrentStatusStepByKind",
                                                     {
                                                       SelectFields: strSelectFields,
                                                       Kind: intKind,
                                                       Sequence: intSequence
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
                                                                                            BIZDeliveryOrderStatusStep
                                                                                          ],
                                                                                          [
                                                                                            "A"
                                                                                          ] );

      result = transformedRows[ 0 ];

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getDeliveryOrderCurrentStatusStepByKind.name;

      const strMark = "311772DC6C8D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getDeliveryOrderStepByKind( intKind: number,
                                           bFirst: boolean,
                                           bLast: boolean,
                                           bCanceled: boolean,
                                           transaction: any,
                                           logger: any ): Promise<BIZDeliveryOrderStatusStep> {

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

        where: {
                 "Kind": intKind ? intKind : -1,
                 DisabledBy: {
                               $is: null
                             },
                 DisabledAt: {
                               $is: null
                             }
               },
        transaction: currentTransaction,

      }

      if ( bFirst ) {

        options.where[ "First" ] = 1;

      }

      if ( bLast ) {

        options.where[ "Last" ] = 1;

      }

      if ( bCanceled ) {

        options.where[ "Canceled" ] = 1;

      }

      let bizDeliveryOrderStatusStepInDB = await BIZDeliveryOrderStatusStep.findOne( options );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = bizDeliveryOrderStatusStepInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getDeliveryOrderStepByKind.name;

      const strMark = "BD5F8E1743DF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getDeliveryOrderNextStatusStepByKind( intKind: number,
                                                     intSequence: number,
                                                     transaction: any,
                                                     logger: any ): Promise<BIZDeliveryOrderStatusStep> {

    let result = null;

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
                                                                             BIZDeliveryOrderStatusStep
                                                                           ],
                                                                           [
                                                                             "A",
                                                                           ]
                                                                         );

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "getDeliveryOrderNextStatusStepByKind",
                                                     {
                                                       SelectFields: strSelectFields,
                                                       Kind: intKind,
                                                       Sequence: intSequence
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
                                                                                            BIZDeliveryOrderStatusStep
                                                                                          ],
                                                                                          [
                                                                                            "A"
                                                                                          ] );

      result = transformedRows[ 0 ];

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getDeliveryOrderNextStatusStepByKind.name;

      const strMark = "B882E4C1E34C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getDeliveryOrderPreviousStatusStepByKind( intKind: number,
                                                         intSequence: number,
                                                         transaction: any,
                                                         logger: any ): Promise<BIZDeliveryOrderStatusStep> {

    let result = null;

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
                                                                             BIZDeliveryOrderStatusStep
                                                                           ],
                                                                           [
                                                                             "A",
                                                                           ]
                                                                         );

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "getDeliveryOrderPreviousStatusStepByKind",
                                                     {
                                                       SelectFields: strSelectFields,
                                                       Kind: intKind,
                                                       Sequence: intSequence
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
                                                                                            BIZDeliveryOrderStatusStep
                                                                                          ],
                                                                                          [
                                                                                            "A"
                                                                                          ] );

      result = transformedRows[ 0 ];

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getDeliveryOrderPreviousStatusStepByKind.name;

      const strMark = "8AA837925FCF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
