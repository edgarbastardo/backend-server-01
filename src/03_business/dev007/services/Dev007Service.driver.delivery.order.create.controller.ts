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
import BIZDeliveryOrderStatusStepService from "../../common/database/master/services/BIZDeliveryOrderStatusStepService";
import BIZDeliveryOrderService from "../../common/database/master/services/BIZDeliveryOrderService";
import BIZDeliveryOrderStatusService from "../../common/database/master/services/BIZDeliveryOrderStatusService";

import { SYSUser } from "../../../02_system/common/database/master/models/SYSUser";

import { BIZDeliveryOrder } from "../../common/database/master/models/BIZDeliveryOrder";
import { BIZDestination } from "../../common/database/master/models/BIZDestination";
import { BIZOrigin } from "../../common/database/master/models/BIZOrigin";
import { BIZDriverRoute } from "../../common/database/master/models/BIZDriverRoute";

const debug = require( "debug" )( "Dev007ServicesDriverDeliveryOrderCreateController" );

export default class Dev007ServicesDriverDeliveryOrderCreateController extends BaseService {

  //Common business services

  static async createDeliveryOrder( request: Request,
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
                   Mark: "21CFA4186B50" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                   Mark: "19C886AA32E9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                                   EstablishmentId: [ "required", "string", "min:36" ],
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

          const intCountActiveOrders = await BIZDeliveryOrderService.getCountActiveOrderByDriverId( userSessionStatus.UserId,
                                                                                                    currentTransaction,
                                                                                                    logger );

          const bizEstablishmentInDB = await BIZEstablishmentService.getById( request.body.EstablishmentId,
                                                                              currentTransaction,
                                                                              logger );

          if ( bizEstablishmentInDB instanceof Error ) {

            const error = bizEstablishmentInDB as any;

            result = {
                       StatusCode: 500, //Internal server error
                       Code: "ERROR_UNEXPECTED",
                       Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                       Mark: "951822CDF2F5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
          else if ( !bizEstablishmentInDB ) {

            result = {
                       StatusCode: 404, //Not found
                       Code: "ERROR_ESTABLISHMENT_NOT_FOUND",
                       Message: await I18NManager.translate( strLanguage, "The establishment with id %s. Not found in database.", request.body.EstablishmentId ),
                       Mark: "87CBC86751A7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_ESTABLISHMENT_NOT_FOUND",
                                   Message: await I18NManager.translate( strLanguage, "The establishment with id %s. Not found in database.", request.body.EstablishmentId ),
                                   Details: ""
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( bizEstablishmentInDB.DeliveryZoneId !== bizDriverInDeliveryZoneInDB.DeliveryZoneId ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: "ERROR_ESTABLISHEMENT_NOT_IN_DELIVERY_ZONE",
                       Message: await I18NManager.translate( strLanguage, "The establishemnt with id %s. Not in your current delivery zone.", request.body.EstablishmentId ),
                       Mark: "9033B31E34EF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_ESTABLISHEMENT_NOT_IN_DELIVERY_ZONE",
                                   Message: await I18NManager.translate( strLanguage, "The establishemnt with id %s. Not in your current delivery zone.", request.body.EstablishmentId ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( bizDriverInDeliveryZoneInDB.bizDeliveryZone.Kind !== 1 ) { //Only in Driver exclusive, the drive can create the order

            result = {
                       StatusCode: 403, //Forbidden
                       Code: "ERROR_DRIVER_NOT_ALLOWED",
                       Message: await I18NManager.translate( strLanguage, "The driver not allowed to create delivery order in this delivery zone." ),
                       Mark: "1648F127067A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_DRIVER_NOT_ALLOWED",
                                   Message: await I18NManager.translate( strLanguage, "The driver not allowed to create delivery order in this delivery zone." ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else if ( intCountActiveOrders + 1 > bizDriverInDeliveryZoneInDB.bizDeliveryZone.DeliveryByDriverMax ) {

            result = {
                       StatusCode: 400, //Bad request
                       Code: "ERROR_MAXIMUM_DELIVERY_REACHED",
                       Message: await I18NManager.translate( strLanguage, "The maximum %s of active deliveries had reached.", bizDriverInDeliveryZoneInDB.bizDeliveryZone.DeliveryByDriverMax ),
                       Mark: "F81691553941" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_MAXIMUM_DELIVERY_REACHED",
                                   Message: await I18NManager.translate( strLanguage, "The maximum %s of active deliveries had reached.", bizDriverInDeliveryZoneInDB.bizDeliveryZone.DeliveryByDriverMax ),
                                   Details: {
                                              ActiveOrders: intCountActiveOrders,
                                              ActiveOrdersMaximum: bizDriverInDeliveryZoneInDB.bizDeliveryZone.DeliveryByDriverMax
                                            }
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }
          else {

            const bizOriginInDB = await BIZOriginService.createOrUpdate(
                                                                         {
                                                                           UserId: null,
                                                                           EstablishmentId: bizEstablishmentInDB.Id,
                                                                           Address: bizEstablishmentInDB.Address,
                                                                           FormattedAddress: bizEstablishmentInDB.Address,
                                                                           Latitude: bizEstablishmentInDB.Latitude,
                                                                           Longitude: bizEstablishmentInDB.Longitude,
                                                                           Name: bizEstablishmentInDB.Name,
                                                                           EMail: bizEstablishmentInDB.EMail ? bizEstablishmentInDB.EMail: null,
                                                                           Phone: bizEstablishmentInDB.Phone ? bizEstablishmentInDB.Phone: null,
                                                                           Comment: null,
                                                                           Tag: null,
                                                                           CreatedBy: userSessionStatus.UserName,
                                                                         },
                                                                         false,
                                                                         currentTransaction,
                                                                         logger
                                                                       );

            if ( bizOriginInDB &&
                 bizOriginInDB instanceof Error === false ) {

              const geocodedAddress = await GeoMapManager.geocodeServiceUsingAddress( [ request.body.Address ],
                                                                                      true,
                                                                                      logger );

              let distanceInfo = null;

              let strTag = !geocodedAddress[ 0 ].formattedAddress ? "#ADDRESS_ERROR#": null;

              let distanceEntry = {};

              if ( geocodedAddress[ 0 ].latitude &&
                   geocodedAddress[ 0 ].longitude ) {

                if ( request.body.Latitude &&
                     request.body.Longitude ) {

                  distanceInfo = await GeoMapManager.calcDistanceAndTimeUsingLatAndLng(
                                                                                        bizDriverInDeliveryZoneInDB.bizDeliveryZone.DistanceUnit === 0? "imperial": "metric",
                                                                                        {
                                                                                          latitude: request.body.Latitude ? request.body.Latitude: "" + bizEstablishmentInDB.Latitude,
                                                                                          longitude: request.body.Longitude ? request.body.Longitude: "" + bizEstablishmentInDB.Longitude
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
                                                                                      bizEstablishmentInDB.Address,
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

                      strTag = SystemUtilities.mergeTokens( strTag,
                                                            "#DISTANCE_WARNING#",
                                                            true,
                                                            logger );

                    }

                  }
                  else { //Metrics / Kilometers

                    if ( distanceInfo[ 0 ].distance.value > bizDriverInDeliveryZoneInDB.bizDeliveryZone.DistanceMax ) {

                      strTag = SystemUtilities.mergeTokens( strTag,
                                                            "#DISTANCE_WARNING#",
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
                                                                        Latitude: request.body.Latitude ? request.body.Latitude: "" + bizEstablishmentInDB.Latitude,
                                                                        Longitude: request.body.Longitude ? request.body.Longitude: "" + bizEstablishmentInDB.Longitude,
                                                                        Address: request.body.Latitude && request.body.Longitude ? "": bizEstablishmentInDB.Address
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
                                                              Tag: strTag,
                                                              CreatedBy: userSessionStatus.UserName,
                                                              CreatedAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                            }
                                                          ]
                                              }
                                  }

                }
                else {

                  strTag = SystemUtilities.mergeTokens( strTag,
                                                        "#DISTANCE_WARNING#,#ADDRESS_ERROR#",
                                                        true,
                                                        logger );

                  distanceEntry = {
                                    Business: {
                                                Distance: [
                                                            {
                                                              Index: 0,
                                                              Origin: {
                                                                        Latitude: request.body.Latitude ? request.body.Latitude: "" + bizEstablishmentInDB.Latitude,
                                                                        Longitude: request.body.Longitude ? request.body.Longitude: "" + bizEstablishmentInDB.Longitude,
                                                                        Address: request.body.Latitude && request.body.Longitude ? "": bizEstablishmentInDB.Address
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

              const bizDestinationInDB = await BIZDestinationService.createOrUpdate(
                                                                                     {
                                                                                       UserId: null,
                                                                                       EstablishmentId: null,
                                                                                       Address: request.body.Address,
                                                                                       FormattedAddress: geocodedAddress[ 0 ].formattedAddress,
                                                                                       Latitude: geocodedAddress[ 0 ].latitude,
                                                                                       Longitude: geocodedAddress[ 0 ].longitude,
                                                                                       Name: request.body.Name ? request.body.Name: null,
                                                                                       Phone: request.body.Phone ? request.body.Phone: null,
                                                                                       EMail: request.body.EMail ? request.body.EMail: null,
                                                                                       Comment: request.body.Comment ? request.body.Comment: null,
                                                                                       Tag: strTag,
                                                                                       CreatedBy: userSessionStatus.UserName,
                                                                                       ExtraData: distanceEntry
                                                                                     },
                                                                                     false,
                                                                                     currentTransaction,
                                                                                     logger
                                                                                   );

              if ( bizDestinationInDB &&
                   bizDestinationInDB instanceof Error === false ) {

                //Find the first step in the delivery order step
                const bizDeliveryOrderStatusStepInDB = await BIZDeliveryOrderStatusStepService.getDeliveryOrderStepByKind( bizDriverInDeliveryZoneInDB.bizDeliveryZone.Kind,
                                                                                                                           true,  //First
                                                                                                                           false, //Last
                                                                                                                           false, //Canceled
                                                                                                                           currentTransaction,
                                                                                                                           logger );

                if ( bizDeliveryOrderStatusStepInDB &&
                     bizDeliveryOrderStatusStepInDB instanceof Error === false ) {

                  const bizDeliveryOrderInDB = await BIZDeliveryOrderService.createOrUpdate(
                                                                                             {
                                                                                               Kind: bizDriverInDeliveryZoneInDB.bizDeliveryZone.Kind,
                                                                                               DriverRouteId: null,
                                                                                               DeliveryAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                                                               OriginId: bizOriginInDB.Id,
                                                                                               DestinationId: bizDestinationInDB.Id,
                                                                                               UserId: userSessionStatus.UserId,
                                                                                               StatusSequence: bizDeliveryOrderStatusStepInDB.Sequence,
                                                                                               StatusCode: bizDeliveryOrderStatusStepInDB.Code,
                                                                                               StatusDescription: bizDeliveryOrderStatusStepInDB.Description,
                                                                                               RoutePriority: 0,
                                                                                               Comment: request.body.Comment,
                                                                                               Tag: strTag,
                                                                                               CanceledBy: null,
                                                                                               CanceledAt: null,
                                                                                               CreatedBy: userSessionStatus.UserName,
                                                                                             },
                                                                                             true,
                                                                                             currentTransaction,
                                                                                             logger
                                                                                           );

                  if ( bizDeliveryOrderInDB &&
                       bizDeliveryOrderInDB instanceof Error === false ) {

                    await BIZDeliveryOrderStatusService.createOrUpdate(
                                                                        {
                                                                          DeliveryOrderId: bizDeliveryOrderInDB.Id,
                                                                          Code: bizDeliveryOrderStatusStepInDB.Code,
                                                                          Description: bizDeliveryOrderStatusStepInDB.Description,
                                                                          Tag: "#" + bizDeliveryOrderStatusStepInDB.Description + "#",
                                                                          CreatedBy: userSessionStatus.UserName
                                                                        },
                                                                        true,
                                                                        currentTransaction,
                                                                        logger
                                                                      );

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
                               Code: "SUCCESS_CREATE_DELIVERY_ORDER",
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
                else if ( !bizDeliveryOrderStatusStepInDB ) {

                  result = {
                             StatusCode: 404, //Not found
                             Code: "ERROR_NO_FIRST_STATUS_FOUND_IN_DELIVERY_ORDER_STATUS_STEP",
                             Message: await I18NManager.translate( strLanguage, "The no first status found in the database table delivery order status step" ),
                             Mark: "950F694A7179" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: "ERROR_NO_FIRST_STATUS_FOUND_IN_DELIVERY_ORDER_STATUS_STEP",
                                         Message: await I18NManager.translate( strLanguage, "The no first status found in the database table delivery order status step" ),
                                         Details: ""
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           }

                }
                else {

                  const error = bizDeliveryOrderStatusStepInDB as any;

                  result = {
                             StatusCode: 500, //Internal server error
                             Code: "ERROR_UNEXPECTED",
                             Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                             Mark: "1D01CC122029" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.createDeliveryOrder.name;

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
