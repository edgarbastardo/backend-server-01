import mysql from "mysql2/promise";

//import Hashes from "jshashes";
//import uuidv4 from "uuid/v4";
//import moment from "moment-timezone";
import fs from "fs";
//import os from "os";
import cluster from "cluster";

import minify from "pg-minify";

import CommonConstants from "../CommonConstants";

import CommonUtilities from "../CommonUtilities";
import SystemUtilities from "../SystemUtilities";
//import config from "../database/00_config/config.json"

const debug = require( "debug" )( "DBMigrationManagerMYSQL" );

export class DBMigrationManagerMYSQL {

  static readonly _CODE_UNKNOWN_DATABASE = 1049;

  static async connectToDatabase( dbConfig: any, logger: any ): Promise<any> {

    //const dbConfig = config[ process.env.ENV ];

    let dbConnection = null;
    let intDBCode = 0;

    try {

      dbConnection = await mysql.createConnection({

        host: dbConfig[ "host" ],
        port: dbConfig[ "port" ],
        database: dbConfig[ "database" ],
        user: dbConfig[ "username" ],
        password: dbConfig[ "password" ],
        multipleStatements: true

      });

      //dbConnection.end();
      let debugMark = debug.extend( "E39C1722F64A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( `Success connected to database ${dbConfig[ "database" ]}!` );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.connectToDatabase.name;

      const strMark = "620274B3F533" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      intDBCode = error.errno;

      if ( intDBCode === this._CODE_UNKNOWN_DATABASE ) {

        debugMark( "Database [%s] NOT exists!", dbConfig[ "database" ] );

      }
      else {

        debugMark( "Error to connect to database code: %d!", intDBCode );

      }

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      if ( logger && typeof logger.error === "function" ) {

        error.logId = SystemUtilities.getUUIDv4();
        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return { dbCode: intDBCode, dbConnection };

  }

  static async oneTimeExecute( strDatabase: string, dbConnection: any, logger: any ): Promise<boolean> {

    let bResult: boolean = false;

    const strRootPath =  __dirname; //require( "app-root-path" );

    const strFullFilePath = strRootPath + `/../../../01_database/01_Before/${strDatabase}/mysql/00_one_time_execute.sql`;

    const bFileExists = fs.existsSync( strFullFilePath );

    try {

      let bException = false;

      const dateTime = SystemUtilities.getCurrentDateAndTime();

      //ANCHOR check is network leader
      if ( SystemUtilities.bIsNetworkLeader &&
           bFileExists ) {

        if ( logger &&
             typeof logger.info === "function" ) {

          logger.info( "Executing 00_one_time_execute.sql file" );

        }

        let debugMark = debug.extend( "89B7EABE381B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

        debugMark( "%s", dateTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( "Executing 00_one_time_execute.sql file" );

        const LineByLine = require( "n-readlines" );

        const lineReader = new LineByLine( strFullFilePath );

        let lineBuffer: any = null;

        while ( lineBuffer = lineReader.next() ) {

          if ( CommonUtilities.isNotNullOrEmpty( lineBuffer ) ) {

            let strLine: string = lineBuffer.toString();

            if ( strLine.trim().startsWith( "--" ) === false ) {

              try {

                await dbConnection.execute( strLine );

              }
              catch ( error ) {

                const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

                sourcePosition.method = this.name + "." + this.oneTimeExecute.name;

                bException = true;

                const strMark = "8CD33B3D9F6C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

                const debugMark = debug.extend( strMark );

                debugMark( "Error cannot execute the line [%s]", lineBuffer );
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

            }

          }

        }

      }
      else if ( bFileExists ) {

        if ( logger &&
             typeof logger.info === "function" ) {

          logger.info( "00_one_time_execute.sql file execution canceled. Is NOT the network leader" );

        }

        let debugMark = debug.extend( "43F85A59123C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

        debugMark( "%s", dateTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( "00_one_time_execute.sql file execution canceled. Is NOT the network leader" );

      }

      if ( bFileExists ) {

        if ( bException ||
             SystemUtilities.bIsNetworkLeader === false ) {

          fs.renameSync( strRootPath + `/../../../01_database/01_Before/${strDatabase}/mysql/00_one_time_execute.sql`, //Old path
                         strRootPath + `/../../../01_database/01_Before/${strDatabase}/mysql/00_one_time_executed_0.sql` ); //New path

        }
        else {

          fs.renameSync( strRootPath + `/../../../01_database/01_Before/${strDatabase}/mysql/00_one_time_execute.sql`, //Old path
                         strRootPath + `/../../../01_database/01_Before/${strDatabase}/mysql/00_one_time_executed_1.sql` ); //New path

          bResult = true;

        }

      }
      else {

        let debugMark = debug.extend( "83CCC3EBB0B0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

        debugMark( "%s", dateTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( "00_one_time_execute.sql file not exists!" );

        if ( logger &&
             typeof logger.info === "function" ) {

          logger.info( "00_one_time_execute.sql file not exists!" );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.oneTimeExecute.name;

      const strMark = "12B380393A00" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error cannot execute the one_time_execute.sql" );
      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

      if ( bFileExists ) {

        fs.renameSync( strRootPath + `/../../../01_database/01_Before/${strDatabase}/mysql/00_one_time_execute.sql`, //Old path
                       strRootPath + `/../../../01_database/01_Before/${strDatabase}/mysql/00_one_time_executed_0.sql` ); //new path

      }

    }

    return bResult;

  }

  static async allTimeExecute( strDatabase: string,
                               dbConnection: any,
                               logger: any ): Promise<boolean> {

    let bResult: boolean = false;

    //const minify = require( "pg-minify" );
    //const fs = require( "fs" );
    const strRootPath =  __dirname; //require( "app-root-path" );

    const strFullFilePath = strRootPath + `/../../../01_database/01_Before/${strDatabase}/mysql/01_all_time_execute.sql`;

    try {

      if ( fs.existsSync( strFullFilePath ) ) {

        const LineByLine = require( "n-readlines" );

        const lineReader = new LineByLine( strFullFilePath );

        let lineBuffer: any = null;

        let bException = false;

        while ( lineBuffer = lineReader.next() ) {

          if ( CommonUtilities.isNotNullOrEmpty( lineBuffer ) ) {

            let strLine = lineBuffer.toString();

            if ( strLine.trim().startsWith( "--" ) === false ) {

              try {

                await dbConnection.execute( strLine );

              }
              catch ( error ) {

                const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

                sourcePosition.method = this.name + "." + this.allTimeExecute.name;

                bException = true;

                const strMark = "5D1B35896BE5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

                const debugMark = debug.extend( strMark );

                debugMark( "Error cannot execute the line [%d]", strLine );
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

            }

          }

        }

        if ( bException === false ) {

          bResult = true;

        }

      }
      /*
      if ( fs.existsSync( strRootPath + "/../../../01_database/01_Before/${strDatabase}/mysql/01_all_time_execute.sql" ) ) {

        let strSQLContents = fs.readFileSync( strRootPath + "/../../../01_database/01_Before/${strDatabase}/mysql/01_all_time_execute.sql", "utf8" );

        strSQLContents = minify( strSQLContents, { compress: false } );

        if ( CommonUtilities.isNotNullOrEmpty( strSQLContents ) ) {

          await dbConnection.query( strSQLContents );

        }

        bResult = true;

      }
      */

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.allTimeExecute.name;

      const strMark = "3C139C08EF15" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error cannot execute the all_time_execute.sql" );
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

  static async createDatabaseIfNotExits( strDatabase: string,
                                         dbConfig: any,
                                         logger: any ): Promise<boolean> {

    let bResult: boolean = false;

    //const dbConfig = config[ process.env.ENV ];

    let { dbCode, dbConnection } = await this.connectToDatabase( dbConfig,
                                                                 logger );

    //let debugMark = debug.extend( "F1843CB142D4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );
    //debugMark( "DBCode => ", dbCode );
    //debugMark( "DBConnection => ", dbCode );
    //process.exit( 0 );

    if ( dbConnection === null &&
         dbCode === this._CODE_UNKNOWN_DATABASE ) { //Error code mysql for unknown DB

      try {

        dbConnection = await mysql.createConnection({

          host: dbConfig[ "host" ],
          port: dbConfig[ "port" ],
          //database: "sys", //For mysql only you can ommit the database
          user: dbConfig[ "username" ],
          password: dbConfig[ "password" ],

        });

        let strCreatedDB = dbConfig[ "migration" ].createDatabase;

        strCreatedDB = strCreatedDB.replace( "@__database__@", dbConfig[ "database" ] );

        await dbConnection.query( strCreatedDB );

        await this.oneTimeExecute( strDatabase,
                                   dbConnection,
                                   logger );

        await this.allTimeExecute( strDatabase,
                                   dbConnection,
                                   logger );

        dbConnection.end();

        bResult = true;

        let debugMark = debug.extend( "153D3F412FC7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( `Database %s created!`, dbConfig[ "database" ] );

      }
      catch ( error ) {

        const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

        sourcePosition.method = this.name + "." + this.createDatabaseIfNotExits.name;

        const strMark = "46A2A0FAC6D0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

        const debugMark = debug.extend( strMark );

        debugMark( "Error cannot create the database [%s]!", dbConfig[ "database" ] );
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

    }
    else if ( dbConnection !== null ) {

      try {

        await this.oneTimeExecute( strDatabase,
                                   dbConnection,
                                   logger );
        await this.allTimeExecute( strDatabase,
                                   dbConnection,
                                  logger );

        dbConnection.end();

        bResult = true;

      }
      catch ( error ) {

        const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

        sourcePosition.method = this.name + "." + this.createDatabaseIfNotExits.name;

        const strMark = "C72838D56BF9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return bResult;

  }

  static async checkTableExits( dbConnection: any,
                                strTableName: string,
                                logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      if ( CommonUtilities.isNotNullOrEmpty( dbConnection ) ) {

        await dbConnection.query( "Select * From " + strTableName );

        bResult = true;

      }
      else {

        let debugMark = debug.extend( "0BC54529C028" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( `No database connection available!` );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkTableExits.name;

      const strMark = "BE9C7187F2AC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( `The table ${strTableName} not exists!` );
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

  static async getTableContent( dbConnection: any,
                                strTableName: string,
                                logger: any ): Promise<any> {

    let result = [];

    try {

      if ( CommonUtilities.isNotNullOrEmpty( dbConnection ) ) {

        result = await dbConnection.query( "Select * From " + strTableName );

      }
      else {

        let debugMark = debug.extend( "A09F15562CCB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( `No database connection available!` );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getTableContent.name;

      const strMark = "6F0F15FF494D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static checkFileExecuted( tableContent: any,
                            strFilePath: string,
                            strFileName: string,
                            logger: any ): boolean {

    let bResult = false;

    try {

      if ( Array.isArray( tableContent ) &&
           tableContent.length > 0 ) {

        for ( let row of tableContent[ 0 ] ) {

          if ( row[ "FilePath" ] === strFilePath &&
               row[ "FileName" ] === strFileName ) {

            bResult = true;
            break;

          }

        }

        /*
        tableContent[ 0 ].forEach( ( row: any, intIndex: number ) => {

          let debugMark = debug.extend( "F42473B14422" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );
          debugMark( "FilePath => ", strFilePath );
          debugMark( "FileName => ", strFileName );
          debugMark( "Row FP => ", row[ "FilePath" ] );
          debugMark( "Row FN => ", row[ "FileName" ] );

        })
        */

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkFileExecuted.name;

      const strMark = "5F8D44B544BA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async executeSQLFile( dbConnection: any,
                               strMigrationsFolder: string,
                               strFileName: string,
                               logger: any ) {

    let bSuccess = false;
    let bEmptyContent = false;
    let strContentCheckSum = null;

    try {

      let strFileContent = fs.readFileSync( strMigrationsFolder + "/" + strFileName, "utf8" );

      strFileContent = minify( strFileContent, { compress: false } );

      if ( CommonUtilities.isNotNullOrEmpty( strFileContent ) ) {

        await dbConnection.query( strFileContent );

        strContentCheckSum = SystemUtilities.hashString( strFileContent, 2, null ); //Hashes.CRC32( strFileContent ).toString( 16 );

        bSuccess = true;

      }
      else {

        bEmptyContent = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.executeSQLFile.name;

      const strMark = "65897C93FC1C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error to execute the SQL migration file [%s]", strFileName );
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

    return { bSuccess, bEmptyContent, strContentCheckSum }

  }

  static async migrateDatabase( strDatabase: string,
                                dbConfig: any,
                                logger: any ): Promise<boolean> {

    let bResult = false;

    let { dbConnection } = await this.connectToDatabase( dbConfig,
                                                         logger );

    try {

      const dbMigrationContent = await this.getTableContent( dbConnection,
                                                             "sysDBMigratedData",
                                                             logger );

      const strRootPath = __dirname; //require( "app-root-path" );
      const strMigrationsFolder = strRootPath + `/../../../01_database/02_migration_data/${strDatabase}/mysql/`;
      const path = require("path")
      const os = require( "os" );

      const dirs = fs.existsSync( strMigrationsFolder ) ? fs.readdirSync( strMigrationsFolder ): [];

      const loopAsync = async () => {

        await CommonUtilities.asyncForEach( dirs as any, async ( strFileName: string ) => {

          if ( this.checkFileExecuted( dbMigrationContent,
                                       strMigrationsFolder,
                                       strFileName,
                                       logger ) === false ) {

            let bEmptyContent = true;
            let bSuccess = false;
            let strContentCheckSum = null;

            const strFileExt = path.extname( strFileName );

            if ( strFileExt === ".sql" ) {

              const resultCall = await this.executeSQLFile( dbConnection,
                                                            strMigrationsFolder,
                                                            strFileName,
                                                            logger );

              bSuccess = resultCall.bSuccess;
              bEmptyContent = resultCall.bEmptyContent;
              strContentCheckSum = resultCall.strContentCheckSum;

            }
            else if ( strFileExt === ".js" ||
                      strFileExt === ".ts" ) {

              const strOnlyFileName = strFileName.replace( strFileExt, "" );

              try {

                const migrationModule = require( strMigrationsFolder + strOnlyFileName );

                const resultCall = await migrationModule.default.migrateUp( dbConnection, logger ); //Call the migrate method

                bSuccess = resultCall.bSuccess;
                bEmptyContent = resultCall.bEmptyContent;

                if ( bSuccess && bEmptyContent === false ) {

                  const strFileContent = fs.readFileSync( strMigrationsFolder + "/" + strFileName, "utf8" );

                  strContentCheckSum = SystemUtilities.hashString( strFileContent, 2, null ); //Hashes.CRC32( strFileContent ).toString( 16 );

                }

              }
              catch ( error ) {

                const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

                sourcePosition.method = this.name + "." + this.migrateDatabase.name;

                const strMark = "63A1BFFBD80C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

                const debugMark = debug.extend( strMark );

                debugMark( "Error to execute the script migration from the file [%s]!", strFileName );
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

            }

            if ( bEmptyContent === false ) { //Not take info for empty content files

              try {

                const strFullPathCheckSum = SystemUtilities.hashString( strMigrationsFolder + "/" + strFileName, 2, null ); //Hashes.CRC32( strMigrationsFolder + "/" + strFileName ).toString( 16 );

                const strValues = "'" + SystemUtilities.getUUIDv4() + "','" + os.hostname() + "','" + strMigrationsFolder + "','" + strFileName + "','" + strFullPathCheckSum + "','" + strContentCheckSum + "'," + ( bSuccess ? 1 : 0 ) + ",NULL,'backend@system.net','" + SystemUtilities.getCurrentDateAndTime().format() + "'";

                const strSQL = `Insert Into sysDBMigratedData( Id, SystemId, FilePath, FileName, FullPathCheckSum, ContentCheckSum, Success, Comment, CreatedBy, CreatedAt ) Values( ${strValues} )`;

                await dbConnection.execute( strSQL );

              }
              catch ( error ) {

                const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

                sourcePosition.method = this.name + "." + this.migrateDatabase.name;

                const strMark = "A6AD6A129C3B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

                const debugMark = debug.extend( strMark );

                debugMark( "Error to insert the executed migration data from the file [%s]!", strFileName );
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

            }

          }

        });

        dbConnection.end();

        bResult = true;

      }

      await loopAsync();

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.migrateDatabase.name;

      const strMark = "1AA4D8876852" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error to migrate database!" );
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

  static async importDataToDatabase( strDatabase: string,
                                     dbConfig: any,
                                     logger: any ): Promise<boolean> {

    let bResult = false;

    let { dbConnection } = await this.connectToDatabase( dbConfig,
                                                         logger );

    try {

      const dbImportedDataContent = await this.getTableContent( dbConnection,
                                                                "sysDBImportedData",
                                                                logger );

      const strRootPath = __dirname; //require( "app-root-path" );
      const strImportDataFolder = strRootPath + `/../../../01_database/03_import_data/${strDatabase}/mysql/`;
      const path = require("path")
      const os = require( "os" );

      const dirs = fs.existsSync( strImportDataFolder ) ? fs.readdirSync( strImportDataFolder ): [];

      const loopAsync = async () => {

        await CommonUtilities.asyncForEach( dirs as any, async ( strFileName: string ) => {

          if ( this.checkFileExecuted( dbImportedDataContent,
                                       strImportDataFolder,
                                       strFileName,
                                       logger ) === false ) {

            let bEmptyContent = true;
            let bSuccess = false;
            let strContentCheckSum = null;

            const strFileExt = path.extname( strFileName );

            if ( strFileExt === ".sql" ) {

              const resultCall = await this.executeSQLFile( dbConnection,
                                                            strImportDataFolder,
                                                            strFileName,
                                                            logger );

              bSuccess = resultCall.bSuccess;
              bEmptyContent = resultCall.bEmptyContent;
              strContentCheckSum = resultCall.strContentCheckSum;

            }
            else if ( strFileExt === ".js" ||
                      strFileExt === ".ts" ) {

              const strOnlyFileName = strFileName.replace( strFileExt, "" );

              try {

                const importDataModule = require( strImportDataFolder + strOnlyFileName );

                const resultCall = await importDataModule.default.importUp( dbConnection, logger ); //Call the import method

                bSuccess = resultCall.bSuccess;
                bEmptyContent = resultCall.bEmptyContent;

                if ( bSuccess && bEmptyContent === false ) {

                  const strFileContent = fs.readFileSync( strImportDataFolder + "/" + strFileName, "utf8" );

                  strContentCheckSum = SystemUtilities.hashString( strFileContent, 2, null ); //Hashes.CRC32( strFileContent ).toString( 16 );

                }

              }
              catch ( error ) {

                const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

                sourcePosition.method = this.name + "." + this.importDataToDatabase.name;

                const strMark = "5DEB105335BB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

                const debugMark = debug.extend( strMark );

                debugMark( "Error to execute the script migration from the file [%s]!", strFileName );
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

            }

            if ( bEmptyContent === false ) { //Not take info for empty content files

              try {

                const strFullPathCheckSum = SystemUtilities.hashString( strImportDataFolder + "/" + strFileName, 2, null ); //Hashes.CRC32( strImportDataFolder + "/" + strFileName ).toString( 16 );

                const strValues = "'" + SystemUtilities.getUUIDv4() + "','" +
                                  os.hostname() + "','" +
                                  strImportDataFolder + "','" +
                                  strFileName + "',''" +
                                  strFullPathCheckSum + "','" +
                                  strContentCheckSum + "'," +
                                  ( bSuccess ? 1 : 0 ) +
                                  ",NULL,'backend@system.net','" +
                                  SystemUtilities.getCurrentDateAndTime().format() + "'";

                const strSQL = `Insert Into sysDBImportedData( Id, SystemId, FilePath, FileName, FullPathCheckSum, ContentCheckSum, Success, Comment, CreatedBy, CreatedAt ) Values( ${strValues} )`;

                await dbConnection.execute( strSQL );

              }
              catch ( error ) {

                const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

                sourcePosition.method = this.name + "." + this.importDataToDatabase.name;

                const strMark = "25B384A39488" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

                const debugMark = debug.extend( strMark );

                debugMark( "Error to insert the imported data from the file [%s]!", strFileName );
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

            }

          }

        });

        dbConnection.end();

        bResult = true;

      }

      await loopAsync();

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.importDataToDatabase.name;

      const strMark = "9E5AA5DC9F86" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( `Error to migrate database!` );
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
