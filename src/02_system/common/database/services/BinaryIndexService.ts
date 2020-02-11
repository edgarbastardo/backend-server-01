import cluster from 'cluster';

//import { Request } from 'express';

//import SystemConstants from "../../SystemContants";
import CommonConstants from "../../CommonConstants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

//import ConfigValueDataService from "./ConfigValueDataService";
import DBConnectionManager from "../../managers/DBConnectionManager";
import { BinaryIndex } from "../models/BinaryIndex";
import BaseService from "./BaseService";

const debug = require( 'debug' )( 'BinaryIndexService' );

export default class BinaryIndexService extends BaseService {

  static readonly _ID = "BinaryIndexService";

  static async createOrUpdate( strId: string,
                               data: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<any> {

    let result = { data: null, error: null };

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const options = {

        where: { "Id": strId },
        transaction: currentTransaction,

      }

      let binaryIndexInDB = await BinaryIndex.findOne( options );

      if ( CommonUtilities.isNullOrEmpty( binaryIndexInDB ) ) {

        binaryIndexInDB = await BinaryIndex.create(
                                                    data,
                                                    { transaction: currentTransaction }
                                                  );

      }
      else if ( bUpdate ) {

        const updateResult = await BinaryIndex.update( data,
                                                       options );

        if ( updateResult.length > 0 &&
             updateResult[ 0 ] >= 1 ) {

          binaryIndexInDB = await BinaryIndex.findOne( options );

        }

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

      result.data = binaryIndexInDB;

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

      if ( currentTransaction != null &&
           bApplyTansaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( ex ) {


        }

      }

      result.error = error;

    }

    return result;

  }

}