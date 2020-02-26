import cluster from 'cluster';

import CommonConstants from "../../CommonConstants";
import SystemConstants from "../../SystemContants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from '../../SystemUtilities';

import { SYSUser } from "../models/SYSUser";
import { SYSUserGroup } from "../models/SYSUserGroup";
import { SYSPerson } from "../models/SYSPerson";

import DBConnectionManager from "../../managers/DBConnectionManager";

import BaseService from "./BaseService";

const debug = require( 'debug' )( 'SYSUserService' );

export default class SYSUserService extends BaseService {

  static readonly _ID = "sysUserService";

  static async getBy( by: { Id: string, ShortId: string, Name: string },
                      strTimeZoneId: string,
                      transaction: any,
                      logger: any ): Promise<SYSUser> {

    let result: SYSUser = null;

    if ( by.Id ) {

      result = await this.getById( by.Id,
                                   strTimeZoneId,
                                   transaction,
                                   logger );

    }

    if ( result === null &&
         by.ShortId ) {

      result = await this.getByShortId( by.ShortId,
                                        strTimeZoneId,
                                        transaction,
                                        logger );

    }

    if ( result === null &&
         by.Name ) {

      result = await this.getByName( by.Name,
                                     strTimeZoneId,
                                     transaction,
                                     logger );

    }

    return result;

  }

  static async getById( strId: string,
                        strTimeZoneId: string,
                        transaction: any,
                        logger: any ): Promise<SYSUser> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { Id: strId },
        transaction: currentTransaction,
        include: [
                   {
                     model: SYSUserGroup,
                   },
                   {
                     model: SYSPerson,
                   }
                 ]

      }

      result = await SYSUser.findOne( options );

      if ( CommonUtilities.isValidTimeZone( strTimeZoneId ) ) {

        SystemUtilities.transformModelToTimeZone( result,
                                                  strTimeZoneId,
                                                  logger );

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = SYSUserService.name + "." + this.getById.name;

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

  static async getByShortId( strShortId: string,
                             strTimeZoneId: string,
                             transaction: any,
                             logger: any ): Promise<SYSUser> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { ShortId: strShortId },
        transaction: currentTransaction,
        include: [
                   {
                     model: SYSUserGroup,
                   },
                   {
                     model: SYSPerson,
                   }
                 ]

      }

      result = await SYSUser.findOne( options );

      if ( CommonUtilities.isValidTimeZone( strTimeZoneId ) ) {

        SystemUtilities.transformModelToTimeZone( result,
                                                  strTimeZoneId,
                                                  logger );

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = SYSUserService.name + "." + this.getByShortId.name;

      const strMark = "6B21762E11A5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getByName( strName: string,
                          strTimeZoneId: string,
                          transaction: any,
                          logger: any ): Promise<SYSUser> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { Name: strName },
        transaction: currentTransaction,
        include: [
                   {
                     model: SYSUserGroup,
                   },
                   {
                     model: SYSPerson,
                   }
                 ]

      }

      result = await SYSUser.findOne( options );

      if ( CommonUtilities.isValidTimeZone( strTimeZoneId ) ) {

        SystemUtilities.transformModelToTimeZone( result,
                                                  strTimeZoneId,
                                                  logger );

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = SYSUserService.name + "." + this.getByName.name;

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

    const sysUser = await this.getById( strId,
                                        null,
                                        transaction,
                                        logger );

    return sysUser &&
           ( sysUser.DisabledBy ||
             sysUser.DisabledAt ) ? true: false;

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

    const sysUser = await this.getByName( strName,
                                          null,
                                          transaction,
                                          logger );

    return sysUser &&
           ( sysUser.DisabledBy ||
             sysUser.DisabledAt ) ? true: false;

  }

  static async checkExpiredById( strId: string,
                                 transaction: any,
                                 logger: any ): Promise<boolean> {

    const sysUser = await this.getById( strId,
                                        null,
                                        transaction,
                                        logger );

    return sysUser ? SystemUtilities.isDateAndTimeAfter( sysUser.ExpireAt ) : false;

  }

  static async checkExpiredByName( strName: string,
                                   transaction: any,
                                   logger: any ): Promise<boolean> {

    const sysUser = await this.getByName( strName,
                                          null,
                                          transaction,
                                          logger );

    return sysUser ? SystemUtilities.isDateAndTimeAfter( sysUser.ExpireAt ) : false;

  }

  static checkDisabled( sysUser: SYSUser ): boolean {

    return sysUser &&
           ( sysUser.DisabledBy ||
             sysUser.DisabledAt ) ? true: false;

  }

  static checkExpired( sysUser: SYSUser ): boolean {

    return sysUser ? SystemUtilities.isDateAndTimeAfter( sysUser.ExpireAt ) : false;

  }

  static checkDisabledOrExpired( sysUser: SYSUser ): boolean {

    return sysUser &&
           ( sysUser.DisabledBy ||
             sysUser.DisabledAt ||
           SystemUtilities.isDateAndTimeAfter( sysUser.ExpireAt ) ) ? true: false;

  }

  static async createOrUpdate( createOrUpdateData: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<SYSUser> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { "Id": createOrUpdateData.Id ? createOrUpdateData.Id : "" },
        transaction: currentTransaction,
        include: [
                   {
                     model: SYSUserGroup,
                   },
                   {
                     model: SYSPerson,
                   }
                 ]

      }

      result = await SYSUser.findOne( options );

      if ( result === null ) {

        result = await SYSUser.create(
                                    createOrUpdateData,
                                    { transaction: currentTransaction }
                                  );

      }
      else if ( bUpdate ) {

        const currentValues =  createOrUpdateData; //( result as any ).dataValues;

        if ( CommonUtilities.isNullOrEmpty( currentValues.UpdatedBy ) ) {

          currentValues.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        }

        const updateResult = await SYSUser.update( currentValues,
                                                   options );

        if ( updateResult.length > 0 &&
             updateResult[ 0 ] >= 1 ) {

          result = await SYSUser.findOne( options );

        }

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

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

  static async deleteByModel( sysUser: SYSUser,
                              transaction: any,
                              logger: any ): Promise<Error|boolean> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        transaction: currentTransaction,

      }

      await sysUser.destroy( options );

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.deleteByModel.name;

      const strMark = "9E31DA440A05" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async countUsersWithPerson( strId: string,
                                     transaction: any,
                                     logger: any ): Promise<number> {

    let intResult = 0;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { "PersonId": strId ? strId : "" },
        transaction: currentTransaction,

      }

      intResult = await SYSUser.count( options );

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.deleteByModel.name;

      const strMark = "E119216006E0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

      intResult = error;

    }

    return intResult;

  }

}