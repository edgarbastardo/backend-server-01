import cluster from "cluster";

import CommonConstants from "../CommonConstants";
import SystemConstants from "../SystemContants";

import CommonUtilities from "../CommonUtilities";
import SystemUtilities from "../SystemUtilities";

import DBConnectionManager from "./DBConnectionManager";
import SYSConfigValueDataService from "../database/master/services/SYSConfigValueDataService";

import TransportSMTP from "../implementations/notifications/TransportSMTP";
import TransportSendGrid from "../implementations/notifications/TransportSendGrid";
import TransportSMSGateway from "../implementations/notifications/TransportSMSGateway";
import TransportOneSignal from "../implementations/notifications/TransportOneSignal";
import TransportRedis from "../implementations/notifications/TransportRedis";
import TransportDiscord from "../implementations/notifications/TransportDiscord";
import TransportSlack from "../implementations/notifications/TransportSlack";

const debug = require( "debug" )( "NotificationManager" );

export default class NotificationManager {

  static async init( logger: any ): Promise<boolean> {

    let bResult = false;

    let currentTransaction = null;

    try {

      currentTransaction = await DBConnectionManager.getDBConnection( "master" ).transaction();

      let transportServiceConfig = await NotificationManager.getConfigDiscordService( currentTransaction,
                                                                                      logger );

      if ( NotificationManager.handleConfigWarning( "discord",
                                                    transportServiceConfig,
                                                    logger ) === false ) {

        if ( CommonUtilities.toLowerCase( transportServiceConfig.type ) === "discord" ) {

          await TransportDiscord.init( transportServiceConfig,
                                       logger );

        }
        else {

          NotificationManager.handleConfigWarning( "discord",
                                                    "config_not_found",
                                                    logger );

        }

      }

      bResult = true;

      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.init.name;

      const strMark = "3E7BE5F9FDCA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction !== null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

    }

    return bResult;

  }

  static async getConfigService( strTransport: string,
                                 logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = null;

    //ANCHOR getConfigService
    try {

      currentTransaction = await DBConnectionManager.getDBConnection( "master" ).transaction();

      if ( CommonUtilities.toLowerCase( strTransport ) === "email" ) {

        result = await NotificationManager.getConfigEMailService( currentTransaction,
                                                                  logger );

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "sms" ) {

        result = await NotificationManager.getConfigSMSService( currentTransaction,
                                                                logger );

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "push" ) {

        result = await NotificationManager.getConfigPushService( currentTransaction,
                                                                 logger );

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "discord" ) {

        result = await NotificationManager.getConfigDiscordService( currentTransaction,
                                                                    logger );

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "slack" ) {

        result = await NotificationManager.getConfigSlackService( currentTransaction,
                                                                  logger );

      }

      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigService.name;

      const strMark = "E3CA9C5E7A1B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

      if ( currentTransaction !== null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

    }

    return result;

  }

  static async getConfigServiceType( strTransport: string,
                                     logger: any ): Promise<string> {

    let strResult = null;

    //let currentTransaction = null;

    try {

      //currentTransaction = await DBConnectionManager.getDBConnection( "master" ).transaction();

      let serviceConfig = await this.getConfigService( strTransport, logger );

      if ( serviceConfig !== null &&
           serviceConfig.type ) {

        strResult = CommonUtilities.toLowerCase( serviceConfig.type );

      }
      else {

        strResult= "@__transport_not_found__@"

      }

      /*
      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }
      */

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigServiceType.name;

      const strMark = "13F8EAE54A0F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

      /*
      if ( currentTransaction !== null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }
      */

    }

    return strResult;

  }

  static async getConfigEMailService( transaction: any,
                                      logger: any ): Promise<any> {

    let result = null;

    try {

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_EMAIL_Service.Id,
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

      sourcePosition.method = this.name + "." + this.getConfigEMailService.name;

      const strMark = "6DA3F5292248" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getConfigSMSService( transaction: any,
                                    logger: any ): Promise<any> {

    let result = null;

    try {

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_SMS_Service.Id,
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

      sourcePosition.method = this.name + "." + this.getConfigSMSService.name;

      const strMark = "6DA3F5292248" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getConfigPushService( transaction: any,
                                     logger: any ): Promise<any> {

    let result = null;

    try {

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_PUSH_Service.Id,
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

      sourcePosition.method = this.name + "." + this.getConfigPushService.name;

      const strMark = "5A34CC07602A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getConfigDiscordService( transaction: any,
                                        logger: any ): Promise<any> {

    let result = null;

    try {

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_DISCORD_Service.Id,
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

      sourcePosition.method = this.name + "." + this.getConfigDiscordService.name;

      const strMark = "66EA1AEBE81D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getConfigSlackService( transaction: any,
                                      logger: any ): Promise<any> {

    let result = null;

    try {

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_SLACK_Service.Id,
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

      sourcePosition.method = this.name + "." + this.getConfigSlackService.name;

      const strMark = "48D9C1643438" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static handleConfigWarning( strService: string,
                              serviceConfig: any,
                              logger: any ): boolean {

    let bResult = false;

    if ( serviceConfig === "@__none__@" ) {

      const strDateTime = SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 );
      const strMessage = `Explicit "@__none__@" defined for the config of ${strService} transport service`
      const strMark = "DF30C39CD6E8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", strMessage );
      debugMark( "Error time: [%s]", strDateTime );

      if ( logger &&
           typeof logger.error === "function" ) {

        logger.warning(
                        {
                          kind: "error_config",
                          time: strDateTime,
                          mark: strMark,
                          code: SystemUtilities.getUUIDv4(),
                          message: strMessage
                        }
                      );

      }

      bResult = true;

    }
    else if ( serviceConfig === null ) {

      const strDateTime = SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 );
      const strMessage = `Not defined config found. For the ${strService} transport service`
      const strMark = "FC6AE18234CA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", strMessage );
      debugMark( "Error time: [%s]", strDateTime );

      if ( logger &&
           typeof logger.error === "function" ) {

        logger.warning(
                        {
                          kind: "error_config",
                          time: strDateTime,
                          mark: strMark,
                          code: SystemUtilities.getUUIDv4(),
                          message: strMessage
                        }
                      );

      }

      bResult = true;

    }
    else if ( serviceConfig === "config_not_found" ) {

      const strDateTime = SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 );
      const strMessage = `Not config defined for transport ${strService} service`
      const strMark = "02DC7A63CC72" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", strMessage );
      debugMark( "Error time: [%s]", strDateTime );

      if ( logger &&
           typeof logger.error === "function" ) {

        logger.warning(
                        {
                          kind: "error_config",
                          time: strDateTime,
                          mark: strMark,
                          code: SystemUtilities.getUUIDv4(),
                          message: strMessage
                        }
                      );

      }

      bResult = true;

    }

    return bResult;

  }

  static async send( strTransport: string,
                     messageOptions: object,
                     logger: any ): Promise<boolean> {

    let bResult = false;

    let currentTransaction = null;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( dbConnection !== null ) {

        currentTransaction = await dbConnection.transaction();

      }

      if ( CommonUtilities.toLowerCase( strTransport ) === "email" ) {

        const emailServiceConfig = await NotificationManager.getConfigEMailService( currentTransaction,
                                                                                    logger );

        if ( NotificationManager.handleConfigWarning( "email",
                                                      emailServiceConfig,
                                                      logger ) === false ) {

          if ( CommonUtilities.toLowerCase( emailServiceConfig.type ) === "smtp" ) {

            bResult = await TransportSMTP.send( emailServiceConfig,
                                                messageOptions,
                                                logger );

          }
          else if ( CommonUtilities.toLowerCase( emailServiceConfig.type ) === "send_grid" ) {

            bResult = await TransportSendGrid.send( emailServiceConfig,
                                                    messageOptions,
                                                    logger );

          }
          else {

            NotificationManager.handleConfigWarning( "email",
                                                     "config_not_found",
                                                     logger );

          }

        }

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "sms" ) {

        const smsServiceConfig = await NotificationManager.getConfigSMSService( currentTransaction,
                                                                                logger );

        if ( NotificationManager.handleConfigWarning( "sms",
                                                      smsServiceConfig,
                                                      logger ) === false ) {

          if ( CommonUtilities.toLowerCase( smsServiceConfig.type ) === "sms_gateway" ) {

            bResult = await TransportSMSGateway.send( smsServiceConfig,
                                                      messageOptions,
                                                      logger );

          }
          else {

            NotificationManager.handleConfigWarning( "sms",
                                                     "config_not_found",
                                                     logger );

          }

        }

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "push" ) {

        const pushServiceConfig = await NotificationManager.getConfigPushService( currentTransaction,
                                                                                  logger );

        if ( NotificationManager.handleConfigWarning( "push",
                                                      pushServiceConfig,
                                                      logger ) === false ) {

          if ( CommonUtilities.toLowerCase( pushServiceConfig.type ) === "one_signal" ) {

            bResult = await TransportOneSignal.send( pushServiceConfig,
                                                     messageOptions,
                                                     logger );

          }
          else {

            NotificationManager.handleConfigWarning( "push",
                                                     "config_not_found",
                                                     logger );

          }

        }

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "redis" ) {

        const redisServiceConfig = {};

        bResult = await TransportRedis.send( redisServiceConfig,
                                             messageOptions,
                                             logger );

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "discord" ) {

        const discordServiceConfig = await NotificationManager.getConfigDiscordService( currentTransaction,
                                                                                        logger );

        if ( NotificationManager.handleConfigWarning( "discord",
                                                      discordServiceConfig,
                                                      logger ) === false ) {

          if ( CommonUtilities.toLowerCase( discordServiceConfig.type ) === "discord" ) {

            bResult = await TransportDiscord.send( discordServiceConfig,
                                                   messageOptions,
                                                   logger );

          }
          else {

            NotificationManager.handleConfigWarning( "discord",
                                                     "config_not_found",
                                                     logger );

          }

        }

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "slack" ) {

        const slackServiceConfig = await NotificationManager.getConfigSlackService( currentTransaction,
                                                                                    logger );

        if ( NotificationManager.handleConfigWarning( "slack",
                                                      slackServiceConfig,
                                                      logger ) === false ) {

          if ( CommonUtilities.toLowerCase( slackServiceConfig.type ) === "slack" ) {

            bResult = await TransportSlack.send( slackServiceConfig,
                                                 messageOptions,
                                                 logger );

          }
          else {

            NotificationManager.handleConfigWarning( "slack",
                                                     "config_not_found",
                                                     logger );

          }

        }

      }

      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.send.name;

      const strMark = "13F8EAE54A0F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

      if ( currentTransaction !== null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

    }

    return bResult;

  }

  static async listen( strTransport: string,
                       listenOptions: object,
                       logger: any ): Promise<boolean> {

    let bResult = false;

    let currentTransaction = null;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( dbConnection ) {

        currentTransaction = await dbConnection.transaction();

      }

      if ( CommonUtilities.toLowerCase( strTransport ) === "email" ) {

        //

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "sms" ) {

        //

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "push" ) {

        //

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "redis" ) {

        bResult = await TransportRedis.listen( listenOptions,
                                               logger );

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "discord" ) {

        //

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "slack" ) {

        //

      }

      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.listen.name;

      const strMark = "13F8EAE54A0F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

      if ( currentTransaction !== null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

    }


    return bResult;

  }

  static async unlisten( strTransport: string,
                         listenOptions: object,
                         logger: any ): Promise<boolean> {

    let bResult = false;

    let currentTransaction = null;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( dbConnection ) {

        currentTransaction = await dbConnection.transaction();

      }

      if ( CommonUtilities.toLowerCase( strTransport ) === "email" ) {

        //

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "sms" ) {

        //

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "push" ) {

        //

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "redis" ) {

        bResult = await TransportRedis.unlisten( listenOptions,
                                                 logger );

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "discord" ) {

        //

      }
      else if ( CommonUtilities.toLowerCase( strTransport ) === "slack" ) {

        //

      }

      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.unlisten.name;

      const strMark = "641B6A513851" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

      if ( currentTransaction !== null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

    }


    return bResult;

  }

  static async publishOnTopic( strTopic: string,
                               dataToPublish: any,
                               logger: any ): Promise<boolean> {

    let bResult = false;

    bResult = await NotificationManager.send( "redis",
                                              {
                                                Connection: "default",
                                                Topic: strTopic,
                                                dataToPublish
                                              },
                                              logger );

    return bResult;

  }

  static async publishOnQueue( strTopic: string,
                               dataToPublish: any,
                               logger: any ): Promise<boolean> {

    let bResult = false;

    /*
    let bResult = await NotificationManager.send( "redis",
                                                  {
                                                    Connection: "default",
                                                    Topic: strTopic,
                                                    dataToPublish
                                                  },
                                                  logger );
                                                  */

    return bResult;

  }

  static async publishToExternal( dataToPublish: any,
                                  logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const transportExternalProviderList = CommonUtilities.parseJSON( process.env.NOTIFICATION_TRANSPORT_EXTERNAL_PROVIDER, null, true ) || { "@__default__@": [] };

      if ( dataToPublish.default === undefined ||
           dataToPublish.default ) {

        const transportExternalList = transportExternalProviderList[ "@__default__@" ] || []; //CommonUtilities.trimArrayFromString( process.env.NOTIFICATION_TRANSPORT_EXTERNAL );

        for ( const strTransportExternal of transportExternalList ) {

          if ( await this.send( strTransportExternal, dataToPublish, logger ) ) {

            bResult = true;

          }

        }

      }

      if ( dataToPublish.transport ) {

        const transportExternalList = Object.keys( dataToPublish.transport ) || [];

        for ( const strTransportExternal of transportExternalList ) {

          const realTransportExternalList = transportExternalProviderList[ strTransportExternal ] || [];

          for ( const strRealTransportExternal of realTransportExternalList ) {

            for ( const strChannel of dataToPublish.transport[ strTransportExternal ] ) {

              dataToPublish[ "channel" ] = strChannel;

              if ( await this.send( strRealTransportExternal, dataToPublish, logger ) ) {

                bResult = true;

              }

            }

          }

        }

      }

    }
    catch ( error ) {



    }

    return bResult;

  }

  static async listenOnTopic( strConnection: string,
                              strTopic: string,
                              handlerFunction: any,
                              logger: any ): Promise<boolean> {

    let bResult = false;

    bResult = await NotificationManager.listen(
                                                "redis",
                                                {
                                                  Connection: strConnection,
                                                  Topic: strTopic,
                                                  Handler: handlerFunction
                                                },
                                                logger
                                              );

    return bResult;

  }

  static async unlistenOnTopic( strConnection: string,
                                strTopic: string,
                                logger: any ): Promise<boolean> {

    let bResult = false;

    bResult = await NotificationManager.unlisten(
                                                  "redis",
                                                  {
                                                    Connection: strConnection,
                                                    Topic: strTopic,
                                                  },
                                                  logger
                                                );

    return bResult;

  }

}
