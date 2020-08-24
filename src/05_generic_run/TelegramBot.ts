import appRoot from 'app-root-path';
require( 'dotenv' ).config( { path: appRoot.path + "/.env.secrets" } );

import moment from "moment-timezone";

import shell from "shelljs";

import fs from "fs"; //Load the filesystem module
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

  static commandResult = new Map<string,string>();

  static validUserName = [ "dev001", "dev007", "dev748" ];
  static validUserPassword = [ "me.123.", "super.123.", "develop.123." ];

  static validCommandBackupTarget = [ "dropbox" ];
  static validCommandBackupDatabase = [ "odin-v1-legacy-kk-fl-miami", "BinaryManagerDB-odin-v1-legacy-kk-fl-miami", "test" ];

  static validCommandTargetDropboxFolder = [ "ZZZ_odin-v1-legacy-kk-fl-miami-backup", "ZZZ_odin-v1-legacy-kk-fl-miami-BinaryManagerDB-backup" ];

  static currentInstance = null;

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

        //await TelegramBot.handleDeployCommand( ctx, logger );

      } );

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

  static parseRCloneOutput( strOutput: string, bLookForError: boolean ): string {

    let strResult = "";

    const lines = strOutput.split( "\n" );

    for ( let intLine = 0; intLine < lines.length; intLine++ ) {

      const strLine = lines[ intLine ];

      if ( bLookForError ) {

        if ( strLine.includes( "Failed to copy:" ) ) {

          strResult = "Error: Failed to copy:" + strLine.split( "Failed to copy:" )[ 1 ];
          break;

        }
        else if ( strLine.includes( ": not found" ) ) {

          strResult = "Error: Not found";
          break;

        }

      }
      else if ( strLine.includes( "backup:" ) ) {

        strResult = "backup:" + strLine.split( "backup:" )[ 1 ];
        break;

      }
      else {

        strResult = "backup:Unknown file";
        break;

      }

    }

    return strResult;

  }

  static async handleRunBackupCommand( strCommandId: string,
                                       strShellOutDir: string,
                                       strShellCommandToExecute: string,
                                       strCommand: string,
                                       logger: any ) {

    let strResult = "";

    try {

      TelegramBot.commandResult.set( strCommandId, "Working..." );

      TelegramBot.strCommandRunning = strCommand;

      let debugMark = debug.extend( "89852EE05993" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      strShellOutDir = strShellOutDir + "/" + SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_08 );

      shell.mkdir( "-p", strShellOutDir );

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

        /*
        if ( intCode === 0 ) {

          debugMark( "Sucess to run command." );

        }
        else {

          debugMark( "Failed to run command." );

        }
        */

      });

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

      //Remove the command from running
      TelegramBot.strCommandRunning = "";
      /*
      TelegramBot.strCommandRunning = TelegramBot.removeCommand( TelegramBot.strCommandRunning,
                                                                 strCommand,
                                                                 logger );
                                                              */

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

      TelegramBot.commandResult[ strCommandId ] = "ERROR: " + error.message;

    }

    return strResult;

  }

  static async handleStatusCommand( context: any, logger: any ) {

    try {

      let debugMark = debug.extend( "EE0BDA76216E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      const dateTimeFromCommand = moment.unix( context.message.date ).tz( CommonUtilities.getCurrentTimeZoneId() )

      debugMark( "From id: ", context.message.from.id );
      debugMark( "From id: ", context.message.from.id );
      debugMark( "From name: ", context.message.from.first_name );

      debugMark( "Command date time: ", dateTimeFromCommand.format() );
      debugMark( "Command: ", context.message.text );

      let strRepplyMessage = "";

      const currentDateTime = SystemUtilities.getCurrentDateAndTimeFromAndDecMinutes( SystemUtilities.getCurrentDateAndTime(), 1 );

      if ( SystemUtilities.isDateAndTimeBeforeAt( currentDateTime.format(), dateTimeFromCommand.format() ) ) {

        if ( context.message.from.is_bot === false ) {

          const commandArgs = context.message.text.split( " " );

          if ( commandArgs.length === 4 ) {

            let bArgumentError = false;

            const strUserName = commandArgs[ 1 ];

            if ( this.validUserName.includes( strUserName ) === false ) {

              strRepplyMessage = "Invalid user name";
              bArgumentError = true;

            }

            const strUserPassword = commandArgs[ 2 ];

            if ( this.validUserPassword.includes( strUserPassword ) === false ) {

              strRepplyMessage = "Invalid user password";
              bArgumentError = true;

            }

            const strCommandId = commandArgs[ 3 ];

            if ( TelegramBot.commandResult.has( strCommandId ) === false ) {

              strRepplyMessage = "Command id " + strCommandId + " not found";
              bArgumentError = true;

            }

            if ( bArgumentError === false ) {

              strRepplyMessage = TelegramBot.commandResult.get( strCommandId );

            }

          }
          else {

            strRepplyMessage = "status command arguments are: /status <user_name> <user_password> <command_id>";

          }

        }
        else {

          strRepplyMessage = "Bot not allowed to run commands";

        }

      }
      else {

        strRepplyMessage = "Command is old to 1 minute. Ignoring";

      }

      if ( strRepplyMessage ) {

        context.reply( strRepplyMessage );
        debugMark( strRepplyMessage );

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
      debugMark( "From id: ", context.message.from.id );
      debugMark( "From name: ", context.message.from.first_name );

      debugMark( "Command date time: ", dateTimeFromCommand.format() );
      debugMark( "Command: ", context.message.text );

      let strRepplyMessage = "";

      const currentDateTime = SystemUtilities.getCurrentDateAndTimeFromAndDecMinutes( SystemUtilities.getCurrentDateAndTime(), 1 );

      if ( SystemUtilities.isDateAndTimeBeforeAt( currentDateTime.format(), dateTimeFromCommand.format() ) ) {

        if ( !TelegramBot.strCommandRunning &&
            context.message.from.is_bot === false ) {

          const commandArgs = context.message.text.split( " " );

          if ( commandArgs.length === 5 ) {

            let bArgumentError = false;

            const strUserName = commandArgs[ 1 ];

            if ( this.validUserName.includes( strUserName ) === false ) {

              strRepplyMessage = "Invalid user name";
              bArgumentError = true;

            }

            const strUserPassword = commandArgs[ 2 ];

            if ( this.validUserPassword.includes( strUserPassword ) === false ) {

              strRepplyMessage = "Invalid user password";
              bArgumentError = true;

            }

            const strTarget = commandArgs[ 3 ];

            if ( this.validCommandBackupTarget.includes( strTarget ) === false ) {

              strRepplyMessage = "Invalid backup target name, valid target names are: " + this.validCommandBackupTarget.join( "," );

              bArgumentError = true;

            }

            const strDatabase = commandArgs[ 4 ];

            if ( this.validCommandBackupDatabase.includes( strDatabase ) === false ) {

              strRepplyMessage = "Invalid backup database name, valid database names are: " + this.validCommandBackupDatabase.join( "," );
              bArgumentError = true;

            }

            if ( bArgumentError === false ) {

              const command = require( appRoot.path + "/command.json" );

              const strShellCommandToExecute = command[ commandArgs[ 0 ] + "_" + commandArgs[ 3 ] + "_" + commandArgs[ 4 ] ].command;
              let strShellOutDir = command[ commandArgs[ 0 ] + "_" + commandArgs[ 3 ] + "_" + commandArgs[ 4 ] ].out_dir;

              if ( strShellCommandToExecute ) {

                const strCommandId = SystemUtilities.hashString( SystemUtilities.getUUIDv4(), 1, logger );

                TelegramBot.handleRunBackupCommand( strCommandId,
                                                    strShellOutDir,
                                                    strShellCommandToExecute,
                                                    "/backup",
                                                    logger );

                strRepplyMessage = "Command running in background with id: " + strCommandId + ". To get the current command status use /status " + strUserName + " " + strUserPassword + " " + strCommandId;

                /*
                strShellOutDir = strShellOutDir + "/" + SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_08 );

                shell.mkdir( "-p", strShellOutDir );

                const shellCommandToExecute = shell.exec( strShellCommandToExecute );

                fs.writeFileSync( strShellOutDir + "/code.txt", "" + shellCommandToExecute.code );
                fs.writeFileSync( strShellOutDir + "/stdout.txt", shellCommandToExecute.stdout );
                fs.writeFileSync( strShellOutDir + "/stderr.txt", shellCommandToExecute.stderr );

                if ( shellCommandToExecute.code === 0 ) {

                  strRepplyMessage = "Sucess make backup.";

                }
                else {

                  strRepplyMessage = "Failed make backup.";

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

                strRepplyMessage = "No shell command found.";

              }


            }

          }
          else {

            strRepplyMessage = "backup command arguments are: /backup <user_name> <user_password> <target> <database>";

          }

        }
        else if ( context.message.from.is_bot ) {

          strRepplyMessage = "Bot not allowed to run commands";

        }
        else {

          strRepplyMessage = "Command " + TelegramBot.strCommandRunning + " already running";

        }

      }
      else {

        strRepplyMessage = "Command is old to 1 minute. Ignoring";

      }

      if ( strRepplyMessage ) {

        context.reply( strRepplyMessage );
        debugMark( strRepplyMessage );

      }

    }
    catch ( error ) {

      //Remove the command from running
      TelegramBot.strCommandRunning = "";
      /*
      TelegramBot.strCommandRunning = TelegramBot.removeCommand( TelegramBot.strCommandRunning,
                                                                 "/backup",
                                                                logger );
                                                              */

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

    }

  }

  static async handleRunUploadCommand( strCommandId: string,
                                       strShellOutDir: string,
                                       strShellCommandToExecute: string,
                                       strCommand: string,
                                       logger: any ) {

    let strResult = "";

    try {

      TelegramBot.commandResult.set( strCommandId, "Working..." );

      TelegramBot.strCommandRunning = strCommand;

      let debugMark = debug.extend( "0AE6DA4D8A0C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      strShellOutDir = strShellOutDir + "/" + SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_08 );

      shell.mkdir( "-p", strShellOutDir );

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

        /*
        if ( intCode === 0 ) {

          debugMark( "Sucess to run command." );

        }
        else {

          debugMark( "Failed to run command." );

        }
        */

      });

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

      //Remove the command from running
      TelegramBot.strCommandRunning = "";
      /*
      TelegramBot.strCommandRunning = TelegramBot.removeCommand( TelegramBot.strCommandRunning,
                                                                 strCommand,
                                                                 logger );
                                                              */

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.handleRunUploadCommand.name;

      const strMark = "EC4646EF8690" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      TelegramBot.commandResult[ strCommandId ] = "ERROR: " + error.message;

    }

    return strResult;

  }

  static async handleUploadCommand( context: any, logger: any ) {

    try {

      let debugMark = debug.extend( "66E1A588E419" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      const dateTimeFromCommand = moment.unix( context.message.date ).tz( CommonUtilities.getCurrentTimeZoneId() )

      debugMark( "From id: ", context.message.from.id );
      debugMark( "From id: ", context.message.from.id );
      debugMark( "From name: ", context.message.from.first_name );

      debugMark( "Command date time: ", dateTimeFromCommand.format() );
      debugMark( "Command: ", context.message.text );

      let strRepplyMessage = "";

      const currentDateTime = SystemUtilities.getCurrentDateAndTimeFromAndDecMinutes( SystemUtilities.getCurrentDateAndTime(), 1 );

      if ( SystemUtilities.isDateAndTimeBeforeAt( currentDateTime.format(), dateTimeFromCommand.format() ) ) {

        if ( !TelegramBot.strCommandRunning &&
            context.message.from.is_bot === false ) {

          const commandArgs = context.message.text.split( " " );

          if ( commandArgs.length === 5 ) {

            let bArgumentError = false;

            const strUserName = commandArgs[ 1 ];

            if ( this.validUserName.includes( strUserName ) === false ) {

              strRepplyMessage = "Invalid user name";
              bArgumentError = true;

            }

            const strUserPassword = commandArgs[ 2 ];

            if ( this.validUserPassword.includes( strUserPassword ) === false ) {

              strRepplyMessage = "Invalid user password";
              bArgumentError = true;

            }

            const strTargetDropboxFolder = commandArgs[ 3 ];

            if ( this.validCommandTargetDropboxFolder.includes( strTargetDropboxFolder ) === false ) {

              strRepplyMessage = "Invalid dropbox folder name, valid dropbox folder names are: " + this.validCommandTargetDropboxFolder.join( "," );

              bArgumentError = true;

            }

            const strFileToupload = commandArgs[ 4 ];

            if ( !strFileToupload ) {

              strRepplyMessage = "Invalid file name, cannot be empty.";
              bArgumentError = true;

            }

            if ( bArgumentError === false ) {

              const command = require( appRoot.path + "/command.json" );

              const strShellCommandToExecute = command[ commandArgs[ 0 ] ].command + " " + strTargetDropboxFolder + " " + strFileToupload;
              let strShellOutDir = command[ commandArgs[ 0 ] ].out_dir;

              if ( strShellCommandToExecute ) {

                const strCommandId = SystemUtilities.hashString( SystemUtilities.getUUIDv4(), 1, logger );

                TelegramBot.handleRunUploadCommand( strCommandId,
                                                    strShellOutDir,
                                                    strShellCommandToExecute,
                                                    "/upload",
                                                    logger );

                strRepplyMessage = "Command running in background with id: " + strCommandId + ". To get the current command status use /status " + strUserName + " " + strUserPassword + " " + strCommandId;

              }
              else {

                strRepplyMessage = "No shell command found.";

              }

            }

          }
          else {

            strRepplyMessage = "backup command arguments are: /upload <user_name> <user_password> <remote_folder> <file>";

          }

        }
        else if ( context.message.from.is_bot ) {

          strRepplyMessage = "Bot not allowed to run commands";

        }
        else {

          strRepplyMessage = "Command " + TelegramBot.strCommandRunning + " already running";

        }

      }
      else {

        strRepplyMessage = "Command is old to 1 minute. Ignoring";

      }

      if ( strRepplyMessage ) {

        context.reply( strRepplyMessage );
        debugMark( strRepplyMessage );

      }

    }
    catch ( error ) {

      //Remove the command from running
      TelegramBot.strCommandRunning = "";
      /*
      TelegramBot.strCommandRunning = TelegramBot.removeCommand( TelegramBot.strCommandRunning,
                                                                 "/backup",
                                                                logger );
                                                              */

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

}
