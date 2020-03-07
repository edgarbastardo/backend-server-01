//import mysql from 'mysql2/promise';

//import Hashes from 'jshashes';
//import uuidv4 from 'uuid/v4';
//import moment from 'moment-timezone';
import fs from 'fs';
import cluster from "cluster";
//import minify from 'pg-minify';

import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import CommonConstants from '../CommonConstants';
import SystemConstants from "../SystemContants";

import CommonUtilities from '../CommonUtilities';
import SystemUtilities from '../SystemUtilities';

//import config from "../database/00_config/config.json"
import { SYSDBMigratedData } from '../database/models/SYSDBMigratedData';
import { SYSDBImportedData } from '../database/models/SYSDBImportedData';

const debug = require( 'debug' )( 'DBMigrationManagerORM' );

export class DBMigrationManagerORM {

  static async checkTableExits( dbConnection: any,
                                strTableName: string,
                                logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      if ( CommonUtilities.isNotNullOrEmpty( dbConnection ) ) {

        await dbConnection.query( "Select * From " + strTableName, {
                                                                     raw: true,
                                                                     type: QueryTypes.SELECT
                                                                   } );

        bResult = true;

      }
      else {

        let debugMark = debug.extend( '2F866EBC3283' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( `No database connection available!` );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkTableExits.name;

      const strMark = "ADEC7F415353" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "The table [%s] not exists!", strTableName );
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

        result = await dbConnection.query( "Select * From " + strTableName, {
                                                                              raw: true,
                                                                              type: QueryTypes.SELECT
                                                                            } );

      }
      else {

        let debugMark = debug.extend( '3EFDDB863595' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( `No database connection available!` );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getTableContent.name;

      const strMark = "77674D0CF60D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static getFileExecuted( tableContent: any,
                            strFilePath: string,
                            strFileName: string,
                            logger: any ): any {

    let result = null;

    try {

      if ( Array.isArray( tableContent ) &&
           tableContent.length > 0 ) {

        for ( let row of tableContent ) {

          if ( row[ 'FilePath' ] === strFilePath &&
               row[ 'FileName' ] === strFileName ) {

            result = row;
            break;

          }

        }

        /*
        tableContent[ 0 ].map( ( row: any, intIndex: number ) => {

          let debugMark = debug.extend( '3F31461C084F' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
          debugMark( "FilePath => ", strFilePath );
          debugMark( "FileName => ", strFileName );
          debugMark( "Row FP => ", row[ 'FilePath' ] );
          debugMark( "Row FN => ", row[ 'FileName' ] );

        })
        */

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getFileExecuted.name;

      const strMark = "7EE5480378AB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async migrateDatabase( strDatabase: string, dbConnection: any, logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const dbMigrationContent = await this.getTableContent( dbConnection,
                                                             "sysDBMigratedData",
                                                             null ); //Force silent errors

      const strRootPath = __dirname; //require( 'app-root-path' );
      const strMigrationsFolder = strRootPath + `/../../../01_database/02_migration_data/${strDatabase}/orm/`;
      const path = require('path')
      //const os = require( 'os' );

      const dirs = fs.existsSync( strMigrationsFolder ) ? fs.readdirSync( strMigrationsFolder ): [];

      const loopAsync = async () => {

        await CommonUtilities.asyncForEach( dirs as any, async ( strFileName: string ) => {

          if ( this.getFileExecuted( dbMigrationContent,
                                     strMigrationsFolder,
                                     strFileName,
                                     logger ) === null ) {

            let bEmptyContent = true;
            let bSuccess = false;
            let strContentCheckSum = null;

            const strFileExt = path.extname( strFileName );

            if ( strFileExt === ".js" ||
                 strFileExt === ".ts" ) {

              const strOnlyFileName = strFileName.replace( strFileExt, "" );

              try {

                const migrationModule = require( strMigrationsFolder + strOnlyFileName );

                const resultCall = await migrationModule.default.migrateUp( dbConnection, logger ); //Call the migrate method

                bSuccess = resultCall.bSuccess;
                bEmptyContent = resultCall.bEmptyContent;

                if ( bSuccess && bEmptyContent === false ) {

                  const strFileContent = fs.readFileSync( strMigrationsFolder + "/" + strFileName, 'utf8' );

                  strContentCheckSum = SystemUtilities.hashString( strFileContent, 2, null ); //Hashes.CRC32( strFileContent ).toString( 16 );

                }

              }
              catch ( error ) {

                const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

                sourcePosition.method = this.name + "." + this.migrateDatabase.name;

                const strMark = "5F3DE434B7C2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

                await SYSDBMigratedData.create( {
                                               FilePath: strMigrationsFolder,
                                               FileName: strFileName,
                                               FullPathCheckSum: strFullPathCheckSum,
                                               ContentCheckSum: strContentCheckSum,
                                               Success: ( bSuccess ? 1 : 0 ),
                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
                                             } );
                /*
                const strValues = "'" + SystemUtilities.getUUIDv4() + "','" + os.hostname() + "','" + strMigrationsFolder + "','" + strFileName + "','" + strFullPathCheckSum + "','" + strContentCheckSum + "'," + ( bSuccess ? 1 : 0 ) + ",NULL,'backend@system.net','" + SystemUtilities.getCurrentDateAndTime().format() + "'";

                const strSQL = `Insert Into sysDBMigratedData( Id, SystemId, FilePath, FileName, FullPathCheckSum, ContentCheckSum, Success, Comment, CreatedBy, CreatedAt ) Values( ${strValues} )`;

                await dbConnection.execute( strSQL );
                */

              }
              catch ( error ) {

                const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

                sourcePosition.method = this.name + "." + this.migrateDatabase.name;

                const strMark = "2DD9427C1C90" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

                const debugMark = debug.extend( strMark );

                debugMark( "Error to insert the executed migration data for the file %s!", strFileName );
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

        bResult = true;

      }

      await loopAsync();

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.migrateDatabase.name;

      const strMark = "D57A07564F39" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                                     dbConnection: any,
                                     logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const dbImportedDataContent = await this.getTableContent( dbConnection,
                                                                "sysDBImportedData",
                                                                logger );

      const strRootPath = __dirname; //require( 'app-root-path' );
      const strImportDataFolder = strRootPath + `/../../../01_database/03_import_data/${strDatabase}/orm/`;
      const path = require('path')
      const os = require( 'os' );

      const dirs = fs.existsSync( strImportDataFolder ) ? fs.readdirSync( strImportDataFolder ): [];

      const loopAsync = async () => {

        await CommonUtilities.asyncForEach( dirs as any, async ( strFileName: string ) => {

          if ( this.getFileExecuted( dbImportedDataContent,
                                     strImportDataFolder,
                                     strFileName,
                                     logger ) === null ) {

            let bEmptyContent = true;
            let bSuccess = false;
            let strContentCheckSum = null;

            const strFileExt = path.extname( strFileName );

            if ( strFileExt === ".js" ||
                 strFileExt === ".ts" ) {

              const strOnlyFileName = strFileName.replace( strFileExt, "" );

              try {

                const importDataModule = require( strImportDataFolder + strOnlyFileName );

                const resultCall = await importDataModule.default.importUp( dbConnection, logger ); //Call the import method

                bSuccess = resultCall.bSuccess;
                bEmptyContent = resultCall.bEmptyContent;

                if ( bSuccess && bEmptyContent === false ) {

                  const strFileContent = fs.readFileSync( strImportDataFolder + "/" + strFileName, 'utf8' );

                  strContentCheckSum = SystemUtilities.hashString( strFileContent, 2, null ); //Hashes.CRC32( strFileContent ).toString( 16 );

                }

              }
              catch ( error ) {

                const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

                sourcePosition.method = this.name + "." + this.importDataToDatabase.name;

                const strMark = "A2FF434B0B5F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

                const strFullPathCheckSum = strContentCheckSum = SystemUtilities.hashString( strImportDataFolder + "/" + strFileName, 2, null ); //Hashes.CRC32( strImportDataFolder + "/" + strFileName ).toString( 16 );

                await SYSDBImportedData.create(
                                                {
                                                  FilePath: strImportDataFolder,
                                                  FileName: strFileName,
                                                  FullPathCheckSum: strFullPathCheckSum,
                                                  ContentCheckSum: strContentCheckSum,
                                                  Success: ( bSuccess ? 1 : 0 ),
                                                  CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
                                                }
                                              );

                /*
                const strValues = "'" + SystemUtilities.getUUIDv4() + "','" + os.hostname() + "','" + strImportDataFolder + "','" + strFileName + "','" + strFullPathCheckSum + "','" + strContentCheckSum + "'," + ( bSuccess ? 1 : 0 ) + ",NULL,'backend@system.net','" + SystemUtilities.getCurrentDateAndTime().format() + "'";

                const strSQL = `Insert Into sysDBImportedData( Id, SystemId, FilePath, FileName, FullPathCheckSum, ContentCheckSum, Success, Comment, CreatedBy, CreatedAt ) Values( ${strValues} )`;

                await dbConnection.execute( strSQL );
                */

              }
              catch ( error ) {

                const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

                sourcePosition.method = this.name + "." + this.importDataToDatabase.name;

                const strMark = "1B86A993C171" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

        bResult = true;

      }

      await loopAsync();

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.importDataToDatabase.name;

      const strMark = "BB9C524DB6B6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async alwaysExecute( strDatabase: string,
                              dbConnection: any,
                              logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const dbImportedDataContent = await this.getTableContent( dbConnection,
                                                                "sysDBImportedData",
                                                                logger );

      const strRootPath = __dirname; //require( 'app-root-path' );
      const strImportDataFolder = strRootPath + `/../../../01_database/04_always_execute/${strDatabase}/orm/`;
      const path = require('path')
      //const os = require( 'os' );

      const dirs = fs.existsSync( strImportDataFolder ) ? fs.readdirSync( strImportDataFolder ): [];

      const loopAsync = async () => {

        await CommonUtilities.asyncForEach( dirs as any, async ( strFileName: string ) => {

          let bEmptyContent = true;
          let bSuccess = false;
          let strContentCheckSum = null;

          const strFileExt = path.extname( strFileName );

          const importedDataRow = this.getFileExecuted( dbImportedDataContent,
                                                        strImportDataFolder,
                                                        strFileName,
                                                        logger );

          if ( strFileExt === ".js" ||
               strFileExt === ".ts" ) {

            const strOnlyFileName = strFileName.replace( strFileExt, "" );

            try {

              const importDataModule = require( strImportDataFolder + strOnlyFileName );

              if ( CommonUtilities.isNullOrEmpty( importDataModule.default.disabled ) ||
                   importDataModule.default.disabled() === false ) {

                const resultCall = await importDataModule.default.execute( dbConnection, null, logger ); //Call the import method

                bSuccess = resultCall.bSuccess;
                bEmptyContent = resultCall.bEmptyContent;

                if ( bSuccess && bEmptyContent === false ) {

                  const strFileContent = fs.readFileSync( strImportDataFolder + "/" + strFileName, 'utf8' );

                  strContentCheckSum = SystemUtilities.hashString( strFileContent, 2, null ); //Hashes.CRC32( strFileContent ).toString( 16 );

                }

              }

            }
            catch ( error ) {

              const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

              sourcePosition.method = this.name + "." + this.alwaysExecute.name;

              const strMark = "C4D455C1E245" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

              const debugMark = debug.extend( strMark );

              debugMark( "Error to execute the script from the file [%s]!", strFileName );
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

              const strFullPathCheckSum = strContentCheckSum = SystemUtilities.hashString( strImportDataFolder + "/" + strFileName, 2, null );

              if ( importedDataRow === null ) {

                await SYSDBImportedData.create( {
                                               FilePath: strImportDataFolder,
                                               FileName: strFileName,
                                               FullPathCheckSum: strFullPathCheckSum,
                                               ContentCheckSum: strContentCheckSum,
                                               Success: ( bSuccess ? 1 : 0 ),
                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
                                             } );

              }
              else {

                importedDataRow.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

                await SYSDBImportedData.update( importedDataRow, { where: { Id: importedDataRow.Id } } );

              }

            }
            catch ( error ) {

              const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

              sourcePosition.method = this.name + "." + this.alwaysExecute.name;

              const strMark = "D44D194323A5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

              const debugMark = debug.extend( strMark );

              debugMark( "Error to execute the file [%s]!", strFileName );
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

        });

        bResult = true;

      }

      await loopAsync();

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.alwaysExecute.name;

      const strMark = "599C839FB8B4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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