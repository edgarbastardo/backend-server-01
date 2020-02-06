import { User } from "../models/User";
import DBConnectionManager from "../../managers/DBConnectionManager";
import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from '../../SystemUtilities';
import { UserGroup } from "../models/UserGroup";
import { Person } from "../models/Person";
import BaseService from "./BaseService";
import CommonConstants from "../../CommonConstants";
import SystemConstants from "../../SystemContants";

const debug = require( 'debug' )( 'PersonService' );

export default class PersonService extends BaseService {

  static readonly _ID = "PersonService";

  static async getById( strId: string,
                        strTimeZoneId: string,
                        transaction: any,
                        logger: any ): Promise<Person> {

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

      }

      result = await Person.findOne( options );

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

      sourcePosition.method = PersonService.name + "." + this.getById.name;

      const strMark = "DC96C7888421";

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
  static async createOrUpdate( createOrUpdateData: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<Person> {

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

      result = await Person.findOne( options );

      if ( result === null ) {

        result = await Person.create(
                                      createOrUpdateData,
                                      { transaction: currentTransaction }
                                    );

      }
      else if ( bUpdate ) {

        const currentValues = createOrUpdateData; //( result as any ).dataValues;

        if ( CommonUtilities.isNullOrEmpty( currentValues.UpdatedBy ) ) {

          currentValues.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        }

        await Person.update( currentValues,
                             options );

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

      const strMark = "7315FDCB28DA";

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

        SystemUtilities.transformModelToTimeZone( instance.dataValues.UserGroup,
                                                  params.TimeZoneId,
                                                  logger );

        if ( CommonUtilities.isNotNullOrEmpty( instance.dataValues.Person ) ) {

          SystemUtilities.transformModelToTimeZone( instance.dataValues.Person,
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