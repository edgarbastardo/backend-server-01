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

import CommonConstants from "../../../../02_system/common/CommonConstants";

import CommonUtilities from "../../../../02_system/common/CommonUtilities";
import SystemUtilities from "../../../../02_system/common/SystemUtilities";

import SYSRouteService from "../../../../02_system/common/database/master/services/SYSRouteService";
//import I18NManager from "../../../../02_system/common/managers/I18Manager";
import MiddlewareManager from "../../../../02_system/common/managers/MiddlewareManager";
//import DBConnectionManager from "../../../../02_system/common/managers/DBConnectionManager";
import Dev007DriverServicesController from "../../services/Dev007Service.driver.controller";

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

  static readonly _BASE_PATH = "/v1/business/dev007/odinv2/driver";

  static readonly _ROUTE_INFO = [
                                  { Path: Dev007DriverController._BASE_PATH + "/work/start", Action: "v1.business.dev007.odinv2.driver.work.start", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Start to work" },
                                  { Path: Dev007DriverController._BASE_PATH + "/work/stop", Action: "v1.business.dev007.odinv2.driver.work.stop", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Stop of working" },
                                  { Path: Dev007DriverController._BASE_PATH + "/position", Action: "v1.business.dev007.odinv2.driver.position.set", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Driver#,#Business_Manager#,#Administrator#", Roles: [ "Driver", "Administrator", "Business_Manager" ], Description: "Set the position of the driver" },
                                  { Path: Dev007DriverController._BASE_PATH + "/position", Action: "v1.business.dev007.odinv2.driver.position.get", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Dispatcher#,#Business_Manager#,#Administrator#", Roles: [ "Dispatcher", "Administrator", "Business_Manager" ], Description: "Get the drivers position" },
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
             "/work/start",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated
           )
  async setWorkStart( request: Request, response: Response ) {

    const context = ( request as any ).context;

    if ( request.body ) {

      request.body.Status = 1;
      request.body.Description = "Working";

    }
    else {

      request.body = {

                       Status: 1,
                       Description: "Working"

                     }

    }

    const result = await Dev007DriverServicesController.setDriverStatus( request,
                                                                         response,
                                                                         null,
                                                                         context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/work/stop",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated
           )
  async setDriverWorkStop( request: Request, response: Response ) {

    const context = ( request as any ).context;

    if ( request.body ) {

      request.body.Status = 0;
      request.body.Description = "Not working";

    }
    else {

      request.body = {

                       Status: 1,
                       Description: "Not working"

                     }

    }

    const result = await Dev007DriverServicesController.setDriverStatus( request,
                                                                         response,
                                                                         null,
                                                                         context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/position",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated
           )
  async setPosition( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007DriverServicesController.setPosition( request,
                                                                     response,
                                                                     null,
                                                                     context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/position",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated
          )
  async getDriverPosition( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007DriverServicesController.getPosition( request,
                                                                     response,
                                                                     null,
                                                                     context.logger );

    response.status( result.StatusCode ).send( result );

  }

}
