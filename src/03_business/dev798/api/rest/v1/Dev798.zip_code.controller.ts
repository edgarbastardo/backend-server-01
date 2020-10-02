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
  //response,
  //requestParam,
  //requestBody,
  //request,
  httpPost, httpDelete
} from "inversify-express-utils";
import { inject } from 'inversify';

import CommonConstants from '../../../../../02_system/common/CommonConstants';
import CommonUtilities from '../../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../../02_system/common/SystemUtilities';
import SYSRouteService from '../../../../../02_system/common/database/master/services/SYSRouteService';
import MiddlewareManager from '../../../../../02_system/common/managers/MiddlewareManager';
import Dev798ServicesZipCodeController from '../../../services/v1/Dev798Service.zip_code.controller';

const debug = require( 'debug' )( 'Dev798.zip_code.controller' );

//@injectable()
@controller( process.env.SERVER_ROOT_PATH + Dev798ZipCodeController._BASE_PATH )
export default class Dev798ZipCodeController {

  //AccessKind: 1 Public
  //AccessKind: 2 Authenticated
  //AccessKind: 3 Role

  //RequestKind: 1 GET
  //RequestKind: 2 POST
  //RequestKind: 3 PUT
  //RequestKind: 4 DELETE

  static readonly _TO_IOC_CONTAINER = true;

  static readonly _BASE_PATH = "/v1/business/dev798/zip_code";

  static readonly _ROUTE_INFO = [
                                  { Path: Dev798ZipCodeController._BASE_PATH, Action: "v1.business.dev798.odinv1.zip_code.create", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Create new zip_code information" },
                                  { Path: Dev798ZipCodeController._BASE_PATH, Action: "v1.business.dev798.odinv1.zip_code.delete", AccessKind: 3, RequestKind: 4, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Delete zip_code information" },
                                ]

  _controllerLogger = null;

  constructor( @inject( "appLogger" ) logger: any ) {

    this._controllerLogger = logger;

  }

  async registerInDataBase( logger: any ) {

    try {

      for ( let routeInfo of Dev798ZipCodeController._ROUTE_INFO ) {

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

      sourcePosition.method = Dev798ZipCodeController.name + "." + this.registerInDataBase.name;

      const strMark = "C506727D9BF9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async createZipCode( request: Request, response: Response ) {

    const context = ( request as any ).context;

    //let strLanguage = context.Language;

    const result = await Dev798ServicesZipCodeController.createZipCode( request,
                                                                        response,
                                                                        null,
                                                                        context.logger );

    response.status( result.StatusCode ).send( result );

  }


 @httpDelete(
    "",
    MiddlewareManager.middlewareSetContext,
    MiddlewareManager.middlewareCheckIsAuthenticated,
    MiddlewareManager.middlewareCheckIsAuthorized,
  )
async deleteZipCode( request: Request, response: Response ) {

const context = ( request as any ).context;

const result = await Dev798ServicesZipCodeController.deleteZipCode( request,
                                                                    response,
                                                                    null,
                                                                    context.logger );

response.status( result.StatusCode ).send( result );

}
}