import fetch from 'node-fetch';
import appRoot from 'app-root-path';

import cluster from "cluster";
import fs from "fs"; //Load the filesystem module

import CommonConstants from './02_system/common/CommonConstants';
//import SystemConstants from "./02_system/common/SystemContants";

import CommonUtilities from './02_system/common/CommonUtilities';
import SystemUtilities from './02_system/common/SystemUtilities';

//require( "dotenv" ).config( { path: appRoot.path + "/.env.bootstrap" } ); //Read the .env.bootstrap file, in the root folder of project

const debug = require( "debug" )( "bootstrap@main_process" );

export default class App {

  static async downloadFileContent( headers: any,
                                    strRequestPath: string ): Promise<any> {

    let result = {
                   input: null,
                   output: null,
                   error: null
                 };

    try {

      const options = {
                        method: 'GET',
                        headers: headers,
                        body: null,
                      };

      const callResult = await fetch( strRequestPath,
                                      options );

      result.output = callResult ? {
                                     status: callResult.status,
                                     statusText: callResult.statusText,
                                     body: await callResult.text()
                                   }:
                                   {
                                     status: null,
                                     statusText: null,
                                     body: { Code: "" }
                                   };

       result.input = options;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = App.name + "." + App.downloadFileContent.name;

      const strMark = "FBE4A2FAC1A8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );
      debugMark( "Error: %O", error );

      result.error = error;

    }

    return result;

  }

  static async main() {

    try {

      SystemUtilities.startRun = SystemUtilities.getCurrentDateAndTime();

      const strMark = "798F2A43C36E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      if ( process.env.CONFIG_URI ) {

        const headers = {
                          "Authorization": "Basic " + Buffer.from( process.env.CONFIG_AUTH_USER + ":" + process.env.CONFIG_AUTH_PASSWORD ).toString( "base64" )
                        };

        const filesToDownload = process.env.CONFIG_FILES ? process.env.CONFIG_FILES.split( "," ): [];

        const strDateTimeFromBackup = SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_08 );

        for ( let intIndex = 0; intIndex < filesToDownload.length; intIndex++ ) {

          let strFileToDownload = filesToDownload[ intIndex ];

          //console.log( process.env );

          debugMark( "Downloading file from %s", process.env.CONFIG_URI + "/" + strFileToDownload );

          let result = await App.downloadFileContent( headers,
                                                      process.env.CONFIG_URI + "/" + strFileToDownload );

          if ( !result.error &&
               result.output &&
               result.output.status === 200 &&
               result.output.body ) {

            debugMark( "Success downloaded file" );

            const strDownloadedFileContentHash = SystemUtilities.hashString( result.output.body,
                                                                             2,
                                                                             null );

            if ( fs.existsSync( appRoot.path + "/" + strFileToDownload ) ) {

              const strLocalFileContentHash = await SystemUtilities.getFileHash( appRoot.path + "/" + strFileToDownload,
                                                                                   "crc32",
                                                                                   null );

              debugMark( "Local file %s", appRoot.path + "/" + strFileToDownload );
              debugMark( "The local file CRC32: %s already exists. Checking content are NOT the same.", strLocalFileContentHash );

              if ( strLocalFileContentHash !== strDownloadedFileContentHash ) {

                debugMark( "The downloaded file CRC32: %s and the local file CRC32: %s are NOT the same", strDownloadedFileContentHash, strLocalFileContentHash );

                fs.mkdirSync( appRoot.path + "/config_backup/" + strDateTimeFromBackup,
                              { recursive: true } );

                fs.renameSync( appRoot.path + "/" + strFileToDownload,                                                //Old path
                               appRoot.path + "/config_backup/" + strDateTimeFromBackup + "/" + strFileToDownload );  //New path

                debugMark( "Saved a copy of the local file to %s", appRoot.path + "/config_backup/" + strDateTimeFromBackup + "/" + strFileToDownload );

                fs.writeFileSync( appRoot.path + "/" + strFileToDownload,
                                  result.output.body );

                debugMark( "Overwrited the local file with the remote file content %s, CRC32: ", appRoot.path + "/" + strFileToDownload, strDownloadedFileContentHash );

              }
              else {

                debugMark( "The remote file and the local file are the same CRC32: %s", strLocalFileContentHash );

              }

            }
            else {

              debugMark( "The downloaded file CRC32: %s", strDownloadedFileContentHash );
              debugMark( "The local file NOT exists. Creating the local file using downloaded file content" );

              fs.writeFileSync( appRoot.path + "/" + strFileToDownload,
                                result.output.body );

            }

          }
          else {

            debugMark( "Download failed" );
            debugMark( "HTTP status code: %s", result?.output?.status );
            debugMark( "Body === null: %s", result?.output?.body === null );
            debugMark( "Error message %s", result?.error?.message ? result.error?.message : "No message available" );

          }

        }

      }

      debugMark( "Process finished" );
    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = App.name + "." + App.main.name;

      const strMark = "C007B21D3C5B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );
      debugMark( "Error: %O", error );

    }

  }

}

App.main();
