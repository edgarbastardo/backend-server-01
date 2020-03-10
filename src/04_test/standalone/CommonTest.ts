import fs from 'fs'; //Load the filesystem module
import os from 'os'; //Load the os module

import logSymbols = require( "log-symbols" );
import chalk = require( "chalk" );

import CommonConstants from "../../02_system/common/CommonConstants";

import CommonUtilities from "../../02_system/common/CommonUtilities";
import SystemUtilities from "../../02_system/common/SystemUtilities";

import { UserRequestServiceV1 } from "./UserRequestServiceV1";
import { SystemSecurityAuthenticationServiceV1 } from "./SystemSecurityAuthenticationServiceV1";
import { UserGroupRequestServiceV1 } from "./UserGroupRequestServiceV1";
import { BinaryRequestServiceV1 } from "./BinaryRequestServiceV1";

export default class CommonTest {

  static strStartUser = "admin01@system.net";
  static strStartPassword = "admin1.123456.";

  static strProtocol = "http://"
  static strHost = "127.0.0.1";
  static strOutputFormat = "screen";

  //let strAuthorization_admin01 = null;

  static intSequence = 0;

  static headers_admin01_at_system_net = {
                                           "Authorization": "",
                                           "Content-Type": "application/json",
                                           "FrontendId": "ccc1",
                                           "TimeZoneId": "America/Los_Angeles",
                                           "Language": "en_US",
                                           "BinaryDataToken": ""
                                         }

  static headers_user01_at_TestL01_Session1 = {
                                                "Authorization": "",
                                                "Content-Type": "application/json",
                                                "FrontendId": "ccc1",
                                                "TimeZoneId": "America/Los_Angeles",
                                                "Language": "en_US",
                                                "BinaryDataToken": ""
                                              }

  static headers_user01_at_TestL01_Session2 = {
                                                "Authorization": "",
                                                "Content-Type": "application/json",
                                                "FrontendId": "ccc1",
                                                "TimeZoneId": "America/Los_Angeles",
                                                "Language": "en_US",
                                                "BinaryDataToken": ""
                                              }

  static headers_user02_at_TestL01 = {
                                       "Authorization": "",
                                       "Content-Type": "application/json",
                                       "FrontendId": "ccc1",
                                       "TimeZoneId": "America/Los_Angeles",
                                       "Language": "en_US",
                                       "BinaryDataToken": ""
                                     }

  static headers_user01_at_TestL02 = {
                                       "Authorization": "",
                                       "Content-Type": "application/json",
                                       "FrontendId": "ccc1",
                                       "TimeZoneId": "America/Los_Angeles",
                                       "Language": "en_US",
                                       "BinaryDataToken": ""
                                     }

  static headers_user02_at_TestL02 = {
                                       "Authorization": "",
                                       "Content-Type": "application/json",
                                       "FrontendId": "ccc1",
                                       "TimeZoneId": "America/Los_Angeles",
                                       "Language": "en_US",
                                       "BinaryDataToken": ""
                                     }

  //Test request failed
  static userRequestFull = {
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

  static user01_at_TestL01_data = {} as any;
  static user02_at_TestL01_data = {} as any;

  static user01_at_TestL02_data = {} as any;
  static user02_at_TestL02_data = {} as any;

  static user96_at_TestL98_data = {} as any;
  static user97_at_TestL98_data = {} as any;
  static user98_at_TestL98_data = {} as any;

  static upload_binary_data = {} as any; //{ "admin01@system.net_tiger" : { "Id": .... } }

  static userRequestServiceV1: UserRequestServiceV1 = null;
  static userGroupRequestServiceV1: UserGroupRequestServiceV1 = null;
  static systemSecurityAuthenticationServiceV1: SystemSecurityAuthenticationServiceV1 = null;
  static binaryRequestServiceV1: BinaryRequestServiceV1 = null;

  static formatSequence( intSequence: number ): string {

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

  static saveInput( strFileName: string, inputs: any ) {

    try {

      const strPath = SystemUtilities.baseRootPath +
                      "/test/standalone/result/" +
                      os.hostname + "/" +
                      SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_08 ) +
                      "/";

      fs.mkdirSync( strPath, { recursive: true } );

      CommonTest.intSequence += 1;

      fs.writeFileSync( strPath + CommonTest.formatSequence( CommonTest.intSequence ) + "_" + strFileName + "_input.json", JSON.stringify( inputs, null, 2 ) );

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

  }

  static saveResult( strFileName: string, result: any ) {

    try {

      const strPath = SystemUtilities.baseRootPath +
                      "/test/standalone/result/" +
                      os.hostname + "/" +
                      SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_08 ) +
                      "/";

      fs.mkdirSync( strPath, { recursive: true } );

      fs.writeFileSync( strPath + CommonTest.formatSequence( CommonTest.intSequence ) + "_" + strFileName + "_result.json", JSON.stringify( result, null, 2 ) );

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

  }

  static checkTokens( strCurrentTokens: string,
                      strTokensToCheck: string ): boolean {

    return CommonUtilities.isInMultiSimpleList( strCurrentTokens,
                                                ",",
                                                strTokensToCheck,
                                                false,
                                                null );

  }

  static myAssert( bCondition: boolean,
                   strMessageSuccess: string,
                   strMessageFail: string ) {

    if ( bCondition ) {

      if ( CommonTest.strOutputFormat === "json" ) {

        const jsonOutput = {
                            Kind: "Result",
                            Code: "Success",
                            Message: strMessageSuccess.split( ": " )[ 1 ],
                            Mark: strMessageSuccess.split( ": " )[ 0 ],
                          }

        console.log( jsonOutput );

      }
      else {

        console.log( logSymbols.success, chalk.green( strMessageSuccess ) );

      }

    }
    else {

      //assert( false, logSymbols.error + " " + chalk.red( strMessageFail ) );
      if ( CommonTest.strOutputFormat === "json" ) {

        const jsonOutput = {
                            Kind: "Result",
                            Code: "Failed",
                            Message: strMessageFail.split( ": " )[ 1 ],
                            Mark: strMessageFail.split( ": " )[ 0 ],
                          }

        console.log( jsonOutput );

      }

      throw new Error( strMessageFail );

    }

  }

  static consoleLog( strKind: string, data: any ) {

    if ( CommonTest.strOutputFormat === "json" ) {

      const jsonOutput = {
                          Kind: strKind.split( "." )[ 0 ],
                          Code: null,
                          Message: data instanceof Error ? data.message : data,
                          Mark: null
                        }

      console.log( jsonOutput );

    }
    else {

      if ( strKind.endsWith( ".blue" ) ) {

        console.log( chalk.blue( data ) );

      }
      else if ( strKind.endsWith( ".red" ) ) {

        console.log( chalk.blue( data ) );

      }
      else if ( strKind.endsWith( ".green" ) ) {

        console.log( chalk.blue( data ) );

      }
      else if ( data instanceof Error ) {

        console.log( logSymbols.error + " " + chalk.red( data.message ) );

      }
      else {

        console.log( data );

      }

    }

  }

}