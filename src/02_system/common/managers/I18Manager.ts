import fs from 'fs';
import { promises as fsPromises } from 'fs';
import os from "os";
import path from 'path';
import appRoot from 'app-root-path';

import CommonConstants from "../CommonConstants";

import SystemUtilities from "../SystemUtilities";
import CommonUtilities from "../CommonUtilities";

import LoggerManager from "./LoggerManager";

import util from 'util';

const debug = require( 'debug' )( 'I18Manager' );

export default class I18NManager {

  private static _translations: {};

  private static _missingTranslations: {};

  private static _lastSavedFile: null;

  static async _scan( directory: any,
                      params: any,
                      logger: any ): Promise<any> {

    try {

      const files = fs.readdirSync( directory )
                      .filter( file => fs.lstatSync( path.join( directory, file ) ).isFile() )
                      .filter( file => file.indexOf( '.' ) !== 0 && ( file.slice( -5 ) === '.json' ) );

      const dirs = fs.readdirSync( directory )
                     .filter( file => fs.lstatSync( path.join( directory, file ) ).isDirectory() );

      const pathParts = directory.split( "/" );

      for ( const file of files ) {

        if ( path.join( directory, file ) !== __filename ) {

          const jsonData = ( await import( path.join( directory, file ) ) ).default; //.then( module => module.default );

          //let debugMark = debug.extend( '09B016268A87' );
          //debugMark( "%O", jsonData );

          const strLanguage = pathParts[ pathParts.length - 1 ];

          if ( this._translations ) {

            this._translations[ strLanguage ] = { ...this._translations[ strLanguage ], ...jsonData };

          }
          else {

            this._translations = {};

            this._translations[ strLanguage ] = { ...jsonData };

          }

        }

      }

      for ( const dir of dirs ) {

        if ( dir !== "template" &&
             dir !== "disabled" &&
             dir.startsWith( "disabled_" ) === false  ) {

          await this._scan( path.join( directory, dir ),
                            params,
                            logger );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = I18NManager.name + "." + this._scan.name;

      const strMark = "BC31EEF04EBD";

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

  static async create( params: any,
                       logger: any ): Promise<void> {

    //let result = null;

    try {

      await this._scan( __dirname + "/../others/i18n/languages/",
                        params,
                        logger );

      await this._scan( __dirname + "/../../../03_business/common/others/i18n/languages/",
                        params,
                        logger );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.create.name;

      const strMark = "5B41B4AB9161";

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

    //return result;

  }

  static async saveMissingTranslationsToFile(): Promise<boolean> {

    let bResult = false;

    try {

      if ( !this._lastSavedFile ||
           await SystemUtilities.dateTimeIsAfterToSeconds( this._lastSavedFile, 20 ) ) {

        const strDateTime = SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_06 );

        const strFileName = "missing_translations_" + strDateTime + ".json";

        const strPath = appRoot.path + "/temp/" + os.hostname + "/";

        fs.mkdirSync( strPath, { recursive: true } );

        const strFullPath = strPath + strFileName;

        await fsPromises.writeFile( strFullPath, JSON.stringify( this._missingTranslations, null, 2 ) );

        this._lastSavedFile = SystemUtilities.getCurrentDateAndTime();

        bResult = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.saveMissingTranslationsToFile.name;

      const strMark = "3E36A9D53D84";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        error.catchedOn = sourcePosition;
        LoggerManager.mainLoggerInstance.error( error );

      }

    }

    return bResult;

  }

  static async addToMissingTranslations( strLanguage: string,
                                         strSentence: string ): Promise<boolean> {

    let bResult = false;

    try {

      if ( process.env.LOG_MISSING_TRANSLATIONS === "1" ) {

        const jsonData = {};

        jsonData[ strSentence ] = "";

        if ( this._missingTranslations ) {

          this._missingTranslations[ strLanguage ] = { ...this._missingTranslations[ strLanguage ], ...jsonData };

        }
        else {

          this._missingTranslations = {};

          this._missingTranslations[ strLanguage ] = { ...jsonData };

        }

        await this.saveMissingTranslationsToFile();

        bResult = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.addToMissingTranslations.name;

      const strMark = "3D10A7FB3D6E";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        error.catchedOn = sourcePosition;
        LoggerManager.mainLoggerInstance.error( error );

      }

    }

    return bResult;

  }

  static async translate( strLanguage: string,
                          strSentence: string,
                          ...param: any ): Promise<string> {

    let strResult = strSentence;

    try {

      strResult = this._translations[ strLanguage ] ? this._translations[ strLanguage ][ strSentence ] : strSentence;

      if ( param &&
           param.length > 0 ) {

        strResult = util.format( strResult, ...param );

      }
      else if ( !strResult ||
                strResult === strSentence ) {

        strResult = strSentence;

        await this.addToMissingTranslations( strLanguage,
                                             strSentence );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.translate.name;

      const strMark = "5B41B4AB9161";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        error.catchedOn = sourcePosition;
        LoggerManager.mainLoggerInstance.error( error );

      }

    }

    return strResult;

  }

  static translateSync( strLanguage: string,
                        strSentence: string,
                        ...param: any ): string {

    let strResult = strSentence;

    try {

      strResult = this._translations[ strLanguage ] ? this._translations[ strLanguage ][ strSentence ] : strSentence;

      if ( param &&
           param.length > 0 ) {

        strResult = util.format( strResult, ...param );

      }
      else if ( !strResult ||
                strResult === strSentence ) {

        strResult = strSentence;

        this.addToMissingTranslations( strLanguage,
                                       strSentence );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.translateSync.name;

      const strMark = "6859CB85F886";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        error.catchedOn = sourcePosition;
        LoggerManager.mainLoggerInstance.error( error );

      }

    }

    return strResult;

  }

}