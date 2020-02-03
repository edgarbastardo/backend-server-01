import DBConnectionManager from "../../managers/DBConnectionManager";
import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from '../../SystemUtilities';
import BaseService from "./BaseService";
import CommonConstants from "../../CommonConstants";
import { UserSignup } from "../models/UserSignup";

const debug = require( 'debug' )( 'UserSignupService' );

export default class UserSignupService extends BaseService {

  static readonly _ID = "UserSignupService";

  static async getByToken( strToken: string,
                           strTimeZoneId: string,
                           transaction: any,
                           logger: any ): Promise<UserSignup> {

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

      result = await UserSignup.findOne( options );

      if ( CommonUtilities.isValidTimeZone( strTimeZoneId ) ) {

        SystemUtilities.transformModelToTimeZone( result,
                                                  strTimeZoneId,
                                                  logger );

      }

      if ( currentTransaction != null &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = UserSignupService.name + "." + this.getByToken.name;

      const strMark = "4709E07DF47B";

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

      if ( currentTransaction != null ) {

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