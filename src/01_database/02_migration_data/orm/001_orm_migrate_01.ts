//import uuidv4 from 'uuid/v4';
//import moment from 'moment-timezone';
//import os from 'os';
import cluster from 'cluster';

import CommonConstants from '../../../02_system/common/CommonConstants';

import CommonUtilities from '../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../02_system/common/SystemUtilities';
//import { UserGroup } from '../../../02_system/common/database/models/UserGroup';
//import Hashes from 'jshashes';

const debug = require( 'debug' )( '001_orm_migrate_01' );

//Example file migrate files using code
export default class Migrate {

  static async migrateUp( dbConnection: any, logger: any ): Promise<any> {

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
          Name: "Group01",
          Role: "#Administrator#",
          Comment: "Auto created from importation",
          CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
        }
      ]

      const groupsCreated = await UserGroup.bulkCreate( userGroupsToCreate, { individualHooks: true, validate: true } );

      debug(  "%O", groupsCreated );

      const saltRounds = 10;

      const strCryptedPassword = bcrypt.hash( "admin.123456.", saltRounds );

      const usersToCreate = [
        {
          GroupId: strId,
          Name: "administrator01",
          Password: strCryptedPassword,
          Comment: "Auto created from importation",
          CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
        }
      ]

      const usersCreated = await User.bulkCreate( usersToCreate, { individualHooks: true, validate: true } );

      debug( "%O", usersCreated );

      if ( currentTransaction != null ) {

        await currentTransaction.commit();

      }

      bSuccess = true;
      bEmptyContent = false;
      */

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.migrateUp.name;

      const strMark = "1B45E615BAFF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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