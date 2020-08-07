//import appRoot from 'app-root-path';
//require( 'dotenv' ).config( { path: appRoot.path + "/.env.secrets" } );
//import CommonUtilities from "./CommonUtilities";

export interface ICheckUserRoles {

  isAuthorizedAdmin: boolean,
  isAuthorizedL01: boolean,
  isAuthorizedL02: boolean,
  isAuthorizedL03: boolean,
  isNotAuthorized: boolean

}

export interface ICheckUserGroupRoles {

  isAuthorizedAdmin: boolean,
  isAuthorizedL01: boolean,
  isAuthorizedL03: boolean,
  isAuthorizedL04: boolean,
  isNotAuthorized: boolean

}

export default class SystemConstants {

  static readonly _GROUP_SYSTEM_ADMINISTRATORS_NAME = "System_Administrators";
  static readonly _GROUP_BUSINESS_MANAGERS_NAME = "Business_Managers";

  static readonly _USER_BACKEND_SYSTEM_NET_NAME = "backend@system.net";
  static readonly _USER_UNKNOWN_SYSTEM_NET_NAME = "unknown@system.net";

  static readonly _CREATED_BY_BACKEND_SYSTEM_NET = SystemConstants._USER_BACKEND_SYSTEM_NET_NAME;
  static readonly _UPDATED_BY_BACKEND_SYSTEM_NET = SystemConstants._USER_BACKEND_SYSTEM_NET_NAME;
  static readonly _DISABLED_BY_BACKEND_SYSTEM_NET = SystemConstants._USER_BACKEND_SYSTEM_NET_NAME;
  static readonly _CREATED_BY_UNKNOWN_SYSTEM_NET = SystemConstants._USER_UNKNOWN_SYSTEM_NET_NAME;
  static readonly _UPDATED_BY_UNKNOWN_SYSTEM_NET = SystemConstants._USER_UNKNOWN_SYSTEM_NET_NAME;
  static readonly _DISABLED_BY_UNKNOWN_SYSTEM_NET = SystemConstants._USER_UNKNOWN_SYSTEM_NET_NAME;

  static readonly _VALUE_ANY = "*";

  static readonly _LOCK_RESOURCE_START = "startLock:689d7b6b";
  static readonly _LOCK_RESOURCE_UPDATE_SESSION_STATUS = "sessionStatus:8f0468c6:";
  static readonly _LOCK_RESOURCE_UPDATE_ROLES_OF_ROUTE = "rolesOfRoute:17def5ee:";

  //Group System Administrators
  static readonly _GROUP_SYSTEM_ADMINISTRATORS = {
                                                   Id: "c4d61857-482f-40a0-bcec-93206091d37f",
                                                   Name: SystemConstants._GROUP_SYSTEM_ADMINISTRATORS_NAME,
                                                   Comment: "Default system administrators group",
                                                   Role: "#Administrator#",
                                                   CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                 };
  //Group Business Managers
  static readonly _GROUP_BUSINESS_MANAGERS = {
                                               Id : "b385be19-23f7-4931-b1e4-875c218bd732",
                                               Name: SystemConstants._GROUP_BUSINESS_MANAGERS_NAME,
                                               Comment: "Default business manager group",
                                               Role: "#Business_Manager#",
                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                             };

  static readonly _USER_GROUPS = [
                                   SystemConstants._GROUP_SYSTEM_ADMINISTRATORS,
                                   SystemConstants._GROUP_BUSINESS_MANAGERS,
                                 ];

  //Users of the group Systems.Administrators
  static readonly _USER_SYSTEM_ADMINISTRATOR_01 = {
                                                    Id: "508a78a2-7906-4cb2-93ad-a7b0a80aa9a6",
                                                    GroupId: "c4d61857-482f-40a0-bcec-93206091d37f",
                                                    Name: "admin01@system.net",
                                                    Password: "admin1.123456.",
                                                    Comment: "Default system administrator user 01",
                                                    CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                  };

  static readonly _USER_SYSTEM_ADMINISTRATOR_02 = {
                                                    Id: "3d4cbe85-b41e-495b-8517-8fb5300f5d90",
                                                    GroupId: "c4d61857-482f-40a0-bcec-93206091d37f",
                                                    Name: "admin02@system.net",
                                                    Password: "admin2.123456.",
                                                    Comment: "Default system administrator user 02",
                                                    CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                  }

  static readonly _USER_SYSTEM_ADMINISTRATOR_03 = {
                                                    Id: "dee276f8-1a70-43f0-8879-0ab3907c5782",
                                                    GroupId: "c4d61857-482f-40a0-bcec-93206091d37f",
                                                    Name: "admin03@system.net",
                                                    Password: "admin3.123456.",
                                                    Comment: "Default system administrator user 03",
                                                    CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                  };

  static readonly _USER_SYSTEM_ADMINISTRATOR_04 = {
                                                    Id: "fa78bdd3-d024-4afe-a8c0-e3cd4428ff7e",
                                                    GroupId: "c4d61857-482f-40a0-bcec-93206091d37f",
                                                    Name: "admin04@system.net",
                                                    Password: "admin4.123456.",
                                                    Comment: "Default system administrator user 04",
                                                    CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                  };

  static readonly _USER_SYSTEM_ADMINISTRATOR_05 = {
                                                    Id: "50bdf5a6-8a70-4871-a952-d8ab42ca5759",
                                                    GroupId: "c4d61857-482f-40a0-bcec-93206091d37f",
                                                    Name: "admin05@system.net",
                                                    Password: "admin5.123456.",
                                                    Comment: "Default system administrator user 05",
                                                    CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                  };

  //Users of the group Business.Managers
  static readonly _USER_BUSINESS_MANAGER_01 = {
                                                Id: "092be78e-d953-441e-83e0-aca6bf200bba",
                                                GroupId: "b385be19-23f7-4931-b1e4-875c218bd732",
                                                Name: "bmanager01@system.net",
                                                Password: "bmanager1.123456.",
                                                Comment: "Default business manager user 01",
                                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                              };

  static readonly _USER_BUSINESS_MANAGER_02 = {
                                                Id: "12b1ec2c-eb97-48f6-bcdc-9b9555df8dbb",
                                                GroupId: "b385be19-23f7-4931-b1e4-875c218bd732",
                                                Name: "bmanager02@system.net",
                                                Password: "bmanager2.123456.",
                                                Comment: "Default business manager user 02",
                                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                              };

  static readonly _USER_BUSINESS_MANAGER_03 = {
                                                Id: "cadf8963-e978-4b70-a314-362bd4d0e9c5",
                                                GroupId: "b385be19-23f7-4931-b1e4-875c218bd732",
                                                Name: "bmanager03@system.net",
                                                Password: "bmanager3.123456.",
                                                Comment: "Default business manager user 03",
                                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                              }

  static readonly _USER_BUSINESS_MANAGER_04 = {
                                                Id: "c5be3916-5fc2-4d75-82aa-f6fe55e3d863",
                                                GroupId: "b385be19-23f7-4931-b1e4-875c218bd732",
                                                Name: "bmanager04@system.net",
                                                Password: "bmanager4.123456.",
                                                Comment: "Default business manager user 04",
                                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                              }

  static readonly _USER_BUSINESS_MANAGER_05 = {
                                                Id: "32f333dd-c960-44a7-b34e-b484147a9501",
                                                GroupId: "b385be19-23f7-4931-b1e4-875c218bd732",
                                                Name: "bmanager05@system.net",
                                                Password: "bmanager5.123456.",
                                                Comment: "Default business manager user 05",
                                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                              };

  static readonly _USERS = [
                              SystemConstants._USER_SYSTEM_ADMINISTRATOR_01,
                              SystemConstants._USER_SYSTEM_ADMINISTRATOR_02,
                              SystemConstants._USER_SYSTEM_ADMINISTRATOR_03,
                              SystemConstants._USER_SYSTEM_ADMINISTRATOR_04,
                              SystemConstants._USER_SYSTEM_ADMINISTRATOR_05,
                              SystemConstants._USER_BUSINESS_MANAGER_01,
                              SystemConstants._USER_BUSINESS_MANAGER_02,
                              SystemConstants._USER_BUSINESS_MANAGER_03,
                              SystemConstants._USER_BUSINESS_MANAGER_04,
                              SystemConstants._USER_BUSINESS_MANAGER_05,
                           ];

  static readonly _CONFIG_ENTRY_ExpireTimeAuthentication_SCHEMA = JSON.stringify(

                                                                                  {

                                                                                    "$schema": "http://json-schema.org/draft-07/schema#",
                                                                                    "type": "object",
                                                                                    "additionalProperties": false,

                                                                                    "required": [

                                                                                      "@__default__@"

                                                                                    ],

                                                                                    "patternProperties": {

                                                                                      "@__default__@": {

                                                                                        "$ref": "#/definitions/validatonDef",
                                                                                        "optional": false

                                                                                      },

                                                                                      "#.*#": {

                                                                                        "$ref": "#/definitions/validationDef",
                                                                                        "optional": false

                                                                                      }

                                                                                    },

                                                                                    "definitions": {

                                                                                      "validationDef": {

                                                                                        "type": "object",
                                                                                        "required": [

                                                                                          "on",
                                                                                          "kind"

                                                                                        ],

                                                                                        "additionalProperties": false,

                                                                                        "properties": {

                                                                                          "on": {

                                                                                            "type": "number",
                                                                                            "minimum": 1,
                                                                                            "maximum": 999999999

                                                                                          },

                                                                                          "kind": {

                                                                                            "type": "number",
                                                                                            "minimum": 0,
                                                                                            "maximum": 1

                                                                                          }

                                                                                        }

                                                                                      }

                                                                                    }

                                                                                  }

                                                                                );

  static readonly _CONFIG_ENTRY_ExpireTimeAuthentication = {
                                                             Id: "9272d39a-4545-40e2-802f-5913998cbb20",
                                                             Scope: "system",
                                                             Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                             Category: "Authentication",
                                                             Name: "system.authentication.expire.time.authentication",
                                                             Default: JSON.stringify(

                                                                                      {

                                                                                        "@__default__@": {

                                                                                          "kind": 0,
                                                                                          "on": 30

                                                                                        }

                                                                                      }

                                                                                    ),
                                                             Label: "Control the SecurityTokenId expire time by groups or users",
                                                             Description: "Control the Authentication token expire time in minutes by specific groups or users",
                                                             AllowTagAccessR: "#Administrator#",
                                                             AllowTagAccessW: "#Administrator#",
                                                             Example: JSON.stringify(

                                                                                      {

                                                                                        "@__default__@": {

                                                                                          "kind": 0,
                                                                                          "on": 30

                                                                                        },

                                                                                        "#GroupName#": {

                                                                                          "kind": 1,
                                                                                          "on": 2880

                                                                                        },

                                                                                        "#GroupId#": {

                                                                                          "kind": 1,
                                                                                          "on": 28

                                                                                        }

                                                                                      }

                                                                                    ),
                                                             CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                             ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_ExpireTimeAuthentication_SCHEMA }
                                                           };

  static readonly _CONFIG_ENTRY_PasswordStrengthParameters_SCHEMA = JSON.stringify(

                                                                                    {

                                                                                      "$schema": "http://json-schema.org/draft-07/schema#",
                                                                                      "type": "object",
                                                                                      "additionalProperties": false,

                                                                                      "required": [

                                                                                        "@__default__@"

                                                                                      ],

                                                                                      "patternProperties": {

                                                                                        "@__default__@": {

                                                                                          "$ref": "#/definitions/validatonDef",
                                                                                          "optional":false

                                                                                        },

                                                                                        "#.*#": {

                                                                                          "$ref":"#/definitions/validationDef",
                                                                                          "optional":false

                                                                                        }

                                                                                      },

                                                                                      "definitions": {

                                                                                        "validationDef": {

                                                                                          "type": "object",

                                                                                          "required": [

                                                                                            "minLength",
                                                                                            "maxLength",
                                                                                            "minLowerCase",
                                                                                            "minUpperCase",
                                                                                            "maxUpperCase",
                                                                                            "minDigit",
                                                                                            "minSymbol",
                                                                                            "maxSymbol"

                                                                                          ],

                                                                                          "additionalProperties": false,

                                                                                          "properties": {

                                                                                            "minLength": {

                                                                                              "type": "number",
                                                                                              "minimum": 4,
                                                                                              "maximum": 80,
                                                                                              "optional": false

                                                                                            },

                                                                                            "maxLength": {

                                                                                              "type": "number",
                                                                                              "minimum": 4,
                                                                                              "maximum": 80,
                                                                                              "optional": false

                                                                                            },

                                                                                            "minLowerCase": {

                                                                                              "type": "number",
                                                                                              "minimum": 0,
                                                                                              "maximum": 10,
                                                                                              "optional": false

                                                                                            },

                                                                                            "maxLowerCase": {

                                                                                              "type": "number",
                                                                                              "minimum": 0,
                                                                                              "maximum": 10,
                                                                                              "optional": false

                                                                                            },

                                                                                            "minUpperCase": {

                                                                                              "type": "number",
                                                                                              "minimum": 0,
                                                                                              "maximum": 10,
                                                                                              "optional": false

                                                                                            },

                                                                                            "maxUpperCase": {

                                                                                              "type": "number",
                                                                                              "minimum": 0,
                                                                                              "maximum": 10,
                                                                                              "optional": false

                                                                                            },

                                                                                            "minDigit": {

                                                                                              "type": "number",
                                                                                              "minimum": 0,
                                                                                              "maximum": 10,
                                                                                              "optional": false

                                                                                            },

                                                                                            "maxDigit": {

                                                                                              "type": "number",
                                                                                              "minimum": 0,
                                                                                              "maximum": 10,
                                                                                              "optional": false

                                                                                            },

                                                                                            "minSymbol": {

                                                                                              "type": "number",
                                                                                              "minimum": 0,
                                                                                              "maximum": 10,
                                                                                              "optional": false

                                                                                            },

                                                                                            "maxSymbol": {

                                                                                              "type": "number",
                                                                                              "minimum": 0,
                                                                                              "maximum": 10,
                                                                                              "optional": false

                                                                                            },

                                                                                            "Symbols": {

                                                                                              "type":"string",
                                                                                              "optional":false

                                                                                            }

                                                                                          }

                                                                                        }

                                                                                      }

                                                                                    }

                                                                                  );

  static readonly _CONFIG_ENTRY_PasswordStrengthParameters = {
                                                               Id: "4a7819e9-712f-42e4-936b-3915b3d8a666",
                                                               Scope: "system",
                                                               Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                               Category: "Security",
                                                               Name: "system.security.password.strength.parameters",
                                                               Default: JSON.stringify(

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

                                                                                          "#System_Administrators#": {

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

                                                                                          "#Business_Managers#": {

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

                                                                                          }

                                                                                        }

                                                                                      ),
                                                               Label: "Default password strength parameters",
                                                               Description: "Default password strength parameters defined in json/struct",
                                                               AllowTagAccessR: "#Administrator#",
                                                               AllowTagAccessW: "#Administrator#",
                                                               Example: JSON.stringify(

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

                                                                                          "#System_Administrators#": {

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

                                                                                          "#Business_Managers#": {

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

                                                                                          "#Drivers#": {

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

                                                                                          "#Final_Customers#": {

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

                                                                                          "#Establishments#": {

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

                                                                                          }

                                                                                        }

                                                                                      ),
                                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                               ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_PasswordStrengthParameters_SCHEMA }
                                                             };

  static readonly _CONFIG_ENTRY_BinaryDataBasePath = {
                                                       Id: "5b434e22-16a4-4d5c-805a-8a1aead18b3b",
                                                       Scope: "system",
                                                       Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                       Category: "Binary Data",
                                                       Name: "system.binary.data.base.path",
                                                       Default: "binary_data/",
                                                       Label: "Default full path to binary data folder",
                                                       Description: "Default full path to resources folder. Empty for to assume the path to relative path binary_data/",
                                                       AllowTagAccessR: "#Administrator#",
                                                       AllowTagAccessW: "#Administrator#",
                                                       Example: "Any valid path in the server file system, relative or absolute. Example: binary_data/",
                                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                       ExtraData: { "Type": "string" }
                                                     };

  static readonly _CONFIG_ENTRY_BinaryDataMaximumSize = {
                                                          Id: "f318f541-8367-42e7-ac71-904cab35bac1",
                                                          Scope: "system",
                                                          Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                          Category: "Binary Data",
                                                          Name: "system.binary.data.maximum.size",
                                                          Default: "10240",
                                                          Label: "Maximum size in kilobytes for binary data file",
                                                          Description: "Maximum size in kilobytes for binary data file",
                                                          AllowTagAccessR: "#Administrator#",
                                                          AllowTagAccessW: "#Administrator#",
                                                          Example: "10240 => 10MB",
                                                          CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                          ExtraData: { "Type": "integer", "Minimal": 1, "Maximal": 153600 }
                                                        };

  static readonly _CONFIG_ENTRY_BinaryDataExpireAt = {
                                                       Id: "f318f541-8367-42e7-ac71-904cab35bac1",
                                                       Scope: "system",
                                                       Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                       Category: "Binary Data",
                                                       Name: "system.binary.data.expire.at",
                                                       Default: "720",
                                                       Label: "Expire in hours",
                                                       Description: "Expire in hours",
                                                       AllowTagAccessR: "#Administrator#",
                                                       AllowTagAccessW: "#Administrator#",
                                                       Example: "720 => 720 Hours => 30 days",
                                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                       ExtraData: { "Type": "integer", "Minimal": 1, "Maximal": 150000 }
                                                     };

  static readonly _CONFIG_ENTRY_Deny_Allow_SCHEMA = JSON.stringify(

                                                                    {

                                                                      "$schema": "http://json-schema.org/draft-07/schema#",
                                                                      "type": "object",
                                                                      "additionalProperties": false,

                                                                      "required": [

                                                                        "@__default__@"

                                                                      ],

                                                                      "patternProperties": {

                                                                        "@__default__@": {

                                                                          "$ref": "#/definitions/validatonDef",
                                                                          "optional": false

                                                                        },

                                                                        "#.*#": {

                                                                          "$ref": "#/definitions/validationDef",
                                                                          "optional": false

                                                                        }

                                                                      },

                                                                      "definitions": {

                                                                        "validationDef": {

                                                                          "type":"object",

                                                                          "required": [

                                                                            "denied",
                                                                            "allowed"

                                                                          ],

                                                                          "additionalProperties": false,

                                                                          "properties": {

                                                                            "denied": {

                                                                              "type": "string",
                                                                              "optional": false

                                                                            },

                                                                            "allowed": {

                                                                              "type": "string",
                                                                              "optional": false

                                                                            }

                                                                          }

                                                                        }

                                                                      }

                                                                    }

                                                                  );

  static readonly _CONFIG_ENTRY_BinaryDataAllowedCategory = {
                                                              Id: "c0ea3ece-277c-4490-b2c1-a06f54382520",
                                                              Scope: "system",
                                                              Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                              Category: "Binary Data",
                                                              Name: "system.binary.data.allowed.category",
                                                              Default: JSON.stringify(

                                                                                       {

                                                                                         "@__default__@": {

                                                                                           "denied": "",
                                                                                           "allowed": "*"

                                                                                         }

                                                                                       }

                                                                                     ),
                                                              Label: "Define witch categories are allowed",
                                                              Description: "Define witch categories are allowed to create or add binary data inside. Always the config entry defined in lowercase, to match with any input combination.",
                                                              AllowTagAccessR: "#Administrator#",
                                                              AllowTagAccessW: "#Administrator#",
                                                              Example: JSON.stringify(

                                                                                       {

                                                                                         "@__default__@": {

                                                                                           "denied": "*",
                                                                                           "allowed": ""

                                                                                         },

                                                                                         "#group01#": {

                                                                                           "denied": "",
                                                                                           "allowed": "#ticket#,#profile#,#avatar#"

                                                                                         },

                                                                                         "#user01#": {

                                                                                           "denied": "#ticket#",
                                                                                           "allowed": "*"

                                                                                         },

                                                                                       }

                                                                                     ),
                                                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                              ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_Deny_Allow_SCHEMA }
                                                            };

  static readonly _CONFIG_ENTRY_BinaryDataAllowedMimeType = {
                                                              Id: "e2f57878-e408-4754-ac13-d7186ed451ba",
                                                              Scope: "system",
                                                              Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                              Category: "Binary Data",
                                                              Name: "system.binary.data.allowed.mime.type",
                                                              Default: JSON.stringify(

                                                                                       {

                                                                                         "@__default__@": {

                                                                                           "denied": "",
                                                                                           "allowed": "*"

                                                                                         }

                                                                                       }

                                                                                     ),
                                                              Label: "Define witch binary data types are allowed in base in your mime types",
                                                              Description: "Define witch binary data types are allowed in base in your mime types",
                                                              AllowTagAccessR: "#Administrator#",
                                                              AllowTagAccessW: "#Administrator#",
                                                              Example: JSON.stringify(

                                                                                       {

                                                                                         "@__default__@": {

                                                                                           "denied": "*",
                                                                                           "allowed": ""

                                                                                         },

                                                                                         "#group01#": {

                                                                                           "denied": "",
                                                                                           "allowed": "#image/png#,#application/pdf#"

                                                                                         },

                                                                                         "#user01#": {

                                                                                           "denied": "#image/jpg#,#application/pdf#",
                                                                                           "allowed": "*"

                                                                                         },

                                                                                       }

                                                                                     ),
                                                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                              ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_Deny_Allow_SCHEMA }
                                                            };

  static readonly _CONFIG_ENTRY_BinaryDataDefaultOwner_SCHEMA = JSON.stringify(

                                                                                {

                                                                                  "$schema": "http://json-schema.org/draft-07/schema#",
                                                                                  "type": "object",
                                                                                  "additionalProperties": false,

                                                                                  "required": [

                                                                                    "@__default__@"

                                                                                  ],

                                                                                  "patternProperties": {

                                                                                    "@__default__@": {

                                                                                      "type": "string",
                                                                                      "optional": false

                                                                                    },

                                                                                    "#.*#": {

                                                                                      "type": "string",
                                                                                      "optional": false

                                                                                    }

                                                                                  }

                                                                                }

                                                                              );

  static readonly _CONFIG_ENTRY_BinaryDataDefaultOwner = {
                                                           Id: "c1befe9b-8a6a-4f3a-8d91-e1b418e2f71d",
                                                           Scope: "system",
                                                           Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                           Category: "Binary Data",
                                                           Name: "system.binary.data.default.owner",
                                                           Default: JSON.stringify(

                                                                                    {

                                                                                      "@__default__@": "#@@UserName@@#,#@@Category@@#"

                                                                                    }

                                                                                  ),
                                                           Label: "Add owners to the binary data",
                                                           Description: "Add owners to the binary data when uploaded sysUserGroup.Id, sysUserGroup.Name, sysUserGroup.Tag, sysUser.Id, sysUser.Name, sysUser.Tag, sysUserSessionStatus.Role",
                                                           AllowTagAccessR: "#Administrator#",
                                                           AllowTagAccessW: "#Administrator#",
                                                           Example: JSON.stringify(

                                                                                    {

                                                                                      "@__default__@": "#@@UserGroupId@@#,#@@UserGroupShortId@@#,#@@UserGroupName@@#,#@@UserId@@#,#@@UserShortId@@#,#@@UserName@@#",
                                                                                      "#user01#.ticket": "#user02#,#user03#,#Business_Manager#",
                                                                                      "#user01#.avatar": "#user10#",
                                                                                      "#Group01#": "#Group02#,#user03#"

                                                                                    }

                                                                                  ),
                                                           CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                           ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_BinaryDataDefaultOwner_SCHEMA }
                                                         };

    static readonly _CONFIG_ENTRY_BinaryDataThumbnail_SCHEMA =  JSON.stringify(

                                                                                {

                                                                                  "$schema": "http://json-schema.org/draft-07/schema#",
                                                                                  "type": "object",
                                                                                  "additionalProperties": false,

                                                                                  "required": [

                                                                                    "@__default__@"

                                                                                  ],

                                                                                  "patternProperties": {

                                                                                    "@__default__@": {

                                                                                      "$ref": "#/definitions/validatonDefNotEmpty",
                                                                                      "optional": false

                                                                                    },

                                                                                    "#.*#": {

                                                                                      "$ref": "#/definitions/validatonDefNotEmpty",
                                                                                      "optional": false

                                                                                    }

                                                                                  },

                                                                                  "definitions": {

                                                                                    "validatonDefNotEmpty": {

                                                                                      "type": "array",
                                                                                      //"additionalProperties": false,
                                                                                      //"minLength": 1,
                                                                                      "minItems": 1,

                                                                                      "items": {

                                                                                        "$ref": "#/definitions/validatonObjectDef"

                                                                                      }

                                                                                    },

                                                                                    "validatonObjectDef": {

                                                                                      "type": "object",
                                                                                      "additionalProperties": false,

                                                                                      "required": [

                                                                                        "Mime",
                                                                                        "Factor"

                                                                                      ],

                                                                                      "properties": {

                                                                                        "Mime": {

                                                                                          "type": "string",
                                                                                          //"minLength": 1,
                                                                                          "optional": false

                                                                                        },

                                                                                        "Factor": {

                                                                                          "type": "number",
                                                                                          "minimum": 50,
                                                                                          "optional": false

                                                                                        }

                                                                                      }

                                                                                    }

                                                                                  }

                                                                                }

                                                                              );

  static readonly _CONFIG_ENTRY_BinaryDataThumbnail = {
                                                        Id: "d5108be7-c79a-4b63-a7e0-022dfc26f4e5",
                                                        Scope: "system",
                                                        Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                        Category: "Binary Data",
                                                        Name: "system.binary.data.thumbnail",
                                                        Default: JSON.stringify(

                                                                                 {

                                                                                   "@__default__@": [

                                                                                      {

                                                                                        "mime": "#image/png#,#image/jpeg#",
                                                                                        "factor": 300

                                                                                      }

                                                                                   ]

                                                                                 }

                                                                               ),
                                                        Label: "Generate thumbnail for mime types",
                                                        Description: "Generate thumbnail for mime types. The factor take the more small size from the image (width or height) and resize to factor number.",
                                                        AllowTagAccessR: "#Administrator#",
                                                        AllowTagAccessW: "#Administrator#",
                                                        Example: JSON.stringify(

                                                                                 {

                                                                                   "@__default__@": [

                                                                                     {

                                                                                       "mime": "#image/png#,#image/jpeg#",
                                                                                       "factor": 300

                                                                                     }

                                                                                   ],

                                                                                   "#Group01#.ticket": [

                                                                                     {

                                                                                       "mime": "#image/png#,#image/jpeg#",
                                                                                       "factor": 500

                                                                                     }

                                                                                   ]

                                                                                 }

                                                                               ),
                                                        CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                        ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_BinaryDataThumbnail_SCHEMA }
                                                      };

  static readonly _CONFIG_ENTRY_BinaryDataProcess_SCHEMA = JSON.stringify(

                                                                           {

                                                                             "$schema": "http://json-schema.org/draft-07/schema#",
                                                                             "type": "object",
                                                                             "additionalProperties": false,

                                                                             "required": [

                                                                               "@__default__@"

                                                                             ],

                                                                             "patternProperties": {

                                                                               "@__default__@": {

                                                                                 "$ref":"#/definitions/validatonDefNotEmpty",
                                                                                 "optional":false

                                                                               },

                                                                               "#.*#": {

                                                                                 "$ref":"#/definitions/validatonDefNotEmpty",
                                                                                 "optional":false

                                                                               }

                                                                             },

                                                                             "definitions": {

                                                                               "validatonDefNotEmpty": {

                                                                                 "type":"array",
                                                                                 //"additionalProperties":false,
                                                                                 //"minLength":1,
                                                                                 "minItems":1,

                                                                                 "items": {

                                                                                   "$ref":"#/definitions/validatonObjectDef"

                                                                                 },

                                                                               },

                                                                               "validatonObjectDef": {

                                                                                 "type":"object",
                                                                                 "additionalProperties":false,

                                                                                 "required": [

                                                                                   "Mime",
                                                                                   "Factor",
                                                                                   "keepOriginal"

                                                                                 ],

                                                                                 "properties": {

                                                                                   "Mime": {

                                                                                     "type": "string",
                                                                                     //"minLength":1,
                                                                                     "optional": false

                                                                                   },

                                                                                   "Factor": {

                                                                                     "type": "number",
                                                                                     "minimum": 50,
                                                                                     "optional": false

                                                                                   },

                                                                                   "keepOriginal": {

                                                                                     "type":"boolean",
                                                                                     "optional":false

                                                                                   }

                                                                                 }

                                                                               }

                                                                             }

                                                                           }

                                                                         );

  static readonly _CONFIG_ENTRY_BinaryDataProcess = {
                                                      Id: "40a2bddd-59e1-43a3-aa83-4c9775a2c298",
                                                      Scope: "system",
                                                      Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                      Category: "Binary Data",
                                                      Name: "system.binary.data.process",
                                                      Default: JSON.stringify(

                                                                               {

                                                                                 "@__default__@": [

                                                                                   {

                                                                                     "mime": "#image/png#,#image/jpeg#",
                                                                                     "factor": 1500,
                                                                                     "size": 1024,
                                                                                     "keepOriginal": true

                                                                                   }

                                                                                 ]

                                                                               }

                                                                             ),
                                                      Label: "Generate more small images",
                                                      Description: "Generate more small images. Using the mime types and size in kilobytes. Scaled to factor using the more small size of image.",
                                                      AllowTagAccessR: "#Administrator#",
                                                      AllowTagAccessW: "#Administrator#",
                                                      Example: JSON.stringify(

                                                                               {

                                                                                 "@__default__@": [

                                                                                   {

                                                                                     "mime": "#image/png#,#image/jpeg#",
                                                                                     "factor": 1500,
                                                                                     "size": 1024,
                                                                                     "keepOriginal": true

                                                                                   }

                                                                                 ],

                                                                                 "#Group01#.ticket": [

                                                                                   {

                                                                                     "mime": "#image/png#,#image/jpeg#",
                                                                                     "factor": 1000,
                                                                                     "size": 512,
                                                                                     "keepOriginal": true

                                                                                   }

                                                                                 ]

                                                                               }

                                                                             ),
                                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                      ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_BinaryDataProcess_SCHEMA }
                                                    };

  static readonly _CONFIG_ENTRY_UserSignupProcess_SCHEMA = JSON.stringify(

                                                                           {

                                                                             "$schema": "http://json-schema.org/draft-07/schema#",
                                                                             "type": "object",
                                                                             "additionalProperties": false,

                                                                             "required": [

                                                                               "@__default__@"

                                                                             ],

                                                                             "patternProperties": {

                                                                               "@__default__@": {

                                                                                 "$ref": "#/definitions/validatonObjectDef",
                                                                                 "optional": false

                                                                               },

                                                                               "#.*#": {

                                                                                 "$ref": "#/definitions/validatonObjectDef",
                                                                                 "optional": false

                                                                               }

                                                                             },

                                                                             "definitions": {

                                                                               "validatonObjectDef": {

                                                                                 "type": "object",
                                                                                 "additionalProperties": false,

                                                                                 "required": [

                                                                                   "expireAt",
                                                                                   "group",
                                                                                   "createGroup",
                                                                                   "groupExpireAt",
                                                                                   "groupRole",
                                                                                   "status",
                                                                                   "userRole",
                                                                                   "userTag",
                                                                                   "userExpireAt",
                                                                                   "sessionsLimit",
                                                                                   "passwordParameterTag",

                                                                                 ],

                                                                                 "properties": {

                                                                                   "expireAt": {

                                                                                     "type": "number",
                                                                                     "multipleOf": 1.0,
                                                                                     "minimum": 5,
                                                                                     "optional": false

                                                                                   },

                                                                                   "group": {

                                                                                     "type": "string",
                                                                                     "minLength": 2,
                                                                                     "optional": false

                                                                                   },

                                                                                   "createGroup": {

                                                                                     "type": "boolean",
                                                                                     "optional": false

                                                                                   },

                                                                                   "groupExpireAt": {

                                                                                     "type": "number",
                                                                                     "multipleOf": 1.0,
                                                                                     "minimum": -1,
                                                                                     "optional": false

                                                                                   },

                                                                                   "groupRole": {

                                                                                     "type": "string",
                                                                                     "optional": false

                                                                                   },

                                                                                   "groupTag": {

                                                                                     "type": "string",
                                                                                     "optional": false

                                                                                   },

                                                                                   "status": {

                                                                                     "type":"number",
                                                                                     "optional":false

                                                                                   },

                                                                                   "userRole": {

                                                                                     "type": "string",
                                                                                     "optional": false

                                                                                   },

                                                                                   "userTag": {

                                                                                     "type": "string",
                                                                                     "optional": false

                                                                                   },

                                                                                   "userExpireAt": {

                                                                                     "type": "number",
                                                                                     "multipleOf": 1.0,
                                                                                     "minimum": -1,
                                                                                     "optional": false

                                                                                   },

                                                                                   "userForceChangePassword": {

                                                                                     "type": "number",
                                                                                     "multipleOf": 1.0,
                                                                                     "minimum": 0,
                                                                                     "miximum": 1,
                                                                                     "optional": false

                                                                                   },

                                                                                   "userChangePasswordEvery": {

                                                                                     "type": "number",
                                                                                     "multipleOf": 1.0,
                                                                                     "minimum": 0,
                                                                                     "miximum": 1,
                                                                                     "optional": false

                                                                                   },

                                                                                   "userSessionsLimit": {

                                                                                     "type": "number",
                                                                                     "multipleOf": 1.0,
                                                                                     "minimum": 0,
                                                                                     "optional": false

                                                                                   },

                                                                                   "passwordParameterTag": {

                                                                                     "type": "string",
                                                                                     "optional": false

                                                                                   },

                                                                                 }

                                                                               }

                                                                             }

                                                                           }

                                                                         );

  static readonly _CONFIG_ENTRY_UserSignupProcess = {
                                                      Id: "aaa72b7d-9724-441d-bc28-4ae8b3e15b1c",
                                                      Scope: "system",
                                                      Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                      Category: "Singup",
                                                      Name: "system.user.signup.process",
                                                      Default: JSON.stringify(

                                                                               {

                                                                                 "@__default__@": {

                                                                                   "expireAt": 60,
                                                                                   "group": "@__error__@",
                                                                                   "createGroup": false,
                                                                                   "groupRole": "",
                                                                                   "groupTag": "",
                                                                                   "groupExpireAt": -1,
                                                                                   "status": -1,
                                                                                   "userRole": "",
                                                                                   "userTag": "",
                                                                                   "userExpireAt": -1,
                                                                                   "userForceChangePassword": 0,
                                                                                   "userChangePasswordEvery": 0,
                                                                                   "userSessionsLimit": 0,
                                                                                   "passwordParameterTag": ""

                                                                                 }

                                                                               }

                                                                             ),
                                                      Label: "Process signup kind",
                                                      Description: "Process signup of users. The group must be exists before of singup if createGroup = false. groupRole only apply if group is created first time createGroup = true",
                                                      AllowTagAccessR: "#Administrator#",
                                                      AllowTagAccessW: "#Administrator#",
                                                      Example: JSON.stringify(

                                                                               {

                                                                                 "@__default__@": {

                                                                                   "expireAt" :60,
                                                                                   "group": "@__error__@",
                                                                                   "createGroup": false,
                                                                                   "groupRole": "",
                                                                                   "groupTag": "",
                                                                                   "groupExpireAt": -1,
                                                                                   "status": -1,
                                                                                   "userRole": "",
                                                                                   "userTag": "",
                                                                                   "userExpireAt": -1,
                                                                                   "userForceChangePassword": 0,
                                                                                   "userChangePasswordEvery": 0,
                                                                                   "userSessionsLimit": 0,
                                                                                   "passwordParameterTag": ""

                                                                                 },

                                                                                 "#Driver#": {

                                                                                   "expireAt": 60,
                                                                                   "group": "Drivers",
                                                                                   "createGroup": false,
                                                                                   "groupRole": "",
                                                                                   "groupTag": "",
                                                                                   "groupExpireAt": -1,
                                                                                   "status": 0,
                                                                                   "userRole": "#Driver#,#Upload_Binary#,#Delete_Binary#,#Update_Binary#,#Search_Binary#",
                                                                                   "userTag": "",
                                                                                   "userExpireAt": -1,
                                                                                   "userForceChangePassword": 0,
                                                                                   "userChangePasswordEvery": 0,
                                                                                   "UserSessionsLimit": 1,
                                                                                   "passwordParameterTag": ""

                                                                                 },

                                                                                 "#Final_Customer#": {

                                                                                   "expireAt": 60,
                                                                                   "group": "Final_Customers_01",
                                                                                   "createGroup": false,
                                                                                   "groupRole": "",
                                                                                   "groupTag": "",
                                                                                   "groupExpireAt": -1,
                                                                                   "status": 0,
                                                                                   "userRole": "#FinalCustomer#,#FinalCustomer01#,#Upload_Binary#,#Delete_Binary#,#Update_Binary#,#Search_Binary#",
                                                                                   "userTag": "",
                                                                                   "userExpireAt": -1,
                                                                                   "userForceChangePassword": 0,
                                                                                   "userChangePasswordEvery": 0,
                                                                                   "userSessionsLimit": 1,
                                                                                   "passwordParameterTag": ""

                                                                                 },

                                                                                 "#Establishment#": {

                                                                                   "expireAt": 60,
                                                                                   "group": "@__FromName__@",
                                                                                   "createGroup": true,
                                                                                   "groupRole": "#@__FromName__@#,#Establishment#",
                                                                                   "groupTag": "",
                                                                                   "groupExpireAt": -1,
                                                                                   "status": 0,
                                                                                   "userRole": "#Master_L01#", //No need the #Upload_Binary#,#Delete_Binary#,#Update_Binary# because #Master_L01# allow that
                                                                                   "userTag": "",
                                                                                   "userExpireAt": -1,
                                                                                   "userForceChangePassword": 0,
                                                                                   "userChangePasswordEvery": 0,
                                                                                   "userSessionsLimit": 1,
                                                                                   "passwordParameterTag": "#Establishment#"

                                                                                 }

                                                                               }

                                                                             ),
                                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                      ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_UserSignupProcess_SCHEMA }
                                                    };

  static readonly _CONFIG_ENTRY_UserAutoRoleAssign_SCHEMA = "";

  static readonly _CONFIG_ENTRY_UserAutoRoleAssign = {
                                                       Id: "483ff13b-af30-46ee-aaed-091f4ce0cd05",
                                                       Scope: "system",
                                                       Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                       Category: "User",
                                                       Name: "system.user.role.auto.assign",
                                                       Default: JSON.stringify(

                                                                                {

                                                                                  "create": {

                                                                                    "@__default__@": {

                                                                                      "@__default__@": ""

                                                                                    }

                                                                                  },

                                                                                  "update": {

                                                                                    "@__default__@": {

                                                                                      "@__default__@": ""

                                                                                    }

                                                                                  }

                                                                                }

                                                                              ),
                                                       Label: "Process auto assign of role to the user creation or update",
                                                       Description: "Process auto assign of role in the user creation or update. When the user that create or update has the role.",
                                                       AllowTagAccessR: "#Administrator#",
                                                       AllowTagAccessW: "#Administrator#",
                                                       Example: JSON.stringify(

                                                                                {

                                                                                  "create": {

                                                                                    "@__default__@": {

                                                                                      "@__default__@": ""

                                                                                    },

                                                                                    "#Master_L01#": {

                                                                                      "@__default__@": "#Upload_Binary#,#Update_Binary#,#Delete_Binary#"

                                                                                    },

                                                                                    "#Master_L02#": {

                                                                                      "@__default__@": "#Upload_Binary#,#Update_Binary#,#Delete_Binary#"

                                                                                    },

                                                                                    "#Master_L03#": {

                                                                                      "@__default__@": "#Upload_Binary#,#Update_Binary#,#Delete_Binary#"

                                                                                    },

                                                                                    "#RoleName01#": {

                                                                                      "#GroupName01#": "#RoleName02#,#RoleName03#",
                                                                                      "@__default__@": "#RoleName02#"

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
                                                       ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_UserAutoRoleAssign_SCHEMA }
                                                     };

  static readonly _CONFIG_ENTRY_UserGroupAutoRoleAssign_SCHEMA = "";

  static readonly _CONFIG_ENTRY_UserGroupAutoRoleAssign = {
                                                            Id: "bbcb8119-26f3-4c07-b04e-5d22e6458941",
                                                            Scope: "system",
                                                            Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                            Category: "User Group",
                                                            Name: "system.user.group.role.auto.assign",
                                                            Default: JSON.stringify(

                                                                                      {

                                                                                        "create": {

                                                                                          "@__default__@": {

                                                                                            "@__default__@": ""

                                                                                          }

                                                                                        },

                                                                                        "update": {

                                                                                          "@__default__@": {

                                                                                            "@__default__@": ""

                                                                                          }

                                                                                        }

                                                                                      }

                                                                                    ),
                                                            Label: "Process auto assign of role to the user group creation or update",
                                                            Description: "Process auto assign of role in the user group creation or update. When the user group that create or update has the role.",
                                                            AllowTagAccessR: "#Administrator#",
                                                            AllowTagAccessW: "#Administrator#",
                                                            Example: JSON.stringify(

                                                                                     {

                                                                                       "create": {

                                                                                         "@__default__@": {

                                                                                           "@__default__@": ""

                                                                                         },

                                                                                         "#Master_L01#": {

                                                                                           "@__default__@": "#Upload_Binary#,#Update_Binary#,#Delete_Binary#"

                                                                                         },

                                                                                         "#Master_L02#": {

                                                                                           "@__default__@": "#Upload_Binary#,#Update_Binary#,#Delete_Binary#"

                                                                                         },

                                                                                         "#Master_L03#": {

                                                                                           "@__default__@": "#Upload_Binary#,#Update_Binary#,#Delete_Binary#"

                                                                                         },

                                                                                         "#RoleName01#": {

                                                                                           "#GroupName01#": "#RoleName02#,#RoleName03#",
                                                                                           "@__default__@": "#RoleName02#"

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
                                                            ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_UserAutoRoleAssign_SCHEMA }
                                                          };

  static readonly _CONFIG_ENTRY_EMAIL_Service_SCHEMA = "";

  static readonly _CONFIG_ENTRY_EMAIL_Service = {
                                                  Id: "c0b016a3-3fda-4c5b-be78-fa8e96398196",
                                                  Scope: "system",
                                                  Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                  Category: "Notification",
                                                  Name: "system.notification.email.service",
                                                  Default: JSON.stringify(

                                                                           {

                                                                             "service": "@__none__@",

                                                                             "#gmail#": {

                                                                               "type": "smtp",
                                                                               "host": "smtp.gmail.com",
                                                                               "port": 465,
                                                                               "secure": true,

                                                                               "auth": {

                                                                                 "user": "myuser@gmail.com",
                                                                                 "pass": "secret"

                                                                               }

                                                                             }

                                                                           }

                                                                         ),
                                                  Label: "Configuration for the notifications email transport",
                                                  Description: "Configuration for the notification email transport",
                                                  AllowTagAccessR: "#Administrator#",
                                                  AllowTagAccessW: "#Administrator#",
                                                  Example: JSON.stringify(

                                                                           {

                                                                             "service": "#gmail#",

                                                                             "#gmail#": {

                                                                               "type": "smtp",
                                                                               "host": "smtp.gmail.com",
                                                                               "port": 465,
                                                                               "secure": true,

                                                                               "auth": {

                                                                                 "user": "myuser@gmail.com",
                                                                                 "pass": "secret"

                                                                               }

                                                                             },

                                                                             "#send_grid#": {

                                                                               "type": "send_grid",
                                                                               "host": "api.sendgrid.com/v3/mail/send",
                                                                               "port": 443,

                                                                               "auth": {

                                                                                 "api_key": "my_key"

                                                                               }

                                                                             }

                                                                           }

                                                                         ),
                                                  CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                  ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_EMAIL_Service_SCHEMA }
                                                };

  static readonly _CONFIG_ENTRY_SMS_Service_SCHEMA = "";

  static readonly _CONFIG_ENTRY_SMS_Service = {
                                                Id: "71199a26-8a8a-4015-989c-4a911b18c68e",
                                                Scope: "system",
                                                Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                Category: "Notification",
                                                Name: "system.notification.sms.service",
                                                Default: JSON.stringify(

                                                                         {

                                                                           "service":"@__none__@",

                                                                           "#sms_gateway#": {

                                                                             "type": "sms_gateway",
                                                                             "host": "https://domain.com/backend-sms-gateway",
                                                                             "port": 443,
                                                                             "device_id": "*",
                                                                             "context": "AMERICA/NEW_YORK",

                                                                             "auth": {

                                                                               "api_key": "my_key"

                                                                             }

                                                                           }

                                                                         }

                                                                       ),
                                                Label: "Configuration for the notifications sms transport",
                                                Description: "Configuration for the notification sms transport",
                                                AllowTagAccessR: "#Administrator#",
                                                AllowTagAccessW: "#Administrator#",
                                                Example: JSON.stringify(

                                                                         {

                                                                           "service": "#sms_gateway#",

                                                                           "#sms_gateway#": {

                                                                             "type": "sms_gateway",
                                                                             "host": "https://domain.com/backend-sms-gateway",
                                                                             "port": 443,
                                                                             "device_id": "*",
                                                                             "context": "AMERICA/NEW_YORK",

                                                                             "auth": {

                                                                               "api_key": "my_key"

                                                                             }

                                                                           }

                                                                         }

                                                                       ),
                                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_EMAIL_Service_SCHEMA }
                                              };

  static readonly _CONFIG_ENTRY_PUSH_Service_SCHEMA = "";

  static readonly _CONFIG_ENTRY_PUSH_Service = {
                                                 Id: "56e70807-9f65-4679-b9e6-9327df438e1e",
                                                 Scope: "system",
                                                 Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                 Category: "Notification",
                                                 Name: "system.notification.push.service",
                                                 Default: JSON.stringify(

                                                                          {

                                                                            "service": "@__none__@",

                                                                            "#one_signal#": {

                                                                              "type": "one_signal",
                                                                              "host": "https://onesignal.com/api/v1/notifications",
                                                                              "port": 443,

                                                                              "auth": {

                                                                                "app_id": "my_app_id",
                                                                                "api_key": "my_key"

                                                                              }

                                                                            }

                                                                          }

                                                                        ),
                                                 Label: "Configuration for the notifications push transport",
                                                 Description: "Configuration for the notification push transport",
                                                 AllowTagAccessR: "#Administrator#",
                                                 AllowTagAccessW: "#Administrator#",
                                                 Example: JSON.stringify(

                                                                          {

                                                                            "service": "#one_signal#",

                                                                            "#one_signal#": {

                                                                              "type": "one_signal",
                                                                              "host": "https://onesignal.com/api/v1/notifications",
                                                                              "port": 443,

                                                                              "auth": {

                                                                                "app_id": "my_app_id",
                                                                                "api_key": "my_key"

                                                                              }

                                                                            }

                                                                          }

                                                                        ),
                                                 CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                 ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_PUSH_Service_SCHEMA }
                                               };

  static readonly _CONFIG_ENTRY_DISCORD_Service_SCHEMA = "";

  static readonly _CONFIG_ENTRY_DISCORD_Service = {
                                                    Id: "a11fe6f0-dcc5-44cd-8c26-8f1a1ed5f963",
                                                    Scope: "system",
                                                    Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                    Category: "Notification",
                                                    Name: "system.notification.discord.service",
                                                    Default: JSON.stringify(

                                                                             {

                                                                               "service": "@__none__@",

                                                                               "#discord#": {

                                                                                 "type": "discord",

                                                                                 "target": {

                                                                                  "web_hooks": {
                                                                                                 "@__default__@": "",
                                                                                                 "#warning": "",
                                                                                                 "#error": "",
                                                                                               }

                                                                                 }

                                                                               }

                                                                             }

                                                                           ),
                                                    Label: "Configuration for the notifications discord transport",
                                                    Description: "Configuration for the notification discord transport",
                                                    AllowTagAccessR: "#Administrator#",
                                                    AllowTagAccessW: "#Administrator#",
                                                    Example: JSON.stringify(

                                                                             {

                                                                               "service": "#discord#",

                                                                               "#discord#": {

                                                                                 "type": "discord",

                                                                                 "target": {

                                                                                  "web_hooks": {

                                                                                                 "@__default__@": "https://discordapps.com/api/webhooks/???????????/???????????/????????????????????????",
                                                                                                 "#warning": "https://discordapps.com/api/webhooks/???????????/???????????/????????????????????????",
                                                                                                 "#error": "https://discordapps.com/api/webhooks/???????????/???????????/????????????????????????",

                                                                                               }

                                                                                 }

                                                                               }

                                                                             }

                                                                           ),
                                                    CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                    ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_DISCORD_Service_SCHEMA }
                                                  };

  static readonly _CONFIG_ENTRY_SLACK_Service_SCHEMA = "";

  static readonly _CONFIG_ENTRY_SLACK_Service = {
                                                  Id: "85f09ecb-356c-4f1f-b355-a4f004007b48",
                                                  Scope: "system",
                                                  Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                  Category: "Notification",
                                                  Name: "system.notification.slack.service",
                                                  Default: JSON.stringify(

                                                                           {

                                                                             "service": "@__none__@",

                                                                             "#slack#": {

                                                                               "type": "slack",

                                                                               "target": {

                                                                                 "web_hooks": {

                                                                                                "@__default__@": "",
                                                                                                "#warning": "",
                                                                                                "#error": "",

                                                                                              }

                                                                               }

                                                                             }

                                                                           }

                                                                         ),
                                                  Label: "Configuration for the notifications slack transport",
                                                  Description: "Configuration for the notification slack transport",
                                                  AllowTagAccessR: "#Administrator#",
                                                  AllowTagAccessW: "#Administrator#",
                                                  Example: JSON.stringify(

                                                                           {

                                                                             "service": "#slack#",

                                                                             "#slack#": {

                                                                               "type":"slack",

                                                                               "target": {

                                                                                 "web_hooks": {

                                                                                                "@__default__@": "https://hooks.slack.com/services/???????????/???????????/????????????????????????",
                                                                                                "#warning": "https://hooks.slack.com/services/???????????/???????????/????????????????????????",
                                                                                                "#error": "https://hooks.slack.com/services/???????????/???????????/????????????????????????",

                                                                                              }

                                                                               }

                                                                             }

                                                                           }

                                                                         ),
                                                  CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                  ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_SLACK_Service_SCHEMA }
                                                };

  static readonly _CONFIG_ENTRY_MAP_GEOCODE_Service_SCHEMA = "";

  static readonly _CONFIG_ENTRY_MAP_GEOCODE_Service = {
                                                        Id: "e87b5ce8-e488-4869-be72-a754314e5f75",
                                                        Scope: "system",
                                                        Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                        Category: "Maps",
                                                        Name: "system.maps.geocode.service",
                                                        Default: JSON.stringify(

                                                                                 {

                                                                                   "service": "@__none__@",

                                                                                   "#google_maps#": {

                                                                                     "type": "google_maps",
                                                                                     "host": "https://maps.googleapis.com/maps/api/geocode/json",
                                                                                     "port": 443,

                                                                                     "auth": {

                                                                                       "api_key": "my_key"

                                                                                     }

                                                                                   }

                                                                                 }

                                                                               ),
                                                        Label: "Configuration for the geocode map service",
                                                        Description: "Configuration for the geocode map service",
                                                        AllowTagAccessR: "#Administrator#",
                                                        AllowTagAccessW: "#Administrator#",
                                                        Example: JSON.stringify(

                                                                                 {

                                                                                   "service": "#google_maps#",

                                                                                   "#google_maps#": {

                                                                                     "type": "google_maps",
                                                                                     "host": "https://maps.googleapis.com/maps/api/geocode/json",
                                                                                     "port": 443,

                                                                                     "auth": {

                                                                                       "api_key": "my_key"

                                                                                     }

                                                                                   }

                                                                                 }

                                                                               ),
                                                        CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                        ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_MAP_GEOCODE_Service_SCHEMA }
                                                      };

  static readonly _CONFIG_ENTRY_MAP_DISTANCE_Service_SCHEMA = "";

  static readonly _CONFIG_ENTRY_MAP_DISTANCE_Service = {
                                                         Id: "0d06e235-c282-4d8a-bac5-8d7b84010939",
                                                         Scope: "system",
                                                         Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                         Category: "Maps",
                                                         Name: "system.map.distance.service",
                                                         Default: JSON.stringify(

                                                                                  {

                                                                                    "service": "@__none__@",

                                                                                    "#google_maps#": {

                                                                                      "type": "google_maps",
                                                                                      "host": "https://maps.googleapis.com/maps/api/distancematrix/json",
                                                                                      "port": 443,

                                                                                      "auth": {

                                                                                        "api_key": "my_key"

                                                                                      }

                                                                                    }

                                                                                  }

                                                                                ),
                                                         Label: "Configuration for the geocode map service",
                                                         Description: "Configuration for the geocode map service",
                                                         AllowTagAccessR: "#Administrator#",
                                                         AllowTagAccessW: "#Administrator#",
                                                         Example: JSON.stringify(

                                                                                  {

                                                                                    "service": "#google_maps#",

                                                                                    "#google_maps#": {

                                                                                      "type": "google_maps",
                                                                                      "host": "https://maps.googleapis.com/maps/api/distancematrix/json",
                                                                                      "port": 443,

                                                                                      "auth": {

                                                                                        "api_key": "my_key"

                                                                                      }

                                                                                    }

                                                                                  }

                                                                                ),
                                                         CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                         ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_MAP_GEOCODE_Service_SCHEMA }
                                                       };

  static readonly _CONFIG_ENTRY_Frontend_Rules_SCHEMA = JSON.stringify(

                                                                        {

                                                                          "$schema": "http://json-schema.org/draft-07/schema#",
                                                                          "type": "object",
                                                                          "additionalProperties": false,

                                                                          "required": [

                                                                            "@__default__@"

                                                                          ],

                                                                          "patternProperties": {

                                                                            "@__default__@": {

                                                                              "$ref": "#/definitions/validatonObjectDef"

                                                                            },

                                                                            "#.*#": {

                                                                              "$ref": "#/definitions/validatonObjectDef"

                                                                            }

                                                                          },

                                                                          "definitions": {

                                                                            "validatonObjectDef": {

                                                                              "type": "object",
                                                                              "additionalProperties": false,

                                                                              "required": [

                                                                                "user_login_control",
                                                                                "user_signup_control",
                                                                                "tag",
                                                                                "url",
                                                                                "route"

                                                                              ],

                                                                              "properties": {

                                                                                "user_login_control": {

                                                                                  "$ref": "#/definitions/validatonObjectDefDeniedAllowed",
                                                                                  "optional": false

                                                                                },

                                                                                "user_signup_control": {

                                                                                  "$ref": "#/definitions/validatonObjectDefDeniedAllowed",
                                                                                  "optional": false

                                                                                },

                                                                                "user_recover_password_control": {

                                                                                  "$ref": "#/definitions/validatonObjectDefDeniedAllowed",
                                                                                  "optional": false

                                                                                },

                                                                                "tag": {

                                                                                  "type": "string",
                                                                                  "optional": false

                                                                                },

                                                                                "url": {

                                                                                  "type": "string",
                                                                                  "optional": false

                                                                                },

                                                                                "route": {

                                                                                  "$ref": "#/definitions/validatonObjectDefExcludeInclude",
                                                                                  "optional": false

                                                                                }

                                                                              }

                                                                            },

                                                                            "validatonObjectDefDeniedAllowed": {

                                                                              "type": "object",
                                                                              "additionalProperties": false,

                                                                              "required": [

                                                                                "denied",
                                                                                "allowed"

                                                                              ],

                                                                              "properties": {

                                                                                "denied": {

                                                                                  "type": "string",
                                                                                  "optional": false

                                                                                },

                                                                                "allowed": {

                                                                                  "type": "string",
                                                                                  "optional": false

                                                                                }

                                                                              }

                                                                            },

                                                                            "validatonObjectDefExcludeInclude": {

                                                                              "type": "object",
                                                                              "additionalProperties": false,

                                                                              "required": [

                                                                                "exclude",
                                                                                "include"

                                                                              ],

                                                                              "properties": {

                                                                                "exclude": {

                                                                                  "type": "array",
                                                                                  "optional": false,

                                                                                  "items": {

                                                                                    "type": "string"

                                                                                  }

                                                                                },

                                                                                "include": {

                                                                                  "type": "array",
                                                                                  "optional": false,

                                                                                  "items": {

                                                                                    "type": "string"

                                                                                  }

                                                                                }

                                                                              }

                                                                            }

                                                                          }

                                                                        }

                                                                      );

    static readonly _CONFIG_ENTRY_Frontend_Rules_EXAMPLE = JSON.stringify(

                                                                           {

                                                                             "#mobile-ionic5-sales-???#": {

                                                                               "user_login_control": {

                                                                                 "denied": "",
                                                                                 "allowed": "#Final_Customers#,#Administrator#"

                                                                               },

                                                                               "user_signup_control": {

                                                                                 "denied": "",
                                                                                 "allowed": "#finalCustomer#"

                                                                               },

                                                                               "tag": "#mobile#,#phone#,#phone_android#,#phone_ios#,#tablet#,#tablet_android#,#tablet_ios#",
                                                                               "url": "http://mycompany.com/myapp/url/",

                                                                               "route": {

                                                                                "exclude": [

                                                                                  "GET:/my/service",
                                                                                  "POST:/my/service2"

                                                                                ],

                                                                                "include": [

                                                                                  //

                                                                                ]

                                                                               }

                                                                             },

                                                                             "#web-reactjs-establisment-???#": {

                                                                               "user_login_Control": {

                                                                                 "denied": "",
                                                                                 "allowed": "#Establishment#,#Administrator#"

                                                                               },

                                                                               "user_signup_control": {

                                                                                 "denied": "",
                                                                                 "allowed": "#establishment#"

                                                                               },

                                                                               "tag": "#web#,#web_desktop#",
                                                                               "url": "http://mycompany.com/myapp/url/",

                                                                               "route": {

                                                                                 "exclude": [

                                                                                   "GET:/my/service",
                                                                                   "POST:/my/service2"

                                                                                 ],

                                                                                 "include": [

                                                                                   "Public:PUBLIC:GET:/my/other/service",
                                                                                   "Authenticated:AUTHENTICATED:POST:/my/other/duper/service"

                                                                                 ]

                                                                               }

                                                                             },

                                                                             "#web-reactjs-delivery-???#": {

                                                                               "user_login_control": {

                                                                                 "denied": "",
                                                                                 "allowed": "#Dispatchers#,#Administrator#"

                                                                               },

                                                                               "user_signup_control": {

                                                                                 "denied": "*",
                                                                                 "allowed": ""

                                                                               },

                                                                               "tag": "#web#,#web_desktop#",
                                                                               "url": "http://mycompany.com/myapp/url/",

                                                                               "route": {

                                                                                 "exclude": [

                                                                                   "GET:/my/service",
                                                                                   "POST:/my/service2"

                                                                                 ],

                                                                                 "include": [

                                                                                   "MyRole:ROLE:POST:/my/other/super/service"

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

                                                                                 "exclude": [

                                                                                   "*"

                                                                                 ],

                                                                                 "include": [

                                                                                   //

                                                                                 ]

                                                                               }

                                                                             }

                                                                           }

                                                                         );

  static readonly _CONFIG_ENTRY_Frontend_Rules = {
                                                   Id: "70835d21-afdd-4f5b-9a56-61762ba55013",
                                                   Scope: "system",
                                                   Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                   Category: "Frontend Rules",
                                                   Name: "system.frontend.rules",
                                                   Default: JSON.stringify(
                                                                            {

                                                                              "@__default__@": {

                                                                                "user_login_control": {

                                                                                  "denied": "",
                                                                                  "allowed": "*"

                                                                                },

                                                                                "user_signup_control": {

                                                                                  "denied": "",
                                                                                  "allowed": "*"

                                                                                },

                                                                                "user_recover_password_control": {

                                                                                  "denied": "",
                                                                                  "allowed": "*"

                                                                                },

                                                                                "tag": "#web#,#mobile#,#phone#,#tablet#",
                                                                                "url": "http://mycompany.com/myapp/url/",

                                                                                "route": {

                                                                                  "exclude": [

                                                                                    //

                                                                                  ],

                                                                                  "include": [

                                                                                    "*"

                                                                                  ]

                                                                                }

                                                                              }

                                                                            }

                                                                          ),
                                                   Label: "Configuration for different frontend clients id rules",
                                                   Description: "Configuration for different frontend clients id rules",
                                                   AllowTagAccessR: "#Administrator#",
                                                   AllowTagAccessW: "#Administrator#",
                                                   Example: SystemConstants._CONFIG_ENTRY_Frontend_Rules_EXAMPLE,
                                                   CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                   ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_Frontend_Rules_SCHEMA }
                                                 };

  static readonly _CONFIG_ENTRY_General_Default_Information_SCHEMA = "";

  static readonly _CONFIG_ENTRY_General_Default_Information = {
                                                                Id: "e3383f42-9f78-40c5-8415-42b51da54196",
                                                                Scope: "system",
                                                                Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                                Category: "General",
                                                                Name: "system.general.default.information",
                                                                Default: JSON.stringify(

                                                                                         {

                                                                                           "sys_admin_email": "admin@mycompany.com",
                                                                                           "sys_admin_phone": "+1-336-776-9897",
                                                                                           "feed_back_email": "feedback@mycompany.com",
                                                                                           "no_response_email": "no-response@mycompany.com",
                                                                                           "company_name": "MY COMPANY LLC",
                                                                                           "company_address": "1234N Murdock St, Coral Gables, FL98284, Florida, USA, Office 102",
                                                                                           "company_zip_code": "FL98284",
                                                                                           "company_phone": "1-989-345-6789, 1-456-345-6789",
                                                                                           "company_web": "https://www.mycompanyweb.com, https://www.othercompanyweb.com",
                                                                                           "company_email": "admin@mycompany.com, other@mydomain.com"

                                                                                         }

                                                                                       ),
                                                                Label: "Configuration for default values",
                                                                Description: "Configuration for default values",
                                                                AllowTagAccessR: "#Administrator#",
                                                                AllowTagAccessW: "#Administrator#",
                                                                Example: JSON.stringify(

                                                                                         {

                                                                                           "sys_admin_email": "admin@mycompany.com, otheradmin@domain.com",
                                                                                           "sys_admin_phone": "1-336-776-9897, 1-360-767-9192",
                                                                                           "feed_back_email": "feedback@mycompany.com",
                                                                                           "no_response_email": "no-response@mycompany.com",
                                                                                           "company_name": "MY COMPANY LLC",
                                                                                           "company_address": "1234N Murdock St, Coral Gables, FL98284, Florida, USA, Office 102",
                                                                                           "company_zip_code": "FL98284",
                                                                                           "company_phone": "1-989-345-6789, 1-456-345-6789",
                                                                                           "company_web": "https://www.mycompanyweb.com, https://www.othercompanyweb.com",
                                                                                           "company_email": "admin@mycompany.com, other@mydomain.com"

                                                                                         }

                                                                                       ),
                                                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                                ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_General_Default_Information_SCHEMA }
                                                              };

  static readonly _CONFIG_ENTRY_User_Settings_SCHEMA = "";

  static readonly _CONFIG_ENTRY_User_Settings = {
                                                  Id: "09749c7d-5514-4635-8c19-c272747cf193",
                                                  Scope: "user",
                                                  Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                  Category: "User",
                                                  Name: "system.user.settings",
                                                  Default: JSON.stringify(

                                                                           {

                                                                             "entry":"value"

                                                                           }

                                                                         ),
                                                  Label: "Configuration for user settings values",
                                                  Description: "Configuration for user settings values",
                                                  AllowTagAccessR: "#Administrator#",
                                                  AllowTagAccessW: "#Administrator#",
                                                  Example: JSON.stringify(

                                                                           {

                                                                             "entry":"value"

                                                                           }

                                                                         ),
                                                  CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                  ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_User_Settings_SCHEMA }
                                                };

  static readonly _CONFIG_ENTRY_UserGroup_Settings_SCHEMA = "";

  static readonly _CONFIG_ENTRY_UserGroup_Settings = {
                                                       Id: "92417fa1-c477-4df0-868c-e970619c47f9",
                                                       Scope: "user_group",
                                                       Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                       Category: "User Group",
                                                       Name: "system.user.group.settings",
                                                       Default: JSON.stringify(

                                                                                {

                                                                                  "entry":"value"

                                                                                }

                                                                              ),
                                                       Label: "Configuration for user group settings values",
                                                       Description: "Configuration for user group settings values",
                                                       AllowTagAccessR: "#Administrator#",
                                                       AllowTagAccessW: "#Administrator#",
                                                       Example: JSON.stringify(

                                                                                {

                                                                                  "entry":"value"

                                                                                }

                                                                              ),
                                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                       ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_UserGroup_Settings_SCHEMA }
                                                     };

  static readonly _CONFIG_ENTRY_Database_Log_Tables_SCHEMA = "";

  static readonly _CONFIG_ENTRY_Database_Log_Tables = {
                                                        Id: "247df833-ab0b-453b-9420-e927d60d71c2",
                                                        Scope: "database",
                                                        Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                        Category: "Database",
                                                        Name: "database.log.tables",
                                                        Default: JSON.stringify(

                                                                                 {

                                                                                   "master.sysTableNoExists": [

                                                                                     "create",
                                                                                     "update",
                                                                                     "delete"

                                                                                   ]

                                                                                 }

                                                                               ),
                                                        Label: "Configuration for database log tables",
                                                        Description: "Configuration for database log tables",
                                                        AllowTagAccessR: "#Administrator#",
                                                        AllowTagAccessW: "#Administrator#",
                                                        Example: JSON.stringify(

                                                                                 {

                                                                                   "master.sysUser": [

                                                                                     "create",
                                                                                     "update",
                                                                                     "delete"

                                                                                   ],

                                                                                   "master.sysUserGroup": [

                                                                                    "create",
                                                                                    "delete"

                                                                                   ],

                                                                                   "master.bizOtherTable": [

                                                                                     "delete"

                                                                                   ],

                                                                                 }

                                                                               ),
                                                        CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                        ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_Database_Log_Tables_SCHEMA }
                                                      };

  static readonly _CONFIG_ENTRY_IM_Server_SCHEMA = "";

  static readonly _CONFIG_ENTRY_IM_Server = {
                                              Id: "98bf2878-f94d-4119-b64d-a96eeee0d8bf",
                                              Scope: "system",
                                              Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                              Category: "Instant Message",
                                              Name: "system.instant.message.server",
                                              Default: JSON.stringify(

                                                                       {

                                                                         "service": "#im_server_01#",

                                                                         "#im_server_01#": {

                                                                           "host_rest": "http://localhost:5050/instant/message/server/domain/api/v1",

                                                                           "host_live_domain": "http://localhost:5050",

                                                                           "host_live_path": "/instant/message/server/domain/socket/v1/live",

                                                                           "workers": "9191,9192,9193",

                                                                           "auth": {

                                                                             "api_key": "my_key"

                                                                           }

                                                                         },

                                                                         "channels": {

                                                                           "config": {

                                                                             "@__default__@": {

                                                                              "resume": {

                                                                                "messages": 0

                                                                              }

                                                                             }

                                                                           }

                                                                         },

                                                                         "commands": {

                                                                           "JoinToChannels": {

                                                                             "@__default__@": {

                                                                               "denied": "",
                                                                               "allowed": "*"

                                                                             }

                                                                           },

                                                                           "SendMessage": {

                                                                             "@__default__@": {

                                                                               "denied": "",
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
                                              Label: "Configuration for instant message server settings",
                                              Description: "Configuration for instant message settings",
                                              AllowTagAccessR: "#Administrator#",
                                              AllowTagAccessW: "#Administrator#",
                                              Example: JSON.stringify(

                                                                       {

                                                                         "service": "#im_server_01#",

                                                                         "#im_server_01#": {

                                                                           "host_rest": "http://localhost:5050/instant/message/server/domain/api/v1",

                                                                           "host_live_domain": "http://localhost:5050",

                                                                           "host_live_path": "/instant/message/server/domain/socket/v1/live",

                                                                           "workers": "9191,9192,9193",

                                                                           "auth": {

                                                                             "api_key": "178fa7c2-bcdc-4051-9773-26b86f49307d"

                                                                           }

                                                                         },

                                                                         "channel": {

                                                                           "config": {

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
                                                                               "allowed": "#Business_Managers#,#Administrators#"

                                                                             },

                                                                             "#System_Administrators#": {

                                                                               "denied": "",
                                                                               "allowed": "#System_Administrators#,#Administrators#"

                                                                             },

                                                                             "#userexample01#": {

                                                                               "denied": "",
                                                                               "allowed": "#@@UserGroupId@@#,#@@UserGroupName@@#,#@@UserId@@#,#@@UserName@@#"

                                                                             },

                                                                             "#userexample02#": {

                                                                               "denied": "*",
                                                                               "allowed": ""

                                                                             },

                                                                             "#userexample03#": {

                                                                               "denied": "#My_Denied_Channel01#,#My_Denied_Channel02#",
                                                                               "allowed": "*"

                                                                             },

                                                                             "#admin01@system.net#": {

                                                                               "denied": "",
                                                                               "allowed": "*"

                                                                             },

                                                                             "@__default__@": {

                                                                               "denied": "",
                                                                               "allowed": "#@@UserName@@#"

                                                                             }

                                                                           },

                                                                           "SendMessage": {

                                                                             "@__default__@": {

                                                                               "denied": "",
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
                                              ExtraData: { "Type": "struct/json", "Schema": SystemConstants._CONFIG_ENTRY_Database_Log_Tables_SCHEMA }
                                            };

  static readonly _CONFIG_METADATA_ENTRIES = [
                                               SystemConstants._CONFIG_ENTRY_ExpireTimeAuthentication,
                                               SystemConstants._CONFIG_ENTRY_PasswordStrengthParameters,
                                               SystemConstants._CONFIG_ENTRY_BinaryDataBasePath,
                                               SystemConstants._CONFIG_ENTRY_BinaryDataMaximumSize,
                                               SystemConstants._CONFIG_ENTRY_BinaryDataAllowedCategory,
                                               SystemConstants._CONFIG_ENTRY_BinaryDataAllowedMimeType,
                                               SystemConstants._CONFIG_ENTRY_BinaryDataDefaultOwner,
                                               SystemConstants._CONFIG_ENTRY_BinaryDataThumbnail,
                                               SystemConstants._CONFIG_ENTRY_BinaryDataProcess,
                                               SystemConstants._CONFIG_ENTRY_UserSignupProcess,
                                               SystemConstants._CONFIG_ENTRY_UserAutoRoleAssign,
                                               SystemConstants._CONFIG_ENTRY_EMAIL_Service,
                                               SystemConstants._CONFIG_ENTRY_SMS_Service,
                                               SystemConstants._CONFIG_ENTRY_PUSH_Service,
                                               SystemConstants._CONFIG_ENTRY_DISCORD_Service,
                                               SystemConstants._CONFIG_ENTRY_SLACK_Service,
                                               SystemConstants._CONFIG_ENTRY_Frontend_Rules,
                                               SystemConstants._CONFIG_ENTRY_General_Default_Information,
                                               SystemConstants._CONFIG_ENTRY_MAP_GEOCODE_Service,
                                               SystemConstants._CONFIG_ENTRY_MAP_DISTANCE_Service,
                                               SystemConstants._CONFIG_ENTRY_User_Settings,
                                               SystemConstants._CONFIG_ENTRY_UserGroup_Settings,
                                               SystemConstants._CONFIG_ENTRY_Database_Log_Tables,
                                               SystemConstants._CONFIG_ENTRY_IM_Server
                                             ];

}
