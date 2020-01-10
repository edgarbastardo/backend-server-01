require( 'dotenv' ).config(); //Read the .env file, in the root folder of project

//import path from 'path';
import appRoot from 'app-root-path';
import rimraf from 'rimraf';
import fs from 'fs'; //Load the filesystem module

import copy from 'recursive-copy';
//import targz from 'targz';
//import zip from 'cross-zip';

import os from 'os'; //.homedir();

import inquirer from 'inquirer';

//const Client = require('ssh2').Client;
import SSH2Promise = require( 'ssh2-promise' );
import SFTP2Promise = require( 'ssh2-sftp-client' );

const SSHClient = require( 'ssh2' ).Client;

import SystemUtilities from "./02_system/common/SystemUtilities";

//import DeployTarget from "./deploy_target.json";

import CommonUtilities from './02_system/common/CommonUtilities';
import CommonConstants from './02_system/common/CommonConstants';

const debug = require( 'debug' )( 'copy_install_backend' );

/*
#!/bin/sh

currentDate=$(date '+%Y-%m-%d-%H-%M-%S')

password=zamban0funci0na

webapp_package_name=backend-it4systems-zappy_kk-dev007-main.war

remote_dir_path=java/deploy/zappy-kk-sales

copy_target=linuxserveradmin@rems02.it4systems.info:/home/linuxserveradmin/$remote_dir_path/backend/$currentDate/

sshpass -p $password ssh linuxserveradmin@rems02.it4systems.info "mkdir -p ./$remote_dir_path/backend/$currentDate"

sshpass -p $password scp target/$webapp_package_name $copy_target

sshpass -p $password ssh linuxserveradmin@rems02.it4systems.info "echo "$password" | sudo -S ./$remote_dir_path/install.backend.sh "$currentDate

##remote_command='echo zamban0funci0na | sudo -S ./java/deploy/sms-gateway/test.sh '
##$currentDate

##echo $remote_command

##sshpass -p $password ssh linuxserveradmin@rems02.it4systems.info "echo "$password" | sudo -S ./java/deploy/sms-gateway/test.sh "$currentDate
*/

//const _USER_NAME =  DeployTarget[ process.env.DEPLOY_TARGET ].user;
//const _PROJECT_NAME =  DeployTarget[ process.env.DEPLOY_TARGET ].project; //"binary-manager";

let strCurrentDate = SystemUtilities.getCurrentDateAndTime().format( "YYYY-MM-DDTHH-mm-ss#TT#Z" );
strCurrentDate = strCurrentDate.replace( ":", "-" );
strCurrentDate = strCurrentDate.replace( "#TT#", "Z" );

async function createInstallBundle( strProject: string ): Promise<{ path: string, name: string }> {

  let result = { path: null, name: null };

  try {

    let installDistributionRelativePath = `/install_distribution/${strProject}-${strCurrentDate}`;

    fs.mkdirSync( appRoot.path + installDistributionRelativePath, { recursive: true } );

    //await copy( appRoot.path + '/node_modules/', appRoot.path + installDistributionRelativePath + "/node_modules/" );
    await copy( appRoot.path + '/build/', appRoot.path + installDistributionRelativePath + "/build/" );
    await copy( appRoot.path + '/binary_data/@default@/', appRoot.path + installDistributionRelativePath + "/binary_data/@default@/" );

    fs.copyFileSync( appRoot.path + "/.env", appRoot.path + installDistributionRelativePath + "/.env" );
    fs.copyFileSync( appRoot.path + "/.env.log", appRoot.path + installDistributionRelativePath + "/.env.log" );
    fs.copyFileSync( appRoot.path + "/db_config.json", appRoot.path + installDistributionRelativePath + "/db_config.json" );
    fs.copyFileSync( appRoot.path + "/package.json", appRoot.path + installDistributionRelativePath + "/package.json" );
    fs.copyFileSync( appRoot.path + "/README.md", appRoot.path + installDistributionRelativePath + "/README.md" );

    //fs.unlinkSync( appRoot.path + installDistributionRelativePath + "/build/deploy_target.json" );
    //fs.unlinkSync( appRoot.path + installDistributionRelativePath + "/build/deploy_target_template.json" );
    fs.unlinkSync( appRoot.path + installDistributionRelativePath + "/build/copy_install_backend.js" );
    fs.unlinkSync( appRoot.path + installDistributionRelativePath + "/build/copy_install_backend.js.map" );

    /*
    await new Promise<any>( function( resolve, reject ) {

      targz.compress({
        src: appRoot.path + `/install_distribution/${_PROJECT_NAME}-${strCurrentDate}`,
        dest: appRoot.path + `/install_distribution/${_PROJECT_NAME}-${strCurrentDate}.tar.gz`,
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

          rimraf.sync( appRoot.path + `/install_distribution/${_PROJECT_NAME}-${strCurrentDate}` );

          let debugMark = debug.extend( '6572E49553C8' );
          debugMark( "Install bundle created!" );

          resolve( result );

        }

      });

    });
    // compress files into tar.gz archive
    */

    /*
    zip.zipSync( appRoot.path + `/install_distribution/${strProject}-${strCurrentDate}`,
                 appRoot.path + `/install_distribution/${strProject}-${strCurrentDate}.zip` );
                 */

    const strFileName = `${strProject}-${strCurrentDate}`;

    /*
    const outputStream = fs.createWriteStream( appRoot.path + `/install_distribution/${strFileName}.zip` );

    const archive = archiver( 'zip' );

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    outputStream.on('close', function() {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    outputStream.on('end', function() {
      console.log('Data has been drained');
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
      throw err;
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        // log warning
      } else {
        // throw error
        throw err;
      }
    });

    archive.pipe( outputStream );

    archive.directory( appRoot.path + `/install_distribution/${strFileName}`,
                       `${strFileName}` );

    await archive.finalize();

    outputStream.close();
    */

    if ( await SystemUtilities.zipDirectory( appRoot.path + `/install_distribution/${strFileName}`,
                                             appRoot.path + `/install_distribution/${strFileName}.zip`,
                                             null ) ) {

      result.path = appRoot.path + `/install_distribution/`;
      result.name = `${strFileName}.zip`;

      rimraf.sync( appRoot.path + `/install_distribution/${strFileName}` );

      //process.exit( 0 );

    }

  }
  catch ( error ) {

    console.error( error );

  }

 return result;

}

async function copyInstallBundleToRemoteServer( strProtocol: string,
                                                strHost: string,
                                                intPort: number = 22,
                                                strUser: string,
                                                strPassword: string,
                                                strProject: string,
                                                strInstallBundlePath: string,
                                                strInstallBundleName: string ): Promise<boolean> {

  let bResult = false;

  let sshConnection = null;

  let sftpConnection = null;

  try {

    const strRemoteDirPath = `nodejs/deploy/${strProject}`;

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

    const strCommandResult = await sshConnection.exec( `mkdir -p ./${strRemoteDirPath}/backend/${strCurrentDate}` );

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
                                `./${strRemoteDirPath}/backend/${strCurrentDate}/` + strInstallBundleName );

      bResult = true;

      //await sftpConnection.end();

    }

    //await sshConnection.close();

  }
  catch ( error ) {

    const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

    sourcePosition.method = "server." + main.name;

    const strMark = "78B85E29B6FA";

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

    const strMark = "1B29091E23A6";

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

    sourcePosition.method = "server." + main.name;

    const strMark = "BD51738C27B1";

    const debugMark = debug.extend( strMark );

    debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
    debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
    debugMark( "Catched on: %O", sourcePosition );
    debugMark( "Error: %O", error );

  }

  return bResult;

}

async function executeInstallScriptInRemoteServer( strProtocol: string,
                                                   strHost: string,
                                                   intPort: number = 22,
                                                   strUser: string,
                                                   strPassword: string,
                                                   strSUDOPassword: string,
                                                   strProject: string ): Promise<boolean> {

  let bResult = await new Promise<boolean>( function( resolve, reject ) {

    let debugMark = debug.extend( '0D9333291CCF' );

    const sshConnection = new SSHClient();

    sshConnection.on( "ready", function() {

      debugMark( "SSH_CLIENT:ready" );

      const strRemoteDirPath = `nodejs/deploy/${strProject}`;

      const strCommand = `sudo "/home/${strUser}/${strRemoteDirPath}/install.backend.sh" "${strCurrentDate}"`;

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

              stream.write( strSUDOPassword + '\n' );

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
async function executeInstallScriptInRemoteServer( strProtocol: string,
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

    let debugMark = debug.extend( '1DEF610F7B90' );

    sshConnection.spawn( strCommand ).then( ( socket: any ) => {

      socket.on( 'data', ( data: any ) => {

        if ( data.indexOf( ':' ) >= data.length - 2 ) {

          socket.write( strPassword + '\n' );

        }
        else {

          debugMark( 'STDOUT: %s', data );

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

    const strMark = "A7CB1D8AF61C";

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

    const strMark = "4BC174FB12FA";

    const debugMark = debug.extend( strMark );

    debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
    debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
    debugMark( "Catched on: %O", sourcePosition );
    debugMark( "Error: %O", error );

  }

  return bResult;

}
*/

async function askForPassword( strUser: string ): Promise<string> {

  let strResult = "";

  /*
  const readline = require('readline');

  const rl = readline.createInterface( {
                                         input: process.stdin,
                                         output: process.stdout
                                       });

  console.log( "Press enty with empty password to cancel the deploy process." );
  rl.question( 'Please introduce the password? ', ( strPassword: string ) => {

    //console.log( `Thank you for your valuable feedback: ${strPassword}` );
    strResult = strPassword;

    rl.close();

  });

  return strResult;
  */
  const results = await inquirer.prompt(
                                         [
                                           {
                                             type: 'password',
                                             name: 'password',
                                             message: `Press enter with empty password to cancel the deploy process.\nWhat is the password for the user [${strUser}]?`,
                                             mask: '*',
                                             default: '',
                                             //validate: (value = '') => 'Pass a valid hex value'
                                           },
                                         ]
                                       );

  if ( results.password ) {

    strResult = results.password;

  }

  return strResult;

}

async function main() {

  try {

    const strConfigFile = os.homedir() + "/copy_install_backend/.deploy.json"; //appRoot.path + "/.copy_install_backend_config.json";

    fs.readFileSync( strConfigFile );

    const deployTarget = require( strConfigFile );

    const target = deployTarget[ process.env.APP_NAME ][ process.env.DEPLOY_TARGET ];

    const resultData = await createInstallBundle( process.env.APP_NAME );

    if ( resultData ) {

      if ( target.password === "!" ) {

        target.password = await askForPassword( target.user );

      }

      if ( target.password ) {

        process.exit( 0 );

        let bResult = await copyInstallBundleToRemoteServer( target.protocol,
                                                             target.host,
                                                             target.port,
                                                             target.user,
                                                             target.password,
                                                             process.env.APP_NAME,
                                                             resultData.path,
                                                             resultData.name );

        if ( bResult ) {

          //Execute remote install script
          bResult = await executeInstallScriptInRemoteServer( target.protocol,
                                                              target.host,
                                                              target.port,
                                                              target.user,
                                                              target.password,
                                                              target.password,
                                                              process.env.APP_NAME );

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
  catch ( error ) {

    const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

    sourcePosition.method = "server." + main.name;

    const strMark = "AFD51D995A67";

    const debugMark = debug.extend( strMark );

    debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
    debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
    debugMark( "Catched on: %O", sourcePosition );
    debugMark( "Error: %O", error );

  }

}

main();