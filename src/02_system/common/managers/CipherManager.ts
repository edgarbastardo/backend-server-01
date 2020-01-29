
import appRoot from 'app-root-path';

import CommonConstants from "../CommonConstants";

import CommonUtilities from "../CommonUtilities";
import SystemUtilities from "../SystemUtilities";

//require( 'dotenv' );

require( 'dotenv' ).config( { path: appRoot.path + "/.env.secrets" } );

const debug = require( 'debug' )( 'CipherManager' );

export default class CipherManager {

  public static async encrypt( strUncryptedData: string,
                               logger: any ): Promise<string> {

    let strResult = "";

    try {

      let intKeyNumber = Math.floor( Math.random() * (+process.env.PRIVATE_KEY_COUNT - +1) + +1 );

      const strKey = process.env[ "PRIVATE_KEY_" + intKeyNumber ];

      strResult = "crypted://RSA://" + intKeyNumber + "://" + await SystemUtilities.encryptRSA( strUncryptedData,
                                                                                                strKey,
                                                                                                logger );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.encrypt.name;

      const strMark = "8EF4FDF7E929";

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

    return strResult;

  }

  public static async decrypt( strEncryptedData: string,
                               logger: any ): Promise<string> {

    let strResult = "";

    try {

      if ( strEncryptedData.startsWith( "crypted://" ) ) {

        let encryptedDataSections = strEncryptedData.split( "://" );

        if ( encryptedDataSections.length >= 4 ) {

          const strKey = process.env[ "PRIVATE_KEY_" + encryptedDataSections[ 2 ] ];

          if ( strKey ) {

            strResult = await SystemUtilities.decryptRSA( encryptedDataSections[ 3 ],
                                                          strKey,
                                                          logger );

          }
          else {

            strResult = "";

          }

        }
        else {

          strResult = "";

        }

      }
      else {

        strResult = strEncryptedData;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.encrypt.name;

      const strMark = "8EF4FDF7E929";

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

    return strResult;

  }

}