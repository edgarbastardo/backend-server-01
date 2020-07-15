import cluster from "cluster";

import CommonConstants from "../CommonConstants";
import SystemConstants from "../SystemContants";

import CommonUtilities from "../CommonUtilities";
import SystemUtilities from "../SystemUtilities";

import DBConnectionManager from "./DBConnectionManager";
import SYSConfigValueDataService from "../database/master/services/SYSConfigValueDataService";
import GeoMapGoogle from "../implementations/geomaps/GeoMapGoogle";

const debug = require( "debug" )( "GeoMapManager" );

export default class GeoMapManager {

  static async getConfigMapGeocodeService( transaction: any,
                                           logger: any ): Promise<any> {

    let result = null;

    try {

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_MAP_GEOCODE_Service.Id,
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

      sourcePosition.method = this.name + "." + this.getConfigMapGeocodeService.name;

      const strMark = "B9ADCCC9AD60" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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


  static async getConfigMapDistanceService( transaction: any,
                                            logger: any ): Promise<any> {

    let result = null;

    try {

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_MAP_DISTANCE_Service.Id,
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

      sourcePosition.method = this.name + "." + this.getConfigMapDistanceService.name;

      const strMark = "5D4F3DE9BF94" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getConfigServiceType( strService: string,
                                     logger: any ): Promise<string> {

    let strResult = null;

    let currentTransaction = null;

    //ANCHOR getConfigServiceType
    try {

      //if ( currentTransaction === null ) {

      currentTransaction = await DBConnectionManager.getDBConnection( "master" ).transaction();

      //}

      let serviceConfig = null;

      if ( CommonUtilities.toLowerCase( strService ) === "geocode" ) {

        serviceConfig = await GeoMapManager.getConfigMapGeocodeService( currentTransaction,
                                                                        logger );

      }
      else if ( CommonUtilities.toLowerCase( strService ) === "distance" ) {

        serviceConfig = await GeoMapManager.getConfigMapDistanceService( currentTransaction,
                                                                         logger );

      }
      else {

        strResult= "@__service_not_found__@"

      }

      if ( serviceConfig !== null ) {

        strResult = CommonUtilities.toLowerCase( serviceConfig.type );

      }

      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigServiceType.name;

      const strMark = "9C36F20B9EF8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    return strResult;

  }

  static handleConfigWarning( strService: string,
                              serviceConfig: any,
                              logger: any ): boolean {

    let bResult = false;

    if ( serviceConfig === "@__none__@" ) {

      const strDateTime = SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 );
      const strMessage = `Explicit "@__none__@" defined for the config of map ${strService} service`
      const strMark = "947BFD9CFCB1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
      const strMessage = `Not defined config found. For the map ${strService} service`
      const strMark = "57E58F1DB5D4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
      const strMessage = `Not config defined for transport map ${strService} service`
      const strMark = "40411129921E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async geocodeServiceUsingAddress( addressList: string[],
                                           bParseGeocodeResponse: boolean,
                                           logger: any ): Promise<any[]> {

    let result = [];

    let currentTransaction = null;

    try {

      //ANCHOR  geocodeServiceUsingAddress
      //if ( currentTransaction === null ) {

      currentTransaction = await DBConnectionManager.getDBConnection( "master" ).transaction();

      //}

      const mapGeocodeServiceConfig = await GeoMapManager.getConfigMapGeocodeService( currentTransaction,
                                                                                      logger );

      if ( GeoMapManager.handleConfigWarning( "geocode",
                                              mapGeocodeServiceConfig,
                                              logger ) === false ) {

        if ( CommonUtilities.toLowerCase( mapGeocodeServiceConfig.type ) === "google_maps" ) {

          result = await GeoMapGoogle.geocodeServiceUsingAddress( mapGeocodeServiceConfig,
                                                                  addressList,
                                                                  bParseGeocodeResponse,
                                                                  logger );

        }
        else {

          GeoMapManager.handleConfigWarning( "geocode",
                                             "config_not_found",
                                             logger );

        }

      }

      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.geocodeServiceUsingAddress.name;

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

    return result;

  }

  static async geocodeServiceUsingLatAndLng( pointList: [
                                                          {
                                                            latitude: string,
                                                            longitude: string
                                                          }
                                                        ],
                                             bParseGeocodeResponse: boolean,
                                             logger: any ): Promise<any[]> {

    let result = [];

    let currentTransaction = null;

    try {

      //ANCHOR  geocodeServiceUsingLatAndLng
      //if ( currentTransaction === null ) {

      currentTransaction = await DBConnectionManager.getDBConnection( "master" ).transaction();

      //}

      const mapGeocodeServiceConfig = await GeoMapManager.getConfigMapGeocodeService( currentTransaction,
                                                                                      logger );

      if ( GeoMapManager.handleConfigWarning( "geocode",
                                              mapGeocodeServiceConfig,
                                              logger ) === false ) {

        if ( CommonUtilities.toLowerCase( mapGeocodeServiceConfig.type ) === "google_maps" ) {

          result = await GeoMapGoogle.geocodeServiceUsingLatAndLng( mapGeocodeServiceConfig,
                                                                    pointList,
                                                                    bParseGeocodeResponse,
                                                                    logger );

        }
        else {

          GeoMapManager.handleConfigWarning( "geocode",
                                             "config_not_found",
                                             logger );

        }

      }

      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.geocodeServiceUsingAddress.name;

      const strMark = "FDB915D0F10A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  public static async parseGeocodeResponse( geocodeDataList: any[],
                                            logger: any ): Promise<any[]> {

    let result = [];

    let currentTransaction = null;

    try {

      //ANCHOR  getGeocodeData
      //if ( currentTransaction === null ) {

      currentTransaction = await DBConnectionManager.getDBConnection( "master" ).transaction();

      //}

      const mapGeocodeServiceConfig = await GeoMapManager.getConfigMapGeocodeService( currentTransaction,
                                                                                      logger );

      if ( GeoMapManager.handleConfigWarning( "geocode",
                                              mapGeocodeServiceConfig,
                                              logger ) === false ) {

        if ( CommonUtilities.toLowerCase( mapGeocodeServiceConfig.type ) === "google_maps" ) {

          result = await GeoMapGoogle.parseGeocodeResponse( geocodeDataList,
                                                      logger );

        }
        else {

          GeoMapManager.handleConfigWarning( "geocode",
                                             "config_not_found",
                                             logger );

        }

      }

      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.parseGeocodeResponse.name;

      const strMark = "8E8133D7D819" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

}
