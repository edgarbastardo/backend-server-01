import request from 'request-promise-native';
import cluster from "cluster";

import CommonConstants from "../CommonConstants";

import CommonUtilities from "../CommonUtilities";
import SystemUtilities from "../SystemUtilities";

const debug = require( 'debug' )( 'TransportSMSGateway' );

export default class TransportSMSGateway {

  static async send( transportOptions: any,
                     messageOptions: any,
                     logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const toList = CommonUtilities.trimArray( messageOptions.to.split( "," ) );

      for ( const strTo of toList ) {

        const options = {
                          method: 'POST',
                          uri: transportOptions.host,
                          form: {
                                  "request.SecurityTokenId": transportOptions.auth.api_key, //"cebeae94-246e-4bac-86b3-4ed0dc5f890d",
                                  "request.DeviceId": messageOptions.device_id || transportOptions.deviceId,
                                  "request.PhoneNumber": strTo, //"3057769594",
                                  "request.Message": messageOptions.body.text,  //"Test message",
                                  "request.ForeignData": messageOptions.foreign_data,  //`{ "user": "myuser" }`,
                                  "request.Context": messageOptions.context || transportOptions.context || "AMERICA/NEW_YORK"
                                },
                          headers: {
                                    /* 'content-type': 'application/x-www-form-urlencoded' */ // Is set automatically
                                   }

                        };

        const strResult = await request( options );

        if ( process.env.ENV === "dev" ) {

          let debugMark = debug.extend( '9D18E07D936A' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
          debugMark( strResult );

        }

      }

      bResult = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.send.name;

      const strMark = "03F50BEB002D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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