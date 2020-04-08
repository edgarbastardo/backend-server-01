//import fs from 'fs';
//import { promises as fsPromises } from 'fs';
//import os from "os";
//import path from 'path';
//import appRoot from 'app-root-path';
import cluster from 'cluster';

//import util from 'util';

import CommonConstants from '../../../CommonConstants';

import CommonUtilities from "../../../CommonUtilities";
import SystemUtilities from "../../../SystemUtilities";

import DBConnectionManager from '../../../managers/DBConnectionManager';
//import { Redis, Cluster } from 'ioredis';

const debug = require( 'debug' )( '001_SampleTask' );

export default class SampleTask_001 {

  public readonly Name = "001_SampleTask";

  public async init( params: any, logger: any ): Promise<boolean> {

    let bResult = false;

    try {

        bResult = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = SampleTask_001.name + "." + this.init.name;

      const strMark = "91E69871EB08" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  public async canRunTask( params: any, logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      bResult = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = SampleTask_001.name + "." + this.canRunTask.name;

      const strMark = "87B30C77FDAE" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  public async runTask( params: any, logger: any ): Promise<boolean> {

    let bResult = false;

    let currentTransaction = null;

    const strMark = "B6BF8BB0C7C6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

    const debugMark = debug.extend( strMark );

    debugMark( "starting => " + SystemUtilities.getCurrentDateAndTime().format() );

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" ); //secondary

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

      }

      debugMark( "working" );

      if ( currentTransaction !== null &&
          currentTransaction.finished !== "rollback" ) {

        await currentTransaction.commit();

      }

      bResult = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = SampleTask_001.name + "." + this.runTask.name;

      const strMark = "B0F11596DB70" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction !== null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    debugMark( "finished => " + SystemUtilities.getCurrentDateAndTime().format() );

    return bResult;

  }

}