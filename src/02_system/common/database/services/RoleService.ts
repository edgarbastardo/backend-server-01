import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import DBConnectionManager from './../../managers/DBConnectionManager';
import { Role } from "../models/Role";
import SystemConstants from "../../SystemContants";
import BaseService from "./BaseService";
import CommonConstants from "../../CommonConstants";

const debug = require( 'debug' )( 'RoleService' );

export default class RoleService extends BaseService {

  static readonly _ID = "RoleService";

  static async createOrUpdate( strName: string,
                               strComment: string,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<Role> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      //const strId = SystemUtilities.hashString( intRequestKind + ":" + strPath, 1, null );

      //let debugMark = debug.extend( 'B5F561459005' );
      //debugMark( "%s", strId );

      const options = {

        where: { "Name": strName },
        transaction: currentTransaction,
        //context: { TimeZoneId: "America/Los_Angeles" }

      }

      let roleInDB = await Role.findOne( options );

      //debugMark( "1 => %O", role );

      if ( CommonUtilities.isNullOrEmpty( roleInDB ) ) {

        roleInDB = await Role.create(
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

        await Role.update( currentValues,
                           options );

      }

      if ( currentTransaction != null &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

      result = roleInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "7F5EAEA4FFEA";

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

  static async getRolesFromRouteId( strId: string,
                                    transaction: any,
                                    logger: any ): Promise<any> {

    let result = [];

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      let rows = await dbConnection.query( `Select Distinct C.Name As Role From Route As A Inner Join RoleHasRoute As B On B.RouteId = A.Id Inner Join Role As C On C.Id = B.RoleId Where ( A.Id = '${strId}' )`, {
        raw: true,
        type: QueryTypes.SELECT,
        transaction: currentTransaction
      } );

      for ( let row of rows ) {

        result.push( "#" + row[ "Role" ] + "#" );

      }

      rows = await dbConnection.query( `Select A.AllowTagAccess As AllowTagAccess From Route As A Where ( A.Id = '${strId}' )`, {
        raw: true,
        type: QueryTypes.SELECT,
        transaction: currentTransaction
      } );

      for ( let row of rows ) {

        const allowTagAccessList = row[ "AllowTagAccess" ].split( "," );

        for ( let strAllowTagAccess of allowTagAccessList ) {

          if ( result.includes( strAllowTagAccess ) === false ) {

            result.push( strAllowTagAccess );

          }

        }

      }

      if ( currentTransaction != null &&
           bApplyTansaction ) {

         await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getRolesFromRouteId.name;

      const strMark = "C173DD10EDE3";

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

    /*
    let result = [];

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const strId = SystemUtilities.hashString( intRequestKind + ":" + strPath, 1, logger );

      //let debugMark = debug.extend( 'AC872B84A6DA' );
      debugMark( "Id => %s", strId );

      const rows = await dbConnection.query( `Select C.Name As Role From Route As A Inner Join RoleHasRoute As B On B.RouteId = A.Id Inner Join Role As C On C.Id = B.RoleId Where ( A.Id = '${strId}' )`, {
        raw: true,
        type: QueryTypes.SELECT,
        transaction: currentTransaction
      } );

      for ( let row of rows ) {

        result.push( row[ "Role" ] );

      }

      if ( currentTransaction != null &&
           bApplyTansaction ) {

         await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getRolesFromRoutePath.name;

      const strMark = "0D20B0B1769D";

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
    */

  }

}