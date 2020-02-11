import cluster from 'cluster';

import CommonConstants from "../../CommonConstants";
import SystemConstants from "../../SystemContants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from '../../SystemUtilities';

import { User } from "../models/User";
import { UserGroup } from "../models/UserGroup";
import { Person } from "../models/Person";

import DBConnectionManager from "../../managers/DBConnectionManager";
import BaseService from "./BaseService";

const debug = require( 'debug' )( 'UserService' );

export default class UserService extends BaseService {

  static readonly _ID = "UserService";

  static async getById( strId: string,
                        strTimeZoneId: string,
                        transaction: any,
                        logger: any ): Promise<User> {

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

        where: { Id: strId },
        transaction: currentTransaction,
        include: [
                   {
                     model: UserGroup,
                   },
                   {
                     model: Person,
                   }
                 ]

      }

      result = await User.findOne( options );

      if ( CommonUtilities.isValidTimeZone( strTimeZoneId ) ) {

        SystemUtilities.transformModelToTimeZone( result,
                                                  strTimeZoneId,
                                                  logger );

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = UserService.name + "." + this.getById.name;

      const strMark = "552640F5364C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
        catch ( error1 ) {


        }

      }

      result = error;

    }

    return result;

  }

  static async getByName( strName: string,
                          strTimeZoneId: string,
                          transaction: any,
                          logger: any ): Promise<User> {

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

        where: { Name: strName },
        transaction: currentTransaction,
        include: [
                   {
                     model: UserGroup,
                   },
                   {
                     model: Person,
                   }
                 ]

      }

      result = await User.findOne( options );

      if ( CommonUtilities.isValidTimeZone( strTimeZoneId ) ) {

        SystemUtilities.transformModelToTimeZone( result,
                                                  strTimeZoneId,
                                                  logger );

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = UserService.name + "." + this.getByName.name;

      const strMark = "E8DDEF95875E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
        catch ( error1 ) {


        }

      }

      result = error;

    }

    return result;

  }

  static async checkExistsById( strId: string,
                                transaction: any,
                                logger: any ): Promise<boolean> {

    return await this.getById( strId,
                               null,
                               transaction,
                               logger ) !== null;

  }

  static async checkDisabledById( strId: string,
                                  transaction: any,
                                  logger: any ): Promise<boolean> {

    const user = await this.getById( strId,
                                     null,
                                     transaction,
                                     logger );

    return user ? user.DisabledBy !== null || user.DisabledAt !== null : false;

  }

  static async checkExistsByName( strName: string,
                                  transaction: any,
                                  logger: any ): Promise<boolean> {

    return await this.getByName( strName,
                                 null,
                                 transaction,
                                 logger ) !== null;

  }

  static async checkDisabledByName( strName: string,
                                    transaction: any,
                                    logger: any ): Promise<boolean> {

    const user = await this.getByName( strName,
                                       null,
                                       transaction,
                                       logger );

    return user ? user.DisabledBy !== null || user.DisabledAt !== null : false;

  }

  static async checkExpiredById( strId: string,
                                 transaction: any,
                                 logger: any ): Promise<boolean> {

    const user = await this.getById( strId,
                                     null,
                                     transaction,
                                     logger );

    return user ? SystemUtilities.isDateAndTimeAfter( user.ExpireAt ) : false;

  }

  static async checkExpiredByName( strName: string,
                                    transaction: any,
                                    logger: any ): Promise<boolean> {

    const user = await this.getByName( strName,
                                       null,
                                       transaction,
                                       logger );

    return user ? SystemUtilities.isDateAndTimeAfter( user.ExpireAt ) : false;

  }

  static async createOrUpdate( createOrUpdateData: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<User> {

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

        where: { "Id": createOrUpdateData.Id ? createOrUpdateData.Id : "" },
        transaction: currentTransaction,

      }

      result = await User.findOne( options );

      if ( result === null ) {

        result = await User.create(
                                    createOrUpdateData,
                                    { transaction: currentTransaction }
                                  );

      }
      else if ( bUpdate ) {

        const currentValues =  createOrUpdateData; //( result as any ).dataValues;

        if ( CommonUtilities.isNullOrEmpty( currentValues.UpdatedBy ) ) {

          currentValues.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        }

        const updateResult = await User.update( currentValues,
                                                options );

        if ( updateResult.length > 0 &&
             updateResult[ 0 ] >= 1 ) {

          result = await User.findOne( options );

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

      const strMark = "B6EAD2FBE1A5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
        catch ( error1 ) {


        }

      }

      result = error;

    }

    return result;

  }

}