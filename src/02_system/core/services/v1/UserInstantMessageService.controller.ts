import cluster from "cluster";

import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import {
  Request,
  //json,
} from "express";

import CommonConstants from "../../../common/CommonConstants";

import CommonUtilities from "../../../common/CommonUtilities";
import SystemUtilities from "../../../common/SystemUtilities";

import I18NManager from "../../../common/managers/I18Manager";
import DBConnectionManager from "../../../common/managers/DBConnectionManager";
import CacheManager from "../../../common/managers/CacheManager";
//import NotificationManager from "../../../common/managers/NotificationManager";
//import InstantMenssageManager from "../../../common/managers/InstantMessageManager";
import MiddlewareManager from "../../../common/managers/MiddlewareManager";
//import PresenceManager from "../../../common/managers/PresenceManager";

//import SYSUserSessionPresenceService from "../../../common/database/master/services/SYSUserSessionPresenceService";

//import { SYSUserSessionPresence } from "../../../common/database/master/models/SYSUserSessionPresence";
//import { SYSUser } from "../../../common/database/master/models/SYSUser";
//import { SYSPerson } from "../../../common/database/master/models/SYSPerson";
//import { SYSUserSessionStatus } from "../../../common/database/master/models/SYSUserSessionStatus";
//import { SYSUserSessionPresenceInRoom } from "../../../common/database/master/models/SYSUserSessionPresenceInRoom";
//import { SYSUserSessionDevice } from "../../../common/database/master/models/SYSUserSessionDevice";
//import { SYSUserGroup } from "../../../common/database/master/models/SYSUserGroup";
import SYSUserSessionStatusService from "../../../common/database/master/services/SYSUserSessionStatusService";
import InstantMessageServerManager from "../../../common/managers/InstantMessageServerManager";

const debug = require( "debug" )( "UserInstantMessageServiceController" );

export default class UserInstantMessageServiceController {

  static readonly _ID = "UserInstantMessageServiceController";

  static async createInstantMessageAuthorization( request: Request,
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

      let strSocketToken = null;

      if ( CommonUtilities.isNullOrEmpty( userSessionStatus.SocketToken ) ||
           ( request.query.Force === "1" ||
             request.body.Force === "1" /*&&
             userSessionStatus.Token.startsWith( "p:" ) === false*/ ) ) {

        const strId = SystemUtilities.getUUIDv4();

        strSocketToken = SystemUtilities.hashString( strId, 1, logger ); //xx hash

        userSessionStatus.SocketToken = userSessionStatus.Token.startsWith( "p:" ) ? "p:" + strSocketToken: strSocketToken;

        //Update the cache and database
        await SystemUtilities.createOrUpdateUserSessionStatus( userSessionStatus.Token,
                                                               userSessionStatus,
                                                               {
                                                                 updateAt: true,        //Update the field updatedAt
                                                                 setRoles: false,       //Set roles?
                                                                 groupRoles: null,      //User group roles
                                                                 userRoles: null,       //User roles
                                                                 forceUpdate: true,     //Force update?
                                                                 tryLock: 2,            //Only 1 try
                                                                 lockSeconds: 4 * 1000, //Second
                                                               },
                                                               /*
                                                               false,    //Set roles?
                                                               null,     //User group roles
                                                               null,     //User roles
                                                               true,     //Force update?
                                                               2,        //Only 1 try
                                                               4 * 1000, //Second
                                                               */
                                                               currentTransaction,
                                                               logger );

        await CacheManager.setData( strSocketToken,
                                    userSessionStatus.Token,
                                    logger ); //Save to cache the association between generated socket Auth Token and the main Authorization Token

      }
      else {

        await CacheManager.setData( strSocketToken,
                                    userSessionStatus.Token,
                                    logger ); //Save to cache the association between generated socket Auth Token and the main Authorization Token

        strSocketToken = userSessionStatus.SocketToken;

      }

      const configDataAllowedToJoin = await InstantMessageServerManager.getConfigAllowedToJoin( userSessionStatus,
                                                                                                currentTransaction,
                                                                                                logger );

      let strChannels = "";

      if ( configDataAllowedToJoin.allowed ) {

        strChannels = configDataAllowedToJoin.allowed.replace( new RegExp( "\\#", "gi" ), "" ); //.split( "," );

      }

      const URL = await InstantMessageServerManager.getURLFromInstantMessageServer( currentTransaction,
                                                                                    logger );

      result = {
                 StatusCode: 200, //Ok
                 Code: "SUCCESS_AUTH_TOKEN_CREATED",
                 Message: await I18NManager.translate( strLanguage, "The instant message authorization token has been success created." ),
                 Mark: "8508AF872A19" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: false,
                 Errors: [],
                 Warnings: [],
                 Count: 1,
                 Data: [
                         {
                           Auth: strSocketToken,
                           Channels: strChannels,
                           Domain: URL.Domain,
                           Path: URL.Path,
                           IMManagerConnected: URL.IMManagerConnected
                         }
                       ]
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

      sourcePosition.method = this.name + "." + this.createInstantMessageAuthorization.name;

      const strMark = "4C8737D64088" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.logId,
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

  static async deleteInstantMessageAuthorization( request: Request,
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

      if ( userSessionStatus.SocketToken ) {

        const strSavedSocketToken = userSessionStatus.SocketToken;

        await CacheManager.deleteData( userSessionStatus.SocketToken,
                                       logger ); //Remove from cache

        userSessionStatus.SocketToken = null;

        //Update the cache and database
        await SystemUtilities.createOrUpdateUserSessionStatus( userSessionStatus.Token,
                                                               userSessionStatus,
                                                               {
                                                                 updateAt: true,        //Update the field updatedAt
                                                                 setRoles: false,       //Set roles?
                                                                 groupRoles: null,      //User group roles
                                                                 userRoles: null,       //User roles
                                                                 forceUpdate: true,     //Force update?
                                                                 tryLock: 2,            //Only 1 try
                                                                 lockSeconds: 4 * 1000, //Second
                                                               },
                                                               /*
                                                               false,    //Set roles?
                                                               null,     //User group roles
                                                               null,     //User roles
                                                               true,     //Force update?
                                                               2,        //Only 1 try
                                                               4 * 1000, //Second
                                                               */
                                                               currentTransaction,
                                                               logger );

        const warnings = [];

        //DONE 40E1487688CC Disconnect from remote server
        //Send to instant message server a message to disconnect this user
        await InstantMessageServerManager.disconnectFromInstantMessageServer( strSavedSocketToken,
                                                                              null,
                                                                              logger );

        /*
        await SYSUserSessionPresenceService.disconnectFromInstantMessageServer( userSessionStatus,
                                                                                strSavedSocketToken,
                                                                                strLanguage,
                                                                                warnings,
                                                                                currentTransaction,
                                                                                logger );
        */

        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_AUTH_TOKEN_DELETED",
                   Message: await I18NManager.translate( strLanguage, "The instant message authorization token has been success deleted." ),
                   Mark: "DE4E39A7EE92" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: warnings,
                   Count: 0,
                   Data: []
                 };

        bApplyTransaction = true;

      }
      else {

        result = {
                    StatusCode: 404, //Not found
                    Code: "ERROR_AUTH_TOKEN_NOT_FOUND",
                    Message: await I18NManager.translate( strLanguage, "The instant message authorization token not found." ),
                    Mark: "358DDC2ACD70" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                    LogId: null,
                    IsError: true,
                    Errors: [
                              {
                                Code: "ERROR_AUTH_TOKEN_NOT_FOUND",
                                Message: await I18NManager.translate( strLanguage, "The instant message authorization token not found." ),
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

      sourcePosition.method = this.name + "." + this.deleteInstantMessageAuthorization.name;

      const strMark = "0EA2FB8132E3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.logId,
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

  static async instantMessageServerHook( request: Request,
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

      let fakeRequest = {
                          context: {
                                     UserSessionStatus: null,
                                     Logger: logger,
                                     Languaje: null
                                   },
                        };

      let strAuthorization = await CacheManager.getData( request.body.Auth, //<-- Socket token
                                                         logger ); //get from cache the real authorization token

      if ( !strAuthorization ) { //No cache entry

        //Not in cache search in database
        const userSessionStatusInDB = await SYSUserSessionStatusService.getUserSessionStatusBySocketToken( request.body.Auth, //<-- Socket token
                                                                                                           currentTransaction,
                                                                                                           logger );

        if ( userSessionStatusInDB &&
             userSessionStatusInDB instanceof Error === false ) {

          strAuthorization = userSessionStatusInDB.Token; //Get the real main authorization token

          //Save to cache the association between generated binary data Auth Token and the main Authorization Token
          await CacheManager.setData( request.body.Auth,
                                      strAuthorization,
                                      logger );

        }

      }

      if ( strAuthorization ) {

        let userSessionStatusToCheck = await SystemUtilities.getUserSessionStatus( strAuthorization,
                                                                                   null,
                                                                                   false,
                                                                                   false,
                                                                                   currentTransaction,
                                                                                   logger );

        fakeRequest.context.UserSessionStatus = userSessionStatusToCheck;

        ( fakeRequest as any ).notDisconnectFromIMServer = 1; //Prevent recursive call between this server and instant message server
        ( fakeRequest as any ).returnResult = 1; //Force to return the result

        let resultData = await MiddlewareManager.middlewareCheckIsAuthenticated( fakeRequest as any,
                                                                                 null, //Not write response back
                                                                                 null );

        if ( resultData &&
             resultData.StatusCode === 200 ) { //Ok the authorization token is valid

          const strCommand = request.body.Command?.trim().toLowerCase();

          if ( strCommand === "connecttoserver" ) { //Connect to server

            //Th user is allowed to connect to instant message server
            result = {
                       StatusCode: 200, //Ok
                       Code: "SUCCESS_USER_ALLOWED_CONNECT",
                       Message: await I18NManager.translate( strLanguage, "User allowed to connect" ),
                       Mark: "E3F5AF2A8FFE" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: false,
                       Errors: [],
                       Warnings: [],
                       Count: 0,
                       Data: [
                               {
                                 Authorization: request.body.Authorization,
                                 ShortAuthorization: userSessionStatusToCheck.ShortToken,
                                 Id: userSessionStatusToCheck.UserId,
                                 Avatar: userSessionStatusToCheck.UserAvatar,
                                 Name: userSessionStatusToCheck.UserName,
                                 FirstName: userSessionStatusToCheck.FirstName,
                                 LastName: userSessionStatusToCheck.LastName,
                                 Device: userSessionStatusToCheck.UserDevice,
                                 System: process.env.APP_SERVER_DATA_NAME
                               }
                             ]
                     };

          }
          else if ( strCommand === "jointochannels" ) { //Join to channels

            const channelsToJoin = request.body.Channels.split( "," );

            const joinedChannels = {};

            let intJoinedChannels = 0;

            const errors = [];

            const warnings = [];

            for ( let intIndex = 0; intIndex < channelsToJoin.length; intIndex++ ) {

              const strChannelToJoin = channelsToJoin[ intIndex ].trim();

              //Check user allowed to join to channel to listen instant messages
              const allowedCheck = await InstantMessageServerManager.checkAllowedToJoin( strChannelToJoin,
                                                                                         userSessionStatusToCheck,
                                                                                         currentTransaction,
                                                                                         logger );

              if ( allowedCheck.value === 1 ) {

                joinedChannels[ strChannelToJoin ] = true;

                intJoinedChannels += 1;

              }
              else {

                joinedChannels[ strChannelToJoin ] = false;

                warnings.push(
                               {
                                 Code: "WARNING_NOT_ALLOWED_JOIN_CHANNEL",
                                 Message: await I18NManager.translate( strLanguage, "Not allowed to join to channel %s", strChannelToJoin ),
                                 Details: strChannelToJoin
                               }
                             );

                errors.push(
                             {
                               Code: "ERROR_NOT_ALLOWED_JOIN_CHANNEL",
                               Message: await I18NManager.translate( strLanguage, "Not allowed to join to channel %s", strChannelToJoin ),
                               Details: strChannelToJoin
                             }
                           );

              }

            }

            if ( intJoinedChannels > 0 ) {

              result = {
                         StatusCode: 200, //Ok
                         Code: "SUCCESS_USER_ALLOWED_JOIN_CHANNEL",
                         Message: await I18NManager.translate( strLanguage, "User allowed to join to channel" ),
                         Mark: "30B5F5E024A3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: false,
                         Errors: [],
                         Warnings: warnings,
                         Count: 1,
                         Data: [
                                 joinedChannels
                               ]
                       };

            }
            else {

              result = {
                         StatusCode: 403, //Forbidden
                         Code: "ERROR_USER_NOT_ALLOWED_JOIN_CHANNEL",
                         Message: await I18NManager.translate( strLanguage, "User denied to join to channel" ),
                         Mark: "C6CDF908D21E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: errors,
                         Warnings: [],
                         Count: 1,
                         Data: [
                                 joinedChannels
                               ]
                       };

            }

          }
          else if ( strCommand === "listmembers" ) { //List members joined to channel

            const channelsToJoin = request.body.Channels.split( "," );

            const listChannels = {};

            let intListChannels = 0;

            const errors = [];

            const warnings = [];

            for ( let intIndex = 0; intIndex < channelsToJoin.length; intIndex++ ) {

              const strChannelToList = channelsToJoin[ intIndex ].trim();

              //Check user allowed to join to channel to listen instant messages
              const allowedCheck = await InstantMessageServerManager.checkAllowedToJoin( strChannelToList,
                                                                                         userSessionStatusToCheck,
                                                                                         currentTransaction,
                                                                                         logger );

              if ( allowedCheck.value !== 1 ) {

                if ( allowedCheck.allowed.includes( "@@AlreadyJoinedChannels@@" ) ) {

                  if ( request.body.JoinedChannels.includes( strChannelToList ) ) {

                    allowedCheck.value = 1;

                  }

                }

              }

              if ( allowedCheck.value === 1 ) {

                listChannels[ strChannelToList ] = true;

                intListChannels += 1;

              }
              else {

                listChannels[ strChannelToList ] = false;

                warnings.push(
                               {
                                 Code: "WARNING_NOT_ALLOWED_LIST_MEMBERS",
                                 Message: await I18NManager.translate( strLanguage, "Not allowed to list members in channel %s", strChannelToList ),
                                 Details: strChannelToList
                               }
                             );

                errors.push(
                             {
                               Code: "ERROR_NOT_ALLOWED_LIST_MEMBERS",
                               Message: await I18NManager.translate( strLanguage, "Not allowed to list members in channel %s", strChannelToList ),
                               Details: strChannelToList
                             }
                           );

              }

            }

            if ( intListChannels > 0 ) {

              result = {
                         StatusCode: 200, //Ok
                         Code: "SUCCESS_USER_ALLOWED_LIST_MEMBERS",
                         Message: await I18NManager.translate( strLanguage, "User allowed to list members" ),
                         Mark: "4BDE803FAB49" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: false,
                         Errors: [],
                         Warnings: warnings,
                         Count: 1,
                         Data: [
                                 listChannels
                               ]
                       };

            }
            else {

              result = {
                         StatusCode: 403, //Forbidden
                         Code: "ERROR_USER_NOT_ALLOWED_LIST_MEMBERS",
                         Message: await I18NManager.translate( strLanguage, "User denied to list members" ),
                         Mark: "DF78E1E06D1F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: errors,
                         Warnings: [],
                         Count: 1,
                         Data: [
                                 listChannels
                               ]
                       };

            }

          }
          else if ( strCommand === "listchannels" ) { //List channels

            const configDataAllowedToJoin = await InstantMessageServerManager.getConfigAllowedToJoin( userSessionStatusToCheck,
                                                                                                      currentTransaction,
                                                                                                      logger );

            if ( configDataAllowedToJoin.allowed ) {

              const channels = configDataAllowedToJoin.allowed.replace( new RegExp( "\\#", "gi" ), "" ).split( "," );

              /*
              const allowedToJoin = []

              for ( let intIndexChannel = 0; intIndexChannel < channels.length; intIndexChannel++ ) {

                allowedToJoin[ channels[ intIndexChannel ] ] = true;

              }
              */

              result = {
                         StatusCode: 200, //Ok
                         Code: "SUCCESS_GET_CHANNELS_ALLOWED_TO_JOIN",
                         Message: await I18NManager.translate( strLanguage, "Success get channels list allowed to join" ),
                         Mark: "A28B43ECF626" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: false,
                         Errors: [],
                         Warnings: [],
                         Count: 1,
                         Data: channels
                       };

            }

          }
          else if ( strCommand === "sendmessage" ) { //Send message to channel

            const channelsToSend = request.body.Channels?.split( "," );

            const listChannels = {};

            let intListChannels = 0;

            const errors = [];

            const warnings = [];

            for ( let intIndex = 0; intIndex < channelsToSend.length; intIndex++ ) {

              const strChannelToSend = channelsToSend[ intIndex ].trim();

              //Check user allowed to join to channel to listen instant messages
              const allowedCheck = await InstantMessageServerManager.checkAllowedToSend( strChannelToSend,
                                                                                         request.body.Message,
                                                                                         userSessionStatusToCheck,
                                                                                         currentTransaction,
                                                                                         logger );

              if ( allowedCheck.value !== 1 ) {

                if ( allowedCheck.allowed.includes( "@@AlreadyJoinedChannels@@" ) ) {

                  if ( request.body.Channels.includes( strChannelToSend ) ) {

                    allowedCheck.value = 1;

                  }

                }

              }

              if ( allowedCheck.value === 1 ) {

                listChannels[ strChannelToSend ] = true;

                intListChannels += 1;

              }
              else {

                listChannels[ strChannelToSend ] = false;

                warnings.push(
                               {
                                 Code: "WARNING_NOT_ALLOWED_SEND_MESSAGE",
                                 Message: await I18NManager.translate( strLanguage, "Not allowed to send message to channel %s", strChannelToSend ),
                                 Details: strChannelToSend
                               }
                             );

                errors.push(
                             {
                               Code: "ERROR_NOT_ALLOWED_SEND_MESSAGE",
                               Message: await I18NManager.translate( strLanguage, "Not allowed to send message to channel %s", strChannelToSend ),
                               Details: strChannelToSend
                             }
                           );

              }

            }

            if ( intListChannels > 0 ) {

              result = {
                         StatusCode: 200, //Ok
                         Code: "SUCCESS_USER_ALLOWED_SEND_MESSAGE",
                         Message: await I18NManager.translate( strLanguage, "User allowed to send message" ),
                         Mark: "FACDF58A4A66" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: false,
                         Errors: [],
                         Warnings: warnings,
                         Count: 1,
                         Data: [
                                 listChannels
                               ]
                       };

            }
            else {

              result = {
                         StatusCode: 403, //Forbidden
                         Code: "ERROR_USER_NOT_ALLOWED_SEND_MESSAGE",
                         Message: await I18NManager.translate( strLanguage, "User denied to send message" ),
                         Mark: "95AA7132B706" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: errors,
                         Warnings: [],
                         Count: 1,
                         Data: [
                                 listChannels
                               ]
                       };

            }

            /*
            //Check user allowed to send message to channel
            const allowedCheck = await InstantMessageServerManager.checkAllowedToSend( request.body.Channel,
                                                                                       request.body.Message,
                                                                                       userSessionStatusToCheck,
                                                                                       currentTransaction,
                                                                                       logger );

            if ( allowedCheck.value === 1 ) {

              delete allowedCheck[ "value" ];

              result = {
                         StatusCode: 200, //Ok
                         Code: "SUCCESS_USER_ALLOWED_SEND_MESSAGE",
                         Message: await I18NManager.translate( strLanguage, "User allowed to send message to channel" ),
                         Mark: "A2F7F46E5A74" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: false,
                         Errors: [],
                         Warnings: [],
                         Count: 1,
                         Data: [
                                 allowedCheck
                               ]
                       };

            }
            else {

              delete allowedCheck[ "value" ];

              result = {
                         StatusCode: 403, //Forbidden
                         Code: "ERROR_USER_DENIED_SEND_MESSAGE",
                         Message: await I18NManager.translate( strLanguage, "User denied to send message to channel" ),
                         Mark: "9956751DE8D1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: "ERROR_USER_DENIED_SEND_MESSAGE",
                                     Message: await I18NManager.translate( strLanguage, "User denied to send message to channel" ),
                                     Details: null
                                   }
                                 ],
                         Warnings: [],
                         Count: 1,
                         Data: [
                                 allowedCheck
                               ]
                       };

            }
            */

          }
          else if ( strCommand === "disconnectedfromserver" ) { //Disconnected from server

            result = {
                       StatusCode: 200, //Ok
                       Code: "SUCCESS_NOTIFIED",
                       Message: await I18NManager.translate( strLanguage, "Notified" ),
                       Mark: "612F89C5D1F7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: false,
                       Errors: [],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     };

          }
          else if ( strCommand === "leavefromchannels" ) {     //Leave from channels

            const channelsToLeave = request.body.Channels.split( "," );

            const leavedChannels = {};

            for ( let intIndex = 0; intIndex < channelsToLeave.length; intIndex++ ) {

              const strChannelToLeave = channelsToLeave[ intIndex ].trim();

              //Meaybe in the future we can check if possible leave a channel

              leavedChannels[ strChannelToLeave ] = true;

            }

            result = {
                       StatusCode: 200, //Ok
                       Code: "SUCCESS_NOTIFIED",
                       Message: await I18NManager.translate( strLanguage, "Notified" ),
                       Mark: "B66FEF321B09" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: false,
                       Errors: [],
                       Warnings: [],
                       Count: 0,
                       Data: [
                               leavedChannels
                             ]
                     };

          }
          else {

            result = {
                       StatusCode: 400, //Bad request
                       Code: "ERROR_UNKNOWN_COMMAND",
                       Message: await I18NManager.translate( strLanguage, "Unknown command name [%s]", strCommand ),
                       Mark: "B8656012AEF4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_UNKNOWN_COMMAND",
                                   Message: await I18NManager.translate( strLanguage, "Unknown command name [%s]", strCommand ),
                                   Details: {
                                              Action: strCommand
                                            }
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     };

          }

        }
        else {

          result = resultData;

        }

      }
      else {

        result = {
                   StatusCode: 401, //Unauthorized
                   Code: "ERROR_INVALID_AUTH_TOKEN",
                   Message: await I18NManager.translate( strLanguage, "Instant message authorization token provided is invalid" ),
                   Mark: "33FA07C2BDCD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_INVALID_AUTH_TOKEN",
                               Message: await I18NManager.translate( strLanguage, "Instant message authorization token provided is invalid" ),
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

      sourcePosition.method = this.name + "." + this.instantMessageServerHook.name;

      const strMark = "CA2DF8B2E28D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.logId,
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

  static async instantMessageTestUsingSocket( request: Request,
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

      };

      const message = {

                        Kind: "text/plain",
                        Topic: "message",
                        Data: "Test message using socket live connection from " + process.env.APP_SERVER_DATA_NAME

                      };

      const resultData = await InstantMessageServerManager.sendMessageUsingSocket( null, //Take from main instance
                                                                                   "ServerEcho",
                                                                                   null, //Take from config
                                                                                   message,
                                                                                   null,
                                                                                   logger );

      if ( resultData.Code === 1 ) {

        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_SEND_TEST_MESSAGE",
                   Message: await I18NManager.translate( strLanguage, "Success send test message to ServerEcho channel. Using live socket connection" ),
                   Mark: "D129724E611D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else if ( resultData.Code === -500 ) {

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "EB29F6B4C35B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: resultData.Error?.logId,
                   IsError: true,
                   Errors: [
                             {
                               Code: resultData.Error?.name,
                               Message: await I18NManager.translate( strLanguage, resultData.Error?.message ),
                               Details: await SystemUtilities.processErrorDetails( resultData.Error ) //error
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
                   Code: "ERROR_TO_SEND_MESSAGE",
                   Message: await I18NManager.translate( strLanguage, resultData.Message ),
                   Mark: "FB374A9ABB9F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: resultData.Code,
                               Message: await I18NManager.translate( strLanguage, resultData.Message ),
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

      sourcePosition.method = this.name + "." + this.instantMessageTestUsingSocket.name;

      const strMark = "512579DC4A1F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.logId,
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

  static async instantMessageTestUsingRest( request: Request,
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

      const message = {

        Kind: "text/plain",
        Topic: "message",
        Data: "Test message using rest api connection from " + process.env.APP_SERVER_DATA_NAME

      };

      const resultData = await InstantMessageServerManager.sendMessageUsingRest( "ServerEcho",
                                                                                 null, //Take from config
                                                                                 message,
                                                                                 logger );

      if ( resultData instanceof Error ) {

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "E03F2C77DCE0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: ( resultData as any ).logId,
                   IsError: true,
                   Errors: [
                             {
                               Code: resultData.name,
                               Message: resultData.message,
                               Details: await SystemUtilities.processErrorDetails( resultData ) //error
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else if ( resultData?.body?.StatusCode ) {

        result = resultData?.body;
        result.RemoteMark = result.Mark;
        result.Mark = "EFDDC3E45C76" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      }
      else {

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "NO_RESPONSE_FROM_IM_SERVER",
                   Message: await I18NManager.translate( strLanguage, "Not response from instant message server. Please read the server log for more details." ),
                   Mark: "C8F622F62C66" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "NO_RESPONSE_FROM_IM_SERVER",
                               Message: await I18NManager.translate( strLanguage, "Not response from instant message server. Please read the server log for more details." ),
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

      sourcePosition.method = this.name + "." + this.instantMessageTestUsingRest.name;

      const strMark = "254B8FBCE541" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.logId,
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

  static async instantMessageGetChannelMembersUsingRest( request: Request,
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

      const resultData = await InstantMessageServerManager.getChannelMembers( ( request.query.channels as string ),
                                                                              null, //Take from config
                                                                              logger );

      if ( resultData instanceof Error ) {

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "CD57132F2283" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: ( resultData as any ).logId,
                   IsError: true,
                   Errors: [
                             {
                               Code: resultData.name,
                               Message: resultData.message,
                               Details: await SystemUtilities.processErrorDetails( resultData ) //error
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else if ( resultData?.body?.StatusCode ) {

        result = resultData?.body;
        result.RemoteMark = result.Mark;
        result.Mark = "BB9C0F5C94C8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      }
      else {

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "NO_RESPONSE_FROM_IM_SERVER",
                   Message: await I18NManager.translate( strLanguage, "Not response from instant message server. Please read the server log for more details." ),
                   Mark: "EDE8DC83658B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "NO_RESPONSE_FROM_IM_SERVER",
                               Message: await I18NManager.translate( strLanguage, "Not response from instant message server. Please read the server log for more details." ),
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

      sourcePosition.method = this.name + "." + this.instantMessageTestUsingRest.name;

      const strMark = "254B8FBCE541" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.logId,
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
  /*
  static async createInstantMessage( request: Request,
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

      let messageRules = {
                           To: [ "required", "array" ],
                           Kind: [ "required", "min:5" ],
                           Body: [ "required" ],
                         };

      let validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                 messageRules,
                                                                 null,
                                                                 logger );

      if ( validator.passes() ) { //Validate request.body field values

        const bodyToList = request.body.To;

        if ( bodyToList.length === 0 ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: "ERROR_TO_LIST_EMPTY",
                     Message: await I18NManager.translate( strLanguage, "The To list cannot be empty" ),
                     Mark: "3861F18052F1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_TO_LIST_EMPTY",
                                 Message: await I18NManager.translate( strLanguage, "The To list cannot be empty" ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else if ( bodyToList.length > 15 ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: "ERROR_TO_LIST_IS_TOO_BIG",
                     Message: await I18NManager.translate( strLanguage, "The To list is too big. Cannot contains more than 15 elements" ),
                     Mark: "BDA9B2DBE31E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_TO_LIST_EMPTY",
                                 Message: await I18NManager.translate( strLanguage, "The To list is too big. Cannot contains more than 15 elements" ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else if ( Object.keys( request.body.Body ).length == 0 ) {

          result = {
                     StatusCode: 400, //Bad request
                     Code: "ERROR_BODY_IS_EMPTY",
                     Message: await I18NManager.translate( strLanguage, "The body object cannot be empty" ),
                     Mark: "DE4C1C97566F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_TO_LIST_EMPTY",
                                 Message: await I18NManager.translate( strLanguage, "The body object cannot be empty" ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else {

          const checkResult = await InstantMenssageManager.check( userSessionStatus,
                                                                  request.body,
                                                                  currentTransaction,
                                                                  context,
                                                                  logger );

          if ( checkResult.IsError === false ) {

            let toIdList = [];
            let toNameList = [];
            let toPresenceIdList = [];
            let toWarningList = [];
            let toErrorList = [];

            for ( let intToIndex = 0; intToIndex < bodyToList.length; intToIndex++ ) {

              if ( bodyToList[ intToIndex ] ) {

                if ( bodyToList[ intToIndex ].startsWith( "room://" ) === false ) {

                  let userSessionPresenceList = await SYSUserSessionPresenceService.getUserSessionPresenceIdByUserNameLite( bodyToList[ intToIndex ],
                                                                                                                            currentTransaction,
                                                                                                                            logger );

                  if ( userSessionPresenceList instanceof Error === false ) {

                    userSessionPresenceList = userSessionPresenceList as [];

                    if ( userSessionPresenceList.length > 0 ) {

                      for ( let intIndex = 0; intIndex < userSessionPresenceList.length; intIndex++ ) {

                        let checkRequest = {
                                             context: {
                                                        Logger: logger,
                                                        UserSessionStatus: null,
                                                        Languaje: strLanguage
                                                      },
                                           };

                        let checkUserSessionStatus = await SystemUtilities.getUserSessionStatus( userSessionPresenceList[ intIndex ].UserSessionStatusToken,
                                                                                                 null,
                                                                                                 false,
                                                                                                 false,
                                                                                                 currentTransaction,
                                                                                                 logger );

                        checkRequest.context.UserSessionStatus = checkUserSessionStatus;

                        ( checkRequest as any ).returnResult = 1; //Force to return the result

                        //Check for valid session token
                        let resultData = await MiddlewareManager.middlewareCheckIsAuthenticated( checkRequest as any,
                                                                                                 null, //Not write response back
                                                                                                 null );

                        if ( resultData &&
                             resultData.StatusCode === 200 ) { //Ok the authorization token is valid

                          toIdList.push( checkUserSessionStatus.UserId );
                          toNameList.push( bodyToList[ intToIndex ] );
                          toPresenceIdList.push( userSessionPresenceList[ intIndex ].PresenceId );

                        }

                      }

                    }
                    else {

                      toWarningList.push(
                                          {
                                            Code: "WARNING_CANNOT_GET_PRESENCE_ID_FROM_USER",
                                            Message: await I18NManager.translate( strLanguage, "Cannot get the presence id from the user %s", bodyToList[ intToIndex ] ),
                                            Details: null
                                          }
                                        );

                    }

                  }
                  else {

                    const error = userSessionPresenceList;

                    toErrorList.push(
                                      {
                                        Code: "ERROR_CANNOT_GET_PRESENCE_ID_FROM_USER",
                                        Message: await I18NManager.translate( strLanguage, "Cannot get the presence id from the user %s", bodyToList[ intToIndex ] ),
                                        Details: await SystemUtilities.processErrorDetails( error ) //error
                                      }
                                    );

                  }

                }
                else {

                  toIdList.push( bodyToList[ intToIndex ] );
                  toNameList.push( bodyToList[ intToIndex ] );
                  toPresenceIdList.push( bodyToList[ intToIndex ] );

                }

              }
              else {

                toWarningList.push(
                                    {
                                      Code: "WARNING_USER_IS_EMPTY_OR_NULL",
                                      Message: await I18NManager.translate( strLanguage, "The user is empty o null. Ignoring" ),
                                      Details: {
                                                 Index: intToIndex
                                               }
                                    }
                                  );

              }

            }

            if ( await NotificationManager.publishOnTopic( "InstantMessage",
                                                           {
                                                             Name: "Send",
                                                             FromId: userSessionStatus.UserId,
                                                             FromName: userSessionStatus.UserName,
                                                             Kind: request.body.Kind,
                                                             ToId: toIdList,
                                                             ToName: toNameList,
                                                             ToPresenceId: toPresenceIdList,
                                                             Body: request.body.Body
                                                           },
                                                           logger ) === true ) {

              let intStatusCode = -1;
              let strCode = "";
              let strMessage = "";
              let bIsError = false;

              if ( toErrorList.length === 0 &&
                   toWarningList.length === 0 ) {

                intStatusCode = 200
                strCode = "SUCCESS_SEND_MESSAGE";
                strMessage = await I18NManager.translate( strLanguage, "Success message send to all users" );

              }
              else if ( toErrorList.length === bodyToList.length ) {

                intStatusCode = 400
                strCode = "ERROR_SEND_MESSAGE";
                strMessage = await I18NManager.translate( strLanguage, "Cannot send the message to any users. Please check the errors and warnings section" );
                bIsError = true;

              }
              else {

                intStatusCode = 202
                strCode = "CHECK_DATA_AND_ERRORS_AND_WARNINGS";
                strMessage = await I18NManager.translate( strLanguage, "The message cannot delivered to ALL users. Please check the data and errors and warnings section" );
                bIsError = toErrorList.length > 0;

              }

              result = {
                         StatusCode: intStatusCode, //Ok
                         Code: strCode,
                         Message: strMessage,
                         Mark: "B88547D5233C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: false,
                         Errors: toErrorList,
                         Warnings: toWarningList,
                         Count: toNameList.length,
                         Data: toNameList
                       };

            }
            else {

              result = {
                         StatusCode: 500, //Internal server error
                         Code: "ERROR_UNEXPECTED",
                         Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                         Mark: "922C0DA98C93" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: "FAIL_TO_PUBLISH_ON_TOPIC",
                                     Message: "Cannot publish on topic the method publishOnTopic return false",
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
                       StatusCode: checkResult.StatusCode,
                       Code: checkResult.Code,
                       Message: checkResult.Message,
                       Mark: "888C716A0C2D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: checkResult.Code,
                                   Message: checkResult.Message,
                                   Details: checkResult.Details
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     };

          }

        }

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                   Message: await I18NManager.translate( strLanguage, "One or more field values are invalid." ),
                   Mark: "D8FDD5B300C8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                               Message: await I18NManager.translate( strLanguage, "One or more field values are invalid." ),
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

      sourcePosition.method = this.name + "." + this.createInstantMessage.name;

      const strMark = "0696C843CBE1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.logId,
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

  static async presenceRoom( request: Request,
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

      const sysUserSessionPresence = await SYSUserSessionPresenceService.getByToken( userSessionStatus.Token,
                                                                                     null,
                                                                                     currentTransaction,
                                                                                     logger );

      if ( !sysUserSessionPresence ) {

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_NO_PRESENCE_DATA_FOUND",
                   Message: await I18NManager.translate( strLanguage, "The presence data not found for the current user session." ),
                   Mark: "B83DDA0FED39" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_NO_PRESENCE_DATA_FOUND",
                               Message: await I18NManager.translate( strLanguage, "The presence data not found for the current user session." ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else if ( sysUserSessionPresence instanceof Error ) {

        const error = sysUserSessionPresence as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "0A27B82BF359" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        const roomDataList = await SYSUserSessionPresenceService.getUserSessionPresenceRoomList( sysUserSessionPresence.PresenceId,
                                                                                                 currentTransaction,
                                                                                                 logger );

        if ( roomDataList instanceof Error ) {

          const error = roomDataList as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "72E62FB65722" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

          const roomInfoList = [];

          for ( const currentRoom of roomDataList ) {

            const roomInfo = {
                               Id: currentRoom.Id,
                               Name: currentRoom.Name
                             };

            roomInfoList.push( roomInfo );

          }

          result = {
                     StatusCode: 200, //Ok
                     Code: "SUCCESS_ROOM_LIST",
                     Message: await I18NManager.translate( strLanguage, "Success get presence room list." ),
                     Mark: "A3F304A84376" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: roomInfoList.length,
                     Data: roomInfoList
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

      sourcePosition.method = this.name + "." + this.presenceRoom.name;

      const strMark = "640F892436D1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.logId,
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

  static async presenceRoomCount( request: Request,
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

      const sysUserSessionPresence = await SYSUserSessionPresenceService.getByToken( userSessionStatus.Token,
                                                                                     null,
                                                                                     currentTransaction,
                                                                                     logger );

      if ( !sysUserSessionPresence ) {

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_NO_PRESENCE_DATA_FOUND",
                   Message: await I18NManager.translate( strLanguage, "The presence data not found for the current user session." ),
                   Mark: "0EA89FC0BAE3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_NO_PRESENCE_DATA_FOUND",
                               Message: await I18NManager.translate( strLanguage, "The presence data not found for the current user session." ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else if ( sysUserSessionPresence instanceof Error ) {

        const error = sysUserSessionPresence as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "B9564173315E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        const roomCount = await SYSUserSessionPresenceService.getUserSessionPresenceRoomListCount( sysUserSessionPresence.PresenceId,
                                                                                                   currentTransaction,
                                                                                                   logger );

        if ( roomCount instanceof Error ) {

          const error = roomCount as any;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "72E62FB65722" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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
                     StatusCode: 200, //Ok
                     Code: "SUCCESS_ROOM_LIST_COUNT",
                     Message: await I18NManager.translate( strLanguage, "Success get presence room list count." ),
                     Mark: "A3F304A84376" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: 1,
                     Data: [
                             {
                               Count: roomCount.length > 0 ? roomCount[ 0 ].Count: 0
                             }
                           ]
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

      sourcePosition.method = this.name + "." + this.presenceRoomCount.name;

      const strMark = "325B5BE115D3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.logId,
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

  static async presence( request: Request,
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

      const strTimeZoneId = context.TimeZoneId;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const userSessionStatus = context.UserSessionStatus;

      const sysUserSessionPresence = await SYSUserSessionPresenceService.getByToken( userSessionStatus.Token,
                                                                                     null,
                                                                                     currentTransaction,
                                                                                     logger );

      if ( !sysUserSessionPresence ) {

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_NO_PRESENCE_DATA_FOUND",
                   Message: await I18NManager.translate( strLanguage, "The presence data not found for the current user session." ),
                   Mark: "A80DD97E9086" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_NO_PRESENCE_DATA_FOUND",
                               Message: await I18NManager.translate( strLanguage, "The presence data not found for the current user session." ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else if ( sysUserSessionPresence instanceof Error ) {

        const error = sysUserSessionPresence as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "0D9B7BEAB10F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

        const strSelectField = SystemUtilities.createSelectAliasFromModels(
                                                                            [
                                                                              SYSUserSessionPresenceInRoom,
                                                                              SYSUserSessionPresence,
                                                                              SYSUserSessionStatus,
                                                                              SYSUser,
                                                                              SYSUserGroup,
                                                                              SYSPerson,
                                                                              SYSUserSessionDevice
                                                                            ],
                                                                            [
                                                                              "A",
                                                                              "B",
                                                                              "C",
                                                                              "D",
                                                                              "E",
                                                                              "F",
                                                                              "G"
                                                                            ]
                                                                          );

        let strSQL = DBConnectionManager.getStatement( "master",
                                                       "getUserSessionPresenceList",
                                                       {
                                                         SelectFields: strSelectField,
                                                       },
                                                       logger );

        strSQL = request.query.where ? strSQL + "( " + request.query.where + " )" : strSQL + "( 1 )";

        strSQL = strSQL + " And ( A.RoomId = "" + ( request.query.roomId ? request.query.roomId: "@-Not_Exists_Id-@" ) + "" ) "; // And C.Token != "" + userSessionStatus.Token + "" ) ";

        / *
        const roomList = sysUserSessionPresence.Room.split( "," ).sort();

        for ( let intRoomIndex = 0; intRoomIndex < roomList.length; intRoomIndex++ ) {

          if ( intRoomIndex == 0 ) {

            strSQL = strSQL + ` A.Room Like "%${ roomList[ intRoomIndex ] }%"`;

          }
          else {

            strSQL = strSQL + ` Or A.Room Like "%${ roomList[ intRoomIndex ] }%"`;

          }

        }

        strSQL = strSQL + " ) ";
        * /

        strSQL = request.query.orderBy ? strSQL + " Order By " + request.query.orderBy: strSQL;

        let intLimit = 200;

        const warnings = [];

        if ( request.query.limit &&
             isNaN( parseInt( request.query.limit ) ) === false &&
             Number.parseInt( request.query.limit ) <= intLimit ) {

          intLimit = Number.parseInt( request.query.limit );

        }
        else {

          warnings.push(
                         {
                           Code: "WARNING_DATA_LIMITED_TO_MAX",
                           Message: await I18NManager.translate( strLanguage, "Data limited to the maximun of %s rows", intLimit ),
                           Details: await I18NManager.translate( strLanguage, "To protect to server and client of large result set of data, the default maximun rows is %s, you must use \"offset\" and \"limit\" query parameters to paginate large result set of data.", intLimit )
                         }
                       );

        }

        strSQL = strSQL + " LIMIT " + intLimit.toString() + " OFFSET " + ( request.query.offset && !isNaN( request.query.offset ) ? request.query.offset : "0" );

        //ANCHOR dbConnection.query
        const rows = await dbConnection.query(
                                               strSQL,
                                               {
                                                 raw: true,
                                                 type: QueryTypes.SELECT,
                                                 transaction: currentTransaction
                                               }
                                             );

        const transformedRows = SystemUtilities.transformRowValuesToSingleRootNestedObject(
                                                                                            rows,
                                                                                            [
                                                                                              SYSUserSessionPresenceInRoom,
                                                                                              SYSUserSessionPresence,
                                                                                              SYSUserSessionStatus,
                                                                                              SYSUser,
                                                                                              SYSUserGroup,
                                                                                              SYSPerson,
                                                                                              SYSUserSessionDevice
                                                                                            ],
                                                                                            [
                                                                                              "A",
                                                                                              "B",
                                                                                              "C",
                                                                                              "D",
                                                                                              "E",
                                                                                              "F",
                                                                                              "G"
                                                                                            ]
                                                                                          );

        const filteredRows = await PresenceManager.filterList( userSessionStatus,
                                                               transformedRows,
                                                               currentTransaction,
                                                               {},
                                                               logger );

        //const filteredRows = PresenceManager.filter();
        const convertedRows = [];

        for ( const currentRow of filteredRows ) {

          const strDeviceInfoParsed = currentRow.sysUserSessionDevice ? currentRow.sysUserSessionDevice.DeviceInfoParsed: "{}";

          const jsonDeviceInfoParsed = CommonUtilities.parseJSON( strDeviceInfoParsed,
                                                                  logger );

          const jsonPresenceInfo = {
                                     Id: currentRow.sysUser.Id,
                                     Name: currentRow.sysUser.Name,
                                     FirstName: currentRow.sysPerson ? currentRow.sysPerson.FirstName: null,
                                     LastName: currentRow.sysPerson ? currentRow.sysPerson.LastName: null,
                                     Device: jsonDeviceInfoParsed ? jsonDeviceInfoParsed: "",
                                     UpdatedAt: SystemUtilities.transformToTimeZone( currentRow.sysUserSessionStatus.UpdatedAt,
                                                                                     strTimeZoneId,
                                                                                     null,
                                                                                     logger ),
                                   };

          convertedRows.push( jsonPresenceInfo );
          / *
          const tempModelData = await SYSUserGroup.convertFieldValues(
                                                                       {
                                                                         Data: currentRow,
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

            convertedRows.push( tempModelData );

          }
          else {

            convertedRows.push( currentRow );

          }
          * /

        }

        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_PRESENCE_LIST",
                   Message: await I18NManager.translate( strLanguage, "Success get presence list." ),
                   Mark: "A3F304A84376" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: warnings,
                   Count: convertedRows.length,
                   Data: convertedRows
                 }

        bApplyTransaction = true;

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

      sourcePosition.method = this.name + "." + this.presence.name;

      const strMark = "CE4BA31CB8FD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.logId,
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
  */

  /*
  static async presenceCount( request: Request,
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

      //

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

      sourcePosition.method = this.name + "." + this.presenceCount.name;

      const strMark = "9F4A1B17D45B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.logId,
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
  */

}
