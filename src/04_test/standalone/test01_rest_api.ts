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

//let strAuthorization_admin01 = null;

let intSequence = 0;

const headers_admin01_at_system_net = {
                                        "Authorization": "",
                                        "Content-Type": "application/json",
                                        "FrontendId": "ccc1",
                                        "TimeZoneId": "America/Los_Angeles",
                                        "Language": "en_US"
                                      }

const headers_user01_at_TestL01 = {
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

let user01_at_TestL01_data = {} as any;
let user02_at_TestL01_data = {} as any;

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

async function call_deleteUser( headers: any, body: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'DELETE',
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

async function call_deleteUserGroup( headers: any, body: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'DELETE',
                      body: JSON.stringify( body ),
                      headers: headers,
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/usergroup";

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
                    os.hostname + "/" +
                    SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_08 ) +
                    "/";

    fs.mkdirSync( strPath, { recursive: true } );

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
    result.output.expected = { Code: "SUCCESS_LOGIN" };
    saveResult( "test_login_admin01", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_LOGIN" ) {

      //jsonAuthorization_admin01 = result.output.body;

      const strAuthorization = result.output.body.Data[ 0 ].Authorization;
      //strShortToken_admin01 = result.output.body.Data[ 0 ].ShortToken;

      headers_admin01_at_system_net.Authorization = strAuthorization;

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_login_user01_at_TestL01( userData: any ): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_login( headers_user01_at_TestL01,
                                     userData.Name,
                                     userData.Password );

    saveInput( "test_login_user01_at_TestL01", result.input );
    result.output.expected = { Code: "SUCCESS_LOGIN" };
    saveResult( "test_login_user01_at_TestL01", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_LOGIN" ) {

      const strAuthorization = result.output.body.Data[ 0 ].Authorization;

      headers_user01_at_TestL01.Authorization = strAuthorization;

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
    result.output.expected = { Code: "SUCCESS_LOGOUT" };
    saveResult( "test_logout", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_LOGOUT" ) {

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_deleteUser_not_exists_at_system_net_fail( headers: any, userData: any ): Promise<boolean> {

  let bResult = false;

  try {

    let userRequest = {} as any;

    userRequest.Name = userData.Name;

    let result = await call_deleteUser( headers, userRequest ); //This request must be fail

    saveInput( "test_deleteUser_not_exists_at_system_net_fail", result.input );
    result.output.expected = { Code: "ERROR_USER_NOT_FOUND" };
    saveResult( "test_deleteUser_not_exists_at_system_net_fail", result.output );

    if ( result &&
         result.output.body.Code === "ERROR_USER_NOT_FOUND" ) {

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_createUser_user01_at_TestL01_fail( headers: any ): Promise<boolean> {

  let bResult = null;

  try {

    userRequestFull.Name = "user01@TestL01";
    userRequestFull.Password = "12345678";
    userRequestFull.Role = "#MasterL01#";
    userRequestFull.sysUserGroup.Create = false;   //No request create
    userRequestFull.sysUserGroup.Name = "TestL01";    //This group not exists

    const result = await call_createUser( headers, userRequestFull ); //This request must be fail

    saveInput( "test_createUser_user01_at_TestL01_fail", result.input );
    result.output.expected = { Code: "ERROR_USER_GROUP_NOT_FOUND" };
    saveResult( "test_createUser_user01_at_TestL01_fail", result.output );

    if ( result &&
         result.output.body.Code === "ERROR_USER_GROUP_NOT_FOUND" ) {

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_createUser_user01_at_TestL01_success( headers: any ): Promise<boolean> {

  let bResult = false;

  try {

    userRequestFull.Name = "user01@TestL01";
    userRequestFull.Password = "12345678";
    userRequestFull.Role = "#MasterL01#";
    userRequestFull.sysUserGroup.Create = true;    //Ask to create
    userRequestFull.sysUserGroup.Name = "TestL01";    //This group not exists
    userRequestFull.Business.Role = "#Role01#,#Role02#";
    userRequestFull.Business.Tag = "#Tag01#,#Tag02#";

    const result = await call_createUser( headers, userRequestFull ); //This request must be success

    saveInput( "test_createUser_user01_at_TestL01_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_CREATE" };
    saveResult( "test_createUser_user01_at_TestL01_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_CREATE" ) {

      user01_at_TestL01_data = result.output.body.Data[ 0 ];
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_createUser_user01_at_TestL01_again_fail( headers: any ): Promise<boolean> {

  let bResult = false;

  try {

    userRequestFull.Name = "user01@TestL01";
    userRequestFull.Password = "12345678";
    userRequestFull.Role = "#MasterL01#";
    userRequestFull.sysUserGroup.Create = true;    //Ask to create
    userRequestFull.sysUserGroup.Name = "TestL01";    //This group already exists
    userRequestFull.Business.Role = "#Role01#,#Role02#";
    userRequestFull.Business.Tag = "#Tag01#,#Tag02#";

    const result = await call_createUser( headers, userRequestFull ); //This request must be fail

    saveInput( "test_createUser_user01_at_TestL01_again_fail", result.input );
    result.output.expected = { Code: "ERROR_USER_NAME_ALREADY_EXISTS" };
    saveResult( "test_createUser_user01_at_TestL01_again_fail", result.output );

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


export async function test_createUser_user_group_TestL01_again_fail( headers: any ): Promise<boolean> {

  let bResult = false;

  try {

    userRequestFull.Name = SystemUtilities.hashString( SystemUtilities.getUUIDv4(), 1, null );
    userRequestFull.Password = "12345678";
    userRequestFull.Role = "#MasterL01#";
    userRequestFull.sysUserGroup.Create = true;    //Ask to create
    userRequestFull.sysUserGroup.Name = "TestL01";    //This group already exists
    userRequestFull.Business.Role = "#Role01#,#Role02#";
    userRequestFull.Business.Tag = "#Tag01#,#Tag02#";

    const result = await call_createUser( headers, userRequestFull ); //This request must be fail

    saveInput( "test_createUser_user_group_TestL01_again_fail", result.input );
    result.output.expected = { Code: "ERROR_USER_GROUP_ALREADY_EXISTS" };
    saveResult( "test_createUser_user_group_TestL01_again_fail", result.output );

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

export async function test_updateUser_user01_at_TestL01_success( headers: any, userData: any ): Promise<boolean> {

  let bResult = false;

  try {

    let userRequest = {} as any;

    userRequest.Notify = "";
    userRequest.Avatar = "";
    userRequest.Id = userData.Id;
    userRequest.ShortId = "";
    userRequest.ExpireAt = "";
    userRequest.Name = "user02@TestL02";
    userRequest.Password = "123456789";
    userRequest.Role = null;
    userRequest.Comment = "Update user success. The group is new 1";
    userRequest.sysPerson = userData.sysPerson;
    userRequest.sysPerson.FirstName = userRequest.sysPerson.FirstName + " 1";
    userRequest.sysPerson.LastName = userRequest.sysPerson.LastName + " 2";
    userRequest.sysPerson.Address = "1625 s walnut street, wa 98233, suite 104";
    userRequest.sysUserGroup = {} as any;
    userRequest.sysUserGroup.Create = true;    //Ask to create
    userRequest.sysUserGroup.Id = "";
    userRequest.sysUserGroup.ShortId = "";
    userRequest.sysUserGroup.Name = "TestL02";    //This group not exists
    userRequest.sysUserGroup.Role = "";
    userRequest.sysUserGroup.Tag = "";
    userRequest.Business = userData.Business;

    let result = await call_updateUser( headers, userRequest ); //This request must be success

    saveInput( "test_updateUser_user01_at_TestL01_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_UDPATE" };
    saveResult( "test_updateUser_user01_at_TestL01_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_UDPATE" ) {

      user01_at_TestL01_data = result.output.body.Data[ 0 ];
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_updateUser_user02_at_TestL02_fail( headers: any, userData: any ): Promise<boolean> {

  let bResult = false;

  try {

    let userRequest = {} as any;

    userRequest.Notify = "";
    userRequest.Avatar = "";
    userRequest.Id = userData.Id;
    userRequest.ShortId = "";
    userRequest.ExpireAt = "";
    userRequest.Name = "user01@TestL01";
    userRequest.Password = "12345678";
    userRequest.Role = null;
    userRequest.Comment = "Update user success. The group is new 2";
    userRequest.sysPerson = userData.sysPerson;
    userRequest.sysPerson.FirstName = userRequest.sysPerson.FirstName.replace( " 1", "" );
    userRequest.sysPerson.LastName = userRequest.sysPerson.LastName.replace( " 2", "" );
    userRequest.sysPerson.Address = "1625 s walnut street, wa 98233, suite 102";
    userRequest.sysUserGroup = {} as any;
    userRequest.sysUserGroup.Create = true;    //Ask to create, Must be fail
    userRequest.sysUserGroup.Id = "";
    userRequest.sysUserGroup.ShortId = "";
    userRequest.sysUserGroup.Name = "TestL01";    //This group already exists
    userRequest.sysUserGroup.Role = "";
    userRequest.sysUserGroup.Tag = "";
    userRequest.Business = userData.Business;

    let result = await call_updateUser( headers, userRequest ); //This request must be fail

    saveInput( "test_updateUser_user02_at_TestL02_fail", result.input );
    result.output.expected = { Code: "ERROR_USER_GROUP_ALREADY_EXISTS" };
    saveResult( "test_updateUser_user02_at_TestL02_fail", result.output );

    if ( result &&
         result.output.body.Code === "ERROR_USER_GROUP_ALREADY_EXISTS" ) {

      //user_at_test01_data = result.output.body.Data[ 0 ];
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_updateUser_user02_at_TestL02_success( headers: any, userData: any ): Promise<boolean> {

  let bResult = false;

  try {

    let userRequest = {} as any;

    userRequest.Notify = "";
    userRequest.Avatar = "";
    userRequest.Id = userData.Id;
    userRequest.ShortId = "";
    userRequest.ExpireAt = "";
    userRequest.Name = "user01@TestL01";
    userRequest.Password = "123456789";
    userRequest.Role = "#MasterL01#";
    userRequest.Tag = "#Tag01#";
    userRequest.Comment = "Update success";
    userRequest.sysPerson = userData.sysPerson;
    userRequest.sysPerson.FirstName = userRequest.sysPerson.FirstName.replace( " 1", "" );
    userRequest.sysPerson.LastName = userRequest.sysPerson.LastName.replace( " 2", "" );
    userRequest.sysPerson.Address = "1625 s walnut street, wa 98233, suite 102";
    userRequest.sysUserGroup = {} as any;
    userRequest.sysUserGroup.Create = false;
    userRequest.sysUserGroup.Id = "";
    userRequest.sysUserGroup.ShortId = "";
    userRequest.sysUserGroup.Name = "TestL01";    //This group already exists
    userRequest.sysUserGroup.Role = "";
    userRequest.sysUserGroup.Tag = "";
    userRequest.Business = userData.Business;

    let result = await call_updateUser( headers, userRequest ); //This request must be success

    saveInput( "test_updateUser_user02_at_TestL02_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_UDPATE" };
    saveResult( "test_updateUser_user02_at_TestL02_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_UDPATE" ) {

      user01_at_TestL01_data = result.output.body.Data[ 0 ];
      user01_at_TestL01_data[ "Password" ] = userRequest.Password; //Save the current password to make login later
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_deleteUser_user01_at_TestL01_success( headers: any, userData: any ): Promise<boolean> {

  let bResult = false;

  try {

    let userRequest = {} as any;

    userRequest.Id = userData.Id;

    let result = await call_deleteUser( headers, userRequest ); //This request must be success

    saveInput( "test_deleteUser_user01_at_TestL01_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_DELETE" };
    saveResult( "test_deleteUser_user01_at_TestL01_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_DELETE" ) {

      user01_at_TestL01_data = null;
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_deleteUserGroup_TestL01_success( headers: any ): Promise<boolean> {

  let bResult = false;

  try {

    let userRequest = {} as any;

    userRequest.Name = "TestL01";

    let result = await call_deleteUserGroup( headers, userRequest ); //This request must be success

    saveInput( "test_deleteUserGroup_TestL01_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_GROUP_DELETE" };
    saveResult( "test_deleteUserGroup_TestL01_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_GROUP_DELETE" ) {

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_deleteUserGroup_TestL02_success( headers: any ): Promise<boolean> {

  let bResult = false;

  try {

    let userRequest = {} as any;

    userRequest.Name = "TestL02";

    let result = await call_deleteUserGroup( headers, userRequest ); //This request must be success

    saveInput( "test_deleteUserGroup_TestL02_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_GROUP_UDPATE" };
    saveResult( "test_deleteUserGroup_TestL02_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_GROUP_DELETE" ) {

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_deleteUserGroup_TestL02_again_fail( headers: any ): Promise<boolean> {

  let bResult = false;

  try {

    let userRequest = {} as any;

    userRequest.Name = "TestL02";

    let result = await call_deleteUserGroup( headers, userRequest ); //This request must be fail

    saveInput( "test_deleteUserGroup_TestL02_again_fail", result.input );
    result.output.expected = { Code: "ERROR_USER_GROUP_NOT_FOUND" };
    saveResult( "test_deleteUserGroup_TestL02_again_fail", result.output );

    if ( result &&
         result.output.body.Code === "ERROR_USER_GROUP_NOT_FOUND" ) {

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_createUser_user02_at_TestL02_fail( headers: any ): Promise<boolean> {

  let bResult = null;

  try {

    userRequestFull.Name = "user02@TestL02";
    userRequestFull.Password = "12345678";
    userRequestFull.Role = "#MasterL01#";
    userRequestFull.sysUserGroup.Create = false;   //No request create
    userRequestFull.sysUserGroup.Name = "TestL02";    //This group not exists

    const result = await call_createUser( headers, userRequestFull ); //This request must be fail

    saveInput( "test_createUser_user02_at_TestL02_fail", result.input );
    result.output.expected = { Code: "ERROR_CANNOT_CREATE_USER" };
    saveResult( "test_createUser_user02_at_TestL02_fail", result.output );

    if ( result &&
         result.output.body.Code === "ERROR_CANNOT_CREATE_USER" ) {

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_createUser_user02_at_TestL01_success( headers: any ): Promise<boolean> {

  let bResult = false;

  try {

    userRequestFull.Name = "user02@TestL01";
    userRequestFull.Password = "12345678";
    userRequestFull.Role = "#MasterL01#";
    userRequestFull.sysUserGroup.Create = false;
    userRequestFull.sysUserGroup.Name = "TestL01";    //This group not exists
    userRequestFull.Business.Role = "#Role03#,#Role04#";
    userRequestFull.Business.Tag = "#Tag03#,#Tag04#";

    const result = await call_createUser( headers, userRequestFull ); //This request must be success

    saveInput( "test_createUser_user02_at_TestL01_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_CREATE" };
    saveResult( "test_createUser_user02_at_TestL01_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_CREATE" ) {

      user02_at_TestL01_data = result.output.body.Data[ 0 ];
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_deleteUser_user02_at_TestL01_success( headers: any, userData: any ): Promise<boolean> {

  let bResult = false;

  try {

    let userRequest = {} as any;

    userRequest.Id = userData.Id;

    let result = await call_deleteUser( headers, userRequest ); //This request must be success

    saveInput( "test_deleteUser_user02_at_TestL01_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_DELETE" };
    saveResult( "test_deleteUser_user02_at_TestL01_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_DELETE" ) {

      user02_at_TestL01_data = null;
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_deleteUser_bmanager02_at_system_net_fail( headers: any, userData: any ): Promise<boolean> {

  let bResult = false;

  try {

    let userRequest = {} as any;

    userRequest.Name = userData.Name;

    let result = await call_deleteUser( headers, userRequest ); //This request must be fail

    saveInput( "test_deleteUser_bmanager02_at_system_net_fail", result.input );
    result.output.expected = { Code: "ERROR_CANNOT_DELETE_THE_INFORMATION" };
    saveResult( "test_deleteUser_bmanager02_at_system_net_fail", result.output );

    if ( result &&
         result.output.body.Code === "ERROR_CANNOT_DELETE_THE_INFORMATION" ) {

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

async function test_set01() {

  assert( await test_login_admin01_at_system_net() === true, chalk.red( 'Login with user admin01@system.net FAILED' ) );

  try {

    assert( await test_deleteUser_not_exists_at_system_net_fail( headers_admin01_at_system_net, { Name: "no_exists@systems.net" } ) === true, chalk.red( 'Delete of the user bmanager@system.net must be FAILED' ) );

    assert( await test_createUser_user01_at_TestL01_fail( headers_admin01_at_system_net ) === true, chalk.red( 'Creation of the user user01@TestL01 must be FAILED' ) );

    assert( await test_createUser_user01_at_TestL01_success( headers_admin01_at_system_net ) === true, chalk.red( 'Creation of the user user01@TestL01 FAILED' ) );

    assert( await test_createUser_user01_at_TestL01_again_fail( headers_admin01_at_system_net ) === true, chalk.red( 'Creation of the user user01@TestL01 again must be FAILED' ) );

    assert( await test_createUser_user_group_TestL01_again_fail( headers_admin01_at_system_net ) === true, chalk.red( 'Creation of the user group TestL01 again must be FAILED' ) );

    assert( await test_updateUser_user01_at_TestL01_success( headers_admin01_at_system_net, user01_at_TestL01_data ) === true, chalk.red( 'Update of the user user01@TestL01 FAILED' ) );

    assert( await test_updateUser_user02_at_TestL02_fail( headers_admin01_at_system_net, user01_at_TestL01_data ) === true, chalk.red( 'Update of the user user02@TestL02 must be FAILED' ) );

    assert( await test_updateUser_user02_at_TestL02_success( headers_admin01_at_system_net, user01_at_TestL01_data ) === true, chalk.red( 'Update of the user user02@TestL02 FAILED' ) );

    try {

      assert( await test_login_user01_at_TestL01( { Name: user01_at_TestL01_data.Name, Password: user01_at_TestL01_data.Password } ) === true, chalk.red( 'Login with user user01@TestL01 FAILED' ) );

      //Fail because TestL02 is not in the group of user01@TestL01. Only can create users in the current group TestL01, Role => #MasterL01#
      assert( await test_createUser_user02_at_TestL02_fail( headers_user01_at_TestL01 ) === true, chalk.red( 'Creation of the user user02@TestL02 must be FAILED' ) );

      //Success because TestL01 is in the group of user01@TestL01. Only can create users in the current group TestL01, Role => #MasterL01#
      assert( await test_createUser_user02_at_TestL01_success( headers_user01_at_TestL01 ) === true, chalk.red( 'Creation of the user user02@TestL01 FAILED' ) );

      //Success because the user user02@TestL01 is in the group of user01@TestL01. Only can delete users in the current group TestL01, Role => #MasterL01#
      assert( await test_deleteUser_user02_at_TestL01_success( headers_user01_at_TestL01, user02_at_TestL01_data ) === true, chalk.red( 'Delete of the user user02@TestL01 FAILED' ) );

      //Fail because the user bmanager02@system.net is not in the group of user01@TestL01. Only can delete users in the current group TestL01, Role => #MasterL01#
      assert( await test_deleteUser_bmanager02_at_system_net_fail( headers_user01_at_TestL01, { Name: "bmanager02@system.net" } ) === true, chalk.red( 'Delete of the user bmanager02@system.net must be FAILED' ) );

      assert( await test_logout( headers_user01_at_TestL01 ) === true, chalk.red( 'Logout with user user01@TestL01 FAILED' ) );

    }
    catch ( error ) {

      console.log( "user01@TestL01" );
      console.log( error );

    }

    assert( await test_deleteUser_user01_at_TestL01_success( headers_admin01_at_system_net, user01_at_TestL01_data ) === true, chalk.red( 'Delete of the user user01@TestL01 FAILED' ) );

    assert( await test_deleteUserGroup_TestL01_success( headers_admin01_at_system_net ) === true, chalk.red( 'Delete of the user group TestL01 FAILED' ) );

    assert( await test_deleteUserGroup_TestL02_success( headers_admin01_at_system_net ) === true, chalk.red( 'Delete of the user group TestL02 FAILED' ) );

    assert( await test_deleteUserGroup_TestL02_again_fail( headers_admin01_at_system_net ) === true, chalk.red( 'Delete of the user group TestL02 must be FAILED' ) );

  }
  catch ( error ) {

    console.log( "admin01@system.net" );
    console.log( error );

  }

  assert( await test_logout( headers_admin01_at_system_net ) === true, chalk.red( 'Logout with user admin01@system.net FAILED' ) );

}

export default async function main() {

  SystemUtilities.startRun = SystemUtilities.getCurrentDateAndTime(); //new Date();

  SystemUtilities.baseRunPath = __dirname;
  SystemUtilities.baseRootPath = appRoot.path;

  await test_set01();

}

main();

