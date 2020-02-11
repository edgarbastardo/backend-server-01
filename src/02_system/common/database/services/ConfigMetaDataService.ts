import cluster from 'cluster';

import SystemConstants from "../../SystemContants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from '../../SystemUtilities';

import BaseService from "./BaseService";
import { ConfigMetaData } from "../models/ConfigMetaData";
import { UserGroup } from "../models/UserGroup";
import DBConnectionManager from "../../managers/DBConnectionManager";

const debug = require( 'debug' )( 'ConfigMetaDataService' );

export default class ConfigMetaDataService extends BaseService {

  static readonly _ID = "ConfigMetaDataService";

  /*
  static async createOrUpdate( configMetaDataToCreate: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<ConfigMetaData> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const options = {

        where: { "Name": configMetaDataToCreate.Name },
        transaction: currentTransaction,
        //context: { TimeZoneId: "America/Los_Angeles" }

      }

      let configMetaDataInDB = await ConfigMetaData.findOne( options );

      if ( CommonUtilities.isNullOrEmpty( configMetaDataInDB ) ) {

        result = await ConfigMetaData.create(
                                              configMetaDataToCreate,
                                              { transaction: currentTransaction }
                                            );

      }
      else if ( bUpdate ) {

        const currentValues = ( configMetaDataInDB as any ).dataValues;

        if ( CommonUtilities.isNullOrEmpty( currentValues.UpdatedBy ) ) {

          currentValues.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        }

        const updateResult = await ConfigMetaData.update( currentValues,
                                                          options );

        if ( updateResult.length > 0 &&
             updateResult[ 0 ] >= 1 ) {

          result = await ConfigMetaData.findOne( options );

        }

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "A1B775C96F91" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = error;

    }

    return result;

  }
  */

}