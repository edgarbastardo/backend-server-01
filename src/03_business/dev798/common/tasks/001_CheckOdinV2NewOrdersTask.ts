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

//import CommonRequestService from "../../../common/services/CommonRequestService";
import NotificationManager from '../../../../02_system/common/managers/NotificationManager';
import GeoMapManager from "../../../../02_system/common/managers/GeoMapManager"; //Google map api call manager. check en .env.secrets if not exist copy and rename .env.secrets.template to .env.secrets
import OdinV2APIRequestService from "../../../common/services/OdinV2APIRequestService";

let debug = require( 'debug' )( '001_CheckOdinV2NewOrdersTask' );

export default class CheckOdinV2NewOrdersTask_001 {

  public readonly Name = "CheckOdinV2NewOrdersTask_001";

  //public static minutesOfLastCleanPath: any = null;

  public static intRunNumber = 0;

  public async init( params: any, logger: any ): Promise<boolean> {

    let bResult = false;

    try {

        bResult = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = CheckOdinV2NewOrdersTask_001.name + "." + this.init.name;

      const strMark = "C64EA0B81F24" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    return true;

    /*
    let bResult = false;

    try {

      bResult = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = CheckOdinV2NewOrdersTask_001.name + "." + this.canRunTask.name;

      const strMark = "86BB90554265" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
    */

  }

  public async notifyError( logger: any ) {

    await NotificationManager.publishToExternal(
                                                 {
                                                   body: {
                                                           kind: "error",
                                                           text: "Error to get odin-v2 order to odin-v1.",
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
                                                             footer: "8E4BBCB07EDF",
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

      const debugMark = debug.extend( CheckOdinV2NewOrdersTask_001.intRunNumber + "-4946C11DC1AA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      debugMark( "Running task..." );

      debugMark( "Checking for new delivery orders in odin v2 backend..." );

      const strOdinV2Url01 = process.env.ODIN_V2_URL_01; //check env.secrets file in the root of project. if not exists copy env.secrets.template and rename to env.secrets
      const strOdinV2APIKey01 = process.env.ODIN_V2_API_KEY_01; //check env.secrets file in the root of project

      const backend = {
                        url: [ strOdinV2Url01 ]
                      }

      const headers = {
                        "Content-Type": "application/json",
                        "Authorization": strOdinV2APIKey01
                      }

      const params = {
                       DeliveryAt: SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_10 ) //2020-10-02
                     }

      const odinV2ReponseData = await OdinV2APIRequestService.callGetNewDeliveryOrder( backend,
                                                                                       headers,
                                                                                       params );

      if ( odinV2ReponseData.error === null &&
           odinV2ReponseData.output?.status ) {

        if ( odinV2ReponseData.output?.status === 200 &&
             odinV2ReponseData.output?.body?.Data?.length > 0 ) {

          //Get the data json from response body
          const deliveryOrderData = odinV2ReponseData.output?.body?.Data[ 0 ];

          //Process the insert in odin legacy database using the data from variable deliveryOrderData

          //The logic here

          //Check deliveryOrderData.Id not exist in odin database in order table

          //Check the .env file the ENV variable, in local machine always must be in ENV=dev
          //if en develop you need move forward comment the next 2 lines and 239 line
          if ( process.env.ENV === "prod" ||
               process.env.ENV === "test" ) {

            //The next call is required to make move forward to the next delivery order
            await OdinV2APIRequestService.callNewDeliveryOrderMark( backend,
                                                                    headers,
                                                                    {
                                                                      Id: deliveryOrderData.Id //Mark the delivery order as processed
                                                                    } );

          } //Comment here too

        }
        else if ( odinV2ReponseData.output?.status === 404 ) {

          debugMark( "No new delivery orders found in odin v2 backend..." );

        }
        else {

          debugMark( "WARNING: Unexpected response code %s from odin v2 backend...", odinV2ReponseData.output?.status );

        }

      }

      CheckOdinV2NewOrdersTask_001.intRunNumber += 1;

      debugMark( "Finished task..." );

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

      sourcePosition.method = CheckOdinV2NewOrdersTask_001.name + "." + this.runTask.name;

      const strMark = "116E093ACD48" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
