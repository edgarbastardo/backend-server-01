import fs from 'fs';
import path from 'path';
import cluster from 'cluster';

import CommonConstants from '../CommonConstants';

import CommonUtilities from '../CommonUtilities';
import SystemUtilities from '../SystemUtilities';
import DBConnectionManager from "./DBConnectionManager";

const debug = require( 'debug' )( 'ModelServiceManager' );

export default class ModelServiceManager {

  static readonly _PATH_TO_SCAN = [
                                    "/02_system/common/database/services",
                                    "/03_business/common/database/@__database__@/services",
                                  ]

  //static _read: boolean = true;
  static Services: any = {};

  /*
  constructor() {

    this._read = true;
    //ServiceLoader.Services = {};

  }
  */

  static async _scan( strDatabase: string, directory: any, logger: any ) {

    try {

      if ( !ModelServiceManager.Services[ strDatabase ] ) {

        ModelServiceManager.Services[ strDatabase ] = {};

      }

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

              ModelServiceManager.Services[ strDatabase ][ service._ID ] = new service();

            }

          }

        }

      }

      for ( const dir of dirs ) {

        if ( dir !== "template" ) {

          await this._scan( strDatabase, path.join( directory, dir ), logger );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = ModelServiceManager.name + "." + this._scan.name;

      const strMark = "9CFCDA4E7357" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async loadModelServices( strDatabase: string, logger: any ): Promise<any> {

    //if ( this._read ) {

    try {


      let databaseList = [];

      if ( strDatabase === "*" ) {

        const tempDatabaseList = Object.keys( DBConnectionManager.getAllDBConfig() );

        for ( let intDBIndex = 0; intDBIndex < tempDatabaseList.length; intDBIndex++ ) {

          databaseList.push( tempDatabaseList[ intDBIndex ] );

        }

      }
      else {

        databaseList.push( strDatabase );

      }

      for ( let intDBIndex = 0; intDBIndex < databaseList.length; intDBIndex++ ) {

        try {

          const strCurrentDatabase = databaseList[ intDBIndex ];

          const dbConfigSystem = DBConnectionManager.getDBConfig( strCurrentDatabase ).system;

          for ( let intIndex = 0; intIndex < ModelServiceManager._PATH_TO_SCAN.length; intIndex++ ) {

            if ( ( intIndex === 0 && dbConfigSystem === 1 ) || intIndex > 0 ) {

              let strPath = SystemUtilities.strBaseRunPath + ModelServiceManager._PATH_TO_SCAN[ intIndex ];

              strPath = strPath.replace( "@__database__@", strCurrentDatabase );

              if ( fs.existsSync( strPath ) ) {

                await this._scan( strCurrentDatabase, strPath, logger );

              }

            }

          }

        }
        catch ( error ) {

          //

        }

      }

      //this._read = false;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = ModelServiceManager.name + "." + this.loadModelServices.name;

      const strMark = "6C027BBAFAA8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    //}

    return ModelServiceManager.Services;

  }

}

//export CoreApiManager();