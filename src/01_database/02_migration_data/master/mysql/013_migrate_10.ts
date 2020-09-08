//import uuidv4 from 'uuid/v4';
//import moment from 'moment-timezone';
//import os from 'os';
import cluster from 'cluster';

import CommonUtilities from '../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../02_system/common/SystemUtilities';
import CommonConstants from '../../../../02_system/common/CommonConstants';
//import Hashes from 'jshashes';

const debug = require( 'debug' )( '013_migrate_10' );

//Example file migrate files using code
export default class Migrate {

  static async migrateUp( dbConnection: any, logger: any ): Promise<any> {

    let bSuccess = false;
    let bEmptyContent = false;  //VERY IMPORTANT

    try {

      let strSQL = "Select DeliveryOrderId From bizDeliveryOrderFinishCurrent limit 1";

      try {

        //Check the table bizDeliveryOrderFinishCurrent
        await dbConnection.execute( strSQL );

        bSuccess = true;  //VERY IMPORTANT

      }
      catch ( error ) {

        //The bizDeliveryOrderFinishCurrent table. Must be created

        strSQL = "CREATE TABLE IF NOT EXISTS `bizDeliveryOrderFinishCurrent` (" +
                 "`DeliveryOrderId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table bizDeliveryOrder on field Id'," +
                 "`DeliveryOrderFinishId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table bizDeliveryOrderFinish on field Id'," +
                 "`Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#'," +
                 "`CreatedBy` varchar(75) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.'," +
                 "`CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.'," +
                 "`UpdatedBy` varchar(75) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Name of user updated the row.'," +
                 "`UpdatedAt` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Date and time of last update to the row.'," +
                 "`ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format'," +
                 "PRIMARY KEY (`DeliveryOrderId`)," +
                 "CONSTRAINT `FK_bizDeliveryOrdFC_DeliveryOrderId_From_bizDeliveryOrder_Id` FOREIGN KEY (`DeliveryOrderId`) REFERENCES `bizDeliveryOrder` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE," +
                 "CONSTRAINT `FK_bizDeliveryOrdFC_DeliveryOrdFId_From_bizDeliveryOrder_Id` FOREIGN KEY (`DeliveryOrderFinishId`) REFERENCES `bizDeliveryOrderFinish` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE" +
                 ") ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store information about LAST delivery order finish.';"

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
