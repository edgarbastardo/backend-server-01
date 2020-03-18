import cluster from 'cluster';

import {
  Request,
  //json,
} from 'express';

import CommonConstants from '../../../common/CommonConstants';

import CommonUtilities from "../../../common/CommonUtilities";
import SystemUtilities from "../../../common/SystemUtilities";

import I18NManager from "../../../common/managers/I18Manager";
import DBConnectionManager from "../../../common/managers/DBConnectionManager";

import SYSUserService from "../../../common/database/services/SYSUserService";
import SYSUserGroupService from "../../../common/database/services/SYSUserGroupService";
import SYSPersonService from '../../../common/database/services/SYSPersonService';
import UserOthersServiceController from './UserOthersService.controller';

const debug = require( 'debug' )( 'UserBulkServiceController' );

export default class UserBulkServiceController {

  static readonly _ID = "UserBulkServiceController";

  static async bulkUserOperation( strBulkOperation: string,
                                  request: Request,
                                  transaction: any,
                                  logger: any ): Promise<any> {

    let result: any = {
                        data:[],
                        errors:[],
                        warnings: []
                      };

    let strLanguage = null;

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const bulkData = request.body.bulk;

      const userSessionStatus = context.UserSessionStatus;

      for ( let intIndex= 0; intIndex < bulkData.length; intIndex++ ) {

        const bulkUserData = bulkData[ intIndex ];

        try {

          let sysUserInDB = await SYSUserService.getBy(
                                                        {
                                                          Id: bulkUserData.Id,
                                                          ShortId: bulkUserData.ShortId,
                                                          Name: bulkUserData.Name
                                                        },
                                                        null,
                                                        transaction,
                                                        logger
                                                      );

          if ( !sysUserInDB ) {

            const strMessage = await UserOthersServiceController.getMessageUser(
                                                                                 strLanguage,
                                                                                 {
                                                                                   Id: bulkUserData.Id,
                                                                                   ShortId: bulkUserData.ShortId,
                                                                                   Name: bulkUserData.Name
                                                                                 }
                                                                               );

            result.errors.push (
                                 {
                                   Id: bulkUserData.Id,
                                   ShortId: bulkUserData.ShortId,
                                   Name: bulkUserData.Name,
                                   Code: 'ERROR_USER_NOT_FOUND',
                                   Mark: 'AF5B2A2B856B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   Message: strMessage,
                                   Details: null,
                                 }
                               );

          }
          else if ( sysUserInDB instanceof Error ) {

            const error = sysUserInDB as any;

            result.errors.push (
                                 {
                                   Id: bulkUserData.Id,
                                   ShortId: bulkUserData.ShortId,
                                   Name: bulkUserData.Name,
                                   Code: error.name,
                                   Mark: '4D8DB096189E' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   Message: error.message,
                                   Details: await SystemUtilities.processErrorDetails( error ) //error
                                 }
                               );

          }
          else if ( sysUserInDB.Id === userSessionStatus.UserId ) {

            let strMessage = "";

            if ( strBulkOperation === "deleteUser" ) {

              strMessage = await I18NManager.translate( strLanguage, 'The user to delete cannot be yourself.' );

            }
            else {

              strMessage = await I18NManager.translate( strLanguage, 'The user to update cannot be yourself.' );

            }

            result.errors.push(
                                {
                                  Id: sysUserInDB.Id,
                                  ShortId: sysUserInDB.ShortId,
                                  Name: sysUserInDB.Name,
                                  Code: 'ERROR_USER_NOT_VALID',
                                  Mark: 'DB0BF01CAA7A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                  Message: strMessage,
                                  Details: null
                                }
                              );

          }
          else if ( UserOthersServiceController.checkUsersEqualsRoleLevel( sysUserInDB,
                                                                           userSessionStatus, //Current user
                                                                           logger ) === false ) {

            let strCode = "";
            let strMessage = "";

            if ( strBulkOperation === "deleteUser" ) {

              strCode = 'ERROR_CANNOT_DELETE_USER';
              strMessage = await I18NManager.translate( strLanguage, 'Not allowed to delete the user. The user has #Administrator# role, but you NOT has.' );

            }
            else {

              strCode = 'ERROR_CANNOT_UPDATE_USER';
              strMessage = await I18NManager.translate( strLanguage, 'Not allowed to update the user. The user has #Administrator# role, but you NOT has.' );

            }

            result.errors.push(
                                {
                                  Id: sysUserInDB.Id,
                                  ShortId: sysUserInDB.ShortId,
                                  Name: sysUserInDB.Name,
                                  Code: strCode,
                                  Message: strMessage,
                                  Mark: '3BA7F38FA6DD' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                  Details: null,
                                }
                              );

          }
          else {

            //ANCHOR checkUserRoleLevel
            let resultCheckUserRoles = UserOthersServiceController.checkUserRoleLevel( userSessionStatus,
                                                                                       sysUserInDB,
                                                                                       strBulkOperation === "deleteUser" ? "DeleteUser": "UpdateUser",
                                                                                       logger );

            let resultCheckUserGroupRoles = null;

            if ( !resultCheckUserRoles.isAuthorizedAdmin &&
                 !resultCheckUserRoles.isAuthorizedL03 &&
                 !resultCheckUserRoles.isAuthorizedL02 &&
                 !resultCheckUserRoles.isAuthorizedL01 ) {

              resultCheckUserRoles.isNotAuthorized = true;

            }

            if ( resultCheckUserRoles.isNotAuthorized ) {

              if ( strBulkOperation === "deleteUser" ) {

                result.errors.push(
                                    {
                                      Id: sysUserInDB.Id,
                                      ShortId: sysUserInDB.ShortId,
                                      Name: sysUserInDB.Name,
                                      Code: 'ERROR_CANNOT_DELETE_USER',
                                      Mark: '3CEF42A3B047' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                      Message: await I18NManager.translate( strLanguage, 'Not allowed to delete the user' ),
                                      Details: null
                                    }
                                  );

              }
              else {

                result.errors.push(
                                    {
                                      Id: sysUserInDB.Id,
                                      ShortId: sysUserInDB.ShortId,
                                      Name: sysUserInDB.Name,
                                      Code: 'ERROR_CANNOT_UDPATE_USER',
                                      Mark: 'AF5B2A2B856B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                      Message: await I18NManager.translate( strLanguage, 'Not allowed to update the user' ),
                                      Details: null
                                    }
                                  );

              }

            }
            else {

              if ( strBulkOperation === "moveToUserGroup" ) {

                resultCheckUserGroupRoles = UserOthersServiceController.checkUserGroupRoleLevel(
                                                                                                 userSessionStatus,
                                                                                                 {
                                                                                                   Id: bulkUserData.sysUserGroup.Id,
                                                                                                   ShortId: bulkUserData.sysUserGroup.ShortId,
                                                                                                   Name: bulkUserData.sysUserGroup.Name,
                                                                                                 },
                                                                                                 "UpdateUser",
                                                                                                 logger
                                                                                               );

              }
              else {

                resultCheckUserGroupRoles = resultCheckUserRoles;

              }

            }

            if ( resultCheckUserGroupRoles.isNotAuthorized ) {

              result.errors.push(
                                  {
                                    Id: sysUserInDB.Id,
                                    ShortId: sysUserInDB.ShortId,
                                    Name: sysUserInDB.Name,
                                    Code: 'ERROR_CANNOT_UDPATE_USER',
                                    Mark: '7E8570FF7D8A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                    Message: await I18NManager.translate( strLanguage, 'Not allowed to move the user to the target user group' ),
                                    Details: null
                                  }
                                );

            }
            else {

              let sysUserGroupInDB = null;

              sysUserInDB.UpdatedBy = userSessionStatus.UserName;
              sysUserInDB.UpdatedAt = null;

              if ( strBulkOperation === "moveToUserGroup" ) {

                sysUserGroupInDB = await SYSUserGroupService.getBy(
                                                                    {
                                                                      Id: bulkUserData.sysUserGroup.Id,
                                                                      ShortId: bulkUserData.sysUserGroup.ShortId,
                                                                      Name: bulkUserData.sysUserGroup.Name,
                                                                    },
                                                                    null,
                                                                    transaction,
                                                                    logger
                                                                  );

                if ( sysUserGroupInDB !== null ) {

                  sysUserInDB.GroupId = sysUserGroupInDB.Id;

                }
                else {

                  result.errors.push(
                                      {
                                        Id: sysUserInDB.Id,
                                        ShortId: sysUserInDB.ShortId,
                                        Name: sysUserInDB.Name,
                                        Code: 'ERROR_CANNOT_UDPATE_USER',
                                        Mark: '97BAA8711727' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                        Message: await I18NManager.translate( strLanguage, 'The target user group not found in database' ),
                                        Details: null
                                      }
                                    );

                  sysUserInDB = null;

                }

              }
              else if ( strBulkOperation === "disableUser" ) {

                sysUserInDB.DisabledBy = "1@" + userSessionStatus.UserName;

              }
              else if ( strBulkOperation === "enableUser" ) {

                sysUserInDB.DisabledBy = "0";

              }

              if (  sysUserInDB !== null ) {

                if ( strBulkOperation === "deleteUser" ) {

                  const strPersonId = sysUserInDB.sysPerson ? sysUserInDB.sysPerson.Id: null;

                  if ( strPersonId &&
                       await SYSUserService.countUsersWithPerson( strPersonId,
                                                                  transaction,
                                                                  logger ) === 1 ) {

                    await SYSPersonService.deleteByModel( sysUserInDB.sysPerson,
                                                          transaction,
                                                          logger );

                  }

                  const deleteResult = await SYSUserService.deleteByModel( sysUserInDB,
                                                                           transaction,
                                                                           logger );

                  if ( deleteResult instanceof Error ) {

                    const error = deleteResult as Error;

                    result.errors.push(
                                        {
                                          Id: sysUserInDB.Id,
                                          ShortId: sysUserInDB.ShortId,
                                          Name: sysUserInDB.Name,
                                          Code: 'ERROR_UNEXPECTED',
                                          Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                                          Mark: '4B1421967200' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                          Details: await SystemUtilities.processErrorDetails( error ) //error
                                        }
                                      );


                  }
                  else if ( deleteResult === true ) {

                    result.data.push(
                                      {
                                        Id: sysUserInDB.Id,
                                        ShortId: sysUserInDB.ShortId,
                                        Name: sysUserInDB.Name,
                                        Code: 'SUCCESS_USER_DELETE',
                                        Message: await I18NManager.translate( strLanguage, 'Success user delete.' ),
                                        Mark: 'D746E4B3913A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                        Details: null
                                      }
                                    );

                  }
                  else {

                    result.errors.push(
                                        {
                                          Id: sysUserInDB.Id,
                                          ShortId: sysUserInDB.ShortId,
                                          Name: sysUserInDB.Name,
                                          Code: 'ERROR_USER_DELETE',
                                          Message: await I18NManager.translate( strLanguage, 'Error in user delete.' ),
                                          Mark: '26ECAAE77AAA' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                          Details: "Method deleteByModel return false"
                                        }
                                      );

                  }

                }
                else {

                  sysUserInDB = await SYSUserService.createOrUpdate( ( sysUserInDB as any ).dataValues,
                                                                     true,
                                                                     transaction,
                                                                     logger );

                  if ( sysUserInDB instanceof Error ) {

                    const error = sysUserInDB as any;

                    result.errors.push(
                                        {
                                          Id: sysUserInDB.Id,
                                          ShortId: sysUserInDB.ShortId,
                                          Name: sysUserInDB.Name,
                                          Code: 'ERROR_UNEXPECTED',
                                          Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                                          Mark: '1F3070410157' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                          Details: await SystemUtilities.processErrorDetails( error ) //error
                                        }
                                      );

                  }
                  else {

                    let details = {};

                    if ( strBulkOperation === "moveToUserGroup" ) {

                      details = {
                                  sysUserGroup: {
                                                  Id: sysUserGroupInDB.Id,
                                                  ShortId: sysUserGroupInDB.ShortId,
                                                  Name: sysUserGroupInDB.Name
                                                },
                                };

                    }
                    else {

                      details = {
                                  DisabledBy: sysUserInDB.DisabledBy,
                                  DisabledAt: sysUserInDB.DisabledAt
                                };

                    }

                    result.data.push(
                                      {
                                        Id: sysUserInDB.Id,
                                        ShortId: sysUserInDB.ShortId,
                                        Name: sysUserInDB.Name,
                                        Code: 'SUCCESS_USER_UPDATE',
                                        Message: await I18NManager.translate( strLanguage, 'Success user update.' ),
                                        Mark: '14B48DBC5ECC' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                        Details: details
                                      }
                                    );

                  }

                }

              }

            }

          }

        }
        catch ( error ) {

          result.data.push(
                            {
                              Id: bulkUserData.Id,
                              ShortId: bulkUserData.ShortId,
                              Name: bulkUserData.Name,
                              Code: 'ERROR_UNEXPECTED',
                              Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                              Mark: 'AB36DD82F682' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                              Details: await SystemUtilities.processErrorDetails( error ) //error
                            }
                          );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.bulkUserOperation.name;

      const strMark = "6C6A61A8A08B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result.errors.push(
                          {
                            Code: 'ERROR_UNEXPECTED',
                            Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                            Mark: strMark,
                            Details: await SystemUtilities.processErrorDetails( error ) //error
                          }
                        );

    }

    return result;

  }

  static async disableBulkUser( request: Request,
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

      const bulkResult = await this.bulkUserOperation( "disableUser",
                                                       request,
                                                       currentTransaction,
                                                       logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = 'SUCCESS_BULK_USER_DISABLE';
        strMessage = await I18NManager.translate( strLanguage, 'Success disable ALL users' );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = 'ERROR_BULK_USER_DISABLE';
        strMessage = await I18NManager.translate( strLanguage, 'Cannot disable the users. Please check the errors and warnings section' );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = 'CHECK_DATA_AND_ERRORS_AND_WARNINGS';
        strMessage = await I18NManager.translate( strLanguage, 'Not ALL users has been disabled. Please check the data and errors and warnings section' );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: 'F750518D59A8' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: bIsError,
                 Errors: bulkResult.errors,
                 Warnings: bulkResult.warnings,
                 Count: request.body.bulk.length - bulkResult.errors.length,
                 Data: bulkResult.data
               };

      bApplyTransaction = true;

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

      sourcePosition.method = this.name + "." + this.disableBulkUser.name;

      const strMark = "A1CFD3F24A43" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async enableBulkUser( request: Request,
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

      const bulkResult = await this.bulkUserOperation( "enableUser",
                                                       request,
                                                       currentTransaction,
                                                       logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = 'SUCCESS_BULK_USER_ENABLE';
        strMessage = await I18NManager.translate( strLanguage, 'Success enable ALL users' );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = 'ERROR_BULK_USER_ENABLE';
        strMessage = await I18NManager.translate( strLanguage, 'Cannot enable the users. Please check the errors and warnings section' );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = 'CHECK_DATA_AND_ERRORS_AND_WARNINGS';
        strMessage = await I18NManager.translate( strLanguage, 'Not ALL users has been enabled. Please check the data and errors and warnings section' );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: 'B8A5ED6E6C21' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: bIsError,
                 Errors: bulkResult.errors,
                 Warnings: bulkResult.warnings,
                 Count: request.body.bulk.length - bulkResult.errors.length,
                 Data: bulkResult.data
               };

      bApplyTransaction = true;

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

      sourcePosition.method = this.name + "." + this.enableBulkUser.name;

      const strMark = "93AE7BE3681B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async moveBulkUser( request: Request,
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

      const bulkResult = await this.bulkUserOperation( "moveToUserGroup",
                                                       request,
                                                       currentTransaction,
                                                       logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = 'SUCCESS_BULK_USER_MOVE';
        strMessage = await I18NManager.translate( strLanguage, 'Success move ALL users to the user group' );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = 'ERROR_BULK_USER_MOVE';
        strMessage = await I18NManager.translate( strLanguage, 'Cannot move the users. Please check the errors and warnings section' );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = 'CHECK_DATA_AND_ERRORS_AND_WARNINGS';
        strMessage = await I18NManager.translate( strLanguage, 'Not ALL users has been moved. Please check the data and errors and warnings section' );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: '340268D12456' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: bIsError,
                 Errors: bulkResult.errors,
                 Warnings: bulkResult.warnings,
                 Count: request.body.bulk.length - bulkResult.errors.length,
                 Data: bulkResult.data
               };

      bApplyTransaction = true;

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

      sourcePosition.method = this.name + "." + this.moveBulkUser.name;

      const strMark = "F8A432B3DEB9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteBulkUser( request: Request,
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

      const bulkResult = await this.bulkUserOperation( "deleteUser",
                                                       request,
                                                       currentTransaction,
                                                       logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = 'SUCCESS_BULK_USER_DELETE';
        strMessage = await I18NManager.translate( strLanguage, 'Success delete ALL users' );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = 'ERROR_BULK_USER_DELETE';
        strMessage = await I18NManager.translate( strLanguage, 'Cannot delete the users. Please check the errors and warnings section' );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = 'CHECK_DATA_AND_ERRORS_AND_WARNINGS';
        strMessage = await I18NManager.translate( strLanguage, 'Not ALL users has been deleted. Please check the data and errors and warnings section' );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: '6AEBEABDD14A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: bIsError,
                 Errors: bulkResult.errors,
                 Warnings: bulkResult.warnings,
                 Count: request.body.bulk.length - bulkResult.errors.length,
                 Data: bulkResult.data
               };

      bApplyTransaction = true;

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

      sourcePosition.method = this.name + "." + this.deleteBulkUser.name;

      const strMark = "0020061E70E8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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