import cluster from "cluster";

import {
  //Router,
  Request,
  Response,
  //NextFunction
} from "express";

import CommonConstants from "../../../../common/CommonConstants";

import CommonUtilities from "../../../../common/CommonUtilities";
import SystemUtilities from "../../../../common/SystemUtilities";

import { ApolloError } from "apollo-server-express";
import SYSRouteService from "../../../../common/database/master/services/SYSRouteService";
//import { Controller, Get, Post, Param, Delete, Body, Req, Res, UseBefore } from "routing-controllers";
import {
  controller,
  //httpGet,
  httpPost,
  //response,
  //requestParam,
  //requestBody,
  //request,
  httpPut,
  httpGet,
  httpDelete
} from "inversify-express-utils";
import {
  //injectable,
  inject
} from "inversify";
//import SecurityServiceController from "../../services/SecurityService.controller";
import UserOthersServiceController from "../../../services/v1/UserOthersService.controller";
import MiddlewareManager from "../../../../common/managers/MiddlewareManager";
import I18NManager from "../../../../common/managers/I18Manager";

import UserCreateServiceController from "../../../services/v1/UserCreateService.controller";
import UserUpdateServiceController from "../../../services/v1/UserUpdateService.controller";
import UserDeleteServiceController from "../../../services/v1/UserDeleteService.controller";
import UserBulkServiceController from "../../../services/v1/UserBulkService.controller";
import UserPasswordServiceController from "../../../services/v1/UserPasswordService.controller";
import UserSignupServiceController from "../../../services/v1/UserSignupService.controller";
import UserEMailServiceController from "../../../services/v1/UserEMailService.controller";
import UserPhoneServiceController from "../../../services/v1/UserPhoneService.controller";
import UserDeviceServiceController from "../../../services/v1/UserDeviceService.controller";
import UserPushServiceController from "../../../services/v1/UserPushService.controller";
import UserInstantMessageServiceController from "../../../services/v1/UserInstantMessageService.controller";

const debug = require( "debug" )( "User.controller" );

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

  static readonly _BASE_PATH = "/v1/system/user";

  static readonly _ROUTE_INFO = [
                                  { Path: UserController._BASE_PATH + "/signup", Action: "v1.system.user.signup", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Create new user account" },
                                  { Path: UserController._BASE_PATH + "/signup/google", Action: "v1.system.user.signup.google", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Create new user account using google account" },
                                  { Path: UserController._BASE_PATH + "/signup/facebook", Action: "v1.system.user.signup.facebook", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Create new user account using facebook account" },
                                  { Path: UserController._BASE_PATH + "/signup/instagram", Action: "v1.system.user.signup.instagram", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Create new user account using instagram account" },
                                  { Path: UserController._BASE_PATH + "/signup/activate", Action: "v1.system.user.signup.activate", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Activate signup user account" },
                                  { Path: UserController._BASE_PATH + "/password/recover/code/send", Action: "v1.system.user.password.recover.code.send", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Send recover password code to registered user email or phone number" },
                                  { Path: UserController._BASE_PATH + "/password/recover", Action: "v1.system.user.password.recover", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Set the password to user account using the password recover code" },
                                  { Path: UserController._BASE_PATH + "/password/change", Action: "v1.system.user.password.change", AccessKind: 2, RequestKind: 3, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Set new password to user using the current password" }, //,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#ChangeUserPasswordL01#,#ChangeUserPasswordL02#,#ChangeUserPasswordL03#, , "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "ChangeUserPasswordL01", "ChangeUserPasswordL02", "ChangeUserPasswordL03"
                                  { Path: UserController._BASE_PATH + "/email/change/code/send", Action: "v1.system.user.email.change.code.send", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Send change email code to the new email. Using the current user password" },
                                  { Path: UserController._BASE_PATH + "/email/change", Action: "v1.system.user.email.change", AccessKind: 2, RequestKind: 3, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Change email to the current user using the code" },
                                  { Path: UserController._BASE_PATH + "/phone/change/code/send", Action: "v1.system.user.phone.change.code.send", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Send change phone code to the phone number. Using the current user password" },
                                  { Path: UserController._BASE_PATH + "/phone/change", Action: "v1.system.user.phone.change", AccessKind: 2, RequestKind: 3, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Change phone to the current user using the code" },
                                  { Path: UserController._BASE_PATH + "/profile", Action: "v1.system.user.profile.get", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Get information about the current user" },
                                  { Path: UserController._BASE_PATH + "/profile", Action: "v1.system.user.profile.update", AccessKind: 2, RequestKind: 3, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Set the information about the current user, like FirstName, LastName, BirthDate" },
                                  { Path: UserController._BASE_PATH, Action: "v1.system.user.get", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#Get_User_L01#,#Get_User_L02#,#Get_User_L03#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "Get_User_L01", "Get_User_L02", "Get_User_L03" ], Description: "Get the information for one user" },
                                  { Path: UserController._BASE_PATH, Action: "v1.system.user.create", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L03#,#Create_User_L01#,#Create_User_L03#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L03", "Create_User_L01", "Create_User_L03" ], Description: "Create new user information" },
                                  { Path: UserController._BASE_PATH, Action: "v1.system.user.update", AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#Update_User_L01#,#Update_User_L02#,#Update_User_L03#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "Update_User_L01", "Update_User_L02", "Update_User_L03" ], Description: "Update existent user information" },
                                  { Path: UserController._BASE_PATH + "/disable/bulk", Action: "v1.system.user.disable.bulk", AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#Update_User_L01#,#Update_User_L02#,#Update_User_L03#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "Update_User_L01", "Update_User_L02", "Update_User_L03" ], Description: "Disable existent users in bulk" },
                                  { Path: UserController._BASE_PATH + "/enable/bulk", Action: "v1.system.user.enable.bulk", AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#Update_User_L01#,#Update_User_L02#,#Update_User_L03#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "Update_User_L01", "Update_User_L02", "Update_User_L03" ], Description: "Enable existent users in bulk" },
                                  { Path: UserController._BASE_PATH + "/move/bulk", Action: "v1.system.user.move.bulk", AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#Update_User_L01#,#Update_User_L02#,#Update_User_L03#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "Update_User_L01", "Update_User_L02", "Update_User_L03" ], Description: "Move existent users to another user group in bulk" },
                                  { Path: UserController._BASE_PATH, Action: "v1.system.user.delete", AccessKind: 3, RequestKind: 4, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#Delete_User_L01#,#Delete_User_L02#,#Update_User_L03#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "Delete_User_L01", "Delete_User_L02", "Delete_User_L03" ], Description: "Delete the user information" },
                                  { Path: UserController._BASE_PATH + "/bulk", Action: "v1.system.user.delete.bulk", AccessKind: 3, RequestKind: 4, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#Delete_User_L01#,#Delete_User_L02#,#Delete_User_L03#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "Delete_User_L01", "Delete_User_L02", "Delete_User_L03" ], Description: "Delete the user information in bulk" },
                                  { Path: UserController._BASE_PATH + "/search", Action: "v1.system.user.search", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#Search_User_L01#,#Search_User_L02#,#Search_User_L03#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "Search_User_L01", "Search_User_L02", "Search_User_L03" ], Description: "Search for users information" },
                                  { Path: UserController._BASE_PATH + "/search/count", Action: "v1.system.user.search.count", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#Search_User_L01#,#Search_User_L02#,#Search_User_L03#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "Search_User_L01", "Search_User_L02", "Search_User_L03" ], Description: "Count search users information result" },
                                  { Path: UserController._BASE_PATH + "/settings", Action: "v1.system.user.settings.get", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Get settings for the current user" },
                                  { Path: UserController._BASE_PATH + "/settings", Action: "v1.system.user.settings.set", AccessKind: 2, RequestKind: 3, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Set settings for the current user" },
                                  { Path: UserController._BASE_PATH + "/routes", Action: "v1.system.user.routes.get", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Get the routes allowed to current user" },
                                  { Path: UserController._BASE_PATH + "/actions", Action: "v1.system.user.actions.get", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Get the actions allowed" },
                                  { Path: UserController._BASE_PATH + "/device", Action: "v1.system.user.device.register", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Register device to allow to backend send push" },
                                  { Path: UserController._BASE_PATH + "/device", Action: "v1.system.user.device.delete", AccessKind: 2, RequestKind: 4, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Register device to allow to backend send push" },
                                  { Path: UserController._BASE_PATH + "/push/message/test", Action: "v1.system.user.push.message.test", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Send push test message" },
                                  { Path: UserController._BASE_PATH + "/instant/message/auth", Action: "v1.system.user.instant.message.auth.create", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Create instant message authorization token" },
                                  { Path: UserController._BASE_PATH + "/instant/message/auth", Action: "v1.system.user.instant.message.auth.delete", AccessKind: 2, RequestKind: 4, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Delete and disconnect instant message authorization token" },
                                  { Path: UserController._BASE_PATH + "/instant/message/server/hook", Action: "v1.system.user.instant.message.server.hook", AccessKind: 2, RequestKind: 4, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Hook from instant message server action: ConnectToServer,DisconnectFromServer,JoinToChannel,LeaveChannel,SendMessage" },
                                  { Path: UserController._BASE_PATH + "/instant/message/socket/test", Action: "v1.system.user.instant.message.socket.test", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Send instant test message using socket call" },
                                  { Path: UserController._BASE_PATH + "/instant/message/rest/test", Action: "v1.system.user.instant.message.rest.test", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Send instant test message using rest api call" },
                                  { Path: UserController._BASE_PATH + "/instant/message/channel/members", Action: "v1.system.user.instant.message.channel.members.list", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#Business_Manager#", Roles: [ "Administrator", "Business_Manager" ], Description: "Get channel members list" },
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
                     Code: "ERROR_USER_CHANGE_PASSWORD_REQUIRED",
                     Message: await I18NManager.translate( strLanguage, "The user must be change the password before to continue" ),
                     Mark: "829072DD0A36" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_USER_CHANGE_PASSWORD_REQUIRED",
                                 Message: await I18NManager.translate( strLanguage, "The user must be change the password before to continue" ),
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
                     Code: "ERROR_USER_PASSWORD_EXPIRED",
                     Message: await I18NManager.translate( strLanguage, "The user must be change the password to before continue" ),
                     Mark: "B5C138D68DF9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_USER_PASSWORD_EXPIRED",
                                 Message: await I18NManager.translate( strLanguage, "The user must be change the password to before continue" ),
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
                               Mark: "BA10403FE3D1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                               Mark: "B019A967D26A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareClearIsNotValidSession
           )
  async signup( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserSignupServiceController.signup( request,
                                                             null,
                                                             this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/signup/google",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareClearIsNotValidSession
           )
  async signupGoogle( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserSignupServiceController.signupGoogle( request,
                                                                   null,
                                                                   this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/signup/facebook",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareClearIsNotValidSession
           )
  async signupFacebook( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserSignupServiceController.signupFacebook( request,
                                                                     null,
                                                                     this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/signup/instagram",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareClearIsNotValidSession
           )
  async signupInstagram( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserSignupServiceController.signupInstagram( request,
                                                                      null,
                                                                      this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/signup/activate",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareClearIsNotValidSession
           )
  async signupActivate( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserSignupServiceController.signupActivate( request,
                                                                     null,
                                                                     this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/password/recover/code/send",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareClearIsNotValidSession
           )
  async passwordRecoverCodeSend( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserPasswordServiceController.passwordRecoverCodeSend( request,
                                                                                null,
                                                                                this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/password/recover",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareClearIsNotValidSession
           )
  async passwordRecover( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserPasswordServiceController.passwordRecover( request,
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

    const result = await UserOthersServiceController.passwordChange( request,
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

    const result = await UserEMailServiceController.emailChangeCodeSend( request,
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

    const result = await UserEMailServiceController.emailChange( request,
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

    const result = await UserPhoneServiceController.phoneChangeCodeSend( request,
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

    const result = await UserPhoneServiceController.phoneNumberChange( request,
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

    const result = await UserOthersServiceController.getProfile( request,
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

    const result = await UserOthersServiceController.setProfile( request,
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

    const result = await UserOthersServiceController.getUser( request,
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

    const result = await UserCreateServiceController.createUser( request,
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

    const result = await UserUpdateServiceController.updateUser( request,
                                                                 null,
                                                                 this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/disable/bulk",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async disableBulkUser( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserBulkServiceController.disableBulkUser( request,
                                                                    null,
                                                                    this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/enable/bulk",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async enableBulkUser( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserBulkServiceController.enableBulkUser( request,
                                                                   null,
                                                                   this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/move/bulk",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized,
          )
  async moveBulkUser( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserBulkServiceController.moveBulkUser( request,
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

    const result = await UserDeleteServiceController.deleteUser( request,
                                                                 null,
                                                                 this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpDelete(
               "/bulk",
               MiddlewareManager.middlewareSetContext,
               MiddlewareManager.middlewareCheckIsAuthenticated,
               MiddlewareManager.middlewareCheckIsAuthorized,
             )
  async deleteBulkUser( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserBulkServiceController.deleteBulkUser( request,
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

    const result = await UserOthersServiceController.searchUser( request,
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

    const result = await UserOthersServiceController.searchCountUser( request,
                                                                      null,
                                                                      this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/settings",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated
          )
  async getSettings( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserOthersServiceController.getSettings( request,
                                                                  null,
                                                                  this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/settings",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated
          )
  async setSettings( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserOthersServiceController.setSettings( request,
                                                                  null,
                                                                  this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/routes",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated
          )
  async getRoute( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserOthersServiceController.getRoutes( request,
                                                                null,
                                                                this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/actions",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareClearIsNotValidSession
          )
  async actions( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserOthersServiceController.getActions( request,
                                                                 null,
                                                                 this._controllerLogger || context.logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/device",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated
           )
  async register( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserDeviceServiceController.register( request,
                                                               null,
                                                               this._controllerLogger || ( context ? context.logger : null ) );

    response.status( result.StatusCode ).send( result );

  }

  @httpDelete(
               "/device",
               MiddlewareManager.middlewareSetContext,
               MiddlewareManager.middlewareCheckIsAuthenticated
             )
  async delete( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserDeviceServiceController.delete( request,
                                                             null,
                                                             this._controllerLogger || ( context ? context.logger : null ) );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/push/message/test",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated
           )
  async pushMessageTest( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserPushServiceController.pushMessageTest( request,
                                                                    null,
                                                                    this._controllerLogger || ( context ? context.logger : null ) );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/instant/message/auth",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated
           )
  async createInstantMessageAuth( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserInstantMessageServiceController.createInstantMessageAuthorization( request,
                                                                                                null,
                                                                                                this._controllerLogger || ( context ? context.logger : null ) );

    response.status( result.StatusCode ).send( result );

  }

  @httpDelete(
               "/instant/message/auth",
               MiddlewareManager.middlewareSetContext,
               MiddlewareManager.middlewareCheckIsAuthenticated
             )
  async deleteInstantMessageAuth( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserInstantMessageServiceController.deleteInstantMessageAuthorization( request,
                                                                                                null,
                                                                                                this._controllerLogger || ( context ? context.logger : null ) );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/instant/message/server/hook",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated
           )
  async instantMessageServerHook( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserInstantMessageServiceController.instantMessageServerHook( request,
                                                                                       null,
                                                                                       this._controllerLogger || ( context ? context.logger : null ) );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/instant/message/socket/test",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated
           )
  async instantMessageTestUsingLive( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserInstantMessageServiceController.instantMessageTestUsingSocket( request,
                                                                                            null,
                                                                                            this._controllerLogger || ( context ? context.logger : null ) );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/instant/message/rest/test",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated
           )
  async instantMessageTestUsingRest( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserInstantMessageServiceController.instantMessageTestUsingRest( request,
                                                                                          null,
                                                                                          this._controllerLogger || ( context ? context.logger : null ) );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/instant/message/channel/members",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated
          )
  async instantMessageGetChannelMembersList( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserInstantMessageServiceController.instantMessageGetChannelMembersUsingRest( request,
                                                                                                       null,
                                                                                                       this._controllerLogger || ( context ? context.logger : null ) );

    response.status( result.StatusCode ).send( result );

  }
  //
  /*
  @httpGet(
            "/presence/room",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated
          )
  async presenceRoom( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserInstantMessageServiceController.presenceRoom( request,
                                                                           null,
                                                                           this._controllerLogger || ( context ? context.logger : null ) );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/presence/room/count",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated
          )
  async presenceRoomCount( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserInstantMessageServiceController.presenceRoomCount( request,
                                                                                null,
                                                                                this._controllerLogger || ( context ? context.logger : null ) );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/presence",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated
          )
  async presence( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserInstantMessageServiceController.presence( request,
                                                                       null,
                                                                       this._controllerLogger || ( context ? context.logger : null ) );

    response.status( result.StatusCode ).send( result );

  }
  */

  /*
  @httpGet(
            "/presence/count",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated
          )
  async presenceCount( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await UserInstantMessageServiceController.presenceCount( request,
                                                                            null,
                                                                            this._controllerLogger || ( context ? context.logger : null ) );

    response.status( result.StatusCode ).send( result );

  }
  */

}
