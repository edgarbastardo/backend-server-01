import cluster from 'cluster';

import CommonConstants, { HTTPMethod } from "../../../common/CommonConstants";

import CommonUtilities from '../../../common/CommonUtilities';
import SystemUtilities from "../../../common/SystemUtilities";

import { Router, Request, Response, NextFunction } from 'express';

//import { Route } from '../../../common/database/models/Route';
import DBConnectionManager from "../../../common/managers/DBConnectionManager";
import SYSRouteService from '../../../common/database/services/SYSRouteService';
//import ModelServiceLoader from "../../../common/database/ModelServiceLoader";
import { ModelToRestAPIServiceController } from '../../services/ModelToRestAPIService.controller';
//import dbConnection from "../../../common/managers/DBConnectionManager";
import ModelServiceManager from "../../../common/managers/ModelServiceManager";
import I18NManager from "../../../common/managers/I18Manager";
import MiddlewareManager from "../../../common/managers/MiddlewareManager";

const debug = require( 'debug' )( 'DatabaseModel.controller' );

export default class DatabaseModelController {

  //static routes: any = null;

  //AccessKind: 1 Public
  //AccessKind: 2 Authenticated
  //AccessKind: 3 Role

  //RequestKind: 1 GET
  //RequestKind: 2 POST
  //RequestKind: 3 PUT
  //RequestKind: 4 DELETE

  static readonly _TO_IOC_CONTAINER = false;

  static readonly _BASE_PATH = "/database/model";

  static readonly _ROUTE_INFO = [
                                  { Path: DatabaseModelController._BASE_PATH + "/:name", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#@@Entity@@_Basic#,#@@Entity@@_Full#", Roles: [ "Administrator" ], Description: "Get model data by id" }, //GET
                                  { Path: DatabaseModelController._BASE_PATH + "/:name/search", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#@@Entity@@_Basic#,#@@Entity@@_Full#", Roles: [ "Administrator" ], Description: "Search model data" }, //GET
                                  { Path: DatabaseModelController._BASE_PATH + "/:name/search/count", AccessKind: 3, RequestKind: 1, AllowTagAccess: "#Administrator#,#@@Entity@@_Basic#,#@@Entity@@_Full#", Roles: [ "Administrator" ], Description: "Search model data" }, //GET
                                  { Path: DatabaseModelController._BASE_PATH + "/:name", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Administrator#,#@@Entity@@_Full#", Roles: [ "Administrator" ], Description: "Create new model data" }, //POST
                                  { Path: DatabaseModelController._BASE_PATH + "/:name/bulk", AccessKind: 3, RequestKind: 2, AllowTagAccess: "#Administrator#,#@@Entity@@_Full#", Roles: [ "Administrator" ], Description: "Create new model data" }, //POST
                                  { Path: DatabaseModelController._BASE_PATH + "/:name", AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#@@Entity@@_Full#", Roles: [ "Administrator" ], Description: "Update model data" }, //PUT
                                  { Path: DatabaseModelController._BASE_PATH + "/:name/bulk", AccessKind: 3, RequestKind: 3, AllowTagAccess: "#Administrator#,#@@Entity@@_Full#", Roles: [ "Administrator" ], Description: "Update model data" }, //PUT
                                  { Path: DatabaseModelController._BASE_PATH + "/:name", AccessKind: 3, RequestKind: 4, AllowTagAccess: "#Administrator#,#@@Entity@@_Full#", Roles: [ "Administrator" ], Description: "Delete model data" }, //DELETE
                                  { Path: DatabaseModelController._BASE_PATH + "/:name/bulk", AccessKind: 3, RequestKind: 4, AllowTagAccess: "#Administrator#,#@@Entity@@_Full#", Roles: [ "Administrator" ], Description: "Delete model data" }, //DELETE
                                ]

  constructor( logger: any ) {

    //let debugMark = debug.extend( "F840F4C8EB20" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

    //debugMark( "DatabaseModel -> constructor %O", logger );

  }

  async registerInDataBase( logger: any ) {

    try {

      if ( DBConnectionManager.currentInstance.models !== null ) {

        //const connection = DBConnectionManager.currentInstance;

        for ( let strModelName of Object.keys( DBConnectionManager.currentInstance.models ) ) {

          const strTableMame = DBConnectionManager.currentInstance.models[ strModelName ].tableName;

          for ( let routeInfo of DatabaseModelController._ROUTE_INFO ) {

            let strRealPath = routeInfo.Path.replace( ":name", strTableMame );
            //strRealPath = strRealPath.replace( ":id", "" );

            const strAction = CommonUtilities.getActionStringFromRequestKind( routeInfo.RequestKind );

            //const strFullActionTag = strModelName + "_Full";
            const strSpecificActionTag = strTableMame + "_" + strAction;

            let strAllowTagAccess = routeInfo.AllowTagAccess + ",#" + strSpecificActionTag + "#";

            const roles = Object.assign( [], routeInfo.Roles );
            //roles.push( strSpecificActionTag );

            if ( strAllowTagAccess.indexOf( "#@@Entity@@_Basic#" ) >= 0 ) {

              strAllowTagAccess = strAllowTagAccess.replace( "#@@Entity@@_Basic#", "#" + strTableMame + "_Basic#" );

              roles.push( strTableMame + "_Basic" );

            }

            if ( strAllowTagAccess.indexOf( "#@@Entity@@_Full#" ) >= 0 ) {

              strAllowTagAccess = strAllowTagAccess.replace( "#@@Entity@@_Full#", "#" + strTableMame + "_Full#" );

              roles.push( strTableMame + "_Full" );

            }

            MiddlewareManager.registerRealPath( process.env.SERVER_ROOT_PATH + strRealPath );

            await SYSRouteService.createOrUpdateRouteAndRoles( routeInfo.AccessKind,
                                                               routeInfo.RequestKind,
                                                               strRealPath, //Path
                                                               strAllowTagAccess,
                                                               roles as any,
                                                               routeInfo.Description,
                                                               null,
                                                               logger );

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = DatabaseModelController.name + "." + this.registerInDataBase.name;

      const strMark = "91C782C4EAA4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      ModelToRestAPIServiceController.sequelizeModelList = DBConnectionManager.currentInstance.models;

      // -> /database/model/:name
      result.get( process.env.SERVER_ROOT_PATH + DatabaseModelController._ROUTE_INFO[ 0 ].Path,
                  [
                    MiddlewareManager.middlewareSetContext,
                    MiddlewareManager.middlewareCheckIsAuthenticated,
                    MiddlewareManager.middlewareCheckIsAuthorized,
                  ], //Midddlewares
                  async ( request: Request, response: Response, next: NextFunction ) => {

        const context = (request as any).context;

        let strLanguage = context ? context.Language : null;

        try {

          const strModelName = request.params.name; //pathSections[ pathSections.length - 1 ];

          const dbConnection = DBConnectionManager.currentInstance;
          const model = dbConnection.models[ strModelName ];

          if ( ModelServiceManager.Services[ strModelName + "Service" ] &&
               model ) {

            const result = await ModelToRestAPIServiceController.get( model,
                                                                      request,
                                                                      null,
                                                                      logger );

            response.status( result.StatusCode ).send( result );

          }
          else {

            const result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_UNKNOWN_MODEL',
                             Message: await I18NManager.translate( strLanguage, 'Unknown model name [%s]', strModelName ),
                             Mark: '5AA705EE0690' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_UNKNOWN_MODEL',
                                         Message: await I18NManager.translate( strLanguage, 'Unknown model name [%s]', strModelName ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           };

            response.status( result.StatusCode ).send( result );

          }

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = DatabaseModelController.name + "." + this.createRoutes.name;

          const strMark = "A437102ECBE8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      });

      // -> /database/model/:name/search
      result.get( process.env.SERVER_ROOT_PATH + DatabaseModelController._ROUTE_INFO[ 1 ].Path,
                  [
                    MiddlewareManager.middlewareSetContext,
                    MiddlewareManager.middlewareCheckIsAuthenticated,
                    MiddlewareManager.middlewareCheckIsAuthorized,
                  ], //Midddlewares
                  async ( request: Request, response: Response, next: NextFunction ) => {

        const context = (request as any).context;

        let strLanguage = context ? context.Language : null;

        try {

          //const pathSections = request.path.split( "/" );

          const strModelName = request.params.name; //pathSections[ pathSections.length - 2 ];

          const dbConnection = DBConnectionManager.currentInstance;
          const model = dbConnection.models[ strModelName ];

          if ( ModelServiceManager.Services[ strModelName + "Service" ] &&
               model ) {

            const result = await ModelToRestAPIServiceController.search( model,
                                                                         request,
                                                                         null,
                                                                         undefined,
                                                                         logger );

            response.status( result.StatusCode ).send( result );

          }
          else {

            const result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_UNKNOWN_MODEL',
                             Message: await I18NManager.translate( strLanguage, 'Unknown model name [%s]', strModelName ),
                             Mark: '443D8E18870B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_UNKNOWN_MODEL',
                                         Message: await I18NManager.translate( strLanguage, 'Unknown model name [%s]', strModelName ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           };

            response.status( result.StatusCode ).send( result );

          }

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = DatabaseModelController.name + "." + this.createRoutes.name;

          const strMark = "C3E23B80740C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      });

      // -> /database/model/:name/search/count
      result.get( process.env.SERVER_ROOT_PATH + DatabaseModelController._ROUTE_INFO[ 2 ].Path,
                  [
                    MiddlewareManager.middlewareSetContext,
                    MiddlewareManager.middlewareCheckIsAuthenticated,
                    MiddlewareManager.middlewareCheckIsAuthorized,
                  ], //Midddlewares
                  async ( request: Request, response: Response, next: NextFunction ) => {

        const context = (request as any).context;

        let strLanguage = context ? context.Language : null;

        try {

          const strModelName = request.params.name; //pathSections[ pathSections.length - 3 ];

          const dbConnection = DBConnectionManager.currentInstance;
          const model = dbConnection.models[ strModelName ];

          if ( ModelServiceManager.Services[ strModelName + "Service" ] &&
               model ) {

            //ModelToRestAPI.sequelizeModelList = DBConnectionManager.currentInstance.models;

            const result = await ModelToRestAPIServiceController.searchCount( model,
                                                                              request,
                                                                              logger );

            response.status( result.StatusCode ).send( result );

          }
          else {

            const result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_UNKNOWN_MODEL',
                             Message: await I18NManager.translate( strLanguage, 'Unknown model name [%s]', strModelName ),
                             Mark: '8DC756579436' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_UNKNOWN_MODEL',
                                         Message: await I18NManager.translate( strLanguage, 'Unknown model name [%s]', strModelName ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           };

            response.status( result.StatusCode ).send( result );

          }

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = DatabaseModelController.name + "." + this.createRoutes.name;

          const strMark = "DDF1DBA373A8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      });

      // -> /database/model/:name (Create)
      result.post( process.env.SERVER_ROOT_PATH + DatabaseModelController._ROUTE_INFO[ 3 ].Path,
                   [
                     MiddlewareManager.middlewareSetContext,
                     //SystemUtilities.middlewareCheckIsAuthenticated,
                     //SystemUtilities.middlewareCheckIsAuthorized,
                   ], //Midddlewares
                   async ( request: Request, response: Response, next: NextFunction ) => {

        const context = (request as any).context;

        let strLanguage = context ? context.Language : null;

        try {

          const strModelName = request.params.name; //pathSections[ pathSections.length - 3 ];

          const dbConnection = DBConnectionManager.currentInstance;
          const model = dbConnection.models[ strModelName ];

          if ( ModelServiceManager.Services[ strModelName + "Service" ] &&
               model ) {

            const result = await ModelToRestAPIServiceController.create( model,
                                                                         request,
                                                                         null,
                                                                         logger );

            response.status( result.StatusCode ).send( result );

          }
          else {

            const result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_UNKNOWN_MODEL',
                             Message: await I18NManager.translate( strLanguage, 'Unkown model name [%s]', strModelName ),
                             Mark: '41587FD16BEE' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_UNKNOWN_MODEL',
                                         Message: await I18NManager.translate( strLanguage, 'Unkown model name [%s]', strModelName ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           };

            response.status( result.StatusCode ).send( result );

          }

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = DatabaseModelController.name + "." + this.createRoutes.name;

          const strMark = "30D70322D93B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      });

      // -> /database/model/:name/bulk (Create)
      result.post( process.env.SERVER_ROOT_PATH + DatabaseModelController._ROUTE_INFO[ 4 ].Path,
                   [
                     MiddlewareManager.middlewareSetContext,
                     MiddlewareManager.middlewareCheckIsAuthenticated,
                     MiddlewareManager.middlewareCheckIsAuthorized,
                   ], //Midddlewares
                   async ( request: Request, response: Response, next: NextFunction ) => {

        const context = (request as any).context;

        let strLanguage = context ? context.Language : null;

        try {

          //const pathSections = request.path.split( "/" );

          const strModelName = request.params.name; //pathSections[ pathSections.length - 3 ];

          const dbConnection = DBConnectionManager.currentInstance;
          const model = dbConnection.models[ strModelName ];

          if ( ModelServiceManager.Services[ strModelName + "Service" ] &&
               model ) {

            const result = await ModelToRestAPIServiceController.bulkCreate( model,
                                                                             request,
                                                                             null,
                                                                             undefined,
                                                                             logger );

            response.status( result.StatusCode ).send( result );

          }
          else {

            const result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_UNKNOWN_MODEL',
                             Message: await I18NManager.translate( strLanguage, 'Unknown model name [%s]', strModelName ),
                             Mark: 'C21B6321CD80' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_UNKNOWN_MODEL',
                                         Message: await I18NManager.translate( strLanguage, 'Unknown model name [%s]', strModelName ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           };

            response.status( result.StatusCode ).send( result );

          }

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = DatabaseModelController.name + "." + this.createRoutes.name;

          const strMark = "31455C0BA53B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      });

      // -> /database/model/:name (Update)
      result.put( process.env.SERVER_ROOT_PATH + DatabaseModelController._ROUTE_INFO[ 5 ].Path,
                  [
                    MiddlewareManager.middlewareSetContext,
                    MiddlewareManager.middlewareCheckIsAuthenticated,
                    MiddlewareManager.middlewareCheckIsAuthorized,
                  ], //Midddlewares
                  async ( request: Request, response: Response, next: NextFunction ) => {

        const context = (request as any).context;

        let strLanguage = context ? context.Language : null;

        try {

          const strModelName = request.params.name; //pathSections[ pathSections.length - 3 ];

          const dbConnection = DBConnectionManager.currentInstance;
          const model = dbConnection.models[ strModelName ];

          if ( ModelServiceManager.Services[ strModelName + "Service" ] &&
               model ) {

            const result = await ModelToRestAPIServiceController.update( model,
                                                                         request,
                                                                         null,
                                                                         logger );

            response.status( result.StatusCode ).send( result );

          }
          else {

            const result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_UNKNOWN_MODEL',
                             Message: await I18NManager.translate( strLanguage, 'Unknown model name [%s]', strModelName ),
                             Mark: 'A5FE807FE07E' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_UNKNOWN_MODEL',
                                         Message: await I18NManager.translate( strLanguage, 'Unknown model name [%s]', strModelName ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           };

            response.status( result.StatusCode ).send( result );

          }

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = DatabaseModelController.name + "." + this.createRoutes.name;

          const strMark = "F5E9CC4BFBDD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      });

      // -> /database/model/:name/bulk (Update)
      result.put( process.env.SERVER_ROOT_PATH + DatabaseModelController._ROUTE_INFO[ 6 ].Path,
                  [
                    MiddlewareManager.middlewareSetContext,
                    MiddlewareManager.middlewareCheckIsAuthenticated,
                    MiddlewareManager.middlewareCheckIsAuthorized,
                  ], //Midddlewares
                  async ( request: Request, response: Response, next: NextFunction ) => {

        const context = (request as any).context;

        let strLanguage = context ? context.Language : null;

        try {

          const strModelName = request.params.name; //pathSections[ pathSections.length - 3 ];

          const dbConnection = DBConnectionManager.currentInstance;
          const model = dbConnection.models[ strModelName ];

          if ( ModelServiceManager.Services[ strModelName + "Service" ] &&
               model ) {

            const result = await ModelToRestAPIServiceController.bulkUpdate( model,
                                                                             request,
                                                                             null,
                                                                             undefined,
                                                                             logger );

            response.status( result.StatusCode ).send( result );

          }
          else {

            const result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_UNKNOWN_MODEL',
                             Message: await I18NManager.translate( strLanguage, 'Unknown model name [%s]', strModelName ),
                             Mark: 'F1D8627ABF2C' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_UNKNOWN_MODEL',
                                         Message: await I18NManager.translate( strLanguage, 'Unknown model name [%s]', strModelName ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           };

            response.status( result.StatusCode ).send( result );

          }

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = DatabaseModelController.name + "." + this.createRoutes.name;

          const strMark = "FB03C3F8DA16" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      });

      // -> /database/model/:name (Delete)
      result.delete( process.env.SERVER_ROOT_PATH + DatabaseModelController._ROUTE_INFO[ 7 ].Path,
                     [
                       MiddlewareManager.middlewareSetContext,
                       MiddlewareManager.middlewareCheckIsAuthenticated,
                       MiddlewareManager.middlewareCheckIsAuthorized,
                     ], //Midddlewares
                     async ( request: Request, response: Response, next: NextFunction ) => {

        const context = (request as any).context;

        let strLanguage = context ? context.Language : null;

        try {

          const strModelName = request.params.name; //pathSections[ pathSections.length - 3 ];

          const dbConnection = DBConnectionManager.currentInstance;
          const model = dbConnection.models[ strModelName ];

          if ( ModelServiceManager.Services[ strModelName + "Service" ] &&
               model ) {

            const result = await ModelToRestAPIServiceController.delete( model,
                                                                         request,
                                                                         logger );

            response.status( result.StatusCode ).send( result );

          }
          else {

            const result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_UNKNOWN_MODEL',
                             Message: await I18NManager.translate( strLanguage, 'Unknown model name [%s]', strModelName ),
                             Mark: 'A938DC0DAD71' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_UNKNOWN_MODEL',
                                         Message: await I18NManager.translate( strLanguage, 'Unknown model name [%s]', strModelName ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           };

            response.status( result.StatusCode ).send( result );

          }

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = DatabaseModelController.name + "." + this.createRoutes.name;

          const strMark = "1527BF211FAD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      });

      // -> /database/model/:name/bulk (Delete)
      result.delete( process.env.SERVER_ROOT_PATH + DatabaseModelController._ROUTE_INFO[ 8 ].Path,
                     [
                       MiddlewareManager.middlewareSetContext,
                       MiddlewareManager.middlewareCheckIsAuthenticated,
                       MiddlewareManager.middlewareCheckIsAuthorized,
                     ], //Midddlewares
                     async ( request: Request, response: Response, next: NextFunction ) => {

        const context = (request as any).context;

        let strLanguage = context ? context.Language : null;

        try {

          const strModelName = request.params.name; //pathSections[ pathSections.length - 3 ];

          const dbConnection = DBConnectionManager.currentInstance;
          const model = dbConnection.models[ strModelName ];

          if ( ModelServiceManager.Services[ strModelName + "Service" ] &&
               model ) {

            const result = await ModelToRestAPIServiceController.bulkDelete( model,
                                                                             request,
                                                                             undefined,
                                                                             logger );

            response.status( result.StatusCode ).send( result );

          }
          else {

            const result = {
                             StatusCode: 400, //Bad request
                             Code: 'ERROR_UNKNOWN_MODEL',
                             Message: await I18NManager.translate( strLanguage, 'Unknown model name [%s]', strModelName ),
                             Mark: '7B5730193E81' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_UNKNOWN_MODEL',
                                         Message: await I18NManager.translate( strLanguage, 'Unknown model name [%s]', strModelName ),
                                         Details: null
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           };

            response.status( result.StatusCode ).send( result );

          }

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = DatabaseModelController.name + "." + this.createRoutes.name;

          const strMark = "40D7BC5B2D60" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      });

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = DatabaseModelController.name + "." + this.createRoutes.name;

      const strMark = "CF8FECABF995" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

}