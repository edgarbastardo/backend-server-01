import cluster from 'cluster';

import CommonConstants from "../../CommonConstants";
import SystemConstants from "../../SystemContants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from '../../SystemUtilities';

//import { User } from "../models/User";
//import { UserGroup } from "../models/UserGroup";
import { SYSPerson } from "../models/SYSPerson";

import DBConnectionManager from "../../managers/DBConnectionManager";

import BaseService from "./BaseService";

const debug = require( 'debug' )( 'SYSPersonService' );

export default class SYSPersonService extends BaseService {

  static readonly _ID = "sysPersonService";

  static async getById( strId: string,
                        strTimeZoneId: string,
                        transaction: any,
                        logger: any ): Promise<SYSPerson> {

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

      result = await SYSPerson.findOne( options );

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

      sourcePosition.method = SYSPersonService.name + "." + this.getById.name;

      const strMark = "DC96C7888421" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                               logger: any ): Promise<SYSPerson> {

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

      result = await SYSPerson.findOne( options );

      if ( result === null ) {

        result = await SYSPerson.create(
                                         createOrUpdateData,
                                         { transaction: currentTransaction }
                                       );

      }
      else if ( bUpdate ) {

        const currentValues = createOrUpdateData; //( result as any ).dataValues;

        if ( CommonUtilities.isNullOrEmpty( currentValues.UpdatedBy ) ) {

          currentValues.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        }

        result = await SYSPerson.update( currentValues,
                                         options );

        if ( result.length > 0 &&
             result[ 0 ] >= 1 ) {

          result = await SYSPerson.findOne( options );

        }

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "7315FDCB28DA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteByModel( sysPerson: SYSPerson,
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

      const strMark = "E6C58D7739C5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  /*
  static readonly _ID = "User";

  getRelations(): any[] {

    return [
      { model: UserGroup },
      { model: Person },
    ];

  }

  toDTO( instance: any, params: any, logger: any ): any {

    if ( CommonUtilities.isNotNullOrEmpty( instance ) ) {

      delete ( instance as any ).dataValues[ "Password" ];

      if ( CommonUtilities.isValidTimeZone( params.TimeZoneId ) ) {

        SystemUtilities.transformModelToTimeZone( instance,
                                                  params.TimeZoneId,
                                                  logger );

        SystemUtilities.transformModelToTimeZone( instance.dataValues.sysUserGroup,
                                                  params.TimeZoneId,
                                                  logger );

        if ( CommonUtilities.isNotNullOrEmpty( instance.dataValues.sysPerson ) ) {

          SystemUtilities.transformModelToTimeZone( instance.dataValues.sysPerson,
                                                    params.TimeZoneId,
                                                    logger );

        }

      }

      return instance.dataValues;

    }

  }
  */

  /*
  static async cleanModel( instance : User ): Promise<any> {

    let result = null;

    if ( CommonUtilities.isNotNullOrEmpty( instance ) ) {

      delete ( instance as any ).dataValues[ "Password" ];

    }

    return result;

  }

  static async cleanData( data : any ): Promise<any> {

    let result = null;

    if ( CommonUtilities.isNotNullOrEmpty( data ) ) {

      delete data[ "Password" ];

    }

    return result;

  }
  */


}