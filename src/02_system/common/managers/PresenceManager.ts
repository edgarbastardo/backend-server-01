import fs from 'fs';
import path from 'path';
import cluster from 'cluster';

import CommonConstants from '../CommonConstants';

import CommonUtilities from '../CommonUtilities';
import SystemUtilities from '../SystemUtilities';
//import DBConnectionManager from "./DBConnectionManager";
//import I18NManager from './I18Manager';

const debug = require( 'debug' )( 'PresenceManager' );

export default class PresenceManager {

  static readonly _PATH_TO_SCAN = [
                                    "/02_system/common/others/presence/filter",
                                    "/03_business/common/others/presence/filter",
                                  ]

  static Filters: any = {};

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

              PresenceManager.Filters[ rule._ID ] = new rule();

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

      sourcePosition.method = PresenceManager.name + "." + this._scan.name;

      const strMark = "8E3B81212ED7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async loadFilters( logger: any ): Promise<any> {

    try {

      for ( let intIndex = 0; intIndex < PresenceManager._PATH_TO_SCAN.length; intIndex++ ) {

        let strPath = SystemUtilities.strBaseRunPath + PresenceManager._PATH_TO_SCAN[ intIndex ];

        if ( fs.existsSync( strPath ) ) {

          await this._scan( strPath, logger );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = PresenceManager.name + "." + this.loadFilters.name;

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

    return PresenceManager.Filters;

  }

  static async filterList( userSessionStatus: any,
                           userPresenceList: any[],
                           transaction: any,
                           options: any,
                           logger: any ): Promise<any[]> {

    let result = userPresenceList;

    try {

      const keyNameList = Object.keys( PresenceManager.Filters );

      for ( let intIndex = 0; intIndex < keyNameList.length; intIndex++ ) {

        const strKeyName = keyNameList[ intIndex ];

        const rule = PresenceManager.Filters[ strKeyName ];

        result = await rule.filterList( userSessionStatus,
                                        result,
                                        transaction,
                                        options,
                                        logger );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = PresenceManager.name + "." + this.filterList.name;

      const strMark = "1D0657BCF524" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  /*
  static async filterListCount( userSessionStatus: any,
                                userPresenceList: any[],
                                transaction: any,
                                options: any,
                                logger: any ): Promise<any[]> {

    let result = userPresenceList;

    try {

      const keyNameList = Object.keys( PresenceManager.Rules );

      for ( let intIndex = 0; intIndex < keyNameList.length; intIndex++ ) {

        const strKeyName = keyNameList[ intIndex ];

        const rule = PresenceManager.Rules[ strKeyName ];

        result = await rule.filterListCount( userSessionStatus,
                                             result,
                                             transaction,
                                             options,
                                             logger );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = PresenceManager.name + "." + this.filterListCount.name;

      const strMark = "35B35B1F1412" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
  */

}