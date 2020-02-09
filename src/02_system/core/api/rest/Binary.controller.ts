
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
  request,
  httpDelete,
  httpGet
} from "inversify-express-utils";
import { injectable, inject } from 'inversify';
//import SecurityService from '../../../common/database/services/SecurityService';
import BinaryServiceController from "../../services/BinaryService.controller";
import CommonConstants from '../../../common/CommonConstants';
import I18NManager from "../../../common/managers/I18Manager";
import MiddlewareManager from '../../../common/managers/MiddlewareManager';

const debug = require( 'debug' )( 'Binary.controller' );

//@injectable()
@controller( process.env.SERVER_ROOT_PATH + BinaryController._BASE_PATH )
export default class BinaryController {

  //AccessKind: 1 Public
  //AccessKind: 2 Authenticated
  //AccessKind: 3 Role

  //RequestKind: 1 GET
  //RequestKind: 2 POST
  //RequestKind: 3 PUT
  //RequestKind: 4 DELETE

  static readonly _TO_IOC_CONTAINER = true;

  static readonly _BASE_PATH = "/system/binary";

  static readonly _ROUTE_INFO = [
                                  { Path: BinaryController._BASE_PATH + "/auth", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Binary_Basic#,#Binary_Full#,#Administrator#", Roles: [ "Binary_Basic", "Binary_Full", "Administrator" ], Description: "Create a new auth token for access to binary data" },
                                  { Path: BinaryController._BASE_PATH + "/auth", AccessKind: 3, RequestKind: 4, AllowTagAccess: "#Binary_Basic#,#Binary_Full#,#Administrator#", Roles: [ "Binary_Basic", "Binary_Full", "Administrator" ], Description: "Delete a auth token for access to binary data" },
                                  { Path: BinaryController._BASE_PATH + "/search", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Binary_Search#,#Binary_Full#,#Administrator#", Roles: [ "Binary_Search", "Binary_Full", "Administrator" ], Description: "Search by meta of binary data" },
                                  { Path: BinaryController._BASE_PATH + "/search/count", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Binary_Search#,#Binary_Full#,#Administrator#", Roles: [ "Binary_Search", "Binary_Full", "Administrator" ], Description: "Search count by meta of binary data" },
                                  { Path: BinaryController._BASE_PATH, AccessKind: 1, RequestKind: 1, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Get binary data from backend server" },
                                  { Path: BinaryController._BASE_PATH + "/detail", AccessKind: 1, RequestKind: 1, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Get binary data detail from backend server" },
                                  { Path: BinaryController._BASE_PATH, AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Binary_Upload#,#Binary_Basic#,#Binary_Full#,#Administrator#", Roles: [ "Binary_Basic", "Binary_Full", "Administrator" ], Description: "Upload binary data to backend server" },
                                  { Path: BinaryController._BASE_PATH, AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Binary_Modify#,#Binary_Full#,#Administrator#", Roles: [ "Binary_Full", "Administrator" ], Description: "Modify information metadata of binary data from backend server" },
                                  { Path: BinaryController._BASE_PATH, AccessKind: 3, RequestKind: 4, AllowTagAccess: "#Binary_Delete#,#Binary_Full#,#Administrator#", Roles: [ "Binary_Full", "Administrator" ], Description: "Delete binary data to backend server" },
                                ]

  _controllerLogger = null;

  constructor( @inject( "appLogger" ) logger: any ) {

    this._controllerLogger = logger;

  }

  async registerInDataBase( logger: any ) {

    try {

      for ( let routeInfo of BinaryController._ROUTE_INFO ) {

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

      sourcePosition.method = BinaryController.name + "." + this.registerInDataBase.name;

      const strMark = "CD8713A8B03E";

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

  async createRoutes( logger: any ): Promise<Router> {

    let result = null;

    try {

      result = Router();

      result.get( process.env.SERVER_ROOT_PATH + BinaryController._ROUTE_INFO[ 4 ].Path + "/:id?/:auth?/:thumbnail?",
                  [
                    MiddlewareManager.middlewareSetContext,
                  ], //Midddlewares
                  async ( request: Request, response: Response, next: NextFunction ) => {

        let strLanguage = "";

        try {

          const context = ( request as any ).context;

          strLanguage = context.Language;

          const result = await BinaryServiceController.processBinaryDataDownload( request,
                                                                                  response,
                                                                                  null,
                                                                                  context.Logger );

          /*
          if ( result.statusCode === 200 ||  //Ok
              result.statusCode === 401 ||  //Unauthorized
              result.statusCode === 403 ||  //Forbidden
              result.statusCode === 404 ) { //Not found
          */

          if ( result.File ) {

            const options = {
                              headers: {
                                        'Content-Disposition': `filename="${result.Name}"`, //attachment; 
                                        'Content-Type': result.Mime,
                                        'Content-Length': result.Size,
                                      }
                            }
            response.status( result.StatusCode ).sendFile( result.File,
                                                           options );
            //response.status( result.StatusCode ).download( result.File,
            //                                               result.Name );

          }
          else {

            response.status( result.StatusCode ).end();

          }

          //response.download( "/home/dsistemas/Escritorio/Node_JS/2019-11-06/backend-server-01/binary_data/default/404.png" );

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = BinaryController.name + "." + this.createRoutes.name + ".result.get";

          const strMark = "0BFE8904C747";

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

          const resultHeaders = {
                                  StatusCode: 500,
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

          response.setHeader( "X-Body-Response", JSON.stringify( resultHeaders ) );

          response.status( 500 ).end();

        }

      });

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = BinaryController.name + "." + this.createRoutes.name;

      const strMark = "E0981AC18F3A";

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

  @httpPost(
             "/auth",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
             MiddlewareManager.middlewareCheckIsAuthorized
           )
  async createAuth( request: Request, response: Response ) {

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const result = await BinaryServiceController.createBinaryDataAuthorization( request,
                                                                        null,
                                                                        context.Logger );

      response.status( result.StatusCode ).send( result );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = BinaryController.name + "." + this.deleteAuth.name;

      const strMark = "0E1FDD49C065";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      const result = {
                       StatusCode: 500,
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

  }

  @httpDelete(
               "/auth",
               MiddlewareManager.middlewareSetContext,
               MiddlewareManager.middlewareCheckIsAuthenticated,
               MiddlewareManager.middlewareCheckIsAuthorized
             )
  async deleteAuth( request: Request, response: Response ) {

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const result = await BinaryServiceController.deleteBinaryDataAuthorization( request,
                                                                        null,
                                                                        context.Logger );

      response.status( result.StatusCode ).send( result );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = BinaryController.name + "." + this.deleteAuth.name;

      const strMark = "E61AAB21A831";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      const result = {
                       StatusCode: 500,
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

  }

  @httpGet(
             "/search",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
             MiddlewareManager.middlewareCheckIsAuthorized
           )
  async search( request: Request, response: Response ) {

    /*
    const context = ( request as any ).context;

    const result = await SecurityService.tokenCheck( context.Authorization,
                                                     null,
                                                     context.Logger );

    response.status( result.StatusCode ).send( result );
    */

  }

  @httpGet(
             "/search/count",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
             MiddlewareManager.middlewareCheckIsAuthorized
           )
  async searchCount( request: Request, response: Response ) {

    /*
    const context = ( request as any ).context;

    const result = await SecurityService.tokenCheck( context.Authorization,
                                                     null,
                                                     context.Logger );

    response.status( result.StatusCode ).send( result );
    */

  }

  /*
  @httpGet(
             "/:id?/:auth?/:thumbnail?",
             //SystemUtilities.middlewareSetContext
           )
  getBinaryData( request: Request, response: Response, next: Function ) {

    / *
    const context = ( request as any ).context;

    const result = await BinaryService.processBinaryDataDownload( request,
                                                                  response,
                                                                  null,
                                                                  context.Logger );

    / *
    if ( result.statusCode === 200 ||  //Ok
         result.statusCode === 401 ||  //Unauthorized
         result.statusCode === 403 ||  //Forbidden
         result.statusCode === 404 ) { //Not found
          * /
    if ( result.File ) {

      response.sendFile( result.File );

    }
    else {

      response.status( result.StatusCode ).end();

    }
    */

    /*
    var options = {
      root: "/home/dsistemas/Escritorio/Node_JS/2019-11-06/backend-server-01/binary_data/default/",
      dotfiles: 'deny',
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
      }
    }

    const fileName = "404.png"
    response.sendFile(fileName, options, function (err) {
      if (err) {
        next(err)
      } else {
        let debugMark = debug.extend( 'A4F269DA1563' );
        debugMark( 'Sent: %s', fileName );
      }
    })
    * /

    response.download( "/home/dsistemas/Escritorio/Node_JS/2019-11-06/backend-server-01/binary_data/default/404.png" );
    //response.sendFile(  );

  }
  */

  @httpPost(
             "/",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
             MiddlewareManager.middlewareCheckIsAuthorized
           )
  async uploadBinaryData( request: Request, response: Response ) {

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const result = await BinaryServiceController.processBinaryDataUpload( request,
                                                                  null,
                                                                  context.Logger );

      response.status( result.StatusCode ).send( result );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = BinaryController.name + "." + this.createAuth.name;

      const strMark = "A773B579AA28";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      const result = {
                       StatusCode: 500,
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

  }

}