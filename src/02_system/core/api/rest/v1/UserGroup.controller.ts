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
import UserGroupServiceController from '../../../services/v1/UserGroupService.controller';
import MiddlewareManager from "../../../../common/managers/MiddlewareManager";
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

  static readonly _TO_IOC_CONTAINER = true;

  static readonly _BASE_PATH = "/v1/system/usergroup";

  static readonly _ROUTE_INFO = [
                                  { Path: UserGroupController._BASE_PATH, AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL03#,#GetUserGroupL01#,#GetUserGroupL03#,#GetUserGroupL04#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL03", "GetUserGroupL01", "GetUserGroupL03", "GetUserGroupL04" ], Description: "Get the information for one user group" },
                                  { Path: UserGroupController._BASE_PATH, AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Administrator#,#BManagerL99#,#CreateUserGroupL03#,#CreateUserGroupL04#", Roles: [ "Administrator", "BManagerL99", "CreateUserGroupL03", "CreateUserGroupL04" ], Description: "Create new user group information" },
                                  { Path: UserGroupController._BASE_PATH, AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#BManagerL99#,#UpdateUserGroupL03#,#UpdateUserGroupL04#", Roles: [ "Administrator", "BManagerL99", "UpdateUserGroupL03", "UpdateUserGroupL04" ], Description: "Update existent user group information" },
                                  { Path: UserGroupController._BASE_PATH + "/disable/bulk", AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#BManagerL99#,#UpdateUserGroupL03#,#UpdateUserGroupL04#", Roles: [ "Administrator", "BManagerL99", "UpdateUserGroupL03", "UpdateUserGroupL04" ], Description: "Disable existent user account in bulk" },
                                  { Path: UserGroupController._BASE_PATH + "/enable/bulk", AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#BManagerL99#,#UpdateUserGroupL03#,#UpdateUserGroupL04#", Roles: [ "Administrator", "BManagerL99", "UpdateUserGroupL03", "UpdateUserGroupL04" ], Description: "Enable existent user account in bulk" },
                                  { Path: UserGroupController._BASE_PATH, AccessKind: 3, RequestKind: 4, AllowTagAccess: "#Administrator#,#BManagerL99#,#DeleteUserGroupL03#,#DeleteUserGroupL04#", Roles: [ "Administrator", "BManagerL99", "DeleteUserGroupL03", "DeleteUserGroupL04" ], Description: "Delete the user group information" },
                                  { Path: UserGroupController._BASE_PATH + "/bulk", AccessKind: 3, RequestKind: 4, AllowTagAccess: "#Administrator#,#BManagerL99#,#DeleteUserGroupL03#,#DeleteUserGroupL04#", Roles: [ "Administrator", "BManagerL99", "DeleteUserGroupL03", "DeleteUserGroupL04" ], Description: "Delete the user information in bulk" },
                                  { Path: UserGroupController._BASE_PATH + "/search", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL03#,#SearchUserGroupL01#,#SearchUserGroupL03#,#SearchUserGroupL04#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL03", "SearchUserGroupL01", "SearchUserGroupL03", "SearchUserGroupL04" ], Description: "Search for user groups information" },
                                  { Path: UserGroupController._BASE_PATH + "/search/count", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL03#,#SearchUserGroupL01#,#SearchUserGroupL03#,#SearchUserGroupL04#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL03", "SearchUserGroupL01", "SearchUserGroupL03", "SearchUserGroupL04" ], Description: "Count search user groups information result" },
                                  { Path: UserGroupController._BASE_PATH + "/settings", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Get settings for the current user group" },
                                  { Path: UserGroupController._BASE_PATH + "/settings", AccessKind: 2, RequestKind: 3, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL03#,#SettingsUserGroupL01#,#SettingsUserGroupL03#,#SettingsUserGroupL04#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL03", "SettingsUserGroupL03", "SettingsUserGroupL04" ], Description: "Set settings for the current user group" },
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
  async getUserGroup( request: Request, response: Response ) {

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
  async createUserGroup( request: Request, response: Response ) {

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
  async updateUserGroup( request: Request, response: Response ) {

    const result = await UserGroupServiceController.updateUserGroup( request,
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
  async disableBulkUserGroup( request: Request, response: Response ) {

    const result = await UserGroupServiceController.disableBulkUserGroup( request,
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
  async enableBulkUserGroup( request: Request, response: Response ) {

    const result = await UserGroupServiceController.enableBulkUserGroup( request,
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
  async deleteUserGroup( request: Request, response: Response ) {

    const result = await UserGroupServiceController.deleteUserGroup( request,
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
  async deleteBulkUserGroup( request: Request, response: Response ) {

    const result = await UserGroupServiceController.deleteBulkUserGroup( request,
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

  @httpGet(
            "",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async getSettings( request: Request, response: Response ) {

    const result = await UserGroupServiceController.getSettings( request,
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
  async setSettings( request: Request, response: Response ) {

    const result = await UserGroupServiceController.setSettings( request,
                                                                 null,
                                                                 this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

}
