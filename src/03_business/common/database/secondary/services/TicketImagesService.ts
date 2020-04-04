import cluster from 'cluster';

import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import BaseService from '../../../../../02_system/common/database/master/services/BaseService';

import CommonConstants from "../../../../../02_system/common/CommonConstants";

import CommonUtilities from '../../../../../02_system/common/CommonUtilities';
import SystemUtilities from "../../../../../02_system/common/SystemUtilities";

import DBConnectionManager from '../../../../../02_system/common/managers/DBConnectionManager';
import { TicketImages } from '../models/TicketImages';
import SystemConstants from '../../../../../02_system/common/SystemContants';

//import { TicketImages } from "../models/TicketImages";

const debug = require( 'debug' )( 'TicketImageService' );

export default class TicketImagesService extends BaseService {

  static readonly _ID = "ticket_images";

  static async getLastTicketImages( transaction: any,
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

      let strSQL = DBConnectionManager.getStatement( "secondary",
                                                     "getLastTicketImages",
                                                     {
                                                       //
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

        result = rows;

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getLastTicketImages.name;

      const strMark = "A0B8E7D954CD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async createOrUpdate( createOrUpdateData: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<TicketImages> {

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

        where: { "id": createOrUpdateData.id ? createOrUpdateData.id : "" },
        transaction: currentTransaction,

      }

      let ticketImageInDB = await TicketImages.findOne( options );

      if ( ticketImageInDB === null ) {

        ticketImageInDB = await TicketImages.create(
                                                     createOrUpdateData,
                                                     { transaction: currentTransaction }
                                                   );

      }
      else if ( bUpdate ) {

        /*
        if ( !createOrUpdateData.UpdatedBy ) {

          createOrUpdateData.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        }
        */

        await ticketImageInDB.update( createOrUpdateData,
                                      options );

        ticketImageInDB = await TicketImages.findOne( options );

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = ticketImageInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "4D9B3158BF43" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async markLocked( ticketImageList: any[],
                           logger: any ): Promise<boolean|Error> {

    let bResult = false;

    let currentTransaction = null;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      for ( let intIndex = 0; intIndex < ticketImageList.length; intIndex++ ) {

        const updateResult = await this.createOrUpdate(
                                                        {
                                                          id: ticketImageList[ intIndex ].id,
                                                          lock: SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_05 )
                                                        },
                                                        true,
                                                        currentTransaction,
                                                        logger
                                                      );

        if ( updateResult instanceof Error ) {

          bResult = updateResult as any;
          break;

        }

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      bResult = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getLastTicketImages.name;

      const strMark = "A0B8E7D954CD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      bResult = error;

    }

    return bResult;

  }

}