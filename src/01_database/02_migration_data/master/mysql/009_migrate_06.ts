//import uuidv4 from 'uuid/v4';
//import moment from 'moment-timezone';
//import os from 'os';
import cluster from 'cluster';

import CommonUtilities from '../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../02_system/common/SystemUtilities';
import CommonConstants from '../../../../02_system/common/CommonConstants';
//import Hashes from 'jshashes';

const debug = require( 'debug' )( '009_migrate_06' );

//Example file migrate files using code
export default class Migrate {

  static async migrateUp( dbConnection: any, logger: any ): Promise<any> {

    let bSuccess = false;
    let bEmptyContent = false;  //VERY IMPORTANT

    try {

      let strSQL = "Select StartAt, EndAt, Tag From bizDriverStatus limit 1, 1";

      try {

        //Check field Date exists
        await dbConnection.execute( strSQL );

        bSuccess = true;  //VERY IMPORTANT

      }
      catch ( error ) {

        //The field AtDate, UpdatedBy, UpdatedAt NOT exists. Must be created

        strSQL = "DELETE FROM `bizDriverStatus`;" +  //<-- This is needed to apply not null
                 "ALTER TABLE `bizDriverInDeliveryZone` " +
                 "ADD COLUMN `EndAt` VARCHAR(40) NULL AFTER `StartAt`," +
                 "CHANGE COLUMN `AtDate` `StartAt` VARCHAR(30) NOT NULL ," +
                 "CHANGE COLUMN `LockByRole` `Tag` VARCHAR(1024) NOT NULL;"

        await dbConnection.query( strSQL );

        bSuccess = true;  //VERY IMPORTANT

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
