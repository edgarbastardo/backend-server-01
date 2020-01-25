//import uuidv4 from 'uuid/v4';
//import moment from 'moment-timezone';
//import os from 'os';
//import bcrypt from 'bcrypt';

import CommonUtilities from '../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../02_system/common/SystemUtilities';
import CommonConstants from '../../../02_system/common/CommonConstants';
//import { UserGroup } from '../../../02_system/common/database/models/UserGroup';
//import { User } from '../../../02_system/common/database/models/User';
//import Hashes from 'jshashes';

const debug = require( 'debug' )( '001_orm_import_data' );

//Example file import files using code
export default class Import {

  static async importUp( dbConnection: any, logger: any ): Promise<any> {

    //The dbConnection parameter is instance of ORM object (sequelize)
    let bSuccess = false;
    let bEmptyContent = true;

    let currentTransaction = null;

    try {

      /*
      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

      }

      //Migration code here

      const strId = SystemUtilities.getUUIDv4();

      const userGroupsToCreate = [
        {
          Id: strId,
          Name: "Administrators",
          Role: "#Administrator#",
          Comment: "Auto created from importation",
          CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
        }
      ]

      const groupsCreated = await UserGroup.bulkCreate( userGroupsToCreate, { individualHooks: true, validate: true } );

      let debugMark = debug.extend( "C1E0B7A71391" );

      debugMark( groupsCreated );

      const saltRounds = 10;

      const strCryptedPassword = await bcrypt.hash( "admin.123456.", saltRounds );

      const usersToCreate = [
        {
          GroupId: strId,
          Name: "administrator01",
          Password: strCryptedPassword.toString(),
          Comment: "Auto created from importation",
          CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
        }
      ]

      const usersCreated = await User.bulkCreate( usersToCreate, { individualHooks: true, validate: true } );

      debugMark( usersCreated );

      if ( currentTransaction != null ) {

        await currentTransaction.commit();

      }
      */

      bSuccess = true;
      bEmptyContent = false;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.importUp.name;

      const strMark = "64364DD8AC1E";

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

    }

    return { bSuccess, bEmptyContent };

  }

}