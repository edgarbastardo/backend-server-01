import cluster from 'cluster';

import fs from 'fs';
import os from 'os';

import FormData from 'form-data';

import appRoot from 'app-root-path';

import CommonConstants from '../../../../02_system/common/CommonConstants';

import CommonUtilities from "../../../../02_system/common/CommonUtilities";
import SystemUtilities from "../../../../02_system/common/SystemUtilities";

import DBConnectionManager from '../../../../02_system/common/managers/DBConnectionManager';

import TicketImagesService from "../../../common/database/secondary/services/TicketImagesService";
import BinaryRequestServiceV1 from '../../../common/services/BinaryRequestServiceV1';
import CommonRequestService from "../../../common/services/CommonRequestService";
import SystemConstants from '../../../../02_system/common/SystemContants';

let debug = require( 'debug' )( '001_MigrateImagesTask' );

export default class MigrateImagesTask_001 {

  public readonly Name = "MigrateImagesTask_001";

  static async uploadImage( headers: any,
                            requestOptions: any,
                            logger: any ): Promise<{
                                                     result: boolean,
                                                     data: any
                                                   }> {

    let result = {
                   result: false,
                   data: null
                 };

    try {

      const strFullPath = requestOptions.path + requestOptions.fileName;

      const strFileCheckSum = await SystemUtilities.getFileHash( strFullPath,
                                                                 "md5",
                                                                 logger );

      const binaryRequest = new FormData();

      binaryRequest.append( "File", fs.createReadStream( strFullPath ) );
      binaryRequest.append( "Id", requestOptions.id || null );
      binaryRequest.append( "Date", requestOptions.date || null );
      binaryRequest.append( "AccessKind", requestOptions.accessKind || "2" );  //1 = Public, 2 = Authenticated, 3 = Role
      binaryRequest.append( "StorageKind", requestOptions.storageKind || "0" ); //0 = Persistent 1 = Temporal
      binaryRequest.append( "Category", requestOptions.category || "default" ); //"Ticket_Image_From_Odin"
      binaryRequest.append( "Label", requestOptions.label || "default" ); //"Ticket Image From Odin"
      binaryRequest.append( "Tag", requestOptions.tag || "#default#" ); //"#Ticket#,#Image#,#Odin#"
      binaryRequest.append( "Context", requestOptions.contextData ? JSON.stringify( {  ...requestOptions.contextData } ) : null );
      binaryRequest.append( "Comment", requestOptions.comment || null ); //"A ticket image auto uploaded from odin database"

      let headersMultipart = {
                               ...headers,
                               ...binaryRequest.getHeaders()
                             }; //"multipart/form-data";

      delete headersMultipart[ "Content-Type" ];

      const uploadResult = await BinaryRequestServiceV1.callUploadBinaryData( headersMultipart,
                                                                              requestOptions.requestBasePath,
                                                                              binaryRequest ); //This request must be fail

      if ( requestOptions.saveUploadResult === "1" ) {

        CommonRequestService.saveInput( requestOptions.fileName,
                                        uploadResult.input,
                                        logger );

        if ( uploadResult && uploadResult.output ) {

          uploadResult.output.expected = {
                                     Code: requestOptions.responseCode
                                   };

        }
        else {

          uploadResult.output.expected = null;

        }

        CommonRequestService.saveOutput( requestOptions.fileName,
                                         uploadResult.output,
                                         logger );

      }

      if ( uploadResult &&
           uploadResult.output &&
           uploadResult.output.body &&
           uploadResult.output.body.Code === requestOptions.responseCode ) {

        result.data = uploadResult.output.body.Data[ 0 ];
        result.result = uploadResult.output.body.Data[ 0 ].Hash === "md5://" + strFileCheckSum; //Staty really sure the file upload is ok

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = MigrateImagesTask_001.name + "." + MigrateImagesTask_001.uploadImage.name;

      const strMark = "D112D266F97F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof logger.error === "function" ) {

        logger.error( error );

      }

    }

    return result;

  }

  public async init( params: any, logger: any ): Promise<boolean> {

    let bResult = false;

    try {

        bResult = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = MigrateImagesTask_001.name + "." + this.init.name;

      const strMark = "9D972DC3EFED" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  public async runTask( params: any,
                        logger: any ): Promise<boolean> {

    let bResult = false;

    let currentTransaction = null;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let ticketImageList = await TicketImagesService.getLastTicketImages( currentTransaction,
                                                                           logger );

      let lockResult = null;

      if ( ticketImageList instanceof Error === false ) {

        lockResult = await TicketImagesService.markLocked( ticketImageList as any,
                                                           logger );

        if ( lockResult instanceof Error === false ) {

          ticketImageList = ticketImageList as any[];

          const debugMark = debug.extend( "1DD5480BD154" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

          for ( let intIndex = 0; intIndex < ticketImageList.length; intIndex++ ) {

            const strPath = appRoot.path +
                            "/temp/" +
                            os.hostname + "/" +
                            SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_07 ) + "/";

            fs.mkdirSync(
                          strPath,
                          {
                            recursive: true
                          }
                        );

            if ( ticketImageList[ intIndex ].image ) {

              const base64File = ticketImageList[ intIndex ].image.split( ';base64,' );

              const fileExtension = base64File[ 0 ].split( "/" );

              debugMark(
                         "Writing to temporal file %s in the path %s",
                         ticketImageList[ intIndex ].id,
                         strPath
                       );

              fs.writeFileSync(
                                strPath + ticketImageList[ intIndex ].id + "." + fileExtension[ 1 ],
                                base64File[ 1 ],
                                {
                                  encoding: 'base64'
                                }
                              );

              let bUploadSuccess = false;

              const requestHeaders = {
                                       "Authorization": process.env.BINARY_MANAGER_AUTH_TOKEN,
                                       //"Content-Type": "application/json",
                                       "FrontendId": "UploadTaskProcess",
                                       "TimeZoneId": CommonUtilities.getCurrentTimeZoneId(),
                                       "Language": "en_US"
                                     }

              const requestOptions = {
                                       path: strPath,
                                       fileName: ticketImageList[ intIndex ].id + "." + fileExtension[ 1 ],
                                       id: ticketImageList[ intIndex ].id,
                                       date: SystemUtilities.getCurrentDateAndTimeFrom( ticketImageList[ intIndex ].created_at ).format( CommonConstants._DATE_TIME_LONG_FORMAT_04 ),
                                       category: "Ticket_Image_From_Odin",
                                       label: "Ticket Image From Odin",
                                       Tag: "#Ticket#,#Image#,#Odin#",
                                       contextData: {
                                                      "Authorization": process.env.BINARY_MANAGER_AUTH_TOKEN,
                                                      "id": ticketImageList[ intIndex ].id,
                                                      "created_at": ticketImageList[ intIndex ].created_at,
                                                      "order_id": ticketImageList[ intIndex ].order_id
                                                    },
                                       comment: "A ticket image auto uploaded from odin database. Table ticket_images",
                                       requestBasePath: process.env.BINARY_MANAGER_URL,
                                       saveUploadResult: process.env.BINARY_MANAGER_SAVE_UPLOAD_RESULT || "1",
                                       responseCode: "SUCCESS_BINARY_DATA_UPLOAD"
                                     }

              const uploadResult = await MigrateImagesTask_001.uploadImage( requestHeaders,
                                                                            requestOptions,
                                                                            logger );

              if ( uploadResult.result ) {

                if ( process.env.BINARY_MANAGER_SET_NULL_TO_IMAGE === "1" ) {

                  ticketImageList[ intIndex ].image = null;

                }

                ticketImageList[ intIndex ].migrated = 1; //Mark how migrated
                ticketImageList[ intIndex ].url = `@__baseurl__@?id=${uploadResult.data.Id}&auth=@__auth__@&thumbnail=0`;

                const ticketImageInDB = await TicketImagesService.createOrUpdate( ticketImageList[ intIndex ],
                                                                                  true,
                                                                                  currentTransaction,
                                                                                  logger );

                if ( ticketImageInDB instanceof Error ) {

                  const error = ticketImageInDB as any;

                  const strMark = "AED3535958E4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

                  const debugMark = debug.extend( strMark );

                  debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
                  debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
                  //debugMark( "Catched on: %O", sourcePosition );

                  error.mark = strMark;
                  error.logId = SystemUtilities.getUUIDv4();

                  if ( logger &&
                       logger.error === "function" ) {

                    logger.error( error );

                  }

                }
                else {

                  bUploadSuccess = true;

                  const strMark = "0707BC6C22AD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

                  const debugMark = debug.extend( strMark );

                  debugMark( "Success migrated image with id %s", ticketImageInDB.id );

                }

              }

              fs.unlinkSync( strPath + ticketImageList[ intIndex ].id + "." + fileExtension[ 1 ] );

              if ( !bUploadSuccess ) {

                break; //Not continue to another image, suppend the work

              }

            }
            else {

              const strMark = "F0F3C5B113B5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

              const debugMark = debug.extend( strMark );

              debugMark( "The entry with id %s had field image is null", ticketImageList[ intIndex ].id );

              if ( logger &&
                   logger.warning === "function" ) {

                logger.warning( "The entry with id %s had field image is null", ticketImageList[ intIndex ].id );

              }

            }

          }

          //If everything is ok, turn on the flag and apply the transaction
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

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = MigrateImagesTask_001.name + "." + this.runTask.name;

      const strMark = "AED3535958E4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           logger.error === "function" ) {

        logger.error( error );

      }

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return bResult;

  }

}
