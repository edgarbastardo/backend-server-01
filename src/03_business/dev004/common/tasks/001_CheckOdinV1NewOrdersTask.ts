import cluster from 'cluster';

/*
import fs from 'fs';
import os from 'os';

import rimraf from "rimraf";

import FormData from 'form-data';

import appRoot from 'app-root-path';
*/

import parser from 'cron-parser';

import CommonConstants from '../../../../02_system/common/CommonConstants';
//import SystemConstants from '../../../../02_system/common/SystemContants';

import CommonUtilities from "../../../../02_system/common/CommonUtilities";
import SystemUtilities from "../../../../02_system/common/SystemUtilities";

import DBConnectionManager from '../../../../02_system/common/managers/DBConnectionManager';

import OrdersService from "../../../common/database/secondary/services/OrdersService"; //DB class with all db odin.orders interactions
import OdinV2APIRequestService from '../../../common/services/OdinV2APIRequestService'; //Remote vromo API call, using node-fetch library

//import CommonRequestService from "../../../common/services/CommonRequestService";
import NotificationManager from '../../../../02_system/common/managers/NotificationManager';
import GeoMapManager from "../../../../02_system/common/managers/GeoMapManager"; //Google map api call manager. check en .env.secrets if not exist copy and rename .env.secrets.template to .env.secrets

let debug = require( 'debug' )( '001_CheckOdinV1NewOrdersTask' );

export default class CheckOdinV1NewOrdersTask_001 {

  public readonly Name = "CheckOdinV1NewOrdersTask_001";

  //public static minutesOfLastCleanPath: any = null;

  public static intRunNumber = 0;

  public async init( params: any, logger: any ): Promise<boolean> {

    let bResult = false;

    try {

        bResult = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = CheckOdinV1NewOrdersTask_001.name + "." + this.init.name;

      const strMark = "D6FD317AD1A9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  public async canRunTask( params: any,
                           logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const interval = parser.parseExpression( process.env.MIGRATE_IMAGES_TASK_CRON );

      const currentDateTime = SystemUtilities.getCurrentDateAndTime();

      const strNextRunDateTime = interval.next().toISOString();

      if ( currentDateTime.isSame( strNextRunDateTime ) ||
           currentDateTime.isBefore( strNextRunDateTime ) ) {

        bResult = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = CheckOdinV1NewOrdersTask_001.name + "." + this.canRunTask.name;

      const strMark = "82CA720EE3C2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  public async notifyError( logger: any ) {

    await NotificationManager.publishToExternal(
                                                 {
                                                   body: {
                                                           kind: "error",
                                                           text: "Error to send odin-v1 order to odin-v2.",
                                                           fields: [
                                                                     {
                                                                       title: "Date",
                                                                       value: SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ),
                                                                       short: false
                                                                     },
                                                                     {
                                                                       title: "Host",
                                                                       value: SystemUtilities.getHostName(),
                                                                       short: false
                                                                     },
                                                                     {
                                                                       title: "Application",
                                                                       value: process.env.APP_SERVER_TASK_NAME,
                                                                       short: false
                                                                     },
                                                                     {
                                                                       title: "Running from",
                                                                       value: SystemUtilities.strBaseRunPath,
                                                                       short: false
                                                                     }
                                                                   ],
                                                             footer: "52F222359BE5",
                                                         }
                                                 },
                                                 logger
                                               );

  }

  //This method run every from 8 to 15 seconds
  public async runTask( params: any,
                        logger: any ): Promise<boolean> {

    let bResult = false;

    let currentTransaction = null;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    try {

      //Check the file db_config.json in the root of project for mysql db password of local server
      const dbConnection = DBConnectionManager.getDBConnection( "secondary" ); //Get the odin connection

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //The logic here
      //Check for new odin orders table orders database odin
      //If new order with no driver (driver_id = null) send to vromo using  the http api

      const debugMark = debug.extend( CheckOdinV1NewOrdersTask_001.intRunNumber + "-4BBBE0F89A10" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      debugMark( "Running task..." );

      debugMark( "Checking for new delivery orders in odin v1 database..." );

      const newOrderList = await OrdersService.getNewOrdersWithNoDriver( currentTransaction, logger ) as any;

      if ( newOrderList.length > 0 ) {

        debugMark( "%s new delivery orders found in odin v1 database...", newOrderList.length );
        debugMark( "Sending to odin-v2 server..." );

        const strOdinV2Server = process.env.ODIN_V2_URL; //check env.secrets file in the root of project. if not exists copy env.secrets.template and rename to env.secrets
        const strOdinV2APIKey = process.env.ODIN_V2_API_KEY; //check env.secrets file in the root of project

        const headers = {

          "Content-Type": "application/json",
          "Authorization": strOdinV2APIKey

        };

        for ( let intNewOrderIndex = 0; intNewOrderIndex < newOrderList.length; intNewOrderIndex++ ) {

          //Google map api call manager. check en .env.secrets if not exist copy and rename .env.secrets.template to .env.secrets
          //Serach for entry MAP_GEOCODE_GOOGLE_API_KEY and MAP_DISTANCE_GOOGLE_API_KEY
          const addressGeocoded = await GeoMapManager.geocodeServiceUsingAddress(
                                                                                  [ newOrderList[ intNewOrderIndex ].address ],
                                                                                  true,
                                                                                  logger
                                                                                );

          //odin-v2 data to send to service
          const body = {

            latitude: addressGeocoded[ 0 ].latitude,
            longitude: addressGeocoded[ 0 ].longitude,
            address: newOrderList[ intNewOrderIndex ].address,

            hooks: {

                     "DriverAssigned": process.env.ODIN_V2_API_KEY,

                   }
            //Other fields needed by the odin-v2 api service

          }

          const result = await OdinV2APIRequestService.sendOrder( headers,
                                                                  strOdinV2Server,
                                                                  body,
                                                                  logger );

          if ( result.error ) {

            //Check for errors

            this.notifyError( logger );

          }

          //Check for error in http status code result.output.status
          //this.notifyError( logger );

        }

      }
      else {

        debugMark( "No new delivery orders found in odin v1 database..." );

      }

      //check for error in result variable

      CheckOdinV1NewOrdersTask_001.intRunNumber += 1;

      //debugMark( "Finishg task..." );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = CheckOdinV1NewOrdersTask_001.name + "." + this.runTask.name;

      const strMark = "EDA3EDF0F471" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           logger.error === "function" ) {

        logger.error( error );

      }

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return bResult;

  }

}
