import CommonUtilities from "../../common/CommonUtilities";
import SystemUtilities from "../../common/SystemUtilities";

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

const debug = require( 'debug' )( 'SecurityServiceController' );


export interface PasswordParameters {

  minLength: number;
  maxLength: number;
  minLowerCase?: number;
  maxLowerCase?: number;
  minUpperCase?: number;
  maxUpperCase?: number;
  minDigit?: number;
  maxDigit?: number;
  minSymbol?: number;
  maxSymbol?: number;
  symbols?: string;

}

export default class SecurityServiceController {

  static readonly _ID = "SecurityServiceController";

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

        if ( jsonConfigValue[ "#" + strOperatorId + "#" ] ) {

          result.kind = jsonConfigValue[ "#" + strGroupId + "#" ].kind;
          result.on = jsonConfigValue[ "#" + strGroupId + "#" ].on;
          bSet = true;

        }
        else if ( jsonConfigValue[ "#" + strOperatorName + "#" ] ) {

          result.kind = jsonConfigValue[ "#" + strGroupName + "#" ].kind;
          result.on = jsonConfigValue[ "#" + strGroupName + "#" ].on;
          bSet = true;

        }
        else if ( jsonConfigValue[ "#" + strGroupId + "#" ] ) {

          result.kind = jsonConfigValue[ "#" + strGroupId + "#" ].kind;
          result.on = jsonConfigValue[ "#" + strGroupId + "#" ].on;
          bSet = true;

        }
        else if ( jsonConfigValue[ "#" + strGroupName + "#" ] ) {

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

  static async getConfigLoginAccessControl( strFrontendId: string,
                                            transaction: any,
                                            logger: any ): Promise<any> {

    let result = { denied: null, allowed: "*" };

    try {

      const configData = await ConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_Frontend_Rules.Id, //SystemConstants._CONFIG_ENTRY_LoginAccessControl.Id,
                                                                          SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                                          transaction,
                                                                          logger );
      let bSet = false;

      if ( CommonUtilities.isNotNullOrEmpty( configData.Value ) ) {

        const jsonConfigData = CommonUtilities.parseJSON( configData.Value,
                                                          logger );

        if ( jsonConfigData[ "#" + strFrontendId + "#" ] &&
             jsonConfigData[ "#" + strFrontendId + "#" ].userLoginControl ) {

          result.denied = jsonConfigData[ "#" + strFrontendId + "#" ].userLoginControl.denied;
          result.allowed = jsonConfigData[ "#" + strFrontendId + "#" ].userLoginControl.allowed;
          bSet = true;

        }
        else if ( jsonConfigData[ "@__default__@" ] &&
                  jsonConfigData[ "@__default__@" ].userLoginControl  ) {

          result.denied = jsonConfigData[ "@__default__@" ].userLoginControl.denied;
          result.allowed = jsonConfigData[ "@__default__@" ].userLoginControl.allowed;
          bSet = true;

        }

      }

      if ( bSet === false &&
          CommonUtilities.isNotNullOrEmpty( configData.Default ) ) {

        const jsonConfigData = CommonUtilities.parseJSON( configData.Default,
                                                          logger );

        if ( jsonConfigData[ "@__default__@" ] &&
             jsonConfigData[ "@__default__@" ].userLoginControl ) {

          result.denied = jsonConfigData[ "@__default__@" ].userLoginControl.denied;
          result.allowed = jsonConfigData[ "@__default__@" ].userLoginControl.allowed;

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

  static async getFrontendIdIsAllowed( strFrontendId: string,
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

      const configData = await SecurityServiceController.getConfigLoginAccessControl( strFrontendId,
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

      sourcePosition.method = this.name + "." + this.getFrontendIdIsAllowed.name;

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

  static async getConfigPasswordStrengthParameters( strTags: string,
                                                    transaction: any,
                                                    logger: any ): Promise<any> {

    let result = {
                   "@__default__@": {
                                      minLength: 8,
                                      maxLength: 0,
                                      minLowerCase: 0,
                                      maxLowerCase: 0,
                                      minUpperCase: 0,
                                      maxUpperCase: 0,
                                      minDigit: 0,
                                      maxDigit: 0,
                                      minSymbol: 0,
                                      maxSymbol: 0,
                                      symbols: ""
                                    }
                 };

    try {

      result = await ConfigValueDataService.getConfigValueDataFromTags( strTags,
                                                                        SystemConstants._CONFIG_ENTRY_PasswordStrengthParameters.Id,
                                                                        SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                                        transaction,
                                                                        logger );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigPasswordStrengthParameters.name;

      const strMark = "0A832F2FD3AC";

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

  static async checkPasswordStrength( passwordParameters: PasswordParameters,
                                      strPassword: string,
                                      logger: any ): Promise<any> {

    let result = { code: -1000, message: "" };

    try {

      //result = await SecurityServiceController.getConfigPasswordStrengthParameters( strTags,
      //                                                                              transaction,
      //                                                                              logger );

      if ( passwordParameters.minLength === 0 ||
           strPassword.length >= passwordParameters.minLength ) {

        if ( passwordParameters.maxLength === 0 ||
             strPassword.length <= passwordParameters.maxLength ) {

          const intCountLowerChars = passwordParameters.minLowerCase > 0 ||
                                     passwordParameters.maxLowerCase > 0 ?
                                     CommonUtilities.countLowerCasePositions( strPassword ) : 0;

          if ( !passwordParameters.minLowerCase ||
               passwordParameters.minLowerCase === 0 ||
               intCountLowerChars >= passwordParameters.minLowerCase ) {

            if ( !passwordParameters.maxLowerCase ||
                 passwordParameters.maxLowerCase === 0 ||
                 intCountLowerChars <= passwordParameters.maxLowerCase ) {

              const intCountUpperChars = passwordParameters.minUpperCase > 0 ||
                                         passwordParameters.maxUpperCase > 0 ?
                                         CommonUtilities.countUpperCasePositions( strPassword ) : 0;

              if ( !passwordParameters.minUpperCase ||
                   passwordParameters.minUpperCase === 0 ||
                   intCountUpperChars >= passwordParameters.minUpperCase ) {

                if ( !passwordParameters.maxUpperCase ||
                     passwordParameters.maxUpperCase === 0 ||
                     intCountUpperChars <= passwordParameters.maxUpperCase ) {

                  const intCountDigit = passwordParameters.minDigit > 0 ||
                                        passwordParameters.maxDigit > 0 ?
                                        CommonUtilities.countDigitPositions( strPassword ) : 0;

                  if ( !passwordParameters.minDigit ||
                       passwordParameters.minDigit === 0 ||
                       intCountDigit >= passwordParameters.minDigit ) {

                    if ( !passwordParameters.maxDigit ||
                         passwordParameters.maxDigit === 0 ||
                         intCountDigit <= passwordParameters.maxDigit ) {

                      const intCountSymbol = passwordParameters.minSymbol > 0 ||
                                             passwordParameters.maxSymbol > 0 ?
                                             CommonUtilities.countSymbolPositions( strPassword, passwordParameters.symbols ) : 0;

                      if ( !passwordParameters.minSymbol ||
                           passwordParameters.minSymbol === 0 ||
                           intCountSymbol >= passwordParameters.minSymbol ) {

                        if ( !passwordParameters.maxSymbol ||
                             passwordParameters.maxSymbol === 0 ||
                             intCountSymbol <= passwordParameters.maxSymbol ) {

                          result.code = 1;
                          result.message = `The Password is ok`;

                        }
                        else {

                          result.code = -10;
                          result.message = `The password contains ${intCountDigit} symbols chars, is too much. The maximun is ${passwordParameters.maxDigit} positions`;

                        }

                      }
                      else {

                        result.code = -9;
                        result.message = `The password contains ${intCountDigit} symbols chars, is not enough. The minimun is ${passwordParameters.maxDigit} positions`;

                      }

                    }
                    else {

                      result.code = -8;
                      result.message = `The password contains ${intCountDigit} digit numbers, is too much. The maximun is ${passwordParameters.maxDigit} positions`;

                    }

                  }
                  else {

                    result.code = -7;
                    result.message = `The password contains ${intCountDigit} digit numbers, is not enough. The minimun is ${passwordParameters.minDigit} positions`;

                  }

                }
                else {

                  result.code = -6;
                  result.message = `The password contains ${intCountUpperChars} upper case chars, is too much. The maximun is ${passwordParameters.maxUpperCase} positions`;

                }

              }
              else {

                result.code = -5;
                result.message = `The password contains ${intCountUpperChars} upper case chars, is not enough. The minimun is ${passwordParameters.minUpperCase} positions`;

              }

            }
            else {

              result.code = -4;
              result.message = `The password contains ${intCountLowerChars} lower case chars, is too much. The maximun is ${passwordParameters.maxLowerCase} positions`;

            }

          }
          else {

            result.code = -3;
            result.message = `The password contains ${intCountLowerChars} lower case chars, is not enough. The minimun is ${passwordParameters.minLowerCase} positions`;

          }

        }
        else {

          result.code = -2;
          result.message = `The password length is ${strPassword.length}, is too long. The maximun length is ${passwordParameters.maxLength} positions`;

        }

      }
      else {

        result.code = -1;
        result.message = `The password length is ${strPassword.length}, is too short. The minimun length is ${passwordParameters.minLength} positions`;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkPasswordStrength.name;

      const strMark = "D06C7846BDFA";

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

  static async login( strTimeZoneId: string,
                      strSourceIPAddress: string,
                      strFrontendId: string,
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
      const bUserExpired = SystemUtilities.isDateAndTimeAfter( user.ExpireAt );
      const bUserGroupDisabled = bUserFound && CommonUtilities.isNotNullOrEmpty( user.UserGroup.DisabledAt );
      const bUserGroupExpired = bUserFound && SystemUtilities.isDateAndTimeAfter( user.UserGroup.ExpireAt );
      const bFrontendIdIsAllowed = bUserFound && await this.getFrontendIdIsAllowed( strFrontendId,
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
           bUserExpired === false &&
           bUserGroupDisabled === false &&
           bUserGroupExpired === false &&
           await bcrypt.compare( strPassword, user.Password ) ) {

        bUserPasswordIsValid = true;

      }

      if ( bUserFound &&
           bFrontendIdIsAllowed &&
           bUserDisabled === false &&
           bUserExpired === false &&
           bUserGroupDisabled === false &&
           bUserGroupExpired === false &&
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

        const configData = await SecurityServiceController.getConfigExpireTimeAuthentication( user.UserGroup.Id,
                                                                                              user.UserGroup.Name,
                                                                                              user.Id,
                                                                                              user.Name,
                                                                                              transaction,
                                                                                              logger );

        configData.hardLimit = null; //Limit by default is null not hard limit for to session

        //Select more close data time to current date time
        const expireAt = SystemUtilities.selectMoreCloseTimeBetweenTwo( user.ExpireAt,
                                                                        user.UserGroup.ExpireAt );

        if ( expireAt !== null ) {

          if ( configData.kind === 0 ||   //Calculated from UpdatedAt
               configData.kind === 1 ) {  //Calculated from CreatedAt

            const expireOn = SystemUtilities.getCurrentDateAndTimeIncMinutes( configData.on );

            if ( expireOn.isAfter( expireAt ) ) {

              configData.kind = 2;     //Overwrite and use the value of 2
              configData.on = expireAt; //Use now this fixed date time

            }

            configData.hardLimit = expireAt; //Copy value from ExpireAt to HardLimit

          }
          else if ( configData.kind === 2 ) { //Fixed expire Date and Time

            const expireOn = SystemUtilities.getCurrentDateAndTimeFrom( configData.on )

            if ( expireOn.isAfter( expireAt ) ) {

              configData.kind = 2;
              configData.on = expireAt;    //Overwrite and use now the value defined in ExpireAt and not in the config
              configData.hardLimit = expireAt; //Copy value from ExpireAt to HardLimit

            }

          }

        }

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
                                                                    FrontendId: strFrontendId,
                                                                    SourceIPAddress: strSourceIPAddress,
                                                                    Role: strMergedRoles,
                                                                    Name: user.Name,
                                                                    ExpireKind: ExpireKind,
                                                                    ExpireOn: ExpireOn,
                                                                    HardLimit: ExpireOn,
                                                                    CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                    UpdatedBy: SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET,
                                                                  },
                                                                  options
                                                                );
                                                                */

        let strBasicRoles = "";

        if ( strRolesMerged.includes( "#Authenticated#" ) === false ) {

          if ( strRolesMerged.length > 0 ) {

            strBasicRoles = ",#Authenticated#";

          }
          else {

            strBasicRoles = "#Authenticated#";

          }

        }

        if ( strRolesMerged.includes( "#Public#" ) === false ) {

          if ( strBasicRoles.length > 0 ) {

            strBasicRoles = strBasicRoles + ",#Public#";

          }
          else if ( strRolesMerged.length > 0 ) {

            strBasicRoles = ",#Public#";

          }
          else {

            strBasicRoles = "#Public#";

          }

        }

        const userSessionStatusData = {
                                        UserId: user.Id,
                                        UserGroupId: user.GroupId,
                                        Token: strAuthorizationToken,
                                        FrontendId: strFrontendId,
                                        SourceIPAddress: strSourceIPAddress,
                                        Role: strRolesMerged + strBasicRoles,
                                        UserName: user.Name,
                                        ExpireKind: configData.kind,
                                        ExpireOn: configData.on,
                                        HardLimit: configData.hardLimit,
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
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_DISABLED',
                               Message: `Login failed (User disabled)`,
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( bUserExpired ) {

        result = {
                   StatusCode: 401, //Unauthorized
                   Code: 'ERROR_USER_EXPIRED',
                   Message: 'Login failed (User expired)',
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_EXPIRED',
                               Message: `Login failed (User expired)`,
                               Details: null
                             }
                           ],
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
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_GROUP_DISABLED',
                               Message: `Login failed (User group disabled)`,
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( bUserGroupExpired ) {

        result = {
                   StatusCode: 401, //Unauthorized
                   Code: 'ERROR_USER_GROUP_EXPIRED',
                   Message: 'Login failed (User group expired)',
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_GROUP_EXPIRED',
                               Message: `Login failed (User group expired)`,
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else if ( bFrontendIdIsAllowed === false ) {

        result = {
                   StatusCode: 401, //Unauthorized
                   Code: 'ERROR_FRONTEND_KIND_NOT_ALLOWED',
                   Message: 'Not allowed to login from this the kind of frontend',
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_FRONTEND_KIND_NOT_ALLOWED',
                               Message: `Not allowed to login from this the kind of frontend`,
                               Details: null
                             }
                           ],
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
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_LOGIN_FAILED',
                               Message: `Login failed (Username and/or Password are invalid)`,
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
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

        if ( strToken.startsWith( "p:" ) === false ) {

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
                        Mark: strMark,
                        LogId: error.LogId,
                        IsError: true,
                        Errors: [
                                  {
                                    Code: 'ERROR_LOGOUT_FAILED',
                                    Message: `Cannot complete the logout`,
                                    Details: await SystemUtilities.processErrorDetails( error ) //error
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
           currentTransaction.finished !== "rollback" &&
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

}