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

      let strSQL = "Select ShortId From bizDeliveryOrder limit 1, 1";

      try {

        //Check field ShortId exists
        await dbConnection.execute( strSQL );

        bSuccess = true;  //VERY IMPORTANT

      }
      catch ( error ) {

        //The field ShortId NOT exists. Must be created

        strSQL = "ALTER TABLE `bizDeliveryOrder`" +
                 "ADD COLUMN `ShortId` VARCHAR(20) NULL COMMENT 'Short version from long id' AFTER `Id`";

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
