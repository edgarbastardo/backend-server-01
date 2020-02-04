import cluster from 'cluster';
import appRoot from 'app-root-path';
import winston, { format } from 'winston';
import { consoleFormat } from 'winston-console-format';
import os from "os";
import fs from 'fs';

import safeStringify from 'fast-safe-stringify';

import SystemUtilities from '../SystemUtilities';

import CommonUtilities from '../CommonUtilities';
import CommonConstants from '../CommonConstants';

import { PapertrailConnection, PapertrailTransport } from '../others/logs/winston/papertrail/winston-papertrail';

const debug = require( 'debug' )( 'LoggerManager' );

require( 'dotenv' ).config( { path: appRoot.path + "/.env.log" } );

export default class LoggerManager {

  static mainLoggerInstance: any = null;

  static async createMainLogger(): Promise<any> {

    let result = null;

    if ( process.env.USE_LOGGER === "1" &&
         process.env.LOG_TO !== "" ) {

      const strHostname = os.hostname();

      const strWorkerId = cluster.isMaster ? "master" : cluster.worker.id;

      const strDateTimeFormat = SystemUtilities.startRun.format( "YYYY-MM-DD-HH-mm-ss-ZZ" );

      try {

        // define the custom settings for each transport (file, console)
        const options = {

          file: {

            //level: 'error',
            filename: `${appRoot}/logs/${os.hostname}/${strDateTimeFormat}_${strWorkerId}/main.logger.log`,
            handleExceptions: true,
            json: false,
            maxsize: 5242880, // 5MB
            maxFiles: 10,
            colorize: false,
            format: winston.format.printf( ( info ) => {

              //return `${SystemUtilities.getCurrentDateAndTime().format()}, ${JSON.stringify( info, null, 2 ) }`;
              return `${SystemUtilities.getCurrentDateAndTime().format()}, ${safeStringify( info, null, 2 ) }`;

            } )
            //format: formatter

          },

          console: {

            format: winston.format.combine(

              winston.format.colorize( { all: true } ),
              winston.format.padLevels(),

              consoleFormat({

                showMeta: true,
                //metaStrip: [ "timestamp", "service" ],
                inspectOptions: {
                  depth: 4, //Infinity,
                  colors: true,
                  maxArrayLength: 10, //Infinity,
                  breakLength: 120,
                  compact: true //Infinity
                }

              })

            )

          },

          papertrail: {

            connection: {

              host: process.env.LOG_SERVER_IP, //"logs6.papertrailapp.com",
              port: parseInt( process.env.LOG_SERVER_PORT, 10 ), //40541
              loggingEnabled: process.env.USE_LOGGER === "1",

            },

            config: {

              level: "debug",
              program: strHostname,
              hostname: process.env.APP_NAME + "_" + process.env.ENV,
              inlineMeta: true,
              depth: 1,

              logFormat: function( level: any, logData: any ): string {

                let strResult = "";

                try {

                  let debugMark = debug.extend( '948014A902B0' );
                  //debugMark( "%O", logData );

                  delete logData[ Symbol.for( 'level' ) ];
                  delete logData[ Symbol.for( 'message' ) ];
                  delete logData[ Symbol.for( 'splat' ) ];

                  if ( logData[ "stack" ] ) {

                    /*
                    delete logData[ "0" ]; //M
                    delete logData[ "1" ]; //S
                    delete logData[ "2" ]; //G
                    */

                    const callStack = logData[ "stack" ].split( "\n" );

                    //callStack.splice( 0, 1 );

                    const stackEntries = [];

                    callStack.forEach( function( stackEntry: any ) {

                      stackEntries.push( stackEntry.trim() );

                    });

                    logData[ "stack" ] = stackEntries;

                    //debugMark( "%O", callStack );

                  }

                  strResult = safeStringify( logData );

                }
                catch ( error ) {

                  const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

                  const strMark = "407668BA0C97";

                  const debugMark = debug.extend( strMark );

                  debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
                  debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
                  debugMark( "Catched on: %O", sourcePosition );
                  debugMark( "Error: %O", error );

                }

                return strResult;

              }

            }

          }

        };

        const papertrailConnection = options.papertrail.connection.host &&
                                     options.papertrail.connection.port ?
                                     new PapertrailConnection( options.papertrail.connection ):
                                     null;

        let loggerTransports = [];

        process.env.LOG_TO.includes( "#file#" ) ? loggerTransports.push( new winston.transports.File( options.file ) ): null;
        process.env.LOG_TO.includes( "#screen#" ) ? loggerTransports.push( new winston.transports.Console( options.console ) ): null;
        process.env.LOG_TO.includes( "#papertrail#" ) && papertrailConnection ? loggerTransports.push( new PapertrailTransport( papertrailConnection, options.papertrail.config ) ): null;

        if ( loggerTransports.length === 0 ) {

          loggerTransports.push( //Add dummy transport, to silent warning of winston with no transport defined

            new winston.transports.Stream({

              stream: fs.createWriteStream( '/dev/null' )

            })

          );

        }

        const appendFields = format( ( info, opts ) => {

          info.timestamp = SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_02 ); //opts.tz

          info.timestamp = info.timestamp.replace( "@", "Z" );

          info.hostname = strHostname;

          return info;

        });

        if ( process.env.USE_LOGGER === "1" ) {

          // instantiate a new Winston Logger with the settings defined above
          result = winston.createLogger({

            format: winston.format.combine(

              //winston.format.timestamp(),
              //label({ label: 'main' }),
              appendFields(),
              //winston.format.ms(),
              winston.format.errors( { stack: true } ),
              winston.format.splat(),
              winston.format.json()

            ),

            transports: loggerTransports,

            levels: winston.config.syslog.levels,
            //level: "debug",

            exitOnError: false, // do not exit on handled exceptions

          });

          // create a stream object with a 'write' function that will be used by `morgan`
          ( result as any ).stream = {

            write: function( message: any, encoding: any ) {

              // use the 'info' log level so the output will be picked up by both transports (file and console)
              result.info( message );

            },

          }

          if ( result &&
               cluster.isMaster ) {

            const strMark = "ECC59FC6D91D";

            result.info( "Logger success configured", { mark: strMark } );

            if ( process.env.LOG_LAUNCH_TEST_ERROR === "1" ) {

              result.error( new Error( "This is a test error. Put LOG_LAUNCH_TEST_ERROR=0 in the file [.env.log] in the root project folder. For not generate this error anymore." ), { mark: strMark } ); //Made a test

            }

          }

        }

      }
      catch ( error ) {

        const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

        const strMark = "48EC1617E459";

        const debugMark = debug.extend( strMark );

        debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
        debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_02 ) );
        debugMark( "Catched on: %O", sourcePosition );
        debugMark( "Error: %O", error );

      }

    }
    else {

      const strMark = "CCF62026BB7C";

      const debugMark = debug.extend( strMark );

      debugMark( "No logger config defined check for the file [.env.log]. In the root folder of project." );

    }

    return result;

  }

}
