import cluster from 'cluster';

//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,
import bcrypt from 'bcrypt';

import CommonConstants from "../../../common/CommonConstants";
import SystemConstants from "../../../common/SystemContants";

import SystemUtilities from "../../../common/SystemUtilities";
import CommonUtilities from "../../../common/CommonUtilities";

//import { SYSRole } from "../models/Role";
//import { SYSUserSessionStatus } from "../models/UserSessionStatus";
//import { SYSUser } from "../../common/database/models/SYSUser";
//import { SYSUserGroup } from "../../common/database/models/SYSUserGroup";
//import { SYSPerson } from "../../common/database/models/SYSPerson";
import SYSConfigValueDataService from "../../../common/database/services/SYSConfigValueDataService";
import SYSUserSessionStatusService from "../../../common/database/services/SYSUserSessionStatusService";
import SYSUserService from "../../../common/database/services/SYSUserService";

import DBConnectionManager from '../../../common/managers/DBConnectionManager';
import CacheManager from "../../../common/managers/CacheManager";
import I18NManager from "../../../common/managers/I18Manager";
import { SYSUser } from '../../../common/database/models/SYSUser';
import NotificationManager from '../../../common/managers/NotificationManager';

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

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_ExpireTimeAuthentication.Id,
                                                                             SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                                             transaction,
                                                                             logger );
      let bSet = false;

      if ( CommonUtilities.isNotNullOrEmpty( configData.Value ) ) {

        const jsonConfigValue = CommonUtilities.parseJSON( configData.Value, logger );

        if ( jsonConfigValue[ "#" + strOperatorId + "#" ] ) {

          result.kind = jsonConfigValue[ "#" + strOperatorId + "#" ].kind;
          result.on = jsonConfigValue[ "#" + strOperatorId + "#" ].on;
          bSet = true;

        }
        else if ( jsonConfigValue[ "#" + strOperatorName + "#" ] ) {

          result.kind = jsonConfigValue[ "#" + strOperatorName + "#" ].kind;
          result.on = jsonConfigValue[ "#" + strOperatorName + "#" ].on;
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
           CommonUtilities.isNotNullOrEmpty( configData.Default ) ) {

        const jsonConfigValue = CommonUtilities.parseJSON( configData.Default, logger );

        if ( jsonConfigValue[ "@__default__@" ] ) {

          result.kind = jsonConfigValue[ "@__default__@" ].kind;
          result.on = jsonConfigValue[ "@__default__@" ].on;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigExpireTimeAuthentication.name;

      const strMark = "4736C360538E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_Frontend_Rules.Id, //SystemConstants._CONFIG_ENTRY_LoginAccessControl.Id,
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

      const strMark = "13C1DB2F817E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

        if ( strDeniedValue === SystemConstants._VALUE_ANY ||
             strDeniedValue.includes( "#" + strUserId + "#" ) ||
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

        if ( strAllowedValue === SystemConstants._VALUE_ANY ||
             strAllowedValue.includes( "#" + strUserId + "#" ) ||
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

      const strMark = "D89E1D59A97B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = await SYSConfigValueDataService.getConfigValueDataFromTags( strTags,
                                                                           SystemConstants._CONFIG_ENTRY_PasswordStrengthParameters.Id,
                                                                           SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                                           transaction,
                                                                           logger );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigPasswordStrengthParameters.name;

      const strMark = "0A832F2FD3AC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                          result.message = `The password contains ${intCountSymbol} symbols chars, is too much. The maximun is ${passwordParameters.maxSymbol} positions`;

                        }

                      }
                      else {

                        result.code = -9;
                        result.message = `The password contains ${intCountSymbol} symbols chars, is not enough. The minimun is ${passwordParameters.minSymbol} positions`;

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

      const strMark = "D06C7846BDFA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async processSessionStatus( context: any,
                                     processOptions: any,
                                     strUserName: string,
                                     strPassword: string,
                                     strSecondaryUser: string,
                                     transaction: any,
                                     logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let sysUserInDB = await SYSUserService.getByName( strUserName,
                                                        null,
                                                        currentTransaction,
                                                        logger ); // await User.findOne( options );

      const bUserFound = sysUserInDB && sysUserInDB instanceof Error === false;
      const bUserDisabled = bUserFound && CommonUtilities.isNotNullOrEmpty( sysUserInDB.DisabledAt );
      const bUserExpired = bUserFound && SystemUtilities.isDateAndTimeAfter( sysUserInDB.ExpireAt );
      const bUserGroupDisabled = bUserFound && CommonUtilities.isNotNullOrEmpty( sysUserInDB.sysUserGroup.DisabledAt );
      const bUserGroupExpired = bUserFound && SystemUtilities.isDateAndTimeAfter( sysUserInDB.sysUserGroup.ExpireAt );

      let bFrontendIdIsAllowed = processOptions.checkFrontendId === false;

      if ( processOptions.checkFrontendId === undefined ||
           processOptions.checkFrontendId === false ) {

        bFrontendIdIsAllowed = bUserFound && await this.getFrontendIdIsAllowed( context.FrontendId,
                                                                                sysUserInDB.sysUserGroup.Id,
                                                                                sysUserInDB.sysUserGroup.Name,
                                                                                sysUserInDB.sysUserGroup.Tag,
                                                                                sysUserInDB.Id,
                                                                                sysUserInDB.Name,
                                                                                sysUserInDB.Tag,
                                                                                transaction,
                                                                                logger ) >= 0;

      }

      let bUserPasswordIsValid = processOptions.checkPassword === false;

      if (
           (
             processOptions.checkPassword === undefined ||
             processOptions.checkPassword === false
           ) &&
           bUserFound &&
           bUserDisabled === false &&
           bUserExpired === false &&
           bUserGroupDisabled === false &&
           bUserGroupExpired === false &&
           await bcrypt.compare( strPassword, sysUserInDB.Password ) ) {

        bUserPasswordIsValid = true;

      }

      if (
           bUserFound &&
           bFrontendIdIsAllowed &&
           bUserPasswordIsValid &&
           (
             processOptions.useSoftCheck === true ||
             (
               bUserDisabled === false &&
               bUserExpired === false &&
               bUserGroupDisabled === false &&
               bUserGroupExpired === false
             )
           )
         ) {

        const fieldsToDelete = [
                                 "Comment",
                                 "CreatedBy",
                                 "CreatedAt",
                                 "UpdatedBy",
                                 "UpdatedAt",
                                 "DisabledBy",
                                 "DisabledAt",
                                 "Password",
                                 //"ExtraData",
                                 //"sysUserGroup",
                                 //"sysUserPerson",
                                 "AllowTagAccess",
                                 "DenyTagAccess",
                                 "Role",
                                 //"Tag",
                                 //"PasswordSetAt",
                                 "ExpireAt",
                                 "ImageId"
                               ];

        let strGroupRoles = "";
        let strGroupTags = "";

        let userGroupDataResponse = null;

        if ( sysUserInDB.sysUserGroup ) {

          strGroupRoles = sysUserInDB.sysUserGroup.Role;
          strGroupTags = sysUserInDB.sysUserGroup.Tag;

          userGroupDataResponse = CommonUtilities.deleteObjectFields( ( sysUserInDB.sysUserGroup as any ).dataValues,
                                                                      fieldsToDelete,
                                                                      logger );

          /*
          strGroupBusinessRoles = sysUserInDB.sysUserGroup.ExtraData &&
                                  sysUserInDB.sysUserGroup.ExtraData[ "Business" ] &&
                                  sysUserInDB.sysUserGroup.ExtraData[ "Business" ].Role ?
                                  sysUserInDB.sysUserGroup.ExtraData[ "Business" ].Role: null; //Save the role field value
          */

        }

        let userPersonDataResponse = null;

        if ( sysUserInDB.sysPerson ) {

          userPersonDataResponse = CommonUtilities.deleteObjectFields( ( sysUserInDB.sysPerson as any ).dataValues,
                                                                       fieldsToDelete,
                                                                       logger );

        }

        const strUserRoles = sysUserInDB.Role; //Save the role field value
        const strUserTags = sysUserInDB.Tag; //Save the role field value

        /*
                                         sysUserInDB.ExtraData &&
                                         sysUserInDB.ExtraData[ "Business" ] &&
                                         sysUserInDB.ExtraData[ "Business" ].Role ?
                                         sysUserInDB.ExtraData[ "Business" ].Role: null; //Save the role field value
                                       */

        const createdAt = sysUserInDB.CreatedAt; //Save the CreatedAt field value

        let userDataResponse = CommonUtilities.deleteObjectFields( ( sysUserInDB as any ).dataValues,
                                                                   fieldsToDelete,
                                                                   logger );

        userDataResponse.sysUserGroup = userGroupDataResponse;
        userDataResponse.sysPerson = userPersonDataResponse;

        userDataResponse.CreatedAt = createdAt; //Restore the field to main object struct

        userDataResponse = await SYSUser.convertFieldValues(
                                                             {
                                                               Data: userDataResponse,
                                                               FilterFields: 1, //Force to remove fields like password and value
                                                               TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                               Include: null,
                                                               Logger: logger,
                                                               ExtraInfo: {
                                                                            Request: null
                                                                          }
                                                             }
                                                           );

        let strUserGroupBusinessRoles = "";
        let strUserBusinessRoles = "";

        if ( userDataResponse.sysUserGroup &&
             userDataResponse.sysUserGroup.Business &&
             userDataResponse.sysUserGroup.Business.Role ) {

          strUserGroupBusinessRoles = userDataResponse.sysUserGroup.Business.Role;

          delete userDataResponse.sysUserGroup.Business.Role;

        }

        if ( userDataResponse.Business &&
             userDataResponse.Business.Role ) {

          strUserBusinessRoles = userDataResponse.Business.Role;

          delete userDataResponse.Business.Role;

        }

        /*
        SystemUtilities.transformObjectToTimeZone( userDataResponse,
                                                   context.TimeZoneId,
                                                   logger ); //Convert to local timezoneId
                                                   */

        const strAuthorization = !processOptions.authorization ? SystemUtilities.getUUIDv4() : processOptions.authorization;

        if ( ( !processOptions.checkOldSession ||
               processOptions.checkOldSession === 1 ) &&
               userDataResponse.SessionsLimit > 0 ) {

          await SYSUserSessionStatusService.invalidateOldUserSessions( userDataResponse.Id,
                                                                       userDataResponse.SessionsLimit - 1,
                                                                       currentTransaction,
                                                                       logger );

        }

        const lastLoginAt = await SYSUserSessionStatusService.getLastUserLogin( userDataResponse.Id,
                                                                                strAuthorization,
                                                                                currentTransaction,
                                                                                logger );

        /*
        if ( lastLoggedAt ) {

          userDataResponse.LastLoggerAt = SystemUtilities.transformToTimeZone( lastLoggedAt,
                                                                               context.TimeZoneId,
                                                                               undefined,
                                                                               logger );

        }
        else {

          userDataResponse.LastLoggerAt = null; //Never

        }
        */

        const configData = await SecurityServiceController.getConfigExpireTimeAuthentication( sysUserInDB.sysUserGroup.Id,
                                                                                              sysUserInDB.sysUserGroup.Name,
                                                                                              sysUserInDB.Id,
                                                                                              sysUserInDB.Name,
                                                                                              transaction,
                                                                                              logger );

        configData.hardLimit = null; //Limit by default is null not hard limit for to session

        //Select more close data time to current date time
        const expireAt = SystemUtilities.selectMoreCloseTimeBetweenTwo( sysUserInDB.ExpireAt,
                                                                        sysUserInDB.sysUserGroup.ExpireAt );

        if ( expireAt !== null ) {

          if ( configData.kind === 0 ||   //Calculated from UpdatedAt
               configData.kind === 1 ) {  //Calculated from CreatedAt

            const expireOn = processOptions.notProcessExpireOn === true ? null: SystemUtilities.getCurrentDateAndTimeIncMinutes( configData.on );

            if ( expireOn &&
                 expireOn.isAfter( expireAt ) ) {

              configData.kind = 2;      //Overwrite and use the value of 2
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

        const strRolesMerged = SystemUtilities.mergeTokens( strGroupRoles,
                                                            strUserRoles,
                                                            true,
                                                            logger );

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

        const strBusinessRolesMerged = SystemUtilities.mergeTokens( strUserGroupBusinessRoles,
                                                                    strUserBusinessRoles,
                                                                    true,
                                                                    logger );

        const detectedWarnings = SystemUtilities.dectectUserWarnings( context.Language,
                                                                      userDataResponse,
                                                                      logger );

        if ( processOptions.useSoftCheck === true ) {

          const bIsPersistent =  strAuthorization.startsWith( "p:" );

          if ( bUserDisabled &&
               bIsPersistent === false ) {

            detectedWarnings.warnings.push(
                                            {
                                              Code: "WARNING_USER_DISABLED",
                                              Message: I18NManager.translateSync( context.Language, "The user is disabled" ),
                                              Details: null,
                                            }
                                          );

            detectedWarnings.tag = detectedWarnings.tag ? detectedWarnings.tag + ",#USER_DISABLED#" : "#USER_DISABLED#";

          }

          if ( bUserExpired &&
               bIsPersistent === false ) {

            detectedWarnings.warnings.push(
                                            {
                                              Code: "WARNING_USER_EXPIRED",
                                              Message: I18NManager.translateSync( context.Language, "The user is expired" ),
                                              Details: null,
                                            }
                                          );

            detectedWarnings.tag = detectedWarnings.tag ? detectedWarnings.tag + ",#USER_EXPIRED#" : "#USER_EXPIRED#";

          }

          if ( bUserGroupDisabled &&
               bIsPersistent === false  ) {

            detectedWarnings.warnings.push(
                                            {
                                              Code: "WARNING_USER_GROUP_DISABLED",
                                              Message: I18NManager.translateSync( context.Language, "The group is disabled" ),
                                              Details: null,
                                            }
                                          );

            detectedWarnings.tag = detectedWarnings.tag ? detectedWarnings.tag + ",#USER_GROUP_DISABLED#" : "#USER_GROUP_DISABLED#";

          }

          if ( bUserGroupExpired &&
               bIsPersistent === false  ) {

            detectedWarnings.warnings.push(
                                            {
                                              Code: "WARNING_USER_GROUP_EXPIRED",
                                              Message: I18NManager.translateSync( context.Language, "The group is expired" ),
                                              Details: null,
                                            }
                                          );

            detectedWarnings.tag = detectedWarnings.tag ? detectedWarnings.tag + ",#USER_GROUP_EXPIRED#" : "#USER_GROUP_EXPIRED#";

          }

        }

        const userSessionStatusData = {
                                        UserId: sysUserInDB.Id,
                                        UserGroupId: sysUserInDB.GroupId,
                                        Token: strAuthorization,
                                        FrontendId: context.FrontendId,
                                        SourceIPAddress: context.SourceIPAddress,
                                        Role: strRolesMerged + strBasicRoles,
                                        UserName: sysUserInDB.Name,
                                        ExpireKind: configData.kind,
                                        ExpireOn: configData.on,
                                        HardLimit: configData.hardLimit,
                                        Tag: detectedWarnings.tag ? detectedWarnings.tag : null,
                                        ExtraData: {
                                                     Business: {
                                                                 Role: strBusinessRolesMerged
                                                               }
                                                   },
                                        Business: {
                                                    Role: strBusinessRolesMerged
                                                  },
                                        CreatedBy: processOptions.useSecondaryUserToCreatedBy === true && strSecondaryUser ? strSecondaryUser : strUserName, //SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                        CreatedAt: processOptions.updateCreatedAt === true ? SystemUtilities.getCurrentDateAndTime().format(): null,
                                        UpdatedBy: !strSecondaryUser ? strUserName : strSecondaryUser, //SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET,
                                        UpdatedAt: null
                                      };

        const userSessionStatus = await SYSUserSessionStatusService.createOrUpdate( sysUserInDB.Id, //UserId
                                                                                    strAuthorization, //Token created
                                                                                    userSessionStatusData, //The data
                                                                                    true, //Force Only create
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

        userSessionStatusData[ "UserTag" ] = strUserTags;
        //userSessionStatusData[ "User" ] = user.Name;
        userSessionStatusData[ "UserGroupTag" ] = strGroupTags;
        userSessionStatusData[ "UserGroupShortId" ] = userGroupDataResponse.ShortId;
        userSessionStatusData[ "UserGroupName" ] = userGroupDataResponse.Name;
        userSessionStatusData[ "CreatedAt" ] = userSessionStatus.CreatedAt;
        userSessionStatusData[ "UpdatedAt" ] = userSessionStatus.UpdatedAt;
        userSessionStatusData[ "LoggedOutBy" ] = null;
        userSessionStatusData[ "LoggedOutAt" ] = null;

        delete userSessionStatusData[ "ExtraData" ];

        await CacheManager.setDataWithTTL( strAuthorization,
                                           JSON.stringify( userSessionStatusData ),
                                           300, //5 minutes in seconds
                                           logger );

        if ( userSessionStatus !== null ) {

          NotificationManager.publishOnTopic( "SystemEvent",
                                              {
                                                Name: processOptions.operation + "Success",
                                                Token: userSessionStatusData.Token,
                                                UserId: userSessionStatusData.UserId,
                                                UserName: userSessionStatusData.UserName,
                                                UserGroupId: userSessionStatusData.UserGroupId,
                                              },
                                              logger );

          //userDataResponse.sysUserGroup = userGroupDataResponse;
          //userDataResponse.sysPerson = userPersonDataResponse;

          if ( !processOptions.useCustomResponse ||
               processOptions.useCustomResponse === false ) {

            result = {
                       StatusCode: 200, //Ok
                       Code: 'SUCCESS_LOGIN',
                       Message: await I18NManager.translate( context.Language, 'Success login' ),
                       Mark: '9F6F3B735B7D' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: false,
                       Errors: [],
                       Warnings: detectedWarnings.warnings,
                       Count: 1,
                       Data: [
                               {
                                 Authorization: strAuthorization,
                                 ShortToken: userSessionStatus.ShortToken,
                                 Role: strRolesMerged + strBasicRoles,
                                 LastLoginAt: lastLoginAt ? lastLoginAt: I18NManager.translateSync( context.Language, "Never" ),
                                 Business: {
                                             Role: strBusinessRolesMerged
                                           },
                                 sysUser: userDataResponse,
                                 //sysUserGroup: userGroupDataResponse,
                                 //sysPerson: userPersonDataResponse
                               }
                             ]
                     };

          }
          else {

            result = {
                       StatusCode: 200, //Ok
                       Code: processOptions.code,
                       Message: I18NManager.translateSync( context.Language, processOptions.message ),
                       Mark: processOptions.mark + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: false,
                       Errors: [],
                       Warnings: detectedWarnings.warnings,
                       Count: 1,
                       Data: [
                               {
                                 Authorization: strAuthorization,
                                 SupportToken: userSessionStatus.ShortToken,
                                 Role: strRolesMerged + strBasicRoles,
                                 LastLoginAt: lastLoginAt ? lastLoginAt: I18NManager.translateSync( context.Language, "Never" ),
                                 Business: {
                                             Role: strBusinessRolesMerged
                                           },
                                 sysUser: userDataResponse,
                                 //Group: userGroupDataResponse,
                                 //Person: userPersonDataResponse
                               }
                             ]
                     };

          }

        }

      }
      else if ( bUserDisabled ) {

        result = {
                   StatusCode: 401, //Unauthorized
                   Code: 'ERROR_USER_DISABLED',
                   Message: await I18NManager.translate( context.Language, 'Login failed (User disabled)' ),
                   Mark: 'C2344BE0E051' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_DISABLED',
                               Message: await I18NManager.translate( context.Language, 'Login failed (User disabled)' ),
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
                   Message: await I18NManager.translate( context.Language, 'Login failed (User expired)' ),
                   Mark: '5E65F3A6BB84' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_EXPIRED',
                               Message: await I18NManager.translate( context.Language, 'Login failed (User expired)' ),
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
                   Message: await I18NManager.translate( context.Language, 'Login failed (User group disabled)' ),
                   Mark: 'C0631A69B6F6' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_GROUP_DISABLED',
                               Message: await I18NManager.translate( context.Language, 'Login failed (User group disabled)' ),
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
                   Message: await I18NManager.translate( context.Language, 'Login failed (User group expired)' ),
                   Mark: 'B621392319E6' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_GROUP_EXPIRED',
                               Message: await I18NManager.translate( context.Language, 'Login failed (User group expired)' ),
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
                   Message: await I18NManager.translate( context.Language, 'Not allowed to login from this the kind of frontend' ),
                   Mark: 'D8E7BA64792D' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_FRONTEND_KIND_NOT_ALLOWED',
                               Message: await I18NManager.translate( context.Language, 'Not allowed to login from this the kind of frontend' ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }
      else {

        NotificationManager.publishOnTopic( "SystemEvent",
                                            {
                                              Name: "UserLoginFailed",
                                              UserName: strUserName
                                            },
                                            logger );

        result = {
                   StatusCode: 401, //Unauthorized
                   Code: 'ERROR_LOGIN_FAILED',
                   Message: await I18NManager.translate( context.Language, 'Login failed (Username and/or Password are invalid)' ),
                   Mark: '22E89FB65D2B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_LOGIN_FAILED',
                               Message: await I18NManager.translate( context.Language, 'Login failed (Username and/or Password are invalid)' ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
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

      sourcePosition.method = this.name + "." + this.processSessionStatus.name;

      const strMark = "00FCA8D75EFC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 Message: await I18NManager.translate( context.Language, 'Unexpected error. Please read the server log for more details.' ),
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

  //{ SourceIPAddress: string, FrontendId: string, Language?: string, TimeZoneId?: string }
  static async login( context: any,
                      strUserName: string,
                      strPassword: string,
                      transaction: any,
                      logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      result = await SecurityServiceController.processSessionStatus( context,
                                                                     { operation: "UserLogin" },
                                                                     strUserName,
                                                                     strPassword,
                                                                     null,
                                                                     currentTransaction,
                                                                     logger );

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.login.name;

      const strMark = "B211BBDAF77B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 Message: await I18NManager.translate( context.Language, 'Unexpected error. Please read the server log for more details.' ),
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

  static async logout( strLanguage: string,
                       strToken: string,
                       transaction: any,
                       logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByToken( strToken,
                                                                                             currentTransaction,
                                                                                             logger ); //Find in the database

      if ( CommonUtilities.isNotNullOrEmpty( userSessionStatus ) ) {

        if ( strToken.startsWith( "p:" ) === false ) {

          /*
          const UserInfo = await SYSUserService.getById( userSessionStatus.UserId,
                                                         null,
                                                         null,
                                                         logger );
                                                         */

          //Delete from cache the other tokens
          await CacheManager.deleteData( userSessionStatus.Token, logger );
          userSessionStatus.BinaryDataToken ? await CacheManager.deleteData( userSessionStatus.BinaryDataToken, logger ): null;
          userSessionStatus.SocketToken ? await CacheManager.deleteData( userSessionStatus.SocketToken, logger ): null;

          userSessionStatus.LoggedOutBy = userSessionStatus.UserName; //UserInfo.Name;
          userSessionStatus.LoggedOutAt = SystemUtilities.getCurrentDateAndTime().format();

          userSessionStatus = await SystemUtilities.createOrUpdateUserSessionStatus( strToken,
                                                                                     ( userSessionStatus as any ).dataValues,
                                                                                     false,    //Set roles?
                                                                                     null,     //User group roles
                                                                                     null,     //User roles
                                                                                     true,     //Force update?
                                                                                     1,        //Only 1 try
                                                                                     7 * 1000, //Second
                                                                                     currentTransaction,
                                                                                     logger );

          if ( userSessionStatus instanceof Error ) {

            const error = userSessionStatus as any;

            result = {
                       StatusCode: 500, //Internal server error
                       Code: 'ERROR_UNEXPECTED',
                       Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                       Mark: "8D6DF9F3623E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: error.LogId,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_LOGOUT_FAILED',
                                   Message: await I18NManager.translate( strLanguage, 'Cannot complete the logout' ),
                                   Details: await SystemUtilities.processErrorDetails( error ) //error
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     };

          }
          else {

            NotificationManager.publishOnTopic( "SystemEvent",
                                                {
                                                  Name: "UserLogoutSuccess",
                                                  Token: userSessionStatus.Token,
                                                  UserId: userSessionStatus.UserId,
                                                  UserName: userSessionStatus.UserName,
                                                  UserGroupId: userSessionStatus.UserGroupId
                                                },
                                                logger );

            result = {
                       StatusCode: 200, //Ok
                       Code: 'SUCCESS_LOGOUT',
                       Message: await I18NManager.translate( strLanguage, 'Success logout' ),
                       Mark: '86B853E96517' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: false,
                       Errors: [],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     };

          }
          /*
          let lockedResource = null;

          try {

            //We need write the shared resource and going to block temporally the write access
            lockedResource = await CacheManager.lockResource( undefined, //Default = CacheManager.currentInstance,
                                                              SystemConstants._LOCK_RESOURCE_UPDATE_SESSION_STATUS + strToken,
                                                              7 * 1000, //7 seconds
                                                              1, //Only one try
                                                              undefined, //Default 5000 milliseconds
                                                              logger );

            if ( CommonUtilities.isNotNullOrEmpty( lockedResource ) ) { //Stay sure we had the resource locked

              await CacheManager.deleteData( strToken,
                                             logger ); //Delete the token in the central cache

              await SYSUserSessionStatusService.createOrUpdate( userSessionStatus.UserId,
                                                                strToken,
                                                                {
                                                                  UserId: userSessionStatus.UserId,
                                                                  Token: strToken,
                                                                  LoggedOutBy: UserInfo.Name,
                                                                  UpdatedBy: UserInfo.Name,
                                                                  UpdatedAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                                  LoggedOutAt: SystemUtilities.getCurrentDateAndTime().format()
                                                                },
                                                                true,
                                                                null,
                                                                logger ); //Refresh the LoggedOutBy, LoggedOutAt, UpdatedAt field in central db

              await CacheManager.unlockResource( lockedResource,
                                                 logger );

              result = {
                         StatusCode: 200, //Ok
                         Code: 'SUCCESS_LOGOUT',
                         Message: await I18NManager.translate( strLanguage, 'Success logout' ),
                         Mark: '86B853E96517' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

            const strMark = "2EBC43CE5C63" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                        Code: 'ERROR_LOGOUT_FAILED',
                        Message: await I18NManager.translate( strLanguage, 'Cannot complete the logout' ),
                        Mark: strMark,
                        LogId: error.LogId,
                        IsError: true,
                        Errors: [
                                  {
                                    Code: 'ERROR_LOGOUT_FAILED',
                                    Message: await I18NManager.translate( strLanguage, 'Cannot complete the logout' ),
                                    Details: await SystemUtilities.processErrorDetails( error ) //error
                                  }
                                ],
                        Warnings: [],
                        Count: 0,
                        Data: []
                    };

          }
          */

        }
        else {

          result = {
                      StatusCode: 400, //Bad request
                      Code: 'ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT',
                      Message: await I18NManager.translate( strLanguage, 'Authorization token provided is persistent. You cannot made logout' ),
                      Mark: '2EA2C0E7ACEF' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                      LogId: null,
                      IsError: true,
                      Errors: [
                                {
                                  Code: 'ERROR_AUTHORIZATION_TOKEN_IS_PERSISTENT',
                                  Message: await I18NManager.translate( strLanguage, 'Authorization token provided is persistent. You cannot made logout' ),
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
                   Message: await I18NManager.translate( strLanguage, 'Authorization token provided is invalid' ),
                   Mark: '3EF6C35B0645' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_INVALID_AUTHORIZATION_TOKEN',
                               Message: await I18NManager.translate( strLanguage, 'Authorization token provided is invalid' ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                };

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.logout.name;

      const strMark = "2D5BBA7D7BDF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async tokenCheck( strLanguage: string,
                           strToken: string,
                           transaction: any,
                           logger: any ): Promise<any> {

    NotificationManager.publishOnTopic( "SystemEvent",
                                        {
                                          Name: "UserTokenCheckSuccess",
                                          Token: strToken
                                        },
                                        logger );

    const result = {
                     StatusCode: 200, //Ok
                     Code: 'SUCCESS_TOKEN_IS_VALID',
                     Message: await I18NManager.translate( strLanguage, 'The token is valid' ),
                     Mark: '789A41A512E5' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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