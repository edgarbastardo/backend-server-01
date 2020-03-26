import fs from 'fs';
import path from 'path';
import cluster from 'cluster';

import CommonConstants from '../CommonConstants';

import CommonUtilities from '../CommonUtilities';
import SystemUtilities from '../SystemUtilities';
import DBConnectionManager from "./DBConnectionManager";
import I18NManager from './I18Manager';

const debug = require( 'debug' )( 'IntantMessageManager' );

export default class InstantMenssageManager {

  static readonly _PATH_TO_SCAN = [
                                    "/02_system/common/others/instant_message/rules",
                                    "/03_business/common/others/instant_message/rules",
                                  ]

  static Rules: any = {};

  static async _scan( directory: any, logger: any ) {

    try {

      const files = fs.readdirSync( directory )
                      .filter( file => fs.lstatSync( path.join( directory, file ) ).isFile() )
                      .filter( file => file.indexOf( '.' ) !== 0 && ( file.slice( -3 ) === '.js' || file.slice( -3 ) === '.ts' ) );

      const dirs = fs.readdirSync( directory )
                     .filter( file => fs.lstatSync( path.join( directory, file ) ).isDirectory() );

      for ( const file of files ) {

        if ( path.join( directory, file ) !== __filename ) {

          const importModule = await import( path.join( directory, file ) );

          if ( CommonUtilities.isNotNullOrEmpty( importModule ) &&
               CommonUtilities.isNotNullOrEmpty( importModule.default ) ) {

            const rule = importModule.default;

            if ( rule._ID ) {

              InstantMenssageManager.Rules[ rule._ID ] = new rule();

            }

          }

        }

      }

      for ( const dir of dirs ) {

        if ( dir !== "template" &&
             dir !== "disabled" &&
             dir.startsWith( "disabled_" ) === false ) {

          await this._scan( path.join( directory, dir ), logger );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = InstantMenssageManager.name + "." + this._scan.name;

      const strMark = "A44240B5F167" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async loadRules( logger: any ): Promise<any> {

    try {

      for ( let intIndex = 0; intIndex < InstantMenssageManager._PATH_TO_SCAN.length; intIndex++ ) {

        let strPath = SystemUtilities.strBaseRunPath + InstantMenssageManager._PATH_TO_SCAN[ intIndex ];

        if ( fs.existsSync( strPath ) ) {

          await this._scan( strPath, logger );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = InstantMenssageManager.name + "." + this.loadRules.name;

      const strMark = "44E6F097F3CB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    return InstantMenssageManager.Rules;

  }

  static async check( userSessionStatus: any,
                      jsonMessage: any,
                      transaction: any,
                      options: any,
                      logger: any ): Promise<{
                                               IsError: boolean,
                                               StatusCode: number,
                                               Code: string,
                                               Message: string
                                             }> {

    let result = { IsError: false, StatusCode: 200, Code: "", Message: "" };

    try {

      const keyNameList = Object.keys( InstantMenssageManager.Rules );

      for ( let intIndex = 0; intIndex < keyNameList.length; intIndex++ ) {

        const strKeyName = keyNameList[ intIndex ];

        const rule = InstantMenssageManager.Rules[ strKeyName ];

        result = await rule.check( userSessionStatus,
                                   jsonMessage,
                                   transaction,
                                   options,
                                   logger );

        if ( result.IsError === true ) {

          break;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = InstantMenssageManager.name + "." + this.check.name;

      const strMark = "44E6F097F3CB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = {
                 IsError: true,
                 StatusCode: 500,
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( options.Language, 'Unexpected error. Please read the server log for more details.' )
               };

    }

    return result;

  }

}