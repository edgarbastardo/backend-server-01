import cluster from 'cluster';

//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';

import CommonConstants from "../../../CommonConstants";
import SystemConstants from "../../../SystemContants";

import CommonUtilities from "../../../CommonUtilities";
import SystemUtilities from "../../../SystemUtilities";

import { SYSRoute } from "../models/SYSRoute";

import DBConnectionManager from '../../../managers/DBConnectionManager';

import BaseService from "./BaseService";
import SYSRoleService from "./SYSRoleService";
import SYSRoleHasRouteService from "./SYSRoleHasRouteService";

const debug = require( 'debug' )( 'SYSRouteService' );

export default class SYSRouteService extends BaseService {

  static readonly _ID = "sysRouteService";

  static async createOrUpdate( intAccessKind: number,
                               intRequestKind: number,
                               strPath: string,
                               strAction: string,
                               strAllowTagAccess: string,
                               strDescription: string,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<SYSRoute> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      if ( currentTransaction === null ) {

        const dbConnection = DBConnectionManager.getDBConnection( "master" );

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const strId = SystemUtilities.hashString( intRequestKind + ":" + strPath, 1, null );

      const options = {

        where: { "Id": strId },
        transaction: currentTransaction,

      }

      let sysRouteInDB = await SYSRoute.findOne( options );

      if ( CommonUtilities.isNullOrEmpty( sysRouteInDB ) ) {

        sysRouteInDB = await SYSRoute.create(
                                              {
                                                AccessKind: intAccessKind,
                                                RequestKind: intRequestKind,
                                                Path: strPath,
                                                Action: strAction,
                                                AllowTagAccess: strAllowTagAccess,
                                                Description: strDescription,
                                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
                                              },
                                              { transaction: currentTransaction }
                                            );

      }
      else if ( bUpdate ) {

        sysRouteInDB.AccessKind = intAccessKind;
        sysRouteInDB.RequestKind = intRequestKind;
        sysRouteInDB.Path = strPath;
        sysRouteInDB.Action = strAction;
        sysRouteInDB.AllowTagAccess = SystemUtilities.mergeTokens( sysRouteInDB.AllowTagAccess,
                                                                   strAllowTagAccess,
                                                                   true,
                                                                   logger );
        sysRouteInDB.Description = strDescription;
        sysRouteInDB.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        await sysRouteInDB.update( ( sysRouteInDB as any ).dataValues,
                                   options );

        sysRouteInDB = await SYSRoute.findOne( options );

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = sysRouteInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "1C741F130111" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async createOrUpdateRouteAndRoles( intAccessKind: number,
                                            intRequestKind: number,
                                            strPath: string,
                                            strAction: string,
                                            strAllowTagAccess: string,
                                            roles: [],
                                            strDescription: string,
                                            transaction: any,
                                            logger: any ): Promise<SYSRoute> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      if ( currentTransaction === null ) {

        const dbConnection = DBConnectionManager.getDBConnection( "master" );

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const sysRoute = await this.createOrUpdate( intAccessKind,
                                                  intRequestKind,
                                                  strPath,
                                                  strAction,
                                                  strAllowTagAccess,
                                                  strDescription,
                                                  true,
                                                  currentTransaction,
                                                  logger );

      const loopAsync = async () => {

        await CommonUtilities.asyncForEach( roles, async ( strRoleName: string, intIndex: number ) => {

          const sysRole = await SYSRoleService.createOrUpdate( strRoleName,
                                                               "Auto created by backend at startup",
                                                               false,
                                                               currentTransaction,
                                                               logger );

          if ( sysRole &&
               ( sysRole as any ).dataValues &&
               sysRoute &&
               ( sysRoute as any ).dataValues ) {

            await SYSRoleHasRouteService.create( ( sysRole as any ).dataValues.Id,
                                                 ( sysRoute as any ).dataValues.Id,
                                                 currentTransaction,
                                                 logger );

          }

        });

        result = sysRoute;

      }

      await loopAsync();

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdateRouteAndRoles.name;

      const strMark = "B8567B7FDE27" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
