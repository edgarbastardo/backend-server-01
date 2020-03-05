import cluster from 'cluster';

import {
  //Router,
  Request,
  Response,
  //NextFunction
} from 'express';

import CommonConstants from '../../../common/CommonConstants';

import CommonUtilities from '../../../common/CommonUtilities';
import SystemUtilities from "../../../common/SystemUtilities";

import SYSRouteService from '../../../common/database/services/SYSRouteService';
//import { Controller, Get, Post, Param, Delete, Body, Req, Res, UseBefore } from "routing-controllers";
import {
  controller,
  //httpGet,
  httpPost,
  //response,
  //requestParam,
  //requestBody,
  request,
  httpPut,
  httpGet,
  httpDelete
} from "inversify-express-utils";
import {
  //injectable,
  inject
} from 'inversify';
//import SecurityServiceController from '../../services/SecurityService.controller';
import UserGroupServiceController from '../../services/UserGroupService.controller';
import MiddlewareManager from "../../../common/managers/MiddlewareManager";
//import { UserSessionStatus } from "../../../common/database/models/UserSessionStatus";

const debug = require( 'debug' )( 'UserGroup.controller' );

//@injectable()
@controller( process.env.SERVER_ROOT_PATH + UserGroupController._BASE_PATH )
export default class UserGroupController {

  //AccessKind: 1 Public
  //AccessKind: 2 Authenticated
  //AccessKind: 3 Role

  //RequestKind: 1 GET
  //RequestKind: 2 POST
  //RequestKind: 3 PUT
  //RequestKind: 4 DELETE

  //Not for me: The secondary role for the user can be defined ExtraData
  static readonly _TO_IOC_CONTAINER = true;

  static readonly _BASE_PATH = "/system/usergroup";

  static readonly _ROUTE_INFO = [
                                  { Path: UserGroupController._BASE_PATH, AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL03#,#GetUserGroupL01#,#GetUserGroupL03#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL03", "GetUserGroupL01", "GetUserGroupL03" ], Description: "Get the information for one user group" },
                                  { Path: UserGroupController._BASE_PATH, AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL03#,#CreateUserGroupL01#,#CreateUserGroupL03#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL03", "CreateUserGroupL01", "CreateUserGroupL03" ], Description: "Create new user group information" },
                                  { Path: UserGroupController._BASE_PATH, AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL03#,#UpdateUserGroupL01#,#UpdateUserGroupL03#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL03", "UpdateUserGroupL01", "UpdateUserGroupL03" ], Description: "Update existent user group information" },
                                  { Path: UserGroupController._BASE_PATH + "/disable/bulk", AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL03#,#UpdateUserGroupL01#,#UpdateUserGroupL03#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL02", "MasterL03", "UpdateUserGroupL01", "UpdateUserGroupL03" ], Description: "Disable existent user account in bulk" },
                                  { Path: UserGroupController._BASE_PATH + "/enable/bulk", AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL03#,#UpdateUserGroupL01#,#UpdateUserGroupL03#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL02", "MasterL03", "UpdateUserGroupL01", "UpdateUserGroupL03" ], Description: "Enable existent user account in bulk" },
                                  { Path: UserGroupController._BASE_PATH, AccessKind: 3, RequestKind: 4, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL03#,#DeleteUserGroupL01#,#DeleteUserGroupL03#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL03", "DeleteUserGroupL01", "DeleteUserGroupL03" ], Description: "Delete the user group information" },
                                  { Path: UserGroupController._BASE_PATH + "/bulk", AccessKind: 3, RequestKind: 4, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL03#,#DeleteUserGroupL01#,#DeleteUserGroupL03#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL03", "DeleteUserGroupL01", "DeleteUserGroupL03" ], Description: "Delete the user information in bulk" },
                                  { Path: UserGroupController._BASE_PATH + "/search", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL03#,#SearchUserGroupL01#,#SearchUserGroupL03#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL03", "SearchUserGroupL01", "SearchUserGroupL03" ], Description: "Search for user groups information" },
                                  { Path: UserGroupController._BASE_PATH + "/search/count", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL03#,#SearchUserGroupL01#,#SearchUserGroupL03#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL03", "SearchUserGroupL01", "SearchUserGroupL03" ], Description: "Count search user groups information result" },
                                  { Path: UserGroupController._BASE_PATH + "/settings", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Get settings for the current user group" },
                                  { Path: UserGroupController._BASE_PATH + "/settings", AccessKind: 2, RequestKind: 3, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL03#,#SettingsUserGroupL01#,#SettingsUserGroupL03#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL03", "SettingsUserGroupL01", "SettingsUserGroupL03" ], Description: "Set settings for the current user group" },
                                ]

  _controllerLogger = null;

  constructor( @inject( "appLogger" ) logger: any ) {

    this._controllerLogger = logger;

  }

  async registerInDataBase( logger: any ) {

    try {

      for ( let routeInfo of UserGroupController._ROUTE_INFO ) {

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

      sourcePosition.method = UserGroupController.name + "." + this.registerInDataBase.name;

      const strMark = "FFC6215D418B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
  async userGet( request: Request, response: Response ) {

    const result = await UserGroupServiceController.getUserGroup( request,
                                                                  null,
                                                                  this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
             MiddlewareManager.middlewareCheckIsAuthorized,
           )
  async userPost( request: Request, response: Response ) {

    const result = await UserGroupServiceController.createUserGroup( request,
                                                                     null,
                                                                     this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async userPut( request: Request, response: Response ) {

    const result = await UserGroupServiceController.updateUserGroup( request,
                                                                     null,
                                                                     this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpDelete(
               "",
               MiddlewareManager.middlewareSetContext,
               MiddlewareManager.middlewareCheckIsAuthenticated,
               MiddlewareManager.middlewareCheckIsAuthorized,
             )
  async userDelete( request: Request, response: Response ) {

    const result = await UserGroupServiceController.deleteUserGroup( request,
                                                                     null,
                                                                     this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/search",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async userSearch( request: Request, response: Response ) {

    const result = await UserGroupServiceController.searchUserGroup( request,
                                                                     null,
                                                                     this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/search/count",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async userSearchCount( request: Request, response: Response ) {

    const result = await UserGroupServiceController.searchUserGroupCount( request,
                                                                          null,
                                                                          this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

}
