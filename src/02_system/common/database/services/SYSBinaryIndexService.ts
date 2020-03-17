import cluster from 'cluster';

//import { Request } from 'express';

//import SystemConstants from "../../SystemContants";
import CommonConstants from "../../CommonConstants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

import { SYSBinaryIndex } from "../models/SYSBinaryIndex";

//import ConfigValueDataService from "./ConfigValueDataService";
import DBConnectionManager from "../../managers/DBConnectionManager";

import BaseService from "./BaseService";
import SystemConstants from '../../SystemContants';

const debug = require( 'debug' )( 'SYSBinaryIndexService' );

export default class SYSBinaryIndexService extends BaseService {

  static readonly _ID = "sysBinaryIndexService";

  static async createOrUpdate( strId: string,
                               createOrUpdateData: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<SYSBinaryIndex> {

    let result = null; //{ data: null, error: null };

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

                        where: { "Id": strId },
                        transaction: currentTransaction,

                      }

      let sysBinaryIndexInDB = await SYSBinaryIndex.findOne( options );

      if ( sysBinaryIndexInDB === null ) {

        sysBinaryIndexInDB = await SYSBinaryIndex.create(
                                                          createOrUpdateData,
                                                          { transaction: currentTransaction }
                                                        );

      }
      else if ( bUpdate ) {

        if ( !createOrUpdateData.UpdatedBy ) {

          createOrUpdateData.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        }

        await sysBinaryIndexInDB.update( createOrUpdateData,
                                         options );

        //sysBinaryIndexInDB = await sysBinaryIndexInDB.save( { transaction: currentTransaction } );

        sysBinaryIndexInDB = await SYSBinaryIndex.findOne( options );

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      //result.data = sysBinaryIndexInDB;
      result = sysBinaryIndexInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "76F8246923EB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
        catch ( error ) {


        }

      }

      //result.error = error;
      result = error;

    }

    return result;

  }

  static async getById( strId: string,
                        strTimeZoneId: string,
                        transaction: any,
                        logger: any ): Promise<SYSBinaryIndex> {

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

        where: { Id: strId },
        transaction: currentTransaction,

      }

      result = await SYSBinaryIndex.findOne( options );

      if ( CommonUtilities.isValidTimeZone( strTimeZoneId ) ) {

        SystemUtilities.transformModelToTimeZone( result,
                                                  strTimeZoneId,
                                                  logger );

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = SYSBinaryIndex.name + "." + this.getById.name;

      const strMark = "DFF6905C51AD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteByModel( sysPerson: SYSBinaryIndex,
                              transaction: any,
                              logger: any ): Promise<Error|boolean> {

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

      await sysPerson.destroy( options );

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

      const strMark = "3C8859B40825" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async checkDisabledById( strId: string,
                                  transaction: any,
                                  logger: any ): Promise<boolean> {

    const sysBinaryIndex = await this.getById( strId,
                                               null,
                                               transaction,
                                               logger );

    return sysBinaryIndex ? sysBinaryIndex.DisabledBy !== null || sysBinaryIndex.DisabledAt !== null : false;

  }

  static async checkExpiredById( strId: string,
                                 transaction: any,
                                 logger: any ): Promise<boolean> {

    const sysBinaryIndex = await this.getById( strId,
                                               null,
                                               transaction,
                                               logger );

    return sysBinaryIndex ? SystemUtilities.isDateAndTimeAfter( sysBinaryIndex.ExpireAt ) : false;

  }

}