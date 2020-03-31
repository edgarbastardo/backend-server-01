require( 'dotenv' ).config(); //Read the .env file, in the root folder of project

import cluster from 'cluster';
import * as http from "http";

import appRoot from 'app-root-path';

import CommonConstants from './02_system/common/CommonConstants';

import CommonUtilities from "./02_system/common/CommonUtilities";
import SystemUtilities from "./02_system/common/SystemUtilities";

import LoggerManager from "./02_system/common/managers/LoggerManager";
import NotificationManager from './02_system/common/managers/NotificationManager';
import DBConnectionManager from './02_system/common/managers/DBConnectionManager';
import CacheManager from './02_system/common/managers/CacheManager';
import NetworkLeaderManager from "./02_system/common/managers/NetworkLeaderManager";
import I18NManager from "./02_system/common/managers/I18Manager";

import SYSUserSessionPresenceService from "./02_system/common/database/services/SYSUserSessionPresenceService";
import MiddlewareManager from './02_system/common/managers/MiddlewareManager';
import SYSInstantMessageLogService from './02_system/common/database/services/SYSInstantMessageLogService';
import SYSUserSessionPresenceInRoomService from './02_system/common/database/services/SYSUserSessionPresenceInRoomService';

let debug = require( 'debug' )( 'server_intant_message@main_process' );

export default class ServerInstantMessage {

  static serverHTTP = null;
  static socketIO = null;

  static checkIntervalHandler = null;
  static strTopicServer = null;

  static peerServersLastReport = { };

  static async disconnect( strServer: string,
                           message: any,
                           logger: any ): Promise<boolean> {

    let bResult = false;

    let currentTransaction = null;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

      }

      const sysUserSessionPresence = await SYSUserSessionPresenceService.getByPresenceId( message.PresenceId,
                                                                                          null,
                                                                                          currentTransaction,
                                                                                          logger );

      if ( sysUserSessionPresence instanceof Error === false &&
           sysUserSessionPresence.Server === strServer ) {

        await SYSUserSessionPresenceService.deleteByModel( sysUserSessionPresence,
                                                           currentTransaction,
                                                           logger );

        if ( currentTransaction !== null &&
            currentTransaction.finished !== "rollback" ) {

          await currentTransaction.commit();

        }

        if ( !message.Disconnected ) {

          ServerInstantMessage.socketIO.in( message.PresenceId ).disconnect();

        }

        bResult = true;

      }
      else {

        if ( currentTransaction !== null &&
            currentTransaction.finished !== "rollback" ) {

          await currentTransaction.commit();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.disconnect.name;

      const strMark = "38A89266EC83" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof logger.error === "function" ) {

        logger.error( error );

      }

      if ( currentTransaction !== null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

    }

    return bResult;

  }

  static async send( strServer: string,
                     message: any,
                     logger: any ): Promise<boolean> {

    let bResult = false;

    let currentTransaction = null;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

      }

      const strMark = "43B1AECAA7E1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      for ( let intToIndex = 0; intToIndex < message.ToId.length; intToIndex++ ) {

        const strToId = message.ToId[ intToIndex ];
        const strToName = message.ToName[ intToIndex ];
        //const bIsRoom = message.ToPresenceId[ intToIndex ].startsWith( "room://" );
        const strToPresenceId = message.ToPresenceId[ intToIndex ].replace( "room://", "" );

        try {

          const messageToSend = {
                                  From: message.From,
                                  To: strToName,
                                  Body: message.Body
                                }

          ServerInstantMessage.socketIO.to( strToPresenceId ).emit( 'newMessage', messageToSend );

          /*
          //Update the field UpdatedBy in table sysUserSessionPresence

          if ( bIsRoom === false ) {

          }
          */

          //Log the message sended
          const sysInstantMessageLog = await SYSInstantMessageLogService.create(
                                                                                 {
                                                                                   FromId: message.FromId,
                                                                                   FromName: message.FromName,
                                                                                   ToId: strToId,
                                                                                   ToName: strToName,
                                                                                   ToPresenceId: strToPresenceId,
                                                                                   Data: message.Body,
                                                                                   CreatedBy: message.FromNamel,
                                                                                   CreatedAt: null,
                                                                                 },
                                                                                 currentTransaction,
                                                                                 logger
                                                                               );

          if ( !sysInstantMessageLog ) {

            debugMark( "Fail to save the instant message log. sysInstanceMessageLog is null" );

          }
          else if ( sysInstantMessageLog instanceof Error ) {

            debugMark( "Fail to save the instant message log. With the next error %O", sysInstantMessageLog );

          }
          else {

            debugMark( "Success save the instant message log with Id %s", ( sysInstantMessageLog as any ).Id );

          }

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = this.name + "." + this.send.name;

          debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
          debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( "Catched on: %O", sourcePosition );

          error.mark = strMark;
          error.logId = SystemUtilities.getUUIDv4();

          if ( logger &&
               typeof logger.error === "function" ) {

            logger.error( error );

          }

        }

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" ) {

        await currentTransaction.commit();

      }

      bResult = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.send.name;

      const strMark = "F64FEDFB548F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof logger.error === "function" ) {

        logger.error( error );

      }

      if ( currentTransaction !== null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

    }

    return bResult;

  }

  static async handlerListenOnTopic( strTopic: string,
                                     strMessage: string ): Promise<void> {

    try {

      if ( strTopic &&
           strMessage ) {

        const jsonMessage = CommonUtilities.parseJSON( strMessage,
                                                       LoggerManager.mainLoggerInstance );

        if ( strTopic === "ServerAlive" ) {

          if ( jsonMessage.Name === "Pong" &&
               jsonMessage.Server &&
               jsonMessage.Mark ) {

            ServerInstantMessage.peerServersLastReport[ jsonMessage.Server ] = jsonMessage.Mark;

          }

        }
        else if ( strTopic === ServerInstantMessage.strTopicServer ) {

          if ( jsonMessage.Name === "Ping" ) {

            //Publish
            NotificationManager.publishOnTopic( jsonMessage.Topic,
                                                {
                                                  Name: "Pong",
                                                  Server: ServerInstantMessage.strTopicServer,
                                                  Mark: SystemUtilities.getCurrentDateAndTime().format()
                                                },
                                                LoggerManager.mainLoggerInstance );

          }

        }
        else if ( strTopic === "InstantMessage" ) {

          if ( jsonMessage.Name === "Disconnect" ) {

            if ( jsonMessage.PresenceId !== "@error" &&
                 jsonMessage.Server === ServerInstantMessage.strTopicServer ) {

              await ServerInstantMessage.disconnect( ServerInstantMessage.strTopicServer,
                                                     jsonMessage,
                                                     LoggerManager.mainLoggerInstance );

            }

          }
          else if ( jsonMessage.Name === "Send" ) {

            await ServerInstantMessage.send( ServerInstantMessage.strTopicServer,
                                             jsonMessage,
                                             LoggerManager.mainLoggerInstance );

          }

        }

        let debugMark = debug.extend( "43C94E85E6B9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

        debugMark( `Received message "%s", in topic "%s"`, jsonMessage, strTopic );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.handlerListenOnTopic.name;

      const strMark = "E5D24EF6854B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

    }

  };

  static async checkServersAlive(): Promise<boolean> {

    let bResult = false;

    let currentTransaction = null;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

      }

      //Select Distinct A.Server From sysUserSessionPresence As A
      const serverList = await SYSUserSessionPresenceService.getUserSessionPresenceServerList( ServerInstantMessage.strTopicServer,
                                                                                               currentTransaction,
                                                                                               LoggerManager.mainLoggerInstance );

      if ( serverList instanceof Error === false ) {

        //Build object { "Server01": "2019-10-01T112:34:23Z-07:00", "Sever02": "2019-10-01T112:34:23Z-07:00" }
        for ( let intIndex = 0; intIndex < ( serverList as any ).length; intIndex++ ) {

          if ( !this.peerServersLastReport[ serverList[ intIndex ] ] ) {

            this.peerServersLastReport[ serverList[ intIndex ] ] = SystemUtilities.getCurrentDateAndTime().format();

          }
          else {

            //Check the las date in the build object and is mode old to 30 seconds remove from table sysUserSessionPresence
            const strLastReport = this.peerServersLastReport[ serverList[ intIndex ] ];

            const intSeconds = SystemUtilities.getCurrentDateAndTime().diff( strLastReport, "seconds" );

            if ( intSeconds >= 30 ) {

              await SYSUserSessionPresenceService.deleteUserSessionPresenceByServer( serverList[ intIndex ],
                                                                                     currentTransaction,
                                                                                     LoggerManager.mainLoggerInstance );

            }

          }

          //Publish on topic Server01 => { "Name": "ping", "Topic": "ServerAlive" }, Server02 => { "Name": "ping", "Topic": "ServerAlive" }
          for ( let intIndex = 0; intIndex < ( serverList as any ).length; intIndex++ ) {

            NotificationManager.publishOnTopic( serverList[ intIndex ],
                                                {
                                                  Name: "Ping",
                                                  Topic: "ServerAlive"
                                                },
                                                LoggerManager.mainLoggerInstance );

          }

        }

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkServersAlive.name;

      const strMark = "05C57E71F63D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

      if ( currentTransaction !== null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return bResult;

  }

  //Promoted to network leader
  static async nodeIsNetworkLeader( data: any ) {

    try {

      if ( SystemUtilities.bIsNetworkLeader ) {

        //Listen on
        await NotificationManager.listenOnTopic( "connectionListenOnTopicServerAlive",
                                                 "ServerAlive",
                                                 ServerInstantMessage.handlerListenOnTopic,
                                                 LoggerManager.mainLoggerInstance );

        const intCountResult = NetworkLeaderManager.countNodes();

        if ( intCountResult > 0 ) {

          //Clear the table Delete From sysUserSessionPresence As A Where A.Server = strServer
          await SYSUserSessionPresenceService.deleteUserSessionPresenceByServer( ServerInstantMessage.strTopicServer,
                                                                                 null,
                                                                                 LoggerManager.mainLoggerInstance );

        }
        else {

          //Clear the table Delete From sysUserSessionPresence As A
          await SYSUserSessionPresenceService.deleteUserSessionPresenceByServer( "*",
                                                                                 null,
                                                                                 LoggerManager.mainLoggerInstance );

        }

        ServerInstantMessage.checkIntervalHandler = setInterval( ServerInstantMessage.checkServersAlive,
                                                                 15000 ); //Every 15 seconds

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.nodeIsNetworkLeader.name;

      const strMark = "70AC7F233821" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

    }

  }

  //Demoted of network leader
  static async nodeIsNotNetworkLeader( data: any ) {

    try {

      clearInterval( ServerInstantMessage.checkIntervalHandler );

      //Unlisten on
      await NotificationManager.unlistenOnTopic( "connectionListenOnTopicServerAlive",
                                                 "ServerAlive",
                                                 LoggerManager.mainLoggerInstance );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.nodeIsNotNetworkLeader.name;

      const strMark = "C2C32F5C8603" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

    }

  }

  static async checkValidAuthToken( strAuth: string,
                                    socket: any,
                                    strServer: string,
                                    logger: any ): Promise<boolean> {

    let bResult = false;

    let currentTransaction = null;

    try {

      let debugMark = debug.extend( "D48995C9F278" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

      }

      let request = {
                      context: {
                                 Logger: LoggerManager.mainLoggerInstance,
                                 UserSessionStatus: null,
                                 Languaje: null
                               },
                    };

      let strAuthorization = null;

      strAuthorization = await CacheManager.getData( strAuth,
                                                     logger ); //get from cache the real authorization token

      if ( CommonUtilities.isNotNullOrEmpty( strAuthorization ) ) {

        let sysUserSessionPresence = await SYSUserSessionPresenceService.getByToken( strAuthorization,
                                                                                     null,
                                                                                     currentTransaction,
                                                                                     logger );

        if ( !sysUserSessionPresence ) {

          let userSessionStatus = await SystemUtilities.getUserSessionStatus( strAuthorization,
                                                                              null,
                                                                              false,
                                                                              false,
                                                                              currentTransaction,
                                                                              logger );

          request.context.UserSessionStatus = userSessionStatus;

          ( request as any ).returnResult = 1; //Force to return the result

          //Check for valid session token
          let resultData = await MiddlewareManager.middlewareCheckIsAuthenticated( request as any,
                                                                                   null, //Not write response back
                                                                                   null );

          if ( resultData &&
               resultData.StatusCode === 200 ) { //Ok the authorization token is valid

            const strRooms = await SYSUserSessionPresenceService.getConfigDefaultRooms( userSessionStatus,
                                                                                        currentTransaction,
                                                                                        logger );

            sysUserSessionPresence = await SYSUserSessionPresenceService.createOrUpdate(
                                                                                         {
                                                                                           UserSessionStatusToken: strAuthorization,
                                                                                           PresenceId: socket.id,
                                                                                           Server: strServer,
                                                                                           //Room: strRooms || "",
                                                                                           CreatedBy: userSessionStatus.UserName,
                                                                                           CreatedAt: null
                                                                                         },
                                                                                         false,
                                                                                         currentTransaction,
                                                                                         logger
                                                                                       );

            if ( sysUserSessionPresence instanceof Error ) {

              if ( logger &&
                  typeof logger.error === "function" ) {

                logger.error( sysUserSessionPresence as Error );

              }

              debugMark( "Error to create the user session presence %O", sysUserSessionPresence as Error );

            }
            else if ( !sysUserSessionPresence ) {

              if ( logger &&
                   typeof logger.error === "function" ) {

                logger.error( "Error to create user session presence is null" );

              }

              debugMark( "Error to create user session presence is null" );

            }
            else {

              const roomList = strRooms.split( "," );

              for ( let intIndexRoom = 0; intIndexRoom < roomList.length; intIndexRoom++ ) {

                await SYSUserSessionPresenceInRoomService.create(
                                                                  {
                                                                    Name: roomList[ intIndexRoom ],
                                                                    PresenceId: socket.id,
                                                                    CreatedBy: userSessionStatus.UserName,
                                                                  },
                                                                  currentTransaction,
                                                                  logger
                                                                );

              }

              socket.roomList = roomList; //strRooms.split( "," );

              debugMark( "The user session presence is created %O", ( sysUserSessionPresence as any ).dataValues );
              bResult = true;

            }

          }

        }
        else {

          if ( logger &&
               typeof logger.error === "function" ) {

            logger.error( "The user session already had presence" );

          }

          debugMark( "The user session already had presence" );

        }

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkValidAuthToken.name;

      const strMark = "FE441E322957" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof logger.error === "function" ) {

        logger.error( error );

      }

      if ( currentTransaction !== null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

    }

    return bResult;

  }

  static async handlerCleanExit() {

    await NotificationManager.publishOnTopic( "SystemEvent",
                                              {
                                                SystemId: ServerInstantMessage.strTopicServer,
                                                SystemName: process.env.APP_SERVER_IM_NAME,
                                                SubSystem: "Server",
                                                Token: "No apply",
                                                UserId: "No apply",
                                                UserName: "No apply",
                                                UserGroupId: "No apply",
                                                Code: "SERVER_IM_SHUTDOWN",
                                                EventAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                Data: {}
                                              },
                                              LoggerManager.mainLoggerInstance );

    if ( process.env.ENV !== "deV" ) {

      //Clear the table Delete From sysUserSessionPresence As A Where A.Server = strServer
      await SYSUserSessionPresenceService.deleteUserSessionPresenceByServer( ServerInstantMessage.strTopicServer,
                                                                             null,
                                                                             LoggerManager.mainLoggerInstance );

    }

    process.exit( 0 ); //Finish the process

  }

  static async main() {

    SystemUtilities.startRun = SystemUtilities.getCurrentDateAndTime(); //new Date();

    SystemUtilities.strBaseRunPath = __dirname;
    SystemUtilities.strBaseRootPath = appRoot.path;
    SystemUtilities.strAPPName = process.env.APP_SERVER_IM_NAME;

    try {

      ServerInstantMessage.strTopicServer = SystemUtilities.getHostName();

      if ( process.env.USE_NETWORK_ID_AS_SERVER_NAME === "1" &&
           SystemUtilities.strNetworkId ) {

        ServerInstantMessage.strTopicServer = SystemUtilities.strNetworkId;

      }

      let debugMark = debug.extend( "96FC81DDF449" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      debugMark( "%s", SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Main process started" );
      debugMark( "Running from: [%s]", SystemUtilities.strBaseRunPath );
      debugMark( "Topic server: [%s]", ServerInstantMessage.strTopicServer );

      LoggerManager.mainLoggerInstance = await LoggerManager.createMainLogger(); //Create the main logger

      CacheManager.currentInstance = await CacheManager.create( LoggerManager.mainLoggerInstance );

      await DBConnectionManager.connect( "*", LoggerManager.mainLoggerInstance ); //Init the connection to db using the orm

      await DBConnectionManager.loadQueryStatement( "*", LoggerManager.mainLoggerInstance );

      await I18NManager.create( {},
                                LoggerManager.createMainLogger );

      //Register in the net cluster manager
      NetworkLeaderManager.currentInstance = await NetworkLeaderManager.create(
                                                                                {
                                                                                  Discover: {
                                                                                              port: parseInt( process.env.APP_SERVER_IM_INSTANCES_DISCOVER_PORT )
                                                                                            },
                                                                                  OnPromotion: ServerInstantMessage.nodeIsNetworkLeader,
                                                                                  OnDemotion: ServerInstantMessage.nodeIsNotNetworkLeader,
                                                                                  OnNewNetworkLeader: null,
                                                                                  OnAdded: null,
                                                                                  OnRemoved: null
                                                                                },
                                                                                LoggerManager.mainLoggerInstance
                                                                              );

      await NotificationManager.listenOnTopic( "connectionListenOnTopicInstantMessage",
                                               "InstantMessage",
                                               ServerInstantMessage.handlerListenOnTopic,
                                               LoggerManager.mainLoggerInstance );

      /*
      await NotificationManager.listen(
                                        "redis",
                                        {
                                          Connection: "listenConnection",
                                          Topic: "TestTopic01",
                                          Handler: handlerFunction
                                        },
                                        LoggerManager.mainLoggerInstance
                                      );

      await NotificationManager.listen(
                                        "redis",
                                        {
                                          Connection: "listenConnection",
                                          Topic: "TestTopic02",
                                          Handler: handlerFunction
                                        },
                                        LoggerManager.mainLoggerInstance
                                      );
                                      */

      //new ChatServer();

      ServerInstantMessage.serverHTTP = http.createServer(); // this.app );

      ServerInstantMessage.socketIO = require( "socket.io" ).listen(
                                                                     ServerInstantMessage.serverHTTP,
                                                                     {
                                                                       resource: process.env.SERVER_ROOT_PATH + '/server/instant/message', //Very important
                                                                       origins: '*:*'
                                                                     }
                                                                   );

      const intPort = process.env.APP_SERVER_IM_PORT; //APP_SERVER_IM_PORT

      ServerInstantMessage.serverHTTP.listen( intPort, () => {

        debugMark( `Running server on *:%d%s`, intPort, process.env.SERVER_ROOT_PATH + '/server/instant/message' );

      });

      //Middleware before of connect
      ServerInstantMessage.socketIO.use( async ( socket: any, next: Function ) => {

        if ( await ServerInstantMessage.checkValidAuthToken( socket.handshake.query.auth,
                                                             socket,
                                                             ServerInstantMessage.strTopicServer,
                                                             LoggerManager.mainLoggerInstance ) ) {

          debugMark( "Auth %s is VALID", socket.handshake.query.auth );

          return next();

        }
        else {

          debugMark( "Auth %s is INVALID", socket.handshake.query.auth );

          next( new Error( 'Authentication token error' ) );

        }

      });

      ServerInstantMessage.socketIO.on( "connect", ( socket: any ) => {

        debugMark( "Connected client with id %s on port %s.", socket.id, intPort );

        socket.on( "newMessage", ( message: any ) => {

          //debugMark( "[server](message): %s", JSON.stringify( message ), socketId );

          debugMark( "New message sended from client with id %s. Making echo to message", socket.id, message );

          ServerInstantMessage.socketIO.in( socket.id ).emit( "newMessage", message );

        });

        socket.on( "disconnect", async ( strReason: string ) => {

          await ServerInstantMessage.disconnect(
                                                 ServerInstantMessage.strTopicServer,
                                                 {
                                                   PresenceId: socket.id,
                                                   Server: ServerInstantMessage.strTopicServer,
                                                   Disconnected: true
                                                 },
                                                 LoggerManager.mainLoggerInstance
                                               );

          debugMark( "Client with id %s disconnected", socket.id );

        });

        if ( socket.roomList ) {

          const roomList = socket.roomList;

          for ( let intRoomIndex = 0; intRoomIndex < roomList.length; intRoomIndex++ ) {

            socket.join( roomList[ intRoomIndex ] );

          }

        }

        //debugMark( "%O", socket.adapter.rooms );

      });

      process.on( 'SIGTERM', async () => {

        //console.info('SIGTERM signal received.');
        debugMark( "SIGTERM signal received." );

        ServerInstantMessage.handlerCleanExit();

      });

      process.on( 'SIGINT', () => {

        //console.info('SIGTERM signal received.');
        debugMark( "SIGINT signal received." );

        ServerInstantMessage.handlerCleanExit();

      });

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.main.name;

      const strMark = "D3EB365EE1D0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

    }

  }

}

ServerInstantMessage.main();
