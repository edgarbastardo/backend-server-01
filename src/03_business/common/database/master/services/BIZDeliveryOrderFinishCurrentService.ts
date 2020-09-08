import cluster from "cluster";

//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

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
import { BIZDeliveryOrderFinish } from "../models/BIZDeliveryOrderFinish";
import { BIZDeliveryOrderFinishCurrent } from "../models/BIZDeliveryOrderFinishCurrent";

const debug = require( "debug" )( "BIZDeliveryOrderFinishCurrentService" );

export default class BIZDeliveryOrderFinishCurrentService extends BaseService {

  static readonly _ID = "bizDeliveryOrderFinishCurrentService";

  static async createOrUpdate( createOrUpdateData: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<BIZDeliveryOrderFinishCurrent> {

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
                 "DeliveryOrderId": createOrUpdateData.DeliveryOrderId ? createOrUpdateData.DeliveryOrderId : "",
                 "DeliveryOrderFinishId": createOrUpdateData.DeliveryOrderFinishId ? createOrUpdateData.DeliveryOrderFinishId : ""
               },
        transaction: currentTransaction,

      }

      let bizDeliveryOrderFinishCurrentInDB = await BIZDeliveryOrderFinishCurrent.findOne( options );

      if ( bizDeliveryOrderFinishCurrentInDB === null ) {

        bizDeliveryOrderFinishCurrentInDB = await BIZDeliveryOrderFinishCurrent.create(
                                                                                        createOrUpdateData,
                                                                                        {
                                                                                          transaction: currentTransaction
                                                                                        }
                                                                                      );

        options.where.DeliveryOrderId = bizDeliveryOrderFinishCurrentInDB.DeliveryOrderId;
        options.where.DeliveryOrderFinishId = bizDeliveryOrderFinishCurrentInDB.DeliveryOrderFinishId;

        bizDeliveryOrderFinishCurrentInDB = await BIZDeliveryOrderFinishCurrent.findOne( options );

      }
      else if ( bUpdate ) {

        if ( !createOrUpdateData.UpdatedBy ) {

          createOrUpdateData.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        }

        await bizDeliveryOrderFinishCurrentInDB.update( createOrUpdateData,
                                                        options );

        bizDeliveryOrderFinishCurrentInDB = await BIZDeliveryOrderFinishCurrent.findOne( options );

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = bizDeliveryOrderFinishCurrentInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "8C8C76DFC2A4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getByDeliveryOrderId( strDeliveryOrderId: string,
                                     transaction: any,
                                     logger: any ): Promise<BIZDeliveryOrderFinishCurrent> {

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
                 "DeliveryOrderId": strDeliveryOrderId ? strDeliveryOrderId : ""
               },
        transaction: currentTransaction,

      }

      result = await BIZDeliveryOrderFinishCurrent.findOne( options );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getByDeliveryOrderId.name;

      const strMark = "8C30372EF6DA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getByDeliveryOrderIdAndDeliveryOrderFinishId( strDeliveryOrderId: string,
                                                             strDeliveryOrderFinishId: string,
                                                             transaction: any,
                                                             logger: any ): Promise<BIZDeliveryOrderFinishCurrent> {

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
                 "DeliveryOrderId": strDeliveryOrderId ? strDeliveryOrderId : "",
                 "DeliveryOrderFinishId": strDeliveryOrderFinishId ? strDeliveryOrderFinishId : "",
               },
        transaction: currentTransaction,

      }

      result = await BIZDeliveryOrderFinishCurrent.findOne( options );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getByDeliveryOrderIdAndDeliveryOrderFinishId.name;

      const strMark = "EC41233B1CCD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteByModel( bizDeliveryOrderFinishCurrent: BIZDeliveryOrderFinishCurrent,
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

      await bizDeliveryOrderFinishCurrent.destroy( options );

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

      const strMark = "C31F4830AAB8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
