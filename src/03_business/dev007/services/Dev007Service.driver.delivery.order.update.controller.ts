import cluster from "cluster";

//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import {
  Request,
  Response
} from "express";

import CommonConstants from "../../../02_system/common/CommonConstants";

import SystemUtilities from "../../../02_system/common/SystemUtilities";
import CommonUtilities from "../../../02_system/common/CommonUtilities";

import DBConnectionManager from "../../../02_system/common/managers/DBConnectionManager";
import I18NManager from "../../../02_system/common/managers/I18Manager";
import GeoMapManager from "../../../02_system/common/managers/GeoMapManager";

import BaseService from "../../../02_system/common/database/master/services/BaseService";

import BIZDriverInDeliveryZoneService from "../../common/database/master/services/BIZDriverInDeliveryZoneService";
import BIZEstablishmentService from "../../common/database/master/services/BIZEstablishmentService";
import BIZOriginService from "../../common/database/master/services/BIZOriginService";
import BIZDestinationService from "../../common/database/master/services/BIZDestinationService";
//import BIZDeliveryOrderStatusStepService from "../../common/database/master/services/BIZDeliveryOrderStatusStepService";
import BIZDeliveryOrderService from "../../common/database/master/services/BIZDeliveryOrderService";
//import BIZDeliveryOrderStatusService from "../../common/database/master/services/BIZDeliveryOrderStatusService";

import { SYSUser } from "../../../02_system/common/database/master/models/SYSUser";

import { BIZDeliveryOrder } from "../../common/database/master/models/BIZDeliveryOrder";
import { BIZDestination } from "../../common/database/master/models/BIZDestination";
import { BIZOrigin } from "../../common/database/master/models/BIZOrigin";
import { BIZDriverRoute } from "../../common/database/master/models/BIZDriverRoute";

const debug = require( "debug" )( "Dev007ServicesDriverDeliveryOrderUpdateController" );

export default class Dev007ServicesDriverDeliveryOrderUpdateController extends BaseService {

  //Common business services

  static async updateDeliveryOrder( request: Request,
                                    response: Response,
                                    transaction: any,
                                    logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by MiddlewareManager.middlewareSetContext function

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const userSessionStatus = context.UserSessionStatus;

      const bizDriverInDeliveryZoneInDB = await BIZDriverInDeliveryZoneService.getCurrentDeliveryZoneOfDriverAtDate( userSessionStatus.UserId,
                                                                                                                     null, //By default use the current date in the server
                                                                                                                     currentTransaction,
                                                                                                                     logger );

      if ( bizDriverInDeliveryZoneInDB instanceof Error ) {

        const error = bizDriverInDeliveryZoneInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "D08D7A157E63" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: error.name,
                               Message: error.message,
                               Details: await SystemUtilities.processErrorDetails( error ) //error
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( !bizDriverInDeliveryZoneInDB ) {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_DRIVER_DELIVERY_ZONE_NOT_SET",
                   Message: await I18NManager.translate( strLanguage, "The driver delivery zone not set." ),
                   Mark: "4EDABF5BABAD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_DRIVER_DELIVERY_ZONE_NOT_SET",
                               Message: await I18NManager.translate( strLanguage, "The driver delivery zone not set." ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else {

        let deliveryOrderRules = {
                                   Id: [ "required", "string", "min:36" ],
                                   Address: [ "required", "string" ],
                                   Phone: [ "required", "string" ],
                                   Name: [ "present", "string" ],
                                   //EMail: [ "present", "string" ],
                                   Comment: [ "present", "string" ],
                                 };

        let validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                   deliveryOrderRules,
                                                                   null,
                                                                   logger );

        if ( validator.passes() ) { //Validate request.body field values

          let bizDeliveryOrderInDB = await BIZDeliveryOrderService.getById( request.body.Id,
                                                                            currentTransaction,
                                                                            logger );

          if ( bizDeliveryOrderInDB instanceof Error ) {

            const error = bizDeliveryOrderInDB as any;

            result = {
                       StatusCode: 500, //Internal server error
                       Code: "ERROR_UNEXPECTED",
                       Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                       Mark: "2702125081E9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: error.name,
                                   Message: error.message,
                                   Details: await SystemUtilities.processErrorDetails( error ) //error
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( !bizDeliveryOrderInDB ) {

            result = {
                       StatusCode: 404, //Not found
                       Code: "ERROR_DELIVERY_ORDER_NOT_FOUND",
                       Message: await I18NManager.translate( strLanguage, "The delivery order with id %s. Not found in database.", request.body.EstablishmentId ),
                       Mark: "87CBC86751A7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_DELIVERY_ORDER_NOT_FOUND",
                                   Message: await I18NManager.translate( strLanguage, "The delivery order with id %s. Not found in database.", request.body.EstablishmentId ),
                                   Details: ""
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( bizDeliveryOrderInDB.UserId !== userSessionStatus.UserId ) {

            result = {
                       StatusCode: 403, //Fobidden
                       Code: "ERROR_DRIVER_NOT_ASSIGNED_TO_ORDER",
                       Message: await I18NManager.translate( strLanguage, "The delivery order with id %s. Not is not assigned to you.", request.body.Id ),
                       Mark: "86609351AB99" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_DRIVER_NOT_ASSIGNED_TO_ORDER",
                                   Message: await I18NManager.translate( strLanguage, "The delivery order with id %s. Not is not assigned to you.", request.body.Id ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( bizDeliveryOrderInDB.Kind !== 1 ) { //Only in Driver exclusive, the drive can modify the order

            result = {
                       StatusCode: 403, //Forbidden
                       Code: "ERROR_DRIVER_NOT_ALLOWED",
                       Message: await I18NManager.translate( strLanguage, "The driver not allowed to update delivery order in this delivery zone." ),
                       Mark: "69C639F3FEC3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_DRIVER_NOT_ALLOWED",
                                   Message: await I18NManager.translate( strLanguage, "The driver not allowed to update delivery order in this delivery zone." ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else {

            let bizOriginInDB = await BIZOriginService.getById( bizDeliveryOrderInDB.OriginId,
                                                                currentTransaction,
                                                                logger );

            //Refresh the data
            bizOriginInDB.Address = bizOriginInDB.bizEstablishment.Address;
            bizOriginInDB.FormattedAddress = bizOriginInDB.bizEstablishment.Address;
            bizOriginInDB.Latitude = bizOriginInDB.bizEstablishment.Latitude;
            bizOriginInDB.Longitude = bizOriginInDB.bizEstablishment.Longitude;
            bizOriginInDB.Name = bizOriginInDB.bizEstablishment.Name;
            bizOriginInDB.EMail = bizOriginInDB.bizEstablishment.EMail ? bizOriginInDB.bizEstablishment.EMail: null;
            bizOriginInDB.Phone = bizOriginInDB.bizEstablishment.Phone ? bizOriginInDB.bizEstablishment.Phone: null;

            bizOriginInDB = await BIZOriginService.createOrUpdate(
                                                                   ( bizOriginInDB as any ).dataValues,
                                                                   true,
                                                                   currentTransaction,
                                                                   logger
                                                                 );

            if ( bizOriginInDB &&
                 bizOriginInDB instanceof Error === false ) {

              const geocodedAddress = await GeoMapManager.geocodeServiceUsingAddress( [ request.body.Address ],
                                                                                      true,
                                                                                      logger );


              let bizDestinationInDB = await BIZDestinationService.getById( bizDeliveryOrderInDB.DestinationId,
                                                                            currentTransaction,
                                                                            logger );

              let distanceInfo = null;

              let strTag = bizDestinationInDB.Tag;

              if ( !geocodedAddress[ 0 ].formattedAddress ) {

                //Add the tag
                strTag = SystemUtilities.mergeTokens( strTag,
                                                      "#ADDRESS_ERROR#",
                                                      false,
                                                      logger );

              }
              else {

                //Remove th tag, just in case
                strTag = SystemUtilities.mergeTokens( strTag,
                                                      "-#ADDRESS_ERROR#",
                                                      true,
                                                      logger );

              }


              let distanceEntry = {} as any;

              if ( geocodedAddress[ 0 ].latitude &&
                   geocodedAddress[ 0 ].longitude ) {

                if ( request.body.Latitude &&
                     request.body.Longitude ) {

                  distanceInfo = await GeoMapManager.calcDistanceAndTimeUsingLatAndLng(
                                                                                        bizDriverInDeliveryZoneInDB.bizDeliveryZone.DistanceUnit === 0? "imperial": "metric",
                                                                                        {
                                                                                          latitude: request.body.Latitude ? request.body.Latitude: "" + bizOriginInDB.bizEstablishment.Latitude,
                                                                                          longitude: request.body.Longitude ? request.body.Longitude: "" + bizOriginInDB.bizEstablishment.Longitude
                                                                                        },
                                                                                        [
                                                                                          {
                                                                                            latitude: "" + geocodedAddress[ 0 ].latitude,
                                                                                            longitude: "" + geocodedAddress[ 0 ].longitude
                                                                                          }
                                                                                        ],
                                                                                        true,
                                                                                        logger
                                                                                      );

                }
                else {

                  distanceInfo = await GeoMapManager.calcDistanceAndTimeUsingAddress(
                                                                                      bizDriverInDeliveryZoneInDB.bizDeliveryZone.DistanceUnit === 0? "imperial": "metric",
                                                                                      bizOriginInDB.bizEstablishment.Address,
                                                                                      [
                                                                                        geocodedAddress[ 0 ].formattedAddress
                                                                                      ],
                                                                                      true,
                                                                                      logger
                                                                                    );

                }

                if ( distanceInfo[ 0 ].status === "OK" ) {

                  if ( bizDriverInDeliveryZoneInDB.bizDeliveryZone.DistanceUnit === 0 ) { //Imperial / Miles

                    //Conver the meters (Google maps always return value number in meters) value to miles
                    if ( distanceInfo[ 0 ].distance.value / 1609 > bizDriverInDeliveryZoneInDB.bizDeliveryZone.DistanceMax ) {

                      //Add the tag
                      strTag = SystemUtilities.mergeTokens( strTag,
                                                            "#DISTANCE_WARNING#",
                                                            false,
                                                            logger );

                    }
                    else {

                      //Remove the tag. Just in case
                      strTag = SystemUtilities.mergeTokens( strTag,
                                                            "-#DISTANCE_WARNING#",
                                                            true,
                                                            logger );

                    }

                  }
                  else { //Metrics / Kilometers

                    if ( distanceInfo[ 0 ].distance.value > bizDriverInDeliveryZoneInDB.bizDeliveryZone.DistanceMax ) {

                      //Add the tag
                      strTag = SystemUtilities.mergeTokens( strTag,
                                                            "#DISTANCE_WARNING#",
                                                            true,
                                                            logger );

                    }
                    else {

                      //Remove the tag. Just in case
                      strTag = SystemUtilities.mergeTokens( strTag,
                                                            "-#DISTANCE_WARNING#",
                                                            true,
                                                            logger );

                    }

                  }

                  distanceEntry = {
                                    Business: {
                                                Distance: [
                                                            {
                                                              Index: 0,
                                                              Origin: {
                                                                        Latitude: request.body.Latitude ? request.body.Latitude: "" + bizOriginInDB.bizEstablishment.Latitude,
                                                                        Longitude: request.body.Longitude ? request.body.Longitude: "" + bizOriginInDB.bizEstablishment.Longitude,
                                                                        Address: request.body.Latitude && request.body.Longitude ? "": bizOriginInDB.bizEstablishment.Address
                                                                      },
                                                              Destination: {
                                                                             Latitude: "" + geocodedAddress[ 0 ].latitude,
                                                                             Longitude: "" + geocodedAddress[ 0 ].longitude,
                                                                             FormattedAddress: geocodedAddress[ 0 ].formattedAddress,
                                                                             Address: request.body.Address
                                                                           },
                                                              DistanceUnit: bizDriverInDeliveryZoneInDB.bizDeliveryZone.DistanceUnit,
                                                              DistanceText: distanceInfo[ 0 ].distance.text,
                                                              DistanceMeter: distanceInfo[ 0 ].distance.value,
                                                              DurationText: distanceInfo[ 0 ].duration.text,
                                                              DurationSecond: distanceInfo[ 0 ].duration.value,
                                                              Tag: strTag ? strTag: null,
                                                              CreatedBy: userSessionStatus.UserName,
                                                              CreatedAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                            }
                                                          ]
                                              }

                                  }

                }
                else {

                  strTag = SystemUtilities.mergeTokens( strTag,
                                                        "#ADDRESS_ERROR#,#DISTANCE_WARNING#",
                                                        true,
                                                        logger );

                  distanceEntry = {
                                    Business: {
                                                Distance: [
                                                            {
                                                              Index: 0,
                                                              Origin: {
                                                                        Latitude: request.body.Latitude ? request.body.Latitude: "" + bizOriginInDB.bizEstablishment.Latitude,
                                                                        Longitude: request.body.Longitude ? request.body.Longitude: "" + bizOriginInDB.bizEstablishment.Longitude,
                                                                        Address: request.body.Latitude && request.body.Longitude ? "": bizOriginInDB.bizEstablishment.Address
                                                                      },
                                                              Destination: {
                                                                             Latitude: "",
                                                                             Longitude: "",
                                                                             FormattedAddress: "",
                                                                             Address: request.body.Address
                                                                           },
                                                              DistanceUnit: bizDriverInDeliveryZoneInDB.bizDeliveryZone.DistanceUnit,
                                                              DistanceText: "",
                                                              DistanceMeter: -1,
                                                              DurationText: "",
                                                              DurationSecond: -1,
                                                              Tag: strTag,
                                                              CreatedBy: userSessionStatus.UserName,
                                                              CreatedAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                            }
                                                          ]
                                              }

                                   }

                }

              }

              bizDestinationInDB.Name = request.body.Name;
              bizDestinationInDB.Phone = request.body.Phone;
              bizDestinationInDB.Address = request.body.Address;
              bizDestinationInDB.FormattedAddress = geocodedAddress[ 0 ].formattedAddress ? geocodedAddress[ 0 ].formattedAddress: null;
              bizDestinationInDB.Tag = strTag ? strTag: null;

              let extraData = bizDestinationInDB.ExtraData as any instanceof String ?
                              CommonUtilities.parseJSON( bizDestinationInDB.ExtraData, logger ):
                              bizDestinationInDB.ExtraData;

              if ( extraData?.Business?.Distance?.length >= 0 ) {

                distanceEntry.Business.Distance[ 0 ].Index = extraData?.Business?.Distance?.length;

                extraData.Business?.Distance?.push( distanceEntry.Business.Distance[ 0 ] );

              }
              else if ( extraData?.Business ) {

                extraData.Business = {
                                        Distance: distanceEntry.Business.Distance,
                                        ...extraData.Business
                                     }

              }
              else {

                extraData = {
                              Business: {
                                          Distance: extraData?.Business?.Distance,
                                        },
                              ...extraData
                            }

              }

              bizDestinationInDB.ExtraData = extraData;

              bizDestinationInDB = await BIZDestinationService.createOrUpdate(
                                                                               ( bizDestinationInDB as any ).dataValues,
                                                                               true,
                                                                               currentTransaction,
                                                                               logger
                                                                             );

              if ( bizDestinationInDB &&
                   bizDestinationInDB instanceof Error === false ) {

                  bizDeliveryOrderInDB.Tag = strTag ? strTag: null;
                  bizDeliveryOrderInDB.Comment = request.body.Comment;

                  bizDeliveryOrderInDB = await BIZDeliveryOrderService.createOrUpdate(
                                                                                       ( bizDeliveryOrderInDB as any ).dataValues,
                                                                                       true,
                                                                                       currentTransaction,
                                                                                       logger
                                                                                     );

                  if ( bizDeliveryOrderInDB &&
                       bizDeliveryOrderInDB instanceof Error === false ) {

                    let modelData = ( bizDeliveryOrderInDB as any ).dataValues;

                    const tempModelData = await BIZDeliveryOrder.convertFieldValues(
                                                                                     {
                                                                                       Data: modelData,
                                                                                       FilterFields: 1,
                                                                                       TimeZoneId: context.TimeZoneId,
                                                                                       Include: [
                                                                                                  {
                                                                                                    model: BIZDriverRoute,
                                                                                                  },
                                                                                                  {
                                                                                                    model: BIZOrigin,
                                                                                                  },
                                                                                                  {
                                                                                                    model: BIZDestination,
                                                                                                  },
                                                                                                  {
                                                                                                    model: SYSUser,
                                                                                                  }
                                                                                                ],
                                                                                       Exclude: null,
                                                                                                /*
                                                                                                [
                                                                                                  {
                                                                                                     model: SYSUser
                                                                                                  }
                                                                                                ],
                                                                                                */
                                                                                       IncludeFields: {
                                                                                                        "sysUser": [
                                                                                                                     "Id",
                                                                                                                     "Name"
                                                                                                                   ]
                                                                                                      },
                                                                                       Logger: logger,
                                                                                       ExtraInfo: {
                                                                                                    Request: request,
                                                                                                  }
                                                                                     }
                                                                                   );

                    if ( tempModelData ) {

                      modelData = tempModelData;

                    }

                    //ANCHOR success user update
                    result = {
                               StatusCode: 200, //Ok
                               Code: "SUCCESS_UPDATE_DELIVERY_ORDER",
                               Message: await I18NManager.translate( strLanguage, "" ),
                               Mark: "564A78418432" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: null,
                               IsError: false,
                               Errors: [],
                               Warnings: [],
                               Count: 1,
                               Data: [
                                       modelData
                                     ]
                             }

                    bApplyTransaction = true;

                  }
                  else {

                    const error = bizDeliveryOrderInDB as any;

                    result = {
                               StatusCode: 500, //Internal server error
                               Code: "ERROR_UNEXPECTED",
                               Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                               Mark: "7FB02D5C8B17" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: null,
                               IsError: true,
                               Errors: [
                                         {
                                           Code: error.name,
                                           Message: error.message,
                                           Details: await SystemUtilities.processErrorDetails( error ) //error
                                         }
                                       ],
                               Warnings: [],
                               Count: 0,
                               Data: []
                             }

                  }

              }
              else {

                const error = bizDestinationInDB as any;

                result = {
                           StatusCode: 500, //Internal server error
                           Code: "ERROR_UNEXPECTED",
                           Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                           Mark: "851F71B1E7F2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: error.name,
                                       Message: error.message,
                                       Details: await SystemUtilities.processErrorDetails( error ) //error
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }

            }
            else {

              const error = bizOriginInDB as any;

              result = {
                         StatusCode: 500, //Internal server error
                         Code: "ERROR_UNEXPECTED",
                         Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                         Mark: "5C111C12FDE8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: error.name,
                                     Message: error.message,
                                     Details: await SystemUtilities.processErrorDetails( error ) //error
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }


          }

        }
        else {

          result = {
                     StatusCode: 400, //Bad request
                     Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                     Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                     Mark: "30D0523EDEFE" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                                 Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                                 Details: validator.errors.all()
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }

      }

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

      sourcePosition.method = this.name + "." + this.updateDeliveryOrder.name;

      const strMark = "4C85853903C1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 StatusCode: 500, //Internal server error
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                 LogId: error.LogId,
                 Mark: strMark,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {

        }

      }

    }

    return result;

  }

}
