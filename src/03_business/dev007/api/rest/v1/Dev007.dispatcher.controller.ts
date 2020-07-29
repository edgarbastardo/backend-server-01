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
import Dev007DriverServicesController from "../../../services/Dev007Service.driver.controller";
import Dev007DispacherServicesController from "../../../services/Dev007Service.dispacher.controller";

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
  async setStatusToWorking( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007DispacherServicesController.getPosition( request,
                                                                        response,
                                                                        null,
                                                                        context.logger );

    response.status( result.StatusCode ).send( result );

  }

}
