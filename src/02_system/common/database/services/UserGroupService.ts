import { UserGroup } from "../models/UserGroup";
import DBConnectionManager from "../../managers/DBConnectionManager";
import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";
import BaseService from "./BaseService";
import CommonConstants from "../../CommonConstants";

const debug = require( 'debug' )( 'UserGroupService' );

export default class UserGroupService extends BaseService {

  static readonly _ID = "UserGroupService";

  /*

  toDTO( instance: any, params: any, logger: any ): any {

    if ( CommonUtilities.isNotNullOrEmpty( instance ) ) {

      if ( CommonUtilities.isValidTimeZone( params.TimeZoneId ) ) {

        SystemUtilities.transformModelToTimeZone( instance,
                                                  params.TimeZoneId,
                                                  logger );

      }

      return instance.dataValues;

    }

  }
  */

  static async getById( strId: string,
                        strTimeZoneId: string,
                        transaction: any,
                        logger: any ): Promise<UserGroup> {

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

        where: { "Id": strId },
        transaction: currentTransaction,

      }

      result = await UserGroup.findOne( options );

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

      sourcePosition.method = this.name + "." + this.getById.name;

      const strMark = "E0F4B6151C3C";

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

    }

    return result;

  }

  static async getByName( strName: string,
                          strTimeZoneId: string,
                          transaction: any,
                          logger: any ): Promise<UserGroup> {

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

        where: { "Name": strName },
        transaction: currentTransaction,

      }

      result = await UserGroup.findOne( options );

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

      sourcePosition.method = this.name + "." + this.getByName.name;

      const strMark = "8E36301230F7";

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

    const userGroup = await this.getById( strId,
                                          null,
                                          transaction,
                                          logger );

    return userGroup ? userGroup.DisabledBy !== null || userGroup.DisabledAt !== null : false;

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

    const userGroup = await this.getByName( strName,
                                            null,
                                            transaction,
                                            logger );

    return userGroup ? userGroup.DisabledBy !== null || userGroup.DisabledAt !== null : false;

  }

  static async checkExpiredById( strId: string,
                                 transaction: any,
                                 logger: any ): Promise<boolean> {

    const userGroup = await this.getById( strId,
                                          null,
                                          transaction,
                                          logger );

    return userGroup ? SystemUtilities.isDateAndTimeAfter( userGroup.ExpireAt ) : false;

  }

  static async checkExpiredByName( strName: string,
                                    transaction: any,
                                    logger: any ): Promise<boolean> {

    const userGroup = await this.getByName( strName,
                                            null,
                                            transaction,
                                            logger );

    return userGroup ? SystemUtilities.isDateAndTimeAfter( userGroup.ExpireAt ) : false;

  }

}