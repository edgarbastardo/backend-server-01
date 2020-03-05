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

import { ApolloError } from 'apollo-server-express';
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
import UserServiceController from '../../services/UserService.controller';
import MiddlewareManager from "../../../common/managers/MiddlewareManager";
//import { UserSessionStatus } from "../../../common/database/models/UserSessionStatus";
import I18NManager from '../../../common/managers/I18Manager';

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

  //Not for me: The secondary role for the user can be defined ExtraData
  static readonly _TO_IOC_CONTAINER = true;

  static readonly _BASE_PATH = "/system/user";

  static readonly _ROUTE_INFO = [
                                  { Path: UserController._BASE_PATH + "/signup", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Create new user account" },
                                  //{ Path: AuthenticationController._BASE_PATH + "/signup/google", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Create new user account using google account" },
                                  //{ Path: AuthenticationController._BASE_PATH + "/signup/facebook", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Create new user account using facebook account" },
                                  { Path: UserController._BASE_PATH + "/signup/activate", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Activate signup user account" },
                                  { Path: UserController._BASE_PATH + "/password/recover/code/send", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Send recover password code to registered user email or phone number" },
                                  { Path: UserController._BASE_PATH + "/password/recover", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Set the password to user account using the password recover code" },
                                  { Path: UserController._BASE_PATH + "/password/change", AccessKind: 2, RequestKind: 3, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Set new password to user using the current password" }, //,#BManagerL99#,#MasterL01#,#MasterL02#,#MasterL03#,#ChangeUserPasswordL01#,#ChangeUserPasswordL02#,#ChangeUserPasswordL03#, , "BManagerL99", "MasterL01", "MasterL02", "MasterL03", "ChangeUserPasswordL01", "ChangeUserPasswordL02", "ChangeUserPasswordL03"
                                  { Path: UserController._BASE_PATH + "/email/change/code/send", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Send change email code to the new email. Using the current user password" },
                                  { Path: UserController._BASE_PATH + "/email/change", AccessKind: 2, RequestKind: 3, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Change email to the current user using the code" },
                                  { Path: UserController._BASE_PATH + "/phone/change/code/send", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Send change phone code to the phone number. Using the current user password" },
                                  { Path: UserController._BASE_PATH + "/phone/change", AccessKind: 2, RequestKind: 3, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Change phone to the current user using the code" },
                                  { Path: UserController._BASE_PATH + "/profile", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Get information about the current user" },
                                  { Path: UserController._BASE_PATH + "/profile", AccessKind: 2, RequestKind: 3, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Set the information about the current user, like FirstName, LastName, BirthDate" },
                                  { Path: UserController._BASE_PATH, AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL02#,#MasterL03#,#GetUserL01#,#GetUserL02#,#GetUserL03#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL02", "MasterL03", "GetUserL01", "GetUserL02", "GetUserL03" ], Description: "Get the information for one user" },
                                  { Path: UserController._BASE_PATH, AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL03#,#CreateUserL01#,#CreateUserL03#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL03", "CreateUserL01", "CreateUserL03" ], Description: "Create new user information" },
                                  { Path: UserController._BASE_PATH, AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL02#,#MasterL03#,#UpdateUserL01#,#UpdateUserL02#,#UpdateUserL03#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL02", "MasterL03", "UpdateUserL01", "UpdateUserL02", "UpdateUserL03" ], Description: "Update existent user information" },
                                  { Path: UserController._BASE_PATH, AccessKind: 3, RequestKind: 4, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL02#,#MasterL03#,#DeleteUserL01#,#DeleteUserL02#,#UpdateUserL03#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL02", "MasterL03", "DeleteUserL01", "DeleteUserL02", "DeleteUserL03" ], Description: "Delete the user information" },
                                  { Path: UserController._BASE_PATH + "/search", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL02#,#MasterL03#,#SearchUserL01#,#SearchUserL02#,#SearchUserL03#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL02", "MasterL03", "SearchUserL01", "SearchUserL02", "SearchUserL03" ], Description: "Search for users information" },
                                  { Path: UserController._BASE_PATH + "/search/count", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#BManagerL99#,#MasterL01#,#MasterL02#,#MasterL03#,#SearchUserL01#,#SearchUserL02#,#SearchUserL03#", Roles: [ "Administrator", "BManagerL99", "MasterL01", "MasterL02", "MasterL03", "SearchUserL01", "SearchUserL02", "SearchUserL03" ], Description: "Count search users information result" },
                                  { Path: UserController._BASE_PATH + "/routes", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Get the routes allowed to current user" },
                                ]

  _controllerLogger = null;

  constructor( @inject( "appLogger" ) logger: any ) {

    this._controllerLogger = logger;

  }

  async init( logger: any ) {

    await MiddlewareManager.registerToBypassMiddlewareInterceptorsByPath( process.env.SERVER_ROOT_PATH + UserController._BASE_PATH + "/password/change" );

    await MiddlewareManager.registerToCallMiddlewareInterceptor( UserController.middlerwareInterceptorCheckRequest );

  }

  static async middlerwareInterceptorCheckRequest( strRequestKind: string,
                                                   request: any,
                                                   logger: any ):Promise<any> {

    let result = null;

    if ( strRequestKind === "rest_api" ) {

      const strLanguage = request.context ? request.context.Language: null;

      const userSessionStatus = request.context ? request.context.UserSessionStatus: null;

      if ( userSessionStatus &&
           userSessionStatus.Tag ) {

        if ( userSessionStatus.Tag.includes( "#FORCE_CHANGE_PASSSWORD#" ) ) {

          result = {
                     StatusCode: 401, //Unauthorized
                     Code: 'ERROR_USER_CHANGE_PASSWORD_REQUIRED',
                     Message: await I18NManager.translate( strLanguage, 'The user must be change the password before to continue' ),
                     Mark: '829072DD0A36' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_CHANGE_PASSWORD_REQUIRED',
                                 Message: await I18NManager.translate( strLanguage, 'The user must be change the password before to continue' ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else if ( userSessionStatus.Tag.includes( "#PASSSWORD_EXPIRED#" ) ) {

          result = {
                     StatusCode: 401, //Unauthorized
                     Code: 'ERROR_USER_PASSWORD_EXPIRED',
                     Message: await I18NManager.translate( strLanguage, 'The user must be change the password to before continue' ),
                     Mark: 'B5C138D68DF9' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_PASSWORD_EXPIRED',
                                 Message: await I18NManager.translate( strLanguage, 'The user must be change the password to before continue' ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }

      }

    }
    else if ( strRequestKind === "graphql_api" ) {

      const strLanguage = request.context ? request.context.Language: null;

      const userSessionStatus = request.context ? request.context.UserSessionStatus: null;

      if ( userSessionStatus &&
           userSessionStatus.Tag ) {

        if ( userSessionStatus.Tag.includes( "#FORCE_CHANGE_PASSSWORD#" ) ) {

          const extensions = {
                               StatusCode: 401, //Unauthorized
                               Mark: 'BA10403FE3D1' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: SystemUtilities.getUUIDv4()
                             };

          result = new ApolloError(
                                    await I18NManager.translate( strLanguage, "The user must be change the password before to continue" ),
                                    "ERROR_USER_CHANGE_PASSWORD_REQUIRED",
                                    extensions
                                  );

        }
        else if ( userSessionStatus.Tag.includes( "#PASSSWORD_EXPIRED#" ) ) {

          const extensions = {
                               StatusCode: 401, //Unauthorized
                               Mark: 'B019A967D26A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: SystemUtilities.getUUIDv4()
                             };

          result = new ApolloError(
                                    await I18NManager.translate( strLanguage, "The user must be change the password before to continue" ),
                                    "ERROR_USER_PASSWORD_EXPIRED",
                                    extensions
                                  );

        }

      }

    }

    return result;

  }

  async registerInDataBase( logger: any ) {

    try {

      for ( let routeInfo of UserController._ROUTE_INFO ) {

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

      sourcePosition.method = UserController.name + "." + this.registerInDataBase.name;

      const strMark = "68A833778764" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
             MiddlewareManager.middlewareSetContext
           )
  async signup( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserServiceController.signup( request,
                                                       null,
                                                       this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/signup/activate",
             MiddlewareManager.middlewareSetContext
           )
  async signupActivate( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserServiceController.signupActivate( request,
                                                               null,
                                                               this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/password/recover/code/send",
             MiddlewareManager.middlewareSetContext
           )
  async passwordRecoverCodeSend( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserServiceController.passwordRecoverCodeSend( request,
                                                                        null,
                                                                        this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/password/recover",
             MiddlewareManager.middlewareSetContext
           )
  async passwordRecover( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserServiceController.passwordRecover( request,
                                                                null,
                                                                this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/password/change",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
          )
  async passwordChange( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserServiceController.passwordChange( request,
                                                               null,
                                                               this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/email/change/code/send",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
           )
  async emailChangeCodeSend( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserServiceController.emailChangeCodeSend( request,
                                                                    null,
                                                                    this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/email/change",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
          )
  async emailChange( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserServiceController.emailChange( request,
                                                            null,
                                                            this._controllerLogger || context.logger);

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/phone/change/code/send",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
           )
  async phoneChangeCodeSend( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserServiceController.phoneChangeCodeSend( request,
                                                                    null,
                                                                    this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/phone/change",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
          )
  async phoneNumberChange( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserServiceController.phoneNumberChange( request,
                                                                  null,
                                                                  this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/profile",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
          )
  async profileGet( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserServiceController.getProfile( request,
                                                           null,
                                                           this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/profile",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
          )
  async profileSet( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserServiceController.setProfile( request,
                                                           null,
                                                           this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async getUser( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserServiceController.getUser( request,
                                                        null,
                                                        this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
             MiddlewareManager.middlewareCheckIsAuthorized,
           )
  async createUser( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserServiceController.createUser( request,
                                                           null,
                                                           this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async updateUser( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserServiceController.updateUser( request,
                                                           null,
                                                           this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpDelete(
               "",
               MiddlewareManager.middlewareSetContext,
               MiddlewareManager.middlewareCheckIsAuthenticated,
               MiddlewareManager.middlewareCheckIsAuthorized,
             )
  async deleteUser( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserServiceController.deleteUser( request,
                                                           null,
                                                           this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/search",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async searchUser( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserServiceController.searchUser( request,
                                                           null,
                                                           this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/search/count",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async searchCountUser( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserServiceController.searchCountUser( request,
                                                                null,
                                                                this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

}
