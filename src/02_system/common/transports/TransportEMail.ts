import fs from 'fs';
import cluster from 'cluster';

//import nodemailer from "nodemailer";
import pug from "pug";
import juice from "juice";
import htmlToText from "html-to-text";

import CommonConstants from "../CommonConstants";

import CommonUtilities from "../CommonUtilities";
import SystemUtilities from "../SystemUtilities";

const debug = require( 'debug' )( 'TransportEMail' );

export default class TransportEMail {

  static async processMessageFromTemplate( body: any,
                                           logger: any ): Promise<any> {

    let result = { text: "", html: "" };

    try {

      let strFullFilePath = `${__dirname}/../../../03_business/common/others/templates/email/${body.language}/${body.file}`;

      if ( fs.existsSync( strFullFilePath ) === false ) {

        strFullFilePath = `${__dirname}/../../../03_business/common/others/templates/email/en_US/${body.file}`;

        if ( fs.existsSync( strFullFilePath ) === false ) {

          strFullFilePath = `${__dirname}/../others/templates/email/${body.language}/${body.file}`;

          if ( fs.existsSync( strFullFilePath ) === false ) {

            strFullFilePath = `${__dirname}/../others/templates/email/en_US/${body.file}`;

          }

        }

      }

      const strHTML = pug.renderFile( strFullFilePath,
                                      body.variables );

      result.html = juice( strHTML );
      result.text = htmlToText.fromString( strHTML );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.processMessageFromTemplate.name;

      const strMark = "9B2D695AE0D4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    return result;

  }

}