import fs from "fs";
import path from "path";
import cluster from "cluster";

import CommonConstants from "../CommonConstants";
import SystemConstants from "../SystemContants";

import CommonUtilities from "../CommonUtilities";
import SystemUtilities from "../SystemUtilities";

const debug = require( "debug" )( "HookManager" );

export default class HookManager {

  private static _hookChainList = {};

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

            const hookHandler = new importModule.default();

            await HookManager.registerHookHandlerInChain( strLastFolderInPath,
                                                          hookHandler,
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

      sourcePosition.method = HookManager.name + "." + this._scan.name;

      const strMark = "4CAFEB16F364" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      HookManager._hookChainList = {};

      const pathToScan : any[] = JSON.parse( process.env.HOOK_PATH_TO_SCAN );

      for ( let intIndex = 0; intIndex < pathToScan.length; intIndex++ ) {

        let strPath = SystemUtilities.strBaseRunPath + pathToScan[ intIndex ];

        try {

          if ( fs.existsSync( strPath ) ) {

            await HookManager._scan( strPath,
                                     params,
                                     logger );

          }

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = this.name + "." + this.init.name;

          const strMark = "96F5089A2E3B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      const strMark = "CD996983F477" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async registerHookHandlerInChain( strChain: string,
                                           hookHandler: any,
                                           params: any,
                                           logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const debugMark = debug.extend( "9E5DF2FD6072" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      if ( hookHandler.name &&
           hookHandler.process ) {

        if ( await hookHandler.init( params, logger ) ) {

          if ( cluster.isMaster ) {

            debugMark( "Added hook handler for the hook [%s] in the chain [%s]. In master process",
                       hookHandler.name,
                       strChain );

          }
          else {

            debugMark( "Added hook handler for the hook [%s] in the chain [%s]. In worker process with id: [%s]",
                       hookHandler.name,
                       strChain,
                       cluster.worker.id );

          }

          if ( !HookManager._hookChainList[ strChain ] ) {

            HookManager._hookChainList[ strChain ] = [ hookHandler ];

          }
          else {

            HookManager._hookChainList[ strChain ].push( hookHandler );

          }

          bResult = true;

        }

      }
      else {

        debugMark( "The hook handler not has process method and name field" );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.registerHookHandlerInChain.name;

      const strMark = "BCD4C72DC04D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async processHookHandlersInChain( strChain: string,
                                           payload: any,
                                           logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const debugMark = debug.extend( "998CC6E742CD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      if ( HookManager._hookChainList[ strChain ] ) {

        const hookChainList = HookManager._hookChainList[ strChain ];

        payload[ "_process_results" ] = {};

        for ( let intHookHandlerIndex = 0; intHookHandlerIndex < hookChainList.length; intHookHandlerIndex++ ) {

          const hookHandler = hookChainList[ intHookHandlerIndex ];

          const result = await hookHandler.process( intHookHandlerIndex,
                                                    strChain,
                                                    payload,
                                                    logger );

          payload[ "_process_results" ][ hookHandler.name ] = result;

        }

        bResult = true;

      }
      else {

        debugMark( "Chain name [%s] not found or not hook handler in the list (empty)", strChain );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.processHookHandlersInChain.name;

      const strMark = "D38BC61D5F75" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
