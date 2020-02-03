import path from 'path';
import fs from 'fs'; //Load the filesystem module
//import Jimp from 'jimp';
import glob from "glob";
import cluster from 'cluster';

import BaseService from "../../common/database/services/BaseService";
import ConfigValueDataService from "../../common/database/services/ConfigValueDataService";
import SystemConstants from "../../common/SystemContants";
import CommonUtilities from "../../common/CommonUtilities";
import SystemUtilities from "../../common/SystemUtilities";
import { Request, Response } from 'express';
import DBConnectionManager from "../../common/managers/DBConnectionManager";
//import { BinaryIndex } from "../models/BinaryIndex";
import BinaryIndexService from "../../common/database/services/BinaryIndexService";
import CacheManager from "../../common/managers/CacheManager";
import { BinaryIndex } from "../../common/database/models/BinaryIndex";
import CommonConstants from "../../common/CommonConstants";
//import CommonConstants from "../../CommonConstants";

const debug = require( 'debug' )( 'BinaryServiceController' );

export default class BinaryServiceController extends BaseService {

  static readonly _ID = "BinaryServiceController";

  static async getConfigBinaryDataMaximumSize( transaction: any,
                                               logger: any ): Promise<number> {

    let intResult = 0;

    try {

      const configData = await ConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_BinaryDataMaximumSize.Id,
                                                                          SystemConstants._CONFIG_ENTRY_BinaryDataMaximumSize.Owner,
                                                                          transaction,
                                                                          logger );

      if ( configData.Value && isNaN( configData.Value ) === false ) {

        intResult = Number.parseInt( configData.Value, 10 ) * 1024; //Value in kilobytes transform to bytes

      }
      else if ( configData.Default && isNaN( configData.Default ) === false ) {

        intResult = Number.parseInt( configData.Default, 10 ) * 1024; //Value in kilobytes transform to bytes

      }
      else {

        intResult = 1 * 1024 * 1024; //1MB default expressed in bytes

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigBinaryDataMaximumSize.name;

      const strMark = "39318E93ECFB";

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

    return intResult;

  }

  static async getConfigBinaryDataBasePath( transaction: any,
                                            logger: any ): Promise<string> {

    let strResult = "";

    try {

      const configData = await ConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_BinaryDataBasePath.Id,
                                                                          SystemConstants._CONFIG_ENTRY_BinaryDataBasePath.Owner,
                                                                          transaction,
                                                                          logger );

      if ( configData.Value ) {

        strResult = configData.Value;

      }
      else if ( configData.Default ) {

        strResult = configData.Default;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigBinaryDataMaximumSize.name;

      const strMark = "488ECC417710";

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

  static async getConfigBinaryDataAllowedCategory( userSessionStatus: any,
                                                   strCategory: string,
                                                   transaction: any,
                                                   logger: any ): Promise<any> {

    return await ConfigValueDataService.getConfigValueDataObjectDeniedAllowed( userSessionStatus,
                                                                               SystemConstants._CONFIG_ENTRY_BinaryDataAllowedCategory.Id,
                                                                               SystemConstants._CONFIG_ENTRY_BinaryDataAllowedCategory.Owner,
                                                                               strCategory,
                                                                               transaction,
                                                                               logger );

  }

  static async getConfigBinaryDataAllowedMimeType( userSessionStatus: any,
                                                   strCategory: string,
                                                   transaction: any,
                                                   logger: any ): Promise<any> {

    return await ConfigValueDataService.getConfigValueDataObjectDeniedAllowed( userSessionStatus,
                                                                               SystemConstants._CONFIG_ENTRY_BinaryDataAllowedMimeType.Id,
                                                                               SystemConstants._CONFIG_ENTRY_BinaryDataAllowedMimeType.Owner,
                                                                               strCategory,
                                                                               transaction,
                                                                               logger );

  }

  static async getConfigBinaryDataThumbnail( userSessionStatus: any,
                                             strCategory: string,
                                             strMimeType: string,
                                             transaction: any,
                                             logger: any ): Promise<any> {

    let result: any = [];

    try {

      let configData = await ConfigValueDataService.getConfigValueDataFromSession( userSessionStatus,
                                                                                   SystemConstants._CONFIG_ENTRY_BinaryDataThumbnail.Id,
                                                                                   SystemConstants._CONFIG_ENTRY_BinaryDataThumbnail.Owner,
                                                                                   strCategory,
                                                                                   transaction,
                                                                                   logger );

      if ( CommonUtilities.isNotNullOrEmpty( configData ) ) {

        for ( let intIndex = 0; intIndex < configData.length; intIndex++ ) {

          const item = configData[ intIndex ];

          if ( item.mime && item.factor ) {

            if ( item.mime.indexOf( "#" + strMimeType + "#" ) !== -1 ) {

              result.push( item.factor );
              //break;

            }

          }

        }

      }

      if ( result.length === 0 &&
         ( strMimeType === "image/png" ||
           strMimeType === "image/jpeg" ) ) {

        result.push( 300 ); //Scale to 300 pixeles if the mime type is png or jpeg

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getDefaultOwners.name;

      const strMark = "41EB37D707B7";

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

  static async getConfigBinaryDataProcess( userSessionStatus: any,
                                           strCategory: string,
                                           strMimeType: string,
                                           transaction: any,
                                           logger: any ): Promise<any> {

    let result: any = [];

    try {

      let configData = await ConfigValueDataService.getConfigValueDataFromSession( userSessionStatus,
                                                                                   SystemConstants._CONFIG_ENTRY_BinaryDataProcess.Id,
                                                                                   SystemConstants._CONFIG_ENTRY_BinaryDataProcess.Owner,
                                                                                   strCategory,
                                                                                   transaction,
                                                                                   logger );

      if ( CommonUtilities.isNotNullOrEmpty( configData ) ) {

        for ( let intIndex = 0; intIndex < configData.length; intIndex++ ) {

          const item = configData[ intIndex ];

          if ( item.mime && item.factor && item.size ) {

            if ( item.mime.indexOf( "#" + strMimeType + "#" ) !== -1 ) {

              result.push( item );

            }

          }

        }

      }

      if ( result.length === 0 &&
         ( strMimeType === "image/png" ||
           strMimeType === "image/jpeg" ) ) {

        result.push(
                     {
                       mime: strMimeType,
                       factor: 1500,
                       size: 1024
                     }
                   ); //Scale to 300 pixeles if the mime type is png or jpeg

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getDefaultOwners.name;

      const strMark = "3F18533ED8B4";

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

  static async checkAllowedCategory( userSessionStatus: any,
                                     //strMimeType: string,
                                     strCategory: string,
                                     transaction: any,
                                     logger: any ): Promise<any> {

    let result = { result: 1, allowed: "*", denied: "" }; //Default allow all

    const checkData = await ConfigValueDataService.checkAllowed( userSessionStatus,
                                                                 SystemConstants._CONFIG_ENTRY_BinaryDataAllowedCategory.Id,
                                                                 SystemConstants._CONFIG_ENTRY_BinaryDataAllowedCategory.Owner,
                                                                 strCategory,
                                                                 "",
                                                                 transaction,
                                                                 true,
                                                                 logger );

    if ( checkData &&
         checkData.value !== undefined &&
         checkData.allowed !== undefined &&
         checkData.denied !== undefined ) {

      result = checkData;

    }

    return result;

  }

  static async checkAllowedMimeType( userSessionStatus: any,
                                     strMimeType: string,
                                     strCategory: string,
                                     transaction: any,
                                     logger: any ): Promise<any> {

    let result = { result: 1, allowed: "*", denied: "" }; //Default allow all

    const checkData = await ConfigValueDataService.checkAllowed( userSessionStatus,
                                                                 SystemConstants._CONFIG_ENTRY_BinaryDataAllowedMimeType.Id,
                                                                 SystemConstants._CONFIG_ENTRY_BinaryDataAllowedMimeType.Owner,
                                                                 strMimeType,
                                                                 strCategory,
                                                                 transaction,
                                                                 true,
                                                                 logger );

    if ( checkData &&
         checkData.value !== undefined &&
         checkData.allowed !== undefined &&
         checkData.denied !== undefined ) {

      result = checkData;

    }

    return result;

  }

  static async getDefaultOwners( userSessionStatus: any,
                                 strCategory: string,
                                 transaction: any,
                                 logger: any ): Promise<any> {

    let result = SystemConstants._CREATED_BY_UNKNOWN_SYSTEM_NET;

    try {

      let configData = await ConfigValueDataService.getConfigValueDataFromSession( userSessionStatus,
                                                                                   SystemConstants._CONFIG_ENTRY_BinaryDataDefaultOwner.Id,
                                                                                   SystemConstants._CONFIG_ENTRY_BinaryDataDefaultOwner.Owner,
                                                                                   strCategory,
                                                                                   transaction,
                                                                                   logger );

      if ( CommonUtilities.isNotNullOrEmpty( configData ) ) {

        if ( configData.indexOf( "#@@UserGroupIdUploader@@#" ) !== -1 ) {

          configData = configData.replace( new RegExp( "#@@UserGroupIdUploader@@#", "gi" ), "#" + userSessionStatus.UserGroupId + "#" );

        }

        if ( configData.indexOf( "#@@UserGroupNameUploader@@#" ) !== -1 ) {

          configData = configData.replace( new RegExp( "#@@UserGroupNameUploader@@#", "gi" ), "#" + userSessionStatus.UserGroupName + "#" );

        }

        if ( configData.indexOf( "#@@UserIdUploader@@#" ) !== -1 ) {

          configData = configData.replace( new RegExp( "#@@UserIdUploader@@#", "gi" ), "#" + userSessionStatus.UserId + "#" );

        }

        if ( configData.indexOf( "#@@UserNameUploader@@#" ) !== -1 ) {

          configData = configData.replace( new RegExp( "#@@UserNameUploader@@#", "gi" ), "#" + userSessionStatus.UserName + "#" );

        }

        if ( configData.indexOf( "@@Category@@" ) !== -1 ) {

          configData = configData.replace( new RegExp( "@@Category@@", "gi" ), strCategory );

        }

      }

      if ( configData ) {

        result = configData;

      }
      else {

        result = userSessionStatus.UserName;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getDefaultOwners.name;

      const strMark = "AEF931FF8501";

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

  static async detectProcessNeeded( userSessionStatus: any,
                                    strCategory: string,
                                    strMimeType: string,
                                    intFileSize: number,
                                    transaction: any,
                                    logger: any ): Promise<any> {

    let result = { value: 0, process: [] };

    try {

      const dataProcess = await BinaryServiceController.getConfigBinaryDataProcess(
                                                                                    userSessionStatus,
                                                                                    strCategory,
                                                                                    strMimeType,
                                                                                    transaction,
                                                                                    logger
                                                                                  );

      if ( dataProcess.length > 0 ) {

        for ( let intIndex = 0; intIndex < dataProcess.length; intIndex++ ) {

          if ( intFileSize > dataProcess[ intIndex ].size * 1024 ) {

            result.value = 1;
            result.process.push(
                                 {
                                   mime: strMimeType,
                                   size: dataProcess[ intIndex ].size,
                                   factor: dataProcess[ intIndex ].factor,
                                   keepOriginal: dataProcess[ intIndex ].keepOriginal ? dataProcess[ intIndex ].keepOriginal: false,
                                   status: {
                                             code: "WAITING_FOR",
                                             started: null,
                                             finished: null
                                           },
                                   file: "",
                                 }
                               );

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getDefaultOwners.name;

      const strMark = "359CD3A1387E";

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

  static async generateThumbnail( strFullPath: string,
                                  strFileName: string,
                                  strFileExtension: string,
                                  thumbnailFactor: number[],
                                  logger: any ): Promise<any> {

    let result = { value: 0, thumbnail: [] };

    try {

      const strMark = "F0742629564B";

      const debugMark = debug.extend( strMark + "@" + ( cluster.isWorker ? cluster.worker.id : "0" ) );

      debugMark( "Reading binary file" );

      const util = require( 'util' );
      const exec = util.promisify( require( 'child_process' ).exec );

      const strCommandIdentify = `identify -format "%w;%h" ${strFullPath}${strFileName}${strFileExtension}`;

      const { stdout } = await exec( strCommandIdentify );

      debugMark( "Identify command output: %s", stdout );

      const imageSize = stdout.split( ";" );

      if ( imageSize &&
           imageSize.length > 1 ) {

        const intImageWidth = imageSize[ 0 ];
        const intImageHeight = imageSize[ 1 ];

        for ( let intIndex = 0; intIndex < thumbnailFactor.length; intIndex++ ) {

          const strThumbnailFile = strFullPath + strFileName + ".thumbnail." + thumbnailFactor[ intIndex ];

          if ( intImageWidth >= thumbnailFactor[ intIndex ] && intImageWidth >= intImageHeight ) {

            debugMark( "Resize image file by the width side" );

            const strCommandConvert = `convert "${strFullPath}${strFileName}${strFileExtension}" -resize "${thumbnailFactor[ intIndex ]}x${thumbnailFactor[ intIndex ]}" "${strThumbnailFile}"`;

            const { stdout } = await exec( strCommandConvert );

            debugMark( "Convert command output: %s", stdout ? stdout : "Success" );

            //imageData.resize( thumbnailFactor[ intIndex ], Jimp.AUTO )

            //debugMark( "Wrinting new file" );

            //await imageData.writeAsync( strFullPath + strFileName );

            //const fileStats = fs.statSync( strFullPath + strFileName );
            const fileStats = fs.statSync( strThumbnailFile );

            result.value = 1;
            result.thumbnail.push(
                                   {
                                     side: "width",
                                     factor: thumbnailFactor[ intIndex ],
                                     size: fileStats[ "size" ],
                                     file: strFileName + ".thumbnail." + thumbnailFactor[ intIndex ]
                                   }
                                 );

          }
          else if ( intImageHeight >= thumbnailFactor[ intIndex ] ) {

            debugMark( "Resize image file by the height side" );

            const strCommandConvert = `convert ${strFullPath}${strFileName}${strFileExtension} -resize ${thumbnailFactor[ intIndex ]}x${thumbnailFactor[ intIndex ]} ${strThumbnailFile}`;

            const { stdout } = await exec( strCommandConvert );

            debugMark( "Convert command output: %s", stdout );

            //imageData.resize( Jimp.AUTO, thumbnailFactor[ intIndex ] )

            //debugMark( "Wrinting new file" );

            //await imageData.writeAsync( strFullPath + strFileName );

            //const fileStats = fs.statSync( strFullPath + strFileName );
            const fileStats = fs.statSync( strThumbnailFile );

            result.value = 1;
            result.thumbnail.push(
                                   {
                                     side: "height",
                                     factor: thumbnailFactor[ intIndex ],
                                     size: fileStats[ "size" ],
                                     file: strFileName + ".thumbnail." + thumbnailFactor[ intIndex ]
                                   }
                                 );

          }
          else {

            debugMark( "No resize image needed for factor of [%s]. Copied the same file name", thumbnailFactor[ intIndex ] );

            fs.copyFileSync( strFullPath + strFileName, strFullPath + strFileName + ".thumbnail." + thumbnailFactor[ intIndex ] );
            //await imageData.writeAsync( strFullPath + strFileName ); // + "." + thumbnailFactor[ intIndex ] + ".thumbnail" );

          }

          //fs.renameSync( strFullPath + strFileName, strFullPath + strFileName + ".thumbnail." + thumbnailFactor[ intIndex ] );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.generateThumbnail.name;

      const strMark = "74B6730AB038";

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

  /*
  static async generateThumbnail( strFullPath: string,
                                  strFileName: string,
                                  strFileExtension: string,
                                  thumbnailFactor: number[],
                                  logger: any ): Promise<any> {

    let result = { value: 0, thumbnail: [] };

    try {

      if ( thumbnailFactor &&
           thumbnailFactor.length > 0 ) {

        const strMark = "3B23F0152978";

        const debugMark = debug.extend( strMark + "@" + ( cluster.isWorker ? cluster.worker.id : "0" ) );

        debugMark( "Reading binary file" );

        const imageData = await Jimp.read( strFullPath + strFileName + strFileExtension );

        const intImageWidth = imageData.bitmap.width;
        const intImageHeight = imageData.bitmap.height;

        for ( let intIndex = 0; intIndex < thumbnailFactor.length; intIndex++ ) {

          if ( intImageWidth >= thumbnailFactor[ intIndex ] && intImageWidth >= intImageHeight ) {

            debugMark( "Resize image file" );

            imageData.resize( thumbnailFactor[ intIndex ], Jimp.AUTO )

            debugMark( "Wrinting new file" );

            await imageData.writeAsync( strFullPath + strFileName );

            const fileStats = fs.statSync( strFullPath + strFileName );

            result.value = 1;
            result.thumbnail.push(
                                   {
                                     side: "width",
                                     factor: thumbnailFactor[ intIndex ],
                                     size: fileStats[ "size" ],
                                     file: strFileName + ".thumbnail." + thumbnailFactor[ intIndex ]
                                   }
                                 );

          }
          else if ( intImageHeight >= thumbnailFactor[ intIndex ] ) {

            debugMark( "Resize image file" );

            imageData.resize( Jimp.AUTO, thumbnailFactor[ intIndex ] )

            debugMark( "Wrinting new file" );

            await imageData.writeAsync( strFullPath + strFileName );

            const fileStats = fs.statSync( strFullPath + strFileName );

            result.value = 1;
            result.thumbnail.push(
                                   {
                                     side: "height",
                                     factor: thumbnailFactor[ intIndex ],
                                     size: fileStats[ "size" ],
                                     file: strFileName + ".thumbnail." + thumbnailFactor[ intIndex ]
                                   }
                                 );

          }
          else {

            await imageData.writeAsync( strFullPath + strFileName ); // + "." + thumbnailFactor[ intIndex ] + ".thumbnail" );

          }

          fs.renameSync( strFullPath + strFileName, strFullPath + strFileName + ".thumbnail." + thumbnailFactor[ intIndex ] );

        }

        if ( global.gc ) {

          global.gc();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getDefaultOwners.name;

      const strMark = "8DE49AF0AFFC";

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
  */

  static async processBinaryDataUpload( req: Request,
                                        transaction: any,
                                        logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      const strMark = "9B7197376B5B";

      let debugMark = debug.extend( strMark + "@" + ( cluster.isWorker ? cluster.worker.id : "0" ) );
      debugMark( "Time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "processBinaryDataUpload" );

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      if ( req.files &&
           Object.keys( req.files ).length > 0 ) {

        const context = ( req as any ).context;

        let uploadedFile = null;

        uploadedFile = req.files.File;

        if ( uploadedFile.truncated === false ) {

          if ( CommonUtilities.isNotNullOrEmpty( req.body.Category ) ) {

            let strCategory = CommonUtilities.clearSpecialChars( req.body.Category,
                                                                `!@#$^&%*()+=[]\/\\{}|:<>?,."'\`` ).toLowerCase();

            strCategory = CommonUtilities.unaccent( strCategory );

            const allowedCategory = await BinaryServiceController.checkAllowedCategory( context.UserSessionStatus,
                                                                              strCategory,
                                                                              transaction,
                                                                              logger );

            if ( allowedCategory.value === 1 ) {

              if ( req.body.AccessKind >= 1 && req.body.AccessKind <= 3 ) {

                if ( req.body.StorageKind >= 0 && req.body.StorageKind <= 1 ) {

                  const fileDetectedType = SystemUtilities.getMimeType( uploadedFile.tempFilePath,
                                                                        uploadedFile.mimetype,
                                                                        logger );

                  const allowedMimeType = await BinaryServiceController.checkAllowedMimeType( context.UserSessionStatus,
                                                                                    fileDetectedType.mime,
                                                                                    strCategory,
                                                                                    transaction,
                                                                                    logger );

                  if ( allowedMimeType.value === 1 ) {

                    const strDefaultOwners = await BinaryServiceController.getDefaultOwners( context.UserSessionStatus,
                                                                                   strCategory,
                                                                                   transaction,
                                                                                   logger );

                    let strId = req.body.Id;

                    if ( !strId ||
                         !context.UserSessionStatus.UserTag ||
                         context.UserSessionStatus.UserTag.indexOf( "#BinaryDataAllowToDefineId#" ) === -1 ) {

                      if ( !strId ||
                           !context.UserSessionStatus.UserGroupTag ||
                           context.UserSessionStatus.UserGroupTag.indexOf( "#BinaryDataAllowToDefineId#" ) === -1 ) {

                        if ( !strId ||
                             !context.UserSessionStatus.Tag ||
                             context.UserSessionStatus.Tag.indexOf( "#BinaryDataAllowToDefineId#" ) === -1 ) {

                           strId = SystemUtilities.getUUIDv4();

                        }

                      }

                    }

                    let date = SystemUtilities.getCurrentDateAndTimeFrom( req.body.Date );
                    let strDate = null;

                    if ( date ) {

                      strDate = date.format( "YYYY-MM-DD-HH" );

                    }

                    if ( !strDate ||
                         !context.UserSessionStatus.UserTag ||
                         context.UserSessionStatus.UserTag.indexOf( "#BinaryDataAllowToDefineDate#" ) === -1 ) {

                      if ( !strDate ||
                           !context.UserSessionStatus.UserGroupTag ||
                           context.UserSessionStatus.UserGroupTag.indexOf( "#BinaryDataAllowToDefineDate#" ) === -1 ) {

                        if ( !strDate ||
                             !context.UserSessionStatus.Tag ||
                             context.UserSessionStatus.Tag.indexOf( "#BinaryDataAllowToDefineDate#" ) === -1 ) {

                          strDate = SystemUtilities.getCurrentDateAndTime().format( "YYYY-MM-DD-HH" );

                        }

                      }

                    }

                    //ANCHOR BinaryData BasePath
                    let strRelativePath = "";
                    let strFullPath = "";
                    let expireAt = null;
                    const strBasePath = await BinaryServiceController.getConfigBinaryDataBasePath( transaction,
                                                                                         logger );

                    if ( req.body.StorageKind === "0" ) { //Persistent

                      strRelativePath = "persistent/" + strCategory + "/" + strDate + "/" + context.UserSessionStatus.UserName + "/";

                    }
                    else if ( req.body.Storagekind === "1" ) { //Temporal

                      strRelativePath = "temporal/" + strCategory + "/" + strDate + "/" + context.UserSessionStatus.UserName + "/";

                      expireAt = SystemUtilities.isValidDateTime( req.body.ExpireAt ) ? req.body.ExpireAt : SystemUtilities.getCurrentDateAndTimeIncDays( 30 ).format();

                    }

                    if ( strBasePath.startsWith( "full://" ) ) {

                      strFullPath = path.join( strBasePath.replace( "full://", "" ), strRelativePath );

                    }
                    else {

                      strFullPath = path.join( SystemUtilities.baseRootPath, strBasePath, strRelativePath );

                    }

                    debugMark( "Put binary data file in folder [%s]", strFullPath );

                    if ( logger && typeof logger.info === "function" ) {

                      logger.info( "Put binary data file in folder [%s]", strFullPath );

                    }

                    debugMark( "Moving file" );

                    await uploadedFile.mv( strFullPath + strId + "." + fileDetectedType.ext + ".data" );

                    //Create thumbnail
                    const thumbnailFactor = await this.getConfigBinaryDataThumbnail( context.UserSessionStatus,
                                                                                     strCategory,
                                                                                     fileDetectedType.mime,
                                                                                     transaction,
                                                                                     logger );

                    debugMark( "Generating thumbnail" );

                    const thumbnailData = await BinaryServiceController.generateThumbnail( strFullPath,
                                                                                 strId + "." + fileDetectedType.ext,
                                                                                 ".data",
                                                                                 thumbnailFactor,
                                                                                 logger );

                    debugMark( "Detect process needed" );

                    const processData = await BinaryServiceController.detectProcessNeeded( context.UserSessionStatus,
                                                                                 strCategory,
                                                                                 fileDetectedType.mime,
                                                                                 uploadedFile.size,
                                                                                 transaction,
                                                                                 logger );

                    const strCurrentFileExtension = CommonUtilities.getFileExtension( uploadedFile.name );

                    const strFinalFileName = strCurrentFileExtension === "." + fileDetectedType.ext ? uploadedFile.name: uploadedFile.name + "." + fileDetectedType.ext;

                    const extraData = {
                                        Thumbnail: thumbnailData && thumbnailData.thumbnail ? thumbnailData.thumbnail : [],
                                        Process: processData && processData.process ? processData.process : [],
                                      };

                    const binaryIndexData = {
                                              Id: strId,
                                              AccessKind: req.body.AccessKind,
                                              StorageKind: req.body.StorageKind,
                                              ExpireAt: expireAt,
                                              Category: strCategory,
                                              Hash: "md5://" + uploadedFile.md5,
                                              MimeType: fileDetectedType.mime,
                                              Label: CommonUtilities.isNotNullOrEmpty( req.body.Label ) ? req.body.Label: strFinalFileName,
                                              FilePath: strRelativePath,
                                              FileName: strFinalFileName,
                                              FileExtension: fileDetectedType.ext,
                                              FileSize: uploadedFile.size, //In bytes
                                              Tag: CommonUtilities.isNotNullOrEmpty( req.body.Tag ) ? req.body.Tag: null,
                                              System: CommonUtilities.isNotNullOrEmpty( context.FrontendId ) ? context.FrontendId: null,
                                              Context: CommonUtilities.isNotNullOrEmpty( req.body.Context ) ? req.body.Context: null,
                                              Comment: CommonUtilities.isNotNullOrEmpty( req.body.Comment ) ? req.body.Comment : null,
                                              DenyTagAccess: CommonUtilities.isNotNullOrEmpty( req.body.DenyTagAccess ) ? req.body.DenyTagAccess: null,
                                              AllowTagAccess: CommonUtilities.isNotNullOrEmpty( req.body.AllowTagAccess ) ? req.body.AllowTagAccess: null,
                                              ShareCode: CommonUtilities.isNotNullOrEmpty( req.body.ShareCode ) ? req.body.ShareCode: null,
                                              Owner: strDefaultOwners,
                                              ProcessNeeded: processData && processData.value ? processData.value : 0,
                                              CreatedBy: context.UserSessionStatus.UserName,
                                              ExtraData: JSON.stringify( extraData, null, 2 )
                                            }

                    debugMark( "Writing info to database" );

                    const dbOperationResult = await BinaryIndexService.createOrUpdate( strId,
                                                                                       binaryIndexData,
                                                                                       true,
                                                                                       transaction,
                                                                                       logger );

                    if ( dbOperationResult.error === null ) {

                      debugMark( "Sucess" );

                      delete binaryIndexData.ExtraData;

                      result = {
                                 StatusCode: 200,
                                 Code: 'SUCESS_BINARY_DATA_UPLOAD',
                                 Message: `The binary data has been uploaded success.`,
                                 Mark: strMark,
                                 LogId: null,
                                 IsError: false,
                                 Errors: [],
                                 Warnings: [],
                                 Count: 1,
                                 Data: [
                                         binaryIndexData
                                       ]
                               };

                    }
                    else {

                      debugMark( "Failed" );

                      result = {
                                 StatusCode: 500,
                                 Code: 'ERROR_UNEXPECTED',
                                 Message: 'Unexpected error. Please read the server log for more details.',
                                 Mark: strMark,
                                 LogId: dbOperationResult.error.LogId,
                                 IsError: true,
                                 Errors: [
                                           {
                                             Code: dbOperationResult.error.name,
                                             Message: dbOperationResult.error.message,
                                             Details:  await SystemUtilities.processErrorDetails( dbOperationResult.error ) //dbOperationResult.error
                                           }
                                         ],
                                 Warnings: [],
                                 Count: 0,
                                 Data: []
                               };

                    }

                  }
                  else {

                    result = {
                               StatusCode: 400,
                               Code: 'ERROR_NOT_VALID_FILE_MIME_TYPE',
                               Message: `The ${fileDetectedType.mime} detected for the file is invalid.`,
                               Mark: strMark,
                               LogId: null,
                               IsError: true,
                               Errors: [
                                         {
                                           Code: 'ERROR_NOT_VALID_FILE_MIME_TYPE',
                                           Message: `The ${fileDetectedType.mime} detected for the file is invalid.`,
                                           Details: {
                                                      Detected: fileDetectedType.mime,
                                                      Denied: allowedMimeType.denied,
                                                      Allowed: allowedMimeType.allowed,
                                                    }
                                         }
                                       ],
                               Warnings: [],
                               Count: 0,
                               Data: []
                             };

                  }

                }
                else {

                  result = {
                             StatusCode: 400,
                             Code: 'ERROR_NOT_VALID_STORAGE_KIND_DEFINED',
                             Message: 'The StorageKind parameter cannot be empty or null. Only 0 or 1 are valid values.',
                             Mark: strMark,
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: 'ERROR_NOT_VALID_STORAGE_KIND_DEFINED',
                                         Message: 'The StorageKind parameter cannot be empty or null. Only 0 or 1 are valid values.',
                                         Details: {
                                                    0: "Persistent",
                                                    1: "Temporal",
                                                  }
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           };

                }

              }
              else {

                result = {
                           StatusCode: 400,
                           Code: 'ERROR_NOT_VALID_ACCESS_KIND_DEFINED',
                           Message: 'The AccessKind parameter cannot be empty or null. Only 1 or 2 or 3 are valid values.',
                           Mark: strMark,
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: 'ERROR_NOT_VALID_ACCESS_KIND_DEFINED',
                                       Message: 'The AccessKind parameter cannot be empty or null. Only 1 or 2 or 3 are valid values.',
                                       Details: {
                                                  1: "Public",
                                                  2: "Authenticated",
                                                  3: "Tag"
                                                }
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         };

              }

            }
            else {

              result = {
                        StatusCode: 400,
                        Code: 'ERROR_NOT_VALID_CATEGORY_NAME',
                        Message: 'The Category parameter is not valid.',
                        Mark: strMark,
                        LogId: null,
                        IsError: true,
                        Errors: [
                                  {
                                    Code: 'ERROR_NOT_VALID_CATEGORY_NAME',
                                    Message: 'The Category parameter is not valid.',
                                    Details: {
                                               Category: strCategory,
                                               Denied: allowedCategory.denied,
                                               Allowed: allowedCategory.allowed,
                                             }
                                  }
                                ],
                        Warnings: [],
                        Count: 0,
                        Data: []
                      };

            }

          }
          else {

            result = {
                       StatusCode: 400,
                       Code: 'ERROR_NOT_VALID_CATEGORY_DEFINED',
                       Message: 'The Category parameter cannot be empty, null or contains especial chars. Only A-Z a-z , - are valid.',
                       Mark: strMark,
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_NOT_VALID_CATEGORY_DEFINED',
                                   Message: 'The Category parameter cannot be empty, null or contains especial chars. Only A-Z a-z 0-9 _ - are valid.',
                                   Details: {
                                              Valid: [ "A-Z", "a-z", "0-9", "_", "-" ],
                                            }
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     };

          }

        }
        else {

          const intBinaryDataMaximumSize = await BinaryServiceController.getConfigBinaryDataMaximumSize( transaction,
                                                                                               logger );

          result = {
                     StatusCode: 400,
                     Code: 'ERROR_FILE_TOO_BIG',
                     Message: 'The file is too big.',
                     Mark: strMark,
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_FILE_TOO_BIG',
                                 Message: 'The file is too big.',
                                 Details: {
                                            Maximum: intBinaryDataMaximumSize / 1024,
                                            Unit: "kilobytes"
                                          }
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }

      }
      else {

        result = {
                   StatusCode: 400,
                   Code: 'ERROR_NOT_FILE_UPLOADED',
                   Message: 'No file uploaded.',
                   Mark: strMark,
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_NOT_FILE_UPLOADED',
                               Message: 'No file uploaded.',
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.processBinaryDataUpload.name;

      const strMark = "763DC880AD6C";

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

      result = {
                 StatusCode: 500,
                 Code: 'ERROR_UNEXPECTED',
                 Message: 'Unexpected error. Please read the server log for more details.',
                 Mark: strMark,
                 LogId: error.LogId,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

    }

    return result;

  }

  static async createBinaryDataAuthorization( req: Request,
                                              transaction: any,
                                              logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const context = ( req as any ).context;

      const userSessionStatus = context.UserSessionStatus;

      let strBinaryDataToken = null;

      if ( CommonUtilities.isNullOrEmpty( userSessionStatus.BinaryDataToken ) ) {

        const strId = SystemUtilities.getUUIDv4();

        strBinaryDataToken = SystemUtilities.hashString( strId, 1, logger ); //xx hash

        userSessionStatus.BinaryDataToken = strBinaryDataToken;

        //Update the cache and database
        SystemUtilities.createOrUpdateUserSessionStatus( userSessionStatus.Token,
                                                         userSessionStatus,
                                                         false, //Set roles?
                                                         null,
                                                         null,
                                                         true,    //Force update?
                                                         2,        //Only 1 try
                                                         4 * 1000, //Second
                                                         transaction,
                                                         logger );

        await CacheManager.setData( strBinaryDataToken,
                                    userSessionStatus.Token,
                                    logger ); //Save to cache the association between generated binary data Auth Token and the main Authorization Token

      }
      else {

        strBinaryDataToken = userSessionStatus.BinaryDataToken;

      }

      result = {
                  StatusCode: 200,
                  Code: 'SUCESS_AUTH_TOKEN_CREATED',
                  Message: `The binary data auth token has been success created.`,
                  LogId: null,
                  IsError: false,
                  Errors: [],
                  Warnings: [],
                  Count: 1,
                  Data: [
                          {
                            Auth: strBinaryDataToken,
                          }
                        ]
                };

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.processBinaryDataUpload.name;

      const strMark = "05A79B4A16B1";

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

      result = {
                 StatusCode: 500,
                 Code: 'ERROR_UNEXPECTED',
                 Message: 'Unexpected error. Please read the server log for more details.',
                 Mark: strMark,
                 LogId: error.LogId,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

    }

    return result;

  }

  static async deleteBinaryDataAuthorization( req: Request,
                                              transaction: any,
                                              logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const context = ( req as any ).context;

      const userSessionStatus = context.UserSessionStatus;

      if ( userSessionStatus.Token.startsWith( "p:" ) === false ) {

        if ( CommonUtilities.isNullOrEmpty( userSessionStatus.BinaryDataToken ) ) {

          await CacheManager.deleteData( userSessionStatus.BinaryDataToken,
                                         logger ); //Remove from cache

          userSessionStatus.BinaryDataToken = null;

          //Update the cache and database
          SystemUtilities.createOrUpdateUserSessionStatus( userSessionStatus.Token,
                                                           userSessionStatus,
                                                           false, //Set roles?
                                                           null,
                                                           null,
                                                           true,    //Force update?
                                                           2,        //Only 1 try
                                                           4 * 1000, //Second
                                                           transaction,
                                                           logger );

          result = {
                     StatusCode: 200,
                     Code: 'SUCESS_AUTH_TOKEN_DELETED',
                     Message: `The binary data auth token has been success deleted.`,
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else {

          result = {
                     StatusCode: 404,
                     Code: 'ERROR_AUTH_TOKEN_NOT_FOUND',
                     Message: `The binary data auth token not found.`,
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_AUTH_TOKEN_NOT_FOUND',
                                 Message: `The binary data auth token not found.`,
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: 'ERROR_AUTH_TOKEN_IS_PERSISTENT',
                   Message: `Auth token provided is persistent. You cannot delete it`,
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_AUTH_TOKEN_IS_PERSISTENT',
                               Message: `Auth token provided is persistent. You cannot delete it`,
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                };

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.processBinaryDataUpload.name;

      const strMark = "1FD534D0F6D8";

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

      result = {
                 StatusCode: 500,
                 Code: 'ERROR_UNEXPECTED',
                 Message: 'Unexpected error. Please read the server log for more details.',
                 Mark: strMark,
                 LogId: error.LogId,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

    }

    return result;

  }

  static async selectThumbnail( strBasePath: string,
                                strFullPath: string,
                                strFileThumbnailName: string,
                                strFileName: string,
                                strFileExtension: string,
                                strMimeType: string,
                                lngFileSize: number,
                                strThumbnail: string,
                                logger: any ):Promise<any> {

    let result = {
                   File: "",
                   FileName: "",
                   MimeType: "",
                   FileSize: 0
                 };

    try {

      if ( fs.existsSync( path.join( strFullPath, strFileThumbnailName + "." + strThumbnail ) ) ) {

        result.File = path.join( strFullPath, strFileThumbnailName + "." + strThumbnail );
        result.FileName = strFileName;
        result.MimeType = strMimeType;
        result.FileSize = lngFileSize;

      }
      else {

        let thumbnailList = glob.sync( strFileThumbnailName + ".*", { cwd: strFullPath, nodir: true } );

        if ( thumbnailList &&
             thumbnailList.length > 0 ) {

          result.File = path.join( strFullPath, thumbnailList[ 0 ] ); //The first thumbnail found in the list of possible options
          result.FileName = strFileName;

          const fileStats = fs.statSync( result.File );

          result.MimeType = strMimeType;
          result.FileSize = fileStats.size;

        }
        else if ( fs.existsSync( path.join( strBasePath, "@default@/images/mime_types/", strFileExtension + ".png" ) ) ) { //Use predefined thumbnail files

          result.File = path.join( strBasePath, "@default@/images/mime_types/", strFileExtension + ".png" ); //pdf.png, docx.png
          result.FileName = strFileExtension + ".png";

          const fileStats = fs.statSync( result.File );

          result.MimeType = "image/png";
          result.FileSize = fileStats.size;

        }
        else {

          result.File = path.join( strBasePath, "@default@/images/mime_types/default.png" );
          result.FileName = "default.png";

          const fileStats = fs.statSync( result.File );

          result.MimeType = strMimeType;
          result.FileSize = fileStats.size;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.processBinaryDataUpload.name;

      const strMark = "003B5338EC0B";

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

  static async checkTagIsAllowedToAccess( strTagToCheck: string,
                                          strRole: string,
                                          strUserId: string,
                                          strUserName: string,
                                          strUserTag: string,
                                          strGroupId: string,
                                          strGroupName: string,
                                          strGroupTag: string,
                                          strSessionTag: string,
                                          bAllowAny: boolean,
                                          logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      let tagList = strTagToCheck.split( "," );
      let roleList = strRole.split( "," );
      let userTagList = strUserTag ? strUserTag.split( "," ): [];
      let groupTagList = strGroupTag ? strGroupTag.split( "," ): [];
      let sessionTagList = strSessionTag ? strSessionTag.split( "," ): [];

      if ( bAllowAny &&
           strTagToCheck === SystemConstants._VALUE_ANY ) {

        bResult = true;

      }
      else if ( CommonUtilities.isInList( tagList,
                                          roleList,
                                          logger ) ) {

        bResult = true;

      }
      else if ( tagList.includes( "#" + strUserId + "#" ) ) {

        bResult = true;

      }
      else if ( tagList.includes( "#" + strUserName + "#" ) ) {

        bResult = true;

      }
      else if ( CommonUtilities.isInList( tagList,
                                          userTagList,
                                          logger ) ) {

        bResult = true;

      }
      else if ( tagList.includes( "#" + strGroupId + "#" ) ) {

        bResult = true;

      }
      else if ( tagList.includes( "#" + strGroupName + "#" ) ) {

        bResult = true;

      }
      else if ( CommonUtilities.isInList( tagList,
                                          groupTagList,
                                          logger ) ) {

        bResult = true;

      }
      else if ( CommonUtilities.isInList( tagList,
                                          sessionTagList,
                                          logger ) ) {

        bResult = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkTagIsAllowedToAccess.name;

      const strMark = "09301995CE61";

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

  static async processBinaryDataDownload( req: Request,
                                          resp: Response,
                                          transaction: any,
                                          logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const context = ( req as any ).context;
      //const userSessionStatus = context.UserSessionStatus;
      const strId = req.params.id;
      const strAuth = req.params.auth;
      const strThumbnail = req.params.thumbnail;

      if ( CommonUtilities.isNotNullOrEmpty( strId ) ) {

        const options = {

          where: { "Id": strId },
          transaction: currentTransaction,

        }

        const strBasePath = await BinaryServiceController.getConfigBinaryDataBasePath( transaction,
                                                                             logger );

        let strFullPath = "";

        if ( strBasePath.startsWith( "full://" ) ) {

          strFullPath = strBasePath.replace( "full://", "" );

        }
        else {

          strFullPath = path.join( SystemUtilities.baseRootPath, strBasePath );

        }

        const binaryIndexInDB = await BinaryIndex.findOne( options );

        if ( binaryIndexInDB ) {

          let binaryData = {
                             File: "",
                             FileName: "",
                             MimeType: "",
                             FileSize: 0
                           };

          if ( !strThumbnail ) {

            binaryData.File = path.join( strFullPath,
                                         binaryIndexInDB.FilePath,
                                         strId + "." + binaryIndexInDB.FileExtension + ".data" );
            binaryData.FileName = binaryIndexInDB.FileName;
            binaryData.FileSize = binaryIndexInDB.FileSize;
            binaryData.MimeType = binaryIndexInDB.MimeType;

          }
          else {

            binaryData = await BinaryServiceController.selectThumbnail( strFullPath,
                                                                        path.join( strFullPath, binaryIndexInDB.FilePath ),
                                                                        strId + "." + binaryIndexInDB.FileExtension + ".thumbnail",
                                                                        binaryIndexInDB.FileName,
                                                                        binaryIndexInDB.FileExtension,
                                                                        binaryIndexInDB.MimeType,
                                                                        binaryIndexInDB.FileSize,
                                                                        strThumbnail,
                                                                        logger );

          }

          if ( fs.existsSync( binaryData.File ) ) {

            if ( binaryIndexInDB.AccessKind == 1 ||        //Public
                 binaryIndexInDB.ShareCode === strAuth ) { //Auth code match with the share code, in this case allow to access to the data

              result = {
                         StatusCode: 200,
                         File: binaryData.File,
                         Name: binaryData.FileName,
                         Mime: binaryData.MimeType,
                         Size: binaryData.FileSize,
                       }

            }
            else if ( CommonUtilities.isNotNullOrEmpty( strAuth ) ) { //Authenticated Or Tag

              let strAuthorization = null;

              strAuthorization = await CacheManager.getData( strAuth,
                                                             logger ); //get from cache the real authorization token

              if ( CommonUtilities.isNotNullOrEmpty( strAuthorization ) ) {

                let userSessionStatus = null;

                userSessionStatus = await SystemUtilities.getUserSessionStatus( strAuthorization,
                                                                                context,
                                                                                true,
                                                                                false,
                                                                                null,
                                                                                logger );

                if ( userSessionStatus ) {

                  context.UserSessionStatus = userSessionStatus;

                }

              }

              ( req as any ).returnResult = 1; //Force to return the result

              //Check for valid session token
              let resultData = await SystemUtilities.middlewareCheckIsAuthenticated( req,
                                                                                     null, //Not write response back
                                                                                     null );

              if ( resultData &&
                   resultData.StatusCode == 200 ) { //Ok the authorization token is valid

                if ( binaryIndexInDB.AccessKind == 2 ) { //Authenticated

                  result = {
                             StatusCode: 200,
                             File: binaryData.File,
                             Name: binaryData.FileName,
                             Mime: binaryData.MimeType,
                             Size: binaryData.FileSize,
                           }

                }
                else { //Tag

                  //Check access using Owner or DenyAccessTag AllowAccessTag
                  let bIsOwner = await BinaryServiceController.checkTagIsAllowedToAccess( binaryIndexInDB.Owner,
                                                                                context.UserSessionStatus.Role,
                                                                                context.UserSessionStatus.UserId,
                                                                                context.UserSessionStatus.UserName,
                                                                                context.UserSessionStatus.UserTag,
                                                                                context.UserSessionStatus.UserGroupId,
                                                                                context.UserSessionStatus.UserGroupName,
                                                                                context.UserSessionStatus.UserGroupTag,
                                                                                context.UserSessionStatus.Tag,
                                                                                false,
                                                                                logger );

                  let bDenyTagAccess = false;
                  let bAllowTagAccess = false;

                  if ( bIsOwner === false ) {

                    bDenyTagAccess = await BinaryServiceController.checkTagIsAllowedToAccess( binaryIndexInDB.DenyTagAccess,
                                                                                    context.UserSessionStatus.Role,
                                                                                    context.UserSessionStatus.UserId,
                                                                                    context.UserSessionStatus.UserName,
                                                                                    context.UserSessionStatus.UserTag,
                                                                                    context.UserSessionStatus.UserGroupId,
                                                                                    context.UserSessionStatus.UserGroupName,
                                                                                    context.UserSessionStatus.UserGroupTag,
                                                                                    context.UserSessionStatus.Tag,
                                                                                    true,
                                                                                    logger );

                    if ( bDenyTagAccess === false ) {

                      bAllowTagAccess = await BinaryServiceController.checkTagIsAllowedToAccess( binaryIndexInDB.AllowTagAccess,
                                                                                       context.UserSessionStatus.Role,
                                                                                       context.UserSessionStatus.UserId,
                                                                                       context.UserSessionStatus.UserName,
                                                                                       context.UserSessionStatus.UserTag,
                                                                                       context.UserSessionStatus.UserGroupId,
                                                                                       context.UserSessionStatus.UserGroupName,
                                                                                       context.UserSessionStatus.UserGroupTag,
                                                                                       context.UserSessionStatus.Tag,
                                                                                       true,
                                                                                       logger );

                    }

                  }

                  if ( bIsOwner || ( bDenyTagAccess === false && bAllowTagAccess ) ) {

                    result = {
                               StatusCode: 200,
                               File: binaryData.File,
                               Name: binaryData.FileName,
                               Mime: binaryData.MimeType,
                               Size: binaryData.FileSize,
                             }

                  }
                  else {

                    let strCode = "";
                    let strMessage = "";

                    if ( bDenyTagAccess ) {

                      strCode = "ERROR_FORBIDEN_ACCESS_DENIED";
                      strMessage = "Explicit deny access to binary data in DenyTagAccess field";

                    }
                    else {

                      strCode = "ERROR_FORBIDEN_ACCESS_NOT_ALLOWED";
                      strMessage = "No explicit allow access to binary data in AllowTagAccess field";

                    }

                    resultData = {
                                   StatusCode: 403, //Forbiden
                                   Code: strCode,
                                   Message: strMessage,
                                   LogId: null,
                                   IsError: true,
                                   Errors: [
                                             {
                                               Code: strCode,
                                               Message: strMessage,
                                             }
                                           ],
                                    Warnings: [],
                                    Count: 0,
                                    Data: []
                                 };

                    resp.setHeader( "X-Body-Response",
                                    JSON.stringify( resultData ) );

                    //ANCHOR binary data download Fobidden
                    result = {
                               StatusCode: resultData.StatusCode, //Forbidden
                               File: path.join( strFullPath, "/@default@/images/http_codes/403.png" ),
                               Name: "403.png",
                               Mime: "image/png",
                               Size: 13129,
                             }

                  }

                }

              }
              else {

                resp.setHeader( "X-Body-Response",
                                JSON.stringify( resultData ) );

                //ANCHOR binary data download Unauthorized
                result = {
                           StatusCode: resultData.StatusCode, //Unauthorized
                           File: path.join( strFullPath, "/@default@/images/http_codes/401.png" ),
                           Name: "401.png",
                           Mime: "image/png",
                           Size: 14591,
                         }

              }

            }
            else {

              const resultHeaders = {
                                      StatusCode: 400,
                                      Code: 'ERROR_ID_PARAMETER_IS_EMPTY',
                                      Message: `The id parameter cannot be empty.`,
                                      LogId: null,
                                      Mark: null,
                                      IsError: true,
                                      Errors: [
                                                {
                                                  Code: 'ERROR_ID_PARAMETER_IS_EMPTY',
                                                  Message: `The id parameter cannot be empty.`,
                                                }
                                              ],
                                      Warnings: [],
                                      Count: 0,
                                      Data: []
                                    };

              resp.setHeader( "X-Body-Response", JSON.stringify( resultHeaders ) );

              result = {
                         StatusCode: 400, //Bad request
                       }

            }

          }
          else {

            const resultHeaders = {
                                    StatusCode: 404,
                                    Code: 'ERROR_FILE_NOT_FOUND',
                                    Message: `The binary data file not found.`,
                                    LogId: null,
                                    Mark: null,
                                    IsError: true,
                                    Errors: [
                                              {
                                                Code: 'ERROR_FILE_NOT_FOUND',
                                                Message: `The binary data file not found.`,
                                              }
                                            ],
                                    Warnings: [],
                                    Count: 0,
                                    Data: []
                                  };

            resp.setHeader( "X-Body-Response", JSON.stringify( resultHeaders ) );

            //ANCHOR binary data download FILE NOT FOUND
            result = {
                       StatusCode: 404,
                       File: path.join( strFullPath, "/@default@/images/http_codes/404.png" ),
                       Name: "404.png",
                       Mime: "image/png",
                       Size: 13218,
                     }

          }

        }
        else {

          const resultHeaders = {
                                  StatusCode: 404,
                                  Code: 'ERROR_DB_NOT_FOUND',
                                  Message: `The binary data db not found.`,
                                  LogId: null,
                                  Mark: null,
                                  IsError: true,
                                  Errors: [
                                            {
                                              Code: 'ERROR_DB_NOT_FOUND',
                                              Message: `The binary data db not found.`,
                                            }
                                          ],
                                  Warnings: [],
                                  Count: 0,
                                  Data: []
                                };

          resp.setHeader( "X-Body-Response", JSON.stringify( resultHeaders ) );

          //ANCHOR binary data download DB NOT FOUND
          result = {
                     StatusCode: 404,
                     File: path.join( strFullPath, "/@default@/images/http_codes/404.png" ),
                     Name: "404.png",
                     Mime: "image/png",
                     Size: 13218,
                   }

        }

      }
      else {

        const resultHeaders = {
                                StatusCode: 400,
                                Code: 'ERROR_ID_PARAMETER_IS_EMPTY',
                                Message: `The id parameter cannot be empty.`,
                                LogId: null,
                                Mark: null,
                                IsError: true,
                                Errors: [
                                          {
                                            Code: 'ERROR_ID_PARAMETER_IS_EMPTY',
                                            Message: `The id parameter cannot be empty.`,
                                          }
                                        ],
                                Warnings: [],
                                Count: 0,
                                Data: []
                              };

        resp.setHeader( "X-Body-Response", JSON.stringify( resultHeaders ) );

        result = {
                   StatusCode: 400, //Bad request
                 }

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.processBinaryDataUpload.name;

      const strMark = "1AB14A900E5E";

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

      const resultHeaders = {
                              StatusCode: 500,
                              Code: 'ERROR_UNEXPECTED',
                              Message: 'Unexpected error. Please read the server log for more details.',
                              LogId: error.LogId,
                              IsError: true,
                              Errors: [
                                        {
                                          Code: error.name,
                                          Message: error.message,
                                          Details: await SystemUtilities.processErrorDetails( error ) //error
                                        }
                                      ],
                              Warnings: [],
                              Count: 0,
                              Data: []
                            };

      resp.setHeader( "X-Body-Response", JSON.stringify( resultHeaders ) );

      result = {
                 StatusCode: 500,
               };

    }

    return result;

  }

}