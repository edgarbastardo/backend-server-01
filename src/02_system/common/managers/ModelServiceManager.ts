import fs from 'fs';
import path from 'path';
import CommonUtilities from '../CommonUtilities';
import SystemUtilities from '../SystemUtilities';
import CommonConstants from '../CommonConstants';

const debug = require( 'debug' )( 'ModelServiceManager' );

export default class ModelServiceManager {

  static readonly _PATH_TO_SCAN = [
                                    "/02_system/common/database/services",
                                    "/03_business/common/database/services",
                                  ]

  static _read: boolean = true;
  static Services: any = {};

  /*
  constructor() {

    this._read = true;
    //ServiceLoader.Services = {};

  }
  */

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

            const service = importModule.default;

            if ( service._ID ) {

              ModelServiceManager.Services[ service._ID ] = new service();

            }

          }

        }

      }

      for ( const dir of dirs ) {

        if ( dir !== "template" ) {

          await this._scan( path.join( directory, dir ), logger );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = ModelServiceManager.name + "." + this._scan.name;

      const strMark = "9CFCDA4E7357";

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

  static async loadModelServices( logger: any ): Promise<any> {

    if ( this._read ) {

      for ( let intIndex = 0; intIndex < ModelServiceManager._PATH_TO_SCAN.length; intIndex++ ) {

        let strPath = SystemUtilities.baseRunPath + ModelServiceManager._PATH_TO_SCAN[ intIndex ];

        await this._scan( strPath, logger );

      }

      this._read = false;

    }

    return ModelServiceManager.Services;

  }

}

//export CoreApiManager();