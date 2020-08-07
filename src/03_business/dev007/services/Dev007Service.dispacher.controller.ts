import cluster from "cluster";

import {
  Request,
  Response
} from "express";

import CommonConstants from "../../../02_system/common/CommonConstants";

import SystemUtilities from "../../../02_system/common/SystemUtilities";
import CommonUtilities from "../../../02_system/common/CommonUtilities";

import DBConnectionManager from "../../../02_system/common/managers/DBConnectionManager";
import BaseService from "../../../02_system/common/database/master/services/BaseService";
import I18NManager from "../../../02_system/common/managers/I18Manager";
import BIZDriverStatusService from "../../common/database/master/services/BIZDriverStatusService";

import { BIZDriverStatus } from "../../common/database/master/models/BIZDriverStatus";
import { SYSUser } from "../../../02_system/common/database/master/models/SYSUser";
import BIZDriverPositionService from "../../common/database/master/services/BIZDriverPositionService";
import InstantMessageServerManager from "../../../02_system/common/managers/InstantMessageServerManager";

const debug = require( "debug" )( "Dev007DispatcherServicesController" );

export default class Dev007DispatcherServicesController extends BaseService {

  //Common business services

  static async getPosition( request: Request,
                            response: Response,
                            transaction: any,
                            logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by MiddlewareManager.middlewareSetContext function

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let userSessionStatus = context.UserSessionStatus;

      let validationRules = {
                              start: [ "present", "date" ],
                              end: [ "present", "date" ],
                              limit: [ "present", "integer", "min:1", "max:25" ],
                            };

      let validator = SystemUtilities.createCustomValidatorSync( request.query,
                                                                 validationRules,
                                                                 null,
                                                                 logger );

      if ( validator.passes() ) { //Validate request.query field values

        let lastDriverPositionList = [];

        const resultData = await InstantMessageServerManager.getChannelMembers( "Drivers",
                                                                                null, //Take from config
                                                                                logger );

        if ( resultData &&
             resultData.body?.StatusCode === 200 &&
             resultData.body?.Code === "SUCCESS_GET_CHANNEL_MEMBERS" &&
             resultData.body?.Data?.length > 0 ) {

          const membersList = resultData.body?.Data[ 0 ]?.Data?.Drivers || [];

          //const strMark = "4CF857368F0B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

          //const debugMark = debug.extend( strMark );

          for ( let intIndex = 0; intIndex < membersList.length; intIndex++ ) {

            //debugMark( "member: %O",  membersList[ intIndex ] );

            const driver = {
                             SupportToken: membersList[ intIndex ].ShortAuth,
                             Id: membersList[ intIndex ].Id,
                             Avatar: membersList[ intIndex ].Avatar,
                             Name: membersList[ intIndex ].Name,
                             FirstName: membersList[ intIndex ].FirstName,
                             LastName: membersList[ intIndex ].LastName,
                             Device: membersList[ intIndex ].Device,
                             JoinedAt: membersList[ intIndex ].JoinedAt,
                             Positions: []
                           };

            driver.Positions = await BIZDriverPositionService.getLastPositionByShortToken(
                                                                                           membersList[ intIndex ].ShortAuth,
                                                                                           request.query.start as string,
                                                                                           request.query.end as string,
                                                                                           parseInt( request.query.limit as string ),
                                                                                           1, //Kind = 1 (Simple only basic field)
                                                                                           currentTransaction,
                                                                                           logger
                                                                                         );

            lastDriverPositionList.push( driver );

          };

          /*
          if ( !request.query.session ||
              ( request.query.session as string ).toLowerCase() === "current" ) {

            lastDriverPositionList = await BIZDriverPositionService.getLastPositionByShortToken(
                                                                                                userSessionStatus.ShortToken,
                                                                                                request.query.start as string,
                                                                                                request.query.end as string,
                                                                                                parseInt( request.query.limit as string ),
                                                                                                currentTransaction,
                                                                                                logger
                                                                                              );

          }
          else {

            lastDriverPositionList = await BIZDriverPositionService.getLastPositionByUserId(
                                                                                            userSessionStatus.UserId,
                                                                                            request.query.start as string,
                                                                                            request.query.end as string,
                                                                                            parseInt( request.query.limit as string ),
                                                                                            currentTransaction,
                                                                                            logger
                                                                                          );

          }
          */

          if ( lastDriverPositionList &&
              lastDriverPositionList instanceof Error === false ) {

            result = {
                       StatusCode: 200, //Ok
                       Code: "SUCCESS_GET_DRIVER_POSITION",
                       Message: await I18NManager.translate( strLanguage, "Success get driver position." ),
                       Mark: "E99828F818C6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: false,
                       Errors: [],
                       Warnings: [],
                       Count: lastDriverPositionList.length,
                       Data: lastDriverPositionList
                     };

            bApplyTransaction = true;

          }
          else {

            const error = lastDriverPositionList as any;

            result = {
                       StatusCode: 500, //Internal server error
                       Code: "ERROR_UNEXPECTED",
                       Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                       Mark: "2DC29DF23598" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
        else if ( !resultData ) {

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_NO_REPONSE_FROM_IM_MANAGER",
                     Message: await I18NManager.translate( strLanguage, "No response from IM-Manager remote end point" ),
                     Mark: "3DC183A38542" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_NO_REPONSE_FROM_IM_MANAGER",
                                 Message: await I18NManager.translate( strLanguage, "No response from IM-Manager remote end point" ),
                                 Mark: "3DC183A38542" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                 Details: "resultData === null"
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else if ( !resultData.body ) {

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_NO_REPONSE_BODY_FROM_IM_MANAGER",
                     Message: await I18NManager.translate( strLanguage, "No response body from IM-Manager remote end point" ),
                     Mark: "1F52C4A9CD22" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_NO_BODY_REPONSE_FROM_IM_MANAGER",
                                 Message: await I18NManager.translate( strLanguage, "No response body from IM-Manager remote end point" ),
                                 Mark: "795591D60D07" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                 Details: "resultData.body === null"
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else {

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_IN_RESPONSE_FROM_IM_MANAGER",
                     Message: await I18NManager.translate( strLanguage, "A error code returned from IM-MANAGER remote end point to try get member list" ),
                     Mark: "563934ABDB8F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: resultData.body?.Code,
                                 Message: resultData.body?.Message,
                                 Details: {
                                            Mark: resultData.body?.Mark
                                          }
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

          if ( bApplyTransaction ) {

            await currentTransaction.commit();

          }
          else {

            await currentTransaction.rollback();

          }

        }

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                   Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                   Mark: "F755FE079D55" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                               Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                               Details: validator.errors.all()
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getPosition.name;

      const strMark = "344AC034143A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.LogId,
                 Mark: strMark,
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
