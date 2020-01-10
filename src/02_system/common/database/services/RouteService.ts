import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

//import { OriginalSequelize } from "sequelize"; //Original sequelize

//import uuidv4 from 'uuid/v4';

import DBConnectionManager from './../../managers/DBConnectionManager';
import { Route } from "../models/Route";
import RoleService from "./RoleService";
import RoleHasRouteService from "./RoleHasRouteService";
import SystemConstants from "../../SystemContants";
import BaseService from "./BaseService";
import CommonConstants from "../../CommonConstants";

const debug = require( 'debug' )( 'RouteService' );

export default class RouteService extends BaseService {

  static readonly _ID = "RouteService";

  static async createOrUpdate( intAccessKind: number,
                               intRequestKind: number,
                               strPath: string,
                               strAllowTagAccess: string,
                               strDescription: string,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<Route> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      if ( currentTransaction == null ) {

        const dbConnection = DBConnectionManager.currentInstance;

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const strId = SystemUtilities.hashString( intRequestKind + ":" + strPath, 1, null );

      //let debugMark = debug.extend( '7287EB53C0BF' );
      //debugMark( strId );

      const options = {

        where: { "Id": strId },
        transaction: currentTransaction,
        //context: { TimeZoneId: "America/Los_Angeles" }

      }

      let route = await Route.findOne( options );

      //debugMark( "1 =>", route );

      if ( CommonUtilities.isNullOrEmpty( route ) ) {

        route = await Route.create(
                                    {
                                      AccessKind: intAccessKind,
                                      RequestKind: intRequestKind,
                                      Path: strPath,
                                      AllowTagAccess: strAllowTagAccess,
                                      Description: strDescription,
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
                                    },
                                    { transaction: currentTransaction }
                                  );

      }
      else if ( bUpdate ) {

        const currentValues = ( route as any ).dataValues;
        currentValues.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        currentValues.AllowTagAccess = SystemUtilities.mergeTokens( currentValues.AllowTagAccess,
                                                                    strAllowTagAccess,
                                                                    false,
                                                                    logger );

        await Route.update( currentValues,
                            options );

      }

      if ( currentTransaction != null &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

      result = route;

      /*
      const loopAsync = async () => {

        await CommonUtilities.asyncForEach( roles, async ( strRoleName: string, intIndex: number ) => {

          const role = await RoleService.createOrUpdate( strRoleName,
                                                         "Auto created by backend at startup",
                                                         currentTransaction,
                                                         logger );

          await RoleHasRouteService.createOrUpdate( ( role as any ).dataValues.Id,
                                                    ( route as any ).dataValues.Id,
                                                    currentTransaction,
                                                    logger );

        });

        if ( currentTransaction != null &&
            bApplyTansaction ) {

          await currentTransaction.commit();

        }

        result = route;

      }

      await loopAsync();
      */

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "1C741F130111";

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

      if ( currentTransaction != null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( ex ) {


        }

      }

    }

    return result;

  }

  static async createOrUpdateRouteAndRoles( intAccessKind: number,
                                            intRequestKind: number,
                                            strPath: string,
                                            strAllowTagAccess: string,
                                            roles: [],
                                            strDescription: string,
                                            transaction: any,
                                            logger: any ): Promise<Route> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      if ( currentTransaction == null ) {

        const dbConnection = DBConnectionManager.currentInstance;

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const route = await this.createOrUpdate( intAccessKind,
                                               intRequestKind,
                                               strPath,
                                               strAllowTagAccess,
                                               strDescription,
                                               true,
                                               currentTransaction,
                                               logger );

      const loopAsync = async () => {

        await CommonUtilities.asyncForEach( roles, async ( strRoleName: string, intIndex: number ) => {

          const role = await RoleService.createOrUpdate( strRoleName,
                                                         "Auto created by backend at startup",
                                                         false,
                                                         currentTransaction,
                                                         logger );

          if ( role &&
               ( role as any ).dataValues &&
               route &&
               ( route as any ).dataValues ) {

            await RoleHasRouteService.create( ( role as any ).dataValues.Id,
                                              ( route as any ).dataValues.Id,
                                              currentTransaction,
                                              logger );

          }

        });

        result = route;

      }

      await loopAsync();

      if ( currentTransaction != null &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdateRouteAndRoles.name;

      const strMark = "B8567B7FDE27";

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

      if ( currentTransaction != null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( ex ) {


        }

      }

    }

    return result;

  }

}