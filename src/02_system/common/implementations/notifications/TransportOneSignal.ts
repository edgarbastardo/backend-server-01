import cluster from 'cluster';

//import OneSignal from 'onesignal-node';

import CommonConstants from "../../CommonConstants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

const debug = require( 'debug' )( 'TransportOneSignal' );

export default class TransportOneSignal {

  static async send( transportOptions: any,
                     messageOptions: any,
                     logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const OneSignal = require( 'onesignal-node' );

      const client = new OneSignal.Client( transportOptions.auth.app_id,
                                           transportOptions.auth.api_key );

      const response = await client.createNotification( messageOptions );

      bResult = response.body.id !== null;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.send.name;

      const strMark = "38DEB864775D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    return bResult;

  }

}