import nodemailer from "nodemailer";

import CommonConstants from "../CommonConstants";

import CommonUtilities from "../CommonUtilities";
import SystemUtilities from "../SystemUtilities";

import TransportEMail from "./TransportEMail";

const debug = require( 'debug' )( 'TransportSMTP' );

export default class TransportSMTP extends TransportEMail {

  static async send( transportOptions: any,
                     messageOptions: any,
                     logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const transport = nodemailer.createTransport( transportOptions );

      const messageToSend = {
                              from: messageOptions.from,
                              to: messageOptions.to,
                              subject: messageOptions.subject,
                              text: "",
                              html: ""
                            };

      if ( messageOptions.body.kind === "template" ) {

        const messageProcessed = await TransportEMail.processMessageFromTemplate( messageOptions.body,
                                                                                  logger );

        messageToSend.text = messageProcessed.text;
        messageToSend.html = messageProcessed.html;

      }
      else {

        messageToSend.text = messageOptions.text;
        messageToSend.html = messageOptions.html;

      }

      await transport.sendMail( messageToSend );

      bResult = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.send.name;

      const strMark = "980C4F98C1FF";

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