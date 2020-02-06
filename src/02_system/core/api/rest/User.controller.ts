
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
import SecurityServiceController from '../../services/SecurityService.controller';
import CommonConstants from '../../../common/CommonConstants';
import UserServiceController from '../../services/UserService.controller';

const debug = require( 'debug' )( 'User.controller' );

//@injectable()
@controller( process.env.SERVER_ROOT_PATH + UserController._BASE_PATH )
export default class UserController {

  //AccessKind: 1 Public
  //AccessKind: 2 Authenticated
  //AccessKind: 3 Role

  //RequestKind: 1 GET
  //RequestKind: 2 POST
  //RequestKind: 3 PUT
  //RequestKind: 4 DELETE

  static readonly _TO_IOC_CONTAINER = true;

  static readonly _BASE_PATH = "/system/user";

  static readonly _ROUTE_INFO = [
                                  { Path: UserController._BASE_PATH + "/signup", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Create new user account" },
                                  //{ Path: AuthenticationController._BASE_PATH + "/signup/google", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Create new user account using google account" },
                                  //{ Path: AuthenticationController._BASE_PATH + "/signup/facebook", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Create new user account using facebook account" },
                                  { Path: UserController._BASE_PATH + "/signup/activate", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Activate signup user account" },
                                  { Path: UserController._BASE_PATH + "/password/recover/code/send", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Send recover password code to registered user email or phone number" },
                                  { Path: UserController._BASE_PATH + "/password/recover", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Set the password to user account using the password recover code" },
                                  { Path: UserController._BASE_PATH + "/password/change", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Set the password to user using the current password" },
                                  { Path: UserController._BASE_PATH + "/email/change/token/send", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Send change email token to the current user email or phone" },
                                  { Path: UserController._BASE_PATH + "/email/change", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Change email to the current user using the token" },
                                  { Path: UserController._BASE_PATH + "/phone/change/token/send", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Send change phone token to the current user email or phone" },
                                  { Path: UserController._BASE_PATH + "/phone/change", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Change phone to the current user using the token" },
                                  { Path: UserController._BASE_PATH + "/profile", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Get information about the current user" },
                                  { Path: UserController._BASE_PATH + "/profile/change", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Set the information about the current user, like FirstName, LastName, BirthDate" },
                                ]

  _controllerLogger = null;

  constructor( @inject( "appLogger" ) logger: any ) {

    this._controllerLogger = logger;

  }

  async registerInDataBase( logger: any ) {

    try {

      for ( let routeInfo of UserController._ROUTE_INFO ) {

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

      sourcePosition.method = UserController.name + "." + this.registerInDataBase.name;

      const strMark = "68A833778764";

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
             "/signup",
             SystemUtilities.middlewareSetContext
           )
  async signup( request: Request, response: Response ) {

    const result = await UserServiceController.signup( request,
                                                       null,
                                                       this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/signup/activate",
             SystemUtilities.middlewareSetContext
           )
  async signupActivate( request: Request, response: Response ) {

    const result = await UserServiceController.signupActivate( request,
                                                               null,
                                                               this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/password/recover/code/send",
             SystemUtilities.middlewareSetContext
           )
  async passwordRecoverCodeSend( request: Request, response: Response ) {

    const result = await UserServiceController.passwordRecoverCodeSend( request,
                                                                         null,
                                                                         this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/password/recover/set",
             SystemUtilities.middlewareSetContext
           )
  async passwordRecoverSet( request: Request, response: Response ) {

    const context = ( request as any ).context;

    /*
    const result = await SecurityService.tokenCheck( context.Authorization,
                                                     null,
                                                     context.Logger );

    response.status( result.StatusCode ).send( result );
    */

  }

}