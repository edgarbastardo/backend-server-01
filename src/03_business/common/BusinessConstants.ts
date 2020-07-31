//import SystemConstants from "../../02_system/common/SystemContants";

import SystemConstants from "../../02_system/common/SystemContants";
import stringify from "fast-safe-stringify";

export default class BusinessConstants {

  // He we put all common business constants

  static readonly _CONFIG_ENTRY_SMS_Service = {
                                                Id: "",
                                                Scope: "system",
                                                Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                                Category: "Odin-v2",
                                                Name: "system.odin-v2.service",
                                                Default: JSON.stringify(

                                                                         {

                                                                           "service": "#odin_v2_server_01#",

                                                                           "#odin_v2_server_01#": {

                                                                             "host": "http://localhost:5050/dev01/odin-v2/company/state/city/api",

                                                                             "hook": {

                                                                               "driver_assigned": "http://localhost:5050/dev01/odin-v1/company/state/city/api",

                                                                             },

                                                                             "auth":{

                                                                               "api_key": "p:my_key"

                                                                             }

                                                                           },

                                                                         }

                                                                       ),
                                                Label: "Configuration for the foreign odin-v2 system",
                                                Description: "Configuration for the foreign odin-v2 system",
                                                AllowTagAccessR: "#Administrator#",
                                                AllowTagAccessW: "#Administrator#",
                                                Example: JSON.stringify(

                                                                         {

                                                                           "service": "#odin-v2_server_01#",

                                                                           "#odin-v2_server_01#": {

                                                                             "host": "http://localhost:5050/dev01/odin-v2/company/state/city/api",

                                                                             "auth":{

                                                                               "api_key": "p:my_key"

                                                                             }

                                                                           },

                                                                         }

                                                                       ),
                                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                ExtraData: `{ "Type": "struct/json", "Schema": "" }`
                                              };

  static readonly _CONFIG_METADATA_ENTRIES = [
                                               //BusinessConstants._CONFIG_ENTRY_SMS_Service,
                                             ];

  //Example
  //static readonly _MY_CONSTANT = "value";

}
