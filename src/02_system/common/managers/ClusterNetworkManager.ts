import Discover from '@dashersw/node-discover';
import os from "os";

import CommonUtilities from "../CommonUtilities";
//import uuidv4 from 'uuid/v4';
import SystemUtilities from "../SystemUtilities";
import CommonConstants from "../CommonConstants";

const debug = require( 'debug' )( 'ClusterNetworkManager' );

export default class ClusterNetworkManager {

  static currentInstance: any = null;

  static async create( logger: any ): Promise<any> {

    let result = null;

    try {

      await new Promise<any>( function( resolve, reject ) {

        let debugMark = debug.extend( "AA21700D550C" );

        result = new Discover();

        let bResolvePending = true;

        result.on( "promotion", function () {

          const dateTime = SystemUtilities.getCurrentDateAndTime();

          SystemUtilities.isNetworkLeader = true;
          SystemUtilities.isNetworkLeaderAt = dateTime;
          process.env.IS_NETWORK_LEADER = "1";

          if ( logger &&
               typeof logger.info === "function" ) {

            logger.info( "I was promoted to network leader." );

          }

          debugMark( "%s", dateTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( "I was promoted to network leader." );

          bResolvePending ? resolve() : null;
          bResolvePending = false;

        });

        result.on( "demotion", function () {

          const dateTime = SystemUtilities.getCurrentDateAndTime();

          SystemUtilities.isNetworkLeader = false;
          SystemUtilities.isNetworkLeaderAt = dateTime;
          process.env.IS_NETWORK_LEADER = "1";

          if ( logger &&
               typeof logger.info === "function" ) {

            logger.info( "I was demoted from being a network leader." );

          }

          debugMark( "%s", dateTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( "I was demoted from being a network leader." );

          bResolvePending ? resolve() : null;
          bResolvePending = false;

        });

        result.on( "added", function ( obj: any ) {

          const dateTime = SystemUtilities.getCurrentDateAndTime();

          if ( logger &&
               typeof logger.info === "function" ) {

            logger.info( "A new node has been added." );

          }

          debugMark( "%s", dateTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( "A new network node instance has been added. %O", obj );

          //bResolvePending ? resolve() : null;
          //bResolvePending = false;

        });

        result.on( "removed", function ( obj: any ) {

          const dateTime = SystemUtilities.getCurrentDateAndTime();

          if ( logger &&
               typeof logger.info === "function" ) {

            logger.info( "A node has been removed." );

          }

          debugMark( "%s", dateTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( "%s: A network node instance has been removed. %O", obj );

          //bResolvePending ? resolve() : null;
          //bResolvePending = false;

        });

        result.on( "master", function ( obj: any ) {

          const dateTime = SystemUtilities.getCurrentDateAndTime();

          if ( logger &&
               typeof logger.info === "function" ) {

            logger.info( "A new network leader is in control." );

          }

          debugMark( "%s", dateTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( "A new network leader is in control. %O", obj );

          bResolvePending ? resolve() : null;
          bResolvePending = false;

        });

      });

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.create.name;

      const strMark = "02B23FBC8D15";

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

}