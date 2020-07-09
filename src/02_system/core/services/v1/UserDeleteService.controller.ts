import cluster from "cluster";

import {
  Request,
  //json,
} from "express";

import CommonConstants from "../../../common/CommonConstants";

import CommonUtilities from "../../../common/CommonUtilities";
import SystemUtilities from "../../../common/SystemUtilities";

import I18NManager from "../../../common/managers/I18Manager";
import DBConnectionManager from "../../../common/managers/DBConnectionManager";

import UserOthersServiceController from "./UserOthersService.controller";

import SYSUserService from "../../../common/database/master/services/SYSUserService";
import SYSPersonService from "../../../common/database/master/services/SYSPersonService";

const debug = require( "debug" )( "UserDeleteServiceController" );

export default class UserDeleteServiceController {

  static readonly _ID = "UserDeleteServiceController";

  //ANCHOR deleteUser
  static async deleteUser( request: Request,
                           transaction: any,
                           logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const userSessionStatus = context.UserSessionStatus;

      //let strUserName = context.UserSessionStatus.UserName;

      let sysUserInDB = await SYSUserService.getBy( {
                                                      Id: request.query.id as string,
                                                      ShortId: request.query.shortId as string,
                                                      Name: request.query.name as string
                                                    },
                                                    null,
                                                    currentTransaction,
                                                    logger );

      const resultCheckUserRoles = UserOthersServiceController.checkUserRoleLevel( userSessionStatus,
                                                                                   sysUserInDB,
                                                                                   "DeleteUser",
                                                                                   logger );

      if ( !resultCheckUserRoles.isAuthorizedAdmin &&
           !resultCheckUserRoles.isAuthorizedL03 &&
           !resultCheckUserRoles.isAuthorizedL02 &&
           !resultCheckUserRoles.isAuthorizedL01 ) {

        resultCheckUserRoles.isNotAuthorized = true;

      }

      if ( resultCheckUserRoles.isNotAuthorized ) {

        result = {
                   StatusCode: 403, //Forbidden
                   Code: "ERROR_CANNOT_DELETE_USER",
                   Message: await I18NManager.translate( strLanguage, "Not allowed to delete the user" ),
                   Mark: "BA7F0A12AD3C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_CANNOT_DELETE_USER",
                               Message: await I18NManager.translate( strLanguage, "Not allowed to delete the user" ),
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( !sysUserInDB ) {

        const strMessage = await UserOthersServiceController.getMessageUser(
                                                                             strLanguage,
                                                                             {
                                                                               Id: request.body.Id,
                                                                               ShortId: request.body.ShortId,
                                                                               Name: request.body.Name
                                                                             }
                                                                           );

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_USER_NOT_FOUND",
                   Message: strMessage,
                   Mark: "58A44EA21984" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_USER_NOT_FOUND",
                               Message: strMessage,
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( sysUserInDB instanceof Error ) {

        const error = sysUserInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "D8666345BB41" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
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

      }
      else if ( sysUserInDB.Id === userSessionStatus.UserId ) {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_USER_NOT_VALID",
                   Message: await I18NManager.translate( strLanguage, "The user to delete cannot be yourself." ),
                   Mark: "3576DA16A5CA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_USER_NOT_VALID",
                               Message: await I18NManager.translate( strLanguage, "The user to delete cannot be yourself." ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( UserOthersServiceController.checkUsersEqualsRoleLevel( sysUserInDB,
                                                                       userSessionStatus, //Current user
                                                                       logger ) === false ) {

        result = {
                   StatusCode: 403, //Forbidden
                   Code: "ERROR_CANNOT_DELETE_USER",
                   Message: await I18NManager.translate( strLanguage, "Not allowed to delete the user. The user has #Administrator# role, but you not had." ),
                   Mark: "883398A57F61" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_CANNOT_DELETE_USER",
                               Message: await I18NManager.translate( strLanguage, "Not allowed to delete the user. The user has #Administrator# role, but you not had." ),
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else {

        const strPersonId = sysUserInDB.sysPerson ? sysUserInDB.sysPerson.Id: null;

        if ( strPersonId &&
             await SYSUserService.countUsersWithPerson( strPersonId,
                                                        currentTransaction,
                                                        logger ) === 1 ) {

          await SYSPersonService.deleteByModel( sysUserInDB.sysPerson,
                                                currentTransaction,
                                                logger );

        }

        const deleteResult = await SYSUserService.deleteByModel( sysUserInDB,
                                                                 currentTransaction,
                                                                 logger );

        if ( deleteResult instanceof Error ) {

          const error = deleteResult as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "CC964294E67E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
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

        }
        else if ( deleteResult === true ) {

          result = {
                     StatusCode: 200, //Ok
                     Code: "SUCCESS_USER_DELETE",
                     Message: await I18NManager.translate( strLanguage, "Success user %s deleted.", sysUserInDB.Name ),
                     Mark: "BEF1D6D336E2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

          bApplyTransaction = true;

        }
        else {

          result = {
                     StatusCode: 500, //Ok
                     Code: "ERROR_USER_DELETE",
                     Message: await I18NManager.translate( strLanguage, "Error in user delete." ),
                     Mark: "34335D14522F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [
                               {
                                 Code: "ERROR_METHOD_DELETE_RETURN_FALSE",
                                 Message: "Method deleteByModel return false",
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.deleteUser.name;

      const strMark = "A68F177F4DBF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = {
                 StatusCode: 500, //Internal server error
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
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
