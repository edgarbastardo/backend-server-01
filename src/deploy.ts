require( "dotenv" ).config(); //Read the .env file, in the root folder of project

//import path from "path";
import fs from "fs"; //Load the filesystem module
import cluster from "cluster";
import os from "os"; //.homedir();

import appRoot from "app-root-path";
import rimraf from "rimraf";
import copy from "recursive-copy";
//import targz from "targz";
//import zip from "cross-zip";

import inquirer from "inquirer";

//const Client = require("ssh2").Client;
import SSH2Promise = require( "ssh2-promise" );
import SFTP2Promise = require( "ssh2-sftp-client" );

const SSHClient = require( "ssh2" ).Client;

import CommonConstants from "./02_system/common/CommonConstants";

import SystemUtilities from "./02_system/common/SystemUtilities";
import CommonUtilities from "./02_system/common/CommonUtilities";

const debug = require( "debug" )( "deploy@main_process" );

//const _USER_NAME =  DeployTarget[ process.env.DEPLOY_TARGET ].user;
//const _PROJECT_NAME =  DeployTarget[ process.env.DEPLOY_TARGET ].project; //"binary-manager";

export default class App {

  static strCurrentDate = "";

  static async updateInfoFile( strFileInfoPath: string ): Promise<boolean> {

    let bResult = false;

    try {

      let info = null;

      if ( fs.existsSync( strFileInfoPath ) ) {

        info = require( strFileInfoPath );

      }
      else {

        info = { release: "" };

      }

      info.release = SystemUtilities.getCurrentDateAndTime().format();

      const strJSONInfoData = JSON.stringify( info, null, 2 );

      fs.writeFileSync( strFileInfoPath, strJSONInfoData );

      bResult = true;

    }
    catch ( error ) {


    }

    return bResult;

  }

  static async createInstallBundle( strProject: string ): Promise<{ path: string, name: string }> {

    let result = { path: null, name: null };

    try {

      let installDistributionRelativePath = `/deploy/${strProject}-${App.strCurrentDate}`;

      fs.mkdirSync( appRoot.path + installDistributionRelativePath, { recursive: true } );

      //await copy( appRoot.path + "/node_modules/", appRoot.path + installDistributionRelativePath + "/node_modules/" );
      await copy( appRoot.path + "/build/", appRoot.path + installDistributionRelativePath + "/build/" );
      await copy( appRoot.path + "/binary_data/@default@/", appRoot.path + installDistributionRelativePath + "/binary_data/@default@/" );

      fs.copyFileSync( appRoot.path + "/.env.bootstrap", appRoot.path + installDistributionRelativePath + "/.env.bootstrap" );
      fs.copyFileSync( appRoot.path + "/.env", appRoot.path + installDistributionRelativePath + "/.env" );
      fs.copyFileSync( appRoot.path + "/.env.container", appRoot.path + installDistributionRelativePath + "/.env.container" );
      fs.copyFileSync( appRoot.path + "/.env.log.template", appRoot.path + installDistributionRelativePath + "/.env.log.template" );
      fs.copyFileSync( appRoot.path + "/.env.secrets.template", appRoot.path + installDistributionRelativePath + "/.env.secrets.template" );
      fs.copyFileSync( appRoot.path + "/db_config.json", appRoot.path + installDistributionRelativePath + "/db_config.json" );
      fs.copyFileSync( appRoot.path + "/package.json", appRoot.path + installDistributionRelativePath + "/package.json" );
      fs.copyFileSync( appRoot.path + "/README.md", appRoot.path + installDistributionRelativePath + "/README.md" );
      fs.copyFileSync( appRoot.path + "/info.json", appRoot.path + installDistributionRelativePath + "/info.json" );

      await App.updateInfoFile( appRoot.path + installDistributionRelativePath + "/info.json" );

      //fs.unlinkSync( appRoot.path + installDistributionRelativePath + "/build/deploy_target.json" );
      //fs.unlinkSync( appRoot.path + installDistributionRelativePath + "/build/deploy_target_template.json" );
      fs.unlinkSync( appRoot.path + installDistributionRelativePath + "/build/deploy.js" );
      fs.unlinkSync( appRoot.path + installDistributionRelativePath + "/build/deploy.js.map" );

      /*
      await new Promise<any>( function( resolve, reject ) {

        targz.compress({
          src: appRoot.path + `/deploy/${_PROJECT_NAME}-${strCurrentDate}`,
          dest: appRoot.path + `/deploy/${_PROJECT_NAME}-${strCurrentDate}.tar.gz`,
          gz: {
            level: 9,
            memLevel: 6,
          }
        },
        function( error: any ) {

          if ( error ) {

            console.error( error );
            reject( error );

          }
          else {

            rimraf.sync( appRoot.path + `/deploy/${_PROJECT_NAME}-${strCurrentDate}` );

            let debugMark = debug.extend( "6572E49553C8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );
            debugMark( "Install bundle created!" );

            resolve( result );

          }

        });

      });
      // compress files into tar.gz archive
      */

      /*
      zip.zipSync( appRoot.path + `/deploy/${strProject}-${strCurrentDate}`,
                  appRoot.path + `/deploy/${strProject}-${strCurrentDate}.zip` );
                  */

      const strFileName = `${strProject}-${App.strCurrentDate}`;

      /*
      const outputStream = fs.createWriteStream( appRoot.path + `/deploy/${strFileName}.zip` );

      const archive = archiver( "zip" );

      // listen for all archive data to be written
      // "close" event is fired only when a file descriptor is involved
      outputStream.on("close", function() {
        console.log(archive.pointer() + " total bytes");
        console.log("archiver has been finalized and the output file descriptor has closed.");
      });

      // This event is fired when the data source is drained no matter what was the data source.
      // It is not part of this library but rather from the NodeJS Stream API.
      // @see: https://nodejs.org/api/stream.html#stream_event_end
      outputStream.on("end", function() {
        console.log("Data has been drained");
      });

      // good practice to catch this error explicitly
      archive.on("error", function(err) {
        throw err;
      });

      // good practice to catch warnings (ie stat failures and other non-blocking errors)
      archive.on("warning", function(err) {
        if (err.code === "ENOENT") {
          // log warning
        } else {
          // throw error
          throw err;
        }
      });

      archive.pipe( outputStream );

      archive.directory( appRoot.path + `/deploy/${strFileName}`,
                        `${strFileName}` );

      await archive.finalize();

      outputStream.close();
      */

      if ( await SystemUtilities.zipDirectory( appRoot.path + `/deploy/${strFileName}`,
                                              appRoot.path + `/deploy/${strFileName}.zip`,
                                              null ) ) {

        result.path = appRoot.path + `/deploy/`;
        result.name = `${strFileName}.zip`;

        rimraf.sync( appRoot.path + `/deploy/${strFileName}` );

        //process.exit( 0 );

      }

    }
    catch ( error ) {

      console.error( error );

    }

  return result;

  }

  static async copyInstallBundleToRemoteServer( strProtocol: string,
                                                strHost: string,
                                                intPort: number = 22,
                                                strUser: string,
                                                strPassword: string,
                                                strProject: string,
                                                strContextPath: string,
                                                strInstallBundlePath: string,
                                                strInstallBundleName: string ): Promise<boolean> {

    let bResult = false;

    let sshConnection = null;

    let sftpConnection = null;

    try {

      const strRemoteDirPath = `nodejs/deploy/${strProject}/${strContextPath}`;

      sshConnection = new SSH2Promise(
                                       {
                                         host: strHost,
                                         port: intPort,
                                         username: strUser,
                                         password: strPassword
                                       }
                                     );

      await sshConnection.connect();

      //const strHomePath = await sshConnection.exec( `pwd` );

      const strCommandResult = await sshConnection.exec( `mkdir -p ./${strRemoteDirPath}/${App.strCurrentDate}` );

      if ( !strCommandResult ) {

        sftpConnection = new SFTP2Promise();

        await sftpConnection.connect(
                                      {
                                        host: strHost,
                                        port: intPort,
                                        username: strUser,
                                        password: strPassword
                                      }
                                    );

        await sftpConnection.put( strInstallBundlePath + strInstallBundleName,
                                  `./${strRemoteDirPath}/${App.strCurrentDate}/${strInstallBundleName}` );

        bResult = true;

        //await sftpConnection.end();

      }

      //await sshConnection.close();

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = "server." + App.copyInstallBundleToRemoteServer.name;

      const strMark = "78B85E29B6FA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );
      debugMark( "Error: %O", error );

    }

    try {

      if ( sshConnection !== null ) {

        await sshConnection.close();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = "server." + App.copyInstallBundleToRemoteServer.name;

      const strMark = "1B29091E23A6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );
      debugMark( "Error: %O", error );

    }

    try {

      if ( sftpConnection !== null ) {

        await sftpConnection.end();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = "server." + App.copyInstallBundleToRemoteServer.name;

      const strMark = "BD51738C27B1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );
      debugMark( "Error: %O", error );

    }

    return bResult;

  }

  static async executeInstallScriptInRemoteServer( strProtocol: string,
                                                   strHost: string,
                                                   intPort: number = 22,
                                                   strUser: string,
                                                   strPassword: string,
                                                   strSUDOPassword: string,
                                                   strRemoteScript: string,
                                                   strProject: string ): Promise<boolean> {

    let bResult = await new Promise<boolean>( function( resolve, reject ) {

      let debugMark = debug.extend( "0D9333291CCF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      const sshConnection = new SSHClient();

      sshConnection.on( "ready", function() {

        debugMark( "SSH_CLIENT:ready" );

        const strRemoteDirPath = `nodejs/deploy/${strProject}`;

        const strCommand = `sudo "/home/${strUser}/${strRemoteDirPath}/${strRemoteScript}" "${App.strCurrentDate}"`;

        sshConnection.exec( strCommand, { pty: true }, function( err: any, stream: any ) {

          if ( err ) {

            resolve( false ); //throw err;

          }
          else {

            stream.on( "close", function( code: any, signal: any ) {

              debugMark( "SSH_CLIENT:STREAM:close code: %d, signal: %d", code, signal );

              sshConnection.end();

              resolve( code === 0 );

            }).on( "data", function( data: any ) {

              if ( data.indexOf( ":" ) >= data.length - 2 ) {

                stream.write( strSUDOPassword + "\n" );

              }
              else {

                debugMark( "SSH_CLIENT:STDOUT: %s", data );

              }

            }).stderr.on( "data", function( data: any ) {

              debugMark( "SSH_CLIENT:STDERR: %s", data );

              reject( false );

            });

          }

        });

      }).connect({
          host: strHost,
          port: intPort,
          username: strUser,
          password: strPassword,
      });

    });

    return bResult;

  }

  /*
  static async executeInstallScriptInRemoteServer( strProtocol: string,
                                                   strHost: string,
                                                   intPort: number = 22,
                                                   strUser: string,
                                                   strPassword: string ): Promise<boolean> {

    let bResult = false;

    let sshConnection = null;

    try {

      const strRemoteDirPath = `nodejs/deploy/${_PROJECT_NAME}`;

      sshConnection = new SSH2Promise(
                                      {
                                        host: strHost,
                                        port: intPort,
                                        username: strUser,
                                        password: strPassword
                                      }
                                    );

      await sshConnection.connect();

      //const strCommand = `echo "${strPassword}" | sudo -S /home/${_USER_NAME}/${strRemoteDirPath}/install.test.sh "${strCurrentDate}"`;
      //const strCommand = `echo "${strPassword}"`;
      //const strCommand = `echo -e "${strPassword}\n" | sudo -S "/home/${_USER_NAME}/${strRemoteDirPath}/install.test.sh" "${strCurrentDate}"`;
      const strCommand = `sudo "/home/${_USER_NAME}/${strRemoteDirPath}/install.test.sh" "${strCurrentDate}"`;

      //const strCommandResult = await sshConnection.exec( strCommand );

      let debugMark = debug.extend( "1DEF610F7B90" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      sshConnection.spawn( strCommand ).then( ( socket: any ) => {

        socket.on( "data", ( data: any ) => {

          if ( data.indexOf( ":" ) >= data.length - 2 ) {

            socket.write( strPassword + "\n" );

          }
          else {

            debugMark( "STDOUT: %s", data );

          }

          //file content will be available here

        })

      });

      / *
      if ( strCommandResult ) {

        bResult = true;

        debugMark( strCommandResult );

      }
      * /

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = "server." + main.name;

      const strMark = "A7CB1D8AF61C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );
      debugMark( "Error: %O", error );

    }

    try {

      if ( sshConnection !== null ) {

        await sshConnection.close();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = "server." + main.name;

      const strMark = "4BC174FB12FA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );
      debugMark( "Error: %O", error );

    }

    return bResult;

  }
  */

  static async askForPassword( strUser: string ): Promise<string> {

    let strResult = "";

    /*
    const readline = require("readline");

    const rl = readline.createInterface( {
                                          input: process.stdin,
                                          output: process.stdout
                                        });

    console.log( "Press enty with empty password to cancel the deploy process." );
    rl.question( "Please introduce the password? ", ( strPassword: string ) => {

      //console.log( `Thank you for your valuable feedback: ${strPassword}` );
      strResult = strPassword;

      rl.close();

    });

    return strResult;
    */
    const results = await inquirer.prompt(
                                           [
                                             {
                                               type: "password",
                                               name: "password",
                                               message: `Press enter with empty password to cancel the deploy process.\nWhat is the password for the user [${strUser}]?`,
                                               mask: "*",
                                               default: "",
                                               //validate: (value = "") => "Pass a valid hex value"
                                             },
                                           ]
                                         );

    if ( results.password ) {

      strResult = results.password;

    }

    return strResult;

  }

  static async main() {

    try {

      SystemUtilities.startRun = SystemUtilities.getCurrentDateAndTime();

      App.strCurrentDate = SystemUtilities.startRun.format( "YYYY-MM-DDTHH-mm-ss#TT#Z" ).replace( ":", "-" ).replace( "#TT#", "Z" );;

      let strConfigFile = os.homedir() + "/.deploy/nodejs/.deploy.json";

      if ( fs.existsSync( strConfigFile ) === false ) {

        strConfigFile = appRoot.path + "/.deploy.json";

      }

      if ( fs.existsSync( strConfigFile ) ) {

        const deployConfigFile = require( strConfigFile );

        if ( deployConfigFile && deployConfigFile[ process.env.APP_PROJECT_NAME ] ) {

          if ( deployConfigFile.deploy_target ) {

            console.log( "WARNING: Deploy target taked from file " + strConfigFile );
            console.log( "WARNING: Deploy target override from " + process.env.DEPLOY_TARGET + " to " + deployConfigFile.deploy_target );

            process.env.DEPLOY_TARGET = deployConfigFile.deploy_target;

          }

          if ( deployConfigFile[ process.env.DEPLOY_TARGET ] ) {

            const target = deployConfigFile[ process.env.APP_PROJECT_NAME ][ process.env.DEPLOY_TARGET ];

            const resultData = await App.createInstallBundle( process.env.APP_PROJECT_NAME );

            if ( resultData ) {

              if ( target.password === "!" ) {

                if ( !process.env.TARGET_PASSWORD ) {

                  target.password = await App.askForPassword( target.user );

                }
                else {

                  target.password = process.env.TARGET_PASSWORD;

                }

              }

              if ( target.password ) {

                //process.exit( 0 );

                let bResult = await App.copyInstallBundleToRemoteServer( target.protocol,
                                                                        target.host,
                                                                        target.port,
                                                                        target.user,
                                                                        target.password,
                                                                        process.env.APP_PROJECT_NAME,
                                                                        target.contextPath,
                                                                        resultData.path,
                                                                        resultData.name );

                if ( bResult ) {

                  //Execute remote install script
                  //bResult =
                  await App.executeInstallScriptInRemoteServer( target.protocol,
                                                                target.host,
                                                                target.port,
                                                                target.user,
                                                                target.password,
                                                                target.password,
                                                                target.remoteScript,
                                                                process.env.APP_PROJECT_NAME );

                                                                      /*
                  await testSUDOCommand( "scp",
                                        "192.168.2.207",
                                        22,
                                        "dsistemas",
                                        "dsistemas" );
                                        */

                }

              }
              else {

                console.log( "Empty password entered!. Deploy process canceled." );

              }

            }

          }
          else {

            console.log( "**** The deploy target " + process.env.DEPLOY_TARGET + " NOT found. In config file: .env ****" );

          }

        }
        else {

          console.log( "**** The project name " + process.env.PROJECT_NAME + " NOT found. In config file: " + strConfigFile + " ****" );

        }

      }
      else {

        console.log( "**** " + os.homedir() + "/deploy_nodejs/.deploy.json" + " file not found ****" );
        console.log( "**** " + appRoot.path + "/.deploy.json" + " file not found ****" );

        process.abort();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = App.name + "." + App.main.name;

      const strMark = "AFD51D995A67" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );
      debugMark( "Error: %O", error );

    }

  }

}

App.main();
