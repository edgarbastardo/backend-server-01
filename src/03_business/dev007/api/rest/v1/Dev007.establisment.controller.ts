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
  httpPost,
  httpDelete
} from "inversify-express-utils";
import { inject } from "inversify";

import CommonConstants from "../../../../../02_system/common/CommonConstants";

import CommonUtilities from "../../../../../02_system/common/CommonUtilities";
import SystemUtilities from "../../../../../02_system/common/SystemUtilities";

import SYSRouteService from "../../../../../02_system/common/database/master/services/SYSRouteService";
import MiddlewareManager from "../../../../../02_system/common/managers/MiddlewareManager";
import Dev007EstablishmentServicesController from "../../../services/Dev007Service.establishment.controller";

const debug = require( "debug" )( "Dev007.establishment.controller" );

//@injectable()
@controller( process.env.SERVER_ROOT_PATH + Dev007EstablishmentController._BASE_PATH )
export default class Dev007EstablishmentController {

  //AccessKind: 1 Public
  //AccessKind: 2 Authenticated
  //AccessKind: 3 Role

  //RequestKind: 1 GET
  //RequestKind: 2 POST
  //RequestKind: 3 PUT
  //RequestKind: 4 DELETE

  static readonly _TO_IOC_CONTAINER = true;

  static readonly _BASE_PATH = "/v1/business/dev007/establishment";

  static readonly _ROUTE_INFO = [
                                  { Path: Dev007EstablishmentController._BASE_PATH, Action: "v1.business.dev007.establishment.get", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#Business_Manager#,#Authenticated#", Roles: [ "Administrator", "Business_Manager", "Authenticated" ], Description: "Get the information for one establisment" },
                                  { Path: Dev007EstablishmentController._BASE_PATH, Action: "v1.business.dev007.establishment.create", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Administrator#,#Business_Manager#", Roles: [ "Administrator", "Business_Manager" ], Description: "Create new establishment information" },
                                  { Path: Dev007EstablishmentController._BASE_PATH, Action: "v1.business.dev007.establishment.update", AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#Business_Manager#", Roles: [ "Administrator", "Business_Manager" ], Description: "Update existent establishment information" },
                                  { Path: Dev007EstablishmentController._BASE_PATH + "/disable/bulk", Action: "v1.business.dev007.establishment.disable.bulk", AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#Business_Manager#", Roles: [ "Administrator", "Business_Manager" ], Description: "Disable existent establishments in bulk" },
                                  { Path: Dev007EstablishmentController._BASE_PATH + "/enable/bulk", Action: "v1.business.dev007.establishment.enable.bulk", AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#Business_Manager#", Roles: [ "Administrator", "Business_Manager" ], Description: "Enable existent establishments in bulk" },
                                  { Path: Dev007EstablishmentController._BASE_PATH, Action: "v1.business.dev007.establishment.delete", AccessKind: 3, RequestKind: 4, AllowTagAccess: "#Administrator#,#BManager_L99#,#Business_Manager#", Roles: [ "Administrator", "Business_Manager" ], Description: "Delete the establishment information" },
                                  { Path: Dev007EstablishmentController._BASE_PATH + "/bulk", Action: "v1.business.dev007.establishment.delete.bulk", AccessKind: 3, RequestKind: 4, AllowTagAccess: "#Administrator#,#Business_Manager#", Roles: [ "Administrator", "Business_Manager" ], Description: "Delete the establishment information in bulk" },
                                  { Path: Dev007EstablishmentController._BASE_PATH + "/search", Action: "v1.business.dev007.establishment.search", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#Business_Manager#,#Authenticated#", Roles: [ "Administrator", "Business_Manager", "Authenticated" ], Description: "Search for establishments information" },
                                  { Path: Dev007EstablishmentController._BASE_PATH + "/search/count", Action: "v1.business.dev007.establishment.search.count", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#Business_Manager#,#Authenticated#", Roles: [ "Administrator", "Business_Manager", "Authenticated" ], Description: "Count search establishments information result" },
                                ]

  _controllerLogger = null;

  constructor( @inject( "appLogger" ) logger: any ) {

    this._controllerLogger = logger;

  }

  async registerInDataBase( logger: any ) {

    try {

      for ( let routeInfo of Dev007EstablishmentController._ROUTE_INFO ) {

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

      sourcePosition.method = Dev007EstablishmentController.name + "." + this.registerInDataBase.name;

      const strMark = "6F5BBECBE6F3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
            "",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async getEstablishment( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007EstablishmentServicesController.getEstablishment( request,
                                                                                 response,
                                                                                 null,
                                                                                 context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
             MiddlewareManager.middlewareCheckIsAuthorized,
           )
  async createEstablishment( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007EstablishmentServicesController.createEstablishment( request,
                                                                                    response,
                                                                                    null,
                                                                                    context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async modifyEstablishment( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007EstablishmentServicesController.modifyEstablishment( request,
                                                                                    response,
                                                                                    null,
                                                                                    context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/disable/bulk",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async disableBulk( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007EstablishmentServicesController.disableBulkEstablishment( request,
                                                                                         response,
                                                                                         null,
                                                                                         context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/enable/bulk",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async enableBulk( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007EstablishmentServicesController.enableBulkEstablishment( request,
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
  async deleteEstablishment( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007EstablishmentServicesController.deleteEstablishment( request,
                                                                                    response,
                                                                                    null,
                                                                                    context.logger );

    response.status( result.StatusCode ).send( result );

  }


  @httpDelete(
               "/bulk",
               MiddlewareManager.middlewareSetContext,
               MiddlewareManager.middlewareCheckIsAuthenticated,
               MiddlewareManager.middlewareCheckIsAuthorized,
             )
  async deleteBulkEstablishment( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007EstablishmentServicesController.deleteBulkEstablishment( request,
                                                                                        response,
                                                                                        null,
                                                                                        context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/search",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async searchEstablishment( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007EstablishmentServicesController.searchEstablishment( request,
                                                                                    response,
                                                                                    null,
                                                                                    context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/search/count",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async searchCountEstablishment( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await Dev007EstablishmentServicesController.searchCountEstablishment( request,
                                                                                         response,
                                                                                         null,
                                                                                         context.logger );

    response.status( result.StatusCode ).send( result );

  }

}
