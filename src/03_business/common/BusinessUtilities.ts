//import CommonConstants from "../../02_system/common/CommonConstants";

//import CommonUtilities from "../../02_system/common/CommonUtilities";
//import SystemUtilities from "../../02_system/common/SystemUtilities";

const debug = require( 'debug' )( 'BusinessUtilities' );

export default class BusinessUtilities {

  //He we put all common business utilities

  //Example
  /*
  static myUtil( row: any, strTimeZoneId: string, logger: any ): any {

    try {

      if ( CommonUtilities.isNotNullOrEmpty( row.CreatedAt ) ) {

        row.CreatedAt = moment( row.CreatedAt ).tz( strTimeZoneId ).format();

      }

      if ( CommonUtilities.isNotNullOrEmpty( row.UpdatedAt ) ) {

        row.UpdatedAt = moment( row.UpdatedAt ).tz( strTimeZoneId ).format();

      }

      if ( CommonUtilities.isNotNullOrEmpty( row.DisabledAt ) ) {

        row.DisabledAt = moment( row.DisabledAt ).tz( strTimeZoneId ).format();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.myUtil.name;

      const strMark = "E4D7C40DBF57" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ); //This number is unique. See vs code random extension. Generate random hex color.

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

  }
  */

}