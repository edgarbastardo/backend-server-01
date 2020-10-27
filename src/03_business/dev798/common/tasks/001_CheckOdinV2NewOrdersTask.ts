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

import CommonConstants from "../../../../02_system/common/CommonConstants";
//import SystemConstants from '../../../../02_system/common/SystemContants';

import CommonUtilities from "../../../../02_system/common/CommonUtilities";
import SystemUtilities from "../../../../02_system/common/SystemUtilities";

import DBConnectionManager from '../../../../02_system/common/managers/DBConnectionManager';
import NotificationManager from '../../../../02_system/common/managers/NotificationManager';
//import I18NManager from "../../../../02_system/common/managers/I18Manager";
//import GeoMapManager from "../../../../02_system/common/managers/GeoMapManager"; //Google map api call manager. check en .env.secrets if not exist copy and rename .env.secrets.template to .env.secrets

//import CommonRequestService from "../../../common/services/CommonRequestService";
import OdinV2APIRequestService from "../../../common/services/OdinV2APIRequestService";
import usersService from '../../../common/database/secondary/services/usersService';
import establishmentsService from '../../../common/database/secondary/services/establishmentsService';
import locationsService from '../../../common/database/secondary/services/locationsService';
import ordersService from '../../../common/database/secondary/services/ordersService';
import deliveriesService from '../../../common/database/secondary/services/deliveriesService';
import ticket_imagesService from '../../../common/database/secondary/services/ticket_imagesService';
import driversService from '../../../common/database/secondary/services/driversService';
import zip_codesService from '../../../common/database/secondary/services/zip_codesService';
import phonesService from '../../../common/database/secondary/services/phonesService';

let debug = require( 'debug' )( '001_CheckOdinV2NewOrdersTask' );

export default class CheckOdinV2NewOrdersTask_001 {

  public readonly Name = "CheckOdinV2NewOrdersTask_001";

  //public static minutesOfLastCleanPath: any = null;

  public static intRunNumber = 0;

  public static lastExternalNotification = null;

  public static deliveryOrdersId = [];

  public static deliveryOrdersShortId = [];

  static processNextDeliveryOrderId(): string {

    let strResult = null;

    if ( CheckOdinV2NewOrdersTask_001.deliveryOrdersId?.length > 0 ) {

      strResult = CheckOdinV2NewOrdersTask_001.deliveryOrdersId[ 0 ];

      if ( !strResult.trim() ) {

        strResult = null;

      }

      CheckOdinV2NewOrdersTask_001.deliveryOrdersId.splice( 0, 1 ); //Delete the first Id in the array

    }

    return strResult;

  }

  static processNextDeliveryOrderShortId(): string {

    let strResult = null;

    if ( CheckOdinV2NewOrdersTask_001.deliveryOrdersShortId?.length > 0 ) {

      strResult = CheckOdinV2NewOrdersTask_001.deliveryOrdersShortId[ 0 ];

      if ( !strResult.trim() ) {

        strResult = null;

      }

      CheckOdinV2NewOrdersTask_001.deliveryOrdersShortId.splice( 0, 1 ); //Delete the first Id in the array

    }

    return strResult;

  }

  public async init( params: any, logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      CheckOdinV2NewOrdersTask_001.deliveryOrdersId = CommonUtilities.parseJSON( process.env.DELIVERY_ORDERS_ID || "[]",
                                                                                 null,
                                                                                 true );

      CheckOdinV2NewOrdersTask_001.deliveryOrdersShortId = CommonUtilities.parseJSON( process.env.DELIVERY_ORDERS_SHORT_ID || "[]",
                                                                                      null,
                                                                                      true );

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

  public canNotifyToExternal( lastNotificationToExternal: any,
                              bLongPeriod: boolean ): boolean {

    let bResult = false;

    try {

      const strMark = "F1640D7BD75E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      if ( lastNotificationToExternal ) {

        let currentDateAndTimeMinusXSeconds = null;

        if ( bLongPeriod ) {

          currentDateAndTimeMinusXSeconds = SystemUtilities.getCurrentDateAndTimeDecSeconds( 60 * 30 );

        }
        else {

          currentDateAndTimeMinusXSeconds = SystemUtilities.getCurrentDateAndTimeDecSeconds( 10 );

        }

        if ( process.env.ENV === "dev" ||
             process.env.ENV === "test" ) {

          debugMark( "Long period? [%s],", bLongPeriod );
          debugMark( "Current date and time minus 10 seconds is [%s]", currentDateAndTimeMinusXSeconds.format() );
          debugMark( "Last notification to external is [%s]", lastNotificationToExternal?.format() );

        }

        if ( SystemUtilities.isDateAndTimeAfterAt( currentDateAndTimeMinusXSeconds?.format(), lastNotificationToExternal.format() ) ) {

          bResult = true;

        }

        if ( process.env.ENV === "dev" ||
             process.env.ENV === "test" ) {

          debugMark( "Notify to external? [%s],", bResult );

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
                                                         },
                                                   transport: {
                                                                "NProvider02": [
                                                                                 "#fetch-delivery-order-from-odin-v2"
                                                                               ]
                                                              }
                                                 },
                                                 logger
                                               );

  }

  public async formatMessageError01( strDeliveryOrderId: string,
                                     lastExported: any,
                                     error: any,
                                     logger: any ) {

    try {

      const debugMark = debug.extend( CheckOdinV2NewOrdersTask_001.intRunNumber + "-EF70265F5D58" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      const strMessage = util.format( "Unexpected error [%s]. To process the delivery order with id [%s]", error?.message, strDeliveryOrderId );

      debugMark( strMessage );

      if ( this.canNotifyToExternal( lastExported ?
                                     SystemUtilities.getCurrentDateAndTimeFrom( lastExported ):
                                     CheckOdinV2NewOrdersTask_001.lastExternalNotification,
                                     lastExported !== null ) ) {

        if ( logger &&
             logger.error === "function" ) {

          logger.error( error );

        }

        await this.notifyToExternal( "error", strMessage );

        CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

      }

    }
    catch ( error ) {

      if ( logger &&
           logger.error === "function" ) {

        logger.error( error );

      }

    }

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

      const strDeliveryOrderId = CheckOdinV2NewOrdersTask_001.processNextDeliveryOrderId();

      let strDeliveryOrderShortId = null;

      if ( !strDeliveryOrderId ) {

        strDeliveryOrderShortId = CheckOdinV2NewOrdersTask_001.processNextDeliveryOrderShortId();

      }

      const strDeliveryAt = process.env.DELIVERY_ORDER_AT || SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_10 );

      const debugMark = debug.extend( CheckOdinV2NewOrdersTask_001.intRunNumber + "-4946C11DC1AA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      debugMark( "Running task..." );

      if ( !strDeliveryOrderId ) {

        debugMark( "Checking for new delivery orders in odin v2 backend at date [%s]...", strDeliveryAt );

      }
      else {

        debugMark( "Checking for the delivery order with id [%s] in odin v2 backend...", strDeliveryOrderId );

      }

      const strOdinV2Url01 = process.env.ODIN_V2_URL_01; //check env.secrets file in the root of project. if not exists copy env.secrets.template and rename to env.secrets
      const strOdinV2APIKey01 = process.env.ODIN_V2_API_KEY_01; //check env.secrets file in the root of project

      const backend = {
                        url: [
                               strOdinV2Url01
                             ]
                      }

      const headers = {
                        "Content-Type": "application/json",
                        "Authorization": strOdinV2APIKey01
                      }

      const params = {
                       Id: strDeliveryOrderId, //Force to fetch specific delivery order id from odin v2 backend this parameter has priority over ShortId, DeliveryAt param
                       ShortId: strDeliveryOrderShortId, //Force to fetch specific delivery order short id from odin v2 backend this parameter has priority over DeliveryAt param
                       DeliveryAt: strDeliveryAt //2020-10-02
                     }

      const odinV2ReponseData = await OdinV2APIRequestService.callGetNewDeliveryOrder( backend,
                                                                                       headers,
                                                                                       params );

      if ( !odinV2ReponseData ||
           ( !odinV2ReponseData.error &&
             !odinV2ReponseData.output ) ) {

        const strMessage = util.format( "No response data from odin-v2 backend" );

        debugMark( "WARNING: " + strMessage );

        if ( this.canNotifyToExternal( CheckOdinV2NewOrdersTask_001.lastExternalNotification, false ) ) {

          if ( logger &&
               logger.warning === "function" ) {

            logger.warning( strMessage );

          }

          await this.notifyToExternal( "warning", strMessage );

          CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

        }

      }
      else if ( odinV2ReponseData?.error ) {

        const strMessage = util.format( "Unexpected error [%s]", odinV2ReponseData?.error?.message );

        debugMark( "ERROR: " + strMessage );

        if ( this.canNotifyToExternal( CheckOdinV2NewOrdersTask_001.lastExternalNotification, false ) ) {

          if ( logger &&
               logger.error === "function" ) {

            logger.error( odinV2ReponseData?.error );

          }

          await this.notifyToExternal( "error", strMessage );

          CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

        }

      }
      else if ( odinV2ReponseData?.error === null ) {

        if ( odinV2ReponseData.output?.status === 200 &&
             odinV2ReponseData.output?.body?.Data?.length > 0 ) {

          let bUpdateDeliveryOrderExportedMark = false;

          //Get the data json from response body
          const deliveryOrderData = odinV2ReponseData.output?.body?.Data[ 0 ];

          try {

            //Process the insert in odin legacy database using the data from variable deliveryOrderData

            let orderInDB =  await ordersService.getById( deliveryOrderData.Id,
                                                          null,
                                                          currentTransaction,
                                                          logger ) as any;

            if ( !orderInDB ) {

              if ( !deliveryOrderData.bizDestination.Tag ||
                   deliveryOrderData.bizDestination.Tag.indexOf( "#ADDRESS_ERROR#" ) === -1 ) {

                let userEstablishmentInDB = await usersService.getByFirstName( deliveryOrderData.bizOrigin.Name,
                                                                               null,
                                                                               currentTransaction,
                                                                               logger ) as any;

                if ( userEstablishmentInDB !== null ) {

                  let establishmentInDB = await establishmentsService.getByUserId( userEstablishmentInDB.id,
                                                                                   null,
                                                                                   currentTransaction,
                                                                                   logger ) as any;

                  if ( establishmentInDB !== null ) {

                    let strAddressToFind = deliveryOrderData.bizDestination.FormattedAddress;

                    if ( strAddressToFind.indexOf( "," ) > 0 ) {

                      strAddressToFind = strAddressToFind.substring( 0, strAddressToFind.indexOf( "," ) );

                    }

                    let locationInDB = await locationsService.getByAddress( strAddressToFind,
                                                                            null,
                                                                            currentTransaction,
                                                                            logger ) as any;

                    if ( locationInDB === null ) {  //does not exist this location create a new

                      let strZipCodeToFind = deliveryOrderData.bizDestination.FormattedAddress;

                      strZipCodeToFind = strZipCodeToFind.substring( strZipCodeToFind.lastIndexOf( ", FL " ) +5 ,
                                                                   strZipCodeToFind.lastIndexOf( ", USA" ) );

                      let zipCodeInDB = await zip_codesService.getByZipCode( strZipCodeToFind,
                                                                             null,
                                                                             currentTransaction,
                                                                             logger ) as any;

                    if ( zipCodeInDB === null ) {   //does not exit this zip_code create a new

                        zipCodeInDB = await zip_codesService.createOrUpdate(
                                                                             {
                                                                               id: SystemUtilities.getUUIDv4(),
                                                                               zip_code: strZipCodeToFind,
                                                                               created_at: SystemUtilities.getCurrentDateAndTimeFrom( deliveryOrderData.CreatedAt ).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 ),
                                                                               updated_at: SystemUtilities.getCurrentDateAndTimeFrom( deliveryOrderData.CreatedAt ).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 )
                                                                             },
                                                                             false,
                                                                             currentTransaction,
                                                                             logger
                                                                           );

                      }

                      if ( zipCodeInDB instanceof Error === false ) {

                        let strPhoneToFind = deliveryOrderData.bizDestination.Phone;

                        while ( strPhoneToFind?.indexOf( "-" ) !== -1) {

                          strPhoneToFind = strPhoneToFind.replace( "-", "" );

                        }

                        let phoneInDB = await phonesService.getByPhone( strPhoneToFind,
                                                                        null,
                                                                        currentTransaction,
                                                                        logger ) as any;

                        if ( phoneInDB === null ) {   //does not exit this phone create a new

                          phoneInDB = await phonesService.createOrUpdate(
                                                                          {
                                                                            id: SystemUtilities.getUUIDv4(),
                                                                            phone: strPhoneToFind,
                                                                            created_at: SystemUtilities.getCurrentDateAndTimeFrom( deliveryOrderData.CreatedAt ).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 ),
                                                                            updated_at: SystemUtilities.getCurrentDateAndTimeFrom( deliveryOrderData.CreatedAt ).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 )
                                                                          },
                                                                          false,
                                                                          currentTransaction,
                                                                          logger
                                                                        );

                        }

                        if ( phoneInDB instanceof Error === false ) {

                          locationInDB = await locationsService.createOrUpdate(
                                                                                {
                                                                                  id: SystemUtilities.getUUIDv4(),
                                                                                  user_id: establishmentInDB.user_id,
                                                                                  zip_code_id: zipCodeInDB.id,
                                                                                  phone_id: phoneInDB.id,
                                                                                  state: "Florida",
                                                                                  city: "Miami",
                                                                                  address: strAddressToFind,
                                                                                  description: "main",
                                                                                  address_status: "",
                                                                                  address_type: "residential",
                                                                                  created_at: SystemUtilities.getCurrentDateAndTimeFrom( deliveryOrderData.CreatedAt ).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 ),
                                                                                  updated_at: SystemUtilities.getCurrentDateAndTimeFrom( deliveryOrderData.CreatedAt ).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 )
                                                                                },
                                                                                null,
                                                                                currentTransaction,
                                                                                logger
                                                                              ) as any;

                        }
                        else {  //error creating phone

                          bUpdateDeliveryOrderExportedMark = true;

                          await this.formatMessageError01( deliveryOrderData.Id,
                                                            deliveryOrderData.LastExported,
                                                            phoneInDB as Error,
                                                            logger );

                        }

                      }
                      else {  //error creating zip_code

                        bUpdateDeliveryOrderExportedMark = true;

                        await this.formatMessageError01( deliveryOrderData.Id,
                                                         deliveryOrderData.LastExported,
                                                         zipCodeInDB as Error,
                                                         logger );

                      }

                    }

                    if ( locationInDB instanceof Error === false ) {

                      let QuantityOrderMiles = Math.round( deliveryOrderData.bizDestination.ExtraData.Business.Finish.Distance.DistanceMeter * 0.062137 ) / 100;

                      let tipPayment = [];
                      let orderPayment = [];
                      let payment = deliveryOrderData.Payments;

                      const paymentMethodforOdinV1 = ( strId: String ) => {

                        let result = "" ;

                        if ( strId === "95638928-2c44-4689-b903-fb275703b674" ) {

                          result = "cash"

                        }
                        else if ( strId === "b7ec0892-e9b9-449e-bcb1-f20975846a9a" ) {

                          result = "credit"

                        }
                        else if ( strId === "e0959e93-dbcc-4640-8ae3-156f15d2acfc" ) {

                          result = "sq"

                        }
                        else if ( strId === "e03c8882-2a2e-4fa8-9889-05f9291467e2" ) {

                          result = "prepaid"

                        }
                        else if ( strId === "fb1d9158-6393-4381-8214-5d8dc3e9d908" ) {

                          result = "rep";

                        }

                        return result;

                      }

                      for ( let i = 0; i < payment.length; i++ ) {

                        if ( payment[ i ].PayKind === 100 ) {

                          orderPayment.push( payment[ i ] );

                        }
                        else if ( payment[ i ].PayKind === 200 ) {

                          tipPayment.push( payment[ i ] );

                        }

                      }

                      let strPaymentMethod = "";
                      let strPaymentMethod1 = "";
                      let strPaymentMethod2 = "";
                      let dblOriginalAmount = 0;
                      let dblAmount1 = 0;
                      let dblAmount2 = 0;

                      if ( orderPayment.length >= 2 ) {

                        strPaymentMethod = "mixed";

                        dblAmount1 = Number.parseFloat( orderPayment[ 0 ].Amount );

                        dblAmount2 = Number.parseFloat( orderPayment[ 1 ].Amount );

                        dblOriginalAmount = dblAmount1 + dblAmount2;

                        strPaymentMethod1 = paymentMethodforOdinV1( orderPayment[ 0 ].bizPaymentMethod.Id );

                        strPaymentMethod2 = paymentMethodforOdinV1( orderPayment[ 1 ].bizPaymentMethod.Id );

                      }
                      else {

                        strPaymentMethod = paymentMethodforOdinV1( orderPayment[ 0 ].bizPaymentMethod.Id );

                        dblOriginalAmount = orderPayment[ 0 ].Amount;

                    }

                    let dblExtraMiles = QuantityOrderMiles - establishmentInDB.base_miles > 0 ? Math.ceil( QuantityOrderMiles - establishmentInDB.base_miles ) : 0;

                    let dblExtraMilesDriver = QuantityOrderMiles - establishmentInDB.base_miles_driver > 0 ? Math.ceil( QuantityOrderMiles - establishmentInDB.base_miles_driver ) : 0;

                    let orderInDB = await ordersService.createOrUpdate(
                                                                        {
                                                                          id: deliveryOrderData.Id,
                                                                          user_id: establishmentInDB.user_id,
                                                                          location_id: locationInDB.id,
                                                                          establishment_id: establishmentInDB.id,
                                                                          payment_method: strPaymentMethod,
                                                                          payment_method1: strPaymentMethod1,
                                                                          payment_method2: strPaymentMethod2,
                                                                          status: "committed",
                                                                          state: "done",
                                                                          amount1: dblAmount1,
                                                                          amount2: dblAmount2,
                                                                          original_amount: Math.round( dblOriginalAmount * 100 ) / 100,
                                                                          created_at: SystemUtilities.getCurrentDateAndTimeFrom(deliveryOrderData.CreatedAt).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 ),
                                                                          updated_at: SystemUtilities.getCurrentDateAndTimeFrom(deliveryOrderData.CreatedAt).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 ),
                                                                          fee: establishmentInDB.fee,
                                                                          delivered: null,
                                                                          want_delivery_date:"1980-01-16",
                                                                          want_delivery_time:"00:00:00",
                                                                          extra_miles: dblExtraMiles,
                                                                          inspected: 0,
                                                                          status_number: null,
                                                                          client_name: deliveryOrderData.bizDestination.Name,
                                                                          extra_miles_driver_order: dblExtraMilesDriver,
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

                        let driverInDB = await driversService.getById( deliveryOrderData.UserId,
                                                                       null,
                                                                       currentTransaction,
                                                                       logger ) as any;

                        if ( driverInDB === null ) { //driver does not exist create it

                          let userDriverInDB = await usersService.getById( deliveryOrderData.sysUser.Id,
                                                                           null,
                                                                           currentTransaction,
                                                                           logger ) as any;

                          if ( userDriverInDB === null ) { //does not exist this user-driver create a new

                            let strPassword = deliveryOrderData.sysUser.Password;

                            strPassword =  strPassword.replace( "$2b$10$", "$2y$10$" );

                            let strShortName = deliveryOrderData.sysUser.sysPerson.FirstName?.substring( 0, 2 ) +
                                               deliveryOrderData.sysUser.sysPerson.LastName?.substring( 0, 2 );

                            userDriverInDB = await usersService.createOrUpdate(
                                                                                {
                                                                                  id: deliveryOrderData.sysUser.Id,
                                                                                  first_name: deliveryOrderData.sysUser.sysPerson.FirstName,
                                                                                  last_name: deliveryOrderData.sysUser.sysPerson.LastName,
                                                                                  short_name: strShortName,
                                                                                  phone: deliveryOrderData.sysUser.sysPerson.Phone,
                                                                                  email: deliveryOrderData.sysUser.Name,
                                                                                  password: strPassword,
                                                                                  role: "driver",
                                                                                  restriction: "",
                                                                                  created_at: SystemUtilities.getCurrentDateAndTimeFrom( deliveryOrderData.CreatedAt ).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 ),
                                                                                  updated_at: SystemUtilities.getCurrentDateAndTimeFrom( deliveryOrderData.CreatedAt ).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 )
                                                                                },
                                                                                null,
                                                                                currentTransaction,
                                                                                logger
                                                                              );

                          }

                          if ( userDriverInDB instanceof Error === false ) {

                            driverInDB = await driversService.createOrUpdate(
                                                                              {
                                                                                id: deliveryOrderData.sysUser.Id,
                                                                                user_id: deliveryOrderData.sysUser.Id,
                                                                                status: 0,
                                                                                active: 1,
                                                                                points_accumulated: 0,
                                                                                deliveries_completed: 0,
                                                                                qualification: 0,
                                                                                show_name: 1,
                                                                                created_at: SystemUtilities.getCurrentDateAndTimeFrom( deliveryOrderData.CreatedAt ).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 ),
                                                                                updated_at: SystemUtilities.getCurrentDateAndTimeFrom( deliveryOrderData.CreatedAt ).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 )
                                                                              },
                                                                              false,
                                                                              currentTransaction,
                                                                              logger
                                                                            );

                          }
                          else {  //error creation of user-driver

                            bUpdateDeliveryOrderExportedMark = true;

                            await this.formatMessageError01( deliveryOrderData.Id,
                                                             deliveryOrderData.LastExported,
                                                             userDriverInDB as Error,
                                                             logger );

                          }

                        }

                        if ( driverInDB instanceof Error === false ) {

                          let strTipMethod = "";
                          let strTipMethod1 = "";
                          let strTipMethod2 = "";
                          let dblTip = 0;
                          let dblTip1 = 0;
                          let dblTip2 = 0;

                          if ( tipPayment.length >= 2 ) {

                            strTipMethod = "mixed";

                            dblTip1 = Number.parseFloat( tipPayment[ 0 ].Amount );

                            dblTip2 = Number.parseFloat( tipPayment[ 1 ].Amount );

                            dblTip = dblTip1 + dblTip2;

                            strTipMethod1 = paymentMethodforOdinV1( tipPayment[ 0 ].bizPaymentMethod.Id );

                            strTipMethod2 = paymentMethodforOdinV1( tipPayment[ 1 ].bizPaymentMethod.Id );

                          }
                          else if ( tipPayment.length === 1 ) {

                            strTipMethod = paymentMethodforOdinV1( tipPayment[ 0 ].bizPaymentMethod.Id );

                            dblTip = Number.parseFloat( tipPayment[ 0 ].Amount );

                          }

                          let deliveryInDB = await deliveriesService.createOrUpdate(
                                                                                     {
                                                                                       id: SystemUtilities.getUUIDv4(),
                                                                                       order_id: orderInDB.id,
                                                                                       driver_id: driverInDB.id,
                                                                                       establishment_id: establishmentInDB.id,
                                                                                       qualification: 0,
                                                                                       tip1: dblTip1,
                                                                                       tip2: dblTip2,
                                                                                       tip: dblTip,
                                                                                       tip_method: strTipMethod,
                                                                                       tip_method1: strTipMethod1,
                                                                                       tip_method2: strTipMethod2,
                                                                                       created_at: SystemUtilities.getCurrentDateAndTimeFrom( deliveryOrderData.CreatedAt ).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 ),
                                                                                       updated_at: SystemUtilities.getCurrentDateAndTimeFrom( deliveryOrderData.CreatedAt ).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 )
                                                                                     },
                                                                                     false,
                                                                                     currentTransaction,
                                                                                     logger
                                                                                   ) as any;

                          if ( deliveryInDB instanceof Error === false ) {

                            let ticketImageInDB = await ticket_imagesService.createOrUpdate(
                                                                                             {
                                                                                               id: deliveryOrderData.Images[ 0 ].Id,
                                                                                               order_id: orderInDB.id,
                                                                                               image: null,
                                                                                               migrated: 2,
                                                                                               url: "@__baseurl__@?id="+deliveryOrderData.Images[ 0 ].Image+"&auth=@__auth__@&thumbnail=0",
                                                                                               lock: null,
                                                                                               created_at: SystemUtilities.getCurrentDateAndTimeFrom( deliveryOrderData.Images[0].CreatedAt ).format( CommonConstants._DATE_TIME_LONG_FORMAT_05 ),
                                                                                             },
                                                                                             false,
                                                                                             currentTransaction,
                                                                                             logger
                                                                                           ) as any;

                            if ( ticketImageInDB instanceof Error === false ) {

                              const strMessage = util.format( "Sucess import delivery order with id [%s]", deliveryOrderData.Id );

                              debugMark( "MESSAGE: " + strMessage );

                              bApplyTransaction = true;

                              bResult = true;

                              bUpdateDeliveryOrderExportedMark = true;

                            }
                            else { //error creation of ticketImage

                              bUpdateDeliveryOrderExportedMark = true;

                              await this.formatMessageError01( deliveryOrderData.Id,
                                                               deliveryOrderData.LastExported,
                                                               ticketImageInDB as Error,
                                                               logger );

                            }

                          }
                          else { //error creation of delivery

                            bUpdateDeliveryOrderExportedMark = true;

                            await this.formatMessageError01( deliveryOrderData.Id,
                                                             deliveryOrderData.LastExported,
                                                             deliveryInDB as Error,
                                                             logger );

                          }

                        }
                        else {  //error creation of driver

                          bUpdateDeliveryOrderExportedMark = true;

                          await this.formatMessageError01( deliveryOrderData.Id,
                                                           deliveryOrderData.LastExported,
                                                           driverInDB as Error,
                                                           logger );

                        }

                      }
                      else { //error creation of order

                        bUpdateDeliveryOrderExportedMark = true;

                        await this.formatMessageError01( deliveryOrderData.Id,
                                                         deliveryOrderData.LastExported,
                                                         orderInDB as Error,
                                                         logger );

                      }

                    }
                    else { //error creation of location

                      bUpdateDeliveryOrderExportedMark = true;

                      await this.formatMessageError01( deliveryOrderData.Id,
                                                       deliveryOrderData.LastExported,
                                                       locationInDB as Error,
                                                       logger );

                    }

                  }
                  else {  //error establishment does not exist

                    const strMessage = util.format( "The establishment with name [%s]. Not found in database.", deliveryOrderData.bizEstablishment.Name );

                    debugMark( "ERROR: " + strMessage );

                    if ( this.canNotifyToExternal( deliveryOrderData.LastExported ?
                                                   SystemUtilities.getCurrentDateAndTimeFrom( deliveryOrderData.LastExported ):
                                                   CheckOdinV2NewOrdersTask_001.lastExternalNotification,
                                                   deliveryOrderData.LastExported !== null ) ) {

                      if ( logger &&
                           logger.error === "function" ) {

                        logger.error( new Error( strMessage ) );

                      }

                      await this.notifyToExternal( "error", strMessage );

                      bUpdateDeliveryOrderExportedMark = true;
                      CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

                    }

                  }

                }
                else { //error user-establishment does not exist

                  const strMessage = util.format( "The user for establishment with name [%s]. Not found in database.", deliveryOrderData.bizEstablishment.Name );

                  debugMark( "ERROR: " + strMessage );

                  if ( this.canNotifyToExternal( deliveryOrderData.LastExported ?
                                                 SystemUtilities.getCurrentDateAndTimeFrom( deliveryOrderData.LastExported ):
                                                 CheckOdinV2NewOrdersTask_001.lastExternalNotification,
                                                 deliveryOrderData.LastExported !== null ) ) {

                    if ( logger &&
                         logger.error === "function" ) {

                      logger.error( new Error( strMessage ) );

                    }

                    await this.notifyToExternal( "error", strMessage );

                    bUpdateDeliveryOrderExportedMark = true;
                    CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

                  }

                }

              }
              else {

                const strMessage = util.format( "The delivery order with id [%s]. Has #Address_Error# tag.", deliveryOrderData.Id );

                debugMark( "ERROR: " + strMessage );

                if ( this.canNotifyToExternal( deliveryOrderData.LastExported ?
                                               SystemUtilities.getCurrentDateAndTimeFrom( deliveryOrderData.LastExported ):
                                               CheckOdinV2NewOrdersTask_001.lastExternalNotification,
                                               deliveryOrderData.LastExported !== null ) ) {

                  if ( logger &&
                       logger.error === "function" ) {

                    logger.error( new Error( strMessage ) );

                  }

                  await this.notifyToExternal( "error", strMessage );

                  bUpdateDeliveryOrderExportedMark = true;

                  CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

                }

              }

            }
            else if ( orderInDB instanceof Error ) {

              bUpdateDeliveryOrderExportedMark = true;

              await this.formatMessageError01( deliveryOrderData.Id,
                                               deliveryOrderData.LastExported,
                                               orderInDB as Error,
                                               logger );

            }
            else {  //error order already exist

              const strMessage = util.format( "The order with id [%s] already exists", deliveryOrderData.Id );

              debugMark( "ERROR: " + strMessage );

              if ( this.canNotifyToExternal( deliveryOrderData.LastExported ?
                                             SystemUtilities.getCurrentDateAndTimeFrom( deliveryOrderData.LastExported ):
                                             CheckOdinV2NewOrdersTask_001.lastExternalNotification,
                                             deliveryOrderData.LastExported !== null ) ) {

                if ( logger &&
                     logger.error === "function" ) {

                  logger.error( new Error( strMessage ) );

                }

                await this.notifyToExternal( "error", strMessage );

                bUpdateDeliveryOrderExportedMark = true;

                CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

              }

            }

          }
          catch ( error ) {

            const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

            sourcePosition.method = CheckOdinV2NewOrdersTask_001.name + "." + this.runTask.name;

            const strMark = "491508067579" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

          }

          if ( !deliveryOrderData.LastExported ||
               bUpdateDeliveryOrderExportedMark ) {

            //The next call is required to make move forward to the next delivery order
            await OdinV2APIRequestService.callNewDeliveryOrderMark( backend,
                                                                    headers,
                                                                    {
                                                                      Id: deliveryOrderData.Id, //Mark the delivery order as processed
                                                                      Status: bResult ? 1: 0 //Success processed 1 = Confirmed, 0 = Not confirmed
                                                                    } );

          }

        }
        else if ( odinV2ReponseData.output?.status === 404 ) {

          if ( !strDeliveryOrderId ) {

            debugMark( "No new delivery orders found in odin v2 backend..." );

          }
          else {

            const strMessage = util.format( "Delivery order with id [%s] not found in odin v2 backend...", strDeliveryOrderId );

            debugMark( "WARNING: " + strMessage );

            if ( this.canNotifyToExternal( CheckOdinV2NewOrdersTask_001.lastExternalNotification, false ) ) {

              if ( logger &&
                   logger.warning === "function" ) {

                logger.warning( strMessage );

              }

              await this.notifyToExternal( "warning", strMessage );

              CheckOdinV2NewOrdersTask_001.lastExternalNotification = SystemUtilities.getCurrentDateAndTime();

            }

          }

        }
        else {

          const strMessage = util.format( "Unexpected response code [%s] from odin v2 backend", odinV2ReponseData.output?.status );

          debugMark( "WARNING: " + strMessage );

          if ( this.canNotifyToExternal( CheckOdinV2NewOrdersTask_001.lastExternalNotification, false ) ) {

            if ( logger &&
                 logger.warning === "function" ) {

              logger.warning( strMessage );

            }

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
