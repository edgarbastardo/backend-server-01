/*
import uuidv4 from 'uuid/v4';
import moment from 'moment-timezone';
import os from 'os';
import bcrypt from 'bcrypt';
import Hashes from 'jshashes';
*/

import cluster from 'cluster';
import appRoot from 'app-root-path';

import CommonConstants from '../../../../02_system/common/CommonConstants';
import SystemConstants from "../../../../02_system/common/SystemContants";

import CommonUtilities from '../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../02_system/common/SystemUtilities';

import { SYSConfigMetaData } from "../../../../02_system/common/database/master/models/SYSConfigMetaData";
import { SYSConfigValueData } from '../../../../02_system/common/database/master/models/SYSConfigValueData';

const debug = require( 'debug' )( '001_system_check_basic_configs_exists' );

require( 'dotenv' ).config( { path: appRoot.path + "/.env.secrets" } );

//Example file import files using code
export default class Always {

  static disabled(): boolean {

    return false;

  }

  static async execute( dbConnection: any, context: any, logger: any ): Promise<any> {

    //The dbConnection parameter is instance of ORM object (sequelize)
    let bSuccess = false;
    let bEmptyContent = true;

    let currentTransaction = null;

    try {

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

      }

      //Check if exists the the basic config entries defined
      const configEntries = SystemConstants._CONFIG_METADATA_ENTRIES;

      const loopConfigEntriesAsync = async () => {

        await CommonUtilities.asyncForEach( configEntries as any, async ( configMetaDataToCreate: any ) => {

          const options = {

            where: { Name: configMetaDataToCreate.Name },
            transaction: currentTransaction,

          }

          const configMetaDataInDB = await SYSConfigMetaData.findOne( options );

          try {

            if ( configMetaDataInDB === null ) {

              //const configMetaDataCreated =
              await SYSConfigMetaData.create( configMetaDataToCreate );

              /*
              if ( configMetaDataCreated ) {

                let debugMark = debug.extend( "A7103054FB0D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );
                debugMark( configMetaDataCreated );

              }
              */

            }
            else if ( !configMetaDataInDB.Tag ||
                      configMetaDataInDB.Tag.includes( "#Not_Update_On_Startup#" ) === false ) {

              configMetaDataInDB.Default = configMetaDataToCreate.Default;
              configMetaDataInDB.Example = configMetaDataToCreate.Example;
              configMetaDataInDB.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

              await SYSConfigMetaData.update( ( configMetaDataInDB as any ).dataValues,
                                              options );

            }

          }
          catch ( error ) {

            const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

            sourcePosition.method = this.name + "." + this.execute.name;

            const strMark = "E3156CF22D57" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

            const debugMark = debug.extend( strMark );

            debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
            debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            debugMark( "Catched on: %O", sourcePosition );

            error.mark = strMark;
            error.logId = SystemUtilities.getUUIDv4();

            if ( logger && typeof logger.error === "function" ) {

              error.catchedOn = sourcePosition;
              logger.error( error );

            }

          }

        });

      }

      await loopConfigEntriesAsync();

      //Insert test data
      const configValueEntries = [
                                   {
                                     ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_ExpireTimeAuthentication.Id, //system.authentication.ExpireTimeAuthentication
                                     Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                     //Value: `{ "#System_Administrators#": { "kind": 0, "on": 120 } }`,
                                     Value: JSON.stringify(

                                                            {

                                                              "#System_Administrators#": {

                                                                kind: 0,
                                                                on: 60 * 2

                                                              },

                                                              "#Business_Managers#": {

                                                                kind: 0,
                                                                on: 60 * 2

                                                              },

                                                              "#Administrative_Asistants#": {

                                                                kind: 0,
                                                                on: 60

                                                              },

                                                              "#Dispatchers#": {

                                                                kind: 0,
                                                                on: 60 * 2

                                                              },

                                                              "#Drivers#": {

                                                                kind: 0,
                                                                on: 60 * 4

                                                              },

                                                              "#Final_Customers#": {

                                                                kind: 1,
                                                                on: 60 * 24 * 60

                                                              },

                                                              //TODO set by role from the user
                                                              "#Establishment#": {

                                                                kind: 1,
                                                                on: 60 * 24 * 60

                                                              }

                                                            }

                                                          ),
                                     CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   },
                                   {
                                     ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_BinaryDataMaximumSize.Id,  //"f318f541-8367-42e7-ac71-904cab35bac1", //system.binary.data.BinaryDataMaximumSize
                                     Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                     Value: `10240`,
                                     CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   },
                                   {
                                     ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_BinaryDataAllowedCategory.Id, //"c0ea3ece-277c-4490-b2c1-a06f54382520", //system.binary.data.AllowedCategory
                                     Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                     Value: JSON.stringify(

                                                            {

                                                              "#System_Administrators#": {

                                                                "denied": "",
                                                                "allowed": "*"

                                                              },

                                                              "#DocumentAllowL01#": {

                                                                "denied": "",
                                                                "allowed": "#document#"

                                                              },

                                                              "#Business_Managers#": {

                                                                "denied":"",
                                                                "allowed":"*"

                                                              },

                                                              "#Administrative_Asistants#": {

                                                                "denied":"",
                                                                "allowed":"*"

                                                              },

                                                              "#Drivers#": {

                                                                "denied":"",
                                                                "allowed":"*"

                                                              },
                                                              /*
                                                              "#admin01@system.net#": {

                                                                "denied":"",
                                                                "allowed":"#test#,#other#"

                                                              },
                                                              "@__default__@": {

                                                                "denied": "",
                                                                "allowed": "*"

                                                              }
                                                              */

                                                            }

                                                          ),
                                     CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   },
                                   {
                                     ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_BinaryDataAllowedMimeType.Id, //"e2f57878-e408-4754-ac13-d7186ed451ba", //system.binary.data.AllowedMimeType
                                     Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                     Value: JSON.stringify(

                                                            {

                                                              "#System_Administrators#.other": {

                                                                "denied": "#image/png#,#image/jpeg#",
                                                                "allowed": "*"

                                                              },

                                                              "#System_Administrators#": {

                                                                "denied":"",
                                                                "allowed":"*"

                                                              },

                                                              "#Business_Managers#": {

                                                                "denied":"",
                                                                "allowed":"*"

                                                              },

                                                              "#Administrative_Asistants#": {

                                                                "denied":"",
                                                                "allowed":"*"

                                                              },

                                                              "#Drivers#": {

                                                                "denied":"",
                                                                "allowed":"#image/png#,#image/jpeg#,#image/jpg#"

                                                              },

                                                              "#System_Administrators#.test2": {

                                                                "denied": "*",
                                                                "allowed": ""

                                                              },

                                                              "#Documents_Allow_01#": {

                                                                "denied": "",
                                                                "allowed": "#application/pdf#"

                                                              },

                                                              "#admin01@system.net#.test1": {

                                                                "denied": "#application/json#",
                                                                "allowed": "#image/png#,#image/jpeg#"

                                                              },

                                                              "#testgif#": {

                                                                "denied": "",
                                                                "allowed": "#image/gif#"

                                                              },

                                                              "#testjpeg#": {

                                                                "denied": "",
                                                                "allowed": "#image/jpeg#"

                                                              },

                                                              "#testpng#": {

                                                                "denied": "",
                                                                "allowed": "#image/png#"

                                                              },

                                                              "#test#": {

                                                                "denied": "",
                                                                "allowed": "#image/png#,#image/jpeg#"

                                                              },

                                                              "#ticket#": {

                                                                "denied": "",
                                                                "allowed": "#image/png#,#image/jpeg#,#image/gif#"

                                                              },

                                                              "#document#": {

                                                                "denied": "",
                                                                "allowed": "#application/pdf#,#application/docx#,#application/xlsx#"

                                                              },

                                                              "@__default__@": {

                                                                "denied": "",
                                                                "allowed": "*"

                                                              }

                                                            }

                                                          ),
                                     CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   },
                                   {
                                     ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_PasswordStrengthParameters.Id, //system.Security.PasswordStrengthParameters
                                     Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                     Value: JSON.stringify(

                                                            {

                                                              "@__default__@": {

                                                                "minLength": 8,
                                                                "maxLength": 0,
                                                                "minLowerCase": 0,
                                                                "maxLowerCase": 0,
                                                                "minUpperCase": 0,
                                                                "maxUpperCase": 0,
                                                                "minDigit": 0,
                                                                "maxDigit": 0,
                                                                "minSymbol": 0,
                                                                "maxSymbol": 0,
                                                                "symbols": ""

                                                              },

                                                              "#System_Administrators#": { //<= Group name

                                                                "minLength": 8,
                                                                "maxLength": 0,
                                                                "minLowerCase": 4,
                                                                "maxLowerCase": 0,
                                                                "minUpperCase": 0,
                                                                "maxUpperCase": 0,
                                                                "minDigit": 2,
                                                                "maxDigit": 0,
                                                                "minSymbol": 2,
                                                                "maxSymbol": 0,
                                                                "symbols": ""

                                                              },

                                                              "#Business_Managers#": { //<= Group name

                                                                "minLength": 8,
                                                                "maxLength": 0,
                                                                "minLowerCase": 4,
                                                                "maxLowerCase": 0,
                                                                "minUpperCase": 0,
                                                                "maxUpperCase": 0,
                                                                "minDigit": 2,
                                                                "maxDigit": 0,
                                                                "minSymbol": 1,
                                                                "maxSymbol": 0,
                                                                "symbols": ""

                                                              },

                                                              "#Drivers#": { //<= Group name

                                                                "minLength": 5,
                                                                "maxLength": 8,
                                                                "minLowerCase": 0,
                                                                "maxLowerCase": 0,
                                                                "minUpperCase": 0,
                                                                "maxUpperCase": 0,
                                                                "minDigit": 0,
                                                                "maxDigit": 0,
                                                                "minSymbol": 0,
                                                                "maxSymbol": 0,
                                                                "symbols": ""

                                                              },

                                                              "#Final_Customers#": { //<= Group name

                                                                "minLength": 7,
                                                                "maxLength": 9,
                                                                "minLowerCase": 0,
                                                                "maxLowerCase": 0,
                                                                "minUpperCase": 0,
                                                                "maxUpperCase": 0,
                                                                "minDigit": 0,
                                                                "maxDigit": 0,
                                                                "minSymbol": 0,
                                                                "maxSymbol": 0,
                                                                "symbols": ""

                                                              },

                                                              "#Establishments#": { //<= Group name

                                                                "minLength": 8,
                                                                "maxLength": 10,
                                                                "minLowerCase": 0,
                                                                "maxLowerCase": 0,
                                                                "minUpperCase": 0,
                                                                "maxUpperCase": 0,
                                                                "minDigit": 0,
                                                                "maxDigit": 0,
                                                                "minSymbol": 0,
                                                                "maxSymbol": 0,
                                                                "symbols": ""

                                                              },

                                                              "#Administrative_Asistants#": {  //<= Group name

                                                                "minLength": 5,
                                                                "maxLength": 8,
                                                                "minLowerCase": 0,
                                                                "maxLowerCase": 0,
                                                                "minUpperCase": 0,
                                                                "maxUpperCase": 0,
                                                                "minDigit": 0,
                                                                "maxDigit": 0,
                                                                "minSymbol": 0,
                                                                "maxSymbol": 0,
                                                                "symbols": ""

                                                              },

                                                              "#Dispatchers#": {  //<= Group name

                                                                "minLength": 5,
                                                                "maxLength": 8,
                                                                "minLowerCase": 0,
                                                                "maxLowerCase": 0,
                                                                "minUpperCase": 0,
                                                                "maxUpperCase": 0,
                                                                "minDigit": 0,
                                                                "maxDigit": 0,
                                                                "minSymbol": 0,
                                                                "maxSymbol": 0,
                                                                "symbols": ""

                                                              }

                                                            }

                                                          ),
                                     CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   },
                                   {
                                     ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_UserSignupProcess.Id, //system.user.signup.Process
                                     Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                     Value: JSON.stringify(

                                                            {

                                                              "@__default__@": {

                                                                "expireAt": 60, //Token signup valid time in minutes
                                                                "group": "@__error__@",
                                                                "createGroup": false,
                                                                "groupRole": "",
                                                                "groupTag": "",
                                                                "groupExpireAt": -1,
                                                                "status": -1,
                                                                "userRole": "",
                                                                "userTag": "",
                                                                "userForceChangePassword": 0,
                                                                "userChangePasswordEvery": 0,
                                                                "userSessionsLimit": 0,
                                                                "passwordParameterTag": ""

                                                              },

                                                              "#Driver#": {

                                                                "expireAt": 60, //Token signup valid time in minutes
                                                                "group": "Drivers",
                                                                "createGroup": false,
                                                                "groupRole": "",
                                                                "groupTag": "",
                                                                "groupExpireAt": -1,
                                                                "status": 1,
                                                                "userRole": "",
                                                                "userTag": "",
                                                                "userExpireAt": -1,
                                                                "userForceChangePassword": 0,
                                                                "userChangePasswordEvery": 0,
                                                                "userSessionsLimit": 1, //Only 1 session at time
                                                                "passwordParameterTag": ""

                                                              },

                                                              "#Final_Customer#": {

                                                                "expireAt": 60,  //Token signup valid time in minutes
                                                                "group": "Final_Customers",
                                                                "createGroup": false,
                                                                "groupRole": "",
                                                                "groupTag": "",
                                                                "groupExpireAt": -1,
                                                                "status": 1,
                                                                "userRole": "",
                                                                "userTag": "",
                                                                "userExpireAt": -1,
                                                                "userForceChangePassword": 0,
                                                                "userChangePasswordEvery": 0,
                                                                "userSessionsLimit": 1, //Only 1 session at time
                                                                "passwordParameterTag": ""

                                                              },

                                                              "#Establishment#": {

                                                                "expireAt": 60,  //Token signup valid time in minutes
                                                                "group": "@__FromName__@",
                                                                "createGroup": true,
                                                                "groupRole": "#@__FromName__@#,#Establishment#",
                                                                "groupTag": "",
                                                                "groupExpireAt": -1,
                                                                "status": 1,
                                                                "userRole": "#Master_L01#,#Establishment#,#Presence_Working#",  //No need the #Upload_Binary#,#Delete_Binary#,#Update_Binary# because #Master_L01# allow that
                                                                "userTag": "",
                                                                "userExpireAt": -1,
                                                                "userForceChangePassword": 0,
                                                                "userChangePasswordEvery": 0,
                                                                "userSessionsLimit": 1, //Only 1 session at time
                                                                "passwordParameterTag": ""

                                                              },

                                                              "#Administrative_Asistant#": {

                                                                "expireAt": 60,  //Token signup valid time in minutes.
                                                                "group":"Administrative_Asistants",
                                                                "createGroup":false,
                                                                "groupRole":"",
                                                                "groupTag":"",
                                                                "groupExpireAt":-1,
                                                                "status":1,
                                                                "userRole":"",
                                                                "userTag":"",
                                                                "userExpireAt":-1,
                                                                "userForceChangePassword": 0,
                                                                "userChangePasswordEvery": 0,
                                                                "userSessionsLimit": 1, //Only 1 session at time
                                                                "passwordParameterTag": ""

                                                              },

                                                            }

                                                          ),
                                     CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   },
                                   {
                                     ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_UserAutoRoleAssign.Id, //system.user.autorole.Assign
                                     Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                     Value: JSON.stringify(

                                                            {

                                                              "create": {

                                                                "@__default__@": {

                                                                  "@__default__@": ""

                                                                },

                                                                "#Master_L01#": {

                                                                  "@__default__@": "#Search_Binary#,#Upload_Binary#,#Update_Binary#,#Delete_Binary#"

                                                                },

                                                                "#Master_L02#": {

                                                                  "@__default__@": "#Search_Binary#,#Upload_Binary#,#Update_Binary#,#Delete_Binary#"

                                                                },

                                                                "#Master_L03#": {

                                                                  "@__default__@": "#Search_Binary#,#Upload_Binary#,#Update_Binary#,#Delete_Binary#"

                                                                },

                                                                "#Driver#": {

                                                                  "@__default__@": "#Search_Binary#,#Upload_Binary#,#Update_Binary#,#Delete_Binary#"

                                                                },

                                                                "#Establishment#": {

                                                                  "@__default__@": "#Presence_Working#,#Search_Binary#,#Upload_Binary#,#Update_Binary#,#Delete_Binary#"

                                                                }

                                                              },

                                                              "update": {

                                                                "@__default__@": {

                                                                  "@__default__@": ""

                                                                },

                                                              }

                                                            }

                                                          ),
                                     CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   },
                                   {
                                     ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_EMAIL_Service.Id, //system.notification.email.service
                                     Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                     Value: JSON.stringify(

                                                            {

                                                              "service": "#send_grid#",

                                                              "#gmail#": {

                                                                "type": "smtp",
                                                                "host": "smtp.gmail.com",
                                                                "port": 465,
                                                                "secure": true,

                                                                "auth": {

                                                                  "user": process.env.NOTIFICATION_TRANSPORT_SMTP_USER || "",
                                                                  "pass": process.env.NOTIFICATION_TRANSPORT_SMTP_PASSWORD || ""

                                                                }

                                                              },

                                                              "#send_grid#": {

                                                                "type": "send_grid",
                                                                "host": "api.sendgrid.com/v3/mail/send",
                                                                "port": 443,

                                                                "auth": {

                                                                  "api_key": process.env.NOTIFICATION_TRANSPORT_SEND_GRID_API_KEY || ""

                                                                }

                                                              }

                                                            }

                                                          ),
                                     CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   },
                                   {
                                     ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_SMS_Service.Id, //system.notification.sms.service
                                     Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                     Value: JSON.stringify(

                                                            {

                                                              "service": "#sms_gateway#",

                                                              "#sms_gateway#": {

                                                                "type": "sms_gateway",
                                                                "host": process.env.NOTIFICATION_TRANSPORT_SMS_GATEWAY_API_URI || "",
                                                                "port": 443,
                                                                "device_id": "*",
                                                                "context": "AMERICA/NEW_YORK",

                                                                "auth": {

                                                                  "api_key": process.env.NOTIFICATION_TRANSPORT_SMS_GATEWAY_API_KEY || "",
                                                                  "api_key1": process.env.NOTIFICATION_TRANSPORT_SMS_GATEWAY_API_KEY1 || ""

                                                                }

                                                              }

                                                            }

                                                          ),
                                     CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   },
                                   {
                                     ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_PUSH_Service.Id, //system.notification.push.service
                                     Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                     Value: JSON.stringify(

                                                            {

                                                              "service": "#one_signal#",

                                                              "#one_signal#": {

                                                                "type": "one_signal",
                                                                "host": "https://onesignal.com/api/v1/notifications",
                                                                "port": 443,

                                                                "auth": {

                                                                  "app_id": process.env.NOTIFICATION_TRANSPORT_ONE_SIGNAL_APP_ID || "",
                                                                  "api_key": process.env.NOTIFICATION_TRANSPORT_ONE_SIGNAL_API_KEY || ""

                                                                }

                                                              }

                                                            }

                                                          ),
                                     CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   },
                                   {
                                      ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_DISCORD_Service.Id, //system.notification.discord.service
                                      Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                      Value: JSON.stringify(

                                                             {

                                                               "service": "#discord#",

                                                               "#discord#": {

                                                                 "type": "discord",

                                                                 "target": {

                                                                   "web_hooks": CommonUtilities.parseJSON( process.env.NOTIFICATION_TRANSPORT_DISCORD_WEB_HOOK || `{ "@__default__@": "" }`, null )

                                                                 }

                                                               }

                                                             }

                                                           ),
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                  },
                                  {
                                    ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_SLACK_Service.Id, //system.notification.slack.service
                                    Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                    Value: JSON.stringify(

                                                           {

                                                             "service": "#slack#",

                                                             "#slack#": {

                                                               "type": "slack",

                                                               "target": {

                                                                 "web_hooks": CommonUtilities.parseJSON( process.env.NOTIFICATION_TRANSPORT_SLACK_WEB_HOOK || `{ "@__default__@": "" }`, null )

                                                               }

                                                             }

                                                           }

                                                         ),
                                    CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                  },
                                  {
                                     ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_Frontend_Rules.Id, // "70835d21-afdd-4f5b-9a56-61762ba55013", //system.frontend.rules
                                     Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                     Value: JSON.stringify(

                                                            {

                                                              "#ccc#": {

                                                                "user_login_control": {

                                                                  "denied": "*",
                                                                  "allowed": ""

                                                                },

                                                                "user_signup_control": {

                                                                  "denied": "*",
                                                                  "allowed": ""

                                                                },

                                                                "tag": "#web#,#mobile#,#phone#,#tablet#",
                                                                "url": "http://mycompany.com/myapp/url/",

                                                                "route": {

                                                                  "exclude": [

                                                                    "*"

                                                                  ],

                                                                  "include": [

                                                                    //

                                                                  ]

                                                                }

                                                              },

                                                              "@__default__@": {

                                                                "user_login_control": {

                                                                  "denied": "",
                                                                  "allowed": "*"

                                                                },

                                                                "user_signup_control": {

                                                                  "denied": "",
                                                                  "allowed": "*"

                                                                },

                                                                "tag": "#web#,#mobile#,#phone#,#tablet#",
                                                                "url": "http://mycompany.com/myapp/url/",

                                                                "route": {

                                                                  "include": [

                                                                    //"POST:/my/test/service:system",
                                                                    //"POST:graphQLTestService",
                                                                    //"GET:/my/other/public/service"

                                                                  ],

                                                                  "exclude": [

                                                                    //"POST:/system/user/signup",
                                                                    //"POST:login"

                                                                  ]

                                                                }

                                                              }

                                                            }

                                                          ),
                                     CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   },
                                   {
                                     ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_MAP_GEOCODE_Service.Id, // "e87b5ce8-e488-4869-be72-a754314e5f75", //system.maps.geocode.service
                                     Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                     Value: JSON.stringify(

                                                            {

                                                              "service": "#google_maps#",

                                                              "#google_maps#": {

                                                                "type": "google_maps",
                                                                "host": "https://maps.googleapis.com/maps/api/geocode/json",
                                                                "port": 443,

                                                                "auth": {

                                                                  "api_key":process.env.MAP_GEOCODE_GOOGLE_API_KEY || ""

                                                                }

                                                              }

                                                            }

                                                          ),
                                     CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   },
                                   {
                                     ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_MAP_DISTANCE_Service.Id, // "0d06e235-c282-4d8a-bac5-8d7b84010939", //system.maps.distance.service
                                     Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                     Value: JSON.stringify(

                                                            {

                                                              "service": "#google_maps#",

                                                              "#google_maps#": {

                                                                "type": "google_maps",
                                                                "host": "https://maps.googleapis.com/maps/api/distancematrix/json",
                                                                "port": 443,

                                                                "auth": {

                                                                  "api_key":process.env.MAP_DISTANCE_GOOGLE_API_KEY || ""

                                                                }

                                                              }

                                                            }

                                                          ),
                                     CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   },
                                   {
                                     ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_Database_Log_Tables.Id,
                                     Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                     Value: JSON.stringify(

                                                            {

                                                              "master.sysUserGroup": [

                                                                "create",
                                                                "update",
                                                                "delete"

                                                              ]

                                                            }

                                                          ),
                                     CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   },
                                   {
                                     ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_IM_Server.Id,
                                     Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                     Value: JSON.stringify(

                                                            {

                                                              "service":"#im_server_01#",

                                                              "#im_server_01#": {

                                                                "host_rest": process.env.INSTANT_MESSAGE_SERVER_REST_URI || "",

                                                                "host_live_domain": process.env.INSTANT_MESSAGE_SERVER_SOCKET_LIVE_DOMAIN || "",

                                                                "host_live_path": process.env.INSTANT_MESSAGE_SERVER_SOCKET_LIVE_PATH || "",

                                                                "workers": process.env.INSTANT_MESSAGE_SERVER_WORKERS || 1,

                                                                "auth": {

                                                                  "api_key": process.env.INSTANT_MESSAGE_SERVER_AUTH || ""

                                                                }

                                                              },

                                                              "channel": {

                                                                "config": {

                                                                  "#Drivers#": {

                                                                    "resume": {

                                                                      "messages": 10

                                                                    }

                                                                  },

                                                                  "@__default__@": {

                                                                    "resume": {

                                                                      "messages": 0

                                                                    }

                                                                  }

                                                                }

                                                              },

                                                              "command": {

                                                                "JoinToChannels": {

                                                                  "#Business_Managers#": {

                                                                    "denied": "",
                                                                    "allowed": "#Users#,#Business_Managers#,#Administrators#,#Drivers#,#Drivers_Position#"

                                                                  },

                                                                  "#System_Administrators#": {

                                                                    "denied": "",
                                                                    "allowed": "#Users#,#System_Administrators#,#Administrators#,#Drivers#,#Drivers_Position#"

                                                                  },

                                                                  "#Drivers#": {

                                                                    "denied": "",
                                                                    "allowed": "#Users#,#Drivers#,#Drivers_Position#,#Delivery_Orders#,#Support#"

                                                                  },

                                                                  "#Dispatchers#": {

                                                                    "denied": "",
                                                                    "allowed": "#Users#,#Dispatchers#,#Drivers_Position#,#Delivery_Orders#,#Support#"

                                                                  },

                                                                  "#Final_Customers#": {

                                                                    "denied": "",
                                                                    "allowed": "#Support#"

                                                                  },

                                                                  //TODO set by role from the user
                                                                  "#Establisment#": {

                                                                    "denied": "",
                                                                    "allowed": "#Users#,#Support#"

                                                                  },

                                                                  "@__default__@": {

                                                                    "denied": "",
                                                                    "allowed": "#Support#"

                                                                  }

                                                                },

                                                                "SendMessage": {

                                                                  "@__default__@": {

                                                                    "denied": "#DriversPosition#",
                                                                    "allowed": "#@@AlreadyJoinedChannels@@#"

                                                                  }

                                                                },

                                                                "ListMembers": {

                                                                  "@__default__@": {

                                                                    "denied": "",
                                                                    "allowed": "#@@AlreadyJoinedChannels@@#"

                                                                  }

                                                                },

                                                              }

                                                            }

                                                          ),
                                     CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   },
                               ]

      const loopConfigValueEntriesAsync = async () => {

        await CommonUtilities.asyncForEach( configValueEntries as any, async ( configValueToCreate: any ) => {

          try {

            const options = {
                              where: {
                                      ConfigMetaDataId: configValueToCreate.ConfigMetaDataId,
                                      Owner: configValueToCreate.Owner
                                    },
                              transaction: currentTransaction,
                            }

            const sysConfigValueDataInDB = await SYSConfigValueData.findOne( options );

            /*
            if ( configValueToCreate.ConfigMetaDataId === "247df833-ab0b-453b-9420-e927d60d71c2" )  {

              let debugMark = debug.extend( 'BD51BB47C210' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
              debugMark( "Id => %O", configValueToCreate.ConfigMetaDataId );

            }
            */

            if ( sysConfigValueDataInDB === null ) {

              await SYSConfigValueData.create(
                                               configValueToCreate,
                                               { transaction: currentTransaction }
                                             );

            }
            else if ( !sysConfigValueDataInDB.Tag ||
                      sysConfigValueDataInDB.Tag.includes( "#Not_Update_On_Startup#" ) === false ) {

              sysConfigValueDataInDB.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
              sysConfigValueDataInDB.Value = configValueToCreate.Value;

              //await configValueDataInDB.save( { transaction: currentTransaction } );

              await sysConfigValueDataInDB.update( ( sysConfigValueDataInDB as any ).dataValues,
                                                   options );

            }

          }
          catch ( error ) {

            const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

            sourcePosition.method = this.name + "." + this.execute.name;

            const strMark = "D107DB7B7C79" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

            const debugMark = debug.extend( strMark );

            debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
            debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            debugMark( "Catched on: %O", sourcePosition );

            error.mark = strMark;
            error.logId = SystemUtilities.getUUIDv4();

            if ( logger && typeof logger.error === "function" ) {

              error.catchedOn = sourcePosition;
              logger.error( error );

            }

          }

        });

      };

      await loopConfigValueEntriesAsync();

      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }

      bSuccess = true;
      bEmptyContent = false;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.execute.name;

      const strMark = "F0170E86ADF5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

      if ( currentTransaction !== null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

    }

    return { bSuccess, bEmptyContent };

  }

}
