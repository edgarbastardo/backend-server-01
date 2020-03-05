import cluster from 'cluster';

//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import {
  //Router,
  Request,
  //Response,
  //NextFunction
} from 'express';

//import bcrypt from 'bcrypt';
//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

//import SystemConstants from "../../common/SystemContants";

import CommonUtilities from "../../common/CommonUtilities";
import SystemUtilities from "../../common/SystemUtilities";

//import { Role } from "../models/Role";
//import { User } from "../../common/database/models/User";
//import { UserSessionStatus } from "../models/UserSessionStatus";
//import { UserGroup } from "../../common/database/models/UserGroup";
//import { Person } from "../../common/database/models/Person";
//import UserSessionStatusService from "../../common/database/services/UserSessionStatusService";
//import CacheManager from "../../common/managers/CacheManager";
//import { PasswordParameters } from "./SecurityService.controller";
//import { UserSignup } from "../../common/database/models/UserSignup";
//import { UserSessionStatus } from "../../common/database/models/UserSessionStatus";
import DBConnectionManager from '../../common/managers/DBConnectionManager';
//import SYSConfigValueDataService from "../../common/database/services/SYSConfigValueDataService";
//import SYSUserService from "../../common/database/services/SYSUserService";
import CommonConstants from "../../common/CommonConstants";
//import SecurityServiceController from "./SecurityService.controller";
import SYSUserGroupService from "../../common/database/services/SYSUserGroupService";
//import NotificationManager from "../../common/managers/NotificationManager";
//import SYSUserSignupService from "../../common/database/services/SYSUserSignupService";
//import CipherManager from "../../common/managers/CipherManager";
//import SYSPersonService from "../../common/database/services/SYSPersonService";
import I18NManager from "../../common/managers/I18Manager";
import SYSUserSessionStatusService from '../../common/database/services/SYSUserSessionStatusService';
//import SYSActionTokenService from "../../common/database/services/SYSActionTokenService";
//import JobQueueManager from "../../common/managers/JobQueueManager";
//import SYSUserSessionStatusService from '../../common/database/services/SYSUserSessionStatusService';
//import GeoMapGoogle from "../../common/implementations/geomaps/GeoMapGoogle";
//import GeoMapManager from "../../common/managers/GeoMapManager";
//import { SYSUser } from "../../common/database/models/SYSUser";
//import { ModelToRestAPIServiceController } from './ModelToRestAPIService.controller';
//import { SYSPerson } from '../../common/database/models/SYSPerson';
//import { SYSUserGroup } from "../../common/database/models/SYSUserGroup";

const debug = require( 'debug' )( 'SystemServiceController' );

export default class SystemServiceController {

  static readonly _ID = "SystemServiceController";

  static async getStatus( request: Request,
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

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      /*
      let userSessionStatus = context.UserSessionStatus;

      let bProfileOfAnotherUser = false;

      let strAuthorization = context.Authorization;

      if ( context.UserSessionStatus.Role.includes( "#Administrator#" ) ||
           context.UserSessionStatus.Role.includes( "#BManagerL99#" ) ) {

        if ( request.query.shortToken ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByShortToken( request.query.shortToken,
                                                                                                  currentTransaction,
                                                                                                  logger );

          strAuthorization = request.query.shortToken;

        }
        else if ( request.query.token ) {

          bProfileOfAnotherUser = true;

          userSessionStatus = await SYSUserSessionStatusService.getUserSessionStatusByToken( request.query.token,
                                                                                             currentTransaction,
                                                                                             logger );

          strAuthorization = request.query.token;

        }

      }

      if ( bProfileOfAnotherUser &&
           userSessionStatus === null ) {

        result = {
                   StatusCode: 404, //Not found
                   Code: 'ERROR_USER_SESSION_NOT_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAuthorization ),
                   Mark: 'A27B33E165F1' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_USER_SESSION_NOT_FOUND',
                               Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAuthorization ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else if ( bProfileOfAnotherUser &&
                userSessionStatus instanceof Error ) {

        const error = userSessionStatus;

        result = {
                   StatusCode: 404, //Not found
                   Code: 'ERROR_USER_SESSION_NOT_FOUND',
                   Message: await I18NManager.translate( strLanguage, 'The session for the token %s not found', strAuthorization ),
                   Mark: '8EF2F7BCEADB' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        let routes = await SYSRoleHasRouteService.listRoutesOfRoles( userSessionStatus.Role,
                                                                     context.FrontendId,
                                                                     request.query.format,
                                                                     currentTransaction,
                                                                     logger );

        let intCount = 0;

        if ( routes ) {

          if ( request.query.format === "1" ) {

            intCount = routes.length;

          }
          else {

            intCount = Object.keys( routes ).length;

          }

        }

        result = {
                   StatusCode: 200, //Ok
                   Code: 'SUCCESS_GET_ROUTES',
                   Message: await I18NManager.translate( strLanguage, 'Success get routes' ),
                   Mark: '29DB5C3384E6' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: intCount,
                   Data: routes
                 }

        bApplyTransaction = true;

      }
      */

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

      sourcePosition.method = this.name + "." + this.getStatus.name;

      const strMark = "9BF93C78A920" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
