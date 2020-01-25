import SystemConstants from "../../02_system/common/SystemContants";

export default class BusinessConstants {

  // He we put all common business constants

  // static readonly _CONFIG_ENTRY_SMS_Service = {
  //                                               Id: "",
  //                                               Scope: "system",
  //                                               Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
  //                                               Category: "Notification",
  //                                               Name: "system.notification.sms.service",
  //                                               Default: `{ "service": "@__none__@", "#sms_gateway#": { "type": "sms_gateway", "server": "https://domain.com/backend-sms-gateway", "port": "443", "auth": { "api_key": "my_key" } } }`,
  //                                               Label: "Configuration for the notifications sms system",
  //                                               Description: "Configuration for the notification sms system",
  //                                               AllowTagAccessR: "#Administrator#",
  //                                               AllowTagAccessW: "#Administrator#",
  //                                               Example: '{ "service": "#sms_gateway#", "#sms_gateway#": { "type": "sms_gateway", "server": "https://domain.com/backend-sms-gateway", "port": "443", "auth": { "api_key": "my_key" } } }',
  //                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
  //                                               ExtraData: `{ "Type": "struct/json", "Schema": "" }`
  //                                             };

  static readonly _CONFIG_METADATA_ENTRIES = [
                                               //BusinessConstants._CONFIG_ENTRY_SMS_Service,
                                             ];

  //Example
  //static readonly _MY_CONSTANT = "value";

}