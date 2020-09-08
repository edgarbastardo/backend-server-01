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

const debug = require( "debug" )( "BIZDeliveryOrderFinishService" );

export default class BIZDeliveryOrderFinishService extends BaseService {

  static readonly _ID = "bizDeliveryOrderFinishService";

  static async createOrUpdate( createOrUpdateData: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<BIZDeliveryOrderFinish> {

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

      let bizDeliveryOrderFinishInDB = await BIZDeliveryOrderFinish.findOne( options );

      if ( bizDeliveryOrderFinishInDB === null ) {

        bizDeliveryOrderFinishInDB = await BIZDeliveryOrderFinish.create(
                                                                          createOrUpdateData,
                                                                          { transaction: currentTransaction }
                                                                        );

        options.where.Id = bizDeliveryOrderFinishInDB.Id;

        bizDeliveryOrderFinishInDB = await BIZDeliveryOrderFinish.findOne( options );

      }
      else if ( bUpdate ) {

        if ( !createOrUpdateData.UpdatedBy ) {

          createOrUpdateData.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        }

        await bizDeliveryOrderFinishInDB.update( createOrUpdateData,
                                                 options );

        bizDeliveryOrderFinishInDB = await BIZDeliveryOrderFinish.findOne( options );

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = bizDeliveryOrderFinishInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "BF102672935D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                        logger: any ): Promise<BIZDeliveryOrderFinish> {

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

      result = await BIZDeliveryOrderFinish.findOne( options );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getById.name;

      const strMark = "9C2E89FB398A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                                     logger: any ): Promise<BIZDeliveryOrderFinish[]> {

    let result = [];

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { "DeliveryOrderId": strDeliveryOrderId ? strDeliveryOrderId : "" },
        transaction: currentTransaction,

      }

      result = await BIZDeliveryOrderFinish.findAll( options );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getByDeliveryOrderId.name;

      const strMark = "5930073ACAF6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteByModel( bizDeliveryOrderFinish: BIZDeliveryOrderFinish,
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

      await bizDeliveryOrderFinish.destroy( options );

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

      const strMark = "1E99E7814ADD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
