import cluster from 'cluster';

//import moment = require("moment-timezone");

import CommonConstants from "../../CommonConstants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from '../../SystemUtilities';

//import { UserSessionStatus } from "../models/UserSessionStatus";
//import SystemConstants from "../../SystemContants";
import DBConnectionManager from "../../managers/DBConnectionManager";
import BaseService from "./BaseService";
import { UserSessionPersistent } from "../models/UserSessionPersistent";

const debug = require( 'debug' )( 'UserSessionPersistentService' );

export default class UserSessionPersistentService extends BaseService {

  static readonly _ID = "UserSessionPersistentService";

  static async getUserSessionPersistentByToken( strToken: string = "",
                                                transaction: any,
                                                logger: any ): Promise<UserSessionPersistent> {

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

        where: { Token: strToken },
        transaction: currentTransaction,

      }

      result = await UserSessionPersistent.findOne( options );

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getUserSessionPersistentByToken.name;

      const strMark = "1AEE003BC0F1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return result;

  }

}