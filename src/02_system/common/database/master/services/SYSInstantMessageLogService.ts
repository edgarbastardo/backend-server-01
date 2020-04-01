import cluster from 'cluster';

//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import CommonConstants from "../../../CommonConstants";
//import SystemConstants from "../../SystemContants";

import CommonUtilities from "../../../CommonUtilities";
import SystemUtilities from "../../../SystemUtilities";

import DBConnectionManager from '../../../managers/DBConnectionManager';

import BaseService from "./BaseService";
import { SYSInstantMessageLog } from "../models/SYSInstantMessageLog";

const debug = require( 'debug' )( 'SYSInstantMessageLogService' );

export default class SYSInstantMessageLogService extends BaseService {

  static readonly _ID = "sysInstantMessageLogService";

  static async create( createData: any,
                       transaction: any,
                       logger: any ): Promise<SYSInstantMessageLog | Error> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let sysInstantMessageLog = await SYSInstantMessageLog.create(
                                                                    createData,
                                                                    {
                                                                      transaction: currentTransaction
                                                                    }
                                                                  );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = sysInstantMessageLog;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.create.name;

      const strMark = "1006BB186CA4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

}