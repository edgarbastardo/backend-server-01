import cluster from 'cluster';

import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import CommonConstants from "../../../CommonConstants";
import SystemConstants from "../../../SystemContants";

import CommonUtilities from "../../../CommonUtilities";
import SystemUtilities from '../../../SystemUtilities';

import { SYSRoleHasRoute } from "../models/SYSRoleHasRoute";

import DBConnectionManager from "../../../managers/DBConnectionManager";

import BaseService from "./BaseService";
//import { SYSRole } from '../models/SYSRole';
//import { SYSRoute } from '../models/SYSRoute';
import SYSConfigValueDataService from "./SYSConfigValueDataService";
//import { config } from 'bluebird';

const debug = require( 'debug' )( 'SYSRoleHasRouteService' );

export default class SYSRoleHasRouteService extends BaseService {

  static readonly _ID = "sysRoleHasRouteService";

  static async create( strRoleId: string,
                       strRouteId: string,
                       transaction: any,
                       logger: any ): Promise<SYSRoleHasRoute | Error> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { "RoleId": strRoleId, "RouteId": strRouteId },
        transaction: currentTransaction,
        //context: { TimeZoneId: "America/Los_Angeles" }

      }

      let sysRoleHasRoute = await SYSRoleHasRoute.findOne( options );

      if ( !sysRoleHasRoute ) {

        sysRoleHasRoute = await SYSRoleHasRoute.create(
                                                        {
                                                          RoleId: strRoleId,
                                                          RouteId: strRouteId,
                                                          CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
                                                        },
                                                        { transaction: currentTransaction }
                                                      );

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = sysRoleHasRoute;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.create.name;

      const strMark = "DD097AC25659" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

      result = error;

    }

    return result;

  }

  static async getRoutesFromFrontendIdConfig( strFrontendId: string,
                                              transaction: any,
                                              logger: any ): Promise<any> {

    let result = null;

    try {

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_Frontend_Rules.Id,
                                                                             SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                                             transaction,
                                                                             logger );

      let jsonConfigValue = CommonUtilities.parseJSON( configData.Value,
                                                       logger );

      if ( jsonConfigValue[ "#" + strFrontendId + "#" ] ) {

        result = jsonConfigValue[ "#" + strFrontendId + "#" ].route;

      }
      else if ( jsonConfigValue[ "@__default__@" ] ) {

        result = jsonConfigValue[ "@__default__@" ].route;

      }
      else {

        jsonConfigValue = CommonUtilities.parseJSON( configData.Default,
                                                     logger );

        if ( jsonConfigValue[ "@__default__@" ] ) {

          result = jsonConfigValue[ "@__default__@" ].route;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getRoutesFromFrontendIdConfig.name;

      const strMark = "EEDD1D88CA85" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static checkIncluded( includes: string[], strToCheck: string ): boolean {

    let bResult = false;

    if ( !includes || includes.length === 0 || includes.includes( "*" ) ) {

      bResult = true;

    }
    else if ( includes[ strToCheck ] ) {

      bResult = true;

    }

    return bResult;

  }

  static checkExcluded( excludes: string[], strToCheck: string ): boolean {

    let bResult = false;

    if ( excludes && excludes.length > 0 && ( excludes.includes( "*" ) || excludes[ strToCheck ] ) ) {

      bResult = true;

    }

    return bResult;

  }

  static async listRoutesOfRoles( strRoles: string,
                                  strFrontendId: string,
                                  strFormat: string,
                                  transaction: any,
                                  logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let routes = [ {} ];

      /*
      if ( strFormat === "1" ) {

        routes = [];

      }
      else {

        routes = {};

      }
      */

      const configRoute = await this.getRoutesFromFrontendIdConfig( strFrontendId,
                                                                    transaction,
                                                                    logger );

      const roleList = strRoles.split( "," );

      for ( let intRoleIndex = 0; intRoleIndex < roleList.length; intRoleIndex++ ) {

        const strRole = roleList[ intRoleIndex ];

        let strSQL = DBConnectionManager.getStatement( "master",
                                                       "getRoutesOfRole",
                                                       {
                                                         Role: strRole.replace( "#", "" ).replace( "#", "" )
                                                       },
                                                       logger );

        let rows = await dbConnection.query( strSQL,
                                             {
                                               raw: true,
                                               type: QueryTypes.SELECT,
                                               transaction: currentTransaction
                                             } );

        for ( let intRouteIndex = 0; intRouteIndex < rows.length; intRouteIndex++ ) {

          const strRequestKind = CommonUtilities.getRequestKindFromNumber( rows[  intRouteIndex ].RequestKind ).toUpperCase();

          if ( SYSRoleHasRouteService.checkIncluded( configRoute.include, strRequestKind + ":" + rows[ intRouteIndex ].Path ) &&
               SYSRoleHasRouteService.checkExcluded( configRoute.exclude, strRequestKind + ":" + rows[ intRouteIndex ].Path ) === false ) {

            if ( !routes[ 0 ][ strRole ] ) {

              routes[ 0 ][ strRole ] = [];

            }

            if ( strFormat === "1" ) {

              const strAccessKind = CommonUtilities.getAccessKindFromNumber( rows[ intRouteIndex ].AccessKind ).toUpperCase();

              routes[ 0 ][ strRole ].push( {
                                        Kind: rows[ intRouteIndex ].Path.startsWith( "/"  )? "REST_API": "GRAPHQL_API",
                                        AccessKind: strAccessKind,
                                        RequestKind: strRequestKind,
                                        Path: rows[ intRouteIndex ].Path
                                      } );

            }
            else {

              routes[ 0 ][ strRole ].push( strRequestKind + ":" + rows[  intRouteIndex ].Path );

            }

          }

        }

        /*
        if ( strFormat && strFormat === "1" ) {

          routes[ strRole ].sort();

        }
        */

      }

      /*
      for ( let intIncludeIndex = 0; intIncludeIndex < configRoute.include.length; intIncludeIndex++ ) {

        const includeParts = configRoute.include[ intIncludeIndex ].split( ":" );

        if ( includeParts.length >= 4 ) {

          const strRole = "#" + includeParts[ 0 ] + "#";
          const strAccessKind = CommonUtilities.formatTitle( includeParts[ 1 ] );
          const strRequestKind = CommonUtilities.formatTitle( includeParts[ 2 ] );
          const strPath = includeParts[ 3 ];

          if ( configRoute.include.includes( "*" ) ||
              routes.includes( strRequestKind + ":" + strPath ) ) {

            if ( strFormat === "1" ) {

              routes.push( strRequestKind + ":" + strPath );

            }
            else {

              if ( !routes[ strRole ] ) {

                routes[ strRole ] = [];

              }

              routes[ strRole ].push( {
                                        Kind: strPath.startsWith( "/"  )? "REST_API": "GRAPHQL_API",
                                        AccessKind: strAccessKind,
                                        RequestKind: strRequestKind,
                                        Path: strPath
                                      } );

            }

          }

        }

      }
      */

      /*
      if ( !configRoute ||
           !configRoute.exclude ||
           configRoute.exclude.includes( "*" ) === false ) {

        for ( let intRoleIndex = 0; intRoleIndex < roleList.length; intRoleIndex++ ) {

          const strRole = roleList[ intRoleIndex ];

          let strSQL = DBConnectionManager.getStatement( "master",
                                                         "getRoutesOfRole",
                                                         {
                                                           //SelectFields: strSelectField,
                                                           Role: strRole.replace( "#", "" ).replace( "#", "" )
                                                         },
                                                         logger );

          let rows = await dbConnection.query( strSQL,
                                               {
                                                 raw: true,
                                                 type: QueryTypes.SELECT,
                                                 transaction: currentTransaction
                                               } );

          if ( strFormat === "1" ) {

            for ( let intRouteIndex = 0; intRouteIndex < rows.length; intRouteIndex++ ) {

              let route = rows[ intRouteIndex ];

              //const strRequestKind = CommonUtilities.getRequestKindFromNumber( route.RequestKind );
              route.AccessKind = CommonUtilities.getAccessKindFromNumber( route.AccessKind );
              route.RequestKind = CommonUtilities.getRequestKindFromNumber( route.RequestKind );

              if ( routes.includes( route.RequestKind + ":" + route.Path ) === false ) {

                if ( !configRoute ||
                     !configRoute.exclude ||
                     configRoute.exclude.includes( route.RequestKind.toUpperCase() + ":" + route.Path ) === false ) {

                  routes.push( route.RequestKind + ":" + route.Path );

                }

              }

            }

          }
          else {

            routes[ strRole ] = [];
            cacheIndex[ strRole ] = [];

            for ( let intRouteIndex = 0; intRouteIndex < rows.length; intRouteIndex++ ) {

              let route = rows[ intRouteIndex ];

              delete route.Name;

              route.Kind = route.Path.startsWith( "/"  ) ? "REST_API": "GRAPHQL_API";

              route.AccessKind = CommonUtilities.getAccessKindFromNumber( route.AccessKind );
              route.RequestKind = CommonUtilities.getRequestKindFromNumber( route.RequestKind );
              //const strRequestKind = CommonUtilities.getRequestKindFromNumber( route.RequestKind );

              if ( cacheIndex[ strRole ].includes( route.RequestKind + ":" + route.Path ) === false ) {

                if ( !configRoute ||
                     !configRoute.exclude ||
                     configRoute.exclude.includes( route.RequestKind.toUpperCase() + ":" + route.Path ) === false ) {

                  routes[ strRole ].push( route );
                  cacheIndex[ strRole ].push( route.RequestKind + ":" + route.Path );

                }

              }

            }

          }

        }

      }
      */

      result = routes;

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.listRoutesOfRoles.name;

      const strMark = "157882FC3F95" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return result;

  }

  static async listActionsOfRoles( strRoles: string,
                                   strFrontendId: string,
                                   strFormat: string,
                                   transaction: any,
                                   logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let routes = {};

      const configRoute = await this.getRoutesFromFrontendIdConfig( strFrontendId,
                                                                    transaction,
                                                                    logger );

      const roleList = strRoles.split( "," );

      for ( let intRoleIndex = 0; intRoleIndex < roleList.length; intRoleIndex++ ) {

        const strRole = roleList[ intRoleIndex ];

        let strSQL = DBConnectionManager.getStatement( "master",
                                                       "getRoutesOfRole",
                                                       {
                                                         Role: strRole.replace( "#", "" ).replace( "#", "" )
                                                       },
                                                       logger );

        let rows = await dbConnection.query( strSQL,
                                             {
                                               raw: true,
                                               type: QueryTypes.SELECT,
                                               transaction: currentTransaction
                                             } );

        for ( let intRouteIndex = 0; intRouteIndex < rows.length; intRouteIndex++ ) {

          const strRequestKind = CommonUtilities.getRequestKindFromNumber( rows[  intRouteIndex ].RequestKind ).toUpperCase();

          if ( SYSRoleHasRouteService.checkIncluded( configRoute.include, strRequestKind + ":" + rows[ intRouteIndex ].Path ) &&
               SYSRoleHasRouteService.checkExcluded( configRoute.exclude, strRequestKind + ":" + rows[ intRouteIndex ].Path ) === false ) {

            if ( strFormat === "1" ) {

              const strAccessKind = CommonUtilities.getAccessKindFromNumber( rows[ intRouteIndex ].AccessKind ).toUpperCase();

              routes[ rows[ intRouteIndex ].Action ] = {
                                                         Kind: rows[  intRouteIndex ].Path.startsWith( "/"  )? "REST_API": "GRAPHQL_API",
                                                         AccessKind: strAccessKind,
                                                         RequestKind: strRequestKind,
                                                         Path: rows[  intRouteIndex ].Path
                                                       };

            }
            else {

              routes[ rows[ intRouteIndex ].Action ] = rows[ intRouteIndex ].Path;

            }

          }

        }

        result = routes;

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.listActionsOfRoles.name;

      const strMark = "157882FC3F95" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return result;

  }

}
