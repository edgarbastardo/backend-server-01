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

import Dev007ServicesDriverController from "../../../services/Dev007Service.driver.controller";
import Dev007ServicesDriverDeliveryOrderCreateController from "../../../services/Dev007Service.driver.delivery.order.create.controller";
import Dev007ServicesDriverDeliveryOrderUpdateController from "../../../services/Dev007Service.driver.delivery.order.update.controller";

const debug = require( "debug" )( "Dev007.driver.controller" );

//@injectable()
@controller( process.env.SERVER_ROOT_PATH + Dev007DriverController._BASE_PATH )
export default class Dev007DriverController {

  //AccessKind: 1 Public
  //AccessKind: 2 Authenticated
  //AccessKind: 3 Role

  //RequestKind: 1 GET
  //RequestKind: 2 POST
  //RequestKind: 3 PUT
  //RequestKind: 4 DELETE

  static readonly _TO_IOC_CONTAINER = true;

  static readonly _BASE_PATH = "/v1/business/dev007/driver";

  static readonly _ROUTE_INFO = [
                                  { Path: Dev007DriverController._BASE_PATH + "/status/work/start", Action: "v1.business.dev007.driver.status.work.start", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Change the driver status to 1=Working" },
                                  { Path: Dev007DriverController._BASE_PATH + "/status/work/stop", Action: "v1.business.dev007.driver.status.work.stop", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Change the driver status to 0=Not working" },
                                  { Path: Dev007DriverController._BASE_PATH + "/status", Action: "v1.business.dev007.driver.work.status.get", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Get current driver status" },
                                  { Path: Dev007DriverController._BASE_PATH + "/position", Action: "v1.business.dev007.driver.position.set", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Set the position of the driver" },
                                  { Path: Dev007DriverController._BASE_PATH + "/position", Action: "v1.business.dev007.driver.position.get", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Get the drivers position" },
                                  { Path: Dev007DriverController._BASE_PATH + "/delivery/zone", Action: "v1.business.dev007.driver.delivery.zone.set", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Set the delivery zone to the driver" },
                                  { Path: Dev007DriverController._BASE_PATH + "/delivery/zone", Action: "v1.business.dev007.driver.delivery.zone.get", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Get the current delivery zone from the driver" },
                                  { Path: Dev007DriverController._BASE_PATH + "/delivery/zone/establishment/search", Action: "v1.business.dev007.driver.delivery.zone.establishment.search", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Get the establishment in delivery zone" },
                                  { Path: Dev007DriverController._BASE_PATH + "/delivery/zone/establishment/search/count", Action: "v1.business.dev007.driver.delivery.zone.establishment.search.count", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Get the establishment count in delivery zone" },
                                  { Path: Dev007DriverController._BASE_PATH + "/delivery/order/active", Action: "v1.business.dev007.driver.delivery.order.active", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "List active delivery order information" },
                                  { Path: Dev007DriverController._BASE_PATH + "/delivery/order/active/count", Action: "v1.business.dev007.driver.delivery.order.active.count", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "List active delivery order count information" },
                                  { Path: Dev007DriverController._BASE_PATH + "/delivery/order/search", Action: "v1.business.dev007.driver.delivery.order.search", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Search for delivery order information" },
                                  { Path: Dev007DriverController._BASE_PATH + "/delivery/order/search/count", Action: "v1.business.dev007.driver.delivery.order.search.count", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Search for delivery order count information" },
                                  { Path: Dev007DriverController._BASE_PATH + "/delivery/order", Action: "v1.business.dev007.driver.delivery.order.get", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Get delivery order info to the driver" },
                                  { Path: Dev007DriverController._BASE_PATH + "/delivery/order", Action: "v1.business.dev007.driver.delivery.order.create", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Create a new delivery order to the driver" },
                                  { Path: Dev007DriverController._BASE_PATH + "/delivery/order", Action: "v1.business.dev007.driver.delivery.order.update", AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Modify a delivery order to the driver" },
                                  { Path: Dev007DriverController._BASE_PATH + "/delivery/order/status", Action: "v1.business.dev007.driver.delivery.order.status", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Get the current status the delivery order" },
                                  { Path: Dev007DriverController._BASE_PATH + "/delivery/order/status/next", Action: "v1.business.dev007.driver.delivery.order.status.next", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Move to the next status the delivery order" },
                                  { Path: Dev007DriverController._BASE_PATH + "/delivery/order/status/previous", Action: "v1.business.dev007.driver.delivery.order.status.previous", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Move to the previous status the delivery order" },
                                ]

  _controllerLogger = null;

  constructor( @inject( "appLogger" ) logger: any ) {

    this._controllerLogger = logger;

  }

  async registerInDataBase( logger: any ) {

    try {

      for ( let routeInfo of Dev007DriverController._ROUTE_INFO ) {

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

      sourcePosition.method = Dev007DriverController.name + "." + this.registerInDataBase.name;

      const strMark = "12065C0897B3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  @httpPost(
             "/status/work/start",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
             MiddlewareManager.middlewareCheckIsAuthorized,
           )
  async setStatusToWorking( request: Request, response: Response ) {

    const context = ( request as any ).context;

    if ( request.body ) {

      request.body.Code = 1111;
      request.body.Description = "Working";

    }
    else {

      request.body = {

                       Code: 1111,
                       Description: "Working"

                     }

    }

    const result = await Dev007ServicesDriverController.setStatus( request,
                                                                   response,
                                                                   null,
                                                                   context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/status/work/stop",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
             MiddlewareManager.middlewareCheckIsAuthorized,
           )
  async setStatusToNotWorking( request: Request, response: Response ) {

    const context = ( request as any ).context;

    //TODO check if driver had deliveries actives to set 1100 Working (Finishing)
    if ( request.body ) {

      request.body.Code = 0;
      request.body.Description = "Not working";

    }
    else {

      request.body = {

                       Code: 0,
                       Description: "Not working"

                     }

    }

    const result = await Dev007ServicesDriverController.setStatus( request,
                                                                   response,
                                                                   null,
                                                                   context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/status",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async getStatus( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007ServicesDriverController.getStatus( request,
                                                                   response,
                                                                   null,
                                                                   context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/position",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
             MiddlewareManager.middlewareCheckIsAuthorized,
           )
  async setPosition( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007ServicesDriverController.setPosition( request,
                                                                     response,
                                                                     null,
                                                                     context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/position",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async getDriverPosition( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007ServicesDriverController.getPosition( request,
                                                                     response,
                                                                     null,
                                                                     context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/delivery/zone",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
             MiddlewareManager.middlewareCheckIsAuthorized,
           )
  async setDeliveryZone( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007ServicesDriverController.setDeliveryZone( request,
                                                                         response,
                                                                         null,
                                                                         context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/delivery/zone",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async getDeliveryZone( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007ServicesDriverController.getDeliveryZone( request,
                                                                         response,
                                                                         null,
                                                                         context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/delivery/zone/establishment/search",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async searchDeliveryZoneEstablishment( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007ServicesDriverController.searchDeliveryZoneEstablishment( request,
                                                                                         response,
                                                                                         null,
                                                                                         context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/delivery/zone/establishment/search/count",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async searchCountDeliveryZoneEstablishment( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007ServicesDriverController.searchCountDeliveryZoneEstablishment( request,
                                                                                              response,
                                                                                              null,
                                                                                              context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/delivery/order/active",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async listActiveDeliveryOrder( request: Request, response: Response ) {

    const context = ( request as any ).context;

    let userSessionStatus = context.UserSessionStatus;

    /*
                                 C.Id,
                                 C.Name,
                                 C.Address,
                                 C.Latitude,
                                 C.Longitude,
                                 C.Phone,
                                 C.EMail,
                                 C.Tag,
    */

    request.query.selectField = `A.Id,
                                 A.Kind,
                                 A.DriverRouteId,
                                 A.DeliveryAt,
                                 A.OriginId,
                                 A.DestinationId,
                                 A.UserId,
                                 A.StatusCode,
                                 A.StatusDescription,
                                 A.RoutePriority,
                                 A.Comment,
                                 A.Tag,
                                 A.CreatedBy,
                                 A.CreatedAt,
                                 A.UpdatedBy,
                                 A.UpdatedAt,
                                 B.Id,
                                 B.Address,
                                 B.Latitude,
                                 B.Longitude,
                                 B.Name,
                                 B.Phone,
                                 B.EMail,
                                 B.Comment,
                                 B.Tag,
                                 D.Id,
                                 D.Address,
                                 D.Latitude,
                                 D.Longitude,
                                 D.Name,
                                 D.Phone,
                                 D.EMail,
                                 D.Comment,
                                 D.Tag,
                                 D.ExtraData`;

    //Date( A.DeliveryAt ) = '${SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_10 )}' And

    request.query.where = `( A.UserId = '${userSessionStatus.UserId}' And
                             A.CanceledBy Is Null And
                             A.CanceledAt Is Null And
                             A.DisabledAt Is Null And
                             A.DisabledAt Is Null And
                             E.Canceled = 0 And
                             E.Last = 0 )`;

    request.query.orderBy = `A.RoutePriority Asc,
                             A.DeliveryAt Asc`;

    request.query.selectField = SystemUtilities.createSelectAliasFromFieldList( request.query.selectField, "A,B,D" );

    const result = await Dev007ServicesDriverController.searchDeliveryOrder( request,
                                                                             response,
                                                                             null,
                                                                             context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/delivery/order/active/count",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async listActiveCountDeliveryOrder( request: Request, response: Response ) {

    const context = ( request as any ).context;

    let userSessionStatus = context.UserSessionStatus;

    //Date( A.DeliveryAt ) = '${SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_10 )}' And

    request.query.where = `( A.UserId = '${userSessionStatus.UserId}' And
                             A.CanceledBy Is Null And
                             A.CanceledAt Is Null And
                             A.DisabledAt Is Null And
                             A.DisabledAt Is Null And
                             E.Canceled = 0 And
                             E.Last = 0 )`;

    request.query.orderBy = null;

    const result = await Dev007ServicesDriverController.searchCountDeliveryOrder( request,
                                                                                  response,
                                                                                  null,
                                                                                  context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/delivery/order/search",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async searchDeliveryOrder( request: Request, response: Response ) {

    const context = ( request as any ).context;

    request.query.selectField = "";

    const result = await Dev007ServicesDriverController.searchDeliveryOrder( request,
                                                                             response,
                                                                             null,
                                                                             context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/delivery/order/search/count",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async searchCountDeliveryOrder( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007ServicesDriverController.searchCountDeliveryOrder( request,
                                                                                  response,
                                                                                  null,
                                                                                  context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/delivery/order",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async getDeliveryOrder( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007ServicesDriverController.getDeliveryOrder( request,
                                                                          response,
                                                                          null,
                                                                          context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/delivery/order",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
             MiddlewareManager.middlewareCheckIsAuthorized,
           )
  async createDeliveryOrder( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007ServicesDriverDeliveryOrderCreateController.createDeliveryOrder( request,
                                                                                                response,
                                                                                                null,
                                                                                                context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/delivery/order",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async updateDeliveryOrder( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007ServicesDriverDeliveryOrderUpdateController.updateDeliveryOrder( request,
                                                                                                response,
                                                                                                null,
                                                                                                context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/delivery/order/status/next",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async updateDeliveryOrderStatusNext( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007ServicesDriverController.updateDeliveryOrderStatusNext( request,
                                                                                       response,
                                                                                       null,
                                                                                       context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/delivery/order/status/previous",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async updateDeliveryOrderStatusPrevious( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007ServicesDriverController.updateDeliveryOrderStatusPrevious( request,
                                                                                           response,
                                                                                           null,
                                                                                           context.logger );

    response.status( result.StatusCode ).send( result );

  }

}
