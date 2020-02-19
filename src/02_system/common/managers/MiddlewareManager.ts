//import fs from 'fs';
//import path from 'path';
import cluster from 'cluster';
import { Request, Response, NextFunction } from 'express';
import { rule } from "graphql-shield";
import { ApolloError } from "apollo-server-errors";

import CommonConstants from '../CommonConstants';

import CommonUtilities from '../CommonUtilities';
import SystemUtilities from '../SystemUtilities';

import LoggerManager from './LoggerManager';
import I18NManager from './I18Manager';

const debug = require( 'debug' )( 'MiddlewareManager' );

export default class MiddlewareManager {

  private static middlewareInterceptorList = [];
  private static bypassMiddlewareInterceptorPathList = [];
  private static realPathList = [];

  public static async registerToCallMiddlewareInterceptor( middlewareFunction: Function ) {

    if ( middlewareFunction &&
         typeof middlewareFunction === "function" ) {

      if ( !this.middlewareInterceptorList ) {

        this.middlewareInterceptorList = [];

      }

      this.middlewareInterceptorList = [ ...this.middlewareInterceptorList, middlewareFunction ];

    }

  }

  public static async registerToBypassMiddlewareInterceptorsByPath( strPath: string ) {

    if ( strPath ) {

      if ( !this.middlewareInterceptorList ) {

        this.bypassMiddlewareInterceptorPathList = [];

      }

      if ( this.bypassMiddlewareInterceptorPathList.includes( strPath ) === false ) {

        this.bypassMiddlewareInterceptorPathList = [ ...this.bypassMiddlewareInterceptorPathList, strPath ];

      }

    }

  }

  public static async registerRealPath( strPath: string ) {

    if ( strPath ) {

      if ( !this.realPathList ) {

        this.realPathList = [];

      }

      if ( this.realPathList.includes( strPath ) === false ) {

        this.realPathList = [ ...this.realPathList, strPath ];

      }

    }

  }

  private static async callToMiddlewareInterceptors( strRequestKind: string,
                                                     request: any,
                                                     logger: any ): Promise<any> {

    let result = null;

    try {

      if ( this.middlewareInterceptorList ) {

        for ( let middlewareFunction of this.middlewareInterceptorList ) {

          result = await ( middlewareFunction as any)( strRequestKind, request, logger );

          if ( result ) {

            break;

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.callToMiddlewareInterceptors.name;

      const strMark = "BEC076D0844A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    return result;

  }

  private static async bypassMiddlewareInterceptorsCallByRoute( strRequestKind: string,
                                                                request: any,
                                                                logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      if ( this.bypassMiddlewareInterceptorPathList ) {

        //ANCHOR test route
        for ( let strRoute of this.bypassMiddlewareInterceptorPathList ) {

          if ( strRequestKind === "rest_api" ) {

            let strPath = request.route && request.route.path ? request.route.path : request.path;

            if ( strPath === strRoute ) {

              bResult = true;
              break;

            }

          }
          else if ( strRequestKind === "graphql_api" ) {

            let strPath = request.info && request.info.path && request.info.path.key ? request.info.path.key : "";

            if ( strPath === strRoute ) {

              bResult = true;
              break;

            }

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.bypassMiddlewareInterceptorsCallByRoute.name;

      const strMark = "BEC076D0844A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    return bResult;

  }

  //Anchor middlewareSetContext
  public static async middlewareSetContext( request: Request,
                                            response: Response,
                                            next: NextFunction ) {

    const logger = LoggerManager.mainLoggerInstance;

    let strLanguage = "";

    try {

      const strAuthorization = request.header( "authorization" );
      let strTimeZoneId = request.header( "timezoneid" );
      let strFrontendId = request.header( "frontendid" ) || "";
      let strSourceIPAddress = request.header( "x-forwarded-for" ) || request.header( "X-Forwarded-For" ); //req.ip;
      strLanguage = request.header( "language" );

      if ( CommonUtilities.isNullOrEmpty( strTimeZoneId ) ) {

        strTimeZoneId = CommonUtilities.getCurrentTimeZoneId();

      }

      if ( CommonUtilities.isNullOrEmpty( strLanguage ) ) {

        strLanguage = CommonUtilities.getCurrentLanguage();

      }

      if ( CommonUtilities.isNullOrEmpty( strSourceIPAddress ) ) {

        strSourceIPAddress = request.ip;

      }

      let userSessionStatus = null;

      ( request as any ).context = {
                                     Authorization: strAuthorization,
                                     Logger: logger,
                                     TimeZoneId: strTimeZoneId,
                                     Language: strLanguage,
                                     SourceIPAddress:  strSourceIPAddress,
                                     FrontendId: strFrontendId,
                                     UserSessionStatus: userSessionStatus
                                   };

      if ( CommonUtilities.isNotNullOrEmpty( strAuthorization ) ) {

        userSessionStatus = await SystemUtilities.getUserSessionStatus( strAuthorization,
                                                                        ( request as any ).context,
                                                                        true,
                                                                        false,
                                                                        null,
                                                                        logger );

      }

      ( request as any ).context.UserSessionStatus = userSessionStatus;

      next(); //Continue to next middleware

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.middlewareSetContext.name;

      const strMark = "A7BA900D7B56" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      const result = {
                       StatusCode: 500, //Internal server error
                       Code: 'ERROR_UNEXPECTED',
                       Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                       Mark: strMark,
                       LogId: error.LogId,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: error.name,
                                   Message: error.message,
                                   Details: await SystemUtilities.processErrorDetails( error ) //error
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     };

      response.status( result.StatusCode ).send( result );

    }

    return response;

  }

  // ANCHOR middlewareCheckIsAuthenticated
  public static async middlewareCheckIsAuthenticated( request: Request,
                                                      response: Response,
                                                      next: NextFunction ): Promise<any> {

    const context = ( request as any ).context; //context is injected by MiddlewareManager.middlewareSetContext function

    const strLanguage = context ? context.Language : null; //Context is set from previous chain function middlewareSetContext

    const logger = context ? context.Logger : null; //Context is set from previous chain function middlewareSetContext

    let userSessionStatus = context ? context.UserSessionStatus : null; //Context is set from previous chain function middlewareSetContext

    let authorization: { Expired: false, Duration: any };
    let bAuthorizationInvalidLoggedOut = false;
    let bAuthorizationInvalid = false;
    let result = null;

    if ( CommonUtilities.isNotNullOrEmpty( userSessionStatus ) ) {

      if ( CommonUtilities.isNullOrEmpty( userSessionStatus.LoggedOutAt ) ) {

        authorization = SystemUtilities.checkUserSessionStatusExpired( userSessionStatus, logger );

      }
      else {

        bAuthorizationInvalidLoggedOut = true;

      }

    }
    else {

      bAuthorizationInvalid = true;

    }

    if ( bAuthorizationInvalid ) {

      result = {
                 StatusCode: 401, //Unauthorized
                 Code: 'ERROR_INVALID_AUTHORIZATION_TOKEN',
                 Message: await I18NManager.translate( strLanguage, 'Authorization token provided is invalid' ),
                 Mark: 'FAE37676EA49' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: true,
                 Errors: [
                           {
                             Code: 'ERROR_INVALID_AUTHORIZATION_TOKEN',
                             Message: await I18NManager.translate( strLanguage, 'Authorization token provided is invalid' ),
                             Details: null
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

    }
    else if ( bAuthorizationInvalidLoggedOut ) {

      result = {
                 StatusCode: 401, //Unauthorized
                 Code: 'ERROR_LOGGED_OUT_AUTHORIZATION_TOKEN',
                 Message: await I18NManager.translate( strLanguage, 'Authorization token provided is logged out' ),
                 Mark: '0C28D66DFBC1' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: true,
                 Errors: [
                           {
                             Code: 'ERROR_LOGGED_OUT_AUTHORIZATION_TOKEN',
                             Message: await I18NManager.translate( strLanguage, 'Authorization token provided is logged out' ),
                             Details: null
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

    }
    else if ( authorization.Expired ) {

      let timeAgo = null;

      if ( authorization.Duration &&
           authorization.Duration.asSeconds ) {

        timeAgo = authorization.Duration.humanize();

      }

      result = {
                 StatusCode: 401, //Unauthorized
                 Code: 'ERROR_EXPIRED_AUTHORIZATION_TOKEN',
                 Message: await I18NManager.translate( strLanguage, 'Authorization token provided is expired' ),
                 Mark: 'C6E335E5DC71' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: true,
                 Errors: [
                           {
                             Code: 'ERROR_EXPIRED_AUTHORIZATION_TOKEN',
                             Message: await I18NManager.translate( strLanguage, 'Authorization token provided is expired' ),
                             Details: timeAgo
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

    }
    else if ( userSessionStatus.Tag &&
              userSessionStatus.Tag.includes( "#USER_GROUP_DISABLED#" ) ) {

      result = {
                 StatusCode: 401, //Unauthorized
                 Code: 'ERROR_USER_GROUP_DISABLED',
                 Message: await I18NManager.translate( strLanguage, 'Authorization token provided is for a user group disabled' ),
                 Mark: '957309DC4730' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: true,
                 Errors: [
                           {
                             Code: 'ERROR_USER_GROUP_DISABLED',
                             Message: await I18NManager.translate( strLanguage, 'Authorization token provided is for a user group disabled' ),
                             Details: null
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

    }
    else if ( userSessionStatus.Tag &&
              userSessionStatus.Tag.includes( "#USER_GROUP_EXPIRED#" ) ) {

      result = {
                 StatusCode: 401, //Unauthorized
                 Code: 'ERROR_USER_GROUP_EXPIRED',
                 Message: await I18NManager.translate( strLanguage, 'Authorization token provided is for a user group expired' ),
                 Mark: '6812FDB55733' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: true,
                 Errors: [
                           {
                             Code: 'ERROR_USER_GROUP_EXPIRED',
                             Message: await I18NManager.translate( strLanguage, 'Authorization token provided is for a user group expired' ),
                             Details: null
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

    }
    else if ( userSessionStatus.Tag &&
              userSessionStatus.Tag.includes( "#USER_DISABLED#" ) ) {

      result = {
                 StatusCode: 401, //Unauthorized
                 Code: 'ERROR_USER_DISABLED',
                 Message: await I18NManager.translate( strLanguage, 'Authorization token provided is for a user disabled' ),
                 Mark: '3479CB7BE4BE' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: true,
                 Errors: [
                           {
                             Code: 'ERROR_USER_DISABLED',
                             Message: await I18NManager.translate( strLanguage, 'Authorization token provided is for a user disabled' ),
                             Details: null
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

    }
    else if ( userSessionStatus.Tag &&
              userSessionStatus.Tag.includes( "#USER_EXPIRED#" ) ) {

      result = {
                 StatusCode: 401, //Unauthorized
                 Code: 'ERROR_USER_EXPIRED',
                 Message: await I18NManager.translate( strLanguage, 'Authorization token provided is for a user expired' ),
                 Mark: '757B13FB8742' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: true,
                 Errors: [
                           {
                             Code: 'ERROR_USER_EXPIRED',
                             Message: await I18NManager.translate( strLanguage, 'Authorization token provided is for a user expired' ),
                             Details: null
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

    }

    if ( ( request as any ).returnResult === 1 ) {

      if ( result === null ) {

        result = {
                   StatusCode: 200, //Ok
                 }

      }

      return result;

    }
    else if ( result === null ) {

      if ( await MiddlewareManager.bypassMiddlewareInterceptorsCallByRoute( "rest_api",
                                                                            request,
                                                                            logger ) === false ) {

        result = await MiddlewareManager.callToMiddlewareInterceptors( "rest_api",
                                                                       request,
                                                                       logger );

      }

      if ( result === null ) {

        if ( next ) {

          next(); //Ok is fine continue to next middleware function in the chain

        }

      }
      else if ( response ) {

        response.status( result.StatusCode ).send( result );

      }

    }
    else if ( response ) {

      response.status( result.StatusCode ).send( result );

    }

  }

  public static async middlewareCheckIsAuthorized( request: Request,
                                                   response: Response,
                                                   next: NextFunction ) {

    const context = ( request as any ).context; //context is injected by MiddlewareManager.middlewareSetContext function

    const strLanguage = context ? context.Language : null; //Context is set from previous chain function middlewareSetContext

    const logger = context ? context.Logger : null; //Context is set from previous chain function middlewareSetContext

    let userSessionStatus = context ? context.UserSessionStatus : null; //Context is set from previous chain function middlewareSetContext

    //ANCHOR get path route requested
    let strPath = "";

    if ( MiddlewareManager.realPathList.includes( request.path ) ) {

      strPath = request.path;

    }
    else {

      strPath = request.route && request.route.path ? request.route.path : request.path;

    }

    if ( process.env.SERVER_ROOT_PATH ) {

      strPath = strPath.substr( process.env.SERVER_ROOT_PATH.length, strPath.length );

    }

    const roles = await SystemUtilities.getRoleOfRoute( CommonUtilities.getRequestKindFromHTTPMethodString( request.method ), //Always post
                                                        strPath,
                                                        true,
                                                        logger );

    const bIsAuthorized = CommonUtilities.isInList( roles,
                                                    userSessionStatus.Role,
                                                    logger );

    if ( bIsAuthorized === false ) {

      const result = {
                       StatusCode: 403, //Forbidden
                       Code: 'ERROR_FORBIDEN_ACCESS',
                       Message: await I18NManager.translate( strLanguage, 'Not authorized to access' ),
                       Mark: '1ED45DB6E425' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_FORBIDEN_ACCESS',
                                   Message: await I18NManager.translate( strLanguage, 'Not authorized to access' ),
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     };

      response.status( result.StatusCode ).send( result );

      //return response;

    }
    else {

      next();  //Ok is fine continue to next middleware function in the chain

    }

  }

  // ANCHOR ruleCheckIsAuthenticated
  public static ruleCheckIsAuthenticated = rule() (

    async ( obj, args, context, info ) => {

      let result: any = false;
      //let sessionExpired = false;
      let session: { Expired: false, Duration: any };
      let bSessionInvalidLoggedOut = false;
      let bSessionInvalid = false;

      const strLanguage = context.Language;

      const logger = context.Logger;

      //const strAuthorization = context.Authorization;
      const userSessionStatus = context.UserSessionStatus;
      //const strTimeZoneId = context.TimeZoneId;

      if ( CommonUtilities.isNotNullOrEmpty( userSessionStatus ) ) {

        if ( CommonUtilities.isNullOrEmpty( userSessionStatus.LoggedOutAt ) ) {

          session = SystemUtilities.checkUserSessionStatusExpired( userSessionStatus, logger );

        }
        else {

          bSessionInvalidLoggedOut = true;

        }

      }
      else {

        bSessionInvalid = true;

      }

      if ( bSessionInvalid ) {

        const extensions = {
                             StatusCode: 401, //Unauthorized
                             Mark: '9751B88C389C' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: SystemUtilities.getUUIDv4()
                           };

        result = new ApolloError(
                                  await I18NManager.translate( strLanguage, "Authorization token provided is invalid" ),
                                  "ERROR_INVALID_AUTHORIZATION_TOKEN",
                                  extensions
                                );

      }
      else if ( bSessionInvalidLoggedOut ) {

        const extensions = {
                             StatusCode: 401, //Unauthorized
                             Mark: '3006DA613507' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: SystemUtilities.getUUIDv4()
                           };

        result = new ApolloError(
                                  await I18NManager.translate( strLanguage, "Authorization token provided is logged out" ),
                                  "ERROR_LOGGED_OUT_AUTHORIZATION_TOKEN",
                                  extensions
                                );

      }
      else if ( session.Expired ) {

        const errors = [];

        if ( session.Duration &&
             session.Duration.asSeconds ) {

          const timeAgo = session.Duration.humanize();

          errors.push(
                       {
                         Code: "ERROR_EXPIRED_AUTHORIZATION_TOKEN",
                         Message: await I18NManager.translate( strLanguage, "Authorization token provided is expired" ),
                         Details: timeAgo
                       }
                     );

        }
        else {

          errors.push(
                       {
                         Code: "ERROR_EXPIRED_AUTHORIZATION_TOKEN",
                         Message: await I18NManager.translate( strLanguage, "Authorization token provided is expired" ),
                         Details: null
                       }
                     );

        }

        const extensions = {
                             StatusCode: 401, //Unauthorized
                             Mark: '8B9F98C1AB76' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: SystemUtilities.getUUIDv4(),
                             errors: errors
                           };

        result = new ApolloError(
                                  await I18NManager.translate( strLanguage, "Authorization token provided is expired" ),
                                  "ERROR_EXPIRED_AUTHORIZATION_TOKEN",
                                  extensions
                                );

      }
      else {

        if ( await MiddlewareManager.bypassMiddlewareInterceptorsCallByRoute( "graphql_api",
                                                                              { obj, args, context, info },
                                                                              logger ) === false ) {

          result = MiddlewareManager.callToMiddlewareInterceptors( "graphql_api",
                                                                   { obj, args, context, info },
                                                                   logger );

        }

        if ( result === false ||
             result === null ) {

          result = true;

        }

      }

      return result;

    }

  );

  public static ruleCheckIsAuthorized = rule() (

    async ( obj, args, context, info ) => {

      let result: any = false;
      const logger = context.Logger;

      const userSessionStatus = context.UserSessionStatus;

      const roles = await SystemUtilities.getRoleOfRoute( 2, //Always post
                                                          info.fieldName,
                                                          true,
                                                          logger );

      result = CommonUtilities.isInList( roles,
                                         userSessionStatus.Role,
                                         logger );

      if ( result === false ) {

        const extensions = {
                             StatusCode: 403, //Forbidden
                             Mark: '74EC582F0760' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: SystemUtilities.getUUIDv4()
                           };

        result = new ApolloError( "Not authorized to access", "ERROR_FORBIDEN_ACCESS", extensions );

      }

      return result;

    }

  );
}