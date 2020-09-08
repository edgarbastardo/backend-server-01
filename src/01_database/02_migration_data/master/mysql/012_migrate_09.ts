//import uuidv4 from 'uuid/v4';
//import moment from 'moment-timezone';
//import os from 'os';
import cluster from 'cluster';

import CommonUtilities from '../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../02_system/common/SystemUtilities';
import CommonConstants from '../../../../02_system/common/CommonConstants';
//import Hashes from 'jshashes';

const debug = require( 'debug' )( '012_migrate_09' );

//Example file migrate files using code
export default class Migrate {

  static async migrateUp( dbConnection: any, logger: any ): Promise<any> {

    let bSuccess = false;
    let bEmptyContent = false;  //VERY IMPORTANT

    try {

      let strSQL = "Select DeliveryOrderId From bizDeliveryOrderFinish limit 1";

      try {

        //Check the table bizDeliveryOrderFinish
        await dbConnection.execute( strSQL );

        bSuccess = true;  //VERY IMPORTANT

      }
      catch ( error ) {

        //The bizDeliveryOrderFinish table. Must be created

        strSQL = "CREATE TABLE IF NOT EXISTS `bizDeliveryOrderFinish` (" +
                 "`Id` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Primary identifier GUID.'," +
                 "`DeliveryOrderId` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Foreign key from table bizDeliveryOrder on field Id'," +
                 "`PaymentMethod` smallint(6) NOT NULL COMMENT '0 = Cash, 1 = Credit Card, 2 = Knock Knock, 3 = Uber -online internamente-, 4 = Mixed, 5 = Reposition'," +
                 "`GrandTotal` decimal(10,2) NOT NULL COMMENT 'Grand total of the order'," +
                 "`PaymentMethodTip` smallint(6) NOT NULL COMMENT '0 = Credit Card, 1 = Knock Knock, 2 = Mixed'," +
                 "`Tip` decimal(10,2) NOT NULL COMMENT 'Tip amount'," +
                 "`PaperNumber` varchar(40) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Teh order number in the ticket'," +
                 "`Comment` varchar(512) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'A comment that the user can edit using the user interface.'," +
                 "`Tag` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Tag flags for multi purpose process.\n\nTags format is #tag# separated by ,\n\nExample:\n\n#tag01#,#tag02#,#my_tag03#,#super_tag04#,#other_tag05#'",
                 "`Latitude` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Current gps coordinate to the time of set status'," +
                 "`Longitude` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Current gps coordinate to the time of set status'," +
                 "`CreatedBy` varchar(75) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Name of user created the row.'," +
                 "`CreatedAt` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Creation date and time of the row.'," +
                 "`ExtraData` json DEFAULT NULL COMMENT 'Extra data information, generally in json format'," +
                 "PRIMARY KEY (`Id`),"
                 "CONSTRAINT `FK_bizDeliveryOrdFinish_DeliveryOrderId_From_bizDeliveryOrder_Id` FOREIGN KEY (`DeliveryOrderId`) REFERENCES `bizDeliveryOrder` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE" +
                 ") ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='Store historical information about delivery order finish.';"

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
