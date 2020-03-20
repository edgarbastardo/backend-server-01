import cluster from 'cluster';

import {
  //Router,
  Request,
  Response,
  //NextFunction
} from 'express';

import CommonConstants from '../../../../common/CommonConstants';

import CommonUtilities from '../../../../common/CommonUtilities';
import SystemUtilities from "../../../../common/SystemUtilities";

import SYSRouteService from '../../../../common/database/services/SYSRouteService';

//import { Controller, Get, Post, Param, Delete, Body, Req, Res, UseBefore } from "routing-controllers";
import {
  controller,
  //httpGet,
  //httpPost,
  //response,
  //requestParam,
  //requestBody,
  //request,
  //httpPut,
  httpPost,
  httpDelete,
  //httpDelete
} from "inversify-express-utils";
import {
  //injectable,
  inject
} from 'inversify';

//import SecurityServiceController from '../../services/SecurityService.controller';
import DeviceServiceController from '../../../services/v1/DeviceService.controller';
import MiddlewareManager from '../../../../common/managers/MiddlewareManager';

//import MiddlewareManager from "../../../../common/managers/MiddlewareManager";

//import { UserSessionStatus } from "../../../common/database/models/UserSessionStatus";

const debug = require( 'debug' )( 'Device.controller' );

//@injectable()
@controller( process.env.SERVER_ROOT_PATH + DeviceController._BASE_PATH )
export default class DeviceController {

  //AccessKind: 1 Public
  //AccessKind: 2 Authenticated
  //AccessKind: 3 Role

  //RequestKind: 1 GET
  //RequestKind: 2 POST
  //RequestKind: 3 PUT
  //RequestKind: 4 DELETE

  //Not for me: The secondary role for the user can be defined ExtraData
  static readonly _TO_IOC_CONTAINER = true;

  static readonly _BASE_PATH = "/v1/system/device";

  static readonly _ROUTE_INFO = [
                                  { Path: DeviceController._BASE_PATH, AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Register device to allow to backend send push" },
                                  { Path: DeviceController._BASE_PATH, AccessKind: 2, RequestKind: 4, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Register device to allow to backend send push" },
                                ]

  _controllerLogger = null;

  constructor( @inject( "appLogger" ) logger: any ) {

    this._controllerLogger = logger;

  }

  async registerInDataBase( logger: any ) {

    try {

      for ( let routeInfo of DeviceController._ROUTE_INFO ) {

        await SYSRouteService.createOrUpdateRouteAndRoles( routeInfo.AccessKind,
                                                           routeInfo.RequestKind,
                                                           routeInfo.Path, //Path
                                                           routeInfo.AllowTagAccess,
                                                           routeInfo.Roles as any,
                                                           routeInfo.Description,
                                                           null,
                                                           logger );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = DeviceController.name + "." + this.registerInDataBase.name;

      const strMark = "BF0BA1936962" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
             "",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated
           )
  async register( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await DeviceServiceController.register( request,
                                                           null,
                                                           this._controllerLogger || ( context ? context.logger : null ) );

    response.status( result.StatusCode ).send( result );

  }

  @httpDelete(
               "",
               MiddlewareManager.middlewareSetContext,
               MiddlewareManager.middlewareCheckIsAuthenticated
             )
  async unregister( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await DeviceServiceController.unregister( request,
                                                             null,
                                                             this._controllerLogger || ( context ? context.logger : null ) );

    response.status( result.StatusCode ).send( result );

  }

}