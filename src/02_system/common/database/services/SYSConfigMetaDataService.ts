//import cluster from 'cluster';

//import SystemConstants from "../../SystemContants";

//import CommonUtilities from "../../CommonUtilities";
//import SystemUtilities from '../../SystemUtilities';

//import { SYSConfigMetaData } from "../models/SYSConfigMetaData";
//import { SYSUserGroup } from "../models/SYSUserGroup";

import BaseService from "./BaseService";

//import DBConnectionManager from "../../managers/DBConnectionManager";

//const debug = require( 'debug' )( 'SYSConfigMetaDataService' );

export default class SYSConfigMetaDataService extends BaseService {

  static readonly _ID = "sysConfigMetaDataService";

  /*
  static async createOrUpdate( createOrUpdateData: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<SYSConfigMetaData> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

                        where: { "Name": createOrUpdateData.Name },
                        transaction: currentTransaction,

                      }

      let sysConfigMetaDataInDB = await SYSConfigMetaData.findOne( options );

      if ( sysConfigMetaDataInDB === null ) {

        sysConfigMetaDataInDB = await SYSConfigMetaData.create(
                                                                createOrUpdateData,
                                                                { transaction: currentTransaction }
                                                              );

      }
      else if ( bUpdate ) {

        //const currentValues = ( sysConfigMetaDataInDB as any ).dataValues;

        if ( !createOrUpdateData.UpdatedBy ) {

          createOrUpdateData.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        }

        await sysConfigMetaDataInDB.update( createOrUpdateData,
                                            options );

        sysConfigMetaDataInDB = await SYSConfigMetaData.findOne( options );

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = sysConfigMetaDataInDB;

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

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

      result = error;

    }

    return result;

  }
  */

}