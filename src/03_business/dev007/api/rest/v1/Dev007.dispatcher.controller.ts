import cluster from "cluster";

import {
  //Router,
  Request,
  Response,
  //NextFunction
} from "express";
//import { Controller, Get, Post, Param, Delete, Body, Req, Res, UseBefore } from "routing-controllers";
import {
  controller,
  //httpGet,
  //httpPost,
  //response,
  //requestParam,
  //requestBody,
  //request,
  httpGet,
  httpPut,
  httpPost
} from "inversify-express-utils";
import { inject } from "inversify";

import CommonConstants from "../../../../../02_system/common/CommonConstants";

import CommonUtilities from "../../../../../02_system/common/CommonUtilities";
import SystemUtilities from "../../../../../02_system/common/SystemUtilities";

import SYSRouteService from "../../../../../02_system/common/database/master/services/SYSRouteService";
//import I18NManager from "../../../../02_system/common/managers/I18Manager";
import MiddlewareManager from "../../../../../02_system/common/managers/MiddlewareManager";
//import DBConnectionManager from "../../../../02_system/common/managers/DBConnectionManager";
//import Dev007DriverServicesController from "../../../services/Dev007Service.driver.controller";
import Dev007DispatcherServicesController from "../../../services/Dev007Service.dispacher.controller";

const debug = require( "debug" )( "Dev007.dispatcher.controller" );

//@injectable()
@controller( process.env.SERVER_ROOT_PATH + Dev007DispacherController._BASE_PATH )
export default class Dev007DispacherController {

  //AccessKind: 1 Public
  //AccessKind: 2 Authenticated
  //AccessKind: 3 Role

  //RequestKind: 1 GET
  //RequestKind: 2 POST
  //RequestKind: 3 PUT
  //RequestKind: 4 DELETE

  static readonly _TO_IOC_CONTAINER = true;

  static readonly _BASE_PATH = "/v1/business/dev007/dispatcher";

  static readonly _ROUTE_INFO = [
                                  { Path: Dev007DispacherController._BASE_PATH + "/driver/position", Action: "v1.business.dev007.dispatcher.driver.position.get", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Dispatcher#,#Business_Manager#,#Administrator#", Roles: [ "Dispatcher", "Administrator", "Business_Manager" ], Description: "Get current connected driver prosition" },
                                  { Path: Dev007DispacherController._BASE_PATH + "/driver/delivery/zone", Action: "v1.business.dev007.dispatcher.driver.delivery.zone.set", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Dispatcher#,#Business_Manager#,#Administrator#", Roles: [ "Dispatcher", "Administrator", "Business_Manager" ], Description: "Set current delivery zone to the driver." },
                                  { Path: Dev007DispacherController._BASE_PATH + "/driver/delivery/zone", Action: "v1.business.dev007.dispatcher.driver.delivery.zone.get", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Dispatcher#,#Business_Manager#,#Administrator#", Roles: [ "Dispatcher", "Administrator", "Business_Manager" ], Description: "Get current delivery zone to the driver." },
                                  { Path: Dev007DispacherController._BASE_PATH + "/driver/status", Action: "v1.business.dev007.dispatcher.driver.status.get", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Dispatcher#,#Business_Manager#,#Administrator#", Roles: [ "Dispatcher", "Administrator", "Business_Manager" ], Description: "List the driver status from drivers" },
                                  { Path: Dev007DispacherController._BASE_PATH + "/driver/status/work/stop", Action: "v1.business.dev007.dispatcher.driver.status.work.stop", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Dispatcher#,#Business_Manager#,#Administrator#", Roles: [ "Dispatcher", "Administrator", "Business_Manager" ], Description: "Stop to the driver of working" },
                                ]

  _controllerLogger = null;

  constructor( @inject( "appLogger" ) logger: any ) {

    this._controllerLogger = logger;

  }

  async registerInDataBase( logger: any ) {

    try {

      for ( let routeInfo of Dev007DispacherController._ROUTE_INFO ) {

        await SYSRouteService.createOrUpdateRouteAndRoles( routeInfo.AccessKind,
                                                           routeInfo.RequestKind,
                                                           routeInfo.Path, //Path
                                                           routeInfo.Action,
                                                           routeInfo.AllowTagAccess,
                                                           routeInfo.Roles as any,
                                                           routeInfo.Description,
                                                           null,
                                                           logger );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = Dev007DispacherController.name + "." + this.registerInDataBase.name;

      const strMark = "6DC3673F84BF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  @httpGet(
            "/driver/position",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async getDriverPositionList( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007DispatcherServicesController.getDriverPositionList( request,
                                                                                   response,
                                                                                   null,
                                                                                   context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/driver/delivery/zone",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
             MiddlewareManager.middlewareCheckIsAuthorized,
           )
  async setDeliveryZone( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007DispatcherServicesController.setDriverDeliveryZone( request,
                                                                                   response,
                                                                                   null,
                                                                                   context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/driver/delivery/zone",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async getDriverDeliveryZone( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007DispatcherServicesController.getDriverDeliveryZone( request,
                                                                                   response,
                                                                                   null,
                                                                                   context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/driver/status",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async setDriverStatusList( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007DispatcherServicesController.getDriverStatusList( request,
                                                                                 response,
                                                                                 null,
                                                                                 context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/driver/status/work/stop",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
             MiddlewareManager.middlewareCheckIsAuthorized,
           )
  async setDriverStatusStopWork( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007DispatcherServicesController.setDriverStatusStopWork( request,
                                                                                     response,
                                                                                     null,
                                                                                     context.logger );

    response.status( result.StatusCode ).send( result );

  }

}
