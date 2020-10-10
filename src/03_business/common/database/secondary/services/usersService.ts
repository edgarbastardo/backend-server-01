import cluster from 'cluster';

//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import CommonConstants from '../../../../../02_system/common/CommonConstants';
import SystemConstants from '../../../../../02_system/common/SystemContants';

import CommonUtilities from '../../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../../02_system/common/SystemUtilities';

import DBConnectionManager from '../../../../../02_system/common/managers/DBConnectionManager';

import BaseService from '../../../../../02_system/common/database/master/services/BaseService';

import { users } from '../models/users';

const debug = require( 'debug' )( 'usersService' ); //<= Change here for the right service name

export default class usersService extends BaseService { //<= Change class name here use F2 key

  static readonly _ID = "usersService"; //<= Change here for the right service name

  static async getByEmail( email: string,
                           strTimeZoneId: string,
                           transaction: any,
                           logger: any ): Promise<users> { //<= Change here for the right model name

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { "email": email }, //<= Change here to right model field name
        transaction: currentTransaction,

      }

      let usersInDB = await users.findOne( options ); //<= Change here for the right model name

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

      result = usersInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getByEmail.name;

      const strMark = "5BFC84E7190B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return result;

  }

  static async getByFirstName( firstName: string,
                               strTimeZoneId: string,
                               transaction: any,
                               logger: any ): Promise<users> { //<= Change here for the right model name

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { "first_name": firstName }, //<= Change here to right model field name
        transaction: currentTransaction,

      }

      result = await users.findOne( options ); //<= Change here for the right model name

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

      sourcePosition.method = this.name + "." + this.getByFirstName.name;

      const strMark = "1DAD588E1D7D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return result;

  }

  static async createOrUpdate( createOrUpdateData: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<users> { //<= Change here for the right model name

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {
                            //    \/                      \/                      \/
                        where: { "email": createOrUpdateData.email ? createOrUpdateData.email : "" }, //<= Change here to right model field name
                        transaction: currentTransaction,

                      }

      //      \/   Use F2 to rename this variable name
      let usersInDB = await users.findOne( options ); //<= Change here for the right model name

      if ( usersInDB === null ) {

        usersInDB = await users.create( //<= Change here for the right model name
                                          createOrUpdateData,
                                          { transaction: currentTransaction }
                                        );

      }
      else if ( bUpdate ) {

        await usersInDB.update( createOrUpdateData,
                                options );

        usersInDB = await users.findOne( options ); //<= Change here for the right model name

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = usersInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "A79267F63189" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

                         //      \/   Use F2 to rename this variable name
  static async deleteByModel( user: users, //<= Change here for the right model name, aditional rename the parameter variable using F2
                              transaction: any,
                              logger: any ): Promise<Error|boolean> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        transaction: currentTransaction,

      }

      await user.destroy( options ); //<= Change here for the right model name

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

      const strMark = "042B395EF588" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
