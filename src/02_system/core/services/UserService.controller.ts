import CommonUtilities from "../../common/CommonUtilities";
import SystemUtilities from "../../common/SystemUtilities";

import { Router, Request, Response, NextFunction } from 'express';

//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,
import bcrypt from 'bcrypt';

import DBConnectionManager from '../../common/managers/DBConnectionManager';
//import { Role } from "../models/Role";
import SystemConstants from "../../common/SystemContants";
import { User } from "../../common/database/models/User";
//import { UserSessionStatus } from "../models/UserSessionStatus";
import { UserGroup } from "../../common/database/models/UserGroup";
import { Person } from "../../common/database/models/Person";
import ConfigValueDataService from "../../common/database/services/ConfigValueDataService";
import UserSessionStatusService from "../../common/database/services/UserSessionStatusService";
import CacheManager from "../../common/managers/CacheManager";
import UserService from "../../common/database/services/UserService";
import CommonConstants from "../../common/CommonConstants";
import SecurityServiceController from "./SecurityService.controller";
import { PasswordParameters } from "./SecurityService.controller";
import UserGroupService from "../../common/database/services/UserGroupService";

const debug = require( 'debug' )( 'UserServiceController' );

export default class UserServiceController {

  static readonly _ID = "UserServiceController";

  static async getConfigSignupControl( strClientId: string,
                                       transaction: any,
                                       logger: any ): Promise<any> {

    let bResult = false;

    try {

      const userSignupConfigValue = await ConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_UserSignupControl.Id,
                                                                                     SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                                                     transaction,
                                                                                     logger );

      let bSet = false;

      if ( CommonUtilities.isNotNullOrEmpty( userSignupConfigValue.Value ) ) {

        const jsonConfigValue = CommonUtilities.parseJSON( userSignupConfigValue.Value,
                                                           logger );

        if ( jsonConfigValue[ "#" + strClientId + "#" ] ) {

          bResult = jsonConfigValue[ "#" + strClientId + "#" ].toLowerCase() === "allowed";
          bSet = true;

        }
        else if ( jsonConfigValue[ "@__default__@" ] ) {

          bResult = jsonConfigValue[ "@__default__@" ].toLowerCase() === "allowed";
          bSet = true;

        }

      }

      if ( bSet === false &&
          CommonUtilities.isNotNullOrEmpty( userSignupConfigValue.Default ) ) {

        const jsonConfigValue = CommonUtilities.parseJSON( userSignupConfigValue.Default,
                                                           logger );

        if ( jsonConfigValue[ "@__default__@" ] ) {

          bResult = jsonConfigValue[ "@__default__@" ].toLowerCase() === "allowed";

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigSignupProcess.name;

      const strMark = "062260B81ABA";

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

    return bResult;

  }

  static async getConfigSignupProcess( strKind: string,
                                       transaction: any,
                                       logger: any ): Promise<any> {

    let result = null;

    try {

      const userSignupConfigValue = await ConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_UserSignupProcess.Id,
                                                                                     SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                                                     transaction,
                                                                                     logger );

      let bSet = false;

      if ( CommonUtilities.isNotNullOrEmpty( userSignupConfigValue.Value ) ) {

        const jsonConfigValue = CommonUtilities.parseJSON( userSignupConfigValue.Value,
                                                           logger );

        if ( jsonConfigValue[ "#" + strKind + "#" ] ) {

          result = jsonConfigValue[ "#" + strKind + "#" ];
          bSet = true;

        }
        else if ( jsonConfigValue[ "@__default__@" ] ) {

          result = jsonConfigValue[ "@__default__@" ];
          bSet = true;

        }

      }

      if ( bSet === false &&
          CommonUtilities.isNotNullOrEmpty( userSignupConfigValue.Default ) ) {

        const jsonConfigValue = CommonUtilities.parseJSON( userSignupConfigValue.Default,
                                                           logger );

        if ( jsonConfigValue[ "@__default__@" ] ) {

          result = jsonConfigValue[ "@__default__@" ];

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigSignupProcess.name;

      const strMark = "13C1DB2F817E";

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

  static async signup( request: Request,
                       transaction: any,
                       logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const context = ( request as any ).context;

      const bClientIdIsAllowed = await this.getConfigSignupControl( context.ClientId,
                                                                    currentTransaction,
                                                                    logger );

      if ( bClientIdIsAllowed ) {

        const signupProcessData = await this.getConfigSignupProcess( request.body.Kind,
                                                                     currentTransaction,
                                                                     logger );

        if ( signupProcessData &&
             signupProcessData.group &&
             signupProcessData.group.trim() !== "" &&
             signupProcessData.group.trim().toLowerCase() !== "@__error__@" ) {

          let strTag = "";

          if ( signupProcessData.group !== "@__FromName__@" ) {

            strTag = !signupProcessData.passwordParameterTag ? "#" + signupProcessData.group + "#" : "";

          }
          else {

            strTag = !signupProcessData.passwordParameterTag ? "#" + request.body.Name + "#" : "";

          };

          strTag = signupProcessData.passwordParameterTag ? signupProcessData.passwordParameterTag : strTag;

          const passwordStrengthParameters = await SecurityServiceController.getConfigPasswordStrengthParameters( strTag,
                                                                                                                  transaction,
                                                                                                                  logger );


          const checkPasswordStrengthResult = await SecurityServiceController.checkPasswordStrength( passwordStrengthParameters,
                                                                                                     request.body.Password,
                                                                                                     logger );
          if ( checkPasswordStrengthResult.code === 1 ) {

            const bUserGroupExists = await UserGroupService.checkExitsByName( signupProcessData.group,
                                                                              transaction,
                                                                              logger );

            if ( signupProcessData.createGroup === false &&
                 bUserGroupExists === false ) {

              result = {
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_USER_GROUP_NOT_EXISTS',
                         Message: `The user group ${signupProcessData.group} defined by signup kind ${request.body.Kind} not exists`,
                         Mark: '49EEF768004F',
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_NOT_EXISTS',
                                     Message: `The user group ${signupProcessData.group} defined by signup kind ${request.body.Kind} not exists`,
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( signupProcessData.createGroup &&
                      bUserGroupExists ) {

              result = {
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_USER_GROUP_ALREADY_EXISTS',
                         Message: `The user group [${signupProcessData.group}] defined by signup kind [${request.body.Kind}] already exists`,
                         Mark: '3BAC1FA1D2A2',
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_ALREADY_EXISTS',
                                     Message: `The user group [${signupProcessData.group}] defined by signup kind [${request.body.Kind}] already exists`,
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( bUserGroupExists &&
                      await UserGroupService.checkDisabledByName( signupProcessData.group,
                                                                  transaction,
                                                                  logger ) ) {

              result = {
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_USER_GROUP_DISABLED',
                         Message: `The user group [${signupProcessData.group}] defined by signup kind [${request.body.Kind}] is disabled. You cannot signup new users`,
                         Mark: '88C3AE24AB5E',
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_DISABLED',
                                     Message: `The user group [${signupProcessData.group}] defined by signup kind [${request.body.Kind}] is disabled. You cannot signup new users`,
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else {

              /*
              if ( bUserGroupExists === false ) {

                await UserGroup.create(
                                        {
                                          Name: request.body.Name,
                                          Role: signupProcessData.groupRole,
                                          Comment: "Created by signup process",
                                          Tag: signupProcessData.groupTag
                                        }
                                      );

              }
              */

            }

          }
          else {

            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_PASSWORD_NOT_VALID',
                       Message: `The password is not valid`,
                       Mark: '24742802D110',
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: checkPasswordStrengthResult.code,
                                   Message: checkPasswordStrengthResult.message,
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }

        }
        else {

          result = {
                     StatusCode: 400, //Bad request
                     Code: 'ERROR_SIGNUP_KIND_NOT_VALID',
                     Message: `The singup kind ${request.body.Kind} for singup is not valid`,
                     Mark: 'E0E3A7CC1A6A',
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_SIGNUP_KIND_NOT_VALID',
                                 Message: `The singup kind ${request.body.Kind} is not valid`,
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: 'ERROR_CLIENT_KIND_NOT_ALLOWED',
                   Message: 'Not allowed to signup from this the kind of client',
                   Mark: '9333A33809AD',
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_CLIENT_KIND_NOT_ALLOWED',
                               Message: `Not allowed to signup from this the kind of client`,
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }

      if ( currentTransaction != null &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.signup.name;

      const strMark = "309DBDE7EEAF";

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
                 StatusCode: 500,
                 Code: 'ERROR_UNEXPECTED',
                 Message: 'Unexpected error. Please read the server log for more details.',
                 Mark: strMark,
                 LogId: error.LogId,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

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