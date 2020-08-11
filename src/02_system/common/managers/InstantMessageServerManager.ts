//import fs from 'fs';
//import path from 'path';
import cluster from 'cluster';

import io from 'socket.io-client';

import CommonConstants from '../CommonConstants';

import CommonUtilities from "../CommonUtilities";
import SystemUtilities from "../SystemUtilities";
//import DBConnectionManager from "./DBConnectionManager";
//import I18NManager from './I18Manager';
import SYSConfigValueDataService from '../database/master/services/SYSConfigValueDataService';
import SystemConstants from '../SystemContants';
import InstantMessageServerRequestServiceV1 from '../others/services/InstantMessageServerRequestServiceV1';

const debug = require( 'debug' )( 'IntantMessageServerManager' );

export default class InstantMessageServerManager {

  static strAuthToken: string = null;

  static currentIMInstance = null;

  static async connect( callbacks: any, logger: any ): Promise<any> {

    let result = null;

    try {

      const configData = await InstantMessageServerManager.getConfigInstantMessageServerService( null, logger );

      if ( configData?.auth?.api_key &&
           configData?.host_live_domain &&
           configData?.host_live_path ) {

        const strMark = "4D8A86FADEA7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

        const debugMark = debug.extend( strMark );

        debugMark( "Connecting to IM server: [%s], api_key: [%s]", configData.host_live_domain + configData.host_live_path, configData.auth.api_key );

        const socketIOClient = io( configData.host_live_domain, {

          path: configData?.host_live_path,

          query: {

            auth: configData?.auth?.api_key

          },

        });

        socketIOClient.on( "connect", () => {

          const strMark = "0F5F04EC2A63" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

          const debugMark = debug.extend( strMark );

          debugMark( "Success connected to: [%s]", configData?.host_live_domain + configData?.host_live_path );

          InstantMessageServerManager.strAuthToken = configData?.auth?.api_key;

          //InstantMessageServerManager.strAuthToken = configData?.auth?.apiKey;

          if ( callbacks?.connect ) {

            callbacks?.connect;

          }

        });

        socketIOClient.on( "diconnect", () => {

          const strMark = "C8A484EF356C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

          const debugMark = debug.extend( strMark );

          debugMark( "Diconnected from: [%s]", configData?.host_live_domain + configData?.host_live_path );

          if ( callbacks?.disconnect ) {

            callbacks?.disconnect;

          }

        });

        let lastShowErrorMark = null;

        socketIOClient.on( "connect_error", ( error: Error ) => {

          if ( lastShowErrorMark === null ||
               SystemUtilities.getCurrentDateAndTimeDiff( lastShowErrorMark, "minutes" ) >= 1 ) {

            const strMark = "DF30496D5C75" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

            const debugMark = debug.extend( strMark );

            debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            debugMark( "Connect error: [%s].", error.message ? error.message: "No error message available" );

            if ( callbacks?.connect_error ) {

              callbacks?.connect_error;

            }

            lastShowErrorMark = SystemUtilities.getCurrentDateAndTime();

          }

        });

        socketIOClient.on( "reconnect", ( intAttemptNumber: number ) => {

          const strMark = "B6B9BD377CCD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

          const debugMark = debug.extend( strMark );

          debugMark( "Reconnected to: [%s]. In attempt number: [%s]", configData?.host_live_domain + configData?.host_live_path, intAttemptNumber );

          if ( callbacks?.reconnect ) {

            callbacks?.reconnect;

          }

        });

        result = socketIOClient;

      }
      else {

        const strMark = "BEB0F5FEC129" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

        const debugMark = debug.extend( strMark );

        debugMark( "Missing information to connect to IM server: [%s], api_key: [%s]", configData?.host_live_domain + configData?.host_live_path, configData.auth.api_key );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = InstantMessageServerManager.name + "." + this.connect.name;

      const strMark = "3AD813C49BCB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async sendMessageUsingSocket( socketConnection: any,
                                      strChannels: string,
                                      strAuth: string,
                                      message: any,
                                      responseCallback: any,
                                      logger: any ): Promise<{ Code: number, Message: string, Error: any }> {

    let result = {
                   Code: -1,
                   Message: "",
                   Error: null
                 };

    try {

      if ( !strAuth ) {

        const configData = await InstantMessageServerManager.getConfigInstantMessageServerService( null, logger );

        strAuth = configData?.auth?.api_key;

      }

      if ( strAuth ) {

        if ( !socketConnection ) {

          socketConnection = InstantMessageServerManager.currentIMInstance;

        }

        if ( socketConnection &&
             socketConnection.connected ) {

          socketConnection.emit( "Command:SendMessage",
                                 {
                                   Auth: strAuth,
                                   Channels: strChannels,
                                   Message: message
                                 },
                                 ( response: any ) => {

            if ( responseCallback ) {

              responseCallback( response );

            }

          });

          result.Code = 1;
          result.Message = "Success send message";

        }
        else {

          result.Code = -2;
          result.Message = "No socket live connection found";

          /*
          const strMark = "EE7CF8939EDF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

          const debugMark = debug.extend( strMark );

          debugMark( "No socket live" );
          */

        }

      }
      else {

        result.Code = -3;
        result.Message = "No auth in config found in database";

        /*
        const strMark = "686B75C9C2A9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

        const debugMark = debug.extend( strMark );

        debugMark( "No auth in config found" );
        */

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = InstantMessageServerManager.name + "." + this.connect.name;

      const strMark = "3AD813C49BCB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result.Code = -500;
      result.Message = "Unexpected error";
      result.Error = error;

    }

    return result;

  }

  static async sendMessageUsingRest( strChannels: string,
                                     strAuth: string,
                                     message: any,
                                     logger: any ): Promise<any> {

    let result = null;

    try {

      const configData = await InstantMessageServerManager.getConfigInstantMessageServerService( null, logger );

      if ( !strAuth ) {

        strAuth = configData?.auth?.api_key;

      }

      if ( strAuth &&
           configData?.host_rest ) {

        const strClientId = SystemUtilities.hashString( SystemUtilities.startRun.format(), 2, logger )

        const jsonServiceConfig = await InstantMessageServerManager.getConfigInstantMessageServerService( null,
                                                                                                          logger );

        const headers = {

          "Content-Type": "application/json",
          "Auth": jsonServiceConfig.auth.api_key + "+" + strClientId

        }

        /*
        const body = {

          "Channels": "Drivers,DriversPosition,Administrators,UnknownChannel",
          "Message": {
              "Kind": "text/plain",
              "Topic": "message",
              "Data": "Hello from rest service 2"
          }

        }
        */

        const body = {

          "Channels": strChannels,
          "Message": message

        }

        const response = await InstantMessageServerRequestServiceV1.callSendMessage(
                                                                                     jsonServiceConfig.host_rest,
                                                                                     headers,
                                                                                     body,
                                                                                   );

        if ( response?.output ) {

          result = response.output;

        }

        /*
        if ( response?.output?.body?.Data?.length > 0 ) {

          result = response.output.body.Data[ 0 ];

        }
        */

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = InstantMessageServerManager.name + "." + this.sendMessageUsingRest.name;

      const strMark = "3AD813C49BCB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = error;

    }

    return result;

  }

  static async getChannelMembers( strChannels: string,
                                  strAuth: string,
                                  logger: any ): Promise<any> {

    let result = null;

    try {

      const configData = await InstantMessageServerManager.getConfigInstantMessageServerService( null, logger );

      if ( !strAuth ) {

        strAuth = configData?.auth?.api_key;

      }

      if ( strAuth &&
           configData?.host_rest ) {

        const strClientId = SystemUtilities.hashString( SystemUtilities.startRun.format(), 2, logger )

        const jsonServiceConfig = await InstantMessageServerManager.getConfigInstantMessageServerService( null,
                                                                                                          logger );

        const headers = {

          "Content-Type": "application/json",
          "Auth": jsonServiceConfig.auth.api_key + "+" + strClientId

        }

        /*
        const body = {

          "Channels": "Drivers,DriversPosition,Administrators,UnknownChannel",
          "Message": {
              "Kind": "text/plain",
              "Topic": "message",
              "Data": "Hello from rest service 2"
          }

        }
        */

        const query = {

          "Channels": strChannels

        }

        const response = await InstantMessageServerRequestServiceV1.callChannelMembers(
                                                                                        jsonServiceConfig.host_rest,
                                                                                        headers,
                                                                                        query,
                                                                                      );

        if ( response?.output ) {

          result = response.output;

        };

        /*
        if ( response?.output?.body?.Data?.length > 0 ) {

          result = response.output.body.Data[ 0 ];

        }
        */

      }
      else {

        const strMark = "1D49560E9221" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

        const debugMark = debug.extend( strMark );

        debugMark( "Cannot get channel members: [%s], no host rest or no auth found", strChannels,  );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = InstantMessageServerManager.name + "." + this.getChannelMembers.name;

      const strMark = "2E94AEB2B35E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getURLFromInstantMessageServer( transaction: any,
                                               logger: any ): Promise<{ Domain: string, Path: string, IMManagerConnected: boolean }> {

    let result = {
                   Domain: "",
                   Path: "",
                   IMManagerConnected: false
                 };

    try {

      const strClientId = SystemUtilities.hashString( SystemUtilities.startRun.format(), 2, logger )

      const jsonServiceConfig = await InstantMessageServerManager.getConfigInstantMessageServerService( transaction,
                                                                                                        logger );

      const headers = {

        "Content-Type": "application/json",
        "Auth": jsonServiceConfig.auth.api_key + "+" + strClientId

      }

      let bIMManagerConnected = false;

      const response = await InstantMessageServerRequestServiceV1.callSelectWorkerSocket(
                                                                                          jsonServiceConfig.host_rest,
                                                                                          headers,
                                                                                        );

      let strWorker = null;

      if ( response?.output?.body?.Data?.length > 0 ) {

        bIMManagerConnected = true;
        strWorker = response?.output?.body?.Data[ 0 ];

      }

      //Backup plan
      if ( !strWorker &&
           jsonServiceConfig.workers ) {

        const workersList = jsonServiceConfig.workers.split( "," );

        if ( workersList?.length > 0 ) {

          strWorker = workersList[ SystemUtilities.getRandomIntegerRange( 0, workersList.length - 1 ) ];

        }

      }

      result = {
                 Domain: jsonServiceConfig.host_live_domain,
                 Path: jsonServiceConfig.host_live_path + ( strWorker ?  "/" + strWorker : "" ),
                 IMManagerConnected: bIMManagerConnected
               };

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = InstantMessageServerManager.name + "." + this.getURLFromInstantMessageServer.name;

      const strMark = "75233FA48CBC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async disconnectFromInstantMessageServer( strAuth: string,
                                                   transaction: any,
                                                   logger: any ): Promise<boolean> {

    let bResult = true;

    try {

      const strClientId = SystemUtilities.hashString( SystemUtilities.startRun.format(), 2, logger )

      const jsonServiceConfig = await InstantMessageServerManager.getConfigInstantMessageServerService( transaction,
                                                                                                        logger );

      const headers = {

        "Content-Type": "application/json",
        "Auth": jsonServiceConfig.auth.api_key + "+" + strClientId

      }

      await InstantMessageServerRequestServiceV1.callDisconnectUser(
                                                                    jsonServiceConfig.host_rest,
                                                                    headers,
                                                                    {
                                                                      "Auth": strAuth
                                                                    }
                                                                  );

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
