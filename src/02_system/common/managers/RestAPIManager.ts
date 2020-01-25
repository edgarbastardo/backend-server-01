import fs from 'fs';
import path from 'path';
import CommonUtilities from '../CommonUtilities';
import SystemUtilities from '../SystemUtilities';
import CommonConstants from '../CommonConstants';

const debug = require( 'debug' )( 'RestAPIManager' );

export default class RestAPIManager {

  /*
  static readonly _PATH_TO_SCAN = [
                                    "/02_system/core/api/rest",
                                    "/03_business/dev000/api/rest",
                                    "/03_business/dev007/api/rest",
                                  ]
                                  */

  _read: boolean;
  _routes: any[];

  constructor() {

    this._read = true;
    this._routes = [];

  }

  async _scan( directory: any,
               params: any,
               logger: any ) {

    try {

      const files = fs.readdirSync( directory )
                      .filter( file => fs.lstatSync( path.join( directory, file ) ).isFile() )
                      .filter( file => file.indexOf( '.' ) !== 0 && ( file.slice( -3 ) === '.js' || file.slice( -3 ) === '.ts' ) );

      const dirs = fs.readdirSync( directory )
                     .filter( file => fs.lstatSync( path.join( directory, file ) ).isDirectory() );

      let container = params[ "Container" ];

      for ( const file of files ) {

        if ( path.join( directory, file ) !== __filename ) {

          const importModule = await import( path.join( directory, file ) );

          if ( CommonUtilities.isNotNullOrEmpty( importModule ) &&
               CommonUtilities.isNotNullOrEmpty( importModule.default ) ) {

            const controller = new importModule.default( logger );

            if ( controller.registerInDataBase &&
                 process.env.IS_NETWORK_LEADER === "1" ) {

              await controller.registerInDataBase( logger );

            }

            if ( controller.createRoutes ) {

              const routes = await controller.createRoutes( logger );

              this._routes.push( routes );

            }

            if ( importModule.default._TO_IOC_CONTAINER === true &&
                 container ) {

              container.bind( importModule.default );

            }

          }

        }

      }

      for ( const dir of dirs ) {

        if ( dir !== "template" &&
             dir !== "disabled" &&
             dir.startsWith( "disabled_" ) === false  ) {

          await this._scan( path.join( directory, dir ),
                            params,
                            logger );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = RestAPIManager.name + "." + this._scan.name;

      const strMark = "392C958EF3CB";

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

  async getRoutes( params: any,
                   logger: any ): Promise<any> {

    try {

      if ( this._read ) {

        let container = params[ "Container" ];

        container.bind( "appLogger" ).toConstantValue( logger );

        const pathToScan : any[] = JSON.parse( process.env.REST_API_PATH_TO_SCAN );

        for ( let intIndex = 0; intIndex < pathToScan.length; intIndex++ ) {

          let strPath = SystemUtilities.baseRunPath + pathToScan[ intIndex ];

          try {

            await this._scan( strPath,
                              params,
                              logger );

          }
          catch ( error ) {

            const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

            sourcePosition.method = RestAPIManager.name + "." + this.getRoutes.name;

            const strMark = "3BADA45D6489";

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

        this._read = false;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = RestAPIManager.name + "." + this.getRoutes.name;

      const strMark = "83452ADB368B";

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

    return this._routes;

  }

}

//export CoreApiManager();