import cluster from 'cluster';
//import uuidv4 from 'uuid/v4';
import appRoot from 'app-root-path';
import fs from 'fs'; //Load the filesystem module

import { DBMigrationManagerMYSQL } from "./DBMigrationManagerMYSQL";
import CommonUtilities from "../CommonUtilities";

//import config from "../../../01_database/00_config/config.json"
import SystemUtilities from '../SystemUtilities';
import { DBMigrationManagerORM } from './DBMigrationManagerORM';
import DBConnectionManager from './DBConnectionManager';
import CommonConstants from '../CommonConstants';

const debug = require( 'debug' )( 'DBMigrationManager' );

export default class DBMigrationManager {

  static async createDatabaseIfNotExits( strDatabase: string, logger: any ):Promise<boolean> {

    let bResult = false;

    try {

      if ( cluster.isMaster ) { //Only the master process can run the migration process

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

            const dbConfig = DBConnectionManager.processDBConfig( strCurrentDatabase, dbConfigData[ strCurrentDatabase ][ process.env.ENV ] ); //config[ process.env.ENV ]; //Get the config file

            if ( dbConfig[ "dialect" ] === "mysql" ) {

              bResult = await DBMigrationManagerMYSQL.createDatabaseIfNotExits( dbConfig, logger );

            }

          }
          catch ( error ) {

            const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

            sourcePosition.method = this.name + "." + this.createDatabaseIfNotExits.name;

            const strMark = "23B90706AAA4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      }
      else {

        bResult = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createDatabaseIfNotExits.name;

      const strMark = "D0190FC9A11C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async migrateUsingRawConnection( strDatabase: string, logger: any ):Promise<boolean> {

    let bResult = false;

    try {

      if ( cluster.isMaster ) { //Only the master process can run the migration process

        const strConfigFile = appRoot.path + "/db_config.json";

        fs.readFileSync( strConfigFile );

        const dbConfigData = require( strConfigFile );

        const dbConfig = DBConnectionManager.processDBConfig( strDatabase, dbConfigData[ strDatabase ][ process.env.ENV ] ); //config[ process.env.ENV ]; //Get the config file

        if ( dbConfig[ "dialect" ] === "mysql" ) {

          bResult = await DBMigrationManagerMYSQL.migrateDatabase( dbConfig, logger ) &&
                    await DBMigrationManagerMYSQL.importDataToDatabase( dbConfig, logger );

        }

      }
      else {

        bResult = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.migrateUsingRawConnection.name;

      const strMark = "402833EA35A3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async migrateUsingORMConnection( dbConnection: any, logger: any ):Promise<boolean> {

    let bResult = false;

    try {

      if ( cluster.isMaster ) { //Only the master process can run the migration process

        bResult = await DBMigrationManagerORM.migrateDatabase( dbConnection, logger ) &&
                  await DBMigrationManagerORM.importDataToDatabase( dbConnection, logger ) &&
                  await DBMigrationManagerORM.alwaysExecute( dbConnection, logger );

      }
      else {

        bResult = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.migrateUsingORMConnection.name;

      const strMark = "328A3440E32F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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