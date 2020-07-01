import cluster from 'cluster';

import {
  Request,
  //json,
} from 'express';

import CommonConstants from '../../../common/CommonConstants';
import SystemConstants from "../../../common/SystemContants";

import CommonUtilities from "../../../common/CommonUtilities";
import SystemUtilities from "../../../common/SystemUtilities";

import I18NManager from "../../../common/managers/I18Manager";
import NotificationManager from "../../../common/managers/NotificationManager";
import DBConnectionManager from "../../../common/managers/DBConnectionManager";
import GeoMapManager from '../../../common/managers/GeoMapManager';

import SecurityServiceController from './SecurityService.controller';
import UserOthersServiceController from "./UserOthersService.controller";

import SYSUserService from "../../../common/database/master/services/SYSUserService";
import SYSUserGroupService from "../../../common/database/master/services/SYSUserGroupService";
import SYSPersonService from '../../../common/database/master/services/SYSPersonService';

import { SYSUser } from "../../../common/database/master/models/SYSUser";
import { SYSUserGroup } from "../../../common/database/master/models/SYSUserGroup";

const debug = require( 'debug' )( 'UserCreateServiceController' );

export default class UserCreateServiceController {

  static readonly _ID = "UserCreateServiceController";

  static async createUser( request: Request,
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

      let userSessionStatus = context.UserSessionStatus;

      let resultCheckUserRoles = null;

      let sysUserGroupInDB: SYSUserGroup = null;

      let sysUserInDB: SYSUser = null;

      let userRules = {
                        Avatar: [ 'present', 'string', 'min:36' ],
                        Name: [ 'required', 'min:3', 'regex:/^[a-zA-Z0-9\#\@\.\_\-]+$/g' ],
                        //UserGroupId: [ 'present', 'string', 'min:36' ],
                        //UserGroupSId: [ 'present', 'string', 'min:8' ],
                        //UserGroup: [ 'present', 'string', 'min:3' ],
                        //CreateGroup: [ 'present', 'boolean' ],
                        ExpireAt: [ 'present', 'date' ],
                        Notify: [ 'present', 'min:3' ],
                        ForceChangePassword: [ 'present', 'boolean' ],
                        ChangePasswordEvery: [ 'present', 'integer', 'min:0' ],
                        SessionsLimit: [ 'present', 'integer', 'min:0' ],
                        sysUserGroup: {
                                        Create: [ 'required', 'boolean' ],
                                        Id: [ 'present', 'string', 'min:36' ],
                                        Name: [ 'present', 'min:3', 'regex:/^[a-zA-Z0-9\#\@\.\_\-]+$/g' ],
                                        Role: [ 'present', 'string' ],
                                        Tag: [ 'present', 'string' ],
                                      },
                        sysPerson: [ 'present' ],
                        Business: [ 'present' ],
                      };

      let validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                 userRules,
                                                                 null,
                                                                 logger );

      if ( validator.passes() ) { //Validate request.body field values

        delete request.body.CreatedBy;
        delete request.body.CreatedAt;
        delete request.body.UpdatedBy;
        delete request.body.UpdatedAt;
        delete request.body.ExtraData;

        if ( request.body.DisabledBy !== "0" &&
             request.body.DisabledBy !== "1" ) {

          delete request.body.DisabledBy;

        }

        delete request.body.DisabledAt;
        delete request.body.ExtraData;

        delete request.body.sysUserGroup.CreatedBy;
        delete request.body.sysUserGroup.CreatedAt;
        delete request.body.sysUserGroup.UpdatedBy;
        delete request.body.sysUserGroup.UpdatedAt;
        delete request.body.sysUserGroup.DisableBy;
        delete request.body.sysUserGroup.DisableAt;
        delete request.body.sysUserGroup.ExtraData;

        sysUserInDB = await SYSUserService.getByName( request.body.Name,
                                                      null,
                                                      currentTransaction,
                                                      logger );

        if ( !sysUserInDB ) {

          const strPassword = request.body.Password;

          //ANCHOR check password Strength (createUser)
          const strTag = "#" + request.body.Name + "#,#" + request.body.sysUserGroup.Name + "#,#" + request.body.sysUserGroup.Id + "#,#" + request.body.sysUserGroup.ShortId + "#";

          const passwordStrengthParameters = await SecurityServiceController.getConfigPasswordStrengthParameters( strTag,
                                                                                                                  currentTransaction,
                                                                                                                  logger );

          const checkPasswordStrengthResult = await SecurityServiceController.checkPasswordStrength( passwordStrengthParameters,
                                                                                                     strPassword,
                                                                                                     logger );

          if ( checkPasswordStrengthResult.code === 1 ) {

            const strUserName = context.UserSessionStatus.UserName;

            let bIsAuthorizedCreateGroup = userSessionStatus.Role.includes( "#CreateUserGroupL01#" );

            let bIsAllowedAddInDisabledGroup = userSessionStatus.Role.includes( "#AllowAddInDisabledGroupL01#" );

            if ( !request.body.sysUserGroup.Id &&
                 !request.body.sysUserGroup.ShortId &&
                 !request.body.sysUserGroup.Name ) {

              if ( userSessionStatus.Role &&
                   userSessionStatus.Role.includes( "#Master_L01#" ) &&
                   request.body.sysUserGroup.Create === false ) {

                request.body.sysUserGroup.Name = userSessionStatus.UserGroupName; //Create the user in the same group

              }
              else {

                request.body.sysUserGroup.Name = request.body.Name;

              }

            }

            //ANCHOR checkUserGroupRoleLevel
            resultCheckUserRoles = UserOthersServiceController.checkUserGroupRoleLevel( userSessionStatus,
                                                                                        {
                                                                                          Id: request.body.sysUserGroup.Id,
                                                                                          ShortId: request.body.sysUserGroup.ShortId,
                                                                                          Name: request.body.sysUserGroup.Name
                                                                                        },
                                                                                        "CreateUser",
                                                                                        logger );

            if ( resultCheckUserRoles.isAuthorizedAdmin ) {

              bIsAuthorizedCreateGroup = request.body.sysUserGroup.Create === true;

              bIsAllowedAddInDisabledGroup = true;

            }
            else if ( !resultCheckUserRoles.isAuthorizedL03 &&
                      !resultCheckUserRoles.isAuthorizedL01 ) {

              resultCheckUserRoles.isNotAuthorized = true;

            }

            sysUserGroupInDB = await SYSUserGroupService.getBy( {
                                                                  Id: request.body.sysUserGroup.Id,
                                                                  ShortId: request.body.sysUserGroup.ShortId,
                                                                  Name: request.body.sysUserGroup.Name || request.body.Name
                                                                },
                                                                null,
                                                                currentTransaction,
                                                                logger );

            if ( resultCheckUserRoles.isNotAuthorized ) {

              result = {
                         StatusCode: 403, //Forbidden
                         Code: 'ERROR_CANNOT_CREATE_USER',
                         Message: await I18NManager.translate( strLanguage, 'Not allowed to create the user' ),
                         Mark: 'EDF5D29CE61C' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_CANNOT_CREATE_USER',
                                     Message: await I18NManager.translate( strLanguage, 'Not allowed to create the user' ),
                                     Details: null,
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( sysUserGroupInDB instanceof Error ) {

              const error = sysUserGroupInDB;

              result = {
                         StatusCode: 500, //Internal server error
                         Code: 'ERROR_UNEXPECTED',
                         Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                         Mark: 'F82A2A732532' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
            else if ( sysUserGroupInDB &&
                      SYSUserGroupService.checkDisabled( sysUserGroupInDB ) &&
                      bIsAllowedAddInDisabledGroup === false ) {

              result = {
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_USER_GROUP_DISABLED',
                         Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled.', sysUserGroupInDB.Name ),
                         Mark: 'A9FBA806248A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_DISABLED',
                                     Message: await I18NManager.translate( strLanguage, 'The user group %s is disabled.', sysUserGroupInDB.Name ),
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( sysUserGroupInDB &&
                      SYSUserGroupService.checkExpired( sysUserGroupInDB ) &&
                      bIsAllowedAddInDisabledGroup === false ) {

              result = {
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_USER_GROUP_EXPIRED',
                         Message: await I18NManager.translate( strLanguage, 'The user group %s is expired.', sysUserGroupInDB.Name ),
                         Mark: 'C70A2903EC1F' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_EXPIRED',
                                     Message: await I18NManager.translate( strLanguage, 'The user group %s is expired.', sysUserGroupInDB.Name ),
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( sysUserGroupInDB &&
                      request.body.sysUserGroup.Create ) {

              result = {
                         StatusCode: 400, //Bad request
                         Code: 'ERROR_USER_GROUP_ALREADY_EXISTS',
                         Message: await I18NManager.translate( strLanguage, 'The user group %s already exists.', sysUserGroupInDB.Name ),
                         Mark: '5C5B23E9219A' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_ALREADY_EXISTS',
                                     Message: await I18NManager.translate( strLanguage, 'The user group %s already exists.', sysUserGroupInDB.Name ),
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( !sysUserGroupInDB &&
                      request.body.sysUserGroup.Create === false ) {

              const strMessage = await UserOthersServiceController.getMessageUserGroup( strLanguage, {
                                                                                                       Id: request.body.sysUserGroup.Id,
                                                                                                       ShortId: request.body.sysUserGroup.ShortId,
                                                                                                       Name: request.body.sysUserGroup.Name
                                                                                                     } );

              result = {
                         StatusCode: 404, //Not found
                         Code: 'ERROR_USER_GROUP_NOT_FOUND',
                         Message: strMessage,
                         Mark: 'C0171BD3B328' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_NOT_FOUND',
                                     Message: strMessage,
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( !sysUserGroupInDB &&
                      request.body.sysUserGroup.Create &&
                      bIsAuthorizedCreateGroup === true &&
                      !request.body.sysUserGroup.Id &&
                      !request.body.sysUserGroup.ShortId &&
                      !request.body.sysUserGroup.Name ) {

              result = {
                         StatusCode: 403, //Forbidden
                         Code: 'ERROR_USER_GROUP_INVALID',
                         Message: await I18NManager.translate( strLanguage, 'The user group is invalid.' ),
                         Mark: '5EBD3F13F67B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_USER_GROUP_INVALID',
                                     Message: await I18NManager.translate( strLanguage, 'The user group is invalid.' ),
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( !sysUserGroupInDB &&
                      request.body.sysUserGroup.Create &&
                      bIsAuthorizedCreateGroup === false ) {

              result = {
                         StatusCode: 403, //Forbidden
                         Code: 'ERROR_CANNOT_CREATE_USER_GROUP',
                         Message: await I18NManager.translate( strLanguage, 'The creation of user group is forbidden.' ),
                         Mark: '5EBD3F13F67B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_CANNOT_CREATE_USER_GROUP',
                                     Message: await I18NManager.translate( strLanguage, 'The creation of user group is forbidden.' ),
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       }

            }
            else if ( !sysUserGroupInDB &&
                      request.body.sysUserGroup.Create &&
                      bIsAuthorizedCreateGroup ) {

              let strRoleToApply = await UserOthersServiceController.getConfigUserGroupAutoAssignRole( "create",
                                                                                                       userSessionStatus.Role,
                                                                                                       request.body.Name,
                                                                                                       currentTransaction,
                                                                                                       logger );

              if ( resultCheckUserRoles.isAuthorizedAdmin &&
                   request.body.Role ) {

                strRoleToApply = SystemUtilities.mergeTokens( request.body.sysUserGroup.Role,
                                                              strRoleToApply,
                                                              true,
                                                              logger );

              }

              sysUserGroupInDB = await SYSUserGroupService.createOrUpdate(
                                                                           {
                                                                             Name: request.body.sysUserGroup.Name,
                                                                             Comment: request.body.Comment,
                                                                             Role: strRoleToApply ? strRoleToApply: null,
                                                                             Tag: resultCheckUserRoles.isAuthorizedAdmin && request.body.sysUserGroup.Tag ? request.body.sysUserGroup.Tag: null,
                                                                             ExtraData: request.body.sysUserGroup.Business ? CommonUtilities.jsonToString( { Business: request.body.sysUserGroup.Business }, logger ): null,
                                                                             CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                             CreatedAt: null
                                                                           },
                                                                           false,
                                                                           currentTransaction,
                                                                           logger
                                                                         );

              if ( sysUserGroupInDB instanceof Error ) {

                const error = sysUserGroupInDB;

                result = {
                           StatusCode: 500, //Internal server error
                           Code: 'ERROR_UNEXPECTED',
                           Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                           Mark: '8DBA87D7ABE2' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

            }

            if ( !result ) {

              let personData = {} as any;

              personData.CreatedBy = strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET;
              personData.CreatedAt = null;

              let rules = {
                            Title: [ 'present', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            FirstName: [ 'required', 'min:2', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            LastName: [ 'present', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            NickName: [ 'present', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            Abbreviation: [ 'present', 'min:1', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\sñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            Gender: [ 'present', 'between:0,100' ],
                            BirthDate: 'present|dateInFormat01', //<-- dateInFormat01 is a custom validator defined in SystemUtilities.createCustomValidatorSync
                            Address: [ 'present', 'min:10', 'regex:/^[a-zA-Z0-9\#\@\.\_\-\\s\:\,ñÑáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]+$/g' ],
                            EMail: 'required|emailList', //<-- emailList is a custom validator defined in SystemUtilities.createCustomValidatorSync
                            Phone: 'present|phoneUSList', //<-- phoneUSList is a custom validator defined in SystemUtilities.createCustomValidatorSync
                          };

              validator = SystemUtilities.createCustomValidatorSync( request.body.sysPerson,
                                                                     rules,
                                                                     null,
                                                                     logger );

              if ( validator.passes() ) { //Validate request.body field values

                delete request.body.sysPerson.CreatedBy;
                delete request.body.sysPerson.CreatedAt;
                delete request.body.sysPerson.UpdatedBy;
                delete request.body.sysPerson.UpdatedAt;
                delete request.body.sysPerson.ExtraData;

                personData.Title = request.body.sysPerson.Title ? request.body.sysPerson.Title : personData.Title;
                personData.FirstName = request.body.sysPerson.FirstName ? CommonUtilities.normalizeWhitespaces( request.body.sysPerson.FirstName ) : personData.FirstName;
                personData.LastName = request.body.sysPerson.LastName ? CommonUtilities.normalizeWhitespaces( request.body.sysPerson.LastName ): personData.LastName;
                personData.NickName = request.body.sysPerson.NickName ? request.body.sysPerson.NickName : personData.NickName;

                if ( request.body.Abbreviation ) {

                  personData.Abbreviation = request.body.sysPerson.Abbreviation;

                }
                else if ( !personData.Abbreviation ) {

                  const fistNameAbbreviation = CommonUtilities.getFirstLetters( request.body.sysPerson.FirstName );
                  const lastNameAbbreviation = CommonUtilities.getFirstLetters( request.body.sysPerson.LastName );

                  personData.Abbreviation = fistNameAbbreviation.join( "" ) + lastNameAbbreviation.join( "" );

                }

                personData.Gender = request.body.sysPerson.Gender && parseInt( request.body.sysPerson.Gender ) >= 0 ? request.body.sysPerson.Gender : personData.Gender;
                personData.BirthDate = request.body.sysPerson.BirthDate ? request.body.sysPerson.BirthDate : personData.BirthDate;
                personData.EMail = request.body.sysPerson.EMail; // ? request.body.sysPerson.EMail : null;
                personData.Phone = request.body.sysPerson.Phone ? request.body.sysPerson.Phone : null;
                personData.Address = request.body.sysPerson.Address ? request.body.sysPerson.Address : personData.Address;

                if ( personData.Address &&
                     await GeoMapManager.getConfigServiceType( "geocode", logger ) !== "@__none__@" ) {

                  const geocodeResult = await GeoMapManager.geocodeServiceUsingAddress( [ personData.Address ],
                                                                                        true,
                                                                                        logger );

                  if ( !geocodeResult ||
                       geocodeResult.length === 0 ||
                       ( geocodeResult[ 0 ].formattedAddressParts &&
                         geocodeResult[ 0 ].formattedAddressParts.length < 4 ) ) {

                    personData.Tag = CommonUtilities.addTag( personData.Tag, "#ADDRESS_NOT_FOUND#" );

                  }
                  else {

                    personData.Address = geocodeResult[ 0 ].formattedAddress;
                    personData.Tag = CommonUtilities.removeTag( personData.Tag, "#ADDRESS_NOT_FOUND#" );

                  }

                  if ( resultCheckUserRoles.isAuthorizedAdmin &&
                       request.body.sysPerson.Tag ) {

                    if ( !personData.Tag ) {

                      personData.Tag = request.body.sysPerson.Tag;

                    }
                    else {

                      personData.Tag = personData.Tag + "," + request.body.sysPerson.Tag;

                    }

                  }

                }

                if ( request.body.sysPerson.Business ) {

                  personData.ExtraData = CommonUtilities.jsonToString( { Business: request.body.sysPerson.Business }, logger );

                }

                const sysPersonInDB = await SYSPersonService.createOrUpdate( personData,
                                                                             true,
                                                                             currentTransaction,
                                                                             logger );

                if ( sysPersonInDB &&
                     sysPersonInDB instanceof Error === false ) {

                  let strRoleToApply = await UserOthersServiceController.getConfigUserAutoAssignRole( "create",
                                                                                                      userSessionStatus.Role,
                                                                                                      sysUserGroupInDB.Name,
                                                                                                      currentTransaction,
                                                                                                      logger );

                  if ( resultCheckUserRoles.isAuthorizedAdmin &&
                       request.body.Role ) {

                    strRoleToApply = SystemUtilities.mergeTokens( request.body.Role,
                                                                  strRoleToApply,
                                                                  true,
                                                                  logger );

                  }

                  //ANCHOR create new user
                  sysUserInDB = await SYSUserService.createOrUpdate(
                                                                     {
                                                                       Id: sysPersonInDB.Id,
                                                                       PersonId: sysPersonInDB.Id,
                                                                       GroupId: sysUserGroupInDB.Id,
                                                                       Name: request.body.Name,
                                                                       Password: request.body.Password,
                                                                       Role: strRoleToApply ? strRoleToApply : null, //resultCheckUserRoles.isAuthorizedAdmin && request.body.Role !== undefined ? request.body.Role: null,
                                                                       Tag: resultCheckUserRoles.isAuthorizedAdmin && request.body.Tag !== undefined ? request.body.Tag: null,
                                                                       ForceChangePassword: request.body.ForceChangePassword,
                                                                       ChangePasswordEvery: request.body.ChangePasswordEvery,
                                                                       SessionsLimit: request.body.SessionsLimit,
                                                                       ExtraData: request.body.Business ? CommonUtilities.jsonToString( { Business: request.body.Business }, logger ): null,
                                                                       ExpireAt: request.body.ExpireAt ? SystemUtilities.getCurrentDateAndTimeFrom( request.body.ExpireAt ).format(): null,
                                                                       Comment: request.body.Comment,
                                                                       CreatedBy: strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                       CreatedAt: null,
                                                                       DisabledBy: request.body.DisabledBy === "1"? "1@" + strUserName: "0"
                                                                     },
                                                                     false,
                                                                     currentTransaction,
                                                                     logger
                                                                   );

                  if ( sysUserInDB &&
                       sysUserInDB instanceof Error === false ) {

                    const warnings = [];

                    if ( request.body.Notify ) {

                      const transportList = request.body.Notify.split( "," );

                      if ( transportList.includes( "email" ) ) {

                        //ANCHOR send email success
                        const configData = await UserOthersServiceController.getConfigGeneralDefaultInformation( currentTransaction,
                                                                                                                 logger );

                        const strTemplateKind = await UserOthersServiceController.isWebFrontendClient( context.FrontendId,
                                                                                                       currentTransaction,
                                                                                                       logger ) ? "web" : "mobile";

                        const strWebAppURL = await UserOthersServiceController.getConfigFrontendRules( context.FrontendId,
                                                                                                       "url",
                                                                                                       currentTransaction,
                                                                                                       logger );

                        if ( await NotificationManager.send(
                                                             "email",
                                                             {
                                                               from: configData[ "no_response_email" ] || "no-response@no-response.com",
                                                               to: personData.EMail,
                                                               subject: await I18NManager.translate( strLanguage, "USER ACCOUNT CREATION SUCCESS" ),
                                                               body: {
                                                                       kind: "template",
                                                                       file: `email-user-creation-${strTemplateKind}.pug`,
                                                                       language: context.Language,
                                                                       variables: {
                                                                                    user_name: request.body.Name,
                                                                                    user_email: request.body.EMail,
                                                                                    user_phone: request.body.Phone,
                                                                                    user_password: request.body.Password,
                                                                                    web_app_url: strWebAppURL,
                                                                                    ... configData
                                                                                  }
                                                                       //kind: "embedded",
                                                                       //text: "Hello",
                                                                       //html: "<b>Hello</b>"
                                                                     }
                                                             },
                                                             logger
                                                           ) === false ) {

                          warnings.push(
                                         {
                                           Code: "WARNING_CANNOT_SEND_EMAIL",
                                           Message: await I18NManager.translate( strLanguage, "Cannot send the notification email to the user" ),
                                           Details: {
                                                      Reason: await I18NManager.translate( strLanguage, "The transport returned false" )
                                                    }
                                         }
                                       );

                        }

                      }

                      if ( transportList.includes( "sms" ) ) {

                        if ( personData.Phone ) {

                          if ( await NotificationManager.send(
                                                               "sms",
                                                               {
                                                                 to: personData.Phone,
                                                                 //context: "AMERICA/NEW_YORK",
                                                                 foreign_data: `{ "user": ${strUserName || SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET}  }`,
                                                                 //device_id: "*",
                                                                 body: {
                                                                         kind: "self",
                                                                         text: await I18NManager.translate( strLanguage, 'User account creation success.\n%s\n%s', request.body.Name, request.body.Password )
                                                                       }
                                                               },
                                                               logger
                                                             ) === false ) {

                            warnings.push(
                                           {
                                             Code: "WARNING_CANNOT_SEND_SMS",
                                             Message: await I18NManager.translate( strLanguage, "Cannot send the notification sms to the user" ),
                                             Details: {
                                                        Reason: await I18NManager.translate( strLanguage, "The transport returned false" )
                                                      }
                                           }
                                         );

                          }

                        }
                        else {

                          warnings.push(
                                         {
                                           Code: "WARNING_CANNOT_SEND_SMS",
                                           Message: await I18NManager.translate( strLanguage, "Cannot send the notification sms to the user" ),
                                           Details: {
                                                      Reason: await I18NManager.translate( strLanguage, "The transport returned false" )
                                                    }
                                         }
                                       );

                        }

                      }

                    }

                    sysUserInDB = await SYSUserService.getById( sysUserInDB.Id,
                                                                null,
                                                                currentTransaction,
                                                                logger );

                    let modelData = ( sysUserInDB as any ).dataValues;

                    const tempModelData = await SYSUser.convertFieldValues(
                                                                            {
                                                                              Data: modelData,
                                                                              FilterFields: 1, //Force to remove fields like password and value
                                                                              TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                              Include: null, //[ { model: SYSUser } ],
                                                                              Exclude: null, //[ { model: SYSUser } ],
                                                                              Logger: logger,
                                                                              ExtraInfo: {
                                                                                           Request: request
                                                                                         }
                                                                            }
                                                                          );

                    if ( tempModelData ) {

                      modelData = tempModelData;

                    }

                    //ANCHOR success user create
                    result = {
                               StatusCode: 200, //Ok
                               Code: 'SUCCESS_USER_CREATE',
                               Message: await I18NManager.translate( strLanguage, 'Success user create.' ),
                               Mark: 'B9779ACDB9EB' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: null,
                               IsError: false,
                               Errors: [],
                               Warnings: warnings,
                               Count: 1,
                               Data: [
                                       modelData
                                     ]
                             }

                    bApplyTransaction = true;

                  }
                  else {

                    const error = sysUserInDB as any;

                    result = {
                               StatusCode: 500, //Internal server error
                               Code: 'ERROR_UNEXPECTED',
                               Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                               Mark: 'C4B8A26D4B57' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

                }
                else {

                  const error = sysPersonInDB as any;

                  result = {
                             StatusCode: 500, //Internal server error
                             Code: 'ERROR_UNEXPECTED',
                             Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                             Mark: '8E230246A1AD' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

              }
              else {

                result = {
                           StatusCode: 400, //Bad request
                           Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                           Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid. Inside of sysPerson' ),
                           Mark: 'E905A810E2D0' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                                       Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid. Inside of sysPerson' ),
                                       Details: validator.errors.all()
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         }

              }

            }

          }
          else {

            //ANCHOR password not valid (createUser)
            result = {
                       StatusCode: 400, //Bad request
                       Code: 'ERROR_PASSWORD_NOT_VALID',
                       Message: await I18NManager.translate( strLanguage, 'The password is not valid' ),
                       Mark: 'F9F02C3E2859' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
        else if ( sysUserInDB instanceof Error ) {

          const error = sysUserInDB as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: 'ERROR_UNEXPECTED',
                     Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                     Mark: '726AB9ABEFE9' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
        else {

          result = {
                     StatusCode: 400, //Bad request
                     Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                     Message: await I18NManager.translate( strLanguage, 'The user name %s already exists.', request.body.Name ),
                     Mark: '61B8AA67F498' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_NAME_ALREADY_EXISTS',
                                 Message: await I18NManager.translate( strLanguage, 'The user name %s already exists.', request.body.Name ),
                                 Details: validator.errors.all()
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
                   Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                   Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid' ),
                   Mark: '78706654C68B' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_FIELD_VALUES_ARE_INVALID',
                               Message: await I18NManager.translate( strLanguage, 'One or more field values are invalid' ),
                               Details: validator.errors.all()
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

      sourcePosition.method = this.name + "." + this.createUser.name;

      const strMark = "F754B87531BC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
