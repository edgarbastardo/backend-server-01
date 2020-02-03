
import { ApolloServer, ApolloError } from 'apollo-server-express';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import depthLimit from 'graphql-depth-limit';
import helmet from 'helmet';
import morgan from 'morgan';
//import CoreGraphQLApiLoader from '../../core/api/ModelToRestAPI/CoreGraphQLAPILoader';
import GraphQLAPIManager from './GraphQLAPIManager';
import RestAPIManager from './RestAPIManager';
//import ModelServiceLoader from '../database/services/ModelServiceLoader';
import { Request, Response, NextFunction } from 'express';
import fileUpload from 'express-fileupload';
import { Container } from 'inversify';

import CommonUtilities from "../CommonUtilities";
import SystemUtilities from "../SystemUtilities";
import { InversifyExpressServer } from 'inversify-express-utils';

//import { UserSessionStatus } from "../database/models/UserSessionStatus";
//import AuthenticationController from "../../core/api/rest/Authentication.controller";
import BinaryServiceController from "../../core/services/BinaryService.controller";
import CommonConstants from '../CommonConstants';

const debug = require( 'debug' )( 'ApplicationManager' );

//sentry.init( { dsn: 'https://f7af458c288e4b2193ef4b7e05686f04@sentry.io/1797264' } );

export default class ApplicationManager {

  static currentInstance: any = null;

  static async create( dbConnection: any, logger: any ): Promise<any> {

    let result = null;

    try {

      //await new ModelServiceLoader().loadModelServices( logger );

      let app = express();

      const loggerStream = CommonUtilities.isNotNullOrEmpty( logger ) &&
                           CommonUtilities.isNotNullOrEmpty( logger.stream ) ? logger.stream : null; // LoggerManager.mainLoggerIntance.stream;

      const intBinaryDataMaximumSize = await BinaryServiceController.getConfigBinaryDataMaximumSize( null,
                                                                                           logger );
      // The request handler must be the first middleware on the app
      //app.use( sentry.Handlers.requestHandler() );
      app.use( express.json() );
      app.use( express.urlencoded( { extended: false } ) );
      app.use( cors() );
      app.use( compression() );
      app.use( helmet() );
      app.use( fileUpload(
                           {
                             useTempFiles: true,
                             tempFileDir : SystemUtilities.baseRootPath + '/temp/',
                             limits: { fileSize: intBinaryDataMaximumSize },
                             createParentPath: true,
                           }
                         ) );
      //result.use( morgan( ':method :url :status :res[content-length] - :response-time[1] ms', { stream: loggerStream } as any ) );
      app.use( morgan( process.env.ENV !== 'prod' ? 'dev' : "combined", { stream: loggerStream } as any ) ); //MainLogger.stream

      let container = new Container();

      //Create the core api routes
      const coreRestAPIRoutes = await new RestAPIManager().getRoutes( { Container: container },
                                                                      logger );

      app.use( coreRestAPIRoutes );

      const schema = await new GraphQLAPIManager().getSchema( logger );

      // Configure apollo
      const apolloServer = new ApolloServer({

        schema,

        context: async ( { req, res } ) => {

          const strAuthorization = req.header( "authorization" );
          let strTimeZoneId = req.header( "timezoneid" );
          let strLanguage = req.header( "language" );
          let strFrontendId = req.header( "frontendid" );
          let strSourceIPAddress = req.header( "x-forwarded-for" ) || req.header( "X-Forwarded-For" ); //req.ip;

          if ( CommonUtilities.isNullOrEmpty( strTimeZoneId ) ) {

            strTimeZoneId = CommonUtilities.getCurrentTimeZoneId();

          }

          if ( CommonUtilities.isNullOrEmpty( strLanguage ) ) {

            strLanguage = CommonUtilities.getCurrentLanguage();

          }

          if ( CommonUtilities.isNullOrEmpty( strSourceIPAddress ) ) {

            strSourceIPAddress = req.ip;

          }

          let userSessionStatus = null;

          // ANCHOR authorization
          const context = {
                            Authorization: strAuthorization,
                            DBConnection: dbConnection,
                            Logger: logger,
                            TimeZoneId: strTimeZoneId,
                            Language: strLanguage,
                            SourceIPAddress:  strSourceIPAddress,
                            FrontendId: strFrontendId,
                            UserSessionStatus: userSessionStatus
                          };

          if ( CommonUtilities.isNotNullOrEmpty( strAuthorization ) ) {

            userSessionStatus = await SystemUtilities.getUserSessionStatus( strAuthorization,
                                                                            context,
                                                                            true,
                                                                            false,
                                                                            null,
                                                                            logger );

          }

          context.UserSessionStatus = userSessionStatus;

          // Verify jwt token
          //context.UserSessionStatus = {}; // verify( req, res );

          return context;

        },

        formatError: ( error ): any => {

          if ( CommonUtilities.isNotNullOrEmpty( error.originalError ) &&
               Object.keys( error.originalError ).length > 0 ) {

            let intStatusCode = 400; //Default bad request
            const errors = [];

            if ( ( error.originalError as any).extensions.StatusCode ) {

              intStatusCode = ( error.originalError as any).extensions.StatusCode;

            }

            if ( ( error.originalError as any).extensions.Errors ) {

              ( error.originalError as any).extensions.Errors.forEach( ( element: any ) => {

                errors.push( element );

              });

            }
            else {

              const filteredDetails = CommonUtilities.deleteObjectFields( ( error.originalError as any).extensions,
                                                                          [
                                                                            "code",
                                                                            "Code",
                                                                            "Message",
                                                                            "message",
                                                                            "LogId",
                                                                            "StatusCode"
                                                                          ],
                                                                          logger );

              errors.push(
                           {
                             Code: ( error.originalError as any).extensions.code,
                             Message: ( error.originalError as any).message,
                             Details: Object.keys( filteredDetails ).length > 0 ? filteredDetails : null
                           }
                         );

            }

            const result = {
                             StatusCode: intStatusCode, //Bad request
                             Code: ( error.originalError as any).extensions.code,
                             Message: ( error.originalError as any).message,
                             LogId: ( error.originalError as any).extensions.LogId,
                             Mark: "E7609E411489",
                             IsError: true,
                             Errors: errors,
                             Warnings: [],
                             Count: 0,
                             Data: []
                           };

            return result;

          }
          else {

            const strLogId = SystemUtilities.getUUIDv4();

            const result = {
                             StatusCode: 500, //Internal server error
                             Code: error.extensions.code,
                             Message: error.message,
                             LogId: strLogId,
                             Mark: "27A869435085",
                             IsError: true,
                             Errors: [
                                       {
                                         Code: error.extensions.code,
                                         Message: error.message,
                                         Details: await SystemUtilities.processErrorDetails( error ) //error.extensions.exception
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           };

            return result;

            /*

            const extensions = { "LogId": strLogId };

            const apolloError = new ApolloError( error.message,
                                                 error.extensions.code,
                                                 extensions );

            ( error as any ).LogId = strLogId;
            logger.error( error );

            return apolloError;
            */

          }

        },

        validationRules: [

          depthLimit( 5 )

        ],

        debug: true

      });

      let server = new InversifyExpressServer( container, app ); //Register controllers from container to main express app

      server.setConfig( ( app: any ) => {


      });

      let serverInstance = server.build();

      //The midddleware put here must be set in first order
      apolloServer.applyMiddleware(
                                    {
                                      app: serverInstance,
                                      path: process.env.SERVER_ROOT_PATH + "/graphql",
                                      bodyParserConfig: {
                                                          limit: '25mb'
                                                        }
                                    }
                                  );

      ( serverInstance as any ).apolloServer = apolloServer;

      serverInstance.use( ( request: Request, response: Response ) => {

        const result = {
                         StatusCode: 404,
                         Code: 'ERROR_PATH_NOT_FOUND',
                         Message: `Requested path ${request.path} not found. Please read the server log for more details.`,
                         LogId: null,
                         Mark: "3D6CC5FD0B5D",
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_PATH_NOT_FOUND',
                                     Message: `Requested path ${request.path} not found. Please read the server log for more details.`,
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       };

        response.status( result.StatusCode ).send( result );

      });

      app.use( async ( error: any, req: Request, res: Response, next: NextFunction ) {

        const strMark = "D3C34ED42BA1";

        const debugMark = debug.extend( strMark );

        debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
        debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );

        const result = {
                         StatusCode: 500,
                         Code: 'ERROR_SOMETHING_WENT_WRONG',
                         Message: 'Something went wrong!!',
                         LogId: SystemUtilities.getUUIDv4(),
                         Mark: "098675C7146B",
                         IsError: true,
                         Errors: [
                                   {
                                     Code: error.name,
                                     Message: error.message,
                                     Details: await SystemUtilities.processErrorDetailsStack( error ) //error.stack ? CommonUtilities.formatErrorStack( error.stack ) : error
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       };

        res.status( result.StatusCode ).send( result );

      });

      result = serverInstance;
      /*
      // Run server
      app.listen({ port }, () => {
          logger.info(`🚀Server ready at http://localhost:${ port }${ apolloServer.graphqlPath }`);
      });
      */

      /*
      //Test
      result.get( '/debug-sentry', function mainHandler( req, res ) {

        throw new Error( 'My first Sentry error!' );

      });
      */

      /*
      result.use( async ( request: Request, response: Response, next: NextFunction ) => {

        let debugMark = debug.extend( '24AD820F26C5' );
        debugMark( "Method => " + request.method );
        debugMark( "Url => " + request.url );

        debugMark( 'Time:', Date.now() );
        const roles = await RoleHasRouteDAO.getRolesWithRoutePath( DBConnectionManager.currentInstance,
                                                                   CommonUtilities.getHttpMethodCodeFromString( request.method ),
                                                                   request.url,
                                                                   logger );

        let debugMark = debug.extend( '5CF923A81A94' );
        debugMark( "%O", roles );
        response.status( 200 ).json( roles );

        next();

      });

      //let debugMark = debug.extend( '4826155137AA' );
      //debugMark( "Id => %O", SystemRoutes );

      for ( let systemRoute of SystemRoutes ) {

        await systemRoute.createRoutes( dbConnection, logger ); //fill routes variable

        if ( systemRoute.routes !== null ) {

          result.use( systemRoute.routes ); //Register the route

        }

      }
      */

      /*
      result.use( errorhandler( {

        debug: process.env.ENV !== 'prod',
        log: true,

      }));
      */

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.create.name;

      const strMark = "6F7BA4D6A31B";

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

    //Controllers here

    // The error handler must be before any other error middleware and after all controllers
    //app.use( sentry.Handlers.requestHandler() );

    return result;

  }

}


//export default app;