import appRoot from 'app-root-path';
require( 'dotenv' ).config( { path: appRoot.path + "/.env.secrets" } );

import moment from "moment-timezone";

import shell from "shelljs";

import fs from "fs"; //Load the filesystem module
//import path from "path";
import cluster from "cluster";

import Telegraf from "telegraf";

import CommonConstants from "../02_system/common/CommonConstants";

import CommonUtilities from "../02_system/common/CommonUtilities";
import SystemUtilities from "../02_system/common/SystemUtilities";

import LoggerManager from "../02_system/common/managers/LoggerManager";

let debug = require( "debug" )( "TelegramBot" );

const argv = require("yargs").argv;

export default class TelegramBot {

  static strCommandRunning = "";

  static commandResult = new Map<string,any>();

  //static validUserName = [ "dev001", "dev007", "dev748" ];
  //static validUserPassword = [ "me.123.", "super.123.", "develop.123." ];

  //static validCommandBackupTarget = [ "dropbox" ];
  //static validCommandBackupDatabase = [ "odin-v1-legacy-kk-fl-miami", "BinaryManagerDB-odin-v1-legacy-kk-fl-miami", "test" ];

  //static validCommandTargetDropboxFolder = [ "ZZZ_odin-v1-legacy-kk-fl-miami-backup", "ZZZ_odin-v1-legacy-kk-fl-miami-BinaryManagerDB-backup" ];

  static currentInstance = null;

  static botConfig = require( appRoot.path + "/bot_config.json" );

  static async init( logger: any ) {

    try {

      let debugMark = debug.extend( "68214E8BD29B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      debugMark( "Telegram bot init" );

      debugMark( "Argument files: %s", argv.files );
      debugMark( "Argument server: %s", argv.server );
      debugMark( SystemUtilities.strBaseRootPath );

      TelegramBot.currentInstance = new Telegraf( process.env.TELEGRAM_BOT_TOKEN );

      TelegramBot.currentInstance.start( ( ctx: any ) => {

        ctx.reply( "Bot is active and ready to receive commands" )

      } );

      TelegramBot.currentInstance.help( async ( ctx: any ) => {

        await TelegramBot.handleHelpCommand( ctx, logger );

      } );

      TelegramBot.currentInstance.command( "status", async ( ctx: any ) => {

        await TelegramBot.handleStatusCommand( ctx, logger );

      } );

      TelegramBot.currentInstance.command( "backup", async ( ctx: any ) => {

        await TelegramBot.handleBackupCommand( ctx, logger );

      } );

      TelegramBot.currentInstance.command( "upload", async ( ctx: any ) => {

        await TelegramBot.handleUploadCommand( ctx, logger );

      } );

      TelegramBot.currentInstance.command( "deploy", async ( ctx: any ) => {

        await TelegramBot.handleDeployCommand( ctx, logger );

      } );

      /*
      TelegramBot.currentInstance.command( "ping", async ( ctx: any ) => {

        await new Promise( ( resolve, reject ) => {

          const shellCommandExecution = shell.exec( "/usr/local/bin/custom_command/telegram/bot/commands/test-output/run.sh", { silent: true, async: true } );

          shellCommandExecution.stdout.on( "data", function( strData: string ) {

            fs.appendFileSync( "/tmp/stdout.txt", strData );
            ctx.reply( strData );

          });

          shellCommandExecution.stdout.on( "close", function( strData: string ) {

            fs.appendFileSync( "/tmp/code.txt", "" + shellCommandExecution.exitCode );
            ctx.reply( strData );
            resolve( true );

          });

          shellCommandExecution.stderr.on( "data", function( strData: string ) {

            fs.appendFileSync( "/tmp/stderr.txt", strData );
            ctx.reply( strData );

          });

          shellCommandExecution.stderr.on( "close", function( strData: string ) {

            fs.appendFileSync( "/tmp/code.txt", strData );
            ctx.reply( strData );

          });

        } );

      } );
      */

      TelegramBot.currentInstance.launch();

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.init.name;

      const strMark = "028598DAF91C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

    }

  }

  static parseJSON( strJSONToParse: string, logger: any ): any {

    let result = null;

    try {

      result = JSON.parse( strJSONToParse );

    }
    catch ( error ) {


    }

    return result;

  }

  /*
  static removeCommand( commandList: string[],
                        strCommandToRemove: string,
                        logger: any ): string[] {

    let result = [];

    try {

      result = commandList.filter(
                                   function( value: string, index: number, arr: string[] ): boolean {

                                     return value !== strCommandToRemove;

                                   }
                                 );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.removeCommand.name;

      const strMark = "F001E90B273C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

    }

    return result;

  }
  */

  /*
  static parseRCloneOutput( strOutput: string, logger: any ): string {

    let strResult = "";

    const lines = strOutput.split( "\n" );

    for ( let intLine = 0; intLine < lines.length; intLine++ ) {

      const strLine = lines[ intLine ];

      if ( strLine.includes( "Failed to copy:" ) ) {

        strResult = "Error: Failed to copy:" + strLine.split( "Failed to copy:" )[ 1 ];
        break;

      }
      else if ( strLine.includes( ": not found" ) ) {

        strResult = "Error: Not found";
        break;

      }
      else if ( strLine.includes( "backup:" ) ) {

        strResult = "backup: " + strLine.split( "backup:" )[ 1 ];
        break;

      }
      else {

        strResult = "backup: Unknown file";
        break;

      }

    }

    return strResult;

  }
  */

  static async parseResultFileBackupCommand( strFilePathResult: string,
                                             logger: any ) : Promise<string> {

    let strResult = "";

    try {

      const readline = require( "readline" );

      const fileStream = fs.createReadStream( strFilePathResult );

      const readLineInterface = readline.createInterface(
                                                          {
                                                            input: fileStream,
                                                            crlfDelay: Infinity
                                                          }
                                                        );

      let strProgress = "0";
      let strBackupFile = "";

      for await ( const strLine of readLineInterface ) {

        if ( strLine.startsWith( "progress:" ) ) {

          const linePart = strLine.split( "," );

          strProgress = linePart[ 1 ].replace( "%", "" ).trim();

        }
        else if ( strLine.startsWith( "backup:" ) ) {

          strBackupFile = strLine.replace( "backup:", "" ).trim().split( "/" );

          strBackupFile = strBackupFile[ strBackupFile.length - 1 ];

        }
        else if ( strLine.startsWith( "file:" ) ) {

          strBackupFile = strLine.replace( "file:", "" ).trim().split( "/" );

          strBackupFile = strBackupFile[ strBackupFile.length - 1 ];

        }

      }

      if ( parseInt( strProgress ) === 100 ) {

        strResult = "Success to upload the file. Backup file is " + strBackupFile;

      }
      else {

        strResult = "Failed to upload the file. Backup file is " + strBackupFile;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.parseResultFileBackupCommand.name;

      const strMark = "755E4D781AD5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        logger.error( error );

      }

    }

    return strResult;

  }

  static async parseResultFileUploadCommand( strFilePathResult: string,
                                             logger: any ) : Promise<string> {

    let strResult = "";

    try {

      const readline = require( "readline" );

      const fileStream = fs.createReadStream( strFilePathResult );

      const readLineInterface = readline.createInterface(
                                                          {
                                                            input: fileStream,
                                                            crlfDelay: Infinity
                                                          }
                                                        );

      let strProgress = "0";
      let strBackupFile = "";

      for await ( const strLine of readLineInterface ) {

        if ( strLine.startsWith( "progress:" ) ) {

          const linePart = strLine.split( "," );

          strProgress = linePart[ 1 ].replace( "%", "" ).trim();

        }
        else if ( strLine.startsWith( "backup:" ) ) {

          strBackupFile = strLine.replace( "backup:", "" ).trim().split( "/" );

          strBackupFile = strBackupFile[ strBackupFile.length - 1 ];

        }
        else if ( strLine.startsWith( "file:" ) ) {

          strBackupFile = strLine.replace( "file:", "" ).trim().split( "/" );

          strBackupFile = strBackupFile[ strBackupFile.length - 1 ];

        }

      }

      if ( parseInt( strProgress ) === 100 ) {

        strResult = "Success to upload the file. Backup file is " + strBackupFile;

      }
      else {

        strResult = "Failed to upload the file. Backup file is " + strBackupFile;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.parseResultFileBackupCommand.name;

      const strMark = "755E4D781AD5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        logger.error( error );

      }

    }

    return strResult;

  }

  static async handleRunBackupCommand( context: any,
                                       strCommandId: string,
                                       strShellOutDir: string,
                                       strShellCommandToExecute: string,
                                       strCommand: string,
                                       logger: any ) {

    let strResult = "";

    try {

      TelegramBot.commandResult.set( strCommandId, "Working..." );

      TelegramBot.strCommandRunning = strCommand;

      //let debugMark = debug.extend( "89852EE05993" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      strShellOutDir = strShellOutDir + "/" + SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_08 );

      shell.mkdir( "-p", strShellOutDir );

      await new Promise( ( resolve, reject ) => {

        let strCurrentDate = "";

        const shellCommandExecution = shell.exec( strShellCommandToExecute,
                                                  {
                                                    silent: true,
                                                    async: true
                                                  } );

        shellCommandExecution.stdout.on( "data", function( strData: string ) {

          const lines = strData.split( "@__EOL__@" );

          for ( let intLineIndex = 0; intLineIndex < lines.length; intLineIndex++ ) {

            const strLine = lines[ intLineIndex ];

            if ( strLine.startsWith( "Current date: " ) ) {

              let strDate = strLine.replace( "Current date: ", "" ).split( "-" );

              strCurrentDate = strDate[ 0 ] + "/" + strDate[ 1 ] + "/" + strDate[ 2 ] + " ";

            }

            if ( strLine.trimLeft().startsWith( "@__OUTPUT_RCLONE__@" ) ) {

              const subLines = strLine.replace( "@__OUTPUT_RCLONE__@", "" ).trimLeft().split( strCurrentDate );

              for ( let intSubLineIndex = 0; intSubLineIndex < subLines.length; intSubLineIndex++ ) {

                let strSubLine = subLines[ intSubLineIndex ].trim();

                if ( strSubLine ) {

                  const jsonData = TelegramBot.parseJSON( strSubLine, null );

                  if ( jsonData ) {

                    const strJSON = JSON.stringify( jsonData, null, 2 )

                    fs.appendFileSync( strShellOutDir + "/stdout.txt", strJSON );

                  }
                  else {

                    fs.appendFileSync( strShellOutDir + "/stdout.txt", "progress: " + strCurrentDate + strSubLine.trim() + ( intLineIndex + 1 < lines.length ? "\n": "" ) );

                  }

                }

              }

            }
            else {

              fs.appendFileSync( strShellOutDir + "/stdout.txt", strLine.trim() + ( intLineIndex + 1 < lines.length ? "\n": "" ) );

            }

          }

        });

        shellCommandExecution.stdout.on( "close", async () => {

          if ( TelegramBot.strCommandRunning ) {

            TelegramBot.strCommandRunning = "";

            fs.appendFileSync( strShellOutDir + "/code.txt",
                               "" + shellCommandExecution.exitCode );

            const strResult = await TelegramBot.parseResultFileBackupCommand( strShellOutDir + "/stdout.txt",
                                                                              logger );

            context.reply( "Finished command: " + strCommand + "\n" +
                           "Id: " + strCommandId + "\n" +
                           "Result: " + strResult );

            TelegramBot.commandResult.set( strCommandId,
                                           strResult );

            resolve( true );

          }

        });

        shellCommandExecution.stderr.on( "data", function( strData: string ) {

          if ( strData.includes( "\n" ) ) {

            const lines = strData.split( "\n" );

            for ( const strLine of lines ) {

              const jsonData = TelegramBot.parseJSON( strLine, null );

              if ( jsonData ) {

                const strJSON = JSON.stringify( jsonData, null, 2 )

                fs.appendFileSync( strShellOutDir + "/stderr.txt", strJSON + "\n" );

              }
              else {

                fs.appendFileSync( strShellOutDir + "/stderr.txt", strLine.trim() + "\n" );

              }

            }

          }
          else if ( strData.endsWith( "\n" ) ) {

            fs.appendFileSync( strShellOutDir + "/stderr.txt", strData );

          }
          else {

            fs.appendFileSync( strShellOutDir + "/stderr.txt", strData + "\n" );

          }

        });

        shellCommandExecution.stderr.on( "close", async () => {

          if ( TelegramBot.strCommandRunning ) {

            TelegramBot.strCommandRunning = "";

            fs.appendFileSync( strShellOutDir + "/code.txt",
                               "" + shellCommandExecution.exitCode );

            const strResult = await TelegramBot.parseResultFileBackupCommand( strShellOutDir + "/stdout.txt",
                                                                              logger );

            context.reply( "Finished command: " + strCommand + "\n" +
                           "Id: " + strCommandId + "\n" +
                           "Result: " + strResult );

            TelegramBot.commandResult.set( strCommandId,
                                           strResult );

            resolve( true );

          }

        });

      });

      /*
      shell.exec( strShellCommandToExecute, function( intCode: number,
                                                      strStdout: string,
                                                      strStderr: string ) {

        fs.writeFileSync( strShellOutDir + "/code.txt", "" + intCode );
        fs.writeFileSync( strShellOutDir + "/stdout.txt", strStdout );
        fs.writeFileSync( strShellOutDir + "/stderr.txt", strStderr );

        const strOutputError = TelegramBot.parseRCloneOutput( strStdout, true );

        const strStdOutput = TelegramBot.parseRCloneOutput( strStdout, false );

        if ( strOutputError.startsWith( "Error: " ) ) {

          TelegramBot.commandResult.set( strCommandId, "ERROR: Upload failed the file is " + strStdOutput.replace( "backup:", "" ) + "." );

        }
        else {

          TelegramBot.commandResult.set( strCommandId, "SUCCESS: Upload success the file is " + strStdOutput.replace( "backup:", "" ) + "." );

        }

        //Remove the command from running
        TelegramBot.strCommandRunning = "";

        debugMark( TelegramBot.commandResult.get( strCommandId ) );

        / *
        if ( intCode === 0 ) {

          debugMark( "Sucess to run command." );

        }
        else {

          debugMark( "Failed to run command." );

        }
        * /

      });
      */

      /*
      const shellCommandToExecute = shell.exec( strShellCommandToExecute );

      fs.writeFileSync( strShellOutDir + "/code.txt", "" + shellCommandToExecute.code );
      fs.writeFileSync( strShellOutDir + "/stdout.txt", shellCommandToExecute.stdout );
      fs.writeFileSync( strShellOutDir + "/stderr.txt", shellCommandToExecute.stderr );

      if ( shellCommandToExecute.code === 0 ) {

        debugMark( "Sucess to run command." );

      }
      else {

        debugMark( "Failed to run command." );

      }
      */

      /*
      TelegramBot.strCommandRunning = TelegramBot.removeCommand( TelegramBot.strCommandRunning,
                                                                 strCommand,
                                                                 logger );
                                                              */

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.handleRunBackupCommand.name;

      const strMark = "B1C77F81C21E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

      //Remove the command from running
      TelegramBot.strCommandRunning = "";

      TelegramBot.commandResult[ strCommandId ] = "ERROR: " + error.message;

    }

    return strResult;

  }

  static validateUserAndPassword( strUserName: string,
                                  strUserPassword: string,
                                  logger: any ): string {

    let strResult = "failed";

    try {

      //const strUserName = commandArgs[ 1 ];

      if ( !TelegramBot.botConfig.user[ strUserName ] ) {

        strResult = "Invalid user name";

      }
      else {

        //const strUserPassword = commandArgs[ 2 ];

        if ( TelegramBot.botConfig.user[ strUserName ] !== strUserPassword ) {

          strResult = "Invalid user password";

        }
        else {

          strResult = "";

        }

      }

    }
    catch ( error ) {


    }

    return strResult;

  }

  static async handleHelpCommand( context: any, logger: any ) {

    try {

      let debugMark = debug.extend( "54C6CB14379D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      const dateTimeFromCommand = moment.unix( context.message.date ).tz( CommonUtilities.getCurrentTimeZoneId() )

      debugMark( "From id: ", context.message.from.id );
      debugMark( "From name: ", context.message.from.first_name );

      debugMark( "Command date time: ", dateTimeFromCommand.format() );
      debugMark( "Command: ", context.message.text );

      let strReplyMessage = "";

      const currentDateTime = SystemUtilities.getCurrentDateAndTimeFromAndDecMinutes( SystemUtilities.getCurrentDateAndTime(), 1 );

      if ( SystemUtilities.isDateAndTimeBeforeAt( currentDateTime.format(), dateTimeFromCommand.format() ) ) {

        if ( context.message.from.is_bot === false ) {

          const commandList = Object.keys( TelegramBot.botConfig.help );

          for ( let intIndex = 0; intIndex < commandList.length; intIndex++ ) {

            const strCommand = commandList[ intIndex ]; //TelegramBot.botConfig.commands[ intIndex ];

            strReplyMessage += strCommand + " => " + TelegramBot.botConfig.help[ strCommand ] + "\n";

          }

        }
        else {

          strReplyMessage = "Bot not allowed to run commands";

        }

      }
      else {

        strReplyMessage = "Command is old to 1 minute. Ignoring";

      }

      if ( strReplyMessage ) {

        context.reply( strReplyMessage );
        debugMark( strReplyMessage );

      }

    }
    catch ( error ) {

      //Remove the command from running
      TelegramBot.strCommandRunning = "";

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.handleHelpCommand.name;

      const strMark = "5EA662A6D26F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

    }

  }

  static async handleStatusCommand( context: any, logger: any ) {

    try {

      let debugMark = debug.extend( "EE0BDA76216E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      const dateTimeFromCommand = moment.unix( context.message.date ).tz( CommonUtilities.getCurrentTimeZoneId() )

      debugMark( "From id: ", context.message.from.id );
      debugMark( "From name: ", context.message.from.first_name );

      debugMark( "Command date time: ", dateTimeFromCommand.format() );
      debugMark( "Command: ", context.message.text );

      let strReplyMessage = "";

      const currentDateTime = SystemUtilities.getCurrentDateAndTimeFromAndDecMinutes( SystemUtilities.getCurrentDateAndTime(), 1 );

      if ( SystemUtilities.isDateAndTimeBeforeAt( currentDateTime.format(), dateTimeFromCommand.format() ) ) {

        if ( context.message.from.is_bot === false ) {

          const commandArgs = context.message.text.split( " " );

          if ( commandArgs.length === 4 ) {

            let bArgumentError = false;

            const strUserName = commandArgs[ 1 ];
            const strUserPassword = commandArgs[ 2 ];

            strReplyMessage = TelegramBot.validateUserAndPassword( strUserName,
                                                                    strUserPassword,
                                                                    logger );

            if ( strReplyMessage ) {

              bArgumentError = true;

            }

            const strCommandId = commandArgs[ 3 ];

            if ( TelegramBot.commandResult.has( strCommandId ) === false ) {

              strReplyMessage = "Command id " + strCommandId + " not found";
              bArgumentError = true;

            }

            if ( bArgumentError === false ) {

              strReplyMessage = TelegramBot.commandResult.get( strCommandId );

            }

          }
          else {

            strReplyMessage = "status command arguments are: /status <user_name> <user_password> <command_id>";

          }

        }
        else {

          strReplyMessage = "Bot not allowed to run commands";

        }

      }
      else {

        strReplyMessage = "Command is old to 1 minute. Ignoring";

      }

      if ( strReplyMessage ) {

        context.reply( strReplyMessage );
        debugMark( strReplyMessage );

      }

    }
    catch ( error ) {

      //Remove the command from running
      TelegramBot.strCommandRunning = "";

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.handleBackupCommand.name;

      const strMark = "37B0CBC35206" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

    }

  }

  static async handleBackupCommand( context: any, logger: any ) {

    try {

      let debugMark = debug.extend( "4DF7EF9A08B3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      const dateTimeFromCommand = moment.unix( context.message.date ).tz( CommonUtilities.getCurrentTimeZoneId() )

      debugMark( "From id: ", context.message.from.id );
      debugMark( "From name: ", context.message.from.first_name );

      debugMark( "Command date time: ", dateTimeFromCommand.format() );
      debugMark( "Command: ", context.message.text );

      let strReplyMessage = "";

      const currentDateTime = SystemUtilities.getCurrentDateAndTimeFromAndDecMinutes( SystemUtilities.getCurrentDateAndTime(), 1 );

      if ( SystemUtilities.isDateAndTimeBeforeAt( currentDateTime.format(), dateTimeFromCommand.format() ) ) {

        if ( !TelegramBot.strCommandRunning &&
             context.message.from.is_bot === false ) {

          const commandArgs = CommonUtilities.trimArrayFromString( context.message.text,
                                                                   " ",
                                                                   false ); //.split( " " )

          if ( commandArgs.length === 5 ) {

            let bArgumentError = false;

            const strUserName = commandArgs[ 1 ];
            const strUserPassword = commandArgs[ 2 ];

            strReplyMessage = TelegramBot.validateUserAndPassword( strUserName,
                                                                    strUserPassword,
                                                                    logger );

            if ( strReplyMessage ) {

              bArgumentError = true;

            }

            const strTargetService = commandArgs[ 3 ]; //dropbox, gdrive, skydrive

            const targetServiceList = TelegramBot.botConfig.backup ? Object.keys( TelegramBot.botConfig.backup ): [];

            if ( targetServiceList.includes( strTargetService ) === false ) {

              strReplyMessage = "Invalid remote service name.\nValid remote service names are:\n" + targetServiceList.join( "\n" );

              bArgumentError = true;

            }

            const strDatabaseName = commandArgs[ 4 ];

            if ( TelegramBot.botConfig.backup[ strTargetService ].includes( strDatabaseName ) === false ) {

              strReplyMessage = "Invalid remote database name.\nValid remote database names are:\n" + TelegramBot.botConfig.backup[ strTargetService ].join( "\n" ); //this.validCommandBackupDatabase.join( "," );
              bArgumentError = true;

            }

            if ( bArgumentError === false ) {

              const command = TelegramBot.botConfig.command;

              const strShellCommandToExecute = command[ commandArgs[ 0 ] + "_" + commandArgs[ 3 ] + "_" + commandArgs[ 4 ] ].command;
              let strShellOutDir = command[ commandArgs[ 0 ] + "_" + commandArgs[ 3 ] + "_" + commandArgs[ 4 ] ].out_dir + strUserName + "/";

              if ( strShellCommandToExecute ) {

                const strCommandId = SystemUtilities.hashString( SystemUtilities.getUUIDv4(),
                                                                 1,
                                                                 logger );

                TelegramBot.handleRunBackupCommand( context,
                                                    strCommandId,
                                                    strShellOutDir,
                                                    strShellCommandToExecute,
                                                    "/backup",
                                                    logger );

                strReplyMessage = "Command running in background with id: " + strCommandId + ".\nTo get the current command status use:\n/status " + strUserName + " " + strUserPassword + " " + strCommandId;

                /*
                strShellOutDir = strShellOutDir + "/" + SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_08 );

                shell.mkdir( "-p", strShellOutDir );

                const shellCommandToExecute = shell.exec( strShellCommandToExecute );

                fs.writeFileSync( strShellOutDir + "/code.txt", "" + shellCommandToExecute.code );
                fs.writeFileSync( strShellOutDir + "/stdout.txt", shellCommandToExecute.stdout );
                fs.writeFileSync( strShellOutDir + "/stderr.txt", shellCommandToExecute.stderr );

                if ( shellCommandToExecute.code === 0 ) {

                  strReplyMessage = "Sucess make backup.";

                }
                else {

                  strReplyMessage = "Failed make backup.";

                }
                */

                /*
                shell.exec( strShellCommandToExecute, function( intCode: number,
                                                                strStdout: string,
                                                                strStderr: string ) {

                  fs.writeFileSync( strShellOutDir + "/code.txt", "" + intCode );
                  fs.writeFileSync( strShellOutDir + "/stdout.txt", strStdout );
                  fs.writeFileSync( strShellOutDir + "/stderr.txt", strStderr );

                });
                */

              }
              else {

                strReplyMessage = "No shell command found.";

              }


            }

          }
          else if ( commandArgs[ commandArgs.length - 1 ] === "?" ) {

            if ( commandArgs.length === 2 ) {

              strReplyMessage = "Invalid user name.\nValid user names are:\n" + Object.keys( TelegramBot.botConfig.user ).join( "\n" );

            }
            else if ( commandArgs.length === 3 ) {

              strReplyMessage = "Invalid password for the user:\n" + commandArgs[ commandArgs.length - 2 ];

            }
            else if ( commandArgs.length === 4 ) {

              const targetServiceList = TelegramBot.botConfig.backup ? Object.keys( TelegramBot.botConfig.backup ): [];

              strReplyMessage = "Invalid remote service name.\nValid remote service names are:\n" + targetServiceList.join( "\n" );

            }

          }
          else {

            strReplyMessage = "/backup command arguments are:\n/backup <user_name> <user_password> <remote_service> <remote_database>";

          }

        }
        else if ( context.message.from.is_bot ) {

          strReplyMessage = "Bot not allowed to run commands";

        }
        else {

          strReplyMessage = "Command " + TelegramBot.strCommandRunning + " is running right now. Only one command at time is allowed.";

        }

      }
      else {

        strReplyMessage = "Command is old to 1 minute. Ignoring";

      }

      if ( strReplyMessage ) {

        context.reply( strReplyMessage );
        debugMark( strReplyMessage );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.handleBackupCommand.name;

      const strMark = "AD160B8C5534" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

      //Remove the command from running
      TelegramBot.strCommandRunning = "";

    }

  }

  static async handleRunUploadCommand( context: any,
                                       strCommandId: string,
                                       strShellOutDir: string,
                                       strShellCommandToExecute: string,
                                       strCommand: string,
                                       logger: any ) {

    let strResult = "";

    try {

      TelegramBot.commandResult.set( strCommandId, "Working..." );

      TelegramBot.strCommandRunning = strCommand;

      //let debugMark = debug.extend( "EA024BCF254C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      strShellOutDir = strShellOutDir + "/" + SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_08 );

      shell.mkdir( "-p", strShellOutDir );

      await new Promise( ( resolve, reject ) => {

        let strCurrentDate = "";

        const shellCommandExecution = shell.exec( strShellCommandToExecute,
                                                  {
                                                    silent: true,
                                                    async: true
                                                  } );

        shellCommandExecution.stdout.on( "data", function( strData: string ) {

          const lines = strData.split( "@__EOL__@" );

          for ( let intLineIndex = 0; intLineIndex < lines.length; intLineIndex++ ) {

            const strLine = lines[ intLineIndex ];

            if ( strLine.startsWith( "Current date: " ) ) {

              let strDate = strLine.replace( "Current date: ", "" ).split( "-" );

              strCurrentDate = strDate[ 0 ] + "/" + strDate[ 1 ] + "/" + strDate[ 2 ] + " ";

            }

            if ( strLine.trimLeft().startsWith( "@__OUTPUT_RCLONE__@" ) ) {

              const subLines = strLine.replace( "@__OUTPUT_RCLONE__@", "" ).trimLeft().split( strCurrentDate );

              for ( let intSubLineIndex = 0; intSubLineIndex < subLines.length; intSubLineIndex++ ) {

                let strSubLine = subLines[ intSubLineIndex ].trim();

                if ( strSubLine ) {

                  const jsonData = TelegramBot.parseJSON( strSubLine, null );

                  if ( jsonData ) {

                    const strJSON = JSON.stringify( jsonData, null, 2 )

                    fs.appendFileSync( strShellOutDir + "/stdout.txt", strJSON );

                  }
                  else {

                    fs.appendFileSync( strShellOutDir + "/stdout.txt", "progress: " + strCurrentDate + strSubLine.trim() + ( intLineIndex + 1 < lines.length ? "\n": "" ) );

                  }

                }

              }

            }
            else {

              fs.appendFileSync( strShellOutDir + "/stdout.txt", strLine.trim() + ( intLineIndex + 1 < lines.length ? "\n": "" ) );

            }

          }

        });

        shellCommandExecution.stdout.on( "close", async () => {

          if ( TelegramBot.strCommandRunning ) {

            TelegramBot.strCommandRunning = "";

            fs.appendFileSync( strShellOutDir + "/code.txt",
                               "" + shellCommandExecution.exitCode );

            const strResult = await TelegramBot.parseResultFileUploadCommand( strShellOutDir + "/stdout.txt",
                                                                              logger );

            context.reply( "Finished command: " + strCommand + "\n" +
                           "Id: " + strCommandId + "\n" +
                           "Result: " + strResult );

            TelegramBot.commandResult.set( strCommandId,
                                           strResult );

            resolve( true );

          }

        });

        shellCommandExecution.stderr.on( "data", function( strData: string ) {

          if ( strData.includes( "\n" ) ) {

            const lines = strData.split( "\n" );

            for ( const strLine of lines ) {

              const jsonData = TelegramBot.parseJSON( strLine, null );

              if ( jsonData ) {

                const strJSON = JSON.stringify( jsonData, null, 2 )

                fs.appendFileSync( strShellOutDir + "/stderr.txt", strJSON + "\n" );

              }
              else {

                fs.appendFileSync( strShellOutDir + "/stderr.txt", strLine.trim() + "\n" );

              }

            }

          }
          else if ( strData.endsWith( "\n" ) ) {

            fs.appendFileSync( strShellOutDir + "/stderr.txt", strData );

          }
          else {

            fs.appendFileSync( strShellOutDir + "/stderr.txt", strData + "\n" );

          }

        });

        shellCommandExecution.stderr.on( "close", async () => {

          if ( TelegramBot.strCommandRunning ) {

            TelegramBot.strCommandRunning = "";

            fs.appendFileSync( strShellOutDir + "/code.txt",
                               "" + shellCommandExecution.exitCode );

            const strResult = await TelegramBot.parseResultFileUploadCommand( strShellOutDir + "/stdout.txt",
                                                                              logger );

            context.reply( "Finished command: " + strCommand + "\n" +
                           "Id: " + strCommandId + "\n" +
                           "Result: " + strResult );

            TelegramBot.commandResult.set( strCommandId,
                                           strResult );

            resolve( true );

          }

        });

      });

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.handleRunUploadCommand.name;

      const strMark = "7800F1A4CA1A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

      //Remove the command from running
      TelegramBot.strCommandRunning = "";

      TelegramBot.commandResult[ strCommandId ] = "ERROR: " + error.message;

    }

    return strResult;

  }

  static async handleUploadCommand( context: any, logger: any ) {

    try {

      let debugMark = debug.extend( "66E1A588E419" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      const dateTimeFromCommand = moment.unix( context.message.date ).tz( CommonUtilities.getCurrentTimeZoneId() )

      debugMark( "From id: ", context.message.from.id );
      debugMark( "From name: ", context.message.from.first_name );

      debugMark( "Command date time: ", dateTimeFromCommand.format() );
      debugMark( "Command: ", context.message.text );

      let strReplyMessage = "";

      const currentDateTime = SystemUtilities.getCurrentDateAndTimeFromAndDecMinutes( SystemUtilities.getCurrentDateAndTime(), 1 );

      if ( SystemUtilities.isDateAndTimeBeforeAt( currentDateTime.format(), dateTimeFromCommand.format() ) ) {

        if ( !TelegramBot.strCommandRunning &&
             context.message.from.is_bot === false ) {

          const commandArgs = CommonUtilities.trimArrayFromString( context.message.text,
                                                                   " ",
                                                                   false ); //.split( " " )

          if ( commandArgs.length === 6 ) {

            let bArgumentError = false;

            const strUserName = commandArgs[ 1 ];

            const strUserPassword = commandArgs[ 2 ];

            strReplyMessage = TelegramBot.validateUserAndPassword( strUserName,
                                                                   strUserPassword,
                                                                   logger );

            if ( strReplyMessage ) {

              bArgumentError = true;

            }

            const strTargetService = commandArgs[ 3 ]; //dropbox, gdrive, skydrive

            const targetServiceList = TelegramBot.botConfig.upload ? Object.keys( TelegramBot.botConfig.upload ): [];

            if ( targetServiceList.includes( strTargetService ) === false ) {

              strReplyMessage = "Invalid remote service name.\nValid remote service names are:\n" + targetServiceList.join( "\n" );

              bArgumentError = true;

            }

            const strTargetRemoteFolder = commandArgs[ 4 ];

            if ( TelegramBot.botConfig.upload[ strTargetService ].includes( strTargetRemoteFolder ) === false ) {

              strReplyMessage = "Invalid remote folder name.\nValid remote folder names are:\n" + TelegramBot.botConfig.upload[ strTargetService ].join( "\n" );

              bArgumentError = true;

            }

            const strFileToupload = commandArgs[ 5 ];

            if ( !strFileToupload ) {

              strReplyMessage = "Invalid file name. Cannot be empty and must be exists in the server backup folder.";
              bArgumentError = true;

            }

            if ( bArgumentError === false ) {

              const command = TelegramBot.botConfig.command;

              const strShellCommandToExecute = command[ commandArgs[ 0 ] + "_" + commandArgs[ 3 ] ].command + " " + strTargetRemoteFolder + " " + strFileToupload;
              let strShellOutDir = command[ commandArgs[ 0 ] + "_" + commandArgs[ 3 ] ].out_dir + strUserName + "/";

              if ( strShellCommandToExecute ) {

                const strCommandId = SystemUtilities.hashString( SystemUtilities.getUUIDv4(), 1, logger );

                TelegramBot.handleRunUploadCommand( context,
                                                    strCommandId,
                                                    strShellOutDir,
                                                    strShellCommandToExecute,
                                                    "/upload",
                                                    logger );

                strReplyMessage = "Command running in background with id: " + strCommandId + ".\nTo get the current command status use:\n/status " + strUserName + " " + strUserPassword + " " + strCommandId;

              }
              else {

                strReplyMessage = "No shell command found.";

              }

            }

          }
          else if ( commandArgs[ commandArgs.length - 1 ] === "?" ) {

            if ( commandArgs.length === 2 ) {

              strReplyMessage = "Invalid user name.\nValid user names are:\n" + Object.keys( TelegramBot.botConfig.user ).join( "\n" );

            }
            else if ( commandArgs.length === 3 ) {

              strReplyMessage = "Invalid password for the user:\n" + commandArgs[ commandArgs.length - 2 ];

            }
            else if ( commandArgs.length === 4 ) {

              const targetServiceList = TelegramBot.botConfig.upload ? Object.keys( TelegramBot.botConfig.upload ): [];

              strReplyMessage = "Invalid remote service name.\nValid remote service names are:\n" + targetServiceList.join( "\n" );

            }
            else if ( commandArgs.length === 5 ) {

              const targetServiceList = TelegramBot.botConfig.upload ? Object.keys( TelegramBot.botConfig.upload ): [];

              const strTargetService = commandArgs[ commandArgs.length - 2 ];

              if ( strTargetService ) {

                strReplyMessage = "Invalid remote folder name.\nValid remote folder names are:\n" + TelegramBot.botConfig.upload[ strTargetService ].join( "\n" );

              }
              else {

                strReplyMessage = "Invalid remote service name " + strTargetService +".\nValid remote service names are:\n" + targetServiceList.join( "\n" );

              }

            }

          }
          else {

            strReplyMessage = "/upload command arguments are:\n/upload <user_name> <user_password> <remote_service> <remote_folder> <remote_file>";

          }

        }
        else if ( context.message.from.is_bot ) {

          strReplyMessage = "Bot not allowed to run commands";

        }
        else {

          strReplyMessage = "Command " + TelegramBot.strCommandRunning + " is running right now. Only one command at time is allowed.";

        }

      }
      else {

        strReplyMessage = "Command is old to 1 minute. Ignoring";

      }

      if ( strReplyMessage ) {

        context.reply( strReplyMessage );
        debugMark( strReplyMessage );

      }

    }
    catch ( error ) {

      //Remove the command from running
      TelegramBot.strCommandRunning = "";

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.handleBackupCommand.name;

      const strMark = "87A13DE41996" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

    }

  }

  static async handleRunDeployCommand( context: any,
                                       strCommandId: string,
                                       strShellOutDir: string,
                                       strShellCommandToExecute: string,
                                       strCommand: string,
                                       logger: any ) {

    let strResult = "";

    try {

      TelegramBot.commandResult.set( strCommandId, "Working..." );

      TelegramBot.strCommandRunning = strCommand;

      //let debugMark = debug.extend( "EA024BCF254C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      strShellOutDir = strShellOutDir + "/" + SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_08 );

      shell.mkdir( "-p", strShellOutDir );

      await new Promise( ( resolve, reject ) => {

        let strCurrentDate = "";

        const shellCommandExecution = shell.exec( strShellCommandToExecute,
                                                  {
                                                    silent: true,
                                                    async: true
                                                  } );

        shellCommandExecution.stdout.on( "data", function( strData: string ) {

          /*
          const lines = strData.split( "@__EOL__@" );

          for ( let intLineIndex = 0; intLineIndex < lines.length; intLineIndex++ ) {

            const strLine = lines[ intLineIndex ];

            if ( strLine.startsWith( "Current date: " ) ) {

              let strDate = strLine.replace( "Current date: ", "" ).split( "-" );

              strCurrentDate = strDate[ 0 ] + "/" + strDate[ 1 ] + "/" + strDate[ 2 ] + " ";

            }

            if ( strLine.trimLeft().startsWith( "@__OUTPUT_RCLONE__@" ) ) {

              const subLines = strLine.replace( "@__OUTPUT_RCLONE__@", "" ).trimLeft().split( strCurrentDate );

              for ( let intSubLineIndex = 0; intSubLineIndex < subLines.length; intSubLineIndex++ ) {

                let strSubLine = subLines[ intSubLineIndex ].trim();

                if ( strSubLine ) {

                  const jsonData = TelegramBot.parseJSON( strSubLine, null );

                  if ( jsonData ) {

                    const strJSON = JSON.stringify( jsonData, null, 2 )

                    fs.appendFileSync( strShellOutDir + "/stdout.txt", strJSON );

                  }
                  else {

                    fs.appendFileSync( strShellOutDir + "/stdout.txt", "progress: " + strCurrentDate + strSubLine.trim() + ( intLineIndex + 1 < lines.length ? "\n": "" ) );

                  }

                }

              }

            }
            else {

              fs.appendFileSync( strShellOutDir + "/stdout.txt", strLine.trim() + ( intLineIndex + 1 < lines.length ? "\n": "" ) );

            }

          }
          */

        });

        shellCommandExecution.stdout.on( "close", async () => {

          if ( TelegramBot.strCommandRunning ) {

            TelegramBot.strCommandRunning = "";

            fs.appendFileSync( strShellOutDir + "/code.txt",
                               "" + shellCommandExecution.exitCode );

            const strResult = await TelegramBot.parseResultFileUploadCommand( strShellOutDir + "/stdout.txt",
                                                                              logger );

            context.reply( "Finished command: " + strCommand + "\n" +
                           "Id: " + strCommandId + "\n" +
                           "Result: " + strResult );

            TelegramBot.commandResult.set( strCommandId,
                                           strResult );

            resolve( true );

          }

        });

        shellCommandExecution.stderr.on( "data", function( strData: string ) {

          if ( strData.includes( "\n" ) ) {

            const lines = strData.split( "\n" );

            for ( const strLine of lines ) {

              const jsonData = TelegramBot.parseJSON( strLine, null );

              if ( jsonData ) {

                const strJSON = JSON.stringify( jsonData, null, 2 )

                fs.appendFileSync( strShellOutDir + "/stderr.txt", strJSON + "\n" );

              }
              else {

                fs.appendFileSync( strShellOutDir + "/stderr.txt", strLine.trim() + "\n" );

              }

            }

          }
          else if ( strData.endsWith( "\n" ) ) {

            fs.appendFileSync( strShellOutDir + "/stderr.txt", strData );

          }
          else {

            fs.appendFileSync( strShellOutDir + "/stderr.txt", strData + "\n" );

          }

        });

        shellCommandExecution.stderr.on( "close", async () => {

          if ( TelegramBot.strCommandRunning ) {

            TelegramBot.strCommandRunning = "";

            fs.appendFileSync( strShellOutDir + "/code.txt",
                               "" + shellCommandExecution.exitCode );

            const strResult = await TelegramBot.parseResultFileUploadCommand( strShellOutDir + "/stdout.txt",
                                                                              logger );

            context.reply( "Finished command: " + strCommand + "\n" +
                           "Id: " + strCommandId + "\n" +
                           "Result: " + strResult );

            TelegramBot.commandResult.set( strCommandId,
                                           strResult );

            resolve( true );

          }

        });

      });

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.handleRunDeployCommand.name;

      const strMark = "66FA96313786" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

      //Remove the command from running
      TelegramBot.strCommandRunning = "";

      TelegramBot.commandResult[ strCommandId ] = "ERROR: " + error.message;

    }

    return strResult;

  }

  static async handleDeployCommand( context: any, logger: any ) {

    try {

      let debugMark = debug.extend( "6D50849570DD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      const dateTimeFromCommand = moment.unix( context.message.date ).tz( CommonUtilities.getCurrentTimeZoneId() )

      debugMark( "From id: ", context.message.from.id );
      debugMark( "From name: ", context.message.from.first_name );

      debugMark( "Command date time: ", dateTimeFromCommand.format() );
      debugMark( "Command: ", context.message.text );

      let strReplyMessage = "";

      const currentDateTime = SystemUtilities.getCurrentDateAndTimeFromAndDecMinutes( SystemUtilities.getCurrentDateAndTime(), 1 );

      if ( SystemUtilities.isDateAndTimeBeforeAt( currentDateTime.format(), dateTimeFromCommand.format() ) ) {

        if ( !TelegramBot.strCommandRunning &&
             context.message.from.is_bot === false ) {

          const commandArgs = context.message.text.split( " " );

          if ( commandArgs.length === 5 ) {

            let bArgumentError = false;

            const strUserName = commandArgs[ 1 ];

            const strUserPassword = commandArgs[ 2 ];

            strReplyMessage = TelegramBot.validateUserAndPassword( strUserName,
                                                                    strUserPassword,
                                                                    logger );

            if ( strReplyMessage ) {

              bArgumentError = true;

            }

            const strStageToDeploy = commandArgs[ 3 ]; //Stage. test01, prod01

            const targetStageList = TelegramBot.botConfig.deploy ? Object.keys( TelegramBot.botConfig.deploy ): [];

            if ( targetStageList.includes( strStageToDeploy ) === false ) {

              strReplyMessage = "Invalid stage name.\nValid stage names are:\n" + targetStageList.join( "\n" );

              bArgumentError = true;

            }

            const strProjectNameToDeploy = commandArgs[ 4 ]; //Project name to deploy

            if ( TelegramBot.botConfig.deploy[ strStageToDeploy ].includes( strProjectNameToDeploy ) ) {

              strReplyMessage = "Invalid project name.\nValid project names are:\n" + TelegramBot.botConfig.target.deploy.name.join( "\n" );
              bArgumentError = true;

            }

            if ( bArgumentError === false ) {

              const command = TelegramBot.botConfig.command;

              const strShellCommandToExecute = command[ commandArgs[ 0 ] + "_" + commandArgs[ 1 ] + "_" + commandArgs[ 2 ] ].command + " " + strStageToDeploy + " " + strProjectNameToDeploy;
              let strShellOutDir = command[ commandArgs[ 0 ] + "_" + commandArgs[ 1 ] + "_" + commandArgs[ 2 ] ].out_dir + strUserName + "/";

              if ( strShellCommandToExecute ) {

                const strCommandId = SystemUtilities.hashString( SystemUtilities.getUUIDv4(), 1, logger );

                TelegramBot.handleRunDeployCommand( context,
                                                    strCommandId,
                                                    strShellOutDir,
                                                    strShellCommandToExecute,
                                                    "/deploy",
                                                    logger );

                strReplyMessage = "Command running in background with id: " + strCommandId + ".\nTo get the current command status use:\n/status " + strUserName + " " + strUserPassword + " " + strCommandId;

              }
              else {

                strReplyMessage = "No shell command found.";

              }

            }

          }
          else {

            strReplyMessage = "/deploy command arguments are:\n/deploy <user_name> <user_password> <stage> <project_name>";

          }

        }
        else if ( context.message.from.is_bot ) {

          strReplyMessage = "Bot not allowed to run commands";

        }
        else {

          strReplyMessage = "Command " + TelegramBot.strCommandRunning + " is running right now. Only one command at time is allowed.";

        }

      }
      else {

        strReplyMessage = "Command is old to 1 minute. Ignoring";

      }

      if ( strReplyMessage ) {

        context.reply( strReplyMessage );
        debugMark( strReplyMessage );

      }

    }
    catch ( error ) {

      //Remove the command from running
      TelegramBot.strCommandRunning = "";

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.handleDeployCommand.name;

      const strMark = "3C6D9149D270" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

    }

  }

}
