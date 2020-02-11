import fs from 'fs'; //Load the filesystem module
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

  static currentInstance: any = null;

  static queryStatements: any = null;

  static getDBConfig( dbConfig: any ) {

    //const result = dbConfig;

    if ( process.env.DB_SERVER ) {

      dbConfig.host = process.env.DB_SERVER;

    }

    if ( process.env.DB_SERVER_PORT ) {

      dbConfig.port = process.env.DB_SERVER_PORT;

    }

    if ( process.env.DB_SERVER_DB_NAME ) {

      dbConfig.database = process.env.DB_SERVER_DB_NAME;

    }

    if ( process.env.DB_SERVER_USER ) {

      dbConfig.username = process.env.DB_SERVER_USER;

    }

    if ( process.env.DB_SERVER_PASSWORD ) {

      dbConfig.password = process.env.DB_SERVER_PASSWORD;


    }
    if ( process.env.DB_SERVER_DIALECT ) {

      dbConfig.dialect = process.env.DB_SERVER_DIALECT;

    }

    return dbConfig;

  }

  static async create( logger: any ): Promise<any> {

    let result = null;

    try {

      const strConfigFile = appRoot.path + "/db_config.json";

      fs.readFileSync( strConfigFile );

      const dbConfigData = require( strConfigFile );

      const dbConfig = DBConnectionManager.getDBConfig( dbConfigData[ process.env.ENV ] ); //config[ process.env.ENV ]; //Get the config file

      dbConfig.models = [

        __dirname + '/../database/models/',
        __dirname + "/../../../03_business/common/database/models/"

      ]

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

      result = new Sequelize(

        dbConfig[ 'database' ],
        dbConfig[ 'username' ],
        dbConfig[ 'password' ],
        dbConfig,

      )

      await result.sync( { force: false } );

      const strMark = "C134AF0B2662" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Success connected to database: [%s]", dbConfig.database );

      if ( logger &&
           typeof logger.info === "function" ) {

        logger.info( "Success connected to database: [%s]", dbConfig.database );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.create.name;

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

  static async loadQueryStatement( logger: any ): Promise<any> {

    let result = { systemQueries: null, businessQueries: null };

    try {

      const strConfigFile = appRoot.path + "/db_config.json";

      fs.readFileSync( strConfigFile );

      const dbConfigData = require( strConfigFile );

      const dbConfig = DBConnectionManager.getDBConfig( dbConfigData[ process.env.ENV ] ); //config[ process.env.ENV ]; //Get the config file

      result.systemQueries = require( `../../../01_database/05_query/${dbConfig.dialect}/SystemQueries` ).default;
      result.businessQueries = require( `../../../01_database/05_query/${dbConfig.dialect}/BusinessQueries` ).default;

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

  static getStatement( strName: string,
                       params: any,
                       logger: any ): string {

    let strResult = null;

    try {

      let strDialect = this.currentInstance ? this.currentInstance.options.dialect : "";

      if ( this.queryStatements ) {

        if ( this.queryStatements.businessQueries ) {

          strResult = this.queryStatements.businessQueries.getStatement( strDialect,
                                                                         strName,
                                                                         params,
                                                                         logger );

        }

        if ( !strResult && this.queryStatements.systemQueries ) {

          strResult = this.queryStatements.systemQueries.getStatement( strDialect,
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

  static async close( logger: any ):Promise<boolean> {

    let bResult = false;

    try {

      if ( DBConnectionManager.currentInstance ) {

        await DBConnectionManager.currentInstance.close();

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