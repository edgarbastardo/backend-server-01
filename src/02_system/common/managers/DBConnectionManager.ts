import fs from 'fs'; //Load the filesystem module
import path from 'path';
import cluster from 'cluster';

import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import appRoot from 'app-root-path';

import CommonConstants from '../CommonConstants';

import CommonUtilities from '../CommonUtilities';
import SystemUtilities from '../SystemUtilities';
//import config from '../../../01_database/00_config/config.json';
//import BusinessQueries from "../../../01_database/05_query/mysql/BusinessQueries";
//import SystemQueries from "../../../01_database/05_query/mysql/SystemQueries";

const debug = require( 'debug' )( 'DBConnectionManager' );

export default class DBConnectionManager {

  private static dbConfig: any = {};

  private static dbConnection: any = {};

  private static dbConnectionError: any = {};

  private static queryStatements: any = {};

  static getDBConfig( strDatabase: string ): any {

    return { ...this.dbConfig[ strDatabase ] }; //Return a copy

  }

  static getAllDBConfig(): any {

    return this.dbConfig;

  }

  static getDBConnection( strDatabase: string ): any {

    return this.dbConnection[ strDatabase ];

  }

  static getAllDBConnection(): any {

    return this.dbConnection;

  }

  static getDBConnectionError( strDatabase: string ): any {

    return this.dbConnectionError[ strDatabase ];

  }

  static processDBConfig( strDatabase: string, dbConfig: any ) {

    //const result = dbConfig;

    if ( process.env[ strDatabase + "_DB_SERVER" ] ) {

      dbConfig.host = process.env[ strDatabase + "_DB_SERVER" ];

    }

    if ( process.env[ strDatabase + "_DB_SERVER_PORT" ] ) {

      dbConfig.port = process.env[ strDatabase + "_DB_SERVER_PORT" ];

    }

    if ( process.env[ strDatabase + "_DB_SERVER_DB_NAME" ] ) {

      dbConfig.database = process.env[ strDatabase + "_DB_SERVER_DB_NAME" ];

    }

    if ( process.env[ strDatabase + "_DB_SERVER_USER" ] ) {

      dbConfig.username = process.env[ strDatabase + "_DB_SERVER_USER" ];

    }

    if ( process.env[ strDatabase + "_DB_SERVER_PASSWORD" ] ) {

      dbConfig.password = process.env[ strDatabase + "_DB_SERVER_PASSWORD" ];


    }
    if ( process.env[ strDatabase + "_DB_SERVER_DIALECT" ] ) {

      dbConfig.dialect = process.env[ strDatabase + "_DB_SERVER_DIALECT" ];

    }

    return dbConfig;

  }

  static async connect( strDatabase: string, logger: any ): Promise<any> {

    let result: any = {};

    try {

      const strConfigFile = appRoot.path + "/db_config.json";

      fs.readFileSync( strConfigFile );

      const dbConfigData = require( strConfigFile );

      let databaseList = [];

      if ( strDatabase === "*" ) {

        const tempDatabaseList = Object.keys( dbConfigData );

        for ( let intDBIndex = 0; intDBIndex < tempDatabaseList.length; intDBIndex++ ) {

          const strCurrentDatabase = tempDatabaseList[ intDBIndex ];

          if ( dbConfigData[ strCurrentDatabase ].connect ) {

            databaseList.push( strCurrentDatabase );

          }

        }

      }
      else {

        databaseList.push( strDatabase );

      }

      for ( let intDBIndex = 0; intDBIndex < databaseList.length; intDBIndex++ ) {

        const strCurrentDatabase = databaseList[ intDBIndex ];

        try {

          const dbConfig = DBConnectionManager.processDBConfig( strCurrentDatabase,
                                                                dbConfigData[ strCurrentDatabase ][ process.env.ENV ] ); //config[ process.env.ENV ]; //Get the config file

          dbConfig.models = [];

          dbConfig.name = strCurrentDatabase;
          dbConfig.migrate = dbConfigData[ strCurrentDatabase ].migrate;
          dbConfig.system = dbConfigData[ strCurrentDatabase ].system;

          if ( dbConfigData[ strCurrentDatabase ].system === 1 ) {

            dbConfig.models.push( __dirname + `/../database/models/` );

          }

          if ( fs.existsSync( __dirname + `/../../../03_business/common/database/${strCurrentDatabase}/models/` ) ) {

            dbConfig.models.push( __dirname + `/../../../03_business/common/database/${strCurrentDatabase}/models/` );

          }

          /*
          dbConfig.migrations = [

            __dirname + '/migrations/',
            __dirname + "/../../business/common/database/migrations/"

          ]
          */

          dbConfig.define = {

            freezeTableName: true,
            timestamps: false,

          }

          dbConfig.logging = ( param01: any, param02: any ) => {

            //let debugMark = debug.extend( "960C40D97F5F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

            //debugMark( param01 );
            //debugMark( param02 );

          }

          dbConfig.isolationLevel = Transaction.ISOLATION_LEVELS.READ_COMMITTED;

          const Sequelize1 = require( 'sequelize' );
          const Op = Sequelize1.Op;

          dbConfig.operatorsAliases = {
                                        $eq: Op.eq,
                                        $ne: Op.ne,
                                        $gte: Op.gte,
                                        $gt: Op.gt,
                                        $lte: Op.lte,
                                        $lt: Op.lt,
                                        $not: Op.not,
                                        $in: Op.in,
                                        $notIn: Op.notIn,
                                        $is: Op.is,
                                        $like: Op.like,
                                        $notLike: Op.notLike,
                                        $iLike: Op.iLike,
                                        $notILike: Op.notILike,
                                        $regexp: Op.regexp,
                                        $notRegexp: Op.notRegexp,
                                        $iRegexp: Op.iRegexp,
                                        $notIRegexp: Op.notIRegexp,
                                        $between: Op.between,
                                        $notBetween: Op.notBetween,
                                        $overlap: Op.overlap,
                                        $contains: Op.contains,
                                        $contained: Op.contained,
                                        $adjacent: Op.adjacent,
                                        $strictLeft: Op.strictLeft,
                                        $strictRight: Op.strictRight,
                                        $noExtendRight: Op.noExtendRight,
                                        $noExtendLeft: Op.noExtendLeft,
                                        $and: Op.and,
                                        $or: Op.or,
                                        $any: Op.any,
                                        $all: Op.all,
                                        $values: Op.values,
                                        $col: Op.col
                                      };

          this.dbConfig[ strCurrentDatabase ] = dbConfig;
          this.dbConnection[ strCurrentDatabase ] = null;

          result[ strCurrentDatabase ] = {};
          result[ strCurrentDatabase ].dbConfig = dbConfig;
          result[ strCurrentDatabase ].dbConnection = null;

          const dbConnection = new Sequelize(
                                              dbConfig[ 'database' ],
                                              dbConfig[ 'username' ],
                                              dbConfig[ 'password' ],
                                              dbConfig,
                                            );

          await dbConnection.sync( { force: false } );

          const strMark = "C134AF0B2662" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

          const debugMark = debug.extend( strMark );

          debugMark( "Time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( "Success connected to database: [%s]", dbConfig.database );

          if ( logger &&
              typeof logger.info === "function" ) {

            logger.info( "Success connected to database: [%s]", dbConfig.database );

          }

          this.dbConnection[ strCurrentDatabase ] = dbConnection;

          result[ strCurrentDatabase ].dbConnection = dbConnection;

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = this.name + "." + this.connect.name;

          const strMark = "FBC0855E5E86" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

          const debugMark = debug.extend( strMark );

          debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
          debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( "Catched on: %O", sourcePosition );

          error.mark = strMark;
          error.logId = SystemUtilities.getUUIDv4();

          if ( logger &&
               typeof logger.error === "function" ) {

            error.catchedOn = sourcePosition;
            logger.error( error );

          }

          this.dbConnectionError[ strCurrentDatabase ] = error;

          result[ strCurrentDatabase ].dbError = error; //save the error

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.connect.name;

      const strMark = "5B41B4AB9161" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return result;

  }

  static async loadQueryStatement( strDatabase: string, logger: any ): Promise<any> {

    let result = { systemQueries: null, businessQueries: null };

    try {

      const strConfigFile = appRoot.path + "/db_config.json";

      fs.readFileSync( strConfigFile );

      const dbConfigData = require( strConfigFile );

      let databaseList = [];

      if ( strDatabase === "*" ) {

        const tempDatabaseList = Object.keys( dbConfigData );

        for ( let intDBIndex = 0; intDBIndex < tempDatabaseList.length; intDBIndex++ ) {

          const strCurrentDatabase = tempDatabaseList[ intDBIndex ];

          if ( dbConfigData[ strCurrentDatabase ].connect ) {

            databaseList.push( strCurrentDatabase );

          }

        }

      }
      else {

        databaseList.push( strDatabase );

      }

      for ( let intDBIndex = 0; intDBIndex < databaseList.length; intDBIndex++ ) {

        try {

          const strCurrentDatabase = databaseList[ intDBIndex ];

          const dbConfig = DBConnectionManager.processDBConfig( strCurrentDatabase,
                                                                dbConfigData[ strCurrentDatabase ][ process.env.ENV ] ); //config[ process.env.ENV ]; //Get the config file

          this.queryStatements[ strCurrentDatabase ] = {};

          let strPath = path.resolve( __dirname, `../../../01_database/05_query/${strCurrentDatabase}/${dbConfig.dialect}/`, `SystemQueries.js` );

          if ( dbConfig.system === 1 &&
               fs.existsSync( strPath ) ) {

            this.queryStatements[ strCurrentDatabase ].systemQueries = require( `../../../01_database/05_query/${strCurrentDatabase}/${dbConfig.dialect}/SystemQueries` ).default;

          }
          else {

            this.queryStatements[ strCurrentDatabase ].systemQueries = {};

          }

          strPath = path.resolve( __dirname, `../../../01_database/05_query/${strCurrentDatabase}/${dbConfig.dialect}/`, `BusinessQueries.js` );

          if ( fs.existsSync( strPath ) ) {

            this.queryStatements[ strCurrentDatabase ].businessQueries = require( `../../../01_database/05_query/${strCurrentDatabase}/${dbConfig.dialect}/BusinessQueries` ).default;

          }
          else {

            this.queryStatements[ strCurrentDatabase ].businessQueries = {};

          }

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = this.name + "." + this.loadQueryStatement.name;

          const strMark = "360B50D75EB1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

          const debugMark = debug.extend( strMark );

          debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
          debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( "Catched on: %O", sourcePosition );

          error.mark = strMark;
          error.logId = SystemUtilities.getUUIDv4();

          if ( logger &&
               typeof logger.error === "function" ) {

            error.catchedOn = sourcePosition;
            logger.error( error );

          }

        }

      }

      result = this.queryStatements;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.loadQueryStatement.name;

      const strMark = "0449A858CFA0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static getStatement( strDatabase: string,
                       strName: string,
                       params: any,
                       logger: any ): string {

    let strResult = null;

    try {

      let strDialect = this.dbConnection[ strDatabase ] ? this.dbConnection[ strDatabase ].options.dialect : "";

      if ( this.queryStatements[ strDatabase ] ) {

        if ( this.queryStatements[ strDatabase ].businessQueries ) {

          strResult = this.queryStatements[ strDatabase ].businessQueries.getStatement( strDialect,
                                                                                        strName,
                                                                                        params,
                                                                                        logger );

        }

        if ( !strResult && this.queryStatements[ strDatabase ].systemQueries ) {

          strResult = this.queryStatements[ strDatabase ].systemQueries.getStatement( strDialect,
                                                                                      strName,
                                                                                      params,
                                                                                      logger );

        }

      }


        /*
      }
      else if ( dbConfig.dialect == "pgsql" ) {

        result = require( '../../../01_database/05_query/pgsql/queries' ).default;

      }
      */

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.loadQueryStatement.name;

      const strMark = "0449A858CFA0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    return strResult;

  }

  static async close( strDatabase: string, logger: any ):Promise<boolean> {

    let bResult = false;

    try {

      if ( DBConnectionManager.dbConnection ) {

        await DBConnectionManager.getDBConnection( strDatabase ).close();

        bResult = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.close.name;

      const strMark = "0F07800FD89B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    return bResult;

  }
}

//export default dbConnection;