import fs from 'fs';
import path from 'path';
import cluster from 'cluster';

import CommonConstants from '../CommonConstants';

import CommonUtilities from '../CommonUtilities';
import SystemUtilities from '../SystemUtilities';
import DBConnectionManager from "./DBConnectionManager";
import I18NManager from './I18Manager';
import SYSConfigValueDataService from '../database/master/services/SYSConfigValueDataService';
import SystemConstants from '../SystemContants';
import IntantMessageServerRequestServiceV1 from '../others/services/IntantMessageServerRequestServiceV1';

const debug = require( 'debug' )( 'IntantMessageServerManager' );

export default class InstantMessageServerManager {

  static async getConfigInstantMessageServerService( transaction: any,
                                                     logger: any ): Promise<any> {

    let result = null;

    try {

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_IM_Server.Id,
                                                                             SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                                             transaction,
                                                                             logger );

      let bSet = false;

      if ( CommonUtilities.isNotNullOrEmpty( configData.Value ) ) {

        const jsonConfigValue = CommonUtilities.parseJSON( configData.Value,
                                                           logger );
        const strService = jsonConfigValue.service

        if ( strService !== "@__none__@" &&
             jsonConfigValue[ strService ] ) {

          result = jsonConfigValue[ strService ];
          bSet = true;

        }
        else {

          result = strService;
          bSet = true;

        }

      }

      if ( bSet === false &&
           CommonUtilities.isNotNullOrEmpty( configData.Default ) ) {

        const jsonConfigValue = CommonUtilities.parseJSON( configData.Default,
                                                           logger );

        const strService = jsonConfigValue.service

        if ( strService !== "@__none__@" &&
             jsonConfigValue[ strService ] ) {

          result = jsonConfigValue[ strService ];

        }
        else {

          result = strService;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = InstantMessageServerManager.name + "." + this.getConfigInstantMessageServerService.name;

      const strMark = "B63945EAEAE6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async checkAllowedToJoin( strChannelToJoin: string,
                                   userSessionStatus: any,
                                   transaction: any,
                                   logger: any ): Promise<any> {

    let result = { value: 0, allowed: "*", denied: "" };

    try {

      const checkData = await SYSConfigValueDataService.checkAllowed( userSessionStatus,
                                                                      SystemConstants._CONFIG_ENTRY_IM_Server.Id,
                                                                      SystemConstants._CONFIG_ENTRY_IM_Server.Owner,
                                                                      strChannelToJoin,
                                                                      null,
                                                                      "command/JoinToChannels",
                                                                      false,
                                                                      transaction,
                                                                      true,
                                                                      logger );

      result = checkData;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = InstantMessageServerManager.name + "." + this.checkAllowedToJoin.name;

      const strMark = "3CFE3FF1B959" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async checkAllowedToSend( strChannelToSend: string,
                                   strMessageToSend: string,
                                   userSessionStatus: any,
                                   transaction: any,
                                   logger: any ): Promise<any> {

    let result = { value: 0, allowed: "*", denied: "" };

    try {

      const checkData = await SYSConfigValueDataService.checkAllowed( userSessionStatus,
                                                                      SystemConstants._CONFIG_ENTRY_IM_Server.Id,
                                                                      SystemConstants._CONFIG_ENTRY_IM_Server.Owner,
                                                                      strChannelToSend,
                                                                      null,
                                                                      "command/SendMessage",
                                                                      false,
                                                                      transaction,
                                                                      true,
                                                                      logger );

      result = checkData;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = InstantMessageServerManager.name + "." + this.checkAllowedToJoin.name;

      const strMark = "3CFE3FF1B959" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getConfigAllowedToJoin( userSessionStatus: any,
                                       transaction: any,
                                       logger: any ): Promise<any> {

    let result = { value: 0, allowed: "*", denied: "" };

    try {

      const configData = await SYSConfigValueDataService.getConfigValueDataObjectDeniedAllowed( userSessionStatus,
                                                                                                SystemConstants._CONFIG_ENTRY_IM_Server.Id,
                                                                                                SystemConstants._CONFIG_ENTRY_IM_Server.Owner,
                                                                                                null,
                                                                                                "command/JoinToChannels",
                                                                                                false,
                                                                                                transaction,
                                                                                                logger );

      result = configData;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = InstantMessageServerManager.name + "." + this.getConfigAllowedToJoin.name;

      const strMark = "8E7213C60CA9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async disconnectFromInstantMessageServer( strSocketToken: string,
                                                   transaction: any,
                                                   logger: any ): Promise<boolean> {

    let bResult = true;

    try {

      const jsonServiceConfig = await InstantMessageServerManager.getConfigInstantMessageServerService( transaction,
                                                                                                         logger );

      const headers = {

        "Content-Type": "application/json",
        "Authorization": jsonServiceConfig.auth.apiKey

      }

      await IntantMessageServerRequestServiceV1.callDisconnectUser( jsonServiceConfig.host,
                                                                    headers,
                                                                    {
                                                                      "Auth": strSocketToken
                                                                    } );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = InstantMessageServerManager.name + "." + this.disconnectFromInstantMessageServer.name;

      const strMark = "07104A113729" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  /*
    let result = { result: 1, allowed: "*", denied: "" }; //Default allow all

    const checkData = await SYSConfigValueDataService.checkAllowed( userSessionStatus,
                                                                    SystemConstants._CONFIG_ENTRY_IM_Server.Id,
                                                                    SystemConstants._CONFIG_ENTRY_IM_Server.Owner,
                                                                    strMimeType,
                                                                    strCategory,
                                                                    null,
                                                                    true,
                                                                    transaction,
                                                                    true,
                                                                    logger );

    if ( checkData &&
         checkData.value !== undefined &&
         checkData.allowed !== undefined &&
         checkData.denied !== undefined ) {

      result = checkData;

    }

    return result;
  */

  /*
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
                                               Message: string,
                                               Details: any
                                             }> {

    let result = {
                   IsError: false,
                   StatusCode: 200,
                   Code: "",
                   Message: "",
                   Details: null
                 };

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
                 Message: await I18NManager.translate( options.Language, 'Unexpected error. Please read the server log for more details.' ),
                 Details: await SystemUtilities.processErrorDetails( error ) //error
               };

    }

    return result;

  }
  */

}
