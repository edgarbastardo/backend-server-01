import cluster from 'cluster';

//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import CommonConstants from '../../../../../02_system/common/CommonConstants';
import SystemConstants from '../../../../../02_system/common/SystemContants';

import CommonUtilities from '../../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../../02_system/common/SystemUtilities';

import DBConnectionManager from '../../../../../02_system/common/managers/DBConnectionManager';

import BaseService from '../../../../../02_system/common/database/master/services/BaseService';

import { establishments } from '../models/establishments';
import { users } from '../models/users';
import { results } from 'inversify-express-utils';
import usersService from './usersService';

const debug = require( 'debug' )( 'establishmentsService' ); //<= Change here for the right service name

export default class establishmentsService extends BaseService { //<= Change class name here use F2 key

  static readonly _ID = "establishmentsService"; //<= Change here for the right service name

  static async getByName( Name: string,
                          strTimeZoneId: string,
                          transaction: any,
                          logger: any ): Promise<establishments> { //<= Change here for the right model name

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let usersInDB = await usersService.getByFirstName( Name, null, logger ); //<= Change here for the right model name

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

          await currentTransaction.commit();

      }

      if ( usersInDB === null ) {

          console.log('error no hay user con ese nombre');

      } else {

        const options = {

                          where: { "user_id": usersInDB.id }, //<= Change here to right model field name
                          transaction: currentTransaction,

                        }

        result = await establishments.findOne( options ); //<= Change here for the right model name

        if ( CommonUtilities.isValidTimeZone( strTimeZoneId ) ) {

          SystemUtilities.transformModelToTimeZone( result,
                                                    strTimeZoneId,
                                                    logger );

        }

          if ( result === null ) {

          console.log('no hay establishment con este nombre')

        } else {

          return result

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getByName.name;

      const strMark = "D76E3650291E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getByUserId( UsersId: string,
                            strTimeZoneId: string,
                            transaction: any,
                            logger: any ): Promise<establishments> { //<= Change here for the right model name

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

        where: { "user_id": UsersId }, //<= Change here to right model field name
        transaction: currentTransaction,

      }

      result = await establishments.findOne( options ); //<= Change here for the right model name

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

      sourcePosition.method = this.name + "." + this.getByUserId.name;

      const strMark = "83479CA2F7C9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                               logger: any ): Promise<establishments> { //<= Change here for the right model name

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
                        where: { "id": createOrUpdateData.id ? createOrUpdateData.id : "" }, //<= Change here to right model field name
                        transaction: currentTransaction,

                      }

      //      \/   Use F2 to rename this variable name
      let establishmentsInDB = await establishments.findOne( options ); //<= Change here for the right model name

      if ( establishmentsInDB === null ) {

        establishmentsInDB = await establishments.create( //<= Change here for the right model name
                                                          createOrUpdateData,
                                                          { transaction: currentTransaction }
                                                        );

      }
      else if ( bUpdate ) {

        await establishmentsInDB.update( createOrUpdateData,
                                         options );

        establishmentsInDB = await establishments.findOne( options ); //<= Change here for the right model name

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = establishmentsInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "54838A5F1C01" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
  static async deleteByModel( establisment: establishments, //<= Change here for the right model name, aditional rename the parameter variable using F2
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

      await establisment.destroy( options ); //<= Change here for the right model name

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

      const strMark = "1DBF48B78541" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
