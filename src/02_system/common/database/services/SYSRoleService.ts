import cluster from 'cluster';

//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import CommonConstants from "../../CommonConstants";
import SystemConstants from "../../SystemContants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

import { SYSRole } from "../models/SYSRole";

import DBConnectionManager from '../../managers/DBConnectionManager';

import BaseService from "./BaseService";

const debug = require( 'debug' )( 'SYSRoleService' );

export default class SYSRoleService extends BaseService {

  static readonly _ID = "sysRoleService";

  static async createOrUpdate( strName: string,
                               strComment: string,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<SYSRole> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.dbConnection;

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //const strId = SystemUtilities.hashString( intRequestKind + ":" + strPath, 1, null );

      //let debugMark = debug.extend( 'B5F561459005' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
      //debugMark( "%s", strId );

      const options = {

        where: { "Name": strName },
        transaction: currentTransaction,
        //context: { TimeZoneId: "America/Los_Angeles" }

      }

      let roleInDB = await SYSRole.findOne( options );

      //debugMark( "1 => %O", role );

      if ( CommonUtilities.isNullOrEmpty( roleInDB ) ) {

        result = await SYSRole.create(
                                       {
                                         Name: strName,
                                         Comment: strComment,
                                         CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
                                       },
                                       { transaction: currentTransaction }
                                     );

      }
      else if ( bUpdate &&
              ( !roleInDB.Tag ||
                roleInDB.Tag.indexOf( "#NotUpdateOnStartup#" ) === -1 ) ) {

        const currentValues = ( roleInDB as any ).dataValues;
        currentValues.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        //debugMark( "2 => %O", role );

        const updateResult = await SYSRole.update( currentValues,
                                                   options );

        if ( updateResult.length > 0 &&
             updateResult[ 0 ] >= 1 ) {

          result = await SYSRole.findOne( options );

        }

      }
      else {

        result = roleInDB;

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "7F5EAEA4FFEA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getRolesFromRouteId( strId: string,
                                    transaction: any,
                                    logger: any ): Promise<any> {

    let result = [];

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.dbConnection;

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let strSQL = DBConnectionManager.getStatement( "getRolesFromRouteId",
                                                     {
                                                       Id: strId
                                                     },
                                                     logger );

      let rows = await dbConnection.query( strSQL, {
                                                     raw: true,
                                                     type: QueryTypes.SELECT,
                                                     transaction: currentTransaction
                                                   } );
      /*
      let rows = await dbConnection.query( `Select Distinct C.Name As Role From Route As A Inner Join RoleHasRoute As B On B.RouteId = A.Id Inner Join Role As C On C.Id = B.RoleId Where ( A.Id = '${strId}' )`, {
        raw: true,
        type: QueryTypes.SELECT,
        transaction: currentTransaction
      } );
      */

      for ( let row of rows ) {

        result.push( "#" + row[ "Role" ] + "#" );

      }

      strSQL = DBConnectionManager.getStatement( "getAllowTagAccessFromRouteId",
                                                 {
                                                   Id: strId
                                                 },
                                                 logger );

      rows = await dbConnection.query( strSQL, {
                                                 raw: true,
                                                 type: QueryTypes.SELECT,
                                                 transaction: currentTransaction
                                               } );

      /*
      rows = await dbConnection.query( `Select A.AllowTagAccess As AllowTagAccess From Route As A Where ( A.Id = '${strId}' )`, {
        raw: true,
        type: QueryTypes.SELECT,
        transaction: currentTransaction
      } );
      */

      for ( let row of rows ) {

        const allowTagAccessList = row[ "AllowTagAccess" ].split( "," );

        for ( let strAllowTagAccess of allowTagAccessList ) {

          if ( result.includes( strAllowTagAccess ) === false ) {

            result.push( strAllowTagAccess );

          }

        }

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

         await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getRolesFromRouteId.name;

      const strMark = "C173DD10EDE3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async getRolesFromRoutePath( intRequestKind: number,
                                      strPath: String,
                                      transaction: any,
                                      logger: any ): Promise<any> {

    const strId = SystemUtilities.hashString( intRequestKind + ":" + strPath,
                                              1,
                                              logger );

    return this.getRolesFromRouteId( strId,
                                     transaction,
                                     logger );

  }

}