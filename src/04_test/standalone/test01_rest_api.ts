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

const headers_user02_at_TestL01 = {
                                    "Authorization": "",
                                    "Content-Type": "application/json",
                                    "FrontendId": "ccc1",
                                    "TimeZoneId": "America/Los_Angeles",
                                    "Language": "en_US"
                                  }

const headers_user01_at_TestL02 = {
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

let user01_at_TestL02_data = {} as any;
let user02_at_TestL02_data = {} as any;

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


async function call_profile( headers: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'GET',
                      headers: headers,
                      body: null,
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/user/profile";

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

     //( options as any ).body = body;

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

export async function test_login( headers: any,
                                  userData: any,
                                  strCode: string,
                                  strFileName: string ): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_login( headers,
                                     userData.Name,
                                     userData.Password );

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) { //"SUCCESS_LOGIN"

      const strAuthorization = result.output.body.Data[ 0 ].Authorization;

      headers.Authorization = strAuthorization;

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_logout( headers: any,
                                   strCode: string,
                                   strFileName: string ): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_logout( headers );

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) { //"SUCCESS_LOGOUT"

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_profile_at_less_one_role( headers: any,
                                                     rolesToTest: string[] | string[],
                                                     strCode: string,
                                                     strFileName: string ): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_profile( headers );

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) { //"SUCCESS_GET_SESSION_PROFILE"

      const currentRoles = result.output.body.Data[ 0 ].Role.split( "," );

      for ( let intRoleToTestIndex = 0; intRoleToTestIndex < rolesToTest.length; intRoleToTestIndex++ ) {

        const strRoleToTest = rolesToTest[ intRoleToTestIndex ];

        for ( let intCurrentRoleIndex = 0; intCurrentRoleIndex < currentRoles.length; intCurrentRoleIndex++ ) {

          const strCurrentRole = currentRoles[ intCurrentRoleIndex ];

          if ( strCurrentRole.startsWith( strRoleToTest ) ) {

            bResult = true;
            break;

          }

        }

        if ( bResult ) {

          break;

        }

      }

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_profile_all_roles( headers: any,
                                              rolesToTest: string[] | string[],
                                              strCode: string,
                                              strFileName: string ): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_profile( headers );

    const resultOfTest = []; //rolesToTest[ intRoleToTestIndex ]

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) { //"SUCCESS_GET_SESSION_PROFILE"

      const currentRoles = result.output.body.Data[ 0 ].Role.split( "," );

      for ( let intRoleToTestIndex = 0; intRoleToTestIndex < rolesToTest.length; intRoleToTestIndex++ ) {

        const strRoleToTest = rolesToTest[ intRoleToTestIndex ];

        for ( let intCurrentRoleIndex = 0; intCurrentRoleIndex < currentRoles.length; intCurrentRoleIndex++ ) {

          const strCurrentRole = currentRoles[ intCurrentRoleIndex ];

          if ( strCurrentRole.startsWith( strRoleToTest ) ) {

            if ( resultOfTest.includes( strRoleToTest ) === false ) {

              resultOfTest.push( rolesToTest[ intRoleToTestIndex ] );

            }

          }

        }

      }

      bResult = resultOfTest.length === rolesToTest.length;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_deleteUser( headers: any,
                                       userData: any,
                                       strCode: string,
                                       strFileName: string ): Promise<boolean> {

  let bResult = false;

  try {

    let userRequest = {} as any;

    if ( userData.Id ) {

      userRequest.Id = userData.Id;

    }
    else if ( userData.Name ) {

      userRequest.Name = userData.Name;

    }

    let result = await call_deleteUser( headers, userRequest ); //This request must be fail

    saveInput( strFileName, result.input ); //"test_deleteUser_by_name_" +  userRequest.Name + "_fail"
    result.output.expected = { Code: strCode }; //"ERROR_CANNOT_DELETE_THE_INFORMATION"
    saveResult( strFileName, result.output ); //"test_deleteUser_by_name_" +  userRequest.Name + "_fail"

    if ( result &&
         result.output.body.Code === strCode ) {  //"ERROR_CANNOT_DELETE_THE_INFORMATION"

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_deleteUserGroup( headers: any,
                                            groupData: any,
                                            strCode: string,
                                            strFileName: string ): Promise<boolean> {

  let bResult = false;

  try {

    let userGroupRequest = {} as any;

    if ( groupData.Id ) {

      userGroupRequest.Id = groupData.Id;

    }
    else {

      userGroupRequest.Name = groupData.Name //"TestL01";

    }

    let result = await call_deleteUserGroup( headers, userGroupRequest ); //This request must be success

    saveInput( strFileName, result.input ); //"test_deleteUserGroup_TestL01_success"
    result.output.expected = { Code: strCode }; //"SUCCESS_USER_GROUP_DELETE"
    saveResult( strFileName, result.output ); //"test_deleteUserGroup_TestL01_success"

    if ( result &&
         result.output.body.Code === strCode ) { //"SUCCESS_USER_GROUP_DELETE"

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_createUser_user01_at_TestL01( headers: any,
                                                         strCode: string,
                                                         strFileName: string ): Promise<boolean> {

  let bResult = null;

  try {

    const userRequest = { ... userRequestFull }; //Copy original information

    userRequest.Name = "user01@TestL01";
    userRequest.Password = "12345678";
    userRequest.Role = "#MasterL01#";
    userRequest.sysUserGroup.Create = false;    //No request create
    userRequest.sysUserGroup.Name = "TestL01";  //This group not exists

    const result = await call_createUser( headers, userRequest ); //This request must be fail

    saveInput( strFileName, result.input ); //"test_createUser_user01@TestL01_fail"
    result.output.expected = { Code: strCode }; //"ERROR_USER_GROUP_NOT_FOUND"
    saveResult( strFileName, result.output ); //"test_createUser_user01@TestL01_fail"

    if ( result &&
         result.output.body.Code === strCode ) { //"ERROR_USER_GROUP_NOT_FOUND"

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

    const userRequest = { ... userRequestFull }; //Copy original information

    userRequest.Name = "user01@TestL01";
    userRequest.Password = "12345678";
    userRequest.Role = "#MasterL01#";
    userRequest.sysUserGroup.Create = true;    //Ask to create
    userRequest.sysUserGroup.Name = "TestL01";    //This group not exists
    userRequest.Business.Role = "#Role01#,#Role02#";
    userRequest.Business.Tag = "#Tag01#,#Tag02#";

    const result = await call_createUser( headers, userRequest ); //This request must be success

    saveInput( "test_createUser_user01_at_TestL01_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_CREATE" };
    saveResult( "test_createUser_user01_at_TestL01_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_CREATE" ) {

      user01_at_TestL01_data = result.output.body.Data[ 0 ];
      user01_at_TestL01_data.Password = userRequest.Password;
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_createUser_user01_at_TestL02_success( headers: any ): Promise<boolean> {

  let bResult = false;

  try {

    const userRequest = { ... userRequestFull }; //Copy original information

    userRequest.Id = null;
    userRequest.Name = "user01@TestL02";
    userRequest.Password = "12345678";
    userRequest.Role = "#MasterL03#+#Name:TestL01#+#Name:TestL02#";
    userRequest.sysUserGroup.Create = false;         //Ask to create
    userRequest.sysUserGroup.Name = "TestL02";       //This group must exists
    userRequest.Business.Role = "#Role10#,#Role11#";
    userRequest.Business.Tag = "#Tag10#,#Tag11#";

    const result = await call_createUser( headers, userRequest ); //This request must be success

    saveInput( "test_createUser_user01_at_TestL02_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_CREATE" };
    saveResult( "test_createUser_user01_at_TestL02_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_CREATE" ) {

      user01_at_TestL02_data = result.output.body.Data[ 0 ];
      user01_at_TestL02_data.Password = userRequest.Password;
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_createUser_user02_at_TestL02_success( headers: any ): Promise<boolean> {

  let bResult = false;

  try {

    const userRequest = { ... userRequestFull }; //Copy original information

    userRequest.Id = null;
    userRequest.Name = "user02@TestL02";
    userRequest.Password = "12345678";
    userRequest.Role = "#MasterL03#+#Name:TestL01#+#Name:TestL02#"; //<---- This roles must be ignored
    userRequest.sysUserGroup.Create = false;         //Ask to create
    userRequest.sysUserGroup.Name = "TestL02";       //This group must exists
    userRequest.Business.Role = "#Role20#,#Role21#";
    userRequest.Business.Tag = "#Tag20#,#Tag21#";

    const result = await call_createUser( headers, userRequest ); //This request must be success

    saveInput( "test_createUser_user02_at_TestL02_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_CREATE" };
    saveResult( "test_createUser_user02_at_TestL02_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_CREATE" ) {

      user02_at_TestL02_data = result.output.body.Data[ 0 ];
      user02_at_TestL02_data.Password = userRequest.Password;
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

    const userRequest = { ... userRequestFull } as any; //Copy original information

    userRequest.Notify = "";
    userRequest.Avatar = "";
    userRequest.Id = userData.Id;
    userRequest.ShortId = "";
    userRequest.ExpireAt = "";
    userRequest.Name = "user02@TestL02";
    userRequest.Password = "123456789";
    userRequest.Role = "#MasterL01#,#Administrator#,#BManagerL01#"; //<-- This role is ignored
    userRequest.Tag = "#Tag01#";  //<-- This tag is ignored
    userRequest.Comment = "Update success";
    userRequest.sysPerson = userData.sysPerson;
    userRequest.sysPerson.FirstName = userRequest.sysPerson.FirstName.replace( " 1", "" );
    userRequest.sysPerson.LastName = userRequest.sysPerson.LastName.replace( " 2", "" );
    userRequest.sysPerson.Address = "1625 s walnut street, wa 98233, suite 102";
    userRequest.sysUserGroup = {} as any;
    userRequest.sysUserGroup.Create = false;
    userRequest.sysUserGroup.Id = "";
    userRequest.sysUserGroup.ShortId = "";
    userRequest.sysUserGroup.Name = "TestL02";    //This group already exists
    userRequest.sysUserGroup.Role = "";
    userRequest.sysUserGroup.Tag = "";
    userRequest.Business = userData.Business;

    let result = await call_updateUser( headers, userRequest ); //This request must be success

    saveInput( "test_updateUser_user02_at_TestL02_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_UPDATE" };
    saveResult( "test_updateUser_user02_at_TestL02_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_UPDATE" ) {

      user02_at_TestL02_data = result.output.body.Data[ 0 ];
      user02_at_TestL02_data.Password = userRequest.Password;
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

    const userRequest = { ... userRequestFull }; //Copy original information

    userRequest.Name = "user01@TestL01";
    userRequest.Password = "12345678";
    userRequest.Role = "#MasterL01#";
    userRequest.sysUserGroup.Create = false;    //Ask to create
    userRequest.sysUserGroup.Name = "TestL01";    //This group already exists
    userRequest.Business.Role = "#Role01#,#Role02#";
    userRequest.Business.Tag = "#Tag01#,#Tag02#";

    const result = await call_createUser( headers, userRequest ); //This request must be fail

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

    const userRequest = { ... userRequestFull }; //Copy original information

    userRequest.Name = SystemUtilities.hashString( SystemUtilities.getUUIDv4(), 1, null );
    userRequest.Password = "12345678";
    userRequest.Role = "#MasterL01#";
    userRequest.sysUserGroup.Create = true;    //Ask to create
    userRequest.sysUserGroup.Name = "TestL01";    //This group already exists
    userRequest.Business.Role = "#Role01#,#Role02#";
    userRequest.Business.Tag = "#Tag01#,#Tag02#";

    const result = await call_createUser( headers, userRequest ); //This request must be fail

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

    //let userRequest = {} as any;
    const userRequest = { ... userRequestFull } as any; //Copy original information

    userRequest.Notify = "";
    userRequest.Avatar = "";
    userRequest.Id = userData.Id;
    userRequest.ShortId = "";
    userRequest.ExpireAt = "";
    userRequest.Name = "user99@TestL02";
    userRequest.Password = "123456789";
    userRequest.Role = null,
    userRequest.Comment = "Update user success. The group is new 1";
    userRequest.sysPerson = userData.sysPerson; //Copy old person data
    userRequest.sysPerson.FirstName = userRequest.sysPerson.FirstName + " 1";
    userRequest.sysPerson.LastName = userRequest.sysPerson.LastName + " 2";
    userRequest.sysPerson.Address = "1625 s walnut street, wa 98233, suite 104";
    userRequest.sysUserGroup = {} as any;  //Create new group
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
      user01_at_TestL01_data.Password = userRequest.Password;
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_updateUser_user01_at_TestL01_fail( headers: any, userData: any ): Promise<boolean> {

  let bResult = false;

  try {

    //let userRequest = {} as any;
    const userRequest = { ... userRequestFull } as any; //Copy original information

    userRequest.Notify = "";
    userRequest.Avatar = "";
    userRequest.Id = userData.Id;
    userRequest.ShortId = "";
    userRequest.ExpireAt = "";
    userRequest.Name = userData.Name;
    userRequest.Password = "12345678";
    userRequest.Role = "#Administrator#"; //<--- This role is ignored
    userRequest.Comment = "Update user success. The group is new 1";
    userRequest.sysPerson = userData.sysPerson; //Copy old person data
    userRequest.sysPerson.FirstName = userRequest.sysPerson.FirstName + " 1";
    userRequest.sysPerson.LastName = userRequest.sysPerson.LastName + " 2";
    userRequest.sysPerson.Address = "1625 s walnut street, wa 98233, suite 104";
    userRequest.sysUserGroup = {} as any;  //Create new group
    userRequest.sysUserGroup.Create = false;    //Ask to create
    userRequest.sysUserGroup.Id = "";
    userRequest.sysUserGroup.ShortId = "";
    userRequest.sysUserGroup.Name = "TestL01";    //This group must exists
    userRequest.sysUserGroup.Role = "#Administrator#"; //<--- This role is ignored
    userRequest.sysUserGroup.Tag = "";
    userRequest.Business = userData.Business;

    let result = await call_updateUser( headers, userRequest ); //This request must be success

    saveInput( "test_updateUser_user01_at_TestL01_fail", result.input );
    result.output.expected = { Code: "ERROR_USER_NOT_VALID" };
    saveResult( "test_updateUser_user01_at_TestL01_fail", result.output );

    if ( result &&
         result.output.body.Code === "ERROR_USER_NOT_VALID" ) {

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_updateUser_user99_at_TestL02_fail( headers: any, userData: any ): Promise<boolean> {

  let bResult = false;

  try {

    //let userRequest = {} as any;
    const userRequest = { ... userRequestFull } as any; //Copy original information

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

export async function test_updateUser_user99_at_TestL02_success( headers: any, userData: any ): Promise<boolean> {

  let bResult = false;

  try {

    //let userRequest = {} as any;
    const userRequest = { ... userRequestFull } as any; //Copy original information

    userRequest.Notify = "";
    userRequest.Avatar = "";
    userRequest.Id = userData.Id;
    userRequest.ShortId = "";
    userRequest.ExpireAt = "";
    userRequest.Name = "user02@TestL01";
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

    saveInput( "test_updateUser_user99_at_TestL02_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_UDPATE" };
    saveResult( "test_updateUser_user99_at_TestL02_success", result.output );

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

export async function test_createUser_user02_at_TestL02_fail( headers: any ): Promise<boolean> {

  let bResult = null;

  try {

    const userRequest = { ... userRequestFull }; //Copy original information

    //userRequestFull.Id = null;
    userRequest.Name = "user02@TestL02";
    userRequest.Password = "12345678";
    userRequest.Role = "#MasterL01#,#Administrator#,#BManarageL01#"; //<--- This roles ignored
    userRequest.sysUserGroup.Create = false;      //No request to create, This request must be fail
    userRequest.sysUserGroup.Name = "TestL02";    //This group not exists

    const result = await call_createUser( headers, userRequest ); //This request must be fail

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

    const userRequest = { ... userRequestFull }; //Copy original information

    userRequest.Name = "user02@TestL01";
    userRequest.Password = "12345678";
    userRequest.Role = "#MasterL01#"; //<-- This role is ignored
    userRequest.sysUserGroup.Create = false;
    userRequest.sysUserGroup.Name = "TestL01";    //This group not exists
    userRequest.Business.Role = "#Role03#,#Role04#";
    userRequest.Business.Tag = "#Tag03#,#Tag04#";

    const result = await call_createUser( headers, userRequest ); //This request must be success

    saveInput( "test_createUser_user02_at_TestL01_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_CREATE" };
    saveResult( "test_createUser_user02_at_TestL01_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_CREATE" ) {

      user02_at_TestL01_data = result.output.body.Data[ 0 ];
      user02_at_TestL01_data.Password = userRequest.Password;
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}


export async function test_updateUser_user02_at_TestL01_success( headers: any, userData: any ): Promise<boolean> {

  let bResult = false;

  try {

    const userRequest = { ... userRequestFull } as any; //Copy original information

    userRequest.Notify = "";
    userRequest.Avatar = "";
    userRequest.Id = userData.Id;
    userRequest.ShortId = "";
    userRequest.ExpireAt = "";
    userRequest.Name = "user02@TestL01";
    userRequest.Password = "123456789";
    userRequest.Role = "#MasterL01#,#Administrator#,#BManagerL01#"; //<-- This role is ignored
    userRequest.Tag = "#Tag01#";  //<-- This tag is ignored
    userRequest.Comment = "Update success";
    userRequest.sysPerson = userData.sysPerson;
    userRequest.sysPerson.FirstName = userRequest.sysPerson.FirstName.replace( " 1", "" );
    userRequest.sysPerson.LastName = userRequest.sysPerson.LastName.replace( " 2", "" );
    userRequest.sysPerson.Address = "1625 s walnut street, wa 98233, suite 102";
    userRequest.sysUserGroup = {} as any;
    userRequest.sysUserGroup.Create = false;
    userRequest.sysUserGroup.Id = "";
    userRequest.sysUserGroup.ShortId = "";
    userRequest.sysUserGroup.Name = "TestL02";    //This group already exists
    userRequest.sysUserGroup.Role = "";
    userRequest.sysUserGroup.Tag = "";
    userRequest.Business = userData.Business;

    let result = await call_updateUser( headers, userRequest ); //This request must be success

    saveInput( "test_updateUser_user02_at_TestL01_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_UPDATE" };
    saveResult( "test_updateUser_user02_at_TestL01_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_UPDATE" ) {

      user02_at_TestL01_data = result.output.body.Data[ 0 ];
      user02_at_TestL01_data.Password = userRequest.Password;
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_createUser_user03_at_TestL01_fail( headers: any ): Promise<boolean> {

  let bResult = false;

  try {

    const userRequest = { ... userRequestFull }; //Copy original information

    userRequest.Name = "user03@TestL01";
    userRequest.Password = "12345678";
    userRequest.Role = "#MasterL01#";
    userRequest.sysUserGroup.Create = false;
    userRequest.sysUserGroup.Name = "TestL01";    //This group not exists
    userRequest.Business.Role = "#Role03#,#Role04#";
    userRequest.Business.Tag = "#Tag03#,#Tag04#";

    const result = await call_createUser( headers, userRequest ); //This request must be fail

    saveInput( "test_createUser_user03_at_TestL01_fail", result.input );
    result.output.expected = { Code: "ERROR_FORBIDEN_ACCESS" };
    saveResult( "test_createUser_user03_at_TestL01_fail", result.output );

    if ( result &&
         result.output.body.Code === "ERROR_FORBIDEN_ACCESS" ) {

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

function myAssert( bCondition: boolean,
                   strMessageSuccess: string,
                   strMessageFail: string ) {

  if ( bCondition ) {

    console.log( logSymbols.success, chalk.green( strMessageSuccess ) );

  }
  else {

    assert( false, logSymbols.error + " " + chalk.red( strMessageFail ) );

  }

}

async function test_set01() {

  console.log( chalk.blue( "Starting the test set 01" ) );

  try {

    console.log( chalk.blue( "******************** admin01@system.net ********************" ) );

    myAssert( await test_login( headers_admin01_at_system_net,
                                {
                                  Name: strUser_admin01_at_system_net,
                                  Password: strPassword_admin01_at_system_net
                                },
                                "SUCCESS_LOGIN",
                                "test_login_admin01@system_net_success" ),
              'EF56F748EC63: Login with user admin01@system.net is OK',
              'EF56F748EC63: Login with user admin01@system.net is FAILED' );

    try {

      myAssert( await test_deleteUser( headers_admin01_at_system_net,
                                       { Name: "noexists@systems.net" },
                                       "ERROR_USER_NOT_FOUND",
                                       "test_deleteUser_noexists@systems.net_fail" ),
                'C98802C4C4F0: Delete of the user bmanager@system.net is OK with the fail',
                'C98802C4C4F0: Delete of the user bmanager@system.net is FAILED' );

      //Fail because try create the user user01@TestL01 and the user group TestL01, the field create of section sysGroup is false.
      myAssert( await test_createUser_user01_at_TestL01( headers_admin01_at_system_net,
                                                         "ERROR_USER_GROUP_NOT_FOUND",
                                                         "test_createUser_user01@TestL01_fail" ),
                'EAD546813A1F: Creation of the user user01@TestL01 is OK with the fail',
                'EAD546813A1F: Creation of the user user01@TestL01 is FAILED' );

      //*** Create the user user01@TestL01 ***
      myAssert( await test_createUser_user01_at_TestL01_success( headers_admin01_at_system_net ),
                'B731A9223B34: Creation of the user user01@TestL01 is OK',
                'B731A9223B34: Creation of the user user01@TestL01 is FAILED' );

      //Fail because tray to create again the user user01@TestL01
      myAssert( await test_createUser_user01_at_TestL01_again_fail( headers_admin01_at_system_net ),
                '19DCE3E52AE7: Creation of the user user01@TestL01 again is OK with the fail',
                '19DCE3E52AE7: Creation of the user user01@TestL01 again is FAILED' );

      myAssert( await test_createUser_user_group_TestL01_again_fail( headers_admin01_at_system_net ),
                'B0C1F9DAA60C: Creation of the user group TestL01 again is OK with the fail',
                'B0C1F9DAA60C: Creation of the user group TestL01 again is FAILED' );

      //Change the name of the user from user01@TestL01 -> user99@TestL02
      //*** Create the user group TestL02 ****
      myAssert( await test_updateUser_user01_at_TestL01_success( headers_admin01_at_system_net, user01_at_TestL01_data ),
                '7A15DFC05C45: Update of the user user01@TestL01 is OK',
                '7A15DFC05C45: Update of the user user01@TestL01 is FAILED' );

      //Try to change the name of the user from user99@TestL02 -> user01@TestL01 BUT
      //Fail because try again to create the userGroup TestL02, the field create of section sysGroup is true.
      myAssert( await test_updateUser_user99_at_TestL02_fail( headers_admin01_at_system_net, user01_at_TestL01_data ),
                'F51C021137D4: Update of the user user99@TestL02 is OK with the fail',
                'F51C021137D4: Update of the user user99@TestL02 is FAILED' );

      //Change the name of the user from user99@TestL02 -> user01@TestL01
      //Change the user group to TestL01, the field create of section sysGroup is false.
      myAssert( await test_updateUser_user99_at_TestL02_success( headers_admin01_at_system_net, user01_at_TestL01_data ),
                '84945A9B59D0: Update of the user user02@TestL02 is OK',
                '84945A9B59D0: Update of the user user02@TestL02 is FAILED' );

      try {

        console.log( chalk.blue( "******************** user01@TestL01 ********************" ) );

        myAssert( await test_login( headers_user01_at_TestL01,
                                    {
                                      Name: user01_at_TestL01_data.Name,
                                      Password: user01_at_TestL01_data.Password
                                    },
                                    "SUCCESS_LOGIN",
                                    "test_login_user01@TestL01_success" ),
                  '2F5DF2F9A47A: Login with user user01@TestL01 is OK',
                  '2F5DF2F9A47A: Login with user user01@TestL01 is FAILED' );

        myAssert( await test_profile_at_less_one_role( headers_user01_at_TestL01,
                                                       [ "#MasterL01#" ],
                                                       "SUCCESS_GET_SESSION_PROFILE",
                                                       "test_profile_role_success" ),
                  'CDA84E5562F3: The user user01@TestL01 is OK have the role #MasterL01#',
                  'CDA84E5562F3: The user user01@TestL01 NOT have the role #MasterL01# FAILED' );

        myAssert( await test_profile_at_less_one_role( headers_user01_at_TestL01,
                                                       [ "#Administrator#", "#BManagerL01#" ],
                                                       "SUCCESS_GET_SESSION_PROFILE",
                                                       "test_profile_role_fail" ) === false,
                  '0DB4C6D59098: The user user02@TestL01 is OK not have the roles #Administrator# or #BManagerL01#',
                  '0DB4C6D59098: The user user02@TestL01 have the roles #Administrator# and/or #BManagerL01# FAILED' );

        //Fail because the user01@TestL01 already exists
        myAssert( await test_createUser_user01_at_TestL01( headers_user01_at_TestL01,
                                                           "ERROR_USER_NAME_ALREADY_EXISTS",
                                                           "test_createUser_user01@TestL01_fail" ),
                  '3C6BCE671AEB: Creation of the user user01@TestL01 is OK with the fail',
                  '3C6BCE671AEB: Creation of the user user01@TestL01 is FAILED' );

        //Fail because the user01@TestL01 is trying update himself
        myAssert( await test_updateUser_user01_at_TestL01_fail( headers_user01_at_TestL01,
                                                                user01_at_TestL01_data ),
                  'CF7DFB54EDE0: Update of the user user01@TestL01 is OK with the fail',
                  'CF7DFB54EDE0: Update of the user user01@TestL01 is FAILED' );

        //Fail because TestL02 is not in the group of user01@TestL01. Only can create users in the current group TestL01, Role => #MasterL01#
        myAssert( await test_createUser_user02_at_TestL02_fail( headers_user01_at_TestL01 ),
                  '675C61D31DDF: Creation of the user user02@TestL02 is OK with the fail',
                  '675C61D31DDF: Creation of the user user02@TestL02 is FAILED' );

        //Success because TestL01 is in the group of user01@TestL01. Only can create users in the current group TestL01, Role => #MasterL01#
        //*** Create user user02@TestL01 ***
        myAssert( await test_createUser_user02_at_TestL01_success( headers_user01_at_TestL01 ),
                  '95543470C81F: Creation of the user user02@TestL01 is OK',
                  '95543470C81F: Creation of the user user02@TestL01 is FAILED' );

        try {

          console.log( chalk.blue( "******************** user02@TestL01 ********************" ) );

          myAssert( await test_login( headers_user02_at_TestL01,
                                      {
                                        Name: user02_at_TestL01_data.Name,
                                        Password: user02_at_TestL01_data.Password
                                      },
                                      "SUCCESS_LOGIN",
                                      "test_login_user02@TestL01_success" ),
                    '81A6B96C4E24: Login with user user02@TestL01 OK',
                    '81A6B96C4E24: Login with user user02@TestL01 FAILED' );

          myAssert( await test_profile_at_less_one_role( headers_user02_at_TestL01,
                                                         [ "#MasterL01#", "#Administrator#", "#BManagerL01#" ],
                                                         "SUCCESS_GET_SESSION_PROFILE",
                                                         "test_profile_role_fail" ) === false,
                    'A9464CC0DE81: The user user02@TestL01 is OK not have the roles #MasterL01# or #Administrator# or #BManagerL01#',
                    'A9464CC0DE81: The user user02@TestL01 have the roles #MasterL01# and/or #Administrator# and/or #BManagerL01# FAILED' );

          //Fail because user03@TestL01 not have role to made this request
          myAssert( await test_createUser_user03_at_TestL01_fail( headers_user02_at_TestL01 ),
                    'EFCA2421E693: Creation of the user user03@TestL01 is OK with the fail',
                    'EFCA2421E693: Creation of the user user03@TestL01 is FAILED' );

          //Fail because user03@TestL01 not have role to made this request
          myAssert( await test_deleteUser( headers_user02_at_TestL01,
                                           { Name: "user01@TestL01" },
                                           "ERROR_FORBIDEN_ACCESS",
                                           "test_deleteUser_user03@TestL01_fail" ),
                    '72C257B51EDC: Delete of the user user03@TestL01 is OK with the fail',
                    '72C257B51EDC: Delete of the user user03@TestL01 is FAILED' );

          myAssert( await test_logout( headers_user02_at_TestL01,
                                       "SUCCESS_LOGOUT",
                                       "test_logout_user02@TestL01_success" ),
                    '9D731B62D922: Logout with user user02@TestL01 is OK',
                    '9D731B62D922: Logout with user user02@TestL01 is FAILED' );

          console.log( chalk.blue( "******************** user02@TestL01 ********************" ) );

        }
        catch ( error ) {

          console.log( "user02@TestL02" );
          console.log( error );

          console.log( chalk.blue( "******************** user02@TestL01 ********************" ) );

        }

        //Success because the user user02@TestL01 is in the group of user01@TestL01. Only can delete users in the current group TestL01, Role => #MasterL01#
        //*** Delete user user02@TestL01 ***
        myAssert( await test_deleteUser( headers_user01_at_TestL01,
                                         { Id: user02_at_TestL01_data.Id },
                                         "SUCCESS_USER_DELETE",
                                         "test_deleteUser_user02_at_TestL01_success" ),
                  '1AD5AD5583DD: Delete of the user user02@TestL01 is OK',
                  '1AD5AD5583DD: Delete of the user user02@TestL01 is FAILED' );

        //Fail because the user bmanager02@system.net is not in the group of user01@TestL01. Only can delete users in the current group TestL01, Role => #MasterL01#
        myAssert( await test_deleteUser( headers_user01_at_TestL01,
                                         { Name: "bmanager02@system.net" },
                                         "ERROR_CANNOT_DELETE_THE_INFORMATION",
                                         "test_deleteUser_bmanager02@system.net_fail" ),
                  '8E8766DECAD0: Delete of the user bmanager02@system.net is OK with the fail',
                  '8E8766DECAD0: Delete of the user bmanager02@system.net is FAILED' );

        myAssert( await test_logout( headers_user01_at_TestL01,
                                     "SUCCESS_LOGOUT",
                                     "test_logout_user01@TestL01_success" ),
                  '5FA1C53C9F1D: Logout with user user01@TestL01 is OK',
                  '5FA1C53C9F1D: Logout with user user01@TestL01 is FAILED' );

        console.log( chalk.blue( "******************** user01@TestL01 ********************" ) );

      }
      catch ( error ) {

        console.log( "user01@TestL01" );
        console.log( error );
        console.log( chalk.blue( "******************** user01@TestL01 ********************" ) );

      }

      //*** Create the user user01@TestL02 ****
      myAssert( await test_createUser_user01_at_TestL02_success( headers_admin01_at_system_net ),
                '8146E721C710: Creation of the user user01@TestL02 is OK',
                '8146E721C710: Creation of the user user01@TestL02 is FAILED' );

      try {

        console.log( chalk.blue( "******************** user01@TestL02 ********************" ) );

        myAssert( await test_login( headers_user01_at_TestL02,
                                    {
                                      Name: user01_at_TestL02_data.Name,
                                      Password: user01_at_TestL02_data.Password
                                    },
                                    "SUCCESS_LOGIN",
                                    "test_login_user01@TestL02_success" ),
                  '130FE0374778: Login with user user01@TestL02 OK',
                  '130FE0374778: Login with user user01@TestL02 FAILED' );

        myAssert( await test_profile_at_less_one_role( headers_user01_at_TestL02,
                                                       [ "#MasterL03#" ],
                                                       "SUCCESS_GET_SESSION_PROFILE",
                                                       "test_profile_role_success" ),
                  'DDC02D014233: The user user01@TestL02 is OK have the role #MasterL03#',
                  'DDC02D014233: The user user01@TestL02 NOT have the role #MasterL03# FAILED' );

        myAssert( await test_profile_at_less_one_role( headers_user01_at_TestL02,
                                                       [ "#Administrator#", "#BManagerL01#", "#MasterL01#" ],
                                                       "SUCCESS_GET_SESSION_PROFILE",
                                                       "test_profile_role_fail" ) === false,
                  'AD3CC7F54477: The user user02@TestL02 is OK not have the roles #Administrator# or #BManagerL01# or #MasterL01#',
                  'AD3CC7F54477: The user user02@TestL02 have the roles #Administrator# and/or #BManagerL01# and/or #MasterL01# FAILED' );

        //Success because user01@TestL02 has the Role => #MasterL03#+#Name:TestL01#+#Name:TestL02#
        //*** Create the user user02@TestL02 ***
        myAssert( await test_createUser_user02_at_TestL02_success( headers_user01_at_TestL02 ),
                  '595AA97F14E3: Creation of the user user02@TestL02 is OK',
                  '595AA97F14E3: Creation of the user user02@TestL02 is FAILED' );

        //Success because user01@TestL02 has the Role => #MasterL03#+#Name:TestL01#+#Name:TestL02#
        myAssert( await test_updateUser_user02_at_TestL02_success( headers_user01_at_TestL02, user02_at_TestL02_data ), //The user is another group
                  '5CE1E61F0840: Creation of the user user02@TestL02 is OK',
                  '5CE1E61F0840: Creation of the user user02@TestL02 is FAILED' );

        //Success because user01@TestL02 has the Role => #MasterL03#+#Name:TestL01#+#Name:TestL02#
        //*** Create the user user02@TestL01 ***
        myAssert( await test_createUser_user02_at_TestL01_success( headers_user01_at_TestL02 ),
                  'F717131C21AA: Creation of the user user02@TestL01 is OK',
                  'F717131C21AA: Creation of the user user02@TestL01 is FAILED' );

        //Success because user01@TestL02 has the Role => #MasterL03#+#Name:TestL01#+#Name:TestL02#
        myAssert( await test_updateUser_user02_at_TestL01_success( headers_user01_at_TestL02, user02_at_TestL01_data ), //The user is another group
                  '79736CBA890B: Creation of the user user02@TestL01 is OK',
                  '79736CBA890B: Creation of the user user02@TestL01 is FAILED' );

        try {

          console.log( chalk.blue( "******************** user02@TestL02 ********************" ) );

          //

          console.log( chalk.blue( "******************** user02@TestL02 ********************" ) );

        }
        catch ( error ) {

          console.log( "user01@TestL01" );
          console.log( error );
          console.log( chalk.blue( "******************** user02@TestL02 ********************" ) );

        }

        try {

          console.log( chalk.blue( "******************** user02@TestL01 ********************" ) );

          //

          console.log( chalk.blue( "******************** user02@TestL01 ********************" ) );

        }
        catch ( error ) {

          console.log( "user01@TestL01" );
          console.log( error );
          console.log( chalk.blue( "******************** user02@TestL01 ********************" ) );

        }

        //Success because user01@TestL02 has the Role => #MasterL03#+#Name:TestL01#+#Name:TestL02#
        myAssert( await test_deleteUser( headers_user01_at_TestL02,
                                        { Id: user02_at_TestL02_data.Id },
                                        "SUCCESS_USER_DELETE",
                                        "test_deleteUser_user02@TestL02_success" ),
                  'B266409B2D82: Delete of the user user02@TestL02 is OK',
                  'B266409B2D82: Delete of the user user02@TestL02 is FAILED' );

        //Success because user01@TestL02 has the Role => #MasterL03#+#Name:TestL01#+#Name:TestL02#
        myAssert( await test_deleteUser( headers_user01_at_TestL02,
                                        { Id: user02_at_TestL01_data.Id },
                                        "SUCCESS_USER_DELETE",
                                        "test_deleteUser_user02@TestL01_success" ),
                  '608E3D626873: Delete of the user user02@TestL01 is OK',
                  '608E3D626873: Delete of the user user02@TestL01 is FAILED' );

        myAssert( await test_logout( headers_user01_at_TestL02,
                                     "SUCCESS_LOGOUT",
                                     "test_logout_user01@TestL02_success" ),
                  '56FE7F65DC57: Logout with user user01@TestL02 is OK',
                  '56FE7F65DC57: Logout with user user01@TestL02 is FAILED' );

        console.log( chalk.blue( "******************** user01@TestL02 ********************" ) );

      }
      catch ( error ) {

        console.log( "user01@TestL02" );
        console.log( error );
        console.log( chalk.blue( "******************** user01@TestL02 ********************" ) );

      }

      myAssert( await test_deleteUserGroup( headers_admin01_at_system_net,
                                            { Name: "TestL01" },
                                            "ERROR_USER_GROUP_IS_NOT_USER_EMPTY",
                                            "test_deleteUserGroup_TestL01_fail" ),
                'B57DF85241CF: Delete of the user group TestL01 is OK with the fail',
                'B57DF85241CF: Delete of the user group TestL01 is FAILED' );

      myAssert( await test_deleteUser( headers_admin01_at_system_net,
                                       { Id: user01_at_TestL01_data.Id },
                                       "SUCCESS_USER_DELETE",
                                       "test_deleteUser_user01@TestL01_success" ),
                '96620A9B1111: Delete of the user user01@TestL01 is OK',
                '96620A9B1111: Delete of the user user01@TestL01 is FAILED' );

      myAssert( await test_deleteUser( headers_admin01_at_system_net,
                                       { Id: user01_at_TestL02_data.Id },
                                       "SUCCESS_USER_DELETE",
                                       "test_deleteUser_user01@TestL02_success" ),
                'B6822813434C: Delete of the user user01@TestL02 is OK',
                'B6822813434C: Delete of the user user01@TestL02 is FAILED' );

      myAssert( await test_deleteUserGroup( headers_admin01_at_system_net,
                                            { Name: "TestL01" },
                                            "SUCCESS_USER_GROUP_DELETE",
                                            "test_deleteUserGroup_TestL01_success" ),
                '52D06C775657: Delete of the user group TestL01 is OK',
                '52D06C775657: Delete of the user group TestL01 is FAILED' );

      myAssert( await test_deleteUserGroup( headers_admin01_at_system_net,
                                            { Name: "TestL02" },
                                            "SUCCESS_USER_GROUP_DELETE",
                                            "test_deleteUserGroup_TestL02_success" ),
                '2AAF1B478DDB: Delete of the user group TestL02 is OK',
                '2AAF1B478DDB: Delete of the user group TestL02 is FAILED' );

      myAssert( await test_deleteUserGroup( headers_admin01_at_system_net,
                                          { Name: "TestL02" },
                                          "ERROR_USER_GROUP_NOT_FOUND",
                                          "test_deleteUserGroup_TestL02_again_fail" ),
                'ECB00198468C: Delete of the user group TestL02 is OK with the fail',
                'ECB00198468C: Delete of the user group TestL02 is FAILED' );

    }
    catch ( error ) {

      console.log( "admin01@system.net" );
      console.log( error );

    }

    myAssert( await test_logout( headers_admin01_at_system_net,
                              "SUCCESS_LOGOUT",
                              "test_logout_admin01@system.net_success" ),
              '0E7222800B26: Logout with user admin01@system.net is OK',
              '0E7222800B26: Logout with user admin01@system.net is FAILED' );

    console.log( chalk.blue( "******************** admin01@system.net ********************" ) );

  }
  catch ( error ) {

    console.log( error );

    console.log( chalk.blue( "******************** admin01@system.net ********************" ) );

  }

}

export default async function main() {

  SystemUtilities.startRun = SystemUtilities.getCurrentDateAndTime(); //new Date();

  SystemUtilities.baseRunPath = __dirname;
  SystemUtilities.baseRootPath = appRoot.path;

  await test_set01();

}

main();

