require( 'dotenv' ).config(); //Read the .env file, in the root folder of project

import fs from 'fs'; //Load the filesystem module
import os from 'os'; //Load the os module
//import cluster from "cluster";

const assert = require('assert').strict;
import appRoot from 'app-root-path';

import fetch from 'node-fetch';
import FormData from 'form-data';

import logSymbols from 'log-symbols';
import chalk from 'chalk';

import CommonConstants from '../../02_system/common/CommonConstants';
import CommonUtilities from '../../02_system/common/CommonUtilities';

import SystemUtilities from "../../02_system/common/SystemUtilities";

//const debug = require( 'debug' )( 'test01_test_api' );

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
                                        "Language": "en_US",
                                        "BinaryDataToken": ""
                                      }

const headers_user01_at_TestL01_Session1 = {
                                             "Authorization": "",
                                             "Content-Type": "application/json",
                                             "FrontendId": "ccc1",
                                             "TimeZoneId": "America/Los_Angeles",
                                             "Language": "en_US",
                                             "BinaryDataToken": ""
                                            }

const headers_user01_at_TestL01_Session2 = {
                                             "Authorization": "",
                                             "Content-Type": "application/json",
                                             "FrontendId": "ccc1",
                                             "TimeZoneId": "America/Los_Angeles",
                                             "Language": "en_US",
                                             "BinaryDataToken": ""
                                            }

const headers_user02_at_TestL01 = {
                                    "Authorization": "",
                                    "Content-Type": "application/json",
                                    "FrontendId": "ccc1",
                                    "TimeZoneId": "America/Los_Angeles",
                                    "Language": "en_US",
                                    "BinaryDataToken": ""
                                  }

const headers_user01_at_TestL02 = {
                                    "Authorization": "",
                                    "Content-Type": "application/json",
                                    "FrontendId": "ccc1",
                                    "TimeZoneId": "America/Los_Angeles",
                                    "Language": "en_US",
                                    "BinaryDataToken": ""
                                  }

const headers_user02_at_TestL02 = {
                                    "Authorization": "",
                                    "Content-Type": "application/json",
                                    "FrontendId": "ccc1",
                                    "TimeZoneId": "America/Los_Angeles",
                                    "Language": "en_US",
                                    "BinaryDataToken": ""
                                  }

//Test request failed
const userRequestFull = {
                          "Avatar": null,
                          "Id": null,
                          "Name": "",
                          "Password": "",
                          "ForceChangePassword": false,
                          "ChangePasswordEvery": 0,
                          "SessionsLimit": 0,
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

const binaryRequestFull = {
                            "File": null,
                            "AccessKind": 0,
                            "StorageKind": 0,
                            "Category": null,
                            "ExpireAt": null,
                            "Label": null,
                            "Tag": null,
                            "Context": null,
                            "Comment": null,
                            "ShareCode": null
                          }

let user01_at_TestL01_data = {} as any;
let user02_at_TestL01_data = {} as any;

let user01_at_TestL02_data = {} as any;
let user02_at_TestL02_data = {} as any;

let user98_at_TestL98_data = {} as any;

let upload_binary_data = {} as any; //{ "admin01@system.net_tiger" : { "Id": .... } }

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

async function call_tokenCheck( headers: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'POST',
                      headers: headers,
                      body: null, //JSON.stringify( body ),
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/security/authentication/token/check";

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

async function call_userSearch( headers: any,
                                params: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'GET',
                      headers: headers,
                      body: null,
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/user/search";

    let strQueryParams = "";

    if ( params.where ) {

      strQueryParams = "?where=" + params.where;

    }

    if ( params.orderBy ) {

      if ( strQueryParams ) {

        strRequestPath = strQueryParams + "&orderBy=" + params.orderBy;

      }
      else {

        strRequestPath = "?orderBy=" + params.orderBy;

      }

    }

    if ( params.offset ) {

      if ( strQueryParams ) {

        strRequestPath = strQueryParams + "&offset=" + params.offset;

      }
      else {

        strRequestPath = "?offset=" + params.orderBy;

      }

    }

    if ( params.limit ) {

      if ( strQueryParams ) {

        strRequestPath = strQueryParams + "&limit=" + params.limit;

      }
      else {

        strRequestPath = "?limit=" + params.limit;

      }

    }

    const callResult = await fetch( strRequestPath + strQueryParams,
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

async function call_userSearchCount( headers: any,
                                     params: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'GET',
                      headers: headers,
                      body: null,
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/user/search/count";

    let strQueryParams = "";

    if ( params.where ) {

      strQueryParams = "?where=" + params.where;

    }

    if ( params.orderBy ) {

      if ( strQueryParams ) {

        strRequestPath = strQueryParams + "&orderBy=" + params.orderBy;

      }
      else {

        strRequestPath = "?orderBy=" + params.orderBy;

      }

    }

    if ( params.offset ) {

      if ( strQueryParams ) {

        strRequestPath = strQueryParams + "&offset=" + params.offset;

      }
      else {

        strRequestPath = "?offset=" + params.orderBy;

      }

    }

    if ( params.limit ) {

      if ( strQueryParams ) {

        strRequestPath = strQueryParams + "&limit=" + params.limit;

      }
      else {

        strRequestPath = "?limit=" + params.limit;

      }

    }

    const callResult = await fetch( strRequestPath + strQueryParams,
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

async function call_change_password( headers: any, body: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'PUT',
                      body: JSON.stringify( body ),
                      headers: headers,
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/user/password/change";

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

async function call_deleteUser( headers: any, query: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'DELETE',
                      body: null, //JSON.stringify( body ),
                      headers: headers,
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/user?id="+query.Id+"&shortId="+query.ShortId+"&name="+query.Name;

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

    ( options as any ).body = query;

    result.input = options;

  }
  catch ( error ) {

    console.log( error );

  }

  return result;

}

async function call_deleteUserGroup( headers: any, query: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'DELETE',
                      body: null, //JSON.stringify( body ),
                      headers: headers,
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/usergroup?id="+query.Id+"&shortId="+query.ShortId+"&name="+query.Name;

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

    ( options as any ).body = query;

    result.input = options;

  }
  catch ( error ) {

    console.log( error );

  }

  return result;

}

async function call_createAuth( headers: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'POST',
                      body: null, //JSON.stringify( body ),
                      headers: headers,
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/binary/auth";

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

async function call_deleteAuth( headers: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'DELETE',
                      body: null, //JSON.stringify( body ),
                      headers: headers,
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/binary/auth";

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

async function call_binarySearch( headers: any,
                                  params: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'GET',
                      headers: headers,
                      body: null,
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/binary/search";

    let strQueryParams = "";

    if ( params.where ) {

      strQueryParams = "?where=" + params.where;

    }

    if ( params.orderBy ) {

      if ( strQueryParams ) {

        strRequestPath = strQueryParams + "&orderBy=" + params.orderBy;

      }
      else {

        strRequestPath = "?orderBy=" + params.orderBy;

      }

    }

    if ( params.offset ) {

      if ( strQueryParams ) {

        strRequestPath = strQueryParams + "&offset=" + params.offset;

      }
      else {

        strRequestPath = "?offset=" + params.orderBy;

      }

    }

    if ( params.limit ) {

      if ( strQueryParams ) {

        strRequestPath = strQueryParams + "&limit=" + params.limit;

      }
      else {

        strRequestPath = "?limit=" + params.limit;

      }

    }

    const callResult = await fetch( strRequestPath + strQueryParams,
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

async function call_binarySearchCount( headers: any,
                                       params: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'GET',
                      headers: headers,
                      body: null,
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/binary/search/count";

    let strQueryParams = "";

    if ( params.where ) {

      strQueryParams = "?where=" + params.where;

    }

    const callResult = await fetch( strRequestPath + strQueryParams,
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
async function call_uploadBinaryData( headers: any,
                                      body: FormData ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'POST',
                      body: body, //JSON.stringify( body ),
                      headers: headers,
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/binary";

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

async function call_downloadBinaryData( headers: any, query: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'GET',
                      body: null,
                      headers: headers,
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/binary?id=" + query.Id + "&auth=" + headers.BinaryDataToken + "&thumbnail=" + query.Thumbnail;

    const callResult = await fetch( strRequestPath,
                                    options );

    const strXBodyResponse = callResult.headers.get( "x-body-response" ) as any; //callResult.headers.raw()

    const jsonXBodyResponse = CommonUtilities.parseJSON( strXBodyResponse, null );

    const strPath = query.SavePath + '/' + jsonXBodyResponse.Name;

    fs.mkdirSync( query.SavePath, { recursive: true }  );

    const destinationFileStream = fs.createWriteStream( strPath );

    await new Promise( ( resolve: any, reject: any ) => {

      callResult.body.pipe( destinationFileStream ).on( 'close', () => { resolve( true ) } ); //Wait for the stream finish to write to file system

    } );

    result.output = callResult ? {
                                   status: callResult.status,
                                   statusText: callResult.statusText,
                                   body: jsonXBodyResponse
                                 }:
                                 {
                                  status: null,
                                  statusText: null,
                                  body: { Code: "" }
                                 };

    //( options as any ).body = jsonXBodyResponse; //callResult.headers[ "X-Body-Response" ];

    result.input = options;

  }
  catch ( error ) {

    console.log( error );

  }

  return result;

}

async function call_deleteBinaryData( headers: any,
                                      query: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'DELETE',
                      body: null, //query, //JSON.stringify( body ),
                      headers: headers,
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/binary?id=" + query.Id;

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

    ( options as any ).body = query;

    result.input = options;

  }
  catch ( error ) {

    console.log( error );

  }

  return result;

}

async function call_getBinaryDataDetails( headers: any,
                                          query: any ): Promise<any> {

  let result = { input: null, output: null };

  try {

    const options = {
                      method: 'GET',
                      body: null,
                      headers: headers,
                    };

    let strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

    strRequestPath = strRequestPath + "/system/binary/details?id=" + query.Id;

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

function formatSequence( intSequence: number ): string {

  let strResult = "";

  if ( intSequence < 10 ) {

    strResult = "00" + intSequence;

  }
  else if ( intSequence < 100 ) {

    strResult = "0" + intSequence;

  }
  else {

    strResult = intSequence.toString();

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
                                  strFileName: string,
                                  bIsFail: boolean ): Promise<boolean> {

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

      if ( bIsFail === false ) {

        const strAuthorization = result.output.body.Data[ 0 ].Authorization;

        headers.Authorization = strAuthorization;

        bResult = true;

      }
      else {

        bResult = true;

      }


    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_token( headers: any,
                                  strCode: string,
                                  strFileName: string ): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_tokenCheck( headers );

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) { //"SUCCESS_LOGIN"

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

export async function test_change_password( headers: any,
                                            userData: any,
                                            strCode: string,
                                            strFileName: string ): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_change_password( headers,
                                               userData );

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) {

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
                                                     strFileName: string,
                                                     bIsFail: boolean ): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_profile( headers );

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) { //"SUCCESS_GET_SESSION_PROFILE"

      if ( bIsFail === false ) {

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
      else {

        bResult = true;

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

export async function test_userSearch( headers: any,
                                       params: any,
                                       strCode: string,
                                       strFileName: string,
                                       intConditionType: number,
                                       intCount: number ): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_userSearch( headers,
                                          params );

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) {

      if ( intConditionType === 0 ) {       //<=

        bResult = result.output.body.Count <= intCount;

      }
      else if ( intConditionType === 1 ) {  //>=

        bResult = result.output.body.Count >= intCount;

      }
      else if ( intConditionType === 2 ) {  //===

        bResult = result.output.body.Count === intCount;

      }
      else if ( intConditionType === 3 ) {  //!==

        bResult = result.output.body.Count !== intCount;

      }

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_userSearchCount( headers: any,
                                            params: any,
                                            strCode: string,
                                            strFileName: string,
                                            intConditionType: number,
                                            intCount: number ): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_userSearchCount( headers,
                                               params );

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) {

      if ( intConditionType === 0 ) {       //<=

        bResult = result.output.body.Data[ 0 ].Count <= intCount;

      }
      else if ( intConditionType === 1 ) {  //>=

        bResult = result.output.body.Data[ 0 ].Count >= intCount;

      }
      else if ( intConditionType === 2 ) {  //===

        bResult = result.output.body.Data[ 0 ].Count === intCount;

      }
      else if ( intConditionType === 3 ) {  //!==

        bResult = result.output.body.Data[ 0 ].Count !== intCount;

      }

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

export async function test_createAuth( headers: any,
                                       strCode: string,
                                       strFileName: string,
                                       bIsFail: boolean ): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_createAuth( headers );

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) {

      if ( bIsFail === false ) {

        const strAuth = result.output.body.Data[ 0 ].Auth;

        headers.BinaryDataToken = strAuth;

        bResult = true;

      }
      else {

        bResult = true;

      }


    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_deleteAuth( headers: any,
                                       strCode: string,
                                       strFileName: string,
                                       bIsFail: boolean ): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_deleteAuth( headers );

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) {

      if ( bIsFail === false ) {

        headers.BinaryDataToken = null;

        bResult = true;

      }
      else {

        bResult = true;

      }

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_uploadImageTiger( headers: any,
                                             strCode: string,
                                             strFileName: string,
                                             strUploadBinaryDataKey: string ): Promise<boolean> {

  let bResult = false;

  try {

    //const binaryRequest = { ... binaryRequestFull }; //Copy original information
    const strPath = SystemUtilities.baseRootPath +
                    "/test/input/data/images/tiger.jpg";

    const strFileCheckSum = await SystemUtilities.getFileHash( strPath, "md5", null );

    const binaryRequest = new FormData();

    binaryRequest.append( "File", fs.createReadStream( strPath ) );
    binaryRequest.append( "AccessKind", "2" );  //1 = Public, 2 = Authenticated, 3 = Role
    binaryRequest.append( "StorageKind", "0" ); //0 = Persistent 1 = Temporal
    binaryRequest.append( "Category", "Test" );
    binaryRequest.append( "Label", "Tiger File" );
    binaryRequest.append( "Tag", "#Tiger#,#Image#,#Test#" );
    binaryRequest.append( "Context", JSON.stringify( { "MyData": "Tiger" } ) );
    binaryRequest.append( "Comment", "A tiger image..." );

    let headersMultipart = { ...headers, ...binaryRequest.getHeaders() }; //"multipart/form-data";

    delete headersMultipart[ "Content-Type" ];

    const result = await call_uploadBinaryData( headersMultipart, binaryRequest ); //This request must be fail

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) {

      upload_binary_data[ strUploadBinaryDataKey ] = result.output.body.Data[ 0 ];
      upload_binary_data[ strUploadBinaryDataKey ].FileCheckSum = "md5://" + strFileCheckSum;
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}


export async function test_uploadImageTower( headers: any,
                                             strCode: string,
                                             strFileName: string,
                                             strUploadBinaryDataKey: string ): Promise<boolean> {

  let bResult = false;

  try {

    //const binaryRequest = { ... binaryRequestFull }; //Copy original information
    const strPath = SystemUtilities.baseRootPath +
                    "/test/input/data/images/tower.jpg";

    const strFileCheckSum = await SystemUtilities.getFileHash( strPath, "md5", null );

    const binaryRequest = new FormData();

    binaryRequest.append( "File", fs.createReadStream( strPath ) );
    binaryRequest.append( "AccessKind", "2" );  //1 = Public, 2 = Authenticated, 3 = Role
    binaryRequest.append( "StorageKind", "0" ); //0 = Persistent 1 = Temporal
    binaryRequest.append( "Category", "Test" );
    binaryRequest.append( "Label", "Tower File" );
    binaryRequest.append( "Tag", "#Tower#,#Image#,#Test#" );
    binaryRequest.append( "Context", JSON.stringify( { "MyData": "Tower" } ) );
    binaryRequest.append( "Comment", "A tower image..." );

    let headersMultipart = { ...headers, ...binaryRequest.getHeaders() }; //"multipart/form-data";

    delete headersMultipart[ "Content-Type" ];

    const result = await call_uploadBinaryData( headersMultipart, binaryRequest ); //This request must be fail

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) {

      upload_binary_data[ strUploadBinaryDataKey ] = result.output.body.Data[ 0 ];
      upload_binary_data[ strUploadBinaryDataKey ].FileCheckSum = "md5://" + strFileCheckSum;
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_uploadImageRoad( headers: any,
                                            strCode: string,
                                            strFileName: string,
                                            strUploadBinaryDataKey: string ): Promise<boolean> {

  let bResult = false;

  try {

    //const binaryRequest = { ... binaryRequestFull }; //Copy original information
    const strPath = SystemUtilities.baseRootPath +
                    "/test/input/data/images/road.jpg";

    const binaryRequest = new FormData();

    binaryRequest.append( "File", fs.createReadStream( strPath ) );
    binaryRequest.append( "AccessKind", "2" );  //1 = Public, 2 = Authenticated, 3 = Role
    binaryRequest.append( "StorageKind", "0" ); //0 = Persistent 1 = Temporal
    binaryRequest.append( "Category", "Test" );
    binaryRequest.append( "Label", "Road File" );
    binaryRequest.append( "Tag", "#Road#,#Image#,#Test#" );
    binaryRequest.append( "Context", JSON.stringify( { "MyData": "Road" } ) );
    binaryRequest.append( "Comment", "A road image..." );

    let headersMultipart = { ...headers, ...binaryRequest.getHeaders() }; //"multipart/form-data";

    delete headersMultipart[ "Content-Type" ];

    const result = await call_uploadBinaryData( headersMultipart, binaryRequest ); //This request must be fail

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) {

      upload_binary_data[ strUploadBinaryDataKey ] = result.output.body.Data[ 0 ];
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_uploadImageCastle( headers: any,
                                              strCode: string,
                                              strFileName: string,
                                              strUploadBinaryDataKey: string ): Promise<boolean> {

  let bResult = false;

  try {

    //const binaryRequest = { ... binaryRequestFull }; //Copy original information
    const strPath = SystemUtilities.baseRootPath +
                    "/test/input/data/images/castle.jpg";

    const binaryRequest = new FormData();

    binaryRequest.append( "File", fs.createReadStream( strPath ) );
    binaryRequest.append( "AccessKind", "2" );  //1 = Public, 2 = Authenticated, 3 = Role
    binaryRequest.append( "StorageKind", "0" ); //0 = Persistent 1 = Temporal
    binaryRequest.append( "Category", "Test" );
    binaryRequest.append( "Label", "Castle File" );
    binaryRequest.append( "Tag", "#Castle#,#Image#,#Test#" );
    binaryRequest.append( "Context", JSON.stringify( { "MyData": "Castle" } ) );
    binaryRequest.append( "Comment", "A castle image..." );

    let headersMultipart = { ...headers, ...binaryRequest.getHeaders() }; //"multipart/form-data";

    delete headersMultipart[ "Content-Type" ];

    const result = await call_uploadBinaryData( headersMultipart, binaryRequest ); //This request must be fail

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) {

      upload_binary_data[ strUploadBinaryDataKey ] = result.output.body.Data[ 0 ];
      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_downloadImageThumbnail( headers: any,
                                                   strCode: string,
                                                   strFileName: string,
                                                   strUploadBinaryDataKey: string ): Promise<boolean> {

  let bResult = false;

  try {

    const strPath = SystemUtilities.baseRootPath +
                    "/test/standalone/result/" +
                    os.hostname + "/" +
                    SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_08 ) +
                    "/data/" + strUploadBinaryDataKey + "_thumbnail";

    const result = await call_downloadBinaryData( headers,
                                                  {
                                                    Id: upload_binary_data[ strUploadBinaryDataKey ].Id,
                                                    Thumbnail: 1,
                                                    SavePath: strPath
                                                  } ); //This request must be success

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) {

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_downloadImage( headers: any,
                                          strCode: string,
                                          strFileName: string,
                                          strUploadBinaryDataKey: string,
                                          strCheckSum: string ): Promise<boolean> {

  let bResult = false;

  try {

    const strPath = SystemUtilities.baseRootPath +
                    "/test/standalone/result/" +
                    os.hostname + "/" +
                    SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_08 ) +
                    "/data/" + strUploadBinaryDataKey + "_full";

    const result = await call_downloadBinaryData( headers,
                                                  {
                                                    Id: upload_binary_data[ strUploadBinaryDataKey ].Id,
                                                    Thumbnail: 0,
                                                    SavePath: strPath
                                                  } ); //This request must be success

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) {

      if ( strCheckSum ) {

        const checkSum = strCheckSum.split( "://" );

        const strCalculatedCheckSum = await SystemUtilities.getFileHash( strPath + "/" + result.output.body.Name, checkSum[ 0 ], null );

        if ( strCalculatedCheckSum === checkSum[ 1 ] ) {

          bResult = true;

        }

      }
      else if ( upload_binary_data[ strUploadBinaryDataKey ].FileCheckSum ) {

        const checkSum = upload_binary_data[ strUploadBinaryDataKey ].FileCheckSum.split( "://" );

        const strCalculatedCheckSum = await SystemUtilities.getFileHash( strPath + "/" + result.output.body.Name, checkSum[ 0 ], null );

        if ( strCalculatedCheckSum === checkSum[ 1 ] ) {

          bResult = true;

        }

      }
      else {

        bResult = true;

      }

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_deleteImage( headers: any,
                                        strCode: string,
                                        strFileName: string,
                                        strUploadBinaryDataKey: string ): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_deleteBinaryData( headers,
                                                {
                                                  Id: upload_binary_data[ strUploadBinaryDataKey ].Id,
                                                } ); //This request must be success

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) {

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_getImageDetails( headers: any,
                                            strCode: string,
                                            strFileName: string,
                                            strUploadBinaryDataKey: string ): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_getBinaryDataDetails( headers,
                                                    {
                                                      Id: upload_binary_data[ strUploadBinaryDataKey ].Id,
                                                    } ); //This request must be success

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) {

      bResult = true;

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_binarySearch( headers: any,
                                         params: any,
                                         strCode: string,
                                         strFileName: string,
                                         intConditionType: number,
                                         intCount: number ): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_binarySearch( headers,
                                            params );

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) {

      if ( intConditionType === 0 ) {       //<=

        bResult = result.output.body.Count <= intCount;

      }
      else if ( intConditionType === 1 ) {  //>=

        bResult = result.output.body.Count >= intCount;

      }
      else if ( intConditionType === 2 ) {  //===

        bResult = result.output.body.Count === intCount;

      }
      else if ( intConditionType === 3 ) {  //!==

        bResult = result.output.body.Count !== intCount;

      }

    }

  }
  catch ( error ) {

    console.log( error );

  }

  return bResult;

}

export async function test_binarySearchCount( headers: any,
                                              params: any,
                                              strCode: string,
                                              strFileName: string,
                                              intConditionType: number,
                                              intCount: number ): Promise<boolean> {

  let bResult = false;

  try {

    const result = await call_binarySearchCount( headers,
                                                 params );

    saveInput( strFileName, result.input );
    result.output.expected = { Code: strCode };
    saveResult( strFileName, result.output );

    if ( result &&
         result.output.body.Code === strCode ) {

      if ( intConditionType === 0 ) {       //<=

        bResult = result.output.body.Data[ 0 ].Count <= intCount;

      }
      else if ( intConditionType === 1 ) {  //>=

        bResult = result.output.body.Data[ 0 ].Count >= intCount;

      }
      else if ( intConditionType === 2 ) {  //===

        bResult = result.output.body.Data[ 0 ].Count === intCount;

      }
      else if ( intConditionType === 3 ) {  //!==

        bResult = result.output.body.Data[ 0 ].Count !== intCount;

      }

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

export function checkTokens( strCurrentTokens: string,
                             strTokensToCheck: string ): boolean {

  //let bResult = false;

  return CommonUtilities.isInMultiSimpleList( strCurrentTokens,
                                              ",",
                                              strTokensToCheck,
                                              false,
                                              null );

  //return bResult;

}

export async function test_createUser_user98_at_TestL98( headers: any,
                                                         strCode: string,
                                                         strFileName: string,
                                                         bIsFail: boolean,
                                                         bCreateUserGroup: boolean,
                                                         bMustBeEmptyRoleAndTag: boolean ): Promise<boolean> {

  let bResult = false;

  try {

    const userRequest = { ... userRequestFull }; //Copy original information

    userRequest.Name = "user98@TestL98";
    userRequest.Password = "12345678";
    userRequest.Role = "#MasterL01#"; //This role can be ignored if bMustBeEmptyRoleAndTag === true
    userRequest.Tag = "#Tag01#,#Tag02#"; //This tag can be ignored if bMustBeEmptyRoleAndTag === true
    userRequest.sysUserGroup.Create = bCreateUserGroup;    //Ask to create
    userRequest.sysUserGroup.Name = null; //Create a group with name of user98@TestL98
    userRequest.sysUserGroup.Role = "#MasterL01#"; //This role can be ignored if bMustBeEmptyRoleAndTag === true
    userRequest.sysUserGroup.Tag = "#Tag11#,#Tag12#"; //This tag can be ignored if bMustBeEmptyRoleAndTag === true
    userRequest.Business.Role = "#Role01#,#Role02#";
    userRequest.Business.Tag = "#Tag01#,#Tag02#";

    const result = await call_createUser( headers, userRequest ); //This request must be success

    saveInput( strFileName, result.input ); //"test_createUser_user98_at_TestL98_success"
    result.output.expected = { Code: strCode }; //"SUCCESS_USER_CREATE"
    saveResult( strFileName, result.output ); //"test_createUser_user98_at_TestL98_success"

    if ( result &&
         result.output.body.Code === strCode ) { //"SUCCESS_USER_CREATE"

      if ( bIsFail === false ) {

        user98_at_TestL98_data = result.output.body.Data[ 0 ];

        if ( bMustBeEmptyRoleAndTag ) {

          if ( //!user98_at_TestL98_data.Role &&
               checkTokens( user98_at_TestL98_data.Role, "#MasterL01#" ) === false &&
               !user98_at_TestL98_data.Tag &&
               //!user98_at_TestL98_data.sysUserGroup.Role &&
               checkTokens( user98_at_TestL98_data.SYSUserGroup.Role, "#MasterL01#" ) === false &&
               !user98_at_TestL98_data.sysUserGroup.Tag &&
               user98_at_TestL98_data.Business.Role === "#Role01#,#Role02#" &&
               user98_at_TestL98_data.Business.Tag === "#Tag01#,#Tag02#" &&
               user98_at_TestL98_data.sysUserGroup.Name === "user98@TestL98" ) {

            user98_at_TestL98_data.Password = userRequest.Password;
            bResult = true;

          }

        }
        else {

          if ( //user98_at_TestL98_data.Role === "#MasterL01#" &&
               checkTokens( user98_at_TestL98_data.Role, "#MasterL01#" ) &&
               user98_at_TestL98_data.Tag === "#Tag01#,#Tag02#" &&
               //user98_at_TestL98_data.sysUserGroup.Role === "#MasterL01#" &&
               checkTokens( user98_at_TestL98_data.sysUserGroup.Role, "#MasterL01#" ) &&
               user98_at_TestL98_data.sysUserGroup.Tag === "#Tag11#,#Tag12#" &&
               user98_at_TestL98_data.Business.Role === "#Role01#,#Role02#" &&
               user98_at_TestL98_data.Business.Tag === "#Tag01#,#Tag02#" &&
               user98_at_TestL98_data.sysUserGroup.Name === "user98@TestL98" ) {

            user98_at_TestL98_data.Password = userRequest.Password;
            bResult = true;

          }

        }

      }
      else {

        bResult = true;

      }

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
    userRequest.Role = "#MasterL01#"; //This roles must be NOT ignored
    userRequest.Tag = "#Tag11#,#Tag12#"; //This tags must be NOT ignored
    userRequest.sysUserGroup.Create = true;    //Ask to create
    userRequest.sysUserGroup.Name = "TestL01";    //This group not exists
    userRequest.sysUserGroup.Role = "";  //This roles must be NOT ignored
    userRequest.sysUserGroup.Tag = ""; //This tags must be NOT ignored
    userRequest.Business.Role = "#Role01#,#Role02#";
    userRequest.Business.Tag = "#Tag01#,#Tag02#";

    const result = await call_createUser( headers, userRequest ); //This request must be success

    saveInput( "test_createUser_user01_at_TestL01_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_CREATE" };
    saveResult( "test_createUser_user01_at_TestL01_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_CREATE" ) {

      user01_at_TestL01_data = result.output.body.Data[ 0 ];

      if ( //user01_at_TestL01_data.Role === "#MasterL01#" &&
           checkTokens( user01_at_TestL01_data.Role, "#MasterL01#" ) &&
           user01_at_TestL01_data.Tag === "#Tag11#,#Tag12#" &&
           //!user01_at_TestL01_data.sysUserGroup.Role &&
           checkTokens( user01_at_TestL01_data.sysUserGroup.Role, "#MasterL01#" ) === false &&
           !user01_at_TestL01_data.sysUserGroup.Tag &&
           user01_at_TestL01_data.Business.Role === "#Role01#,#Role02#" &&
           user01_at_TestL01_data.Business.Tag === "#Tag01#,#Tag02#" &&
           user01_at_TestL01_data.sysUserGroup.Name === "TestL01" ) {

        user01_at_TestL01_data.Password = userRequest.Password;
        bResult = true;

      }

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
    userRequest.Role = "#MasterL03#+#GName:TestL01#+#GName:TestL02#";
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
    userRequest.Role = "#MasterL03#+#GName:TestL01#+#GName:TestL02#"; //<---- This roles must be ignored
    userRequest.Tag = "#Tag01#"; //<---- This tag must be ignored
    userRequest.sysUserGroup.Create = false;         //Ask to create
    userRequest.sysUserGroup.Name = "TestL02";       //This group must exists
    userRequest.sysUserGroup.Role = "#Administrator#,#BManagerL99#"; //<---- This roles must be ignored
    userRequest.sysUserGroup.Tag = "#Tag02#"; //<---- This tag must be ignored
    userRequest.Business.Role = "#Role20#,#Role21#"; //<---- This roles must be ignored
    userRequest.Business.Tag = "#Tag20#,#Tag21#"; //<---- This roles must be ignored

    const result = await call_createUser( headers, userRequest ); //This request must be success

    saveInput( "test_createUser_user02_at_TestL02_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_CREATE" };
    saveResult( "test_createUser_user02_at_TestL02_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_CREATE" ) {

      user02_at_TestL02_data = result.output.body.Data[ 0 ];

      if ( user02_at_TestL02_data.Name === "user02@TestL02" &&
           user02_at_TestL02_data.sysUserGroup.Name === "TestL02" &&
           //!user02_at_TestL02_data.Role &&
           checkTokens( user02_at_TestL02_data.Role, "#MasterL03#+#GName:TestL01#+#GName:TestL02#" ) === false &&
           !user02_at_TestL02_data.Tag &&
           //!user02_at_TestL02_data.sysUserGroup.Role &&
           checkTokens( user02_at_TestL02_data.sysUserGroup.Role, "#Administrator#,#BManagerL99#" ) === false &&
           !user02_at_TestL02_data.sysUserGroup.Tag ) {

        user02_at_TestL02_data.Password = userRequest.Password;
        bResult = true;

      }

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
    userRequest.Name = "user99@TestL01";
    userRequest.Password = "123456789";
    userRequest.Role = "#MasterL01#,#Administrator#,#BManagerL99#"; //<-- This role must be ignored
    userRequest.Tag = "#Tag01#";  //<-- This tag must be ignored
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
    userRequest.sysUserGroup.Role = "#MasterL01#,#Administrator#,#BManagerL99#"; //<-- This role must be ignored
    userRequest.sysUserGroup.Tag = "#Tag01#";  //<-- This tag must be ignored
    userRequest.Business = userData.Business;

    let result = await call_updateUser( headers, userRequest ); //This request must be success

    saveInput( "test_updateUser_user02_at_TestL02_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_UPDATE" };
    saveResult( "test_updateUser_user02_at_TestL02_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_UPDATE" ) {

      user02_at_TestL02_data = result.output.body.Data[ 0 ];

      if ( user02_at_TestL02_data.Name === "user99@TestL01" &&
           user02_at_TestL02_data.sysUserGroup.Name === "TestL01" &&
           //!user02_at_TestL02_data.Role &&
           checkTokens( user02_at_TestL02_data.Role, "#MasterL01#,#Administrator#,#BManagerL99#" ) === false &&
           !user02_at_TestL02_data.Tag &&
           //!user02_at_TestL02_data.sysUserGroup.Role &&
           checkTokens( user02_at_TestL02_data.sysUserGroup.Role, "#MasterL01#,#Administrator#,#BManagerL99#" ) === false &&
           !user02_at_TestL02_data.sysUserGroup.Tag ) {

          user02_at_TestL02_data.Password = userRequest.Password;
          bResult = true;

      }

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

    const userRequest = { ... userRequestFull } as any; //Copy original information

    userRequest.Notify = "";
    userRequest.Avatar = "";
    userRequest.Id = userData.Id;
    userRequest.ShortId = "";
    userRequest.ExpireAt = "";
    userRequest.Name = "user01@TestL01";
    userRequest.Password = "123456789";
    userRequest.Role = "#MasterL01#,#Administrator#,#BManagerL99#"; //<-- This role is ignored
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
    userRequest.sysUserGroup.Name = "TestL01";    //This group already exists
    userRequest.sysUserGroup.Role = "#MasterL01#,#Administrator#,#BManagerL99#"; //<-- This role is ignored
    userRequest.sysUserGroup.Tag = "#Tag11#";  //<-- This tag is ignored
    userRequest.Business = userData.Business;

    let result = await call_updateUser( headers, userRequest ); //This request must be success

    saveInput( "test_updateUser_user02_at_TestL02_fail", result.input );
    result.output.expected = { Code: "ERROR_USER_NAME_ALREADY_EXISTS" };
    saveResult( "test_updateUser_user02_at_TestL02_fail", result.output );

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

export async function test_updateUser_user99_at_TestL01_success( headers: any, userData: any ): Promise<boolean> {

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
    userRequest.ForceChangePassword = 1;
    userRequest.Role = "#MasterL01#,#Administrator#,#BManagerL99#"; //<-- This role must be ignored
    userRequest.Tag = "#Tag01#";  //<-- This tag must be ignored
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
    userRequest.sysUserGroup.Role = "#MasterL01#,#Administrator#,#BManagerL99#"; //<-- This role must be ignored
    userRequest.sysUserGroup.Tag = "#Tag01#";  //<-- This tag must be ignored
    userRequest.Business = userData.Business;

    let result = await call_updateUser( headers, userRequest ); //This request must be success

    saveInput( "test_updateUser_user99_at_TestL01_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_UPDATE" };
    saveResult( "test_updateUser_user99_at_TestL01_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_UPDATE" ) {

      user02_at_TestL02_data = result.output.body.Data[ 0 ];

      if ( user02_at_TestL02_data.Name === "user02@TestL02" &&
           user02_at_TestL02_data.sysUserGroup.Name === "TestL02" &&
           //!user02_at_TestL02_data.Role &&
           checkTokens( user02_at_TestL02_data.Role, "#MasterL01#,#Administrator#,#BManagerL99#" ) === false &&
           !user02_at_TestL02_data.Tag &&
           //!user02_at_TestL02_data.sysUserGroup.Role &&
           checkTokens( user02_at_TestL02_data.sysUserGroup.Role, "#MasterL01#,#Administrator#,#BManagerL99#" ) === false &&
           !user02_at_TestL02_data.sysUserGroup.Tag ) {

        user02_at_TestL02_data.Password = userRequest.Password;
        bResult = true;

      }

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
    userRequest.Tag = "#Tag11#,#Tag12#";
    userRequest.sysUserGroup.Create = false;    //Ask to create
    userRequest.sysUserGroup.Name = "TestL01";    //This group already exists
    userRequest.sysUserGroup.Role = "#Administrator#,#BManagerL99#";
    userRequest.sysUserGroup.Tag = "#Tag01#,#Tag02#";
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
    userRequest.Tag = "#Tag11#,#Tag12#";
    userRequest.sysUserGroup.Create = true;    //Ask to create
    userRequest.sysUserGroup.Name = "TestL01";    //This group already exists
    userRequest.sysUserGroup.Role = "#Administrator#,#BManagerL99#";
    userRequest.sysUserGroup.Tag = "#Tag01#,#Tag02#";
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
    result.output.expected = { Code: "SUCCESS_USER_UPDATE" };
    saveResult( "test_updateUser_user01_at_TestL01_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_UPDATE" ) {

      user01_at_TestL01_data = result.output.body.Data[ 0 ];

      if ( user01_at_TestL01_data.Name === "user99@TestL02" &&
           user01_at_TestL01_data.sysUserGroup.Name === "TestL02" ) {

        user01_at_TestL01_data.Password = userRequest.Password;
        bResult = true;

      }

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
    userRequest.Name = "user01@TestL01";
    userRequest.Password = "123456789";
    userRequest.Role = "#MasterL01#"; //This role must be NOT ignored
    userRequest.Tag = "#Tag01#"; //This tag must be NOT ignored
    userRequest.SessionsLimit = 1;
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
    userRequest.sysUserGroup.Role = ""; //This role must be NOT ignored
    userRequest.sysUserGroup.Tag = ""; //This tag must be NOT ignored
    userRequest.Business = userData.Business;

    let result = await call_updateUser( headers, userRequest ); //This request must be success

    saveInput( "test_updateUser_user99_at_TestL02_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_UPDATE" };
    saveResult( "test_updateUser_user99_at_TestL02_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_UPDATE" ) {

      user01_at_TestL01_data = result.output.body.Data[ 0 ];

      if ( user01_at_TestL01_data.Name === "user01@TestL01" &&
           user01_at_TestL01_data.sysUserGroup.Name === "TestL01" &&
           checkTokens( user01_at_TestL01_data.Role, "#MasterL01#" ) &&
           //!user01_at_TestL01_data.Role &&
           !user01_at_TestL01_data.sysUserGroup.Role &&
           !user01_at_TestL01_data.sysUserGroup.Tag ) {

        user01_at_TestL01_data[ "Password" ] = userRequest.Password; //Save the current password to make login later
        bResult = true;

      }

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
    userRequest.Role = "#MasterL01#,#Administrator#,#BManagerL99#"; //<-- This role is ignored
    userRequest.Tag = "#Tag01#,#Tag02#"; //<-- This tag is ignored
    userRequest.sysUserGroup.Create = false;
    userRequest.sysUserGroup.Name = "TestL01";    //This group not exists
    userRequest.sysUserGroup.Role = "#MasterL01#,#Administrator#,#BManagerL99#"; //<-- This role is ignored
    userRequest.sysUserGroup.Tag = "#Tag01#,#Tag02#"; //<-- This tag is ignored
    userRequest.Business.Role = "#Role03#,#Role04#";
    userRequest.Business.Tag = "#Tag03#,#Tag04#";

    const result = await call_createUser( headers, userRequest ); //This request must be success

    saveInput( "test_createUser_user02_at_TestL01_success", result.input );
    result.output.expected = { Code: "SUCCESS_USER_CREATE" };
    saveResult( "test_createUser_user02_at_TestL01_success", result.output );

    if ( result &&
         result.output.body.Code === "SUCCESS_USER_CREATE" ) {

      user02_at_TestL01_data = result.output.body.Data[ 0 ];

      if ( //!user02_at_TestL01_data.Role &&
           checkTokens( user02_at_TestL01_data.Role, "#MasterL01#,#Administrator#,#BManagerL99#" ) === false &&
           !user02_at_TestL01_data.Tag &&
           //!user02_at_TestL01_data.sysUserGroup.Role &&
           checkTokens( user02_at_TestL01_data.sysUserGroup.Role, "#MasterL01#,#Administrator#,#BManagerL99#" ) === false &&
           !user02_at_TestL01_data.sysUserGroup.Tag &&
           userRequest.Business.Role === "#Role03#,#Role04#" &&
           userRequest.Business.Tag === "#Tag03#,#Tag04#" ) {

        user02_at_TestL01_data.Password = userRequest.Password;
        bResult = true;

      }

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
    userRequest.Role = "#MasterL01#,#Administrator#,#BManagerL99#"; //<-- This role is ignored
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

    console.log( chalk.blue( ">******************** admin01@system.net ********************<" ) );

    myAssert( await test_login( headers_admin01_at_system_net,
                                {
                                  Name: strUser_admin01_at_system_net,
                                  Password: strPassword_admin01_at_system_net + "1" //Force to fail the login
                                },
                                "ERROR_LOGIN_FAILED",
                                "test_login_admin01@system_net_fail",
                                true ),
              '185E24354C2F: Login with user admin01@system.net is OK with the fail',
              '185E24354C2F: Login with user admin01@system.net is FAILED' );

    myAssert( await test_login( headers_admin01_at_system_net,
                                {
                                  Name: strUser_admin01_at_system_net,
                                  Password: strPassword_admin01_at_system_net
                                },
                                "SUCCESS_LOGIN",
                                "test_login_admin01@system_net_success",
                                false ),
              'EF56F748EC63: Login with user admin01@system.net is OK',
              'EF56F748EC63: Login with user admin01@system.net is FAILED' );

    try {

      myAssert( await test_uploadImageTiger( headers_admin01_at_system_net,
                                               "SUCCESS_BINARY_DATA_UPLOAD",
                                               "test_uploadImageTiger_admin01@system.net_success",
                                               "admin01@system.net_tiger" ),
                "5143BE7B1AE1: upload image tiger is OK",
                "5143BE7B1AE1: upload image tiger is FAILED" );

      myAssert( await test_createAuth( headers_admin01_at_system_net,
                                       "SUCCESS_AUTH_TOKEN_CREATED",
                                       "test_createAuth_admin01@system.net_success",
                                       false ),
                "79991E80365A: create auth admin01@system.net is OK",
                "79991E80365A: create auth admin01@system.net is FAILED" );

      myAssert( await test_downloadImageThumbnail( headers_admin01_at_system_net,
                                                     "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                     "test_downloadImageTigerThumbnail_admin01@system.net_success",
                                                     "admin01@system.net_tiger" ),
                "D8C8CF834EE9: download image thumbnail tiger admin01@system.net is OK",
                "D8C8CF834EE9: download image thumbnail tiger admin01@system.net is FAILED" );

      myAssert( await test_downloadImage( headers_admin01_at_system_net,
                                           "SUCCESS_BINARY_DATA_DOWNLOAD",
                                           "test_downloadImageTiger_admin01@system.net_success",
                                           "admin01@system.net_tiger",
                                           null ),
                "4E99438DE0A9: download image tiger admin01@system.net is OK",
                "4E99438DE0A9: download image tiger admin01@system.net is FAILED" );

      myAssert( await test_getImageDetails( headers_admin01_at_system_net,
                                              "SUCCESS_GET_INFORMATION",
                                              "test_getImageDetailsTiger_admin01@system.net_success",
                                              "admin01@system.net_tiger" ),
                "4D93C17B6B3C: get image details tiger admin01@system.net is OK",
                "4D93C17B6B3C: get image details tiger admin01@system.net is FAILED" );

      myAssert( await test_deleteUser( headers_admin01_at_system_net,
                                       { Name: "noexists@systems.net" },
                                       "ERROR_USER_NOT_FOUND",
                                       "test_deleteUser_noexists@systems.net_fail" ),
                '53CCEE8DDB93: Delete of the user noexists@systems.net is OK with the fail',
                '53CCEE8DDB93: Delete of the user noexists@systems.net is FAILED' );

      //Fail to create the user user98@TestL98 because the user group user98_at_TestL98 not exists and Create = false in the section sysUserGroup
      myAssert( await test_createUser_user98_at_TestL98( headers_admin01_at_system_net,
                                                         "ERROR_USER_GROUP_NOT_FOUND",
                                                         "test_createUser_user98_at_TestL98_fail",
                                                         true,
                                                         false, //<--- Not auto create the group and the group no exists
                                                         false ),
                'B7A8462E0A10: Creation of the user user98@TestL98 is OK with the fail',
                'B7A8462E0A10: Creation of the user user98@TestL98 is FAILED' );

      //*** Create user user98@TestL98 ***
      //*** Create user group user98@TestL98 ***
      myAssert( await test_createUser_user98_at_TestL98( headers_admin01_at_system_net,
                                                         "SUCCESS_USER_CREATE",
                                                         "test_createUser_user98_at_TestL98_success",
                                                         false,
                                                         true, //<--- Auto create the group user98@TestL98
                                                         false ),
                '8CF2731F0EC9: Creation of the user user98@TestL98 is OK',
                '8CF2731F0EC9: Creation of the user user98@TestL98 is FAILED' );

      myAssert( await test_deleteUser( headers_admin01_at_system_net,
                                       { Name: "user98@TestL98" },
                                       "SUCCESS_USER_DELETE",
                                       "test_deleteUser_user98@TestL98_success" ),
                'C98802C4C4F0: Delete of the user user98@TestL98 is OK',
                'C98802C4C4F0: Delete of the user user98@TestL98 is FAILED' );

      //Fail because the field Create = true in the section sysUserGroup
      myAssert( await test_createUser_user98_at_TestL98( headers_admin01_at_system_net,
                                                         "ERROR_USER_GROUP_ALREADY_EXISTS",
                                                         "test_createUser_user98_at_TestL98_fail",
                                                         true,
                                                         true, //<--- Fail to try to create the group again
                                                         false ),
                'C69088FEAC85: Creation of the user user98@TestL98 is OK with the fail',
                'C69088FEAC85: Creation of the user user98@TestL98 is FAILED' );

      //Success because the field Create = false in the section sysUserGroup
      myAssert( await test_createUser_user98_at_TestL98( headers_admin01_at_system_net,
                                                         "SUCCESS_USER_CREATE",
                                                         "test_createUser_user98_at_TestL98_success",
                                                         false,
                                                         false, //<--- NOT try to create the group
                                                         false ),
                '0E21DC94A0AE: Creation of the user user98@TestL98 is OK with the fail',
                '0E21DC94A0AE: Creation of the user user98@TestL98 is FAILED' );

      //Fail because the group is not empty, contains the user user98@TestL98
      myAssert( await test_deleteUserGroup( headers_admin01_at_system_net,
                                            { Name: "user98@TestL98" },
                                            "ERROR_USER_GROUP_IS_NOT_USER_EMPTY",
                                            "test_deleteUserGroup_user98@TestL98_fail" ),
                '84BC2BB9654B: Delete of the user group user98@TestL98 is OK with the fail',
                '84BC2BB9654B: Delete of the user group user98@TestL98 is FAILED' );

      //Delete the user user98@TestL98 the next test not fail
      myAssert( await test_deleteUser( headers_admin01_at_system_net,
                                       { Name: "user98@TestL98" },
                                       "SUCCESS_USER_DELETE",
                                       "test_deleteUser_user98@TestL98_success" ),
                '4BEA7143A94E: Delete of the user user98@TestL98 is OK',
                '4BEA7143A94E: Delete of the user user98@TestL98 is FAILED' );

      //Success because the group is now empty
      myAssert( await test_deleteUserGroup( headers_admin01_at_system_net,
                                            { Name: "user98@TestL98" },
                                            "SUCCESS_USER_GROUP_DELETE",
                                            "test_deleteUserGroup_user98@TestL98_success" ),
                'A878B5F98A65: Delete of the user group user98@TestL98 is OK',
                'A878B5F98A65: Delete of the user group user98@TestL98 is FAILED' );

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
      //Change the user group name from TestL01 => TestL02
      myAssert( await test_updateUser_user01_at_TestL01_success( headers_admin01_at_system_net, user01_at_TestL01_data ),
                '7A15DFC05C45: Update of the user user01@TestL01 is OK',
                '7A15DFC05C45: Update of the user user01@TestL01 is FAILED' );

      //Try to change the name of the user from user99@TestL02 -> user01@TestL01 BUT
      //Fail because try again to create the userGroup TestL02, the field create of section sysGroup is true.
      myAssert( await test_updateUser_user99_at_TestL02_fail( headers_admin01_at_system_net, user01_at_TestL01_data ),
                'F51C021137D4: Update of the user user99@TestL02 is OK with the fail',
                'F51C021137D4: Update of the user user99@TestL02 is FAILED' );

      //Change the name of the user from user99@TestL02 -> user01@TestL01
      //Change the user group from TestL02 => TestL01, the field create of section sysGroup is false.
      //Restricted the number of session to one sysUser.SessionsLimit = 1
      myAssert( await test_updateUser_user99_at_TestL02_success( headers_admin01_at_system_net, user01_at_TestL01_data ),
                '84945A9B59D0: Update of the user user02@TestL02 is OK',
                '84945A9B59D0: Update of the user user02@TestL02 is FAILED' );

      myAssert( await test_userSearch( headers_admin01_at_system_net,
                {  },
                "SUCCESS_SEARCH",
                "test_search_admin01@system.net_success",
                1,
                5 ),
               'FA89A381FFA5: Search of the user admin01@system.net is OK',
               'FA89A381FFA5: Search of the user admin01@system.net is FAILED' );

      myAssert( await test_userSearchCount( headers_admin01_at_system_net,
                {  },
                "SUCCESS_SEARCH_COUNT",
                "test_search_admin01@system.net_success",
                1,
                5 ),
               '95F1AB5D6C89: Search count of the user admin01@system.net is OK',
               '95F1AB5D6C89: Search count of the user admin01@system.net is FAILED' );

      try {

        console.log( chalk.blue( ">******************** user01@TestL01 ********************<" ) );

        headers_user01_at_TestL01_Session1.Authorization = "12345"; //Create invalid authentication token

        //Fail because the user user01@TestL01 no valid session
        myAssert( await test_deleteUser( headers_user01_at_TestL01_Session1,
                                         { Id: user02_at_TestL01_data.Id },
                                         "ERROR_INVALID_AUTHORIZATION_TOKEN",
                                         "test_deleteUser_user02_at_TestL01_fail" ),
                  '54259F9D648F: Delete of the user user01@TestL01 is OK with the fail',
                  '54259F9D648F: Delete of the user user01@TestL01 is FAILED' );

        //Open first session
        myAssert( await test_login( headers_user01_at_TestL01_Session2,
                                    {
                                      Name: user01_at_TestL01_data.Name,
                                      Password: user01_at_TestL01_data.Password
                                    },
                                    "SUCCESS_LOGIN",
                                    "test_login_user01@TestL01_success",
                                    false ),
                  '2F5DF2F9A47A: Login with user user01@TestL01 is OK',
                  '2F5DF2F9A47A: Login with user user01@TestL01 is FAILED' );

        //This session is now valid
        myAssert( await test_token( headers_user01_at_TestL01_Session2,
                                    "SUCCESS_TOKEN_IS_VALID",
                                    "test_token_user01@TestL01_success" ),
                  '3A5192B612AD: Token check with user user01@TestL01 is OK',
                  '3A5192B612AD: Token check user user01@TestL01 is FAILED' );

        //Open a second session, and invalidate the first session, sysUser.SessionsLimit = 1
        myAssert( await test_login( headers_user01_at_TestL01_Session1,
                                    {
                                      Name: user01_at_TestL01_data.Name,
                                      Password: user01_at_TestL01_data.Password
                                    },
                                    "SUCCESS_LOGIN",
                                    "test_login_user01@TestL01_success",
                                    false ),
                  '3336E84BAEF2: Login with user user01@TestL01 is OK',
                  '3336E84BAEF2: Login with user user01@TestL01 is FAILED' );

        //Fail because this user has user session limit = 1, sysUser.SessionsLimit = 1
        myAssert( await test_token( headers_user01_at_TestL01_Session2,
                                    "ERROR_LOGGED_OUT_AUTHORIZATION_TOKEN",
                                    "test_token_user01@TestL01_fail" ),
                  'AC4E098E2E7B: Token check with user user01@TestL01 is OK with the fail',
                  'AC4E098E2E7B: Token check user user01@TestL01 is FAILED' );

        myAssert( await test_profile_at_less_one_role( headers_user01_at_TestL01_Session1,
                                                       [ "#MasterL01#" ],
                                                       "SUCCESS_GET_SESSION_PROFILE",
                                                       "test_profile_role_user01@TestL01_success",
                                                       false ),
                  'CDA84E5562F3: The user user01@TestL01 is OK have the role #MasterL01#',
                  'CDA84E5562F3: The user user01@TestL01 NOT have the role #MasterL01# FAILED' );

        myAssert( await test_profile_at_less_one_role( headers_user01_at_TestL01_Session1,
                                                       [ "#Administrator#", "#BManagerL99#" ],
                                                       "SUCCESS_GET_SESSION_PROFILE",
                                                       "test_profile_role_fail",
                                                       false ) === false,
                  '0DB4C6D59098: The user user02@TestL01 is OK not have the roles #Administrator# or #BManagerL99#',
                  '0DB4C6D59098: The user user02@TestL01 have the roles #Administrator# and/or #BManagerL99# FAILED' );

        myAssert( await test_uploadImageTower( headers_user01_at_TestL01_Session1,
                                                 "SUCCESS_BINARY_DATA_UPLOAD",
                                                 "test_uploadImageTower_user01@TestL01_success",
                                                 "user01@TestL01_tower" ),
                  "DCF30CA926BB: upload image tower user01@TestL01 is OK",
                  "DCF30CA926BB: upload image tower user01@TestL01 is FAILED" );

        myAssert( await test_createAuth( headers_user01_at_TestL01_Session1,
                                         "SUCCESS_AUTH_TOKEN_CREATED",
                                         "test_createAuth_user01@TestL01_success",
                                         false ),
                  "6F30C8E983E3: create auth user01@TestL01 is OK",
                  "6F30C8E983E3: create auth user01@TestL01 is FAILED" );

        myAssert( await test_downloadImageThumbnail( headers_user01_at_TestL01_Session1,
                                                       "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                       "test_downloadImageTowerThumbnail_user01@TestL01_success",
                                                       "user01@TestL01_tower" ),
                  "DF6BC73BB52F: download image thumbnail tower user01@TestL01 is OK",
                  "DF6BC73BB52F: download image thumbnail tower user01@TestL01 is FAILED" );

        myAssert( await test_downloadImage( headers_user01_at_TestL01_Session1,
                                             "SUCCESS_BINARY_DATA_DOWNLOAD",
                                             "test_downloadImageTower_user01@TestL01_success",
                                             "user01@TestL01_tower",
                                             null ),
                  "326E879A24CF: download image tower user01@TestL01 is OK",
                  "326E879A24CF: download image tower user01@TestL01 is FAILED" );

        myAssert( await test_getImageDetails( headers_user01_at_TestL01_Session1,
                                                "SUCCESS_GET_INFORMATION",
                                                "test_getImageDetailsTower_user01@TestL01_success",
                                                "user01@TestL01_tower" ),
                  "EA9A3CA6AF6C: get image details tower user01@TestL01 is OK",
                  "EA9A3CA6AF6C: get image details tower user01@TestL01 is FAILED" );

        //Fail to create the user user98@TestL98 because the user user01@TestL01 Role => #MasterL01#, and not allow to create new group
        myAssert( await test_createUser_user98_at_TestL98( headers_user01_at_TestL01_Session1,
                                                           "ERROR_CANNOT_CREATE_USER",
                                                           "test_createUser_user98_at_TestL98_fail",
                                                           true,
                                                           false, //<--- Not auto create the group and the group no exists
                                                           false ),
                  'CA07E27A0CC3: Creation of the user user98@TestL98 is OK with the fail',
                  'CA07E27A0CC3: Creation of the user user98@TestL98 is FAILED' );

        //Fail to create the user user98@TestL98 because the user user01@TestL01 Role => #MasterL01#, and not allow to create new group
        myAssert( await test_createUser_user98_at_TestL98( headers_user01_at_TestL01_Session1,
                                                           "ERROR_CANNOT_CREATE_USER",
                                                           "test_createUser_user98_at_TestL98_fail",
                                                           true,
                                                           true, //<--- Auto create the group and the group no exists
                                                           false ),
                  'CA07E27A0CC3: Creation of the user user98@TestL98 is OK with the fail',
                  'CA07E27A0CC3: Creation of the user user98@TestL98 is FAILED' );

        //Fail because the user01@TestL01 already exists
        myAssert( await test_createUser_user01_at_TestL01( headers_user01_at_TestL01_Session1,
                                                           "ERROR_USER_NAME_ALREADY_EXISTS",
                                                           "test_createUser_user01@TestL01_fail" ),
                  '3C6BCE671AEB: Creation of the user user01@TestL01 is OK with the fail',
                  '3C6BCE671AEB: Creation of the user user01@TestL01 is FAILED' );

        //Fail because the user01@TestL01 is trying update himself
        myAssert( await test_updateUser_user01_at_TestL01_fail( headers_user01_at_TestL01_Session1,
                                                                user01_at_TestL01_data ),
                  'CF7DFB54EDE0: Update of the user user01@TestL01 is OK with the fail',
                  'CF7DFB54EDE0: Update of the user user01@TestL01 is FAILED' );

        //Fail because TestL02 is not in the group of user01@TestL01. Only can create users in the current group TestL01, Role => #MasterL01#
        myAssert( await test_createUser_user02_at_TestL02_fail( headers_user01_at_TestL01_Session1 ),
                  '675C61D31DDF: Creation of the user user02@TestL02 is OK with the fail',
                  '675C61D31DDF: Creation of the user user02@TestL02 is FAILED' );

        //Success because TestL01 is in the group of user01@TestL01. Only can create users in the current group TestL01, Role => #MasterL01#
        //*** Create user user02@TestL01 ***
        myAssert( await test_createUser_user02_at_TestL01_success( headers_user01_at_TestL01_Session1 ),
                  '95543470C81F: Creation of the user user02@TestL01 is OK',
                  '95543470C81F: Creation of the user user02@TestL01 is FAILED' );

        myAssert( await test_userSearch( headers_user01_at_TestL01_Session1,
                  {  },
                  "SUCCESS_SEARCH",
                  "test_search_user01@TestL01_success",
                  2,   //Condition ===
                  2 ), //Count
                 'F720C51DE6FA: Search of the user user01@TestL01 is OK',
                 'F720C51DE6FA: Search of the user user01@TestL01 is FAILED' );

        myAssert( await test_userSearchCount( headers_user01_at_TestL01_Session1,
                  {  },
                  "SUCCESS_SEARCH_COUNT",
                  "test_search_user01@TestL01_success",
                  2,   //Condition ===
                  2 ), //Count
                 'F77C16FE2082: Search count of the user user01@TestL01 is OK',
                 'F77C16FE2082: Search count of the user user01@TestL01 is FAILED' );

        try {

          console.log( chalk.blue( ">******************** user02@TestL01 ********************<" ) );

          myAssert( await test_login( headers_user02_at_TestL01,
                                      {
                                        Name: user02_at_TestL01_data.Name,
                                        Password: user02_at_TestL01_data.Password
                                      },
                                      "SUCCESS_LOGIN",
                                      "test_login_user02@TestL01_success",
                                      false ),
                    '81A6B96C4E24: Login with user user02@TestL01 OK',
                    '81A6B96C4E24: Login with user user02@TestL01 FAILED' );

          myAssert( await test_profile_at_less_one_role( headers_user02_at_TestL01,
                                                         [ "#MasterL01#", "#Administrator#", "#BManagerL99#" ],
                                                         "SUCCESS_GET_SESSION_PROFILE",
                                                         "test_profile_role_user02@TestL01_fail",
                                                         false ) === false,
                    'A9464CC0DE81: The user user02@TestL01 is OK not have the roles #MasterL01# or #Administrator# or #BManagerL99#',
                    'A9464CC0DE81: The user user02@TestL01 have the roles #MasterL01# and/or #Administrator# and/or #BManagerL99# FAILED' );

          myAssert( await test_uploadImageRoad( headers_user02_at_TestL01,
                                                "SUCCESS_BINARY_DATA_UPLOAD",
                                                "test_uploadImageRoad_user02@TestL01_success",
                                                "user02@TestL01_road" ),
                    "DCF30CA926BB: upload image road user02@TestL01 is OK",
                    "DCF30CA926BB: upload image road user02@TestL01 is FAILED" );

          myAssert( await test_createAuth( headers_user02_at_TestL01,
                                           "SUCCESS_AUTH_TOKEN_CREATED",
                                           "test_createAuth_user02@TestL01_success",
                                           false ),
                    "6F30C8E983E3: create auth user02@TestL01 is OK",
                    "6F30C8E983E3: create auth user02@TestL01 is FAILED" );

          myAssert( await test_downloadImageThumbnail( headers_user02_at_TestL01,
                                                       "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                       "test_downloadImageRoadThumbnail_user02@TestL01_success",
                                                       "user02@TestL01_road" ),
                    "237980EFB1D6: download image thumbnail road user02@TestL01 is OK",
                    "237980EFB1D6: download image thumbnail road user02@TestL01 is FAILED" );

          myAssert( await test_downloadImage( headers_user02_at_TestL01,
                                              "SUCCESS_BINARY_DATA_DOWNLOAD",
                                              "test_downloadImageRoad_user02@TestL01_success",
                                              "user02@TestL01_road",
                                              null ),
                    "326E879A24CF: download image road user02@TestL01 is OK",
                    "326E879A24CF: download image road user02@TestL01 is FAILED" );

          myAssert( await test_getImageDetails( headers_user02_at_TestL01,
                                                "SUCCESS_GET_INFORMATION",
                                                "test_getImageDetailsRoad_user02@TestL01_success",
                                                "user02@TestL01_road" ),
                    "EA9A3CA6AF6C: get image details road user02@TestL01 is OK",
                    "EA9A3CA6AF6C: get image details road user02@TestL01 is FAILED" );

          myAssert( await test_binarySearch( headers_user02_at_TestL01,
                    {  },
                    "SUCCESS_SEARCH",
                    "test_search_user02@TestL01_success",
                    2,
                    1 ),
                    '6CAE1B5074FE: Search of the binary data user02@TestL01 is OK',
                    '6CAE1B5074FE: Search of the binary data user02@TestL01 is FAILED' );

          myAssert( await test_binarySearchCount( headers_user02_at_TestL01,
                    {  },
                    "SUCCESS_SEARCH_COUNT",
                    "test_searchCount_user02@TestL01_success",
                    2,
                    1 ),
                    'BA12C15C021E: Search count of the binary data user02@TestL01 is OK',
                    'BA12C15C021E: Search count of the binary data user02@TestL01 is FAILED' );

          myAssert( await test_binarySearch( headers_user01_at_TestL01_Session1,
                    {  },
                    "SUCCESS_SEARCH",
                    "test_search_user01@TestL01_success",
                    2,
                    2 ),
                    '30CC59357B73: Search of the user user01@TestL01 is OK',
                    '30CC59357B73: Search of the user user01@TestL01 is FAILED' );

          myAssert( await test_binarySearchCount( headers_user01_at_TestL01_Session1,
                    {  },
                    "SUCCESS_SEARCH_COUNT",
                    "test_searchCount_user01@TestL01_success",
                    2,
                    2 ),
                    '447DC61A3301: Search count of the binary data user01@TestL01 is OK',
                    '447DC61A3301: Search count of the binary data user01@TestL01 is FAILED' );

          myAssert( await test_deleteImage( headers_user02_at_TestL01,
                                            "SUCCESS_BINARY_DATA_DELETE",
                                            "test_deleteImageRoad_user02@TestL01_success",
                                            "user02@TestL01_road" ),
                    "2940D61E1827: delete image road user02@TestL01 is OK",
                    "2940D61E1827: delete image road user02@TestL01 is FAILED" );

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

          console.log( chalk.blue( "<******************** user02@TestL01 ********************>" ) );

        }
        catch ( error ) {

          console.log( "user02@TestL02" );
          console.log( error );

          console.log( chalk.blue( "<******************** user02@TestL01 ********************>" ) );

        }

        myAssert( await test_deleteImage( headers_user01_at_TestL01_Session1,
                                          "SUCCESS_BINARY_DATA_DELETE",
                                          "test_deleteImageTower_admin01@system.net_success",
                                          "user01@TestL01_tower" ),
                  "7D2AB0B58075: delete image tower admin01@system.net is OK",
                  "7D2AB0B58075: delete image tower admin01@system.net is FAILED" );

        //Success because the user user02@TestL01 is in the group of user01@TestL01. Only can delete users in the current group TestL01, Role => #MasterL01#
        //*** Delete user user02@TestL01 ***
        myAssert( await test_deleteUser( headers_user01_at_TestL01_Session1,
                                         { Id: user02_at_TestL01_data.Id },
                                         "SUCCESS_USER_DELETE",
                                         "test_deleteUser_user02_at_TestL01_success" ),
                  '1AD5AD5583DD: Delete of the user user02@TestL01 is OK',
                  '1AD5AD5583DD: Delete of the user user02@TestL01 is FAILED' );

        //Fail because the user bmanager02@system.net is not in the group of user01@TestL01. Only can delete users in the current group TestL01, Role => #MasterL01#
        myAssert( await test_deleteUser( headers_user01_at_TestL01_Session1,
                                         { Name: "bmanager02@system.net" },
                                         "ERROR_CANNOT_DELETE_THE_INFORMATION",
                                         "test_deleteUser_bmanager02@system.net_fail" ),
                  '8E8766DECAD0: Delete of the user bmanager02@system.net is OK with the fail',
                  '8E8766DECAD0: Delete of the user bmanager02@system.net is FAILED' );

        myAssert( await test_logout( headers_user01_at_TestL01_Session1,
                                     "SUCCESS_LOGOUT",
                                     "test_logout_user01@TestL01_success" ),
                  '5FA1C53C9F1D: Logout with user user01@TestL01 is OK',
                  '5FA1C53C9F1D: Logout with user user01@TestL01 is FAILED' );

        //Fail because the user user01@TestL01 no valid session
        myAssert( await test_deleteUser( headers_user01_at_TestL01_Session1,
                                         { Id: user02_at_TestL01_data.Id },
                                         "ERROR_LOGGED_OUT_AUTHORIZATION_TOKEN",
                                         "test_deleteUser_user02_at_TestL01_fail" ),
                  '1AF9D40E118A: Delete of the user user01@TestL01 is OK with the fail',
                  '1AF9D40E118A: Delete of the user user01@TestL01 is FAILED' );

        console.log( chalk.blue( "<******************** user01@TestL01 ********************>" ) );

      }
      catch ( error ) {

        console.log( "user01@TestL01" );
        console.log( error );
        console.log( chalk.blue( "<******************** user01@TestL01 ********************>" ) );

      }

      //*** Create the user user01@TestL02 ****
      myAssert( await test_createUser_user01_at_TestL02_success( headers_admin01_at_system_net ),
                '8146E721C710: Creation of the user user01@TestL02 is OK',
                '8146E721C710: Creation of the user user01@TestL02 is FAILED' );

      try {

        console.log( chalk.blue( ">******************** user01@TestL02 ********************<" ) );

        myAssert( await test_login( headers_user01_at_TestL02,
                                    {
                                      Name: user01_at_TestL02_data.Name,
                                      Password: user01_at_TestL02_data.Password
                                    },
                                    "SUCCESS_LOGIN",
                                    "test_login_user01@TestL02_success",
                                    false ),
                  '130FE0374778: Login with user user01@TestL02 OK',
                  '130FE0374778: Login with user user01@TestL02 FAILED' );

        myAssert( await test_profile_at_less_one_role( headers_user01_at_TestL02,
                                                       [ "#MasterL03#" ],
                                                       "SUCCESS_GET_SESSION_PROFILE",
                                                       "test_profile_role_user01@TestL02_success",
                                                       false ),
                  'DDC02D014233: The user user01@TestL02 is OK have the role #MasterL03#',
                  'DDC02D014233: The user user01@TestL02 NOT have the role #MasterL03# FAILED' );

        myAssert( await test_profile_at_less_one_role( headers_user01_at_TestL02,
                                                       [ "#Administrator#", "#BManagerL99#", "#MasterL01#" ],
                                                       "SUCCESS_GET_SESSION_PROFILE",
                                                       "test_profile_role_user01@TestL02_fail",
                                                       false ) === false,
                  'AD3CC7F54477: The user user02@TestL02 is OK not have the roles #Administrator# or #BManagerL99# or #MasterL01#',
                  'AD3CC7F54477: The user user02@TestL02 have the roles #Administrator# and/or #BManagerL99# and/or #MasterL01# FAILED' );

        //Success because user01@TestL02 has the Role => #MasterL03#+#GName:TestL01#+#GName:TestL02#
        //*** Create the user user02@TestL02 ***
        myAssert( await test_createUser_user02_at_TestL02_success( headers_user01_at_TestL02 ),
                  '595AA97F14E3: Creation of the user user02@TestL02 is OK',
                  '595AA97F14E3: Creation of the user user02@TestL02 is FAILED' );

        //Change the user name from user02@TestL02 => user99@TestL01
        //Change the user group name from TestL02 => TestL01
        //Success because user01@TestL02 has the Role => #MasterL03#+#GName:TestL01#+#GName:TestL02#
        myAssert( await test_updateUser_user02_at_TestL02_success( headers_user01_at_TestL02, user02_at_TestL02_data ), //The user is another group
                  '5CE1E61F0840: Update of the user user02@TestL02 is OK',
                  '5CE1E61F0840: Update of the user user02@TestL02 is FAILED' );

        //Change the user name from user99@TestL01 => user02@TestL02
        //Change the user group name from TestL01 => TestL02
        //Success because user01@TestL02 has the Role => #MasterL03#+#GName:TestL01#+#GName:TestL02#
        //Set the field sysUser.ForceChangePassword = 1
        myAssert( await test_updateUser_user99_at_TestL01_success( headers_user01_at_TestL02, user02_at_TestL02_data ), //The user is another group
                  'F59085E6DF03: Update of the user user99@TestL01 is OK',
                  'F59085E6DF03: Update of the user user99@TestL01 is FAILED' );

        //Try to change the user name from user02@TestL01 => user01@TestL01
        //Try to change the user group name from TestL02 => TestL01
        //Fail because user01@TestL01 already exists
        myAssert( await test_updateUser_user02_at_TestL02_fail( headers_user01_at_TestL02, user02_at_TestL02_data ), //The user is another group
                  'F15260F5B6AD: Update of the user user02@TestL02 is OK with the fail',
                  'F15260F5B6AD: Update of the user user02@TestL02 is FAILED' );

        //Success because user01@TestL02 has the Role => #MasterL03#+#GName:TestL01#+#GName:TestL02#
        //*** Create the user user02@TestL01 ***
        myAssert( await test_createUser_user02_at_TestL01_success( headers_user01_at_TestL02 ),
                  'F717131C21AA: Creation of the user user02@TestL01 is OK',
                  'F717131C21AA: Creation of the user user02@TestL01 is FAILED' );

        //Success because user01@TestL02 has the Role => #MasterL03#+#GName:TestL01#+#GName:TestL02#
        myAssert( await test_updateUser_user02_at_TestL01_success( headers_user01_at_TestL02, user02_at_TestL01_data ), //The user is another group
                  '79736CBA890B: Creation of the user user02@TestL01 is OK',
                  '79736CBA890B: Creation of the user user02@TestL01 is FAILED' );

        myAssert( await test_userSearch( headers_user01_at_TestL02,
                  {  },
                  "SUCCESS_SEARCH",
                  "test_search_user01@TestL01_success",
                  2,   //Condition ===
                  4 ), //Count
                 'AD0B5775D644: Search of the user user01@TestL02 is OK',
                 'AD0B5775D644: Search of the user user01@TestL02 is FAILED' );

        myAssert( await test_userSearchCount( headers_user01_at_TestL02,
                  {  },
                  "SUCCESS_SEARCH_COUNT",
                  "test_search_user01@TestL01_success",
                  2,   //Condition ===
                  4 ), //Count
                 'C095D0EA6182: Search count of the user user01@TestL02 is OK',
                 'C095D0EA6182: Search count of the user user01@TestL02 is FAILED' );

        //Return zero because the use admin01@system.net is not allowed by the user01@TestL02
        myAssert( await test_userSearch( headers_user01_at_TestL02,
                  { where: "A.Name = 'admin01@system.net'" },
                  "SUCCESS_SEARCH",
                  "test_search_admin01@system.net_success",
                  2,   //Condition ===
                  0 ), //Count
                 '0C4F58078409: Search of the user user01@TestL02 is OK',
                 '0C4F58078409: Search of the user user01@TestL02 is FAILED' );

        //Return zero because the use admin01@system.net is not allowed by the user01@TestL02
        myAssert( await test_userSearchCount( headers_user01_at_TestL02,
                  { where: "A.Name = 'admin01@system.net'" },
                  "SUCCESS_SEARCH_COUNT",
                  "test_search_admin01@system.net_success",
                  2,   //Condition ===
                  0 ), //Count
                 '89A4483AD09F: Search count of the user user01@TestL02 is OK',
                 'A972F4A5400E: Search count of the user user01@TestL02 is FAILED' );

        myAssert( await test_userSearch( headers_user01_at_TestL02,
                  { where: "A.Name = 'user02@TestL02'" },
                  "SUCCESS_SEARCH",
                  "test_search_user02@TestL02_success",
                  2,   //Condition ===
                  1 ), //Count
                 '0C4F58078409: Search of the user user02@TestL02 is OK',
                 '0C4F58078409: Search of the user user02@TestL02 is FAILED' );

        myAssert( await test_userSearchCount( headers_user01_at_TestL02,
                  { where: "A.Name = 'user02@TestL02'" },
                  "SUCCESS_SEARCH_COUNT",
                  "test_search_user02@TestL02_success",
                  2,   //Condition ===
                  1 ), //Count
                 '89A4483AD09F: Search count of the user user02@TestL02 is OK',
                 '89A4483AD09F: Search count of the user user02@TestL02 is FAILED' );

        myAssert( await test_userSearch( headers_user01_at_TestL02,
                  { where: "A.Name = 'user02@TestL02' Or A.Name = 'user01@TestL02'" },
                  "SUCCESS_SEARCH",
                  "test_search_user02@TestL02_success",
                  2,   //Condition ===
                  2 ), //Count
                 '6F000511292F: Search of the user user02@TestL02 is OK',
                 '6F000511292F: Search of the user user02@TestL02 is FAILED' );

        myAssert( await test_userSearchCount( headers_user01_at_TestL02,
                  { where: "A.Name = 'user02@TestL02' Or A.Name = 'user01@TestL02'" },
                  "SUCCESS_SEARCH_COUNT",
                  "test_search_user02@TestL02_success",
                  2,   //Condition ===
                  2 ), //Count
                 '656BB66AC356: Search count of the user user02@TestL02 is OK',
                 '656BB66AC356: Search count of the user user02@TestL02 is FAILED' );

        myAssert( await test_uploadImageRoad( headers_user01_at_TestL02,
                                              "SUCCESS_BINARY_DATA_UPLOAD",
                                              "test_uploadImageRoad_user01@TestL02_success",
                                              "user01@TestL02_road" ),
                  "C23E1CE5725E: upload image road user01@TestL02 is OK",
                  "C23E1CE5725E: upload image road user01@TestL02 is FAILED" );

        myAssert( await test_createAuth( headers_user01_at_TestL02,
                                         "SUCCESS_AUTH_TOKEN_CREATED",
                                         "test_createAuth_user01@TestL02_success",
                                         false ),
                  "C539A2B57526: create auth user01@TestL02 is OK",
                  "C539A2B57526: create auth user01@TestL02 is FAILED" );

        myAssert( await test_downloadImageThumbnail( headers_user01_at_TestL02,
                                                     "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                     "test_downloadImageRoadThumbnail_user01@TestL02_success",
                                                     "user01@TestL02_road" ),
                  "EDD23DB9B25D: download image thumbnail road user01@TestL02 is OK",
                  "EDD23DB9B25D: download image thumbnail road user01@TestL02 is FAILED" );

        myAssert( await test_downloadImage( headers_user01_at_TestL02,
                                            "SUCCESS_BINARY_DATA_DOWNLOAD",
                                            "test_downloadImageRoad_user01@TestL02_success",
                                            "user01@TestL02_road",
                                            null ),
                  "0B1CD13DAD0B: download image road user01@TestL02 is OK",
                  "0B1CD13DAD0B: download image road user01@TestL02 is FAILED" );

        myAssert( await test_getImageDetails( headers_user01_at_TestL02,
                                              "SUCCESS_GET_INFORMATION",
                                              "test_getImageDetailsRoad_user01@TestL02_success",
                                              "user01@TestL02_road" ),
                  "EA9A3CA6AF6C: get image details road user01@TestL02 is OK",
                  "EA9A3CA6AF6C: get image details road user01@TestL02 is FAILED" );

        myAssert( await test_binarySearch( headers_user01_at_TestL02,
                  {  },
                  "SUCCESS_SEARCH",
                  "test_search_user01@TestL02_success",
                  2,
                  1 ),
                  '7C542CAC93F9: Search of the binary data user01@TestL02 is OK',
                  '7C542CAC93F9: Search of the binary data user01@TestL02 is FAILED' );

        myAssert( await test_binarySearchCount( headers_user01_at_TestL02,
                  {  },
                  "SUCCESS_SEARCH_COUNT",
                  "test_searchCount_user01@TestL02_success",
                  2,
                  1 ),
                  '67CFE1F1D4F0: Search count of the binary data user01@TestL02 is OK',
                  '67CFE1F1D4F0: Search count of the binary data user01@TestL02 is FAILED' );

        try {

          console.log( chalk.blue( ">******************** user02@TestL02 ********************<" ) );

          myAssert( await test_login( headers_user02_at_TestL02,
                                      {
                                        Name: user02_at_TestL02_data.Name,
                                        Password: user02_at_TestL02_data.Password
                                      },
                                      "SUCCESS_LOGIN",
                                      "test_login_user02@TestL02_success",
                                      false ),
                    'ECE77F4DB472: Login with user user02@TestL02 OK',
                    'ECE77F4DB472: Login with user user02@TestL02 FAILED' );

          //Fail because need change the password before sysUser.ForceChangePassword = 1
          myAssert( await test_profile_at_less_one_role( headers_user02_at_TestL02,
                                                         [ "#Administrator#", "#BManagerL99#", "#MasterL01#", "#MasterL02#", "#MasterL03#" ],
                                                         "ERROR_USER_CHANGE_PASSWORD_REQUIRED",
                                                         "test_profile_role_user02@TestL02_fail",
                                                         true ),
                    'DEF3E36E35C4: The user user02@TestL02 is OK with fail',
                    'DEF3E36E35C4: The user user02@TestL02 is FAILED' );

          //Fail because the NewPassword and OldPassword are the same
          myAssert( await test_change_password( headers_user02_at_TestL02,
                                                { CurrentPassword: user02_at_TestL02_data.Password, NewPassword: user02_at_TestL02_data.Password },
                                                "ERROR_NEW_PASSWORD_NOT_VALID",
                                                "test_change_password_user02@TestL02_fail" ),
                    'EC2D59F2121A: The user user02@TestL02 is OK with the fail',
                    'EC2D59F2121A: The user user02@TestL02 is FAILED' );

          //Fail because the NewPassword is too short
          myAssert( await test_change_password( headers_user02_at_TestL02,
                                                { CurrentPassword: user02_at_TestL02_data.Password, NewPassword: "123456" },
                                                "ERROR_NEW_PASSWORD_NOT_VALID",
                                                "test_change_password_user02@TestL02_fail" ),
                    'F2D7309DE7EB: The user user02@TestL02 is OK with the fail',
                    'F2D7309DE7EB: The user user02@TestL02 is FAILED' );

          //Fail because the OldPassword is wrong
          myAssert( await test_change_password( headers_user02_at_TestL02,
                                                { CurrentPassword: user02_at_TestL02_data.Password + "1", NewPassword: user02_at_TestL02_data.Password },
                                                "ERROR_NEW_PASSWORD_NOT_VALID",
                                                "test_change_password_user02@TestL02_fail" ),
                    'EC2D59F2121A: The user user02@TestL02 is OK with the fail',
                    'EC2D59F2121A: The user user02@TestL02 is FAILED' );

          myAssert( await test_change_password( headers_user02_at_TestL02,
                                                { CurrentPassword: user02_at_TestL02_data.Password, NewPassword: user02_at_TestL02_data.Password + "0" },
                                                "SUCCESS_PASSWORD_CHANGE",
                                                "test_change_password_user02@TestL02_success" ),
                    'D3533E1D951B: The user user02@TestL02 is OK',
                    'D3533E1D951B: The user user02@TestL02 is FAILED' );

          user02_at_TestL02_data.Password = user02_at_TestL02_data.Password + "0"; //Update with the new password

          myAssert( await test_profile_at_less_one_role( headers_user02_at_TestL02,
                                                         [ "#Administrator#", "#BManagerL99#", "#MasterL01#", "#MasterL02#", "#MasterL03#" ],
                                                         "SUCCESS_GET_SESSION_PROFILE",
                                                         "test_profile_role_user02@TestL02_fail",
                                                         false ) === false,
                    'DEF3E36E35C4: The user user02@TestL02 is OK not have the roles #Administrator# or #BManagerL99# or #MasterL01# or #MasterL02# or #MasterL03#',
                    'DEF3E36E35C4: The user user02@TestL02 have the roles #Administrator# and/or #BManagerL99# and/or #MasterL01# and/or #MasterL02# and/or #MasterL03# FAILED' );

          myAssert( await test_uploadImageRoad( headers_user02_at_TestL02,
                                                "SUCCESS_BINARY_DATA_UPLOAD",
                                                "test_uploadImageRoad_user02@TestL02_success",
                                                "user02@TestL02_road" ),
                    "09436E9FE7B4: upload image road user02@TestL02 is OK",
                    "09436E9FE7B4: upload image road user02@TestL02 is FAILED" );

          myAssert( await test_createAuth( headers_user02_at_TestL02,
                                           "SUCCESS_AUTH_TOKEN_CREATED",
                                           "test_createAuth_user02@TestL02_success",
                                           false ),
                    "68A9AE102E89: create auth user02@TestL02 is OK",
                    "68A9AE102E89: create auth user02@TestL02 is FAILED" );

          myAssert( await test_downloadImageThumbnail( headers_user02_at_TestL02,
                                                       "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                       "test_downloadImageRoadThumbnail_user02@TestL02_success",
                                                       "user02@TestL02_road" ),
                    "29EA767C6CF1: download image thumbnail road user02@TestL02 is OK",
                    "29EA767C6CF1: download image thumbnail road user02@TestL02 is FAILED" );

          myAssert( await test_downloadImage( headers_user02_at_TestL02,
                                              "SUCCESS_BINARY_DATA_DOWNLOAD",
                                              "test_downloadImageRoad_user02@TestL02_success",
                                              "user02@TestL02_road",
                                              null ),
                    "D4F7EE1786AE: download image road user02@TestL02 is OK",
                    "D4F7EE1786AE: download image road user02@TestL02 is FAILED" );

          myAssert( await test_getImageDetails( headers_user02_at_TestL02,
                                                "SUCCESS_GET_INFORMATION",
                                                "test_getImageDetailsRoad_user02@TestL02_success",
                                                "user02@TestL02_road" ),
                    "D121F8FC1A6E: get image details road user02@TestL02 is OK",
                    "D121F8FC1A6E: get image details road user02@TestL02 is FAILED" );

          myAssert( await test_binarySearch( headers_user02_at_TestL02,
                    {  },
                    "SUCCESS_SEARCH",
                    "test_search_user02@TestL02_success",
                    2,
                    1 ),
                    'BA8DDFDEC334: Search of the binary data user02@TestL02 is OK',
                    'BA8DDFDEC334: Search of the binary data user02@TestL02 is FAILED' );

          myAssert( await test_binarySearchCount( headers_user02_at_TestL02,
                    {  },
                    "SUCCESS_SEARCH_COUNT",
                    "test_searchCount_user02@TestL01_success",
                    2,
                    1 ),
                    'E21BF5EF740F: Search count of the binary data user02@TestL02 is OK',
                    'E21BF5EF740F: Search count of the binary data user02@TestL02 is FAILED' );

          myAssert( await test_binarySearch( headers_user01_at_TestL02,
                    {  },
                    "SUCCESS_SEARCH",
                    "test_search_user01@TestL02_success",
                    2,
                    2 ),
                    'BA8DDFDEC334: Search of the binary data user01@TestL02 is OK',
                    'BA8DDFDEC334: Search of the binary data user01@TestL02 is FAILED' );

          myAssert( await test_binarySearchCount( headers_user01_at_TestL02,
                    {  },
                    "SUCCESS_SEARCH_COUNT",
                    "test_searchCount_user01@TestL02_success",
                    2,
                    2 ),
                    'C107CF6AA8EB: Search count of the binary data user01@TestL02 is OK',
                    'C107CF6AA8EB: Search count of the binary data user01@TestL02 is FAILED' );

          myAssert( await test_logout( headers_user02_at_TestL02,
                                       "SUCCESS_LOGOUT",
                                       "test_logout_user02@TestL02_success" ),
                    '56FE7F65DC57: Logout with user user02@TestL02 is OK',
                    '56FE7F65DC57: Logout with user user02@TestL02 is FAILED' );

          myAssert( await test_logout( headers_user02_at_TestL02,
                                       "ERROR_LOGGED_OUT_AUTHORIZATION_TOKEN",
                                       "test_logout_user02@TestL02_fail" ),
                    '56FE7F65DC57: Logout with user user02@TestL02 is OK with the fail',
                    '56FE7F65DC57: Logout with user user02@TestL02 is FAILED' );

          console.log( chalk.blue( "<******************** user02@TestL02 ********************>" ) );

        }
        catch ( error ) {

          console.log( "user01@TestL01" );
          console.log( error );
          console.log( chalk.blue( "<******************** user02@TestL02 ********************>" ) );

        }

        try {

          console.log( chalk.blue( ">******************** user02@TestL01 ********************<" ) );

          myAssert( await test_login( headers_user02_at_TestL01,
                                      {
                                        Name: user02_at_TestL01_data.Name,
                                        Password: user02_at_TestL01_data.Password
                                      },
                                      "SUCCESS_LOGIN",
                                      "test_login_user02@TestL01_success",
                                      false ),
                    '9505C68A979F: Login with user user02@TestL01 OK',
                    '9505C68A979F: Login with user user02@TestL01 FAILED' );

          myAssert( await test_profile_at_less_one_role( headers_user02_at_TestL01,
                                                         [ "#Administrator#", "#BManagerL99#", "#MasterL01#", "#MasterL02#", "#MasterL03#" ],
                                                         "SUCCESS_GET_SESSION_PROFILE",
                                                         "test_profile_role_user02@TestL01_fail",
                                                         false ) === false,
                    'BE0D27084964: The user user02@TestL01 is OK not have the roles #Administrator# or #BManagerL99# or #MasterL01# or #MasterL02# or #MasterL03#',
                    'BE0D27084964: The user user02@TestL01 have the roles #Administrator# and/or #BManagerL99# and/or #MasterL01# and/or #MasterL02# and/or #MasterL03# FAILED' );

          myAssert( await test_uploadImageCastle( headers_user02_at_TestL01,
                                                  "SUCCESS_BINARY_DATA_UPLOAD",
                                                  "test_uploadImageCastle_user02@TestL01_success",
                                                  "user02@TestL01_castle" ),
                    "6355B124499E: upload image castle user02@TestL01 is OK",
                    "6355B124499E: upload image castle user02@TestL01 is FAILED" );

          myAssert( await test_createAuth( headers_user02_at_TestL01,
                                           "SUCCESS_AUTH_TOKEN_CREATED",
                                           "test_createAuth_user02@TestL01_success",
                                           false ),
                    "68A9AE102E89: create auth user02@TestL01 is OK",
                    "68A9AE102E89: create auth user02@TestL01 is FAILED" );

          myAssert( await test_downloadImageThumbnail( headers_user02_at_TestL01,
                                                       "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                       "test_downloadImageCastleThumbnail_user02@TestL01_success",
                                                       "user02@TestL01_castle" ),
                    "8C71B4C27928: download image thumbnail castle user02@TestL01 is OK",
                    "8C71B4C27928: download image thumbnail castle user02@TestL01 is FAILED" );

          myAssert( await test_downloadImage( headers_user02_at_TestL01,
                                              "SUCCESS_BINARY_DATA_DOWNLOAD",
                                              "test_downloadImageCastle_user02@TestL01_success",
                                              "user02@TestL01_castle",
                                              null ),
                    "15FC200672CD: download image castle user02@TestL01 is OK",
                    "15FC200672CD: download image castle user02@TestL01 is FAILED" );

          myAssert( await test_getImageDetails( headers_user02_at_TestL01,
                                                "SUCCESS_GET_INFORMATION",
                                                "test_getImageDetailsCatle_user02@TestL01_success",
                                                "user02@TestL01_castle" ),
                    "C4D63A79B8C6: get image details castle user02@TestL01 is OK",
                    "C4D63A79B8C6: get image details castle user02@TestL01 is FAILED" );

          myAssert( await test_binarySearch( headers_user02_at_TestL01,
                    {  },
                    "SUCCESS_SEARCH",
                    "test_search_user02@TestL01_success",
                    2,
                    1 ),
                    '42D17A37758A: Search of the binary data user02@TestL01 is OK',
                    '42D17A37758A: Search of the binary data user02@TestL01 is FAILED' );

          myAssert( await test_binarySearchCount( headers_user02_at_TestL01,
                    {  },
                    "SUCCESS_SEARCH_COUNT",
                    "test_searchCount_user02@TestL01_success",
                    2,
                    1 ),
                    '7A542D403847: Search count of the binary data user02@TestL01 is OK',
                    '7A542D403847: Search count of the binary data user02@TestL01 is FAILED' );

          myAssert( await test_binarySearch( headers_user01_at_TestL02,
                    {  },
                    "SUCCESS_SEARCH",
                    "test_search_user01@TestL02_success",
                    2,
                    3 ),
                    'FA694F2DF9DB: Search of the binary data user01@TestL02 is OK',
                    'FA694F2DF9DB: Search of the binary data user01@TestL02 is FAILED' );

          myAssert( await test_binarySearchCount( headers_user01_at_TestL02,
                    {  },
                    "SUCCESS_SEARCH_COUNT",
                    "test_searchCount_user01@TestL02_success",
                    2,
                    3 ),
                    '3C577FAE6D3C: Search count of the binary data user01@TestL02 is OK',
                    '3C577FAE6D3C: Search count of the binary data user01@TestL02 is FAILED' );

          myAssert( await test_deleteImage( headers_user02_at_TestL01,
                                            "SUCCESS_BINARY_DATA_DELETE",
                                            "test_deleteImageCastle_user02@TestL01_success",
                                            "user02@TestL01_castle" ),
                    "61FD3EFB09E7: delete image castle user02@TestL01 is OK",
                    "61FD3EFB09E7: delete image castle user02@TestL01 is FAILED" );

          myAssert( await test_logout( headers_user02_at_TestL01,
                                       "SUCCESS_LOGOUT",
                                       "test_logout_user02@TestL01_success" ),
                    'A82203930794: Logout with user user02@TestL01 is OK',
                    'A82203930794: Logout with user user02@TestL01 is FAILED' );

          console.log( chalk.blue( "<******************** user02@TestL01 ********************>" ) );

        }
        catch ( error ) {

          console.log( "user01@TestL01" );
          console.log( error );
          console.log( chalk.blue( "<******************** user02@TestL01 ********************>" ) );

        }

        myAssert( await test_deleteImage( headers_user01_at_TestL02,
                                          "SUCCESS_BINARY_DATA_DELETE",
                                          "test_deleteImageRoad_user01@TestL02_success",
                                          "user02@TestL02_road" ),
                  "DC8835AA08C0: delete image road user01@TestL02 is OK",
                  "DC8835AA08C0: delete image road user01@TestL02 is FAILED" );

        myAssert( await test_deleteImage( headers_user01_at_TestL02,
                                          "SUCCESS_BINARY_DATA_DELETE",
                                          "test_deleteImageRoad_user01@TestL02_success",
                                          "user01@TestL02_road" ),
                  "D02C1566D62C: delete image road user01@TestL02 is OK",
                  "D02C1566D62C: delete image road user01@TestL02 is FAILED" );

        //Success because user01@TestL02 has the Role => #MasterL03#+#GName:TestL01#+#GName:TestL02#
        myAssert( await test_deleteUser( headers_user01_at_TestL02,
                                        { Id: user02_at_TestL02_data.Id },
                                        "SUCCESS_USER_DELETE",
                                        "test_deleteUser_user02@TestL02_success" ),
                  'B266409B2D82: Delete of the user user02@TestL02 is OK',
                  'B266409B2D82: Delete of the user user02@TestL02 is FAILED' );

        //Success because user01@TestL02 has the Role => #MasterL03#+#GName:TestL01#+#GName:TestL02#
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

        console.log( chalk.blue( "<******************** user01@TestL02 ********************>" ) );

      }
      catch ( error ) {

        console.log( "user01@TestL02" );
        console.log( error );
        console.log( chalk.blue( "<******************** user01@TestL02 ********************>" ) );

      }

      myAssert( await test_deleteImage( headers_admin01_at_system_net,
                                        "SUCCESS_BINARY_DATA_DELETE",
                                        "test_deleteImageTiger_admin01@system.net_success",
                                        "admin01@system.net_tiger" ),
                "B916F1ECD54E: delete image tiger admin01@system.net is OK",
                "B916F1ECD54E: delete image tiger admin01@system.net is FAILED" );

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

    console.log( chalk.blue( "<******************** admin01@system.net ********************>" ) );

  }
  catch ( error ) {

    console.log( error );

    console.log( chalk.blue( "<******************** admin01@system.net ********************>" ) );

  }

}

export default async function main() {

  SystemUtilities.startRun = SystemUtilities.getCurrentDateAndTime(); //new Date();

  SystemUtilities.baseRunPath = __dirname;
  SystemUtilities.baseRootPath = appRoot.path;

  await test_set01();

}

main();

