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
  httpPut,
  httpPost
} from "inversify-express-utils";
import { inject } from 'inversify';

import CommonConstants from '../../../../02_system/common/CommonConstants';

import CommonUtilities from '../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../02_system/common/SystemUtilities';

import SYSRouteService from '../../../../02_system/common/database/master/services/SYSRouteService';
//import I18NManager from '../../../../02_system/common/managers/I18Manager';
import MiddlewareManager from '../../../../02_system/common/managers/MiddlewareManager';
//import DBConnectionManager from '../../../../02_system/common/managers/DBConnectionManager';
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

  static readonly _BASE_PATH = "/v1/business/dev001/odinv1";

  static readonly _ROUTE_INFO = [
                                  { Path: Dev001Controller._BASE_PATH + "/establishment", Action: "v1.business.dev001.odinv1.establishment", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Get establishment list" },
                                  { Path: Dev001Controller._BASE_PATH + "/driver", Action: "v1.business.dev001.odinv1.driver", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Get driver list" },
                                  { Path: Dev001Controller._BASE_PATH + "/order/tip/uber", Action: "v1.business.dev001.odinv1.order.tip.uber.job", AccessKind: 2, RequestKind: 3, AllowTagAccess: "#Administrator#,#Business_Manager#,#Adm_Asistant#", Roles: [ "Administrator", "Business_Manager", "Adm_Asistant" ], Description: "Start the job to update order uber tip" },
                                  { Path: Dev001Controller._BASE_PATH + "/order/tip/uber", Action: "v1.business.dev001.odinv1.order.tip.uber.status", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Administrator#,#Business_Manager#,#Adm_Asistant#", Roles: [ "Administrator", "Business_Manager", "Adm_Asistant" ], Description: "Get status of the job update order uber tip" },
                                  { Path: Dev001Controller._BASE_PATH + "/order/bulk", Action: "v1.business.dev001.odinv1.order.bulk.job", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Administrator#,#Business_Manager#,#Adm_Asistant#", Roles: [ "Administrator", "Business_Manager", "Adm_Asistant" ], Description: "Start the job to bulk create orders" },
                                  { Path: Dev001Controller._BASE_PATH + "/order/bulk", Action: "v1.business.dev001.odinv1.order.bulk.status", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Administrator#,#Business_Manager#,#Adm_Asistant#", Roles: [ "Administrator", "Business_Manager", "Adm_Asistant" ], Description: "Get status of the job bulk create order" },
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

    //let strLanguage = context.Language;

    const result = await Dev001ServicesController.getEstablishmentList( request,
                                                                        response,
                                                                        null,
                                                                        context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/order/tip/uber",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated
          )
  async updateOrderTip( request: Request, response: Response ) {

    const context = ( request as any ).context;

    let strLanguage = context.Language;
    //await=espera x esta cosa.
    const result = await Dev001ServicesController.startOrderTipUberUpdateJob( request,
                                                                              response,
                                                                              context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/order/tip/uber",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated
          )
  async getOrderTipStatus( request: Request, response: Response ) {

    const context = ( request as any ).context;

    //let strLanguage = context.Language;

    const result = await Dev001ServicesController.getJobStatus( request,
                                                                response,
                                                                context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/driver",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated
          )
  async getDriverList( request: Request, response: Response ) {

    const context = ( request as any ).context;

    //let strLanguage = context.Language;

    const result = await Dev001ServicesController.getDriverList( request,
                                                                 response,
                                                                 null,
                                                                 context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/order/bulk",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated
           )
  async bulkCreateOrder( request: Request, response: Response ) {

    const context = ( request as any ).context;

    //let strLanguage = context.Language;

    const result = await Dev001ServicesController.startBulkOrderCreateJob( request,
                                                                           response,
                                                                           context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/order/bulk",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated
          )
  async getBulkOrderCreateStatus( request: Request, response: Response ) {

    const context = ( request as any ).context;

    //let strLanguage = context.Language;

    const result = await Dev001ServicesController.getJobStatus( request,
                                                                response,
                                                                context.logger );

    response.status( result.StatusCode ).send( result );

  }

}
