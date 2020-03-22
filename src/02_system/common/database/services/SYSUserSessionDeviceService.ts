import cluster from 'cluster';

import CommonConstants from "../../CommonConstants";
import SystemConstants from "../../SystemContants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from '../../SystemUtilities';

import DBConnectionManager from "../../managers/DBConnectionManager";

import BaseService from "./BaseService";

import { SYSUserSessionDevice } from "../models/SYSUserSessionDevice";

const debug = require( 'debug' )( 'SYSUserSessionDeviceService' );

export default class SYSUserSessionDeviceService extends BaseService {

  static readonly _ID = "sysUserSessionDeviceService";

  static async getByToken( strToken: string,
                           strTimeZoneId: string,
                           transaction: any,
                           logger: any ): Promise<SYSUserSessionDevice> {

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

        where: { UserSessionStatusToken: strToken },
        transaction: currentTransaction,

      }

      result = await SYSUserSessionDevice.findOne( options );

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

      sourcePosition.method = SYSUserSessionDeviceService.name + "." + this.getByToken.name;

      const strMark = "33F37444D192" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async checkExistsByToken( strToken: string,
                                   transaction: any,
                                   logger: any ): Promise<boolean> {

    return await this.getByToken( strToken,
                                  null,
                                  transaction,
                                  logger ) !== null;

  }

  static async createOrUpdate( createOrUpdateData: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<SYSUserSessionDevice> {

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

        where: { "UserSessionStatusToken": createOrUpdateData.UserSessionStatusToken ? createOrUpdateData.UserSessionStatusToken : "" },
        transaction: currentTransaction,

      }

      let sysUserSessionDeviceInDB = await SYSUserSessionDevice.findOne( options );

      if ( sysUserSessionDeviceInDB === null ) {

        sysUserSessionDeviceInDB = await SYSUserSessionDevice.create(
                                                                      createOrUpdateData,
                                                                      { transaction: currentTransaction }
                                                                    );

      }
      else if ( bUpdate ) {

        if ( !createOrUpdateData.UpdatedBy ) {

          createOrUpdateData.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        }

        await sysUserSessionDeviceInDB.update( createOrUpdateData,
                                               options );

        sysUserSessionDeviceInDB = await SYSUserSessionDevice.findOne( options );

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = sysUserSessionDeviceInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "5A0D987D4B50" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteByModel( sysUserSessionDevice: SYSUserSessionDevice,
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

      await sysUserSessionDevice.destroy( options );

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

      const strMark = "5128BA19DBB7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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