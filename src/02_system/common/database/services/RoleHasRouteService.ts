import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from '../../SystemUtilities';

import DBConnectionManager from "../../managers/DBConnectionManager";

//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,
//import uuidv4 from 'uuid/v4';

import { RoleHasRoute } from "../models/RoleHasRoute";
import SystemConstants from "../../SystemContants";
import BaseService from "./BaseService";
import CommonConstants from "../../CommonConstants";

const debug = require( 'debug' )( 'RoleHasRouteService' );

export default class RoleHasRouteService extends BaseService {

  static readonly _ID = "RoleHasRouteService";

  static async create( strRoleId: string,
                       strRouteId: string,
                       transaction: any,
                       logger: any ): Promise<RoleHasRoute> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const options = {

        where: { "RoleId": strRoleId, "RouteId": strRouteId },
        transaction: currentTransaction,
        //context: { TimeZoneId: "America/Los_Angeles" }

      }

      let roleHasRoute = await RoleHasRoute.findOne( options );

      if ( CommonUtilities.isNullOrEmpty( roleHasRoute ) ) {

        roleHasRoute = await RoleHasRoute.create(
                                                  { RoleId: strRoleId,
                                                    RouteId: strRouteId,
                                                    CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
                                                  },
                                                  { transaction: currentTransaction }
                                                );

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

      result = roleHasRoute;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.create.name;

      const strMark = "DD097AC25659";

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

      if ( currentTransaction != null &&
           bApplyTansaction ) {

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