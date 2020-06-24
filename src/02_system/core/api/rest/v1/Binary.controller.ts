import cluster from 'cluster';

import {
  Router,
  Request,
  Response,
  NextFunction
} from 'express';
//import { Controller, Get, Post, Param, Delete, Body, Req, Res, UseBefore } from "routing-controllers";
import {
  controller,
  //httpGet,
  httpPost,
  //response,
  //requestParam,
  //requestBody,
  //request,
  httpDelete,
  httpGet,
  httpPut
} from "inversify-express-utils";
import {
  //injectable,
  inject
} from 'inversify';

import CommonConstants from '../../../../common/CommonConstants';

import CommonUtilities from '../../../../common/CommonUtilities';
import SystemUtilities from "../../../../common/SystemUtilities";

import SYSRouteService from '../../../../common/database/master/services/SYSRouteService';
import BinaryServiceController from "../../../services/v1/BinaryService.controller";
import I18NManager from "../../../../common/managers/I18Manager";
import MiddlewareManager from '../../../../common/managers/MiddlewareManager';

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

  static readonly _BASE_PATH = "/v1/system/binary";

  static readonly _ROUTE_INFO = [
                                  { Path: BinaryController._BASE_PATH + "/auth", Action: "v1.system.binary.auth.create", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Create a new auth token for access to binary data" },
                                  { Path: BinaryController._BASE_PATH + "/auth", Action: "v1.system.binary.auth.delete", AccessKind: 2, RequestKind: 4, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Delete the auth token for access to binary data" },
                                  { Path: BinaryController._BASE_PATH + "/search", Action: "v1.system.binary.search", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#Search_Binary#,#Search_Binary_L01#,#Search_Binary_L02#,#Search_Binary_L03#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "Search_Binary", "Search_Binary_L01", "Search_Binary_L02", "Search_Binary_L03" ], Description: "Search by meta of binary data" },
                                  { Path: BinaryController._BASE_PATH + "/search/count", Action: "v1.system.binary.search.count", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#Search_Binary#,#Search_Binary_L01#,#Search_Binary_L02#,#Search_Binary_L03#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "Search_Binary", "Search_Binary_L01", "Search_Binary_L02", "Search_Binary_L03" ], Description: "Search count by meta of binary data" },
                                  { Path: BinaryController._BASE_PATH, Action: "v1.system.binary.get", AccessKind: 1, RequestKind: 1, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Get binary data from backend server" }, //,#Master_L01#,#Master_L02#,#Master_L03#,#GetBinaryL01#,#GetBinaryL02#,#GetBinaryL03#  , "Master_L01", "Master_L02", "Master_L03", "GetBinaryL01", "GetBinaryL02", "GetBinaryL03"
                                  { Path: BinaryController._BASE_PATH + "/details", Action: "v1.system.binary.get.details", AccessKind: 1, RequestKind: 1, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Get binary meta data details from backend server" }, //,#Master_L01#,#Master_L02#,#Master_L03#,#GetBinaryL01#,#GetBinaryL02#,#GetBinaryL03# , "Master_L01", "Master_L02", "Master_L03", "GetBinaryL01", "GetBinaryL02", "GetBinaryL03"
                                  { Path: BinaryController._BASE_PATH, Action: "v1.system.binary.upload", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#Upload_Binary#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "UploadBinary" ], Description: "Upload binary data to the backend server" },
                                  { Path: BinaryController._BASE_PATH, Action: "v1.system.binary.update", AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#Update_Binary#,#Update_Binary_L01#,#Update_Binary_L02#,#Update_Binary_L03#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "Update_Binary", "Update_Binary_L01", "Update_Binary_L02", "Update_Binary_L03" ], Description: "Update the information metadata of binary data from backend server" },
                                  { Path: BinaryController._BASE_PATH + "/disable/bulk", Action: "v1.system.binary.disable.bulk", AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#Update_Binary#,#Update_Binary_L01#,#Update_Binary_L02#,#Update_Binary_L03#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "Update_Binary", "Update_Binary_L01", "Update_Binary_L02", "Update_Binary_L03" ], Description: "Disable existent information metadata binary data in bulk" },
                                  { Path: BinaryController._BASE_PATH + "/enable/bulk", Action: "v1.system.binary.enable.bulk", AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#Update_Binary#,#Update_Binary_L01#,#Update_Binary_L02#,#Update_Binary_L03#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "Update_Binary", "Update_Binary_L01", "Update_Binary_L02", "Update_Binary_L03" ], Description: "Enable existent information metadata binary data in bulk" },
                                  { Path: BinaryController._BASE_PATH, Action: "v1.system.binary.delete", AccessKind: 3, RequestKind: 4, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#Delete_Binary#,#Delete_Binary_L01#,#Delete_Binary_L02#,#Delete_Binary_L03#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "Delete_Binary", "Delete_Binary_L01", "Delete_Binary_L02", "Delete_Binary_L03" ], Description: "Delete the information metadata of binary data from backend server" },
                                  { Path: BinaryController._BASE_PATH + "/bulk", Action: "v1.system.binary.delete.bulk", AccessKind: 3, RequestKind: 4, AllowTagAccess: "#Administrator#,#BManager_L99#,#Master_L01#,#Master_L02#,#Master_L03#,#Delete_Binary#,#Delete_Binary_L01#,#Delete_Binary_L02#,#Delete_Binary_L03#", Roles: [ "Administrator", "BManager_L99", "Master_L01", "Master_L02", "Master_L03", "Delete_Binary", "Delete_Binary_L01", "Delete_Binary_L02", "Delete_Binary_L03" ], Description: "Delete the information metadata of binary data in bulk from backend server" },
                                ]

  _controllerLogger = null;

  constructor( @inject( "appLogger" ) logger: any ) {

    this._controllerLogger = logger;

  }

  async registerInDataBase( logger: any ) {

    try {

      for ( let routeInfo of BinaryController._ROUTE_INFO ) {

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

      sourcePosition.method = BinaryController.name + "." + this.registerInDataBase.name;

      const strMark = "CD8713A8B03E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      //Download the binary data
      result.get( process.env.SERVER_ROOT_PATH + BinaryController._ROUTE_INFO[ 4 ].Path, // + "/:id?/:auth?/:thumbnail?",
                  [
                    MiddlewareManager.middlewareSetContext,
                    MiddlewareManager.middlewareClearIsNotValidSession
                  ], //Midddlewares
                  async ( request: Request, response: Response, next: NextFunction ) => {

        let strLanguage = "";

        try {

          const context = ( request as any ).context;

          strLanguage = context.Language;

          const result = await BinaryServiceController.getBinaryData( request,
                                                                      response,
                                                                      null,
                                                                      context.Logger );

          if ( result.File ) {

            const options = {
                              headers: {
                                         'Content-Disposition': `filename="${result.Name}"`, //attachment;
                                         'Content-Type': result.Mime,
                                         'Content-Length': result.Size,
                                         'X-Body-Response': JSON.stringify( result[ "X-Body-Response" ] )
                                       }
                            }
            response.status( result.StatusCode ).sendFile( result.File,
                                                           options );

          }
          else {

            response.status( result.StatusCode ).end();

          }

          //response.download( "/home/dsistemas/Escritorio/Node_JS/2019-11-06/backend-server-01/binary_data/default/404.png" );

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = BinaryController.name + "." + this.createRoutes.name + ".result.get";

          const strMark = "0BFE8904C747" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

          response.setHeader( "X-Body-Response", JSON.stringify( resultHeaders ) );

          response.status( 500 ).end();

        }

      });

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = BinaryController.name + "." + this.createRoutes.name;

      const strMark = "E0981AC18F3A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
             //MiddlewareManager.middlewareCheckIsAuthorized
           )
  async createBinaryDataAuthorization( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await BinaryServiceController.createBinaryDataAuthorization( request,
                                                                                null,
                                                                                context.Logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpDelete(
               "/auth",
               MiddlewareManager.middlewareSetContext,
               MiddlewareManager.middlewareCheckIsAuthenticated,
               //MiddlewareManager.middlewareCheckIsAuthorized
             )
  async deleteBinaryDataAuthorization( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await BinaryServiceController.deleteBinaryDataAuthorization( request,
                                                                                null,
                                                                                context.Logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
             "/search",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
             MiddlewareManager.middlewareCheckIsAuthorized
           )
  async searchBinaryData( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await BinaryServiceController.searchBinaryData( request,
                                                                   null,
                                                                   this._controllerLogger || context.Logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/search/count",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized
          )
  async searchCountBinaryData( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await BinaryServiceController.searchCountBinaryData( request,
                                                                        null,
                                                                        this._controllerLogger || context.Logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
             "/details",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareClearIsNotValidSession
           )
  async detailsBinaryData( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await BinaryServiceController.getBinaryDataDetails( request,
                                                                       null,
                                                                       this._controllerLogger || context.Logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
             MiddlewareManager.middlewareCheckIsAuthorized
           )
  async uploadBinaryData( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await BinaryServiceController.uploadBinaryData( request,
                                                                   null,
                                                                   context.Logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized
          )
  async updateBinaryData( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await BinaryServiceController.updateBinaryData( request,
                                                                   null,
                                                                   this._controllerLogger || context.Logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/disable/bulk",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized
          )
  async disableBulkBinaryData( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await BinaryServiceController.disableBulkBinaryData( request,
                                                                        null,
                                                                        this._controllerLogger || context.Logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/enable/bulk",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
            MiddlewareManager.middlewareCheckIsAuthorized
          )
  async enableBulkBinaryData( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await BinaryServiceController.enableBulkBinaryData( request,
                                                                       null,
                                                                       this._controllerLogger || context.Logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpDelete(
               "",
               MiddlewareManager.middlewareSetContext,
               MiddlewareManager.middlewareCheckIsAuthenticated,
               MiddlewareManager.middlewareCheckIsAuthorized
             )
  async deleteBinaryData( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await BinaryServiceController.deleteBinaryData( request,
                                                                   null,
                                                                   this._controllerLogger || context.Logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpDelete(
               "/bulk",
               MiddlewareManager.middlewareSetContext,
               MiddlewareManager.middlewareCheckIsAuthenticated,
               MiddlewareManager.middlewareCheckIsAuthorized,
             )
  async deleteBulkBinaryData( request: Request, response: Response ) {

    const result = await BinaryServiceController.deleteBulkBinaryData( request,
                                                                       null,
                                                                       this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

}
