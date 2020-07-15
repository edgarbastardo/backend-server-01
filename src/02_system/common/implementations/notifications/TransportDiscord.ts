import cluster from 'cluster';


import CommonConstants from "../../CommonConstants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

const debug = require( 'debug' )( 'TransportDiscord' );

export default class TransportDiscord {

  static client = null;

  static async init( transportOptions: any,
                     logger: any ): Promise<boolean> {

    return true;

  }

  static async send( transportOptions: any,
                     messageOptions: any,
                     logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      let strWebHook = transportOptions.target.web_hooks[ messageOptions.channel ];

      if ( !strWebHook ) {

        strWebHook = transportOptions.target.web_hooks[ "#" + messageOptions.body.kind ]; // "@__default__@" ];

      }

      if ( strWebHook === null ||
           strWebHook === undefined ) {

        strWebHook = transportOptions.target.web_hooks[ "@__default__@" ];

      }

      if ( strWebHook ) {

        const toList = CommonUtilities.trimArray( strWebHook.split( "," ) ); //CommonUtilities.trimArray( transportOptions.to.split( "," ) );

        for ( const strTo of toList ) {

          if ( strTo && strTo.trim()  ) {

            //Not implemented yet

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.send.name;

      const strMark = "27CD67CCDEAF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
