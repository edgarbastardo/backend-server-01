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

let debug = require( 'debug' )( 'server_intant_message@main_process' );

export default class InstantMessageServer {

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

        InstantMessageServer.socketIO.in( message.PresenceId ).disconnect();

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

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

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

      const userSessionPresenceList = await SYSUserSessionPresenceService.getUserSessionPresenceIdByUserName( strServer,
                                                                                                              message.To.Name,
                                                                                                              currentTransaction,
                                                                                                              logger );

      if ( userSessionPresenceList instanceof Error === false ) {

        for ( let intIndex = 0; intIndex < ( userSessionPresenceList as any ).length; intIndex++ ) {

          try {

            InstantMessageServer.socketIO.in( userSessionPresenceList[ intIndex ].PresenceId ).emit( "NewMessage", message );

            //TODO Implent a log of message sended

          }
          catch ( error ) {


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

      sourcePosition.method = this.name + "." + this.send.name;

      const strMark = "F64FEDFB548F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
        catch ( error1 ) {


        }

      }

    }

    return bResult;

  }

  static async handlerFunction( strTopic: string, message: any ): Promise<void> {

    try {

      if ( strTopic &&
           message ) {

        if ( strTopic === "ServerAlive" ) {

          if ( message.Name === "Pong" &&
               message.Server &&
               message.Mark ) {

            InstantMessageServer.peerServersLastReport[ message.Server ] = message.Mark;

          }

        }
        else if ( strTopic === InstantMessageServer.strTopicServer ) {

          if ( message.Name === "Ping" ) {

            //Publish
            NotificationManager.publishOnTopic( message.Topic,
                                                {
                                                  Name: "Pong",
                                                  Server: this.strTopicServer,
                                                  Mark: SystemUtilities.getCurrentDateAndTime().format()
                                                },
                                                LoggerManager.mainLoggerInstance );

          }

        }
        else if ( strTopic === "InstantMessage" ) {

          if ( message.Name === "Disconnect" ) {

            if ( message.PresenceId !== "@error" &&
                 message.Server === this.strTopicServer ) {

              await InstantMessageServer.disconnect( this.strTopicServer,
                                                     message,
                                                     LoggerManager.mainLoggerInstance );

            }

          }
          else if ( message.Name === "Send" ) {

            await InstantMessageServer.send( this.strTopicServer,
                                             message,
                                             LoggerManager.mainLoggerInstance );

          }

        }

        let debugMark = debug.extend( "43C94E85E6B9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

        debugMark( `Received message "%s", in topic "%s"`, message, strTopic );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.handlerFunction.name;

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
      const serverList = await SYSUserSessionPresenceService.getUserSessionPresenceServerList( this.strTopicServer,
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
        await NotificationManager.listenOnTopic( "connectionListenServerAlive",
                                                 "ServerAlive",
                                                 InstantMessageServer.handlerFunction,
                                                 LoggerManager.mainLoggerInstance );

        const intCountResult = NetworkLeaderManager.countNodes();

        if ( intCountResult > 0 ) {

          //Clear the table Delete From sysUserSessionPresence As A Where A.Server = strServer
          await SYSUserSessionPresenceService.deleteUserSessionPresenceByServer( InstantMessageServer.strTopicServer,
                                                                                 null,
                                                                                 LoggerManager.mainLoggerInstance );

        }
        else {

          //Clear the table Delete From sysUserSessionPresence As A
          await SYSUserSessionPresenceService.deleteUserSessionPresenceByServer( "*",
                                                                                 null,
                                                                                 LoggerManager.mainLoggerInstance );

        }

        InstantMessageServer.checkIntervalHandler = setInterval( InstantMessageServer.checkServersAlive,
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

      clearInterval( InstantMessageServer.checkIntervalHandler );

      //Unlisten on
      await NotificationManager.unlistenOnTopic( "connectionListenServerAlive",
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
                                    logger: any ): Promise<boolean> {

    let bResult = false;

    let currentTransaction = null;

    try {

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

        const sysUserSessionPresence = await SYSUserSessionPresenceService.getByToken( strAuthorization,
                                                                                       null,
                                                                                       currentTransaction,
                                                                                       logger );

        if ( sysUserSessionPresence ) {

          let userSessionStatus = await SystemUtilities.getUserSessionStatus( strAuthorization,
                                                                              null,
                                                                              true,
                                                                              false,
                                                                              currentTransaction,
                                                                              logger );

          request.context.UserSessionStatus = userSessionStatus;

        }

        ( request as any ).returnResult = 1; //Force to return the result

        //Check for valid session token
        let resultData = await MiddlewareManager.middlewareCheckIsAuthenticated( request as any,
                                                                                 null, //Not write response back
                                                                                 null );

        if ( resultData &&
             resultData.StatusCode === 200 ) { //Ok the authorization token is valid

          bResult = true;

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

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

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

  static async main() {

    SystemUtilities.startRun = SystemUtilities.getCurrentDateAndTime(); //new Date();

    SystemUtilities.strBaseRunPath = __dirname;
    SystemUtilities.strBaseRootPath = appRoot.path;
    SystemUtilities.strAPPName = process.env.APP_SERVER_IM_NAME;

    try {

      InstantMessageServer.strTopicServer = SystemUtilities.getHostName();

      if ( process.env.USE_NETWORK_ID_AS_SERVER_NAME === "1" &&
           SystemUtilities.strNetworkId ) {

        InstantMessageServer.strTopicServer = SystemUtilities.strNetworkId;

      }

      let debugMark = debug.extend( "96FC81DDF449" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      debugMark( "%s", SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Main process started" );
      debugMark( "Running from: [%s]", SystemUtilities.strBaseRunPath );
      debugMark( "Topic server: [%s]", InstantMessageServer.strTopicServer );

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
                                                                                  OnPromotion: InstantMessageServer.nodeIsNetworkLeader,
                                                                                  OnDemotion: InstantMessageServer.nodeIsNotNetworkLeader,
                                                                                  OnNewNetworkLeader: null,
                                                                                  OnAdded: null,
                                                                                  OnRemoved: null
                                                                                },
                                                                                LoggerManager.mainLoggerInstance
                                                                              );

      await NotificationManager.listenOnTopic( "connectionListenIM",
                                               "InstantMessage",
                                               InstantMessageServer.handlerFunction,
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

      InstantMessageServer.serverHTTP = http.createServer(); // this.app );

      InstantMessageServer.socketIO = require( "socket.io" ).listen(
                                                                     InstantMessageServer.serverHTTP,
                                                                     {
                                                                       resource: process.env.SERVER_ROOT_PATH + '/server/instant/message', //Very important
                                                                       origins: '*:*'
                                                                     }
                                                                   );

      const intPort = process.env.APP_SERVER_IM_PORT; //APP_SERVER_IM_PORT

      InstantMessageServer.serverHTTP.listen( intPort, () => {

        debugMark( `Running server on *:%d%s`, intPort, process.env.SERVER_ROOT_PATH + '/server/instant/message' );

      });

      InstantMessageServer.socketIO.use( async ( socket: any, next: Function ) => {

        if ( await InstantMessageServer.checkValidAuthToken( socket.handshake.query.auth,
                                                             LoggerManager.mainLoggerInstance ) ) {

          return next();

        }
        else {

          debugMark( "Auth %s is invalid", socket.handshake.query.auth );

          next( new Error( 'Authentication token error' ) );

        }

      });

      InstantMessageServer.socketIO.on( "connect", ( socket: any ) => {

        debugMark( "Connected client on port %s.", intPort );

        socket.on( "NewMessage", ( message: any ) => {

          //debugMark( "[server](message): %s", JSON.stringify( message ), socketId );

          InstantMessageServer.socketIO.in( socket.id ).emit( "NewMessage", message );

        });

        socket.on( "disconnect", () => {

          debugMark( "Client disconnected" );

        });

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

InstantMessageServer.main();
