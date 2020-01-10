import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,
import bcrypt from 'bcrypt';

import DBConnectionManager from './../../managers/DBConnectionManager';
//import { Role } from "../models/Role";
import SystemConstants from "../../SystemContants";
import { User } from "../models/User";
//import { UserSessionStatus } from "../models/UserSessionStatus";
import { UserGroup } from "../models/UserGroup";
import { Person } from "../models/Person";
import ConfigValueDataService from "./ConfigValueDataService";
import UserSessionStatusService from "./UserSessionStatus";
import CacheManager from "../../managers/CacheManager";
import UserService from "./UserService";
import CommonConstants from "../../CommonConstants";

const debug = require( 'debug' )( 'SecurityService' );

export default class SecurityService {

  static readonly _ID = "SecurityService";

  static async getConfigExpireTimeAuthentication( strGroupId: string,
                                                  strGroupName: string,
                                                  strOperatorId: string,
                                                  strOperatorName: string,
                                                  transaction: any,
                                                  logger: any ): Promise<any> {

    let result = { kind: 0, on: 30 }; //Default 30 minutes calculated from UpdatedAt field value

    try {

      const expireTimeConfigValue = await ConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_ExpireTimeAuthentication.Id,
                                                                                     SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                                                     transaction,
                                                                                     logger );
      let bSet = false;

      if ( CommonUtilities.isNotNullOrEmpty( expireTimeConfigValue.Value ) ) {

        const jsonConfigValue = CommonUtilities.parseJSON( expireTimeConfigValue.Value, logger );

        if ( jsonConfigValue[ "#" + strGroupId + "#" ] ) {

          result.kind = jsonConfigValue[ "#" + strGroupId + "#" ].kind;
          result.on = jsonConfigValue[ "#" + strGroupId + "#" ].on;
          bSet = true;

        }
        else if ( jsonConfigValue[ "#" + strGroupName + "#" ] ) {

          result.kind = jsonConfigValue[ "#" + strGroupName + "#" ].kind;
          result.on = jsonConfigValue[ "#" + strGroupName + "#" ].on;
          bSet = true;

        }
        else if ( jsonConfigValue[ "#" + strOperatorId + "#" ] ) {

          result.kind = jsonConfigValue[ "#" + strGroupId + "#" ].kind;
          result.on = jsonConfigValue[ "#" + strGroupId + "#" ].on;
          bSet = true;

        }
        else if ( jsonConfigValue[ "#" + strOperatorName + "#" ] ) {

          result.kind = jsonConfigValue[ "#" + strGroupName + "#" ].kind;
          result.on = jsonConfigValue[ "#" + strGroupName + "#" ].on;
          bSet = true;

        }
        else if ( jsonConfigValue[ "@__default__@" ] ) {

          result.kind = jsonConfigValue[ "@__default__@" ].kind;
          result.on = jsonConfigValue[ "@__default__@" ].on;
          bSet = true;

        }

      }

      if ( bSet === false &&
           CommonUtilities.isNotNullOrEmpty( expireTimeConfigValue.Default ) ) {

        const jsonConfigValue = CommonUtilities.parseJSON( expireTimeConfigValue.Default, logger );

        if ( jsonConfigValue[ "@__default__@" ] ) {

          result.kind = jsonConfigValue[ "@__default__@" ].kind;
          result.on = jsonConfigValue[ "@__default__@" ].on;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigExpireTimeAuthentication.name;

      const strMark = "4736C360538E";

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

  static async getConfigLoginAccessControl( strClientId: string,
                                            transaction: any,
                                            logger: any ): Promise<any> {

    let result = { denied: null, allowed: "*" }

    try {

      const loginAccessControlConfigValue = await ConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_LoginAccessControl.Id,
                                                                                             SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                                                             transaction,
                                                                                             logger );
      let bSet = false;

      if ( CommonUtilities.isNotNullOrEmpty( loginAccessControlConfigValue.Value ) ) {

        const jsonConfigValue = CommonUtilities.parseJSON( loginAccessControlConfigValue.Value,
                                                           logger );

        if ( jsonConfigValue[ "#" + strClientId + "#" ] ) {

          result.denied = jsonConfigValue[ "#" + strClientId + "#" ].denied;
          result.allowed = jsonConfigValue[ "#" + strClientId + "#" ].allowed;
          bSet = true;

        }
        else if ( jsonConfigValue[ "@__default__@" ] ) {

          result.denied = jsonConfigValue[ "@__default__@" ].denied;
          result.allowed = jsonConfigValue[ "@__default__@" ].allowed;
          bSet = true;

        }

      }

      if ( bSet === false &&
          CommonUtilities.isNotNullOrEmpty( loginAccessControlConfigValue.default ) ) {

        const jsonConfigValue = CommonUtilities.parseJSON( loginAccessControlConfigValue.default,
                                                           logger );

        if ( jsonConfigValue[ "@__default__@" ] ) {

          result.denied = jsonConfigValue[ "@__default__@" ].denied;
          result.allowed = jsonConfigValue[ "@__default__@" ].allowed;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigLoginAccessControl.name;

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

  static async getClientIdIsAllowed( strClientId: string,
                                     strGroupId: string,
                                     strGroupName: string,
                                     strGroupTag: string,
                                     strUserId: string,
                                     strUserName: string,
                                     strUserTag: string,
                                     transaction: any,
                                     logger: any ): Promise<number> {

    let intResult = 0;

    try {

      const configData = await SecurityService.getConfigLoginAccessControl( strClientId,
                                                                            transaction,
                                                                            logger );

      let strDeniedValue = configData.denied;
      let strAllowedValue = configData.allowed;

      if ( CommonUtilities.isNotNullOrEmpty( strDeniedValue ) ) {

        if ( strDeniedValue === SystemConstants._VALUE_ANY ) {

           intResult = -1; //Explicit denied

        }
        else if ( strDeniedValue.includes( "#" + strUserId + "#" ) ||
                  strDeniedValue.includes( "#" + strUserName + "#" ) ||
                  CommonUtilities.isInMultiSimpleList( strDeniedValue, ",", strUserTag, false, logger ) ||
                  strDeniedValue.includes( "#" + strGroupId + "#" ) ||
                  strDeniedValue.includes( "#" + strGroupName + "#" ) ||
                  CommonUtilities.isInMultiSimpleList( strDeniedValue, ",", strGroupTag, false, logger ) ) {

           intResult = -1; //Explicit denied

        }

      }

      if ( intResult == 0 &&
          CommonUtilities.isNotNullOrEmpty( strAllowedValue ) ) {

        if ( strAllowedValue === SystemConstants._VALUE_ANY ) {

          intResult = 1; //Explicit allowed

        }
        else if ( strAllowedValue.includes( "#" + strUserId + "#" ) ||
                  strAllowedValue.includes( "#" + strUserName + "#" ) ||
                  CommonUtilities.isInMultiSimpleList( strAllowedValue, ",", strUserTag, false, logger ) ||
                  strAllowedValue.includes( "#" + strGroupId + "#" ) ||
                  strAllowedValue.includes( "#" + strGroupName + "#" ) ||
                  CommonUtilities.isInMultiSimpleList( strAllowedValue, ",", strGroupTag, false, logger ) ) {

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

      const strMark = "D89E1D59A97B";

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

  static async login( strTimeZoneId: string,
                      strSourceIPAddress: string,
                      strClientId: string,
                      strUserName: string,
                      strPassword: string,
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

      //const strCryptedPassword = await bcrypt.hash( strPassword, 10 );

      const options = {

        where: { Name: strUserName },
        transaction: currentTransaction,
        include: [
                  {
                    model: UserGroup,
                  },
                  {
                    model: Person,
                  }
                 ]
        //context: { TimeZoneId: "America/Los_Angeles" }

      }

      let user = await User.findOne( options );

      const bUserFound = CommonUtilities.isNotNullOrEmpty( user );
      const bUserDisabled = bUserFound && CommonUtilities.isNotNullOrEmpty( user.DisabledAt );
      const bUserGroupDisabled = bUserFound && CommonUtilities.isNotNullOrEmpty( user.UserGroup.DisabledAt );
      const bClientIdIsAllowed = bUserFound && await this.getClientIdIsAllowed( strClientId,
                                                                                user.UserGroup.Id,
                                                                                user.UserGroup.Name,
                                                                                user.UserGroup.Tag,
                                                                                user.Id,
                                                                                user.Name,
                                                                                user.Tag,
                                                                                transaction,
                                                                                logger ) >= 0;
      let bUserPasswordIsValid = false;

      if ( bUserFound &&
           bUserDisabled === false &&
           bUserGroupDisabled === false &&
           await bcrypt.compare( strPassword, user.Password ) ) {

        bUserPasswordIsValid = true;

      }

      if ( bUserFound &&
           bClientIdIsAllowed &&
           bUserDisabled === false &&
           bUserGroupDisabled === false &&
           bUserPasswordIsValid ) {

        const fieldsToDelete = [
                                 "Comment",
                                 "CreatedBy",
                                 "CreatedAt",
                                 "UpdatedBy",
                                 "UpdatedAt",
                                 "DisabledBy",
                                 "DisabledAt",
                                 "Password",
                                 "ExtraData",
                                 "UserGroup",
                                 "UserPerson",
                                 "AllowTagAccess",
                                 "DenyTagAccess",
                                 "Role",
                                 "Tag",
                               ];

        let groupRoles = "";
        let groupTags = "";

        let userGroupDataResponse = null;

        if ( ( user as any ).dataValues.UserGroup &&
             ( user as any ).dataValues.UserGroup.dataValues ) {

          groupRoles = ( user as any ).dataValues.UserGroup.dataValues.Role;
          groupTags = ( user as any ).dataValues.UserGroup.dataValues.Tag;

          userGroupDataResponse = CommonUtilities.deleteObjectFields( ( user as any ).dataValues.UserGroup.dataValues,
                                                                      fieldsToDelete,
                                                                      logger );

        }

        let userPersonDataResponse = null;

        if ( ( user as any ).dataValues.UserPerson &&
             ( user as any ).dataValues.UserPerson.dataValues ) {

          userPersonDataResponse = CommonUtilities.deleteObjectFields( ( user as any ).dataValues.UserPerson.dataValues,
                                                                       fieldsToDelete,
                                                                       logger );

        }

        const userRoles = ( user as any ).dataValues.Role; //Save the role field value
        const userTags = ( user as any ).dataValues.Tag; //Save the role field value

        const createdAt = ( user as any ).dataValues.CreatedAt; //Save the CreatedAt field value

        const userDataResponse = CommonUtilities.deleteObjectFields( ( user as any ).dataValues,
                                                                     fieldsToDelete,
                                                                     logger );
        userDataResponse.CreatedAt = createdAt; //Restore the field to main object struct

        SystemUtilities.transformObjectToTimeZone( userDataResponse,
                                                   strTimeZoneId,
                                                   logger ); //Convert to local timezoneId

        const strAuthorizationToken = SystemUtilities.getUUIDv4();

        delete options[ "where" ];
        delete options[ "include" ];

        if ( userDataResponse.SessionsAllowed > 0 ) {

          await UserSessionStatusService.invalidateOldUserSessions( userDataResponse.Id,
                                                                    userDataResponse.SessionsAllowed - 1,
                                                                    currentTransaction,
                                                                    logger );

        }

        const lastLoggedAt = await UserSessionStatusService.getLastUserLogin( userDataResponse.Id,
                                                                              currentTransaction,
                                                                              logger );

        if ( lastLoggedAt ) {

          userDataResponse.LastLoggerAt = SystemUtilities.transformToTimeZone( lastLoggedAt,
                                                                               strTimeZoneId,
                                                                               undefined,
                                                                               logger );

        }
        else {

          userDataResponse.LastLoggerAt = null; //Never

        }

        const configData = await SecurityService.getConfigExpireTimeAuthentication( user.UserGroup.Id,
                                                                                    user.UserGroup.Name,
                                                                                    user.Id,
                                                                                    user.Name,
                                                                                    transaction,
                                                                                    logger  );
        /*
        let bSet = false;

        if ( CommonUtilities.isNotNullOrEmpty( expireTimeConfigValue.Value ) ) {

          const jsonConfigValue = CommonUtilities.parseJSON( expireTimeConfigValue.Value, logger );

          if ( jsonConfigValue[ "#" + user.UserGroup.Name + "#" ] ) {

            intExpireKind = jsonConfigValue[ "#" + user.UserGroup.Name + "#" ].Kind;
            intExpireOn = jsonConfigValue[ "#" + user.UserGroup.Name + "#" ].On;
            bSet = true;

          }

        }

        if ( bSet === false &&
             CommonUtilities.isNotNullOrEmpty( expireTimeConfigValue.Default ) ) {

          const jsonConfigValue = CommonUtilities.parseJSON( expireTimeConfigValue.Default, logger );

          if ( jsonConfigValue[ "@__default__@" ] ) {

            intExpireKind = jsonConfigValue[ "@__default__@" ].Kind;
            intExpireOn = jsonConfigValue[ "@__default__@" ].On;

          }

        }
        */

        const strRolesMerged = SystemUtilities.mergeTokens( groupRoles,
                                                            userRoles,
                                                            true,
                                                            logger );

        //Only create the new user session status
        /*
        const userSessionStatus = await UserSessionStatus.create(
                                                                  {
                                                                    UserId: user.Id,
                                                                    GroupId: user.GroupId,
                                                                    Token: strAuthorizationToken,
                                                                    ClientId: strClientId,
                                                                    SourceIPAddress: strSourceIPAddress,
                                                                    Role: strMergedRoles,
                                                                    Name: user.Name,
                                                                    ExpireKind: ExpireKind,
                                                                    ExpireOn: ExpireOn,
                                                                    CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                    UpdatedBy: SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET,
                                                                  },
                                                                  options
                                                                );
                                                                */

        const userSessionStatusData = {
                                        UserId: user.Id,
                                        UserGroupId: user.GroupId,
                                        Token: strAuthorizationToken,
                                        ClientId: strClientId,
                                        SourceIPAddress: strSourceIPAddress,
                                        Role: strRolesMerged,
                                        UserName: user.Name,
                                        ExpireKind: configData.kind,
                                        ExpireOn: configData.on,
                                        Tag: null,
                                        CreatedBy: strUserName, //SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                        UpdatedBy: strUserName //SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET,
                                      };

        const userSessionStatus = await UserSessionStatusService.createOrUpdate( user.Id, //UserId
                                                                                 strAuthorizationToken, //Token created
                                                                                 userSessionStatusData, //The data
                                                                                 false, //Force Only create
                                                                                 currentTransaction, //Continue the current transaction
                                                                                 logger );

        if ( userPersonDataResponse !== null ) {

          userSessionStatusData[ "PersonId" ] = userPersonDataResponse.PersonId;
          userSessionStatusData[ "Title" ] = userPersonDataResponse.Title;
          userSessionStatusData[ "FirstName" ] = userPersonDataResponse.FirstName;
          userSessionStatusData[ "LastName" ] = userPersonDataResponse.LastName;
          userSessionStatusData[ "EMail" ] = userPersonDataResponse.EMail;
          userSessionStatusData[ "Phone" ] = userPersonDataResponse.Phone;

        }
        else {

          userSessionStatusData[ "PersonId" ] = "";
          userSessionStatusData[ "Title" ] = "";
          userSessionStatusData[ "FirstName" ] = "";
          userSessionStatusData[ "LastName" ] = "";
          userSessionStatusData[ "EMail" ] = "";
          userSessionStatusData[ "Phone" ] = "";

        }

        userSessionStatusData[ "UserTag" ] = userTags;
        //userSessionStatusData[ "User" ] = user.Name;
        userSessionStatusData[ "UserGroupTag" ] = groupTags;
        userSessionStatusData[ "UserGroupName" ] = userGroupDataResponse.Name;
        userSessionStatusData[ "CreatedAt" ] = userSessionStatus.CreatedAt;
        userSessionStatusData[ "UpdatedAt" ] = userSessionStatus.UpdatedAt;
        userSessionStatusData[ "LoggedOutBy" ] = null;
        userSessionStatusData[ "LoggedOutAt" ] = null;

        await CacheManager.setDataWithTTL( strAuthorizationToken,
                                           JSON.stringify( userSessionStatusData ),
                                           300, //5 minutes in seconds
                                           logger );

        const warnings = SystemUtilities.dectectUserWarnings( userDataResponse,
                                                              logger );

        if ( userSessionStatus !== null ) {

          result = {
                     StatusCode: 200,
                     Code: 'SUCCESS_LOGIN',
                     Message: 'Sucess login',
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: warnings,
                     Count: 1,
                     Data: [
                             {
                               Authorization: strAuthorizationToken,
                               User: userDataResponse,
                               Group: userGroupDataResponse,
                               Person: userPersonDataResponse
                             }
                           ]
                   };

        }

      }
      else if ( bUserDisabled ) {

        result = {
                   StatusCode: 401, //Unauthorized
                   Code: 'ERROR_USER_DISABLED',
                   Message: 'Login failed (User disabled)',
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( bUserGroupDisabled ) {

        result = {
                   StatusCode: 401, //Unauthorized
                   Code: 'ERROR_USER_GROUP_DISABLED',
                   Message: 'Login failed (User group disabled)',
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( bClientIdIsAllowed === false ) {

        result = {
                   StatusCode: 401, //Unauthorized
                   Code: 'ERROR_CLIENT_KIND_NOT_ALLOWED',
                   Message: 'Not allowed to login from this the kind of client',
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else {

        result = {
                   StatusCode: 401, //Unauthorized
                   Code: 'ERROR_LOGIN_FAILED',
                   Message: 'Login failed (Username and/or Password are invalid)',
                   LogId: null,
                   IsError: false,
                   Errors: [],
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

      sourcePosition.method = this.name + "." + this.login.name;

      const strMark = "B211BBDAF77B";

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
        LogId: error.LogId,
        Mark: strMark,
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

  static async logout( strToken: string,
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

      let userSessionStatus = await UserSessionStatusService.getUserSessionStatusByToken( strToken,
                                                                                          currentTransaction,
                                                                                          logger ); //Find in the database

      if ( CommonUtilities.isNotNullOrEmpty( userSessionStatus ) ) {

        if ( strToken.startsWith( "p." ) === false ) {

          const UserInfo = await UserService.getById( userSessionStatus.UserId,
                                                      null,
                                                      null,
                                                      logger );

          userSessionStatus.LoggedOutBy = UserInfo.Name;
          userSessionStatus.LoggedOutAt = SystemUtilities.getCurrentDateAndTime();

          let lockedResource = null;

          try {

            //We need write the shared resource and going to block temporally the write access
            lockedResource = await CacheManager.lockResource( undefined, //Default = CacheManager.currentInstance,
                                                              SystemConstants._LOCK_RESOURCE_UPDATE_SESSION_STATUS,
                                                              7 * 1000, //7 seconds
                                                              1, //Only one try
                                                              undefined, //Default 5000 milliseconds
                                                              logger );

            if ( CommonUtilities.isNotNullOrEmpty( lockedResource ) ) { //Stay sure we had the resource locked

              await CacheManager.deleteData( strToken,
                                             logger ); //Delete the token in the central cache

              await UserSessionStatusService.createOrUpdate( userSessionStatus.UserId,
                                                            strToken,
                                                            {
                                                              UserId: userSessionStatus.UserId,
                                                              Token: strToken,
                                                              LoggedOutBy: UserInfo.Name,
                                                              UpdatedBy: UserInfo.Name,
                                                              LoggedOutAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                              UpdatedAt: SystemUtilities.getCurrentDateAndTime().format()
                                                            },
                                                            true,
                                                            null,
                                                            logger ); //Refresh the LoggedOutBy, LoggedOutAt, UpdatedAt field in central db

              await CacheManager.unlockResource( lockedResource,
                                                logger );

              result = {
                         StatusCode: 200,
                         Code: 'SUCCESS_LOGOUT',
                         Message: 'Sucess logout',
                         LogId: null,
                         IsError: false,
                         Errors: [],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       };

            }

          }
          catch ( error ) {

            const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

            sourcePosition.method = this.name + "." + this.logout.name;

            const strMark = "2EBC43CE5C63";

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
                        Code: 'ERROR_LOGOUT_FAILED',
                        Message: `Cannot complete the logout`,
                        LogId: error.LogId,
                        Mark: strMark,
                        IsError: true,
                        Errors: [
                                  {
                                    Code: 'ERROR_LOGOUT_FAILED',
                                    Message: `Cannot complete the logout`,
                                    Details: error
                                  }
                                ],
                        Warnings: [],
                        Count: 0,
                        Data: []
                    };

          }

        }
        else {

          result = {
                      StatusCode: 400, //Bad request
                      Code: 'ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT',
                      Message: `Authorization token provided is persistent. You cannot made logout`,
                      LogId: null,
                      IsError: true,
                      Errors: [
                                {
                                  Code: 'ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT',
                                  Message: `Authorization token provided is persistent. You cannot made logout`,
                                  Details: null
                                }
                              ],
                      Warnings: [],
                      Count: 0,
                      Data: []
                  };

        }

      }
      else {

        result = {
                   StatusCode: 401, //Unauthorized
                   Code: 'ERROR_INVALID_AUTHORIZATION_TOKEN',
                   Message: `Authorization token provided is invalid`,
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_INVALID_AUTHORIZATION_TOKEN',
                               Message: `Authorization token provided is invalid`,
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                };

      }

      if ( currentTransaction != null &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.logout.name;

      const strMark = "2D5BBA7D7BDF";

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
        LogId: error.LogId,
        Mark: strMark,
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

  static async tokenCheck( strToken: string,
                           transaction: any,
                           logger: any ): Promise<any> {

    const result = {
                     StatusCode: 200,
                     Code: 'SUCCESS_TOKEN_IS_VALID',
                     Message: 'The token is valid',
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

    return result;

  }

  /*
  static async getRolesWithRoutePath( intRequestKind: number,
                                      strPath: String,
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

      const strId = SystemUtilities.hashString( intRequestKind + ":" + strPath, 1, logger );

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

      sourcePosition.method = this.name + "." + this.getRolesWithRoutePath.name;

      const strMark = "4C68E2A5F76E";

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
  */

}