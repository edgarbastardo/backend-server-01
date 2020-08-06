//import uuidv4 from 'uuid/v4';
//import moment from 'moment-timezone';
//import os from 'os';
import cluster from 'cluster';

import CommonUtilities from '../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../02_system/common/SystemUtilities';
import CommonConstants from '../../../../02_system/common/CommonConstants';
//import Hashes from 'jshashes';

const debug = require( 'debug' )( '005_migrate_02' );

//Example file migrate files using code
export default class Migrate {

  static async migrateUp( dbConnection: any, logger: any ): Promise<any> {

    let bSuccess = false;
    let bEmptyContent = true;

    try {

      let strSQL = "Select AtDate From bizDriverStatus limit 1, 1";

      try {

        //Check field Date exists
        await dbConnection.execute( strSQL );

      }
      catch ( error ) {

        //The field Kind NOT exists. Must be created

        strSQL = "DELETE FROM `bizDriverStatus`;" +  //<-- This is needed to apply not null
                 "ALTER TABLE `bizDriverStatus` " +
                 "ADD COLUMN `AtDate` DATE NOT NULL AFTER `UserId`, " +
                 "ADD COLUMN `UpdatedBy` VARCHAR(150) NULL AFTER `CreatedAt`, " +
                 "ADD COLUMN `UpdatedAt` VARCHAR(30) NULL AFTER `UpdatedBy`, " +
                 "DROP PRIMARY KEY, " +
                 "ADD PRIMARY KEY (`UserId`, `AtDate`);";

        await dbConnection.execute( strSQL );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.migrateUp.name;

      const strMark = "65F8BAF52864" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return { bSuccess, bEmptyContent };

  }

}
