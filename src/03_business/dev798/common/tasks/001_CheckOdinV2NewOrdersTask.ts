import cluster from 'cluster';
import util from "util";
/*
import fs from 'fs';
import os from 'os';

import rimraf from "rimraf";

import FormData from 'form-data';

import appRoot from 'app-root-path';
*/

//import parser from 'cron-parser';

import CommonConstants from '../../../../02_system/common/CommonConstants';
//import SystemConstants from '../../../../02_system/common/SystemContants';

import CommonUtilities from "../../../../02_system/common/CommonUtilities";
import SystemUtilities from "../../../../02_system/common/SystemUtilities";

import DBConnectionManager from '../../../../02_system/common/managers/DBConnectionManager';
import NotificationManager from '../../../../02_system/common/managers/NotificationManager';
import I18NManager from "../../../../02_system/common/managers/I18Manager";
//import GeoMapManager from "../../../../02_system/common/managers/GeoMapManager"; //Google map api call manager. check en .env.secrets if not exist copy and rename .env.secrets.template to .env.secrets

//import CommonRequestService from "../../../common/services/CommonRequestService";
import OdinV2APIRequestService from "../../../common/services/OdinV2APIRequestService";
import usersService from '../../../common/database/secondary/services/usersService';
import establishmentsService from '../../../common/database/secondary/services/establishmentsService';
import locationsService from '../../../common/database/secondary/services/locationsService';
import ordersService from '../../../common/database/secondary/services/ordersService';
import { uuid4 } from 'random-js';
import deliveriesService from '../../../common/database/secondary/services/deliveriesService';
import ticket_imagesService from '../../../common/database/secondary/services/ticket_imagesService';
import driversService from '../../../common/database/secondary/services/driversService';
import { create } from 'archiver';
import zip_codesService from '../../../common/database/secondary/services/zip_codesService';

let debug = require( 'debug' )( '001_CheckOdinV2NewOrdersTask' );

export default class CheckOdinV2NewOrdersTask_001 {

  public readonly Name = "CheckOdinV2NewOrdersTask_001";

  //public static minutesOfLastCleanPath: any = null;

  public static intRunNumber = 0;

  public static lastExternalNotification = null;

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

  public canNotifyToExternal( lastNotificationToExternal: any ): boolean {

    let bResult = false;

    try {

      if ( lastNotificationToExternal ) {

        const currentDateAndTimeMinus30Seconds = SystemUtilities.getCurrentDateAndTimeDecSeconds( 30 );

        if ( SystemUtilities.isDateAndTimeAfterAt( currentDateAndTimeMinus30Seconds.format(), lastNotificationToExternal.format() ) ) {

          bResult = true;

        }

      }
      else {

        bResult = true;

      }

    }
    catch ( error ) {

      //

    }

    return bResult;

  }

  public async notifyToExternal( strKind: string = "error",
                                 strMessage: string = "Error to get odin-v2 order to odin-v1.",
                                 logger: any = null ) {

    await NotificationManager.publishToExternal(
                                                 {
                                                   body: {
                                                           kind: strKind,
                                                           text: strMessage,
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

      const strLanguage = "en_US";

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
                       DeliveryAt: "2020-10-03"// SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_10 ) //2020-10-02
                     }

      const odinV2ReponseData = await OdinV2APIRequestService.callGetNewDeliveryOrder( backend,
                                                                                       headers,
                                                                                       params );


      if ( !odinV2ReponseData ) {

          if ( this.canNotifyToExternal( CheckOdinV2NewOrdersTask_001.lastExternalNotification ) ) {

            const strMessage = util.format( "No response data from odin-v2 backend" );

            await this.notifyToExternal( "error", strMessage );

            CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

        }

      }
      else if ( odinV2ReponseData?.error ) {

        if ( this.canNotifyToExternal( CheckOdinV2NewOrdersTask_001.lastExternalNotification ) ) {

          const strMessage = util.format( "Unexpected error [%s]", odinV2ReponseData?.error?.message );

          await this.notifyToExternal( "error", strMessage );

          CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

        }

      }
      else if ( odinV2ReponseData?.error === null ) {

        if ( odinV2ReponseData.output?.status === 200 &&
          odinV2ReponseData.output?.body?.Data?.length > 0 ) {

          //Get the data json from response body
          const deliveryOrderData = odinV2ReponseData.output?.body?.Data[ 0 ];

          //Process the insert in odin legacy database using the data from variable deliveryOrderData

          //The logic here

          let orderInDB =  await ordersService.getById( deliveryOrderData.id,null,currentTransaction,logger ) as any;

          if ( orderInDB === null ) {

            let userEstablishmentInDB = await usersService.getByFirstName( deliveryOrderData.bizOrigin.Name,
                                                                           null,
                                                                           currentTransaction,
                                                                           logger ) as any;

            if ( userEstablishmentInDB === null ) { //does not exist this user-establishment create a new

              /*userEstablishmentInDB = await usersService.createOrUpdate(
                                                                {
                                                                  // id:,
                                                                  // first_name:,
                                                                  // last_name:,
                                                                  // short_name:,
                                                                  // phone:"",
                                                                  // email:,
                                                                  // password:"buscarclave", // no se tiene buscarla
                                                                  // role:"restaurant",
                                                                  // restriction:"",
                                                                  // created_at:,
                                                                  // updated_at:
                                                                },
                                                                null,
                                                                currentTransaction,
                                                                logger
                                                              );
*/
               userEstablishmentInDB = Error;

            }

            if ( userEstablishmentInDB instanceof Error === false ) {

              let establishmentInDB = await establishmentsService.getByUserId( userEstablishmentInDB.id,null,currentTransaction,logger ) as any;

              if ( establishmentInDB === null ) { //does not exist this establishment create a new

               /* establishmentInDB = await establishmentsService.createOrUpdate(
                                                                                {

                                                                                },
                                                                                null,
                                                                                currentTransaction,
                                                                                logger
                                                                                );
*/            establishmentInDB = Error;

              }

              if ( establishmentInDB instanceof Error === false ) {

                let strAddressToFind = deliveryOrderData.bizDestination.FormattedAddress;

                if ( strAddressToFind.indexOf( "," ) > 0 ) {

                  strAddressToFind = strAddressToFind.substring( 0, strAddressToFind.indexOf(',') );

                }

                let locationInDB = await locationsService.getByAddress( strAddressToFind,null,currentTransaction,logger ) as any;

                if ( locationInDB === null ) {  //does not exist this location create a new

                  let strZipCodeToFind = deliveryOrderData.bizDestination.FormattedAddress;

                  "14250 SW 136th St, Miami, FL 33186, USA";
                  let zipCodeInDB = await zip_codesService.getByZipCode( strZipCodeToFind,null,currentTransaction,logger ) as any;

                  //verify zip_code if not exist create

                  //verify_phone if not exist create

                  locationInDB = await locationsService.createOrUpdate(
                                                                        {

                                                                        },
                                                                        null,
                                                                        currentTransaction,
                                                                        logger
                                                                      ) as any;

                }

                if ( locationInDB instanceof Error === false ) {

                  let QuantityOrderMiles = Math.round(deliveryOrderData.bizDestination.ExtraData.Business.Finish.Distance.DistanceMeter*0.062137)/100;

                  let orderInDB = await ordersService.createOrUpdate(
                                                                      {
                                                                        id: deliveryOrderData.Id,
                                                                        user_id: establishmentInDB.user_id,
                                                                        location_id: locationInDB.id,
                                                                        establishment_id: establishmentInDB.id,
                                                                        payment_method: deliveryOrderData.Payments[0].bizPaymentMethod.Name,
                                                                        payment_method1: "",
                                                                        payment_method2: "",
                                                                        status: "commited",
                                                                        state: "done",
                                                                        amount1: 0,
                                                                        amount2: 0,
                                                                        original_amount: deliveryOrderData.Payments[0].Amount,
                                                                        created_at: SystemUtilities.getCurrentDateAndTimeFrom(deliveryOrderData.CreatedAt).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 ),
                                                                        updated_at: SystemUtilities.getCurrentDateAndTimeFrom(deliveryOrderData.CreatedAt).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 ),
                                                                        fee: establishmentInDB.fee,
                                                                        delivered: null,
                                                                        want_delivery_date:"1980-01-16",
                                                                        want_delivery_time:"00:00:00",
                                                                        extra_miles: Math.ceil(QuantityOrderMiles-establishmentInDB.base_miles),
                                                                        inspected: 0,
                                                                        status_number: null,
                                                                        client_name: deliveryOrderData.bizDestination.Name,
                                                                        extra_miles_driver_order: Math.ceil(QuantityOrderMiles-establishmentInDB.base_miles_driver),
                                                                        order_miles_quantity: QuantityOrderMiles,
                                                                        catering_type: 0,
                                                                        qty_person_catering: 0,
                                                                        fee_driver_order: establishmentInDB.fee_driver,
                                                                        fee_catering_order: 0,
                                                                        qty_meals: 0
                                                                      },
                                                                      false,
                                                                      currentTransaction,
                                                                      logger
                                                                      ) as any;

                  if ( orderInDB instanceof Error === false ) {

                    let driverInDB = await driversService.getById(deliveryOrderData.UserId,null,currentTransaction,logger) as any;

                    if ( driverInDB === null  ) { //driver does not exist create it

                      let userDriverInDB = await usersService.getById( deliveryOrderData.sysUser.Id,null,currentTransaction,logger ) as any;

                      if ( userDriverInDB === null ) { //does not exist this user-driver create a new

                        userDriverInDB = await usersService.createOrUpdate(
                                                                          {
                                                                            // id:,
                                                                            // first_name:,
                                                                            // last_name:,
                                                                            // short_name:,
                                                                            // phone:"",
                                                                            // email:,
                                                                            // password:"buscarclave", // no se tiene buscarla
                                                                            // role:"restaurant",
                                                                            // restriction:"",
                                                                            // created_at:,
                                                                            // updated_at:
                                                                          },
                                                                          null,
                                                                          currentTransaction,
                                                                          logger
                                                                        );

                      }

                      if ( userDriverInDB instanceof Error === false ) {

                      driverInDB = await driversService.createOrUpdate( {
                                                                        /*  id:, 'char(36)', 'NO', 'PRI', NULL, ''
                                                                          user_id', 'char(36)', 'NO', 'MUL', NULL, ''
                                                                          zone', 'varchar(255)', 'YES', '', NULL, ''
                                                                          status', 'int(11)', 'YES', '', NULL, ''
                                                                          active', 'int(11)', 'YES', '', NULL, ''
                                                                          points_accumulated', 'int(10) unsigned', 'NO', '', '0', ''
                                                                          deliveries_completed', 'int(10) unsigned', 'NO', '', '0', ''
                                                                          qualification', 'int(10) unsigned', 'NO', '', '0', ''
                                                                          birthday', 'date', 'YES', '', NULL, ''
                                                                          social_id', 'varchar(255)', 'YES', '', NULL, ''
                                                                          address', 'varchar(255)', 'YES', '', NULL, ''
                                                                          car_model', 'varchar(255)', 'YES', '', NULL, ''
                                                                          license_number', 'varchar(255)', 'YES', '', NULL, ''
                                                                          insurance_expire_day', 'date', 'YES', '', NULL, ''
                                                                          registration_expire_day', 'date', 'YES', '', NULL, ''
                                                                          selfie', 'mediumtext', 'YES', '', NULL, ''
                                                                          hear_about_us', 'varchar(255)', 'YES', '', NULL, ''
                                                                          payment_method', 'varchar(255)', 'YES', '', NULL, ''
                                                                          bank_name', 'varchar(255)', 'YES', '', NULL, ''
                                                                          routing_number', 'varchar(255)', 'YES', '', NULL, ''
                                                                          bank_account_number', 'varchar(255)', 'YES', '', NULL, ''
                                                                          tax_information', 'varchar(255)', 'YES', '', NULL, ''
                                                                          show_name', 'tinyint(1)', 'NO', '', '0', ''
                                                                          created_at', 'timestamp', 'NO', '', '0000-00-00 00:00:00', ''
                                                                          updated_at', 'timestamp', 'NO', '', '0000-00-00 00:00:00'*/
                                                                        },
                                                                        false,
                                                                        currentTransaction,
                                                                        logger);

                    }

                    if ( driverInDB instanceof Error === false ) {

                    }

                    let deliveryInDB = await deliveriesService.createOrUpdate( {
                                                                                  id: uuid4,
                                                                                  order_id: orderInDB.user_id,
                                                                                  driver_id: deliveryOrderData.UserId,
                                                                                  establishment_id: establishmentInDB.id,
                                                                                  qualification:0,
                                                                                  tip1:0,
                                                                                  tip2:0,
                                                                                  tip:0,
                                                                                  tip_method: deliveryOrderData.Payments[0].bizPaymentMethod.Name,
                                                                                  tip_method1: "",
                                                                                  tip_method2: "",
                                                                                  tip_validated_at: "",
                                                                                  created_at: SystemUtilities.getCurrentDateAndTimeFrom(deliveryOrderData.CreatedAt).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 ),
                                                                                  updated_at: SystemUtilities.getCurrentDateAndTimeFrom(deliveryOrderData.CreatedAt).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 )
                                                                                },
                                                                                false,
                                                                                currentTransaction,
                                                                                logger
                                                                              ) as any;

                    if ( deliveryInDB instanceof Error === false ) {

                      let ticketImageInDB = await ticket_imagesService.createOrUpdate( {
                                                                                          id: deliveryOrderData.Images[0].Id,
                                                                                          order_id: orderInDB.user_id,
                                                                                          image: null,
                                                                                          migrated: 2,
                                                                                          url: "@__baseurl__@?id="+deliveryOrderData[0].Image+"&auth=@__auth__@&thumbnail=0",
                                                                                          lock: null,
                                                                                          created_at: SystemUtilities.getCurrentDateAndTimeFrom(deliveryOrderData.Images[0].CreatedAt).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 ),
                                                                                        },
                                                                                        false,
                                                                                        currentTransaction,
                                                                                        logger
                                                                                      ) as any;

                      if ( ticketImageInDB instanceof Error === false ) {

                        bApplyTransaction = true;

                        bResult = true;

                      }
                      else { //error creation of ticketImage

                        const error = ticketImageInDB as Error;

                        const strMessage = util.format( "Unexpected error [%s]", error?.message );

                        debugMark( "ERROR: " + strMessage );

                        if ( this.canNotifyToExternal( CheckOdinV2NewOrdersTask_001.lastExternalNotification ) ) {

                          await this.notifyToExternal( "error", strMessage );

                          CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

                        }

                      }

                    }
                    else { //error creation of delivery

                      const error = deliveryInDB as Error;

                      const strMessage = util.format( "Unexpected error [%s]", error?.message );

                      debugMark( "ERROR: " + strMessage );

                      if ( this.canNotifyToExternal( CheckOdinV2NewOrdersTask_001.lastExternalNotification ) ) {

                        await this.notifyToExternal( "error", strMessage );

                        CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

                      }

                    }

                  }
                  else { //error creation of order

                    const error = orderInDB as Error;

                    const strMessage = util.format( "Unexpected error [%s]", error?.message );

                    debugMark( "ERROR: " + strMessage );

                    if ( this.canNotifyToExternal( CheckOdinV2NewOrdersTask_001.lastExternalNotification ) ) {

                      await this.notifyToExternal( "error", strMessage );

                      CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

                    }

                  }

                }
                else { //error creation of location

                  const error = locationInDB as Error;

                  const strMessage = util.format( "Unexpected error [%s]", error?.message );

                  debugMark( "ERROR: " + strMessage );

                  if ( this.canNotifyToExternal( CheckOdinV2NewOrdersTask_001.lastExternalNotification ) ) {

                    await this.notifyToExternal( "error", strMessage );

                    CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

                  }

                }

              }
              else {  //error creation of establishment

                const error = establishmentInDB as Error;

                const strMessage = util.format( "Unexpected error [%s]", error?.message );

                debugMark( "ERROR: " + strMessage );

                if ( this.canNotifyToExternal( CheckOdinV2NewOrdersTask_001.lastExternalNotification ) ) {

                  await this.notifyToExternal( "error", strMessage );

                  CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

                }

              }

            }
            else { //error creation of user-establishment

              const error = userEstablishmentInDB as Error;

              const strMessage = util.format( "Unexpected error [%s]", error?.message );

              debugMark( "ERROR: " + strMessage );

              if ( this.canNotifyToExternal( CheckOdinV2NewOrdersTask_001.lastExternalNotification ) ) {

                await this.notifyToExternal( "error", strMessage );

                CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

              }

            }

          }
          else if ( orderInDB instanceof Error === false ) {

            const error = orderInDB as Error;

            const strMessage = util.format( "Unexpected error [%s]", error?.message );

            debugMark( "ERROR: " + strMessage );

            if ( this.canNotifyToExternal( CheckOdinV2NewOrdersTask_001.lastExternalNotification ) ) {

              await this.notifyToExternal( "error", strMessage );

              CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

            }

          }
          else {  //error order already exist

            const strMessage = util.format( "The order with id [%s] already exists", deliveryOrderData.Id );

            debugMark( "ERROR: " + strMessage );

            if ( this.canNotifyToExternal( CheckOdinV2NewOrdersTask_001.lastExternalNotification ) ) {

              await this.notifyToExternal( "error", strMessage );

              CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

            }

          }

          //Check deliveryOrderData.Id not exist in odin database in order table

          //Check the .env file the ENV variable, in local machine always must be in ENV=dev
          //if en develop you need move forward comment the next 2 lines and 239 line

          /*if ( process.env.ENV === "prod" ||
               process.env.ENV === "test" ) {

            //The next call is required to make move forward to the next delivery order
            await OdinV2APIRequestService.callNewDeliveryOrderMark( backend,
                                                                    headers,
                                                                    {
                                                                      Id: deliveryOrderData.Id //Mark the delivery order as processed
                                                                    } );

          } //Comment here too
*/
        }
        else if ( odinV2ReponseData.output?.status === 404 ) {

          debugMark( "No new delivery orders found in odin v2 backend..." );

        }
        else {

          const strMessage = util.format( "Unexpected response code [%s] from odin v2 backend", odinV2ReponseData.output?.status );

          debugMark( "WARNING: " + strMessage );

          if ( this.canNotifyToExternal( CheckOdinV2NewOrdersTask_001.lastExternalNotification ) ) {

            await this.notifyToExternal( "warning", strMessage );

            CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

          }

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
