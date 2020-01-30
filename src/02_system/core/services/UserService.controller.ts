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
import { UserSignup } from "../../common/database/models/UserSignup";
import NotificationManager from "../../common/managers/NotificationManager";

const debug = require( 'debug' )( 'UserServiceController' );

export default class UserServiceController {

  static readonly _ID = "UserServiceController";

  static async getConfigUserSignupControl( strClientId: string,
                                           transaction: any,
                                           logger: any ): Promise<any> {

    let result = { denied: null, allowed: "*" }

    try {

      const userSignupConfigValue = await ConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_Frontend_Rules.Id, //SystemConstants._CONFIG_ENTRY_UserSignupControl.Id,
                                                                                     SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                                                     transaction,
                                                                                     logger );

      let bSet = false;

      if ( CommonUtilities.isNotNullOrEmpty( userSignupConfigValue.Value ) ) {

        const jsonConfigValue = CommonUtilities.parseJSON( userSignupConfigValue.Value,
                                                           logger );

        if ( jsonConfigValue[ "#" + strClientId + "#" ] &&
             jsonConfigValue[ "#" + strClientId + "#" ].userSignupControl ) {

          result.denied = jsonConfigValue[ "#" + strClientId + "#" ].userSignupControl.denied;
          result.allowed = jsonConfigValue[ "#" + strClientId + "#" ].userSignupControl.allowed;
          bSet = true;

        }
        else if ( jsonConfigValue[ "@__default__@" ] ) {

          result.denied = jsonConfigValue[ "@__default__@" ].userSignupControl.denied;
          result.allowed = jsonConfigValue[ "@__default__@" ].userSignupControl.allowed;
          bSet = true;

        }

      }

      if ( bSet === false &&
          CommonUtilities.isNotNullOrEmpty( userSignupConfigValue.Default ) ) {

        const jsonConfigValue = CommonUtilities.parseJSON( userSignupConfigValue.Default,
                                                           logger );

        if ( jsonConfigValue[ "@__default__@" ] &&
             jsonConfigValue[ "@__default__@" ].userSignupControl ) {

          result.denied = jsonConfigValue[ "@__default__@" ].userSignupControl.denied;
          result.allowed = jsonConfigValue[ "@__default__@" ].userSignupControl.allowed;

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

    return result;

  }

  static async getClientIdIsAllowed( strClientId: string,
                                     strKind: string,
                                     transaction: any,
                                     logger: any ): Promise<number> {

    let intResult = 0;

    try {

      const configData = await this.getConfigUserSignupControl( strClientId,
                                                                transaction,
                                                                logger );

      let strDeniedValue = configData.denied;
      let strAllowedValue = configData.allowed;

      if ( CommonUtilities.isNotNullOrEmpty( strDeniedValue ) ) {

        if ( strDeniedValue === SystemConstants._VALUE_ANY ) {

           intResult = -1; //Explicit denied

        }
        else if ( strDeniedValue.includes( "#" + strKind + "#" ) ) {

           intResult = -1; //Explicit denied

        }

      }

      if ( intResult == 0 &&
          CommonUtilities.isNotNullOrEmpty( strAllowedValue ) ) {

        if ( strAllowedValue === SystemConstants._VALUE_ANY ) {

          intResult = 1; //Explicit allowed

        }
        else if ( strAllowedValue.includes( "#" + strKind + "#" ) ) {

          intResult = 1; //Explicit allowed

        }

      }

      if ( intResult == 0 ) {

        intResult = 1;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getClientIdIsAllowed.name;

      const strMark = "D3DD67D5851E";

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


    return intResult;

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

      const bClientIdIsAllowed = await this.getClientIdIsAllowed( context.ClientId,
                                                                  request.body.Kind,
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

            const bUserGroupExists = await UserGroupService.checkExistsByName( signupProcessData.group,
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
            else if ( await UserService.checkExistsByName( request.body.Name,
                                                           transaction,
                                                           logger ) ) {

              result = {
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                         Message: `The user name [${request.body.Name}] already exists.`,
                         Mark: 'B43E4A5C0D8D',
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                                     Message: `The user name [${request.body.Name}] already exists.`,
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else {

              let rules = {
                            Name: [ 'required', 'min:3', 'regex:/^[a-zA-Z0-9\#\@\.\_\-]+$/g' ],
                            EMail: 'required|emailList', //<-- emailList is a custom validator defined in SystemUtilities.createCustomValidatorSync
                            Phone: 'present|phoneUSList', //<-- phoneUSList is a custom validator defined in SystemUtilities.createCustomValidatorSync
                            FirstName: [ 'required', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            LastName:  [ 'required', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                          };

              const validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                           rules,
                                                                           null,
                                                                           logger );

              if ( validator.passes() ) { //Validate reqeust.body field values

                const strId = SystemUtilities.getUUIDv4();
                const strToken = SystemUtilities.hashString( strId,
                                                             2,
                                                             logger ); //CRC32

                const userSignup = await UserSignup.create(
                                                            {
                                                              Id: strId,
                                                              Kind: request.body.Kind,
                                                              ClientId: context.ClientId,
                                                              Token: strToken,
                                                              Status: signupProcessData.Status,
                                                              Name: request.body.Name,
                                                              FirstName: request.body.FirstName,
                                                              LastName: request.body.LastName,
                                                              EMail: request.body.EMail,
                                                              Phone: CommonUtilities.isNotNullOrEmpty( request.body.Phone ) ? request.body.Phone: null,
                                                              Password: request.body.Password,
                                                              Comment: CommonUtilities.isNotNullOrEmpty( request.body.Comment ) ? request.body.Comment : null,
                                                            }
                                                          );

                if ( userSignup !== null ) {

                  if ( signupProcessData.Status === 1 ) {

                    const configData = await ConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_General_Default_Information.Id,
                                                                                        SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                                                        transaction,
                                                                                        logger );

                    //Send immediately the mail for auto activate the new user account
                    await NotificationManager.send(
                                                    "email",
                                                    {
                                                      from: configData[ "default_no_response_email" ] || "no-response@no-response.com",
                                                      to: request.body.EMail,
                                                      subject: "SIGNUP FOR NEW USER ACCOUNT",
                                                      body: {
                                                              kind: "template",
                                                              file: "email-signup-web.pug",
                                                              language: context.Language,
                                                              variables: { userName: request.body.Name, activationCode: strToken }
                                                              //kind: "embedded",
                                                              //text: "Hello",
                                                              //html: "<b>Hello</b>"
                                                            }
                                                    },
                                                    logger
                                                  );

                  }

                }

              }
              else {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                           Message: `One or more field values are invalid`,
                           Mark: 'F01229E593EE',
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                                       Message: `One or more field values are invalid`,
                                       Details: validator.errors.all()
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }

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
                                   Details: passwordStrengthParameters
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