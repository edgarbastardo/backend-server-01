import fs from "fs";
import path from "path";
import cluster from "cluster";

import CommonConstants from "../CommonConstants";
//import SystemConstants from "../SystemContants";

import CommonUtilities from "../CommonUtilities";
import SystemUtilities from "../SystemUtilities";

const debug = require( "debug" )( "RunnableModuleManager" );

export default class RunnableModuleManager {

  private static _runnableModuleList = {};

  static async _scan( strFullRootPath: any,
                      params: any,
                      logger: any ): Promise<any> {

    try {

      const pathParts = strFullRootPath.split( "/" );

      const strLastFolderInPath = pathParts[ pathParts.length - 1 ];

      const files = fs.readdirSync( strFullRootPath )
                      .filter( file => fs.lstatSync( path.join( strFullRootPath, file ) ).isFile() )
                      .filter( file => file.indexOf( "." ) !== 0 && ( file.slice( -3 ) === ".js" || file.slice( -3 ) === ".ts" ) );

      const dirs = fs.readdirSync( strFullRootPath )
                     .filter( file => fs.lstatSync( path.join( strFullRootPath, file ) ).isDirectory() );

      for ( const strFile of files ) {

        if ( path.join( strFullRootPath, strFile ) !== __filename ) {

          const importModule = await import( path.join( strFullRootPath, strFile ) );

          if ( CommonUtilities.isNotNullOrEmpty( importModule ) &&
               CommonUtilities.isNotNullOrEmpty( importModule.default ) ) {

            const runnableModule = new importModule.default();

            await RunnableModuleManager.registerRunnableModule( runnableModule,
                                                                params,
                                                                logger );

          }

        }

      }

      for ( const strDir of dirs ) {

        if ( strDir !== "template" &&
             strDir !== "disabled" &&
             strDir !== "common" &&
             strDir.startsWith( "disabled_" ) === false  ) {

          await this._scan( path.join( strFullRootPath, strDir ),
                            params,
                            logger );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = RunnableModuleManager.name + "." + this._scan.name;

      const strMark = "1727500FA32C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async init( params: any,
                     logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      RunnableModuleManager._runnableModuleList = {};

      const pathToScan : any[] = JSON.parse( process.env.RUNNABLES_PATH_TO_SCAN );

      for ( let intIndex = 0; intIndex < pathToScan.length; intIndex++ ) {

        let strPath = SystemUtilities.strBaseRunPath + pathToScan[ intIndex ];

        try {

          if ( fs.existsSync( strPath ) ) {

            await RunnableModuleManager._scan( strPath,
                                               params,
                                               logger );

          }

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = this.name + "." + this.init.name;

          const strMark = "745A45B72057" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      bResult = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.init.name;

      const strMark = "0B4ED4AF55AB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async registerRunnableModule( runnableModule: any,
                                       params: any,
                                       logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const debugMark = debug.extend( "002BFB496BDD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      if ( runnableModule.name &&
           runnableModule.run &&
           runnableModule.init ) {

        if ( await runnableModule.init( params, logger ) ) {

          RunnableModuleManager._runnableModuleList[ runnableModule.name ] = runnableModule;

          if ( cluster.isMaster ) {

            debugMark( "Added runnable module [%s]. In master process",
                        runnableModule.name );

          }
          else {

            debugMark( "Added runnable module [%s]. In worker process with id: [%s]",
                        runnableModule.name,
                        cluster.worker.id );

          }

          bResult = true;

        }

      }
      else {

        debugMark( "The runnable module not has run method and name field" );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.registerRunnableModule.name;

      const strMark = "5045D011DE56" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async launchRunnableModule( strName: string,
                                     payload: any,
                                     logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const debugMark = debug.extend( "B3C472E9E8F8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      if ( RunnableModuleManager._runnableModuleList[ strName ] ) {

        const runnableModule = RunnableModuleManager._runnableModuleList[ strName ];

        bResult = await runnableModule.run( strName,
                                            payload,
                                            logger );

      }
      else {

        debugMark( "The runnable module name [%s] not found in the list", strName );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.launchRunnableModule.name;

      const strMark = "08DFCBD31987" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
