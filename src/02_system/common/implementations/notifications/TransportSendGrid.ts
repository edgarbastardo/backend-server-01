import cluster from 'cluster';

import sendgridMail from '@sendgrid/mail';

import CommonConstants from "../../CommonConstants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

import TransportEMail from "./TransportEMail";

const debug = require( 'debug' )( 'TransportSendGrid' );

export default class TransportSendGrid extends TransportEMail {

  static async send( transportOptions: any,
                     messageOptions: any,
                     logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      sendgridMail.setApiKey( transportOptions.auth.api_key ); // "SG.KynVbsHCSMyi????.???" );

      const toList = CommonUtilities.trimArray( messageOptions.to.split( "," ) );
      //const strTo = toList.splice( 0, 1 );

      const messageToSend = {
                              from: messageOptions.from,
                              to: toList,
                              //cc: toList.join( "," ),
                              subject: messageOptions.subject,
                              text: "",
                              html: ""
                            };

      if ( messageOptions.body.kind === "template" ) {

        const messageProcessed = await TransportSendGrid.processMessageFromTemplate( messageOptions.body,
                                                                                     logger );

        messageToSend.text = messageProcessed.text;
        messageToSend.html = messageProcessed.html;

      }
      else {

        messageToSend.text = messageOptions.text;
        messageToSend.html = messageOptions.html;

      }

      const result = await sendgridMail.send( messageToSend );

      bResult = result &&
                result[ 0 ].statusCode === 202;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.send.name;

      const strMark = "AFB4511A8749" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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