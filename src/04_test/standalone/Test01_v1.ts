require( "dotenv" ).config(); //Read the .env file, in the root folder of project

//import fs from "fs"; //Load the filesystem module
//import os from "os"; //Load the os module
//import cluster from "cluster";

import { Sequelize as OriginSequelize } from "sequelize";

//const assert = require("assert").strict;
import appRoot from "app-root-path";

//import fetch from "node-fetch";
//import FormData from "form-data";

//import logSymbols from "log-symbols";
//import chalk from "chalk";

//import CommonConstants from "../../02_system/common/CommonConstants";
//import CommonUtilities from "../../02_system/common/CommonUtilities";

import SystemUtilities from "../../02_system/common/SystemUtilities";

import CommonTest from "./CommonTest";

import { UserRequestServiceV1 } from "./UserRequestServiceV1";
import { UserGroupRequestServiceV1 } from "./UserGroupRequestServiceV1";
import { SystemSecurityAuthenticationServiceV1 } from "./SystemSecurityAuthenticationServiceV1";
import { BinaryRequestServiceV1 } from "./BinaryRequestServiceV1";
import { DatabaseRequestServiceV1 } from "./DatabaseRequestServiceV1";

import UserTestV1 from "./UserTestV1";
import BinaryTestV1 from "./BinaryTestV1";
import UserGroupTestV1 from "./UserGroupTestV1";
import SecurityAuthenticationTestV1 from "./SecurityAuthenticationTestV1";
import DatabaseTestV1 from "./DatabaseTestV1";

//const debug = require( "debug" )( "test01_test_api" );

async function test_phase_clean() {

  //const strCondition = OriginSequelize.literal( "\\"Tag\\":\\".*#UserGroupTestV1#.*\\"" );

  CommonTest.myAssert( await DatabaseTestV1.test_search_sysUserGroups( CommonTest.headers_adminXX_at_system_net,
                                                                       "SUCCESS_SEARCH",
                                                                       "5B46340C7336",
                                                                       "5B46340C7336_test_search_sysUserGroup_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                                       false,
                                                                       encodeURIComponent(
                                                                                           JSON.stringify(
                                                                                                           {
                                                                                                             "$or": [
                                                                                                                      {
                                                                                                                        "ExtraData": {
                                                                                                                                       "$regexp": `'\\\\\\\\"Tag\\\\\\\\":\\\\\\\\".*#UserGroupTestV1#.*\\\\\\\\"'`
                                                                                                                                     }
                                                                                                                      },
                                                                                                                      {
                                                                                                                        "ExtraData": {
                                                                                                                                       "$regexp": `'\\\\\\\\"Tag\\\\\\\\":\\\\\\\\".*#UserTestV1#.*\\\\\\\\"'`
                                                                                                                                     }
                                                                                                                      }
                                                                                                                    ],
                                                                                                             "$literals": [
                                                                                                                "$or->@__index__@:0->ExtraData->@__value__@:$regexp",
                                                                                                                "$or->@__index__@:1->ExtraData->@__value__@:$regexp"
                                                                                                             ]
                                                                                                           }
                                                                                                         )
                                                                                         ),
                                                                       CommonTest.strStartUser + "_sysUserGroup_Data",
                                                                       CommonTest.database_data ),
                       "5B46340C7336: Search with user " + CommonTest.strStartUser + " in table sysUserGroup is OK",
                       "5B46340C7336: Search with user " + CommonTest.strStartUser + " in table sysUserGroup is FAILED" );

  CommonTest.myAssert( await DatabaseTestV1.test_search_sysPerson( CommonTest.headers_adminXX_at_system_net,
                                                                   "SUCCESS_SEARCH",
                                                                   "A721E6F2E483_test_search_sysPerson_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                                   false,
                                                                   encodeURIComponent(
                                                                                       JSON.stringify(
                                                                                                       {
                                                                                                         "ExtraData": {
                                                                                                                        "$regexp": `'\\\\\\\\"Tag\\\\\\\\":\\\\\\\\".*#UserTestV1#.*\\\\\\\\"'`
                                                                                                                      },
                                                                                                         "$literals": [
                                                                                                           "ExtraData->@__value__@:$regexp",
                                                                                                         ]
                                                                                                       }
                                                                                                     )
                                                                                     ),
                                                                   CommonTest.strStartUser + "_sysPerson_Data",
                                                                   CommonTest.database_data ),
                       "A721E6F2E483: Search with user " + CommonTest.strStartUser + " in table sysPerson is OK",
                       "A721E6F2E483: Search with user " + CommonTest.strStartUser + " in table sysPerson is FAILED" );

  CommonTest.myAssert( await DatabaseTestV1.test_search_sysBinaryIndex( CommonTest.headers_adminXX_at_system_net,
                                                                        "SUCCESS_SEARCH",
                                                                        "AF71A6C0E494_test_search_sysBinaryIndex_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                                        false,
                                                                        encodeURIComponent(
                                                                                            JSON.stringify(
                                                                                                            {
                                                                                                              "Category": {
                                                                                                                            "$eq": "BinaryTestL01_Image"
                                                                                                                          }
                                                                                                            }
                                                                                                          )
                                                                                          ),
                                                                        CommonTest.strStartUser + "_sysBinaryIndex_Data",
                                                                        CommonTest.database_data ),
                       "AF71A6C0E494: Search with user " + CommonTest.strStartUser + " in table sysBinaryIndex is OK",
                       "AF71A6C0E494: Search with user " + CommonTest.strStartUser + " in table sysBinaryIndex is FAILED" );

  if ( CommonTest.database_data[ CommonTest.strStartUser + "_sysUserGroup_Data" ].length > 0 ) {

    CommonTest.consoleLog( "Warning.yellow", "70D46D9E73A9: Data rows found in table sysUserGroup. Maybe from old fail test run?.", "warning" );

    CommonTest.myAssert( await DatabaseTestV1.test_deleteBulk( CommonTest.headers_adminXX_at_system_net,
                                                               "SUCCESS_BULK_DELETE",
                                                               "70D46D9E73A9_test_deleteBulk_sysUserGroup_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                               false,
                                                               "sysUserGroup",
                                                               CommonTest.strStartUser + "_sysUserGroup_Data",
                                                               CommonTest.database_data ),
                         "70D46D9E73A9: Bulk delete with user " + CommonTest.strStartUser + " in table sysUserGroup is OK",
                         "70D46D9E73A9: Bulk delete with user " + CommonTest.strStartUser + " in table sysUserGroup is FAILED" );

  }
  else {

    CommonTest.consoleLog( "Message.green", "833C4AF7A007: NOT data rows found in table sysUserGroup." );

  }

  if ( CommonTest.database_data[ CommonTest.strStartUser + "_sysPerson_Data" ].length > 0 ) {

    CommonTest.consoleLog( "Warning.yellow", "4201EFC54E66: Data rows found in table sysPerson. Maybe from old fail test run?.", "warning" );

    CommonTest.myAssert( await DatabaseTestV1.test_deleteBulk( CommonTest.headers_adminXX_at_system_net,
                                                               "SUCCESS_BULK_DELETE",
                                                               "487E9137E1F8_test_deleteBulk_sysPerson_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                               false,
                                                               "sysPerson",
                                                               CommonTest.strStartUser + "_sysPerson_Data",
                                                               CommonTest.database_data ),
                         "487E9137E1F8: Bulk delete with user " + CommonTest.strStartUser + " in table sysPerson is OK",
                         "487E9137E1F8: Bulk delete with user " + CommonTest.strStartUser + " in table sysPerson is FAILED" );

  }
  else {

    CommonTest.consoleLog( "Message.green", "18E1088E3195: NOT data rows found in table sysPerson." );

  }

  if ( CommonTest.database_data[ CommonTest.strStartUser + "_sysBinaryIndex_Data" ].length > 0 ) {

    CommonTest.consoleLog( "Warning.yellow", "5EA5925A4BB0: Data rows found in table sysBinaryIndex. Maybe from old fail test run?.", "warning" );

    CommonTest.myAssert( await DatabaseTestV1.test_deleteBulk( CommonTest.headers_adminXX_at_system_net,
                                                               "SUCCESS_BULK_DELETE",
                                                               "238348AC0B05_test_deleteBulk_sysBinaryIndex_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                               false,
                                                               "sysBinaryIndex",
                                                               CommonTest.strStartUser + "_sysBinaryIndex_Data",
                                                               CommonTest.database_data ),
                         "238348AC0B05: Bulk delete with user " + CommonTest.strStartUser + " in table sysBinaryIndex is OK",
                         "238348AC0B05: Bulk delete with user " + CommonTest.strStartUser + " in table sysBinaryIndex is FAILED" );

  }
  else {

    CommonTest.consoleLog( "Message.green", "AA3280663458: NOT data rows found in table sysBinaryIndex." );

  }

  //Regular expresion in jsavascript and PCRE
  //'\\"Tag\\":\\".*#UserTestV1#.*\\"'

  //Old version NOT work
  //SELECT * FROM BackendServer01DB.sysUserGroup Where ExtraData REGEXP '\s*"Tag":".*#UserGroupTestV1#.*"' Or ExtraData REGEXP '\s*"Tag":".*#UserTestV1#.*"';
  //SELECT * FROM BackendServer01DB.sysPerson Where ExtraData REGEXP '\s*"Tag":".*#UserTestV1#.*"';
  //SELECT * FROM BackendServer01DB.sysBinaryIndex Where Category = "BinaryTestL01_Image";

  //New Version
  //SELECT * FROM BackendServer01DB.sysUserGroup Where ExtraData REGEXP '\\\\"Tag\\\\":\\\\".*#UserGroupTestV1#.*\\\\"' Or ExtraData REGEXP '\\\\"Tag\\\\":\\\\".*#UserTestV1#.*\\\\"'

}

async function test_v1_phase01() {

  CommonTest.consoleLog( "Separator.blue", ">********************" + CommonTest.strStartUser + "********************<", "none" );

  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_login( CommonTest.headers_adminXX_at_system_net,
                                                                      {
                                                                        Name: "noexistent@noexistent",
                                                                        Password: "1234567890" //Force to fail the login
                                                                      },
                                                                      "ERROR_LOGIN_FAILED",
                                                                      "C908EC12AC83",
                                                                      "C908EC12AC83_test_login_noexistent@noexistent_fail",
                                                                      true ),
                       "C908EC12AC83: Login with user noexistent@noexistent is OK with the fail",
                       "C908EC12AC83: Login with user noexistent@noexistent is FAILED" );

  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_login( CommonTest.headers_adminXX_at_system_net,
                                                                      {
                                                                        Name: CommonTest.strStartUser,
                                                                        Password: CommonTest.strStartPassword + "1" //Force to fail the login
                                                                      },
                                                                      "ERROR_LOGIN_FAILED",
                                                                      "185E24354C2F",
                                                                      "185E24354C2F_test_login_" + CommonTest.strStartUser.replace( ".", "_" ) + "_fail",
                                                                      true ),
                       "185E24354C2F: Login with user " + CommonTest.strStartUser + " is OK with the fail",
                       "185E24354C2F: Login with user " + CommonTest.strStartUser + " is FAILED" );

  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_login( CommonTest.headers_adminXX_at_system_net,
                                                                      {
                                                                        Name: CommonTest.strStartUser,
                                                                        Password: CommonTest.strStartPassword
                                                                      },
                                                                      "SUCCESS_LOGIN",
                                                                      "EF56F748EC63",
                                                                      "EF56F748EC63_test_login_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                                      false ),
                       "EF56F748EC63: Login with user " + CommonTest.strStartUser + " is OK",
                       "EF56F748EC63: Login with user " + CommonTest.strStartUser + " is FAILED" );

  await test_phase_clean();

  //Fail because cannot delete yourself
  CommonTest.myAssert( await UserTestV1.test_deleteUser( CommonTest.headers_adminXX_at_system_net,
                                                         { Name: CommonTest.strStartUser },
                                                         "ERROR_USER_NOT_VALID",
                                                         "205EA3237080",
                                                         "205EA3237080_test_deleteUser_" + CommonTest.strStartUser.replace( ".", "_" ) + "_fail" ),
                       "205EA3237080: Delete of the user " + CommonTest.strStartUser + " is OK with the fail",
                       "205EA3237080: Delete of the user " + CommonTest.strStartUser + " is FAILED" );

  //Fail because cannot disable yourself
  CommonTest.myAssert( await UserTestV1.test_disableBulkUser( CommonTest.headers_adminXX_at_system_net,
                                                              {
                                                                bulk: [
                                                                        {
                                                                          Name: CommonTest.strStartUser
                                                                        },
                                                                      ]
                                                              },
                                                              "ERROR_BULK_USER_DISABLE",
                                                              "F80AEB410009",
                                                              "F80AEB410009_test_disableBulkUser_" + CommonTest.strStartUser.replace( ".", "_" ) + "_fail",
                                                              true ),
                       "F80AEB410009: Bulk disable of the user " + CommonTest.strStartUser + " is OK with the fail",
                       "F80AEB410009: Bulk disable of the user " + CommonTest.strStartUser + " is FAILED" );

  //Fail because cannot enable yourself
  CommonTest.myAssert( await UserTestV1.test_enableBulkUser( CommonTest.headers_adminXX_at_system_net,
                                                             {
                                                               bulk: [
                                                                       { Name: CommonTest.strStartUser },
                                                                     ]
                                                             },
                                                             "ERROR_BULK_USER_ENABLE",
                                                             "7862BE0C629A",
                                                             "7862BE0C629A_test_enableBulkUser_" + CommonTest.strStartUser.replace( ".", "_" ) + "_fail",
                                                             true ),
                       "7862BE0C629A: Bulk enable of the user " + CommonTest.strStartUser + " is OK with the fail",
                       "7862BE0C629A: Bulk enable of the user " + CommonTest.strStartUser + " is FAILED" );

  //Fail because cannot move yourself
  CommonTest.myAssert( await UserTestV1.test_moveBulkUser( CommonTest.headers_adminXX_at_system_net,
                                                           {
                                                             bulk: [
                                                                     {
                                                                       Name: CommonTest.strStartUser,
                                                                       sysUserGroup: {
                                                                         Name: "Business_Managers"
                                                                       }
                                                                     }
                                                                   ]
                                                           },
                                                           "ERROR_BULK_USER_MOVE",
                                                           "2F8ECA7DF210",
                                                           "2F8ECA7DF210_test_moveBulkUser_" + CommonTest.strStartUser.replace( ".", "_" ) + "_fail" ),
                       "2F8ECA7DF210: Bulk move of the user " + CommonTest.strStartUser + " is OK with the fail",
                       "2F8ECA7DF210: Bulk move of the user " + CommonTest.strStartUser + " is FAILED" );

  //Fail because cannot move yourself
  CommonTest.myAssert( await UserTestV1.test_deleteBulkUser( CommonTest.headers_adminXX_at_system_net,
                                                             {
                                                               bulk: [
                                                                       { Name: CommonTest.strStartUser },
                                                                     ]
                                                             },
                                                             "ERROR_BULK_USER_DELETE",
                                                             "3F02B43CC0FF",
                                                             "3F02B43CC0FF_test_deleteBulkUser_" + CommonTest.strStartUser.replace( ".", "_" ) + "_fail" ),
                       "3F02B43CC0FF: Bulk delete of the user " + CommonTest.strStartUser + " is OK with the fail",
                       "3F02B43CC0FF: Bulk delete of the user " + CommonTest.strStartUser + " is FAILED" );

  //Fail because cannot the user not exists
  CommonTest.myAssert( await UserTestV1.test_deleteUser( CommonTest.headers_adminXX_at_system_net,
                                                         { Name: "noexitent@noexist" },
                                                         "ERROR_USER_NOT_FOUND",
                                                         "DFDA6A208BBB",
                                                         "DFDA6A208BBB_test_deleteUser_noexitent@noexist_fail" ),
                       "DFDA6A208BBB: Delete of the user noexitent@noexist is OK with the fail",
                       "DFDA6A208BBB: Delete of the user noexitent@noexist is FAILED" );

  //Fail because cannot disable yourself
  CommonTest.myAssert( await UserTestV1.test_disableBulkUser( CommonTest.headers_adminXX_at_system_net,
                                                              {
                                                                bulk: [
                                                                        { Name: "noexitent@noexist" },
                                                                      ]
                                                              },
                                                              "ERROR_BULK_USER_DISABLE",
                                                              "68932373522C",
                                                              "68932373522C_test_disableBulkUser_noexitent@noexist_fail",
                                                              true ),
                       "68932373522C: Bulk disable of the user noexitent@noexist is OK with the fail",
                       "68932373522C: Bulk disable of the user noexitent@noexist is FAILED" );

  //Fail because cannot enable yourself
  CommonTest.myAssert( await UserTestV1.test_enableBulkUser( CommonTest.headers_adminXX_at_system_net,
                                                             {
                                                               bulk: [
                                                                       { Name: "noexitent@noexist" },
                                                                     ]
                                                             },
                                                             "ERROR_BULK_USER_ENABLE",
                                                             "CA1441D19262",
                                                             "CA1441D19262_test_enableBulkUser_noexitent@noexist_fail",
                                                             true ),
                       "CA1441D19262: Bulk enable of the user noexitent@noexist is OK with the fail",
                       "CA1441D19262: Bulk enable of the user noexitent@noexist is FAILED" );

  //Fail because cannot move yourself
  CommonTest.myAssert( await UserTestV1.test_moveBulkUser( CommonTest.headers_adminXX_at_system_net,
                                                           {
                                                             bulk: [
                                                                     {
                                                                       Name: "noexitent@noexist",
                                                                       sysUserGroup: {
                                                                         Name: "Business_Managers"
                                                                       }
                                                                     }
                                                                   ]
                                                           },
                                                           "ERROR_BULK_USER_MOVE",
                                                           "0D56AF6F986F",
                                                           "0D56AF6F986F_test_moveBulkUser_noexitent@noexist_fail" ),
                       "0D56AF6F986F: Bulk move of the user noexitent@noexist is OK with the fail",
                       "0D56AF6F986F: Bulk move of the user noexitent@noexist is FAILED" );

  //Fail because cannot move yourself
  CommonTest.myAssert( await UserTestV1.test_deleteBulkUser( CommonTest.headers_adminXX_at_system_net,
                                                             {
                                                               bulk: [
                                                                       { Name: "noexitent@noexist" },
                                                                     ]
                                                             },
                                                             "ERROR_BULK_USER_DELETE",
                                                             "FE6CE80C2C83",
                                                             "FE6CE80C2C83_test_deleteBulkUser_noexitent@noexist_fail" ),
                       "FE6CE80C2C83: Bulk delete of the user noexitent@noexist is OK with the fail",
                       "FE6CE80C2C83: Bulk delete of the user noexitent@noexist is FAILED" );

}

async function test_v1_phase02() {

  CommonTest.myAssert( await BinaryTestV1.test_uploadImageTiger( CommonTest.headers_adminXX_at_system_net,
                                                                  "SUCCESS_BINARY_DATA_UPLOAD",
                                                                  "5143BE7B1AE1",
                                                                  "5143BE7B1AE1_test_uploadImageTiger_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                                  "admin01@system.net_tiger",
                                                                  { Mark: "5143BE7B1AE1" } ),
                                                                  "5143BE7B1AE1: Upload image tiger is OK",
                                                                  "5143BE7B1AE1: Upload image tiger is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_createAuth( CommonTest.headers_adminXX_at_system_net,
                                                           "SUCCESS_AUTH_TOKEN_CREATED",
                                                           "79991E80365A",
                                                           "79991E80365A_test_createAuth_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                           false ),
                       "79991E80365A: Create auth " + CommonTest.strStartUser + " is OK",
                       "79991E80365A: Create auth " + CommonTest.strStartUser + " is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_downloadImageThumbnail( CommonTest.headers_adminXX_at_system_net,
                                                                       "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                                       "D8C8CF834EE9",
                                                                       "D8C8CF834EE9_test_downloadImageTigerThumbnail_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                                       "admin01@system.net_tiger" ),
                       "D8C8CF834EE9: Download image thumbnail tiger " + CommonTest.strStartUser + " is OK",
                       "D8C8CF834EE9: Download image thumbnail tiger " + CommonTest.strStartUser + " is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_downloadImage( CommonTest.headers_adminXX_at_system_net,
                                                              "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                              "4E99438DE0A9",
                                                              "4E99438DE0A9_test_downloadImageTiger_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                              "admin01@system.net_tiger",
                                                              null ),
                       "4E99438DE0A9: Download image tiger " + CommonTest.strStartUser + " is OK",
                       "4E99438DE0A9: Download image tiger " + CommonTest.strStartUser + " is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_getImageDetails( CommonTest.headers_adminXX_at_system_net,
                                                                "SUCCESS_GET_BINARY_DATA_DETAILS",
                                                                "4D93C17B6B3C",
                                                                "4D93C17B6B3C_test_getImageDetailsTiger_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                                "admin01@system.net_tiger" ),
                       "4D93C17B6B3C: Get image details tiger " + CommonTest.strStartUser + " is OK",
                       "4D93C17B6B3C: Get image details tiger " + CommonTest.strStartUser + " is FAILED" );

  CommonTest.myAssert( await UserTestV1.test_deleteUser( CommonTest.headers_adminXX_at_system_net,
                                                         { Name: "noexists@systems.net" },
                                                         "ERROR_USER_NOT_FOUND",
                                                         "53CCEE8DDB93",
                                                         "53CCEE8DDB93_test_deleteUser_noexists@systems.net_fail" ),
                       "53CCEE8DDB93: Delete of the user noexists@systems.net is OK with the fail",
                       "53CCEE8DDB93: Delete of the user noexists@systems.net is FAILED" );

  //Fail to create the user user98@TestL98 because the user group user98_at_TestL98 not exists and Create = false in the section sysUserGroup
  CommonTest.myAssert( await UserTestV1.test_createUser_user98_at_TestL98( CommonTest.headers_adminXX_at_system_net,
                                                                           "ERROR_USER_GROUP_NOT_FOUND",
                                                                           "B7A8462E0A10",
                                                                           "B7A8462E0A10_test_createUser_user98_at_TestL98_fail",
                                                                           true,
                                                                           false, //<--- Not auto create the group and the group no exists
                                                                           false,
                                                                           true ),
                       "B7A8462E0A10: Creation of the user user98@TestL98 is OK with the fail",
                       "B7A8462E0A10: Creation of the user user98@TestL98 is FAILED" );

  //*** Create user user98@TestL98 ***
  //*** Create user group user98@TestL98 ***
  CommonTest.myAssert( await UserTestV1.test_createUser_user98_at_TestL98( CommonTest.headers_adminXX_at_system_net,
                                                                           "SUCCESS_USER_CREATE",
                                                                           "8CF2731F0EC9",
                                                                           "8CF2731F0EC9_test_createUser_user98_at_TestL98_success",
                                                                           false,
                                                                           true, //<--- Auto create the group user98@TestL98
                                                                           false,
                                                                           true ),
                      "8CF2731F0EC9: Creation of the user user98@TestL98 is OK",
                      "8CF2731F0EC9: Creation of the user user98@TestL98 is FAILED" );

  CommonTest.myAssert( await UserTestV1.test_deleteUser( CommonTest.headers_adminXX_at_system_net,
                                                         { Name: "user98@TestL98" },
                                                         "SUCCESS_USER_DELETE",
                                                         "C98802C4C4F0",
                                                         "C98802C4C4F0_test_deleteUser_user98@TestL98_success" ),
                       "C98802C4C4F0: Delete of the user user98@TestL98 is OK",
                       "C98802C4C4F0: Delete of the user user98@TestL98 is FAILED" );

  //Fail because the field Create = true in the section sysUserGroup
  CommonTest.myAssert( await UserTestV1.test_createUser_user98_at_TestL98( CommonTest.headers_adminXX_at_system_net,
                                                                           "ERROR_USER_GROUP_ALREADY_EXISTS",
                                                                           "C69088FEAC85",
                                                                           "C69088FEAC85_test_createUser_user98_at_TestL98_fail",
                                                                           true,
                                                                           true, //<--- Fail to try to create the group again
                                                                           false,
                                                                           true ),
                       "C69088FEAC85: Creation of the user user98@TestL98 is OK with the fail",
                       "C69088FEAC85: Creation of the user user98@TestL98 is FAILED" );

  //Success because the field Create = false in the section sysUserGroup
  CommonTest.myAssert( await UserTestV1.test_createUser_user98_at_TestL98( CommonTest.headers_adminXX_at_system_net,
                                                                           "SUCCESS_USER_CREATE",
                                                                           "0E21DC94A0AE",
                                                                           "0E21DC94A0AE_test_createUser_user98_at_TestL98_success",
                                                                           false,
                                                                           false, //<--- NOT try to create the group
                                                                           false,
                                                                           true ),
                       "0E21DC94A0AE: Creation of the user user98@TestL98 is OK with the fail",
                       "0E21DC94A0AE: Creation of the user user98@TestL98 is FAILED" );

  //Fail because the group is not empty, contains the user user98@TestL98
  CommonTest.myAssert( await UserGroupTestV1.test_deleteUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                   { Name: "user98@TestL98" },
                                                                   "ERROR_USER_GROUP_IS_NOT_USER_EMPTY",
                                                                   "84BC2BB9654B",
                                                                   "84BC2BB9654B_test_deleteUserGroup_user98@TestL98_fail" ),
                       "84BC2BB9654B: Delete of the user group user98@TestL98 is OK with the fail",
                       "84BC2BB9654B: Delete of the user group user98@TestL98 is FAILED" );

  //Delete the user user98@TestL98 the next test not fail
  CommonTest.myAssert( await UserTestV1.test_deleteUser( CommonTest.headers_adminXX_at_system_net,
                                                         { Name: "user98@TestL98" },
                                                         "SUCCESS_USER_DELETE",
                                                         "4BEA7143A94E",
                                                         "4BEA7143A94E_test_deleteUser_user98@TestL98_success" ),
                       "4BEA7143A94E: Delete of the user user98@TestL98 is OK",
                       "4BEA7143A94E: Delete of the user user98@TestL98 is FAILED" );

  //Success because the group is now empty
  CommonTest.myAssert( await UserGroupTestV1.test_deleteUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                   { Name: "user98@TestL98" },
                                                                   "SUCCESS_USER_GROUP_DELETE",
                                                                   "A878B5F98A65",
                                                                   "A878B5F98A65_test_deleteUserGroup_user98@TestL98_success" ),
                       "A878B5F98A65: Delete of the user group user98@TestL98 is OK",
                       "A878B5F98A65: Delete of the user group user98@TestL98 is FAILED" );

  //Fail because try create the user user01@TestL01 and the user group TestL01, the field create of section sysGroup is false.
  CommonTest.myAssert( await UserTestV1.test_createUser_user01_at_TestL01( CommonTest.headers_adminXX_at_system_net,
                                                                           "ERROR_USER_GROUP_NOT_FOUND",
                                                                           "EAD546813A1F",
                                                                           "EAD546813A1F_test_createUser_user01@TestL01_fail" ),
                       "EAD546813A1F: Creation of the user user01@TestL01 is OK with the fail",
                       "EAD546813A1F: Creation of the user user01@TestL01 is FAILED" );

  //*** Create the user user01@TestL01 ***
  CommonTest.myAssert( await UserTestV1.test_createUser_user01_at_TestL01_success( CommonTest.headers_adminXX_at_system_net, "B731A9223B34" ),
                       "B731A9223B34: Creation of the user user01@TestL01 is OK",
                       "B731A9223B34: Creation of the user user01@TestL01 is FAILED" );

  //Fail because tray to create again the user user01@TestL01
  CommonTest.myAssert( await UserTestV1.test_createUser_user01_at_TestL01_again_fail( CommonTest.headers_adminXX_at_system_net, "19DCE3E52AE7" ),
                       "19DCE3E52AE7: Creation of the user user01@TestL01 again is OK with the fail",
                       "19DCE3E52AE7: Creation of the user user01@TestL01 again is FAILED" );

  CommonTest.myAssert( await UserTestV1.test_createUser_user_group_TestL01_again_fail( CommonTest.headers_adminXX_at_system_net, "B0C1F9DAA60C" ),
                       "B0C1F9DAA60C: Creation of the user group TestL01 again is OK with the fail",
                       "B0C1F9DAA60C: Creation of the user group TestL01 again is FAILED" );

  //Change the name of the user from user01@TestL01 -> user99@TestL02
  //*** Create the user group TestL02 ****
  //Change the user group name from TestL01 => TestL02
  CommonTest.myAssert( await UserTestV1.test_updateUser_user01_at_TestL01_success( CommonTest.headers_adminXX_at_system_net, CommonTest.user01_at_TestL01_data, "7A15DFC05C45" ),
                       "7A15DFC05C45: Update of the user user01@TestL01 is OK",
                       "7A15DFC05C45: Update of the user user01@TestL01 is FAILED" );

  //Try to change the name of the user from user99@TestL02 -> user01@TestL01 BUT
  //Fail because try again to create the userGroup TestL02, the field create of section sysGroup is true.
  CommonTest.myAssert( await UserTestV1.test_updateUser_user99_at_TestL02_fail( CommonTest.headers_adminXX_at_system_net, CommonTest.user01_at_TestL01_data, "F51C021137D4" ),
                       "F51C021137D4: Update of the user user99@TestL02 is OK with the fail",
                       "F51C021137D4: Update of the user user99@TestL02 is FAILED" );

  //Change the name of the user from user99@TestL02 -> user01@TestL01
  //Change the user group from TestL02 => TestL01, the field create of section sysGroup is false.
  //Restricted the number of session to one sysUser.SessionsLimit = 1
  CommonTest.myAssert( await UserTestV1.test_updateUser_user99_at_TestL02_success( CommonTest.headers_adminXX_at_system_net, CommonTest.user01_at_TestL01_data, "84945A9B59D0" ),
                       "84945A9B59D0: Update of the user user02@TestL02 is OK",
                       "84945A9B59D0: Update of the user user02@TestL02 is FAILED" );

  CommonTest.myAssert( await UserTestV1.test_searchUser( CommonTest.headers_adminXX_at_system_net,
                                                         {  },
                                                         "SUCCESS_SEARCH",
                                                         "FA89A381FFA5",
                                                         "FA89A381FFA5_test_search_user_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                         1,
                                                         5 ),
                       "FA89A381FFA5: Search of the user " + CommonTest.strStartUser + " is OK",
                       "FA89A381FFA5: Search of the user " + CommonTest.strStartUser + " is FAILED" );

  CommonTest.myAssert( await UserTestV1.test_searchCountUser( CommonTest.headers_adminXX_at_system_net,
                                                              {  },
                                                              "SUCCESS_SEARCH_COUNT",
                                                              "95F1AB5D6C89",
                                                              "95F1AB5D6C89_test_search_count_user_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                              1,
                                                              5 ),
                       "95F1AB5D6C89: Search count of the user " + CommonTest.strStartUser + " is OK",
                       "95F1AB5D6C89: Search count of the user " + CommonTest.strStartUser + " is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_searchUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                   {  },
                                                                   "SUCCESS_SEARCH",
                                                                   "CD546F4F0552",
                                                                   "CD546F4F0552_test_search_user_group_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                                   1,
                                                                   2,
                                                                   false ),
                       "CD546F4F0552: Search of the user group " + CommonTest.strStartUser + " is OK",
                       "CD546F4F0552: Search of the user group " + CommonTest.strStartUser + " is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_searchCountUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                        {  },
                                                                        "SUCCESS_SEARCH_COUNT",
                                                                        "2487E4D62455",
                                                                        "2487E4D62455_test_search_count_user_group_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                                        1,
                                                                        2,
                                                                        false ),
                       "2487E4D62455: Search count of the user group " + CommonTest.strStartUser + " is OK",
                       "2487E4D62455: Search count of the user group " + CommonTest.strStartUser + " is FAILED" );

  //*** Create the user user01@TestL02 ****
  CommonTest.myAssert( await UserTestV1.test_createUser_user01_at_TestL02_success( CommonTest.headers_adminXX_at_system_net, "8146E721C710" ),
                       "8146E721C710: Creation of the user user01@TestL02 is OK",
                       "8146E721C710: Creation of the user user01@TestL02 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_setSettings( CommonTest.headers_adminXX_at_system_net,
                                                               {  },
                                                               {
                                                                 "Key01": "Value01",
                                                                 "Key02": "Value02",
                                                                },
                                                               "SUCCESS_SET_SETTINGS",
                                                               "30154B37C1B4",
                                                               "30154B37C1B4_test_set_settings_System_Administrators_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                               [
                                                                 "Key01",
                                                                 "Key02"
                                                               ],
                                                               [
                                                                 "Value01",
                                                                 "Value02"
                                                               ],
                                                               false ),
                       "30154B37C1B4: Set settings of the user group System_Administrators using user " + CommonTest.strStartUser + " is OK",
                       "30154B37C1B4: Set settings of the user group System_Administrators using user " + CommonTest.strStartUser + " is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_getSettings( CommonTest.headers_adminXX_at_system_net,
                                                               {  },
                                                               "SUCCESS_GET_SETTINGS",
                                                               "91C6E5CC24BB",
                                                               "91C6E5CC24BB_test_get_settings_System_Administrators_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                               [
                                                                 "Key01",
                                                                 "Key02"
                                                               ],
                                                               [
                                                                 "Value01",
                                                                 "Value02"
                                                               ] ),
                       "91C6E5CC24BB: Get settings of the user group System_Administrators using user " + CommonTest.strStartUser + " is OK",
                       "91C6E5CC24BB: Get settings of the user group System_Administrators using user " + CommonTest.strStartUser + " is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_createUserGroup_TestL55( CommonTest.headers_adminXX_at_system_net,
                                                                           "SUCCESS_USER_GROUP_CREATE",
                                                                           "C2E838C6422D",
                                                                           "C2E838C6422D_test_createUserGroup_TestL55_success",
                                                                           false,
                                                                           false ),
                       "C2E838C6422D: Create the user group TestL55 is OK",
                       "C2E838C6422D: Create of the user group TestL55 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_updateUserGroup_TestL55( CommonTest.headers_adminXX_at_system_net,
                                                                           "SUCCESS_USER_GROUP_UPDATE",
                                                                           "784793DCC7D4_test_createUserGroup_TestL55_success",
                                                                           CommonTest.TestL55_data,
                                                                           false,
                                                                           false ),
                       "784793DCC7D4: Update the user group TestL55 is OK",
                       "784793DCC7D4: Update the user group TestL55 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_getUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                {
                                                                  Name: "TestL45"
                                                                },
                                                                "SUCCESS_GET_USER_GROUP",
                                                                "BF22EA1E9935",
                                                                "BF22EA1E9935_test_getUserGroup_TestL55_success",
                                                                false ),
                       "BF22EA1E9935: Get the user group TestL45 is OK",
                       "BF22EA1E9935: Get the user group TestL45 is FAILED" );

  //Success because the group is now empty
  CommonTest.myAssert( await UserGroupTestV1.test_deleteUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                   { Name: "TestL45" },
                                                                   "SUCCESS_USER_GROUP_DELETE",
                                                                   "41D7D612B5CB",
                                                                   "41D7D612B5CB_test_deleteUserGroup_TestL55_success" ),
                       "41D7D612B5CB: Delete of the user group TestL55 is OK",
                       "41D7D612B5CB: Delete of the user group TestL55 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_createUserGroup_TestL55( CommonTest.headers_adminXX_at_system_net,
                                                                           "SUCCESS_USER_GROUP_CREATE",
                                                                           "9A074AFBF38C",
                                                                           "9A074AFBF38C_test_createUserGroup_TestL55_success",
                                                                           false,
                                                                           false ),
                       "9A074AFBF38C: Create the user group TestL55 is OK",
                       "9A074AFBF38C: Create of the user group TestL55 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_createUserGroup_TestL56( CommonTest.headers_adminXX_at_system_net,
                                                                           "SUCCESS_USER_GROUP_CREATE",
                                                                           "AFD88CE84697",
                                                                           "AFD88CE84697_test_createUserGroup_TestL56_success",
                                                                           false,
                                                                           false ),
                       "AFD88CE84697: Create the user group TestL56 is OK",
                       "AFD88CE84697: Create of the user group TestL56 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_createUserGroup_TestL57( CommonTest.headers_adminXX_at_system_net,
                                                                           "SUCCESS_USER_GROUP_CREATE",
                                                                           "9E0923B4E796_test_createUserGroup_TestL57_success",
                                                                           false,
                                                                           false ),
                       "9E0923B4E796: Create the user group TestL57 is OK",
                       "9E0923B4E796: Create of the user group TestL57 is FAILED" );


  CommonTest.myAssert( await UserGroupTestV1.test_updateUserGroup_TestL57( CommonTest.headers_adminXX_at_system_net,
                                                                           "SUCCESS_USER_GROUP_UPDATE",
                                                                           "2D1944EAE1BE_test_updateUserGroup_TestL57_success",
                                                                           CommonTest.TestL57_data,
                                                                           false,
                                                                           false ),
                       "2D1944EAE1BE: Update the user group TestL57 is OK",
                       "2D1944EAE1BE: Update of the user group TestL57 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_disableBulkUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                        {
                                                                          bulk: [
                                                                                  { Id: CommonTest.TestL55_data.Id },
                                                                                  { Id: CommonTest.TestL56_data.Id },
                                                                                  { Id: CommonTest.TestL57_data.Id }
                                                                                ]
                                                                        },
                                                                        "SUCCESS_BULK_USER_GROUP_DISABLE",
                                                                        "43DAF6776FCA_test_disableBulkUserGroup_TestL5X_success",
                                                                        false ),
                       "43DAF6776FCA: Bulk disable of the user group TestL5X is OK",
                       "43DAF6776FCA: Bulk disable of the user group TestL5X is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_enableBulkUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                       {
                                                                         bulk: [
                                                                                 { Id: CommonTest.TestL55_data.Id },
                                                                                 { Id: CommonTest.TestL56_data.Id },
                                                                                 { Id: CommonTest.TestL57_data.Id }
                                                                               ]
                                                                       },
                                                                       "SUCCESS_BULK_USER_GROUP_ENABLE",
                                                                       "F687E4496FBC_test_enableBulkUserGroup_TestL5X_success",
                                                                       false ),
                       "F687E4496FBC: Bulk enable of the user group TestL5X is OK",
                       "F687E4496FBC: Bulk enable of the user group TestL5X is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_deleteBulkUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                       {
                                                                         bulk: [
                                                                                 { Id: CommonTest.TestL55_data.Id },
                                                                                 { Id: CommonTest.TestL56_data.Id },
                                                                                 { Id: CommonTest.TestL57_data.Id }
                                                                               ]
                                                                       },
                                                                       "SUCCESS_BULK_USER_GROUP_DELETE",
                                                                       "B4A86820CB65_test_deleteBulkUserGroup_TestL5X_success",
                                                                       false ),
                       "B4A86820CB65: Bulk delete of the user group TestL5X is OK",
                       "B4A86820CB65: Bulk delete of the user group TestL5X is FAILED" );

  //Fail beacuse cannot disable your own group
  CommonTest.myAssert( await UserGroupTestV1.test_disableBulkUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                        {
                                                                          bulk: [
                                                                                  { Name: "System_Administrators" },
                                                                                ]
                                                                        },
                                                                        "ERROR_BULK_USER_GROUP_DISABLE",
                                                                        "C9EE6CEEE392_test_disableBulkUserGroup_System_Administrators_fail",
                                                                        true ),
                       "C9EE6CEEE392: Bulk disable of the user group System_Administrators is OK with the fail",
                       "C9EE6CEEE392: Bulk disable of the user group System_Administrators is FAILED" );

  //Fail beacuse cannot enable your own group
  CommonTest.myAssert( await UserGroupTestV1.test_enableBulkUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                        {
                                                                          bulk: [
                                                                                  { Name: "System_Administrators" },
                                                                                ]
                                                                        },
                                                                        "ERROR_BULK_USER_GROUP_ENABLE",
                                                                        "F687E4496FBC_test_enableBulkUserGroup_System_Administrators_fail",
                                                                        true ),
                       "F687E4496FBC: Bulk enable of the user group System_Administrators is OK with the fail",
                       "F687E4496FBC: Bulk enable of the user group System_Administrators is FAILED" );

  //Fail beacuse cannot delete your own group
  CommonTest.myAssert( await UserGroupTestV1.test_deleteBulkUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                       {
                                                                         bulk: [
                                                                                  { Name: "System_Administrators" },
                                                                               ]
                                                                       },
                                                                       "ERROR_BULK_USER_GROUP_DELETE",
                                                                       "8B78C8472833_test_deleteBulkUserGroup_System_Administrators_fail",
                                                                       true ),
                       "8B78C8472833: Bulk delete of the user group System_Administrators is OK with the fail",
                       "8B78C8472833: Bulk delete of the user group System_Administrators is FAILED" );

  //Fail beacuse cannot delete your own group
  CommonTest.myAssert( await UserGroupTestV1.test_deleteUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                   { Name: "System_Administrators" },
                                                                   "ERROR_USER_GROUP_IS_NOT_USER_EMPTY",
                                                                   "ED671119B620",
                                                                   "ED671119B620_test_deleteUserGroup_System_Administrators_fail" ),
                       "ED671119B620: Delete of the user group System_Administrators is OK with the fail",
                       "ED671119B620: Delete of the user group System_Administrators is FAILED" );

}

export async function test_v1_phase03() {

  CommonTest.consoleLog( "Separator.blue", ">******************** user01@TestL01 ********************<", "none" );

  CommonTest.headers_user01_at_TestL01_Session1.Authorization = "12345"; //Create invalid authentication token

  //Fail because the user user01@TestL01 no valid session
  CommonTest.myAssert( await UserTestV1.test_deleteUser( CommonTest.headers_user01_at_TestL01_Session1,
                                                         {
                                                           Id: CommonTest.user02_at_TestL01_data.Id
                                                         },
                                                         "ERROR_INVALID_AUTHORIZATION_TOKEN",
                                                         "54259F9D648F",
                                                         "54259F9D648F_test_deleteUser_user02_at_TestL01_fail" ),
                       "54259F9D648F: Delete of the user user01@TestL01 is OK with the fail",
                       "54259F9D648F: Delete of the user user01@TestL01 is FAILED" );

  //Open first session
  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_login( CommonTest.headers_user01_at_TestL01_Session2,
                                                                      {
                                                                        Name: CommonTest.user01_at_TestL01_data.Name,
                                                                        Password: CommonTest.user01_at_TestL01_data.Password
                                                                      },
                                                                      "SUCCESS_LOGIN",
                                                                      "2F5DF2F9A47A",
                                                                      "2F5DF2F9A47A_test_login_user01@TestL01_success",
                                                                      false ),
                       "2F5DF2F9A47A: Login with user user01@TestL01 is OK",
                       "2F5DF2F9A47A: Login with user user01@TestL01 is FAILED" );

  //This session is now valid
  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_token( CommonTest.headers_user01_at_TestL01_Session2,
                                                                      "SUCCESS_TOKEN_IS_VALID",
                                                                      "3A5192B612AD",
                                                                      "3A5192B612AD_test_token_user01@TestL01_success" ),
                       "3A5192B612AD: Token check with user user01@TestL01 is OK",
                       "3A5192B612AD: Token check user user01@TestL01 is FAILED" );

  //Open a second session, and invalidate the first session, sysUser.SessionsLimit = 1
  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_login( CommonTest.headers_user01_at_TestL01_Session1,
                                                                      {
                                                                        Name: CommonTest.user01_at_TestL01_data.Name,
                                                                        Password: CommonTest.user01_at_TestL01_data.Password
                                                                      },
                                                                      "SUCCESS_LOGIN",
                                                                      "3336E84BAEF2",
                                                                      "3336E84BAEF2_test_login_user01@TestL01_success",
                                                                      false ),
                       "3336E84BAEF2: Login with user user01@TestL01 is OK",
                       "3336E84BAEF2: Login with user user01@TestL01 is FAILED" );

  //Fail because this user has user session limit = 1, sysUser.SessionsLimit = 1
  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_token( CommonTest.headers_user01_at_TestL01_Session2,
                                                                      "ERROR_LOGGED_OUT_AUTHORIZATION_TOKEN",
                                                                      "AC4E098E2E7B",
                                                                      "AC4E098E2E7B_test_token_user01@TestL01_fail" ),
                       "AC4E098E2E7B: Token check with user user01@TestL01 is OK with the fail",
                       "AC4E098E2E7B: Token check user user01@TestL01 is FAILED" );

  CommonTest.myAssert( await UserTestV1.test_profile_at_less_one_role( CommonTest.headers_user01_at_TestL01_Session1,
                                                                       [
                                                                         "#Master_L01#"
                                                                       ],
                                                                       "SUCCESS_GET_SESSION_PROFILE",
                                                                       "CDA84E5562F3",
                                                                       "CDA84E5562F3_test_profile_role_user01@TestL01_success",
                                                                       false ),
                       "CDA84E5562F3: The user user01@TestL01 is OK have the role #Master_L01#",
                       "CDA84E5562F3: The user user01@TestL01 NOT have the role #Master_L01# FAILED" );

  CommonTest.myAssert( await UserTestV1.test_profile_at_less_one_role( CommonTest.headers_user01_at_TestL01_Session1,
                                                                       [
                                                                         "#Administrator#",
                                                                         "#BManager_L99#"
                                                                       ],
                                                                       "SUCCESS_GET_SESSION_PROFILE",
                                                                       "0DB4C6D59098",
                                                                       "0DB4C6D59098_test_profile_role_fail",
                                                                       false ) === false,
                       "0DB4C6D59098: The user user02@TestL01 is OK not have the roles #Administrator# or #BManager_L99#",
                       "0DB4C6D59098: The user user02@TestL01 have the roles #Administrator# and/or #BManager_L99# FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_uploadImageTower( CommonTest.headers_user01_at_TestL01_Session1,
                                                                 "SUCCESS_BINARY_DATA_UPLOAD",
                                                                 "DCF30CA926BB",
                                                                 "DCF30CA926BB_test_uploadImageTower_user01@TestL01_success",
                                                                 "user01@TestL01_tower",
                                                                 {
                                                                   Mark: "DCF30CA926BB"
                                                                 } ),
                       "DCF30CA926BB: Upload image tower user01@TestL01 is OK",
                       "DCF30CA926BB: Upload image tower user01@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_createAuth( CommonTest.headers_user01_at_TestL01_Session1,
                                                           "SUCCESS_AUTH_TOKEN_CREATED",
                                                           "6F30C8E983E3",
                                                           "6F30C8E983E3_test_createAuth_user01@TestL01_success",
                                                           false ),
                       "6F30C8E983E3: Create auth user01@TestL01 is OK",
                       "6F30C8E983E3: Create auth user01@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_downloadImageThumbnail( CommonTest.headers_user01_at_TestL01_Session1,
                                                                       "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                                       "DF6BC73BB52F",
                                                                       "DF6BC73BB52F_test_downloadImageTowerThumbnail_user01@TestL01_success",
                                                                       "user01@TestL01_tower" ),
                       "DF6BC73BB52F: Download image thumbnail tower user01@TestL01 is OK",
                       "DF6BC73BB52F: Download image thumbnail tower user01@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_downloadImage( CommonTest.headers_user01_at_TestL01_Session1,
                                                              "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                              "326E879A24CF",
                                                              "326E879A24CF_test_downloadImageTower_user01@TestL01_success",
                                                              "user01@TestL01_tower",
                                                              null ),
                       "326E879A24CF: Download image tower user01@TestL01 is OK",
                       "326E879A24CF: Download image tower user01@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_getImageDetails( CommonTest.headers_user01_at_TestL01_Session1,
                                                                "SUCCESS_GET_BINARY_DATA_DETAILS",
                                                                "E28E266351E5",
                                                                "E28E266351E5_test_getImageDetailsTower_user01@TestL01_success",
                                                                "user01@TestL01_tower" ),
                       "E28E266351E5: Get image details tower user01@TestL01 is OK",
                       "E28E266351E5: Get image details tower user01@TestL01 is FAILED" );

  //Old version: Fail to create the user user98@TestL98 because the user user01@TestL01 Role => #Master_L01#, and not allow to create new user group
  //Success because the user01@TestL01 Role => #Master_L01#, not create a new user group only add to own group TestL01, when th sysUserGroup.Id and sysUserGroup.ShortId and sysUserGroup.Name are empty, null or undefined
  CommonTest.myAssert( await UserTestV1.test_createUser_user98_at_TestL98( CommonTest.headers_user01_at_TestL01_Session1,
                                                                           "SUCCESS_USER_CREATE",  //"ERROR_CANNOT_CREATE_USER",
                                                                           "CA07E27A0CC3",
                                                                           "CA07E27A0CC3_test_createUser_user98_at_TestL98_success",
                                                                           false,
                                                                           false, //<--- Not auto create the user group
                                                                           true,  //Must be empty role and tag?
                                                                           false ), //<-- Check group name?
                       "CA07E27A0CC3: Creation of the user user98@TestL98 is OK",
                       "CA07E27A0CC3: Creation of the user user98@TestL98 is FAILED" );

  //Success because the user01@TestL01 Role => #Master_L01#, not create a new user group only add to own group TestL01, when th sysUserGroup.Id and sysUserGroup.ShortId and sysUserGroup.Name are empty, null or undefined
  CommonTest.myAssert( await UserTestV1.test_createUser_user97_at_TestL98( CommonTest.headers_user01_at_TestL01_Session1,
                                                                           "SUCCESS_USER_CREATE",  //"ERROR_CANNOT_CREATE_USER",
                                                                           "2F6CC68DF536",
                                                                           "2F6CC68DF536_test_createUser_user97_at_TestL98_success",
                                                                           false,
                                                                           false, //<--- Not auto create the user group
                                                                           true,  //Must be empty role and tag?
                                                                           false ), //<-- Check group name?
                       "2F6CC68DF536: Creation of the user user97@TestL98 is OK",
                       "2F6CC68DF536: Creation of the user user97@TestL98 is FAILED" );

  //Success because the user01@TestL01 Role => #Master_L01#, not create a new user group only add to own group TestL01, when th sysUserGroup.Id and sysUserGroup.ShortId and sysUserGroup.Name are empty, null or undefined
  CommonTest.myAssert( await UserTestV1.test_createUser_user96_at_TestL98( CommonTest.headers_user01_at_TestL01_Session1,
                                                                           "SUCCESS_USER_CREATE",  //"ERROR_CANNOT_CREATE_USER",
                                                                           "D3517EFAE8D8",
                                                                           "D3517EFAE8D8_test_createUser_user96_at_TestL98_success",
                                                                           false,
                                                                           false, //<--- Not auto create the user group
                                                                           true,  //Must be empty role and tag?
                                                                           false ), //<-- Check group name?
                       "D3517EFAE8D8: Creation of the user user96@TestL98 is OK",
                       "D3517EFAE8D8: Creation of the user user96@TestL98 is FAILED" );

  //*** Disable user user9X@TestL98 ***
  CommonTest.myAssert( await UserTestV1.test_disableBulkUser( CommonTest.headers_user01_at_TestL01_Session1,
                                                              {
                                                                bulk: [
                                                                        { Id: CommonTest.user96_at_TestL98_data.Id },
                                                                        { Id: CommonTest.user97_at_TestL98_data.Id },
                                                                        { Id: CommonTest.user98_at_TestL98_data.Id }
                                                                      ]
                                                              },
                                                              "SUCCESS_BULK_USER_DISABLE",
                                                              "A1B75AC57AD0",
                                                              "A1B75AC57AD0_test_disableBulkUser_user9X@TestL98_success",
                                                              false ),
                       "A1B75AC57AD0: Bulk disable of the user user9X@TestL98 is OK",
                       "A1B75AC57AD0: Bulk disable of the user user9X@TestL98 is FAILED" );

  //*** Enable user user9X@TestL98 ***
  CommonTest.myAssert( await UserTestV1.test_enableBulkUser( CommonTest.headers_user01_at_TestL01_Session1,
                                                             {
                                                               bulk: [
                                                                       { Id: CommonTest.user96_at_TestL98_data.Id },
                                                                       { Id: CommonTest.user97_at_TestL98_data.Id },
                                                                       { Id: CommonTest.user98_at_TestL98_data.Id }
                                                                     ]
                                                             },
                                                             "SUCCESS_BULK_USER_ENABLE",
                                                             "7862BE0C629A",
                                                             "7862BE0C629A_test_enableBulkUser_user9X@TestL98_success",
                                                             false ),
                       "7862BE0C629A: Bulk enable of the user user9X@TestL98 is OK",
                       "7862BE0C629A: Bulk enable of the user user9X@TestL98 is FAILED" );

  //*** Move user user9X@TestL98 to the user group System_Administrators ***
  // Fail because not role to do
  CommonTest.myAssert( await UserTestV1.test_moveBulkUser( CommonTest.headers_user01_at_TestL01_Session1,
                                                           {
                                                             bulk: [
                                                                     { Id: CommonTest.user96_at_TestL98_data.Id, sysUserGroup: { Name: "System_Administrators" } },
                                                                     { Id: CommonTest.user97_at_TestL98_data.Id, sysUserGroup: { Name: "System_Administrators" } },
                                                                     { Id: CommonTest.user98_at_TestL98_data.Id, sysUserGroup: { Name: "System_Administrators" } }
                                                                   ]
                                                           },
                                                           "ERROR_BULK_USER_MOVE",
                                                           "2F8ECA7DF210",
                                                           "2F8ECA7DF210_test_moveBulkUser_user9X@TestL98_fail" ),
                       "2F8ECA7DF210: Bulk move of the user user9X@TestL98 is OK with the fail",
                       "2F8ECA7DF210: Bulk move of the user user9X@TestL98 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_searchUserGroup( CommonTest.headers_user01_at_TestL01_Session1,
                                                                   {  },
                                                                   "SUCCESS_SEARCH",
                                                                   "D8A05E994039",
                                                                   "D8A05E994039_test_search_user_group_user01@TestL01_success",
                                                                   1,
                                                                   1,
                                                                   false ),
                       "D8A05E994039: Search of the user group user01@TestL01 is OK",
                       "D8A05E994039: Search of the user group user01@TestL01 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_searchCountUserGroup( CommonTest.headers_user01_at_TestL01_Session1,
                                                                        {  },
                                                                        "SUCCESS_SEARCH_COUNT",
                                                                        "FA177DD39D68",
                                                                        "FA177DD39D68_test_search_count_user_group_user01@TestL01_success",
                                                                        1,
                                                                        1,
                                                                        false ),
                       "FA177DD39D68: Search count of the user group user01@TestL01 is OK",
                       "FA177DD39D68: Search count of the user group user01@TestL01 is FAILED" );

  //*** Disable user " + CommonTest.strStartUser + " ***
  CommonTest.myAssert( await UserTestV1.test_disableBulkUser( CommonTest.headers_user01_at_TestL01_Session1,
                                                              {
                                                                bulk: [
                                                                        { Name: "admin01@system.net" },
                                                                      ]
                                                              },
                                                              "ERROR_BULK_USER_DISABLE",
                                                              "DE215786AFEC",
                                                              "DE215786AFEC_test_disableBulkUser_" + CommonTest.strStartUser.replace( ".", "_" ) + "_fail",
                                                              true ),
                       "DE215786AFEC: Bulk disable of the user " + CommonTest.strStartUser + " is OK with the fail",
                       "DE215786AFEC: Bulk disable of the user " + CommonTest.strStartUser + " is FAILED" );

  //*** Disable user " + CommonTest.strStartUser + " ***
  CommonTest.myAssert( await UserTestV1.test_enableBulkUser( CommonTest.headers_user01_at_TestL01_Session1,
                                                             {
                                                               bulk: [
                                                                       { Name: "admin01@system.net" },
                                                                     ]
                                                             },
                                                             "ERROR_BULK_USER_ENABLE",
                                                             "7862BE0C629A",
                                                             "7862BE0C629A_test_enableBulkUser_" + CommonTest.strStartUser.replace( ".", "_" ) + "_fail",
                                                             true ),
                       "7862BE0C629A: Bulk enable of the user " + CommonTest.strStartUser + " is OK with the fail",
                       "7862BE0C629A: Bulk enable of the user " + CommonTest.strStartUser + " is FAILED" );

  //*** Delete user user9X@TestL98 ***
  CommonTest.myAssert( await UserTestV1.test_deleteBulkUser( CommonTest.headers_user01_at_TestL01_Session1,
                                                             {
                                                               bulk: [
                                                                       { Id: CommonTest.user96_at_TestL98_data.Id },
                                                                       { Id: CommonTest.user97_at_TestL98_data.Id },
                                                                       { Id: CommonTest.user98_at_TestL98_data.Id }
                                                                     ]
                                                             },
                                                             "SUCCESS_BULK_USER_DELETE",
                                                             "951404204AFC",
                                                             "951404204AFC_test_deleteBulkUser_user9X@TestL98_success" ),
                       "951404204AFC: Bulk delete of the user user9X@TestL98 is OK",
                       "951404204AFC: Bulk Delete of the user user9X@TestL98 is FAILED" );

  //Fail because user01@TestL01 only has role Master_L01, cannot delete user of user group Administrator
  //*** Delete user " + CommonTest.strStartUser + " ***
  CommonTest.myAssert( await UserTestV1.test_deleteBulkUser( CommonTest.headers_user01_at_TestL01_Session1,
                                                             {
                                                               bulk: [
                                                                       { Name: "admin01@system.net" }
                                                                     ]
                                                             },
                                                             "ERROR_BULK_USER_DELETE",
                                                             "54CEC84EB683",
                                                             "54CEC84EB683_test_deleteBulkUser_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success" ),
                       "54CEC84EB683: Bulk delete of the user " + CommonTest.strStartUser + " is OK with the fail",
                       "54CEC84EB683: Bulk Delete of the user " + CommonTest.strStartUser + " is FAILED" );

  //Fail to create the user user98@TestL98 because the user user01@TestL01 Role => #Master_L01#, and not allow to create new user group
  CommonTest.myAssert( await UserTestV1.test_createUser_user98_at_TestL98( CommonTest.headers_user01_at_TestL01_Session1,
                                                                           "ERROR_CANNOT_CREATE_USER",
                                                                           "B12D747CE86B",
                                                                           "B12D747CE86B_test_createUser_user98_at_TestL98_fail",
                                                                           true,
                                                                           true, //<--- Auto create the group and the group no exists
                                                                           false,
                                                                           true ),
                       "B12D747CE86B: Creation of the user user98@TestL98 is OK with the fail",
                       "B12D747CE86B: Creation of the user user98@TestL98 is FAILED" );

  //Fail because the user01@TestL01 already exists
  CommonTest.myAssert( await UserTestV1.test_createUser_user01_at_TestL01( CommonTest.headers_user01_at_TestL01_Session1,
                                                                           "ERROR_USER_NAME_ALREADY_EXISTS",
                                                                           "3C6BCE671AEB",
                                                                           "3C6BCE671AEB_test_createUser_user01@TestL01_fail" ),
                       "3C6BCE671AEB: Creation of the user user01@TestL01 is OK with the fail",
                       "3C6BCE671AEB: Creation of the user user01@TestL01 is FAILED" );

  //Fail because the user01@TestL01 is trying update himself
  CommonTest.myAssert( await UserTestV1.test_updateUser_user01_at_TestL01_fail( CommonTest.headers_user01_at_TestL01_Session1,
                                                                                CommonTest.user01_at_TestL01_data,
                                                                                "CF7DFB54EDE0" ),
                       "CF7DFB54EDE0: Update of the user user01@TestL01 is OK with the fail",
                       "CF7DFB54EDE0: Update of the user user01@TestL01 is FAILED" );

  //Fail because TestL02 is not in the group of user01@TestL01. Only can create users in the current group TestL01, Role => #Master_L01#
  CommonTest.myAssert( await UserTestV1.test_createUser_user02_at_TestL02_fail( CommonTest.headers_user01_at_TestL01_Session1, "675C61D31DDF" ),
                       "675C61D31DDF: Creation of the user user02@TestL02 is OK with the fail",
                       "675C61D31DDF: Creation of the user user02@TestL02 is FAILED" );

  //Success because TestL01 is in the group of user01@TestL01. Only can create users in the current group TestL01, Role => #Master_L01#
  //*** Create user user02@TestL01 ***
  CommonTest.myAssert( await UserTestV1.test_createUser_user02_at_TestL01_success( CommonTest.headers_user01_at_TestL01_Session1, "95543470C81F" ),
                       "95543470C81F: Creation of the user user02@TestL01 is OK",
                       "95543470C81F: Creation of the user user02@TestL01 is FAILED" );

  CommonTest.myAssert( await UserTestV1.test_searchUser( CommonTest.headers_user01_at_TestL01_Session1,
                                                         {  },
                                                         "SUCCESS_SEARCH",
                                                         "F720C51DE6FA",
                                                         "F720C51DE6FA_test_search_user_user01@TestL01_success",
                                                         2,   //Condition ===
                                                         2 ), //Count
                       "F720C51DE6FA: Search of the user user01@TestL01 is OK",
                       "F720C51DE6FA: Search of the user user01@TestL01 is FAILED" );

  CommonTest.myAssert( await UserTestV1.test_searchCountUser( CommonTest.headers_user01_at_TestL01_Session1,
                                                              {  },
                                                              "SUCCESS_SEARCH_COUNT",
                                                              "F77C16FE2082",
                                                              "F77C16FE2082_test_search_count_user_user01@TestL01_success",
                                                              2,   //Condition ===
                                                              2 ), //Count
                       "F77C16FE2082: Search count of the user user01@TestL01 is OK",
                       "F77C16FE2082: Search count of the user user01@TestL01 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_setSettings( CommonTest.headers_user01_at_TestL01_Session1,
                                                               {  },
                                                               {
                                                                 "Key03": "Value03",
                                                                 "Key04": "Value04",
                                                                },
                                                               "SUCCESS_SET_SETTINGS",
                                                               "47F29BD252A5",
                                                               "47F29BD252A5_test_set_settings_TestL01_user01@TestL01_success",
                                                               [
                                                                 "Key03",
                                                                 "Key04"
                                                               ],
                                                               [
                                                                 "Value03",
                                                                 "Value04"
                                                               ],
                                                               false ),
                       "47F29BD252A5: Set settings of the user group TestL01 using user user01@TestL01 is OK",
                       "47F29BD252A5: Set settings of the user group TestL01 using user user01@TestL01 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_getSettings( CommonTest.headers_user01_at_TestL01_Session1,
                                                               {  },
                                                               "SUCCESS_GET_SETTINGS",
                                                               "ECB362A84732",
                                                               "ECB362A84732_test_get_settings_TestL01_user01@TestL01_success",
                                                               [
                                                                 "Key03",
                                                                 "Key04"
                                                               ],
                                                               [
                                                                 "Value03",
                                                                 "Value04"
                                                               ] ),
                       "ECB362A84732: Get settings of the user group TestL01 using user user01@TestL01 is OK",
                       "ECB362A84732: Get settings of the user group TestL01 using user user01@TestL01 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_getSettings( CommonTest.headers_adminXX_at_system_net,
                                                               {
                                                                 Name: "TestL01"
                                                               },
                                                               "SUCCESS_GET_SETTINGS",
                                                               "445E00E5C116",
                                                               "445E00E5C116_test_get_settings_TestL01_" + CommonTest.strStartUser.replace( ".", "_" ) + "_TestL01_success",
                                                               [
                                                                 "Key03",
                                                                 "Key04"
                                                               ],
                                                               [
                                                                 "Value03",
                                                                 "Value04"
                                                               ] ),
                       "445E00E5C116: Get settings of the user group TestL01 using user " + CommonTest.strStartUser + " is OK",
                       "445E00E5C116: Get settings of the user group TestL01 using user " + CommonTest.strStartUser + " is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_setSettings( CommonTest.headers_adminXX_at_system_net,
                                                               {
                                                                 Name: "TestL01"
                                                               },
                                                               {
                                                                 "Key05": "Value05",
                                                                 "Key06": "D27C3EABA128",
                                                               },
                                                               "SUCCESS_SET_SETTINGS",
                                                               "D27C3EABA128",
                                                               "D27C3EABA128_test_set_settings_TestL01_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                               [
                                                                 "Key05",
                                                                 "Key06"
                                                               ],
                                                               [
                                                                 "Value05",
                                                                 "D27C3EABA128"
                                                               ],
                                                               false ),
                       "D27C3EABA128: Set settings of the user group TestL01 using user " + CommonTest.strStartUser + " is OK",
                       "D27C3EABA128: Set settings of the user group TestL01 using user " + CommonTest.strStartUser + " is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_getSettings( CommonTest.headers_adminXX_at_system_net,
                                                               {
                                                                 Name: "TestL01"
                                                               },
                                                               "SUCCESS_GET_SETTINGS",
                                                               "F5ADD6A3CEC9",
                                                               "F5ADD6A3CEC9_test_get_settings_TestL01_" + CommonTest.strStartUser.replace( ".", "_" ) + "_TestL01_success",
                                                               [
                                                                 "Key05",
                                                                 "Key06"
                                                               ],
                                                               [
                                                                 "Value05",
                                                                 "D27C3EABA128"
                                                               ] ),
                       "F5ADD6A3CEC9: Get settings of the user group TestL01 using user " + CommonTest.strStartUser + " is OK",
                       "F5ADD6A3CEC9: Get settings of the user group TestL01 using user " + CommonTest.strStartUser + " is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_getSettings( CommonTest.headers_user01_at_TestL01_Session1,
                                                               {  },
                                                               "SUCCESS_GET_SETTINGS",
                                                               "A2B6DED9935D",
                                                               "A2B6DED9935D_test_get_settings_TestL01_user01@TestL01_success",
                                                               [
                                                                 "Key05",
                                                                 "Key06"
                                                               ],
                                                               [
                                                                 "Value05",
                                                                 "D27C3EABA128"
                                                               ] ),
                       "A2B6DED9935D: Get settings of the user group TestL01 using user user01@TestL01 is OK",
                       "A2B6DED9935D: Get settings of the user group TestL01 using user user01@TestL01 is FAILED" );

}

export async function test_v1_phase04() {

  CommonTest.consoleLog( "Separator.blue", ">******************** user02@TestL01 ********************<", "none" );

  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_login( CommonTest.headers_user02_at_TestL01,
                                                                      {
                                                                        Name: CommonTest.user02_at_TestL01_data.Name,
                                                                        Password: CommonTest.user02_at_TestL01_data.Password
                                                                      },
                                                                      "SUCCESS_LOGIN",
                                                                      "81A6B96C4E24",
                                                                      "81A6B96C4E24_test_login_user02@TestL01_success",
                                                                      false ),
                       "81A6B96C4E24: Login with user user02@TestL01 OK",
                       "81A6B96C4E24: Login with user user02@TestL01 FAILED" );

  CommonTest.myAssert( await UserTestV1.test_profile_at_less_one_role( CommonTest.headers_user02_at_TestL01,
                                                                       [ "#Master_L01#", "#Administrator#", "#BManager_L99#" ],
                                                                       "SUCCESS_GET_SESSION_PROFILE",
                                                                       "A9464CC0DE81",
                                                                       "A9464CC0DE81_test_profile_role_user02@TestL01_fail",
                                                                       false ) === false,
                       "A9464CC0DE81: The user user02@TestL01 is OK not have the roles #Master_L01# or #Administrator# or #BManager_L99#",
                       "A9464CC0DE81: The user user02@TestL01 have the roles #Master_L01# and/or #Administrator# and/or #BManager_L99# FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_uploadImageRoad( CommonTest.headers_user02_at_TestL01,
                                                                "SUCCESS_BINARY_DATA_UPLOAD",
                                                                "830515981236",
                                                                "830515981236_test_uploadImageRoad_user02@TestL01_success",
                                                                "user02@TestL01_road",
                                                                { Mark: "830515981236" } ),
                       "830515981236: Upload image road user02@TestL01 is OK",
                       "830515981236: Upload image road user02@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_createAuth( CommonTest.headers_user02_at_TestL01,
                                                           "SUCCESS_AUTH_TOKEN_CREATED",
                                                           "6F30C8E983E3",
                                                           "6F30C8E983E3_test_createAuth_user02@TestL01_success",
                                                           false ),
                       "6F30C8E983E3: create auth user02@TestL01 is OK",
                       "6F30C8E983E3: create auth user02@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_downloadImageThumbnail( CommonTest.headers_user02_at_TestL01,
                                                                       "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                                       "237980EFB1D6",
                                                                       "237980EFB1D6_test_downloadImageRoadThumbnail_user02@TestL01_success",
                                                                       "user02@TestL01_road" ),
                       "237980EFB1D6: Download image thumbnail road user02@TestL01 is OK",
                       "237980EFB1D6: Download image thumbnail road user02@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_downloadImage( CommonTest.headers_user02_at_TestL01,
                                                              "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                              "326E879A24CF",
                                                              "326E879A24CF_test_downloadImageRoad_user02@TestL01_success",
                                                              "user02@TestL01_road",
                                                              null ),
                       "326E879A24CF: Download image road user02@TestL01 is OK",
                       "326E879A24CF: Download image road user02@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_getImageDetails( CommonTest.headers_user02_at_TestL01,
                                                                "SUCCESS_GET_BINARY_DATA_DETAILS",
                                                                "7ABA97178AC8",
                                                                "7ABA97178AC8_test_getImageDetailsRoad_user02@TestL01_success",
                                                                "user02@TestL01_road" ),
                       "7ABA97178AC8: Get image details road user02@TestL01 is OK",
                       "7ABA97178AC8: Get image details road user02@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_binarySearch( CommonTest.headers_user02_at_TestL01,
                                                             {  },
                                                             "SUCCESS_SEARCH",
                                                             "6CAE1B5074FE",
                                                             "6CAE1B5074FE_test_search_user02@TestL01_success",
                                                             2,
                                                             1 ),
                       "6CAE1B5074FE: Search of the binary data user02@TestL01 is OK",
                       "6CAE1B5074FE: Search of the binary data user02@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_binarySearchCount( CommonTest.headers_user02_at_TestL01,
                                                                  {  },
                                                                  "SUCCESS_SEARCH_COUNT",
                                                                  "BA12C15C021E",
                                                                  "BA12C15C021E_test_searchCount_user02@TestL01_success",
                                                                  2,
                                                                  1 ),
                       "BA12C15C021E: Search count of the binary data user02@TestL01 is OK",
                       "BA12C15C021E: Search count of the binary data user02@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_binarySearch( CommonTest.headers_user01_at_TestL01_Session1,
                                                             {  },
                                                             "SUCCESS_SEARCH",
                                                             "30CC59357B73",
                                                             "30CC59357B73_test_search_user01@TestL01_success",
                                                             2,
                                                             2 ),
                       "30CC59357B73: Search of the user user01@TestL01 is OK",
                       "30CC59357B73: Search of the user user01@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_binarySearchCount( CommonTest.headers_user01_at_TestL01_Session1,
                                                                  {  },
                                                                  "SUCCESS_SEARCH_COUNT",
                                                                  "447DC61A3301",
                                                                  "447DC61A3301_test_searchCount_user01@TestL01_success",
                                                                  2,
                                                                  2 ),
                       "447DC61A3301: Search count of the binary data user01@TestL01 is OK",
                       "447DC61A3301: Search count of the binary data user01@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_deleteImage( CommonTest.headers_user02_at_TestL01,
                                                            "SUCCESS_BINARY_DATA_DELETE",
                                                            "2940D61E1827",
                                                            "2940D61E1827_test_deleteImageRoad_user02@TestL01_success",
                                                            "user02@TestL01_road" ),
                       "2940D61E1827: Delete image road user02@TestL01 is OK",
                       "2940D61E1827: Delete image road user02@TestL01 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_searchUserGroup( CommonTest.headers_user02_at_TestL01,
                                                                   {  },
                                                                   "ERROR_FORBIDDEN_ACCESS",
                                                                   "3953DA466671",
                                                                   "3953DA466671_test_search_user_group_user02@TestL01_success",
                                                                   1,
                                                                   1,
                                                                   true ),
                       "3953DA466671: Search of the user group user02@TestL01 is OK with the fail",
                       "3953DA466671: Search of the user group user02@TestL01 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_searchCountUserGroup( CommonTest.headers_user02_at_TestL01,
                                                                        {  },
                                                                        "ERROR_FORBIDDEN_ACCESS",
                                                                        "F3D7172A7E01",
                                                                        "F3D7172A7E01_test_search_count_user_group_user01@TestL01_success",
                                                                        1,
                                                                        1,
                                                                        true ),
                       "F3D7172A7E01: Search count of the user group user01@TestL01 is OK with the fail",
                       "F3D7172A7E01: Search count of the user group user01@TestL01 is FAILED" );

  //Fail because user03@TestL01 not have role to made this request
  CommonTest.myAssert( await UserTestV1.test_createUser_user03_at_TestL01_fail( CommonTest.headers_user02_at_TestL01, "EFCA2421E693" ),
                       "EFCA2421E693: Creation of the user user03@TestL01 is OK with the fail",
                       "EFCA2421E693: Creation of the user user03@TestL01 is FAILED" );

  //Fail because user03@TestL01 not have role to made this request
  CommonTest.myAssert( await UserTestV1.test_deleteUser( CommonTest.headers_user02_at_TestL01,
                                                         { Name: "user01@TestL01" },
                                                         "ERROR_FORBIDDEN_ACCESS",
                                                         "72C257B51EDC",
                                                         "72C257B51EDC_test_deleteUser_user03@TestL01_fail" ),
                       "72C257B51EDC: Delete of the user user03@TestL01 is OK with the fail",
                       "72C257B51EDC: Delete of the user user03@TestL01 is FAILED" );

  //Fail because not allowed to set the settings of the groups
  CommonTest.myAssert( await UserGroupTestV1.test_setSettings( CommonTest.headers_user02_at_TestL01,
                                                               {  },
                                                               {
                                                                 "Key06": "Value06",
                                                                 "Key07": "Value07",
                                                                },
                                                               "ERROR_FORBIDDEN_ACCESS",
                                                               "60D6C4510108",
                                                               "60D6C4510108_test_set_settings_TestL01_user02@TestL01_fail",
                                                               [],
                                                               [],
                                                               true ),
                       "60D6C4510108: Set settings of the user group TestL01 using user user02@TestL01 is OK with the fail",
                       "60D6C4510108: Set settings of the user group TestL01 using user user02@TestL01 is FAILED" );

  //Success because all user had get access to settings of own group
  CommonTest.myAssert( await UserGroupTestV1.test_getSettings( CommonTest.headers_user02_at_TestL01,
                                                               {  },
                                                               "SUCCESS_GET_SETTINGS",
                                                               "B3BD83099BB6",
                                                               "B3BD83099BB6_test_get_settings_TestL01_user02@TestL01_success",
                                                               [
                                                                 "Key05",
                                                                 "Key06"
                                                               ],
                                                               [
                                                                 "Value05",
                                                                 "D27C3EABA128"
                                                               ] ),
                       "B3BD83099BB6: Get settings of the user group TestL01 using user user02@TestL01 is OK",
                       "B3BD83099BB6: Get settings of the user group TestL01 using user user02@TestL01 is FAILED" );

  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_logout( CommonTest.headers_user02_at_TestL01,
                                                                       "SUCCESS_LOGOUT",
                                                                       "9D731B62D922",
                                                                       "9D731B62D922_test_logout_user02@TestL01_success" ),
                       "9D731B62D922: Logout with user user02@TestL01 is OK",
                       "9D731B62D922: Logout with user user02@TestL01 is FAILED" );

  CommonTest.consoleLog( "Separator.blue", "<******************** user02@TestL01 ********************>", "none" );

}

export async function test_v1_phase05() {

  CommonTest.myAssert( await BinaryTestV1.test_deleteImage( CommonTest.headers_user01_at_TestL01_Session1,
                                                            "SUCCESS_BINARY_DATA_DELETE",
                                                            "7D2AB0B58075",
                                                            "7D2AB0B58075_test_deleteImageTower_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                            "user01@TestL01_tower" ),
                       "7D2AB0B58075: Delete image tower " + CommonTest.strStartUser + " is OK",
                       "7D2AB0B58075: Delete image tower " + CommonTest.strStartUser + " is FAILED" );

  //Success because the user user02@TestL01 is in the group of user01@TestL01. Only can delete users in the current group TestL01, Role => #Master_L01#
  //*** Delete user user02@TestL01 ***
  CommonTest.myAssert( await UserTestV1.test_deleteUser( CommonTest.headers_user01_at_TestL01_Session1,
                                                         { Id: CommonTest.user02_at_TestL01_data.Id },
                                                         "SUCCESS_USER_DELETE",
                                                         "1AD5AD5583DD",
                                                         "1AD5AD5583DD_test_deleteUser_user02_at_TestL01_success" ),
                       "1AD5AD5583DD: Delete of the user user02@TestL01 is OK",
                       "1AD5AD5583DD: Delete of the user user02@TestL01 is FAILED" );

  //Fail because the user bmanager02@system.net is not in the group of user01@TestL01. Only can delete users in the current group TestL01, Role => #Master_L01#
  CommonTest.myAssert( await UserTestV1.test_deleteUser( CommonTest.headers_user01_at_TestL01_Session1,
                                                         { Name: "bmanager02@system.net" },
                                                         "ERROR_CANNOT_DELETE_USER",
                                                         "8E8766DECAD0",
                                                         "8E8766DECAD0_test_deleteUser_bmanager02@system.net_fail" ),
                       "8E8766DECAD0: Delete of the user bmanager02@system.net is OK with the fail",
                       "8E8766DECAD0: Delete of the user bmanager02@system.net is FAILED" );

  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_logout( CommonTest.headers_user01_at_TestL01_Session1,
                                                                       "SUCCESS_LOGOUT",
                                                                       "5FA1C53C9F1D",
                                                                       "5FA1C53C9F1D_test_logout_user01@TestL01_success" ),
                       "5FA1C53C9F1D: Logout with user user01@TestL01 is OK",
                       "5FA1C53C9F1D: Logout with user user01@TestL01 is FAILED" );

  //Fail because the user user01@TestL01 no valid session
  CommonTest.myAssert( await UserTestV1.test_deleteUser( CommonTest.headers_user01_at_TestL01_Session1,
                                                         { Id: CommonTest.user02_at_TestL01_data.Id },
                                                         "ERROR_LOGGED_OUT_AUTHORIZATION_TOKEN",
                                                         "1AF9D40E118A",
                                                         "1AF9D40E118A_test_deleteUser_user02_at_TestL01_fail" ),
                       "1AF9D40E118A: Delete of the user user01@TestL01 is OK with the fail",
                       "1AF9D40E118A: Delete of the user user01@TestL01 is FAILED" );

  CommonTest.consoleLog( "Separator.blue", "<******************** user01@TestL01 ********************>", "none" );

}

export async function test_v1_phase06() {

  CommonTest.consoleLog( "Separator.blue", ">******************** user01@TestL02 ********************<", "none" );

  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_login( CommonTest.headers_user01_at_TestL02,
                                                                      {
                                                                        Name: CommonTest.user01_at_TestL02_data.Name,
                                                                        Password: CommonTest.user01_at_TestL02_data.Password
                                                                      },
                                                                      "SUCCESS_LOGIN",
                                                                      "130FE0374778",
                                                                      "130FE0374778_test_login_user01@TestL02_success",
                                                                      false ),
                       "130FE0374778: Login with user user01@TestL02 OK",
                       "130FE0374778: Login with user user01@TestL02 FAILED" );

  CommonTest.myAssert( await UserTestV1.test_profile_at_less_one_role( CommonTest.headers_user01_at_TestL02,
                                                                       [ "#Master_L03#" ],
                                                                       "SUCCESS_GET_SESSION_PROFILE",
                                                                       "DDC02D014233",
                                                                       "DDC02D014233_test_profile_role_user01@TestL02_success",
                                                                       false ),
                       "DDC02D014233: The user user01@TestL02 is OK have the role #Master_L03#",
                       "DDC02D014233: The user user01@TestL02 NOT have the role #Master_L03# FAILED" );

  CommonTest.myAssert( await UserTestV1.test_profile_at_less_one_role( CommonTest.headers_user01_at_TestL02,
                                                                       [ "#Administrator#", "#BManager_L99#", "#Master_L01#" ],
                                                                       "SUCCESS_GET_SESSION_PROFILE",
                                                                       "AD3CC7F54477",
                                                                       "AD3CC7F54477_test_profile_role_user01@TestL02_fail",
                                                                       false ) === false,
                       "AD3CC7F54477: The user user02@TestL02 is OK not have the roles #Administrator# or #BManager_L99# or #Master_L01#",
                       "AD3CC7F54477: The user user02@TestL02 have the roles #Administrator# and/or #BManager_L99# and/or #Master_L01# FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_createUserGroup_TestL56( CommonTest.headers_user01_at_TestL02,
                                                                           "SUCCESS_USER_GROUP_CREATE",
                                                                           "09527F1FCA05",
                                                                           "09527F1FCA05_test_createUserGroup_TestL56_success",
                                                                           true,
                                                                           false ),
                       "09527F1FCA05: Create the user group TestL56 is OK",
                       "09527F1FCA05: Create of the user group TestL56 is FAILED" );

  //Change the Name TestL56 => TestL46
  CommonTest.myAssert( await UserGroupTestV1.test_updateUserGroup_TestL56( CommonTest.headers_user01_at_TestL02,
                                                                           "SUCCESS_USER_GROUP_UPDATE",
                                                                           "F984D3179239_test_updateUserGroup_TestL56_success",
                                                                           CommonTest.TestL56_data,
                                                                           true,
                                                                           false ),
                       "F984D3179239: Update the user group TestL56 is OK",
                       "F984D3179239: Update the user group TestL56 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_getUserGroup( CommonTest.headers_user01_at_TestL02,
                                                                {
                                                                  Name: "TestL01"
                                                                },
                                                                "SUCCESS_GET_USER_GROUP",
                                                                "BAB0076CCD42",
                                                                "BAB0076CCD42_test_getUserGroup_TestL01_success",
                                                                false ),
                       "BAB0076CCD42: Get the user group TestL01 is OK",
                       "BAB0076CCD42: Get the user group TestL01 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_getUserGroup( CommonTest.headers_user01_at_TestL02,
                                                                {
                                                                  Name: "TestL02"
                                                                },
                                                                "SUCCESS_GET_USER_GROUP",
                                                                "60410DE8CB0A",
                                                                "60410DE8CB0A_test_getUserGroup_TestL02_success",
                                                                false ),
                       "60410DE8CB0A: Get the user group TestL02 is OK",
                       "60410DE8CB0A: Get the user group TestL02 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_getUserGroup( CommonTest.headers_user01_at_TestL02,
                                                                {
                                                                  Name: "TestL46"
                                                                },
                                                                "SUCCESS_GET_USER_GROUP",
                                                                "B4BA2DC5813D",
                                                                "B4BA2DC5813D_test_getUserGroup_TestL55_success",
                                                                false ),
                       "B4BA2DC5813D: Get the user group TestL46 is OK",
                       "B4BA2DC5813D: Get the user group TestL46 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_getUserGroup( CommonTest.headers_user01_at_TestL02,
                                                                {
                                                                  Name: "System_Administrators"
                                                                },
                                                                "ERROR_CANNOT_GET_USER_GROUP",
                                                                "0F16D9A60A44",
                                                                "0F16D9A60A44_test_getUserGroup_System_Administrators_fail",
                                                                true ),
                       "0F16D9A60A44: Get the user group System_Administrators is OK",
                       "0F16D9A60A44: Get the user group System_Administrators is FAILED" );

  //Success because the group is now empty
  CommonTest.myAssert( await UserGroupTestV1.test_deleteUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                   { Name: "TestL46" },
                                                                   "SUCCESS_USER_GROUP_DELETE",
                                                                   "6E97A554929E",
                                                                   "6E97A554929E_test_deleteUserGroup_TestL56_success" ),
                       "6E97A554929E: Delete of the user group TestL46 is OK",
                       "6E97A554929E: Delete of the user group TestL46 is FAILED" );

  //Success because user01@TestL02 has the Role => #Master_L03#+#GName:TestL01#+#GName:TestL02#+#GName:TestL45#+#GName:TestL55#
  //*** Create the user user02@TestL02 ***
  CommonTest.myAssert( await UserTestV1.test_createUser_user02_at_TestL02_success( CommonTest.headers_user01_at_TestL02, "595AA97F14E3" ),
                       "595AA97F14E3: Creation of the user user02@TestL02 is OK",
                       "595AA97F14E3: Creation of the user user02@TestL02 is FAILED" );

  //Change the user name from user02@TestL02 => user99@TestL01
  //Change the user group name from TestL02 => TestL01
  //Success because user01@TestL02 has the Role => #Master_L03#+#GName:TestL01#+#GName:TestL02#+#GName:TestL45#+#GName:TestL55#
  CommonTest.myAssert( await UserTestV1.test_updateUser_user02_at_TestL02_success( CommonTest.headers_user01_at_TestL02,
                                                                                   CommonTest.user02_at_TestL02_data,
                                                                                   "5CE1E61F0840" ), //The user is another group
                       "5CE1E61F0840: Update of the user user02@TestL02 is OK",
                       "5CE1E61F0840: Update of the user user02@TestL02 is FAILED" );

  //Change the user name from user99@TestL01 => user02@TestL02
  //Change the user group name from TestL01 => TestL02
  //Success because user01@TestL02 has the Role => #Master_L03#+#GName:TestL01#+#GName:TestL02#+#GName:TestL45#+#GName:TestL55#
  //Set the field sysUser.ForceChangePassword = 1
  CommonTest.myAssert( await UserTestV1.test_updateUser_user99_at_TestL01_success( CommonTest.headers_user01_at_TestL02,
                                                                                   CommonTest.user02_at_TestL02_data,
                                                                                   "F59085E6DF03" ), //The user is another group
                       "F59085E6DF03: Update of the user user99@TestL01 is OK",
                       "F59085E6DF03: Update of the user user99@TestL01 is FAILED" );

  //Try to change the user name from user02@TestL01 => user01@TestL01
  //Try to change the user group name from TestL02 => TestL01
  //Fail because user01@TestL01 already exists
  CommonTest.myAssert( await UserTestV1.test_updateUser_user02_at_TestL02_fail( CommonTest.headers_user01_at_TestL02,
                                                                                CommonTest.user02_at_TestL02_data,
                                                                                "F15260F5B6AD" ), //The user is another group
                       "F15260F5B6AD: Update of the user user02@TestL02 is OK with the fail",
                       "F15260F5B6AD: Update of the user user02@TestL02 is FAILED" );

  //Success because user01@TestL02 has the Role => #Master_L03#+#GName:TestL01#+#GName:TestL02#+#GName:TestL45#+#GName:TestL55#
  //*** Create the user user02@TestL01 ***
  CommonTest.myAssert( await UserTestV1.test_createUser_user02_at_TestL01_success( CommonTest.headers_user01_at_TestL02,
                                                                                   "F717131C21AA" ),
                       "F717131C21AA: Creation of the user user02@TestL01 is OK",
                       "F717131C21AA: Creation of the user user02@TestL01 is FAILED" );

  //Success because user01@TestL02 has the Role => #Master_L03#+#GName:TestL01#+#GName:TestL02#+#GName:TestL45#+#GName:TestL55#
  CommonTest.myAssert( await UserTestV1.test_updateUser_user02_at_TestL01_success( CommonTest.headers_user01_at_TestL02,
                                                                                   CommonTest.user02_at_TestL01_data,
                                                                                   "79736CBA890B" ), //The user is another group
                       "79736CBA890B: Creation of the user user02@TestL01 is OK",
                       "79736CBA890B: Creation of the user user02@TestL01 is FAILED" );

  CommonTest.myAssert( await UserTestV1.test_searchUser( CommonTest.headers_user01_at_TestL02,
                                                         {  },
                                                         "SUCCESS_SEARCH",
                                                         "AD0B5775D644",
                                                         "AD0B5775D644_test_search_user_user01@TestL01_success",
                                                         2,   //Condition ===
                                                         4 ), //Count
                       "AD0B5775D644: Search of the user user01@TestL02 is OK",
                       "AD0B5775D644: Search of the user user01@TestL02 is FAILED" );

  CommonTest.myAssert( await UserTestV1.test_searchCountUser( CommonTest.headers_user01_at_TestL02,
                                                              {  },
                                                              "SUCCESS_SEARCH_COUNT",
                                                              "C095D0EA6182",
                                                              "C095D0EA6182_test_search_count_user_user01@TestL01_success",
                                                              2,   //Condition ===
                                                              4 ), //Count
                       "C095D0EA6182: Search count of the user user01@TestL02 is OK",
                       "C095D0EA6182: Search count of the user user01@TestL02 is FAILED" );

  //Return zero because the use " + CommonTest.strStartUser + " is not allowed by the user01@TestL02
  CommonTest.myAssert( await UserTestV1.test_searchUser( CommonTest.headers_user01_at_TestL02,
                                                         {
                                                           where: "A.Name = 'admin01@system.net'"
                                                         },
                                                         "SUCCESS_SEARCH",
                                                         "0C4F58078409",
                                                         "0C4F58078409_test_search_user_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                         2,   //Condition ===
                                                         0 ), //Count
                       "0C4F58078409: Search of the user user01@TestL02 is OK",
                       "0C4F58078409: Search of the user user01@TestL02 is FAILED" );

  //Return zero because the use " + CommonTest.strStartUser + " is not allowed by the user01@TestL02
  CommonTest.myAssert( await UserTestV1.test_searchCountUser( CommonTest.headers_user01_at_TestL02,
                                                              {
                                                                where: "A.Name = 'admin01@system.net'"
                                                              },
                                                              "SUCCESS_SEARCH_COUNT",
                                                              "A972F4A5400E",
                                                              "A972F4A5400E_test_search_count_user_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                              2,   //Condition ===
                                                              0 ), //Count
                       "89A4483AD09F: Search count of the user user01@TestL02 is OK",
                       "A972F4A5400E: Search count of the user user01@TestL02 is FAILED" );

  CommonTest.myAssert( await UserTestV1.test_searchUser( CommonTest.headers_user01_at_TestL02,
                                                         {
                                                           where: "A.Name = 'user02@TestL02'"
                                                         },
                                                         "SUCCESS_SEARCH",
                                                         "0C4F58078409",
                                                         "0C4F58078409_test_search_user_user02@TestL02_success",
                                                         2,   //Condition ===
                                                         1 ), //Count
                       "0C4F58078409: Search of the user user02@TestL02 is OK",
                       "0C4F58078409: Search of the user user02@TestL02 is FAILED" );

  CommonTest.myAssert( await UserTestV1.test_searchCountUser( CommonTest.headers_user01_at_TestL02,
                                                              {
                                                                where: "A.Name = 'user02@TestL02'"
                                                              },
                                                              "SUCCESS_SEARCH_COUNT",
                                                              "89A4483AD09F",
                                                              "89A4483AD09F_test_search_count_user_user02@TestL02_success",
                                                              2,   //Condition ===
                                                              1 ), //Count
                       "89A4483AD09F: Search count of the user user02@TestL02 is OK",
                       "89A4483AD09F: Search count of the user user02@TestL02 is FAILED" );

  CommonTest.myAssert( await UserTestV1.test_searchUser( CommonTest.headers_user01_at_TestL02,
                                                         {
                                                           where: "A.Name = 'user02@TestL02' Or A.Name = 'user01@TestL02'"
                                                         },
                                                         "SUCCESS_SEARCH",
                                                         "6F000511292F",
                                                         "6F000511292F_test_search_user_user02@TestL02_success",
                                                         2,   //Condition ===
                                                         2 ), //Count
                       "6F000511292F: Search of the user user02@TestL02 is OK",
                       "6F000511292F: Search of the user user02@TestL02 is FAILED" );

  CommonTest.myAssert( await UserTestV1.test_searchCountUser( CommonTest.headers_user01_at_TestL02,
                                                              {
                                                                where: "A.Name = 'user02@TestL02' Or A.Name = 'user01@TestL02'"
                                                              },
                                                              "SUCCESS_SEARCH_COUNT",
                                                              "656BB66AC356",
                                                              "656BB66AC356_test_search_count_user_user02@TestL02_success",
                                                              2,   //Condition ===
                                                              2 ), //Count
                       "656BB66AC356: Search count of the user user02@TestL02 is OK",
                       "656BB66AC356: Search count of the user user02@TestL02 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_searchUserGroup( CommonTest.headers_user01_at_TestL02,
                                                                   {  },
                                                                   "SUCCESS_SEARCH",
                                                                   "D8A05E994039",
                                                                   "D8A05E994039_test_search_user_group_user02@TestL02_success",
                                                                   1,
                                                                   2,
                                                                   false ),
                       "D8A05E994039: Search of the user group user02@TestL02 is OK",
                       "D8A05E994039: Search of the user group user02@TestL02 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_searchCountUserGroup( CommonTest.headers_user01_at_TestL02,
                                                                        {  },
                                                                        "SUCCESS_SEARCH_COUNT",
                                                                        "5635246C0BF4",
                                                                        "5635246C0BF4_test_search_count_user_group_user02@TestL02_success",
                                                                        1,
                                                                        2,
                                                                        false ),
                      "5635246C0BF4: Search count of the user group user02@TestL02 is OK",
                      "5635246C0BF4: Search count of the user group user02@TestL02 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_searchUserGroup( CommonTest.headers_user01_at_TestL02,
                                                                   {
                                                                     where: "A.Name = 'System_Administrators'"
                                                                   },
                                                                   "SUCCESS_SEARCH",
                                                                   "3645B5EF721C",
                                                                   "3645B5EF721C_test_search_user_group_user02@TestL02_success",
                                                                   1,
                                                                   0,
                                                                   false ),
                       "3645B5EF721C: Search of the user group user02@TestL02 is OK",
                       "3645B5EF721C: Search of the user group user02@TestL02 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_searchCountUserGroup( CommonTest.headers_user01_at_TestL02,
                                                                        {
                                                                          where: "A.Name = 'System_Administrators'"
                                                                        },
                                                                        "SUCCESS_SEARCH_COUNT",
                                                                        "3B45905010B9",
                                                                        "3B45905010B9_test_search_count_user_group_user02@TestL02_success",
                                                                        1,
                                                                        0,
                                                                        false ),
                       "3B45905010B9: Search count of the user group user02@TestL02 is OK",
                       "3B45905010B9: Search count of the user group user02@TestL02 is FAILED" );

  //*** Disable user user0X@TestL0X ***
  CommonTest.myAssert( await UserTestV1.test_disableBulkUser( CommonTest.headers_user01_at_TestL02,
                                                              {
                                                                bulk: [
                                                                        { Name: "user02@TestL01" },
                                                                        { Name: "user02@TestL02" }
                                                                      ]
                                                              },
                                                              "SUCCESS_BULK_USER_DISABLE",
                                                              "8E9DB16E7023",
                                                              "8E9DB16E7023_test_disableBulkUser_user0X@TestL0X_success",
                                                              false ),
                       "8E9DB16E7023: Bulk disable of the user user0X@TestL0X is OK",
                       "8E9DB16E7023: Bulk disable of the user user0X@TestL0X is FAILED" );

  //*** Enable user user0X@TestL0X ***
  CommonTest.myAssert( await UserTestV1.test_enableBulkUser( CommonTest.headers_user01_at_TestL02,
                                                             {
                                                               bulk: [
                                                                       { Name: "user02@TestL01" },
                                                                       { Name: "user02@TestL02" }
                                                                     ]
                                                             },
                                                             "SUCCESS_BULK_USER_ENABLE",
                                                             "8A95C404DA5D",
                                                             "8A95C404DA5D_test_enableBulkUser_user0X@TestL0X_success",
                                                             false ),
                       "8A95C404DA5D: Bulk enable of the user user0X@TestL0X is OK",
                       "8A95C404DA5D: Bulk enable of the user user0X@TestL0X is FAILED" );

  //*** Move user user02@TestL01 to the user group TestL02 ***
  //Success because user01@TestL02 has the Role => #Master_L03#+#GName:TestL01#+#GName:TestL02#+#GName:TestL45#+#GName:TestL55#
  CommonTest.myAssert( await UserTestV1.test_moveBulkUser( CommonTest.headers_user01_at_TestL02,
                                                           {
                                                             bulk: [
                                                                     { Name: "user02@TestL01", sysUserGroup: { Name: "TestL02" } },
                                                                   ]
                                                           },
                                                           "SUCCESS_BULK_USER_MOVE",
                                                           "6C86B6F735D4",
                                                           "6C86B6F735D4_test_moveBulkUser_user02@TestL01_success" ),
                       "6C86B6F735D4: Bulk move of the user user02@TestL01 is OK",
                       "6C86B6F735D4: Bulk move of the user user02@TestL01 is FAILED" );

  //*** Move user user02@TestL01 to the user group TestL01 ***
  //Success because user01@TestL02 has the Role => #Master_L03#+#GName:TestL01#+#GName:TestL02#+#GName:TestL45#+#GName:TestL55#
  CommonTest.myAssert( await UserTestV1.test_moveBulkUser( CommonTest.headers_user01_at_TestL02,
                                                           {
                                                             bulk: [
                                                                     { Name: "user02@TestL01", sysUSerGroup: { Name: "TestL01" } },
                                                                   ]
                                                           },
                                                           "SUCCESS_BULK_USER_MOVE",
                                                           "A2C9A83F7C7C",
                                                           "A2C9A83F7C7C_test_moveBulkUser_user02@TestL01_success" ),
                       "A2C9A83F7C7C: Bulk move of the user user02@TestL01 is OK",
                       "A2C9A83F7C7C: Bulk move of the user user02@TestL01 is FAILED" );

  //*** Disable user " + CommonTest.strStartUser + " ***
  CommonTest.myAssert( await UserTestV1.test_disableBulkUser( CommonTest.headers_user01_at_TestL02,
                                                              {
                                                                bulk: [
                                                                        { Name: "admin01@system.net" },
                                                                      ]
                                                              },
                                                              "ERROR_BULK_USER_DISABLE",
                                                              "EF697A2EF29C",
                                                              "EF697A2EF29C_test_disableBulkUser_" + CommonTest.strStartUser.replace( ".", "_" ) + "_fail",
                                                              true ),
                       "EF697A2EF29C: Bulk disable of the user " + CommonTest.strStartUser + " is OK with the fail",
                       "EF697A2EF29C: Bulk disable of the user " + CommonTest.strStartUser + " is FAILED" );

  //*** Disable user " + CommonTest.strStartUser + " ***
  CommonTest.myAssert( await UserTestV1.test_enableBulkUser( CommonTest.headers_user01_at_TestL02,
                                                             {
                                                               bulk: [
                                                                       { Name: "admin01@system.net" },
                                                                     ]
                                                             },
                                                             "ERROR_BULK_USER_ENABLE",
                                                             "0354A125E68F",
                                                             "0354A125E68F_test_enableBulkUser_" + CommonTest.strStartUser.replace( ".", "_" ) + "_fail",
                                                             true ),
                       "0354A125E68F: Bulk enable of the user " + CommonTest.strStartUser + " is OK with the fail",
                       "0354A125E68F: Bulk enable of the user " + CommonTest.strStartUser + " is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_uploadImageRoad( CommonTest.headers_user01_at_TestL02,
                                                                "SUCCESS_BINARY_DATA_UPLOAD",
                                                                "C23E1CE5725E",
                                                                "C23E1CE5725E_test_uploadImageRoad_user01@TestL02_success",
                                                                "user01@TestL02_road",
                                                                { Mark: "C23E1CE5725E" } ),
                       "C23E1CE5725E: Upload image road user01@TestL02 is OK",
                       "C23E1CE5725E: Upload image road user01@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_createAuth( CommonTest.headers_user01_at_TestL02,
                                                           "SUCCESS_AUTH_TOKEN_CREATED",
                                                           "C539A2B57526",
                                                           "C539A2B57526_test_createAuth_user01@TestL02_success",
                                                           false ),
                       "C539A2B57526: Create auth user01@TestL02 is OK",
                       "C539A2B57526: Create auth user01@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_downloadImageThumbnail( CommonTest.headers_user01_at_TestL02,
                                                                       "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                                       "EDD23DB9B25D",
                                                                       "EDD23DB9B25D_test_downloadImageRoadThumbnail_user01@TestL02_success",
                                                                       "user01@TestL02_road" ),
                       "EDD23DB9B25D: Download image thumbnail road user01@TestL02 is OK",
                       "EDD23DB9B25D: Download image thumbnail road user01@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_downloadImage( CommonTest.headers_user01_at_TestL02,
                                                              "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                              "0B1CD13DAD0B",
                                                              "0B1CD13DAD0B_test_downloadImageRoad_user01@TestL02_success",
                                                              "user01@TestL02_road",
                                                              null ),
                       "0B1CD13DAD0B: Download image road user01@TestL02 is OK",
                       "0B1CD13DAD0B: Download image road user01@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_getImageDetails( CommonTest.headers_user01_at_TestL02,
                                                                "SUCCESS_GET_BINARY_DATA_DETAILS",
                                                                "EA9A3CA6AF6C",
                                                                "EA9A3CA6AF6C_test_getImageDetailsRoad_user01@TestL02_success",
                                                                "user01@TestL02_road" ),
                       "EA9A3CA6AF6C: Get image details road user01@TestL02 is OK",
                       "EA9A3CA6AF6C: Get image details road user01@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_binarySearch( CommonTest.headers_user01_at_TestL02,
                                                             {  },
                                                             "SUCCESS_SEARCH",
                                                             "7C542CAC93F9",
                                                             "7C542CAC93F9_test_search_user01@TestL02_success",
                                                             2,
                                                             1 ),
                       "7C542CAC93F9: Search of the binary data user01@TestL02 is OK",
                       "7C542CAC93F9: Search of the binary data user01@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_binarySearchCount( CommonTest.headers_user01_at_TestL02,
                                                                  {  },
                                                                  "SUCCESS_SEARCH_COUNT",
                                                                  "67CFE1F1D4F0",
                                                                  "67CFE1F1D4F0_test_searchCount_user01@TestL02_success",
                                                                  2,
                                                                  1 ),
                       "67CFE1F1D4F0: Search count of the binary data user01@TestL02 is OK",
                       "67CFE1F1D4F0: Search count of the binary data user01@TestL02 is FAILED" );

  //Success because user01@TestL02 has the Role => #Master_L03#+#GName:TestL01#+#GName:TestL02#+#GName:TestL45#+#GName:TestL55#
  CommonTest.myAssert( await UserGroupTestV1.test_setSettings( CommonTest.headers_user01_at_TestL02,
                                                               {
                                                                 Name: "TestL01"
                                                               },
                                                               {
                                                                 "Key07": "Value07",
                                                                 "Key08": "6DA562F7B229",
                                                               },
                                                               "SUCCESS_SET_SETTINGS",
                                                               "6DA562F7B229",
                                                               "6DA562F7B229_test_set_settings_TestL02_user01@TestL02_success",
                                                               [
                                                                 "Key07",
                                                                 "Key08"
                                                               ],
                                                               [
                                                                 "Value07",
                                                                 "6DA562F7B229"
                                                               ],
                                                               false ),
                       "6DA562F7B229: Set settings of the user group TestL01 using user user01@TestL02 is OK",
                       "6DA562F7B229: Set settings of the user group TestL01 using user user01@TestL02 is FAILED" );

  //Success because user01@TestL02 has the Role => #Master_L03#+#GName:TestL01#+#GName:TestL02#+#GName:TestL45#+#GName:TestL55#
  CommonTest.myAssert( await UserGroupTestV1.test_setSettings( CommonTest.headers_user01_at_TestL02,
                                                               {
                                                                 Name: "TestL02"
                                                               },
                                                               {
                                                                 "Key09": "Value09",
                                                                 "Key10": "7E9555969A8A",
                                                               },
                                                               "SUCCESS_SET_SETTINGS",
                                                               "7E9555969A8A",
                                                               "7E9555969A8A_test_set_settings_TestL02_user01@TestL02_success",
                                                               [
                                                                 "Key09",
                                                                 "Key10"
                                                               ],
                                                               [
                                                                 "Value09",
                                                                 "7E9555969A8A"
                                                               ],
                                                               false ),
                       "7E9555969A8A: Set settings of the user group TestL02 using user user01@TestL02 is OK",
                       "7E9555969A8A: Set settings of the user group TestL02 using user user01@TestL02 is FAILED" );

  //Fail because user01@TestL02 has the Role => #Master_L03#+#GName:TestL01#+#GName:TestL02#+#GName:TestL45#+#GName:TestL55#, no allowed to write the settings of the user group System_Administrators
  CommonTest.myAssert( await UserGroupTestV1.test_setSettings( CommonTest.headers_user01_at_TestL02,
                                                               {
                                                                 Name: "System_Administrators"
                                                               },
                                                               {
                                                                 "Key09": "Value09",
                                                                 "Key10": "Value10",
                                                               },
                                                               "ERROR_SET_USER_GROUP_SETTINGS",
                                                               "2AFD61979617",
                                                               "2AFD61979617_test_set_settings_System_Administrators_user01@TestL02_fail",
                                                               [],
                                                               [],
                                                               true ),
                       "2AFD61979617: Set settings of the user group System_Administrators using user user01@TestL02 is OK with the fail",
                       "2AFD61979617: Set settings of the user group System_Administrators using user user01@TestL02 is FAILED" );

  //Success because user01@TestL02 has the Role => #Master_L03#+#GName:TestL01#+#GName:TestL02#+#GName:TestL45#+#GName:TestL55#
  CommonTest.myAssert( await UserGroupTestV1.test_getSettings( CommonTest.headers_user01_at_TestL02,
                                                               {
                                                                 Name: "TestL01"
                                                               },
                                                               "SUCCESS_GET_SETTINGS",
                                                               "EAEE8CDC1FB7",
                                                               "EAEE8CDC1FB7_test_get_settings_TestL01_user02@TestL02_success",
                                                               [
                                                                 "Key07",
                                                                 "Key08"
                                                               ],
                                                               [
                                                                 "Value07",
                                                                 "6DA562F7B229"
                                                               ] ),
                       "EAEE8CDC1FB7: Get settings of the user group TestL01 using user user01@TestL02 is OK",
                       "EAEE8CDC1FB7: Get settings of the user group TestL01 using user user01@TestL02 is FAILED" );

  //Success because user01@TestL02 has the Role => #Master_L03#+#GName:TestL01#+#GName:TestL02#+#GName:TestL45#+#GName:TestL55#
  CommonTest.myAssert( await UserGroupTestV1.test_getSettings( CommonTest.headers_user01_at_TestL02,
                                                               {
                                                                 Name: "TestL02"
                                                               },
                                                               "SUCCESS_GET_SETTINGS",
                                                               "5284AFC6F9C4",
                                                               "5284AFC6F9C4_test_get_settings_TestL02_user02@TestL02_success",
                                                               [
                                                                 "Key09",
                                                                 "Key10"
                                                               ],
                                                               [
                                                                 "Value09",
                                                                 "7E9555969A8A"
                                                               ] ),
                       "5284AFC6F9C4: Get settings of the user group TestL02 using user user01@TestL02 is OK",
                       "5284AFC6F9C4: Get settings of the user group TestL02 using user user01@TestL02 is FAILED" );

  //Fail because user01@TestL02 has the Role => #Master_L03#+#GName:TestL01#+#GName:TestL02#+#GName:TestL45#+#GName:TestL55#, no allowed to write the settings of the user group System_Administrators
  CommonTest.myAssert( await UserGroupTestV1.test_setSettings( CommonTest.headers_user01_at_TestL02,
                                                               {
                                                                 Name: "System_Administrators"
                                                               },
                                                               {
                                                                 "Key09": "Value09",
                                                                 "Key10": "Value10",
                                                               },
                                                               "ERROR_SET_USER_GROUP_SETTINGS",
                                                               "E83364467991",
                                                               "E83364467991_test_set_settings_System_Administrators_user01@TestL02_fail",
                                                               [],
                                                               [],
                                                               true ),
                       "E83364467991: Set settings of the user group System_Administrators using user user01@TestL02 is OK with the fail",
                       "E83364467991: Set settings of the user group System_Administrators using user user01@TestL02 is FAILED" );

}

export async function test_v1_phase07() {

  CommonTest.consoleLog( "Separator.blue", ">******************** user02@TestL02 ********************<", "none" );

  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_login( CommonTest.headers_user02_at_TestL02,
                                                                      {
                                                                        Name: CommonTest.user02_at_TestL02_data.Name,
                                                                        Password: CommonTest.user02_at_TestL02_data.Password
                                                                      },
                                                                      "SUCCESS_LOGIN",
                                                                      "ECE77F4DB472",
                                                                      "ECE77F4DB472_test_login_user02@TestL02_success",
                                                                      false ),
                       "ECE77F4DB472: Login with user user02@TestL02 OK",
                       "ECE77F4DB472: Login with user user02@TestL02 FAILED" );

  //Fail because need change the password before sysUser.ForceChangePassword = 1
  CommonTest.myAssert( await UserTestV1.test_profile_at_less_one_role( CommonTest.headers_user02_at_TestL02,
                                                                       [
                                                                         "#Administrator#",
                                                                         "#BManager_L99#",
                                                                         "#Master_L01#",
                                                                         "#Master_L02#",
                                                                         "#Master_L03#"
                                                                       ],
                                                                       "ERROR_USER_CHANGE_PASSWORD_REQUIRED",
                                                                       "DEF3E36E35C4",
                                                                       "DEF3E36E35C4_test_profile_role_user02@TestL02_fail",
                                                                       true ),
                       "DEF3E36E35C4: The user user02@TestL02 is OK with fail",
                       "DEF3E36E35C4: The user user02@TestL02 is FAILED" );

  //Fail because the NewPassword and OldPassword are the same
  CommonTest.myAssert( await UserTestV1.test_change_password( CommonTest.headers_user02_at_TestL02,
                                                              {
                                                                CurrentPassword: CommonTest.user02_at_TestL02_data.Password,
                                                                NewPassword: CommonTest.user02_at_TestL02_data.Password
                                                              },
                                                              "ERROR_NEW_PASSWORD_NOT_VALID",
                                                              "DE8024C0AC47",
                                                              "DE8024C0AC47_test_change_password_user02@TestL02_fail" ),
                       "DE8024C0AC47: The user user02@TestL02 is OK with the fail",
                       "DE8024C0AC47: The user user02@TestL02 is FAILED" );

  //Fail because the NewPassword is too short
  CommonTest.myAssert( await UserTestV1.test_change_password( CommonTest.headers_user02_at_TestL02,
                                                              {
                                                                CurrentPassword: CommonTest.user02_at_TestL02_data.Password,
                                                                NewPassword: "123456"
                                                              },
                                                              "ERROR_NEW_PASSWORD_NOT_VALID",
                                                              "F2D7309DE7EB",
                                                              "F2D7309DE7EB_test_change_password_user02@TestL02_fail" ),
                       "F2D7309DE7EB: The user user02@TestL02 is OK with the fail",
                       "F2D7309DE7EB: The user user02@TestL02 is FAILED" );

  //Fail because the OldPassword is wrong
  CommonTest.myAssert( await UserTestV1.test_change_password( CommonTest.headers_user02_at_TestL02,
                                                              {
                                                                CurrentPassword: CommonTest.user02_at_TestL02_data.Password + "1",
                                                                NewPassword: CommonTest.user02_at_TestL02_data.Password
                                                              },
                                                              "ERROR_NEW_PASSWORD_NOT_VALID",
                                                              "EC2D59F2121A",
                                                              "EC2D59F2121A_test_change_password_user02@TestL02_fail" ),
                       "EC2D59F2121A: The user user02@TestL02 is OK with the fail",
                       "EC2D59F2121A: The user user02@TestL02 is FAILED" );

  CommonTest.myAssert( await UserTestV1.test_change_password( CommonTest.headers_user02_at_TestL02,
                                                              {
                                                                CurrentPassword: CommonTest.user02_at_TestL02_data.Password,
                                                                NewPassword: CommonTest.user02_at_TestL02_data.Password + "0"
                                                              },
                                                              "SUCCESS_PASSWORD_CHANGE",
                                                              "D3533E1D951B",
                                                              "D3533E1D951B_test_change_password_user02@TestL02_success" ),
                       "D3533E1D951B: The user user02@TestL02 is OK",
                       "D3533E1D951B: The user user02@TestL02 is FAILED" );

  CommonTest.user02_at_TestL02_data.Password = CommonTest.user02_at_TestL02_data.Password + "0"; //Update with the new password

  CommonTest.myAssert( await UserTestV1.test_profile_at_less_one_role( CommonTest.headers_user02_at_TestL02,
                                                                       [
                                                                         "#Administrator#",
                                                                         "#BManager_L99#",
                                                                         "#Master_L01#",
                                                                         "#Master_L02#",
                                                                         "#Master_L03#"
                                                                       ],
                                                                       "SUCCESS_GET_SESSION_PROFILE",
                                                                       "DEF3E36E35C4",
                                                                       "DEF3E36E35C4_test_profile_role_user02@TestL02_fail",
                                                                       false ) === false,
                       "DEF3E36E35C4: The user user02@TestL02 is OK not have the roles #Administrator# or #BManager_L99# or #Master_L01# or #Master_L02# or #Master_L03#",
                       "DEF3E36E35C4: The user user02@TestL02 have the roles #Administrator# and/or #BManager_L99# and/or #Master_L01# and/or #Master_L02# and/or #Master_L03# FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_uploadImageTiger( CommonTest.headers_user02_at_TestL02,
                                                                 "SUCCESS_BINARY_DATA_UPLOAD",
                                                                 "3E0415B6F023",
                                                                 "3E0415B6F023_test_uploadImageTiger_user02@TestL02_success",
                                                                 "user02@TestL02_tiger",
                                                                 {
                                                                   Mark: "3E0415B6F023"
                                                                 } ),
                       "3E0415B6F023: Upload image road user02@TestL02 is OK",
                       "3E0415B6F023: Upload image road user02@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_uploadImageRoad( CommonTest.headers_user02_at_TestL02,
                                                                "SUCCESS_BINARY_DATA_UPLOAD",
                                                                "09436E9FE7B4",
                                                                "09436E9FE7B4_test_uploadImageRoad_user02@TestL02_success",
                                                                "user02@TestL02_road",
                                                                {
                                                                  Mark: "09436E9FE7B4"
                                                                } ),
                       "09436E9FE7B4: Upload image road user02@TestL02 is OK",
                       "09436E9FE7B4: Upload image road user02@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_uploadImageTower( CommonTest.headers_user02_at_TestL02,
                                                                 "SUCCESS_BINARY_DATA_UPLOAD",
                                                                 "3AB80F84BD41",
                                                                 "3AB80F84BD41_test_uploadImageTower_user02@TestL02_success",
                                                                 "user02@TestL02_tower",
                                                                 {
                                                                   Mark: "3AB80F84BD41"
                                                                 } ),
                       "3AB80F84BD41: Upload image road user02@TestL02 is OK",
                       "3AB80F84BD41: Upload image road user02@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_disableBulkBinary( CommonTest.headers_user02_at_TestL02,
                                                                  {
                                                                    bulk: [
                                                                            { Id: CommonTest.upload_binary_data[ "user02@TestL02_tiger" ].Id },
                                                                            { Id: CommonTest.upload_binary_data[ "user02@TestL02_road" ].Id },
                                                                            { Id: CommonTest.upload_binary_data[ "user02@TestL02_tower" ].Id }
                                                                          ]
                                                                  },
                                                                  "SUCCESS_BULK_BINARY_DATA_DISABLE",
                                                                  "595898CDF5D7",
                                                                  "595898CDF5D7_test_disableBulkBinary_user02@TestL02_success",
                                                                  false ),
                       "595898CDF5D7: Bulk disable of the binary user02@TestL02 is OK",
                       "595898CDF5D7: Bulk disable of the binary user02@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_enableBulkBinary( CommonTest.headers_user02_at_TestL02,
                                                                 {
                                                                   bulk: [
                                                                           { Id: CommonTest.upload_binary_data[ "user02@TestL02_tiger" ].Id },
                                                                           { Id: CommonTest.upload_binary_data[ "user02@TestL02_road" ].Id },
                                                                           { Id: CommonTest.upload_binary_data[ "user02@TestL02_tower" ].Id }
                                                                         ]
                                                                 },
                                                                 "SUCCESS_BULK_BINARY_DATA_ENABLE",
                                                                 "F687E4496FBC",
                                                                 "F687E4496FBC_test_enableBulkBinary_user02@TestL02_success",
                                                                 false ),
                       "F687E4496FBC: Bulk enable of the binary user02@TestL02 is OK",
                       "F687E4496FBC: Bulk enable of the binary user02@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_deleteBulkBinary( CommonTest.headers_user02_at_TestL02,
                                                                 {
                                                                   bulk: [
                                                                           { Id: CommonTest.upload_binary_data[ "user02@TestL02_tiger" ].Id },
                                                                           { Id: CommonTest.upload_binary_data[ "user02@TestL02_road" ].Id },
                                                                           { Id: CommonTest.upload_binary_data[ "user02@TestL02_tower" ].Id }
                                                                         ]
                                                                 },
                                                                 "SUCCESS_BULK_BINARY_DATA_DELETE",
                                                                 "B4A86820CB65",
                                                                 "B4A86820CB65_test_deleteBulkBinary_user02@TestL02_success" ),
                       "B4A86820CB65: Bulk delete of the binary user02@TestL02 is OK",
                       "B4A86820CB65: Bulk delete of the binary user02@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_uploadImageRoad( CommonTest.headers_user02_at_TestL02,
                                                                 "SUCCESS_BINARY_DATA_UPLOAD",
                                                                 "C16FC48FF980",
                                                                 "C16FC48FF980_test_uploadImageRoad_user02@TestL02_success",
                                                                 "user02@TestL02_road",
                                                                 {
                                                                   Mark: "C16FC48FF980"
                                                                 } ),
                       "C16FC48FF980: Upload image road user02@TestL02 is OK",
                       "C16FC48FF980: Upload image road user02@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_createAuth( CommonTest.headers_user02_at_TestL02,
                                                           "SUCCESS_AUTH_TOKEN_CREATED",
                                                           "68A9AE102E89",
                                                           "68A9AE102E89_test_createAuth_user02@TestL02_success",
                                                           false ),
                       "68A9AE102E89: Create auth user02@TestL02 is OK",
                       "68A9AE102E89: Create auth user02@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_downloadImageThumbnail( CommonTest.headers_user02_at_TestL02,
                                                                       "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                                       "29EA767C6CF1",
                                                                       "29EA767C6CF1_test_downloadImageRoadThumbnail_user02@TestL02_success",
                                                                       "user02@TestL02_road" ),
                       "29EA767C6CF1: Download image thumbnail road user02@TestL02 is OK",
                       "29EA767C6CF1: Download image thumbnail road user02@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_downloadImage( CommonTest.headers_user02_at_TestL02,
                                                              "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                              "D4F7EE1786AE",
                                                              "D4F7EE1786AE_test_downloadImageRoad_user02@TestL02_success",
                                                              "user02@TestL02_road",
                                                              null ),
                       "D4F7EE1786AE: Download image road user02@TestL02 is OK",
                       "D4F7EE1786AE: Download image road user02@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_getImageDetails( CommonTest.headers_user02_at_TestL02,
                                                                "SUCCESS_GET_BINARY_DATA_DETAILS",
                                                                "D121F8FC1A6E",
                                                                "D121F8FC1A6E_test_getImageDetailsRoad_user02@TestL02_success",
                                                                "user02@TestL02_road" ),
                       "D121F8FC1A6E: Get image details road user02@TestL02 is OK",
                       "D121F8FC1A6E: Get image details road user02@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_binarySearch( CommonTest.headers_user02_at_TestL02,
                                                             {  },
                                                             "SUCCESS_SEARCH",
                                                             "BA8DDFDEC334",
                                                             "BA8DDFDEC334_test_search_user02@TestL02_success",
                                                             2,
                                                             1 ),
                       "BA8DDFDEC334: Search of the binary data user02@TestL02 is OK",
                       "BA8DDFDEC334: Search of the binary data user02@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_binarySearchCount( CommonTest.headers_user02_at_TestL02,
                                                                  {  },
                                                                  "SUCCESS_SEARCH_COUNT",
                                                                  "E21BF5EF740F",
                                                                  "E21BF5EF740F_test_searchCount_user02@TestL01_success",
                                                                  2,
                                                                  1 ),
                       "E21BF5EF740F: Search count of the binary data user02@TestL02 is OK",
                       "E21BF5EF740F: Search count of the binary data user02@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_binarySearch( CommonTest.headers_user01_at_TestL02,
                                                             {  },
                                                             "SUCCESS_SEARCH",
                                                             "BA8DDFDEC334",
                                                             "BA8DDFDEC334_test_search_user01@TestL02_success",
                                                             2,
                                                             2 ),
                       "BA8DDFDEC334: Search of the binary data user01@TestL02 is OK",
                       "BA8DDFDEC334: Search of the binary data user01@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_binarySearchCount( CommonTest.headers_user01_at_TestL02,
                                                                  {  },
                                                                  "SUCCESS_SEARCH_COUNT",
                                                                  "C107CF6AA8EB",
                                                                  "C107CF6AA8EB_test_searchCount_user01@TestL02_success",
                                                                  2,
                                                                  2 ),
                       "C107CF6AA8EB: Search count of the binary data user01@TestL02 is OK",
                       "C107CF6AA8EB: Search count of the binary data user01@TestL02 is FAILED" );

  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_logout( CommonTest.headers_user02_at_TestL02,
                                                                       "SUCCESS_LOGOUT",
                                                                       "0A2396B71024",
                                                                       "0A2396B71024_test_logout_user02@TestL02_success" ),
                       "0A2396B71024: Logout with user user02@TestL02 is OK",
                       "0A2396B71024: Logout with user user02@TestL02 is FAILED" );

  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_logout( CommonTest.headers_user02_at_TestL02,
                                                                       "ERROR_LOGGED_OUT_AUTHORIZATION_TOKEN",
                                                                       "56FE7F65DC57",
                                                                       "56FE7F65DC57_test_logout_user02@TestL02_fail" ),
                       "56FE7F65DC57: Logout with user user02@TestL02 is OK with the fail",
                       "56FE7F65DC57: Logout with user user02@TestL02 is FAILED" );

  CommonTest.consoleLog( "Separator.blue", "<******************** user02@TestL02 ********************>", "none" );

}

export async function test_v1_phase08() {

  CommonTest.consoleLog( "Separator.blue", ">******************** user02@TestL01 ********************<", "none" );

  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_login( CommonTest.headers_user02_at_TestL01,
                                                                      {
                                                                        Name: CommonTest.user02_at_TestL01_data.Name,
                                                                        Password: CommonTest.user02_at_TestL01_data.Password
                                                                      },
                                                                      "SUCCESS_LOGIN",
                                                                      "9505C68A979F",
                                                                      "9505C68A979F_test_login_user02@TestL01_success",
                                                                      false ),
                       "9505C68A979F: Login with user user02@TestL01 OK",
                       "9505C68A979F: Login with user user02@TestL01 FAILED" );

  CommonTest.myAssert( await UserTestV1.test_profile_at_less_one_role( CommonTest.headers_user02_at_TestL01,
                                                                       [ "#Administrator#", "#BManager_L99#", "#Master_L01#", "#Master_L02#", "#Master_L03#" ],
                                                                       "SUCCESS_GET_SESSION_PROFILE",
                                                                       "BE0D27084964",
                                                                       "BE0D27084964_test_profile_role_user02@TestL01_fail",
                                                                       false ) === false,
                       "BE0D27084964: The user user02@TestL01 is OK not have the roles #Administrator# or #BManager_L99# or #Master_L01# or #Master_L02# or #Master_L03#",
                       "BE0D27084964: The user user02@TestL01 have the roles #Administrator# and/or #BManager_L99# and/or #Master_L01# and/or #Master_L02# and/or #Master_L03# FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_uploadImageCastle( CommonTest.headers_user02_at_TestL01,
                                                                  "SUCCESS_BINARY_DATA_UPLOAD",
                                                                  "6355B124499E",
                                                                  "6355B124499E_test_uploadImageCastle_user02@TestL01_success",
                                                                  "user02@TestL01_castle",
                                                                  {
                                                                    Mark: "6355B124499E"
                                                                  } ),
                       "6355B124499E: Upload image castle user02@TestL01 is OK",
                       "6355B124499E: Upload image castle user02@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_createAuth( CommonTest.headers_user02_at_TestL01,
                                                           "SUCCESS_AUTH_TOKEN_CREATED",
                                                           "68A9AE102E89",
                                                           "68A9AE102E89_test_createAuth_user02@TestL01_success",
                                                           false ),
                       "68A9AE102E89: Create auth user02@TestL01 is OK",
                       "68A9AE102E89: Create auth user02@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_downloadImageThumbnail( CommonTest.headers_user02_at_TestL01,
                                                                       "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                                       "8C71B4C27928",
                                                                       "8C71B4C27928_test_downloadImageCastleThumbnail_user02@TestL01_success",
                                                                       "user02@TestL01_castle" ),
                       "8C71B4C27928: Download image thumbnail castle user02@TestL01 is OK",
                       "8C71B4C27928: Download image thumbnail castle user02@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_downloadImage( CommonTest.headers_user02_at_TestL01,
                                                              "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                              "15FC200672CD",
                                                              "15FC200672CD_test_downloadImageCastle_user02@TestL01_success",
                                                              "user02@TestL01_castle",
                                                              null ),
                       "15FC200672CD: Download image castle user02@TestL01 is OK",
                       "15FC200672CD: Download image castle user02@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_getImageDetails( CommonTest.headers_user02_at_TestL01,
                                                                "SUCCESS_GET_BINARY_DATA_DETAILS",
                                                                "C4D63A79B8C6",
                                                                "C4D63A79B8C6_test_getImageDetailsCatle_user02@TestL01_success",
                                                                "user02@TestL01_castle" ),
                       "C4D63A79B8C6: Get image details castle user02@TestL01 is OK",
                       "C4D63A79B8C6: Get image details castle user02@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_binarySearch( CommonTest.headers_user02_at_TestL01,
                                                             {  },
                                                             "SUCCESS_SEARCH",
                                                             "42D17A37758A",
                                                             "42D17A37758A_test_search_user02@TestL01_success",
                                                             2,
                                                             1 ),
                       "42D17A37758A: Search of the binary data user02@TestL01 is OK",
                       "42D17A37758A: Search of the binary data user02@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_binarySearchCount( CommonTest.headers_user02_at_TestL01,
                                                                  {  },
                                                                  "SUCCESS_SEARCH_COUNT",
                                                                  "7A542D403847",
                                                                  "7A542D403847_test_searchCount_user02@TestL01_success",
                                                                  2,
                                                                  1 ),
                       "7A542D403847: Search count of the binary data user02@TestL01 is OK",
                       "7A542D403847: Search count of the binary data user02@TestL01 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_binarySearch( CommonTest.headers_user01_at_TestL02,
                                                             {  },
                                                             "SUCCESS_SEARCH",
                                                             "FA694F2DF9DB",
                                                             "FA694F2DF9DB_test_search_user01@TestL02_success",
                                                             2,
                                                             3 ),
                       "FA694F2DF9DB: Search of the binary data user01@TestL02 is OK",
                       "FA694F2DF9DB: Search of the binary data user01@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_binarySearchCount( CommonTest.headers_user01_at_TestL02,
                                                                  {  },
                                                                  "SUCCESS_SEARCH_COUNT",
                                                                  "3C577FAE6D3C",
                                                                  "3C577FAE6D3C_test_searchCount_user01@TestL02_success",
                                                                  2,
                                                                  3 ),
                       "3C577FAE6D3C: Search count of the binary data user01@TestL02 is OK",
                       "3C577FAE6D3C: Search count of the binary data user01@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_deleteImage( CommonTest.headers_user02_at_TestL01,
                                                            "SUCCESS_BINARY_DATA_DELETE",
                                                            "61FD3EFB09E7",
                                                            "61FD3EFB09E7_test_deleteImageCastle_user02@TestL01_success",
                                                            "user02@TestL01_castle" ),
                       "61FD3EFB09E7: Delete image castle user02@TestL01 is OK",
                       "61FD3EFB09E7: Delete image castle user02@TestL01 is FAILED" );

  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_logout( CommonTest.headers_user02_at_TestL01,
                                                                       "SUCCESS_LOGOUT",
                                                                       "A82203930794",
                                                                       "A82203930794_test_logout_user02@TestL01_success" ),
                       "A82203930794: Logout with user user02@TestL01 is OK",
                       "A82203930794: Logout with user user02@TestL01 is FAILED" );

  CommonTest.consoleLog( "Separator.blue", "<******************** user02@TestL01 ********************>", "none" );

}

export async function test_v1_phase09() {

  CommonTest.myAssert( await BinaryTestV1.test_deleteImage( CommonTest.headers_user01_at_TestL02,
                                                            "SUCCESS_BINARY_DATA_DELETE",
                                                            "DC8835AA08C0",
                                                            "DC8835AA08C0_test_deleteImageRoad_user01@TestL02_success",
                                                            "user02@TestL02_road" ),
                       "DC8835AA08C0: Delete image road user01@TestL02 is OK",
                       "DC8835AA08C0: Delete image road user01@TestL02 is FAILED" );

  CommonTest.myAssert( await BinaryTestV1.test_deleteImage( CommonTest.headers_user01_at_TestL02,
                                                            "SUCCESS_BINARY_DATA_DELETE",
                                                            "D02C1566D62C",
                                                            "D02C1566D62C_test_deleteImageRoad_user01@TestL02_success",
                                                            "user01@TestL02_road" ),
                       "D02C1566D62C: Delete image road user01@TestL02 is OK",
                       "D02C1566D62C: Delete image road user01@TestL02 is FAILED" );

  //Success because user01@TestL02 has the Role => #Master_L03#+#GName:TestL01#+#GName:TestL02#+#GName:TestL45#+#GName:TestL55#
  CommonTest.myAssert( await UserTestV1.test_deleteUser( CommonTest.headers_user01_at_TestL02,
                                                         {
                                                           Id: CommonTest.user02_at_TestL02_data.Id
                                                         },
                                                         "SUCCESS_USER_DELETE",
                                                         "B266409B2D82",
                                                         "B266409B2D82_test_deleteUser_user02@TestL02_success" ),
                       "B266409B2D82: Delete of the user user02@TestL02 is OK",
                       "B266409B2D82: Delete of the user user02@TestL02 is FAILED" );

  //Success because user01@TestL02 has the Role => #Master_L03#+#GName:TestL01#+#GName:TestL02#+#GName:TestL45#+#GName:TestL55#
  CommonTest.myAssert( await UserTestV1.test_deleteUser( CommonTest.headers_user01_at_TestL02,
                                                         {
                                                           Id: CommonTest.user02_at_TestL01_data.Id
                                                         },
                                                         "SUCCESS_USER_DELETE",
                                                         "608E3D626873",
                                                         "608E3D626873_test_deleteUser_user02@TestL01_success" ),
                       "608E3D626873: Delete of the user user02@TestL01 is OK",
                       "608E3D626873: Delete of the user user02@TestL01 is FAILED" );

  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_logout( CommonTest.headers_user01_at_TestL02,
                                                                       "SUCCESS_LOGOUT",
                                                                       "56FE7F65DC57",
                                                                       "56FE7F65DC57_test_logout_user01@TestL02_success" ),
                       "56FE7F65DC57: Logout with user user01@TestL02 is OK",
                       "56FE7F65DC57: Logout with user user01@TestL02 is FAILED" );

  CommonTest.consoleLog( "Separator.blue", "<******************** user01@TestL02 ********************>", "none" );

}

export async function test_v1_phase10() {

  CommonTest.myAssert( await BinaryTestV1.test_deleteImage( CommonTest.headers_adminXX_at_system_net,
                                                            "SUCCESS_BINARY_DATA_DELETE",
                                                            "B916F1ECD54E",
                                                            "B916F1ECD54E_test_deleteImageTiger_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success",
                                                            "admin01@system.net_tiger" ),
                       "B916F1ECD54E: Delete image tiger " + CommonTest.strStartUser + " is OK",
                       "B916F1ECD54E: Delete image tiger " + CommonTest.strStartUser + " is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_deleteUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                   {
                                                                     Name: "TestL01"
                                                                   },
                                                                   "ERROR_USER_GROUP_IS_NOT_USER_EMPTY",
                                                                   "B57DF85241CF",
                                                                   "B57DF85241CF_test_deleteUserGroup_TestL01_fail" ),
                       "B57DF85241CF: Delete of the user group TestL01 is OK with the fail",
                       "B57DF85241CF: Delete of the user group TestL01 is FAILED" );

  CommonTest.myAssert( await UserTestV1.test_deleteUser( CommonTest.headers_adminXX_at_system_net,
                                                         {
                                                           Id: CommonTest.user01_at_TestL01_data.Id
                                                         },
                                                         "SUCCESS_USER_DELETE",
                                                         "96620A9B1111",
                                                         "96620A9B1111_test_deleteUser_user01@TestL01_success" ),
                       "96620A9B1111: Delete of the user user01@TestL01 is OK",
                       "96620A9B1111: Delete of the user user01@TestL01 is FAILED" );

  CommonTest.myAssert( await UserTestV1.test_deleteUser( CommonTest.headers_adminXX_at_system_net,
                                                         {
                                                           Id: CommonTest.user01_at_TestL02_data.Id
                                                         },
                                                         "SUCCESS_USER_DELETE",
                                                         "B6822813434C",
                                                         "B6822813434C_test_deleteUser_user01@TestL02_success" ),
                       "B6822813434C: Delete of the user user01@TestL02 is OK",
                       "B6822813434C: Delete of the user user01@TestL02 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_deleteUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                   {
                                                                     Name: "TestL01"
                                                                   },
                                                                   "SUCCESS_USER_GROUP_DELETE",
                                                                   "52D06C775657",
                                                                   "52D06C775657_test_deleteUserGroup_TestL01_success" ),
                       "52D06C775657: Delete of the user group TestL01 is OK",
                       "52D06C775657: Delete of the user group TestL01 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_deleteUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                   {
                                                                     Name: "TestL02"
                                                                   },
                                                                   "SUCCESS_USER_GROUP_DELETE",
                                                                   "2AAF1B478DDB",
                                                                   "2AAF1B478DDB_test_deleteUserGroup_TestL02_success" ),
                       "2AAF1B478DDB: Delete of the user group TestL02 is OK",
                       "2AAF1B478DDB: Delete of the user group TestL02 is FAILED" );

  CommonTest.myAssert( await UserGroupTestV1.test_deleteUserGroup( CommonTest.headers_adminXX_at_system_net,
                                                                   {
                                                                     Name: "TestL02"
                                                                   },
                                                                   "ERROR_USER_GROUP_NOT_FOUND",
                                                                   "ECB00198468C",
                                                                   "ECB00198468C_test_deleteUserGroup_TestL02_again_fail" ),
                       "ECB00198468C: Delete of the user group TestL02 is OK with the fail",
                       "ECB00198468C: Delete of the user group TestL02 is FAILED" );

}

export async function test_v1_phase11() {

  CommonTest.myAssert( await SecurityAuthenticationTestV1.test_logout( CommonTest.headers_adminXX_at_system_net,
                                                                       "SUCCESS_LOGOUT",
                                                                       "0E7222800B26",
                                                                       "0E7222800B26_test_logout_" + CommonTest.strStartUser.replace( ".", "_" ) + "_success" ),
                       "0E7222800B26: Logout with user " + CommonTest.strStartUser + " is OK",
                       "0E7222800B26: Logout with user " + CommonTest.strStartUser + " is FAILED" );

  CommonTest.consoleLog( "Separator.blue", "<******************** " + CommonTest.strStartUser + " ********************>", "none" );

}

async function test01_v1() {

  CommonTest.systemSecurityAuthenticationServiceV1 = new SystemSecurityAuthenticationServiceV1( CommonTest.strProtocol, CommonTest.strHost );
  CommonTest.userRequestServiceV1 = new UserRequestServiceV1( CommonTest.strProtocol, CommonTest.strHost );
  CommonTest.userGroupRequestServiceV1 = new UserGroupRequestServiceV1( CommonTest.strProtocol, CommonTest.strHost );
  CommonTest.binaryRequestServiceV1 = new BinaryRequestServiceV1( CommonTest.strProtocol, CommonTest.strHost );
  CommonTest.databaseRequestServiceV1 = new DatabaseRequestServiceV1( CommonTest.strProtocol, CommonTest.strHost );

  CommonTest.consoleLog( "Message.blue", "Starting the test01" );

  try {

    await test_v1_phase01();

    try {

      await test_v1_phase02();

      try {

        await test_v1_phase03();

        try {

          await test_v1_phase04();

        }
        catch ( error ) {

          CommonTest.consoleLog( "Error", error );
          CommonTest.consoleLog( "Separator.blue", "<******************** user02@TestL01 ********************>", "none" );

        }

        await test_v1_phase05();

      }
      catch ( error ) {

        CommonTest.consoleLog( "Error", error );
        CommonTest.consoleLog( "Separator.blue", "<******************** user01@TestL01 ********************>", "none" );

      }

      try {

        await test_v1_phase06();

        try {

          await test_v1_phase07();

        }
        catch ( error ) {

          CommonTest.consoleLog( "Error", error );
          CommonTest.consoleLog( "Separator.blue", "<******************** user02@TestL02 ********************>", "none" );

        }

        try {

          await test_v1_phase08();

        }
        catch ( error ) {

          CommonTest.consoleLog( "Error", error );
          CommonTest.consoleLog( "Separator.blue", "<******************** user02@TestL01 ********************>", "none" );

        }

        await test_v1_phase09();

      }
      catch ( error ) {

        CommonTest.consoleLog( "Error", error );
        CommonTest.consoleLog( "Separator.blue", "<******************** user01@TestL02 ********************>", "none" );

      }

      await test_v1_phase10();

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    await test_v1_phase11();

    CommonTest.consoleLog( "Separator.blue", "<******************** Finished ********************>", "none" );

  }
  catch ( error ) {

    CommonTest.consoleLog( "Error", error );
    CommonTest.consoleLog( "Separator.blue", "<******************** " + CommonTest.strStartUser + " ********************>", "none" );

  }

}

export default async function main() {

  const currentArgs = process.argv.slice( 2 );

  if ( currentArgs &&
       currentArgs.length > 0 ) {

    if ( currentArgs[ 0 ] &&
         currentArgs[ 0 ].startsWith( "--username=" ) ) {

      CommonTest.strStartUser = currentArgs[ 0 ].replace( "--username=", "" ).trim();

    }

    if ( currentArgs.length >= 2 &&
         currentArgs[ 1 ] &&
         currentArgs[ 1 ].startsWith( "--password=" ) ) {

      CommonTest.strStartPassword = currentArgs[ 1 ].replace( "--password=", "" ).trim();

    }

    if ( currentArgs.length >= 3 &&
         currentArgs[ 2 ] &&
         currentArgs[ 2 ].startsWith( "--target=" ) ) {

      const targetParts = currentArgs[ 2 ].replace( "--target=", "" ).trim().split( "://" );

      if ( targetParts.length >= 2 ) {

        CommonTest.strProtocol = targetParts[ 0 ] + "://";
        CommonTest.strHost = targetParts[ 1 ];

      }

    }

    if ( currentArgs.length >= 4 &&
         currentArgs[ 3 ] &&
         currentArgs[ 3 ].startsWith( "--outputFormat=" ) ) {

      CommonTest.strOutputFormat = currentArgs[ 3 ].replace( "--outputFormat=", "" ).trim();

    }

  }

  SystemUtilities.startRun = SystemUtilities.getCurrentDateAndTime(); //new Date();

  SystemUtilities.strBaseRunPath = __dirname;
  SystemUtilities.strBaseRootPath = appRoot.path;

  await test01_v1();

}

main();
