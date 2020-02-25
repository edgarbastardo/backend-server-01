require( 'dotenv' ).config(); //Read the .env file, in the root folder of project

import fs from 'fs'; //Load the filesystem module
import os from 'os'; //Load the os module

const assert = require('assert').strict;
//import cluster from "cluster";
import appRoot from 'app-root-path';

import fetch from 'node-fetch';

import logSymbols from 'log-symbols';
import chalk from 'chalk';

//import CommonConstants from "../../02_system/common/CommonConstants";

//import CommonUtilities from '../../02_system/common/CommonUtilities';
import SystemUtilities from "../../02_system/common/SystemUtilities";
import CommonConstants from '../../02_system/common/CommonConstants';
import { SYSPerson } from "../../02_system/common/database/models/SYSPerson";

const debug = require( 'debug' )( 'test01_test_api' );

const strUser_admin01_at_system_net = "admin01@system.net";
const strPassword_admin01_at_system_net = "admin1.123456.";

const strProtocol = "http://"
const strHost = "127.0.0.1";

let jsonAuthorization_admin01 = null;
let strAuthorization_admin01 = null;
let strShortToken_admin01 = null;

let intSequence = 0;

const headers_admin01_at_system_net = {
                                        "Authorization": "",
                                        "Content-Type": "application/json",
                                        "FrontendId": "ccc1",
                                        "TimeZoneId": "America/Los_Angeles",
                                        "Language": "en_US"
                                      }

//Test request failed
const userRequestFull = {
                          "Avatar": null,
                          "Id": null,
                          "Name": "",
                          "Password": "",
                          "Comment": null,
                          "Role": null,
                          "Tag": null,
                          "ExpireAt": null,
                          "Notify": "",
                          "DisabledBy": "0",
                          "sysUserGroup": {
                            "Create": false,
                            "Id": "",
                            "ShortId": "",
                            "Name": "",
                            "Role": "",
                            "Tag": "",
                          },
                          "sysPerson": {
                            "Id": null,
                            "Title": "Ms.",
                            "FirstName": "Loly Valentina",
                            "LastName": "Gómez Fermín",
                            "NickName": "loly",
                            "Abbreviation": "",
                            "Gender": 0,
                            "BirthDate": "1980-11-11",
                            "Address": "1625 s walnut street, wa 98233, suite 102",
                            "EMail": "sirlordt@gmail.com, sirlordr@gmail.com",
                            "Phone": "1-305-776-9594, 1-786-806-2108",
                            "ImageId": ""
                          },
                          "Business": {
                            "Role": "",
                            "Tag": ""
                          }
                        }

let user_at_test01_data = {};
let user_at_test02_data = {};

async function call_login( headers: any,
                           strUser: string,
                           strPassword: string ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const body = {
                   Username: strUser,
                   Password: strPassword
                 }

    const options = {
                      method: 'POST',
                      headers: headers,
                      body: JSON.stringify( body ),
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/security/authentication/login";

    const callResult = await fetch( strRequestPath,
                                    options );

    result.output = callResult ? {
                                   status: callResult.status,
                                   statusText: callResult.statusText,
                                   body: await callResult.json()
                                  }:
                                  {
                                   status: null,
                                   statusText: null,
                                   body: { Code: "" }
                                  };

     ( options as any ).body = body;

     result.input = options;

  }
  catch ( error ) {

    console.log( error );

  }

  return result;

}

async function call_logout( headers: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'POST',
                      headers: headers,
                      body: null, //JSON.stringify( body ),
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/security/authentication/logout";

    const callResult = await fetch( strRequestPath,
                                    options );

    result.output = callResult ? {
                                   status: callResult.status,
                                   statusText: callResult.statusText,
                                   body: await callResult.json()
                                  }:
                                  {
                                   status: null,
                                   statusText: null,
                                   body: { Code: "" }
                                  };

     result.input = options;

  }
  catch ( error ) {

    console.log( error );

  }

  return result;

}

async function call_createUser( headers: any, body: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'POST',
                      body: JSON.stringify( body ),
                      headers: headers,
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/user";

    const callResult = await fetch( strRequestPath,
                                    options );

    result.output = callResult ? {
                                   status: callResult.status,
                                   statusText: callResult.statusText,
                                   body: await callResult.json()
                                 }:
                                 {
                                  status: null,
                                  statusText: null,
                                  body: { Code: "" }
                                 };

    ( options as any ).body = body;

    result.input = options;

  }
  catch ( error ) {

    console.log( error );

  }

  return result;

}

async function call_updateUser( headers: any, body: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'PUT',
                      body: JSON.stringify( body ),
                      headers: headers,
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/user";

    const callResult = await fetch( strRequestPath,
                                    options );

    result.output = callResult ? {
                                   status: callResult.status,
                                   statusText: callResult.statusText,
                                   body: await callResult.json()
                                  }:
                                  {
                                   status: null,
                                   statusText: null,
                                   body: { Code: "" }
                                  };

    ( options as any ).body = body;

    result.input = options;

  }
  catch ( error ) {

    console.log( error );

  }

  return result;

}

function formatSequence( intSequence: number ): string {

  let strResult = "";

  if ( intSequence < 10 ) {

    strResult = "00" + intSequence;

  }
  else if ( intSequence < 100 ) {

    strResult = "0" + intSequence;

  }

  return strResult;

}

function saveInput( strFileName: string, inputs: any ) {

  try {

    const strPath = SystemUtilities.baseRootPath +
                    "/test/standalone/result/" +
                    os.hostname + "/" +
                    SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_08 ) +
                    "/";

    fs.mkdirSync( strPath, { recursive: true } );

    intSequence += 1;

    fs.writeFileSync( strPath + formatSequence( intSequence ) + "_" + strFileName + "_input.json", JSON.stringify( inputs, null, 2 ) );

  }
  catch ( error ) {

    console.log( error );

  }

}

function saveResult( strFileName: string, result: any ) {

  try {

    const strPath = SystemUtilities.baseRootPath +
                    "/test/standalone/result/" +
                    SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_08 ) +
                    "/";

    fs.mkdirSync( strPath, { recursive: true } );

    intSequence += 1;

    fs.writeFileSync( strPath + formatSequence( intSequence ) + "_" + strFileName + "_result.json", JSON.stringify( result, null, 2 ) );

  }
  catch ( error ) {

    console.log( error );

  }

}

export async function test_login_admin01_at_system_net(): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_login( headers_admin01_at_system_net,
                                     strUser_admin01_at_system_net,
                                     strPassword_admin01_at_system_net );

    saveInput( "test_login_admin01", result.input );
    saveResult( "test_login_admin01", result.output );

    if ( result &&
         result.output.body.Code === 'SUCCESS_LOGIN' ) {

      jsonAuthorization_admin01 = result.output.body;

      strAuthorization_admin01 = result.output.body.Data[ 0 ].Authorization;
      strShortToken_admin01 = result.output.body.Data[ 0 ].ShortToken;

      headers_admin01_at_system_net.Authorization = strAuthorization_admin01;

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_logout( headers: any ): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_logout( headers );

    saveInput( "test_logout", result.input );
    saveResult( "test_logout", result.output );

    if ( result &&
         result.output.body.Code === 'SUCCESS_LOGOUT' ) {

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test01_createUser_user_at_test01_fail(): Promise<boolean> {

  let bResult = null;

  try {

    userRequestFull.Name = "user@test01";
    userRequestFull.Password = "12345678";
    userRequestFull.Role = "#MasterL01#";
    userRequestFull.sysUserGroup.Create = false;   //No request create
    userRequestFull.sysUserGroup.Name = "Test";    //This group not exists

    const result = await call_createUser( headers_admin01_at_system_net, userRequestFull ); //This request must be fail

    saveInput( "test01_createUser_user_at_test01_fail", result.input );
    saveResult( "test01_createUser_user_at_test01_fail", result.output );

    if ( result &&
         result.output.body.Code === "ERROR_USER_GROUP_NOT_EXISTS" ) {

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test02_createUser_user_at_test01_success(): Promise<boolean> {

  let bResult = false;

  try {

    userRequestFull.Name = "user@test01";
    userRequestFull.Password = "12345678";
    userRequestFull.Role = "#MasterL01#";
    userRequestFull.sysUserGroup.Create = true;    //Ask to create
    userRequestFull.sysUserGroup.Name = "Test";    //This group not exists
    userRequestFull.Business.Role = "#Role01#,#Role02#";
    userRequestFull.Business.Tag = "#Tag01#,#Tag02#";

    const result = await call_createUser( headers_admin01_at_system_net, userRequestFull ); //This request must be success

    saveInput( "test02_createUser_user_at_test01_success", result.input );
    saveResult( "test02_createUser_user_at_test01_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_CREATE" ) {

      user_at_test01_data = result.output.body.Data[ 0 ];
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test03_createUser_user_at_test01_again_fail(): Promise<boolean> {

  let bResult = false;

  try {

    userRequestFull.Name = "user@test01";
    userRequestFull.Password = "12345678";
    userRequestFull.Role = "#MasterL01#";
    userRequestFull.sysUserGroup.Create = true;    //Ask to create
    userRequestFull.sysUserGroup.Name = "Test";    //This group already exists
    userRequestFull.Business.Role = "#Role01#,#Role02#";
    userRequestFull.Business.Tag = "#Tag01#,#Tag02#";

    const result = await call_createUser( headers_admin01_at_system_net, userRequestFull ); //This request must be fail

    saveInput( "test03_createUser_user_at_test01_fail", result.input );
    saveResult( "test03_createUser_user_at_test01_fail", result.output );

    if ( result &&
         result.output.body.Code === "ERROR_USER_NAME_ALREADY_EXISTS" ) {

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}


export async function test04_createUser_user_group_Test_again_fail(): Promise<boolean> {

  let bResult = false;

  try {

    userRequestFull.Name = SystemUtilities.hashString( SystemUtilities.getUUIDv4(), 1, null );
    userRequestFull.Password = "12345678";
    userRequestFull.Role = "#MasterL01#";
    userRequestFull.sysUserGroup.Create = true;    //Ask to create
    userRequestFull.sysUserGroup.Name = "Test";    //This group already exists
    userRequestFull.Business.Role = "#Role01#,#Role02#";
    userRequestFull.Business.Tag = "#Tag01#,#Tag02#";

    const result = await call_createUser( headers_admin01_at_system_net, userRequestFull ); //This request must be fail

    saveInput( "test03_createUser_user_at_test01_fail", result.input );
    saveResult( "test03_createUser_user_at_test01_fail", result.output );

    if ( result &&
         result.output.body.Code === "ERROR_USER_GROUP_ALREADY_EXISTS" ) {

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test01_updateUser_user_at_test01_success( userData: any ): Promise<boolean> {

  let bResult = false;

  try {

    let userRequest = {} as any;

    userRequest.Notify = "";
    userRequest.Avatar = "";
    userRequest.Id = userData.Id;
    userRequest.ShortId = "";
    userRequest.ExpireAt = "";
    userRequest.Name = "test02";
    userRequest.Password = "123456789";
    userRequest.Role = null;
    userRequest.Comment = "Update success";
    userRequest.sysPerson = userData.sysPerson;
    userRequest.sysPerson.FirstName = userRequest.sysPerson.FirstName + " 1";
    userRequest.sysPerson.LastName = userRequest.sysPerson.LastName + " 2";
    userRequest.sysPerson.Address = "1625 s walnut street, wa 98233, suite 104";
    userRequest.sysUserGroup = {} as any;
    userRequest.sysUserGroup.Create = true;    //Ask to create
    userRequest.sysUserGroup.Id = "";
    userRequest.sysUserGroup.ShortId = "";
    userRequest.sysUserGroup.Name = "OtherTest";    //This group not exists
    userRequest.sysUserGroup.Role = "";
    userRequest.sysUserGroup.Tag = "";
    userRequest.Business = userData.Business;

    let result = await call_updateUser( headers_admin01_at_system_net, userRequest ); //This request must be success

    saveInput( "test01_updateUser_user_at_test01_success", result.input );
    saveResult( "test01_updateUser_user_at_test01_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_UDPATE" ) {

      user_at_test01_data = result.output.body.Data[ 0 ];
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test02_updateUser_user_at_test01_fail( userData: any ): Promise<boolean> {

  let bResult = false;

  try {

    let userRequest = {} as any;

    userRequest.Notify = "";
    userRequest.Avatar = "";
    userRequest.Id = userData.Id;
    userRequest.ShortId = "";
    userRequest.ExpireAt = "";
    userRequest.Name = "user@test01";
    userRequest.Password = "12345678";
    userRequest.Role = null;
    userRequest.Comment = "Update success";
    userRequest.sysPerson = userData.sysPerson;
    userRequest.sysPerson.FirstName = userRequest.sysPerson.FirstName.replace( " 1", "" );
    userRequest.sysPerson.LastName = userRequest.sysPerson.LastName.replace( " 2", "" );
    userRequest.sysPerson.Address = "1625 s walnut street, wa 98233, suite 102";
    userRequest.sysUserGroup = {} as any;
    userRequest.sysUserGroup.Create = true;    //Ask to create
    userRequest.sysUserGroup.Id = "";
    userRequest.sysUserGroup.ShortId = "";
    userRequest.sysUserGroup.Name = "Test";    //This group already exists
    userRequest.sysUserGroup.Role = "";
    userRequest.sysUserGroup.Tag = "";
    userRequest.Business = userData.Business;

    let result = await call_updateUser( headers_admin01_at_system_net, userRequest ); //This request must be fail

    saveInput( "test02_updateUser_user_at_test01_fail", result.input );
    saveResult( "test02_updateUser_user_at_test01_fail", result.output );

    if ( result &&
         result.output.body.Code === "ERROR_USER_GROUP_ALREADY_EXISTS" ) {

      user_at_test01_data = result.output.body.Data[ 0 ];
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

async function test_set01() {

  //await assert( await test_login_admin01() === true, 'Test Failed', '###' )

  await assert( await test_login_admin01_at_system_net() === true, chalk.red( 'Login with user admin01@system.net FAILED' ) );

  try {

    await assert( await test01_createUser_user_at_test01_fail() === true, chalk.red( 'Creation of the user user@test01 must be FAILED' ) );

    await assert( await test02_createUser_user_at_test01_success() === true, chalk.red( 'Creation of the user user@test01 FAILED' ) );

    await assert( await test03_createUser_user_at_test01_again_fail() === true, chalk.red( 'Creation of the user user@test01 again must be FAILED' ) );

    await assert( await test04_createUser_user_group_Test_again_fail() === true, chalk.red( 'Creation of the user group Test again must be FAILED' ) );

    await assert( await test01_updateUser_user_at_test01_success( user_at_test01_data ) === true, chalk.red( 'Update of the user user@test01 FAILED' ) );

    await assert( await test02_updateUser_user_at_test01_fail( user_at_test01_data ) === true, chalk.red( 'Update of the user user@test01 must be FAILED' ) );

  }
  catch ( error ) {

    console.log( error );

  }

  assert( await test_logout( headers_admin01_at_system_net ) === true, 'Logout with user admin01@system.net success' );

}

export default async function main() {

  SystemUtilities.startRun = SystemUtilities.getCurrentDateAndTime(); //new Date();

  SystemUtilities.baseRunPath = __dirname;
  SystemUtilities.baseRootPath = appRoot.path;

  await test_set01();

}

main();

