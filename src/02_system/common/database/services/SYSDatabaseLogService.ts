import cluster from 'cluster';

//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import CommonConstants from "../../CommonConstants";
import SystemConstants from "../../SystemContants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

import { SYSRole } from "../models/SYSRole";

import DBConnectionManager from '../../managers/DBConnectionManager';
import LoggerManager from '../../managers/LoggerManager';

import BaseService from "./BaseService";
import SYSConfigMetaDataService from "./SYSConfigMetaDataService";
import SYSConfigValueDataService from "./SYSConfigValueDataService";
import { SYSDatabaseLog } from "../models/SYSDatabaseLog";
import { config } from 'bluebird';

const debug = require( 'debug' )( 'SYSDatabaseLogService' );

export default class SYSDatabaseLogService extends BaseService {

  static readonly _ID = "sysDatabaseLogService";

  static checkTableNeedLog( strDatabase: string,
                            strTablename: string,
                            strOperation: string,
                            configData: any,
                            logger: any ): boolean {

    let bResult = false;

    try {

      if ( configData.Value ) {

        configData.Value = CommonUtilities.parseJSON( configData.Value, logger );

        if ( configData.Value &&
            configData.Value[ strDatabase + "." + strTablename ] &&
            configData.Value[ strDatabase + "." + strTablename ].includes( strOperation ) ) {

          bResult = true;

        }

      }

      if ( bResult === false &&
           configData.Default ) {

        configData.Default = CommonUtilities.parseJSON( configData.Default, logger );

        if ( configData.Value &&
            configData.Value[ strDatabase + "." + strTablename ] &&
            configData.Value[ strDatabase + "." + strTablename ].includes( strOperation ) ) {

          bResult = true;

        }

      }

    }
    catch ( error ) {

      //

    }

    return bResult;

  }

  static async logTableOperation( strDatabase: string,
                                  strTable: string,
                                  strOperation: string,
                                  instance: any,
                                  oldDataValues: any ): Promise<SYSDatabaseLog|Error> {

    let result = null;

    let logger = LoggerManager.mainLoggerInstance;

    let currentTransaction = null;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_Database_Log_Tables.Id,
                                                                           SystemConstants._CONFIG_ENTRY_Database_Log_Tables.Owner,
                                                                           currentTransaction,
                                                                           logger );

      let sysDatabaseLogInDB = null;

      if ( this.checkTableNeedLog( strDatabase,
                                   strTable,
                                   strOperation,
                                   configData,
                                   logger ) ) {

        if ( strOperation === "create" ) {

          sysDatabaseLogInDB = await SYSDatabaseLog.create(
                                                            {
                                                              Operation: strOperation,
                                                              Database: strDatabase,
                                                              Table: strTable,
                                                              Data: ( instance as any ).dataValues,
                                                              CreatedBy: instance.CreatedBy,
                                                              CreatedAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                              ExtraData: null
                                                            },
                                                            { transaction: currentTransaction }
                                                          );

          bApplyTransaction = true;

        }
        else if ( strOperation === "update" ) {

          //const oldDataValues = ( instance as any )._previousDataValues;
          const newDataValues = ( instance as any ).dataValues;

          const jsonDiff = {};

          if ( instance.getPrimaryKey ) {

            const primaryKey = instance.getPrimaryKey();

            for ( let intIndex = 0; intIndex < primaryKey.length; intIndex++ ) {

              jsonDiff[ primaryKey[ intIndex ] ] = instance[ primaryKey[ intIndex ] ];

            }

          }

          //Made the diff json object
          const keyList = Object.keys( newDataValues );

          let bDiff = false;

          for ( let intIndex = 0; intIndex < keyList.length; intIndex++ ) {

            const strKey = keyList[ intIndex ];

            if ( newDataValues[ strKey ] !== undefined &&
                 oldDataValues[ strKey ] !== undefined &&
                 newDataValues[ strKey ] != oldDataValues[ strKey ] ) {

              jsonDiff[ strKey ] = { OldValue: oldDataValues[ strKey ], NewValue: newDataValues[ strKey ] };
              bDiff = true;

            }

          }

          if ( bDiff ) {

            sysDatabaseLogInDB = await SYSDatabaseLog.create(
                                                              {
                                                                Operation: strOperation,
                                                                Database: strDatabase,
                                                                Table: strTable,
                                                                Data: jsonDiff,
                                                                CreatedBy: instance.CreatedBy,
                                                                CreatedAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                                ExtraData: null
                                                              },
                                                              { transaction: currentTransaction }
                                                            );

            bApplyTransaction = true;

          }

        }
        else if ( strOperation === "delete" ) {

          sysDatabaseLogInDB = await SYSDatabaseLog.create(
                                                            {
                                                              Operation: strOperation,
                                                              Database: strDatabase,
                                                              Table: strTable,
                                                              Data: ( instance as any ).dataValues,
                                                              CreatedBy: instance.CreatedBy,
                                                              CreatedAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                              ExtraData: null
                                                            },
                                                            { transaction: currentTransaction }
                                                          );

          bApplyTransaction = true;

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

      result = sysDatabaseLogInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.logTableOperation.name;

      const strMark = "0737C772FC74" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof LoggerManager.mainLoggerInstance === "function" ) {

        error.catchedOn = sourcePosition;
        LoggerManager.mainLoggerInstance.error( error );

      }

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

      result = error;

    }

    return result;

  }

}