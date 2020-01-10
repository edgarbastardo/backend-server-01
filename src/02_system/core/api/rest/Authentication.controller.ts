
import { Router, Request, Response, NextFunction } from 'express';
import CommonUtilities from '../../../common/CommonUtilities';
import SystemUtilities from "../../../common/SystemUtilities";
import RouteService from '../../../common/database/services/RouteService';
//import { Controller, Get, Post, Param, Delete, Body, Req, Res, UseBefore } from "routing-controllers";
import {
  controller,
  //httpGet,
  httpPost,
  response,
  //requestParam,
  //requestBody,
  request
} from "inversify-express-utils";
import { injectable, inject } from 'inversify';
import SecurityService from '../../../common/database/services/SecurityService';
import CommonConstants from '../../../common/CommonConstants';

const debug = require( 'debug' )( 'Authentication.controller' );

//@injectable()
@controller( process.env.SERVER_ROOT_PATH + AuthenticationController._BASE_PATH )
export default class AuthenticationController {

  //AccessKind: 1 Public
  //AccessKind: 2 Authenticated
  //AccessKind: 3 Role

  //RequestKind: 1 GET
  //RequestKind: 2 POST
  //RequestKind: 3 PUT
  //RequestKind: 4 DELETE

  static readonly _TO_IOC_CONTAINER = true;

  static readonly _BASE_PATH = "/system/security/authentication";

  static readonly _ROUTE_INFO = [
                                  { Path: AuthenticationController._BASE_PATH + "/login", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Create a new authentication token using credentials" },
                                  { Path: AuthenticationController._BASE_PATH + "/logout", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Made the authentication token invalid" },
                                  { Path: AuthenticationController._BASE_PATH + "/token/check", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Check if authentication token is valid" }
                                ]

  _controllerLogger = null;

  constructor( @inject( "appLogger" ) logger: any ) {

    this._controllerLogger = logger;

  }

  async registerInDataBase( logger: any ) {

    try {

      for ( let routeInfo of AuthenticationController._ROUTE_INFO ) {

        await RouteService.createOrUpdateRouteAndRoles( routeInfo.AccessKind,
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

      sourcePosition.method = AuthenticationController.name + "." + this.registerInDataBase.name;

      const strMark = "89E2AABC167A";

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
             "/login",
             SystemUtilities.middlewareSetContext
           )
  async login( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await SecurityService.login( context.TimeZoneId,
                                                context.SourceIPAddress,
                                                context.ClientId,
                                                request.body.Username,
                                                request.body.Password,
                                                null,
                                                context.Logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/logout",
             SystemUtilities.middlewareSetContext,
             SystemUtilities.middlewareCheckIsAuthenticated
           )
  async logout( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await SecurityService.logout( context.Authorization,
                                                 null,
                                                 context.Logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/token/check",
             SystemUtilities.middlewareSetContext,
             SystemUtilities.middlewareCheckIsAuthenticated
           )
  async tokenCheck( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await SecurityService.tokenCheck( context.Authorization,
                                                     null,
                                                     context.Logger );

    response.status( result.StatusCode ).send( result );

  }

}