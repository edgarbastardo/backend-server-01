import fs from 'fs';
import path from 'path';
import cluster from 'cluster';

import { ForbiddenError } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { applyMiddleware } from 'graphql-middleware';
import { shield } from 'graphql-shield';

import CommonConstants from '../CommonConstants';

import CommonUtilities from '../CommonUtilities';
import SystemUtilities from "../SystemUtilities";

import SYSRouteService from '../database/services/SYSRouteService';

const debug = require( 'debug' )( 'GraphQLAPIManager' );

export default class GraphQLAPIManager {

  /*
  static readonly _PATH_TO_SCAN = [
                                    "/02_system/core/api/graphql",
                                    "/03_business/dev000/api/graphql",
                                    "/03_business/dev007/api/graphql",
                                  ]
                                  */

  _read: boolean;
  _typeDefs: any[];
  _resolvers: any[];
  _permissions: {};
  _validators: {};

  constructor() {

    this._read = true;
    this._typeDefs = [];
    this._resolvers = [];
    this._permissions = {};
    this._validators = {};

  }

  _merge( target: any, source: any ) {

    target.Query = target.Query ? target.Query : {};
    source.Query = source.Query ? source.Query : {};
    target.Mutation = target.Mutation ? target.Mutation : {};
    source.Mutation = source.Mutation ? source.Mutation : {};

    const preQuery = target.Query;
    const preMutation = target.Mutation;

    Object.assign( target, source );
    Object.assign( target.Query, preQuery );
    Object.assign( target.Mutation, preMutation );

  }

  async _scan( directory: any, logger: any ) {

    try {

      const files = fs.readdirSync( directory )
                      .filter( file => fs.lstatSync( path.join( directory, file ) ).isFile() )
                      .filter( file => file.indexOf( '.' ) !== 0 && ( file.slice( -3 ) === '.js' || file.slice( -3 ) === '.ts' ) );

      const dirs = fs.readdirSync( directory )
                     .filter( file => fs.lstatSync( path.join( directory, file ) ).isDirectory() );

      for ( const file of files ) {

        const obj = await import( path.join( directory, file ) );

        if ( obj.typeDefs ) {

          this._typeDefs.push( obj.typeDefs );

        }

        if ( obj.resolvers ) {

          this._resolvers.push( obj.resolvers );

        }

        if ( obj.permissions ) {

          this._merge( this._permissions, obj.permissions );

        }

        //Here insert data in the table tblRoute
        if ( obj.roles ) {

          //this._resolvers.push( obj.resolvers );
          /*
          let debugMark = debug.extend( "983A73D8C9C7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

          debugMark( obj.roles );
          Object.keys( obj.roles ).forEach( ( strResolverName: string, intIndex: number ) => {

            //debugMark( "Name => ", strResolverName );
            //debugMark( "AccessKind => ", obj.roles[ strResolverName ].AccessKind );
            //debugMark( "Default => ", obj.roles[ strResolverName ].Default );
            RouteService.createOrUpdate( obj.roles[ strResolverName ].AccessKind,
                                        2, //Post
                                        strResolverName,
                                        obj.roles[ strResolverName ].Default,
                                        null,
                                        logger );

          });
          */

          if ( process.env.IS_NETWORK_LEADER === "1" ) {

            const loopAsync = async () => {

              await CommonUtilities.asyncForEach( Object.keys( obj.roles ) as any, async ( strResolverName: string, intIndex: number ) => {

                await SYSRouteService.createOrUpdateRouteAndRoles( obj.roles[ strResolverName ].AccessKind,
                                                                2, //Post
                                                                strResolverName, //Path
                                                                obj.roles[ strResolverName ].AllowTagAccess,
                                                                obj.roles[ strResolverName ].Roles,
                                                                obj.roles[ strResolverName ].Description,
                                                                null,
                                                                logger );

              });

            }

            await loopAsync();

          }

        }

        if ( obj.validators ) {

          this._merge( this._validators, obj.validators );

        }

        if ( obj.init &&
             typeof obj.init === "function" ) {

          obj.init( logger );

        }

      }

      for ( const dir of dirs ) {

        if ( dir !== "template" &&
             dir !== "disabled" &&
             dir.startsWith( "disabled_" ) === false ) {

          await this._scan( path.join( directory, dir ), logger );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = GraphQLAPIManager.name + "." + this._scan.name;

      const strMark = "ACADE67D8340" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  async getSchema( logger: any ) {

    let result = null;

    try {

      if ( this._read ) {

        const pathToScan : any[] = JSON.parse( process.env.GRAPHQL_API_PATH_TO_SCAN );

        for ( let intIndex = 0; intIndex < pathToScan.length; intIndex++ ) {

          let strPath = SystemUtilities.strBaseRunPath + pathToScan[ intIndex ];

          try {

            await this._scan( strPath, logger );

          }
          catch ( error ) {

            const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

            sourcePosition.method = GraphQLAPIManager.name + "." + this.getSchema.name;

            const strMark = "C7B8B342E1E6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

        this._read = false;

      }

      // Create graphql schema with middleware
      const schema = makeExecutableSchema(
                                          {
                                            typeDefs: this._typeDefs,
                                            resolvers: this._resolvers
                                          }
                                        );

      result = applyMiddleware(
                                schema,
                                this._validators,
                                shield(
                                  this._permissions,
                                  {
                                    allowExternalErrors: true,
                                    fallbackError: new ForbiddenError( 'Not authorised!' )
                                  }
                                )
                              );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = GraphQLAPIManager.name + "." + this.getSchema.name;

      const strMark = "14CB3EAD860F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

//export CoreApiManager();