import cluster from 'cluster';

import {
  //Router,
  Request,
  Response,
  //NextFunction
} from 'express';
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
  httpPut
} from "inversify-express-utils";
import { inject } from 'inversify';

import CommonConstants from '../../../../02_system/common/CommonConstants';

import CommonUtilities from '../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../02_system/common/SystemUtilities';

import SYSRouteService from '../../../../02_system/common/database/master/services/SYSRouteService';
import I18NManager from '../../../../02_system/common/managers/I18Manager';
import MiddlewareManager from '../../../../02_system/common/managers/MiddlewareManager';
import DBConnectionManager from '../../../../02_system/common/managers/DBConnectionManager';
import Dev001ServicesController from '../../services/Dev001Service.controller';

const debug = require( 'debug' )( 'Dev001.controller' );

//@injectable()
@controller( process.env.SERVER_ROOT_PATH + Dev001Controller._BASE_PATH )
export default class Dev001Controller {

  //AccessKind: 1 Public
  //AccessKind: 2 Authenticated
  //AccessKind: 3 Role

  //RequestKind: 1 GET
  //RequestKind: 2 POST
  //RequestKind: 3 PUT
  //RequestKind: 4 DELETE

  static readonly _TO_IOC_CONTAINER = true;

  static readonly _BASE_PATH = "/v1/business/dev001/odin";

  static readonly _ROUTE_INFO = [
                                  { Path: Dev001Controller._BASE_PATH + "/establishment", Action: "v1.business.dev001.odin.establishment", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Get establishment list" },
                                  { Path: Dev001Controller._BASE_PATH + "/order/tip", Action: "v1.business.dev001.odin.order.tip.job", AccessKind: 2, RequestKind: 3, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Start the job to update order tip" },
                                  { Path: Dev001Controller._BASE_PATH + "/order/tip", Action: "v1.business.dev001.odin.order.tip.status", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Get status of the job order tip" },
                                ]

  _controllerLogger = null;

  constructor( @inject( "appLogger" ) logger: any ) {

    this._controllerLogger = logger;

  }

  async registerInDataBase( logger: any ) {

    try {

      for ( let routeInfo of Dev001Controller._ROUTE_INFO ) {

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

      sourcePosition.method = Dev001Controller.name + "." + this.registerInDataBase.name;

      const strMark = "8BE8B71D1340" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
            "/establishment",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated
          )
  async getEstablishmentList( request: Request, response: Response ) {

    const context = ( request as any ).context;

    let strLanguage = context.Language;
    //await=espera x esta cosa.
    const result = await Dev001ServicesController.getEstablishmentsList( request,
                                                                         response,
                                                                         null,
                                                                         context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/order/tip",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated
          )
  async updateOrderTip( request: Request, response: Response ) {

    const context = ( request as any ).context;

    let strLanguage = context.Language;
    //await=espera x esta cosa.
    const result = await Dev001ServicesController.startUpdateOrderTipsJob( request,
                                                                           response,
                                                                           context.logger );

    response.status( result.StatusCode ).send( result );

  }


  @httpGet(
            "/order/tip",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated
          )
  async getOrderTipStatus( request: Request, response: Response ) {

    const context = ( request as any ).context;

    let strLanguage = context.Language;
    //await=espera x esta cosa.
    const result = await Dev001ServicesController.getUpdateOrderTipsJobStatus( request,
                                                                               response,
                                                                               context.logger );

    response.status( result.StatusCode ).send( result );

  }

}
