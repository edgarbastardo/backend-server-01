
export enum AccessKind {

  Public = 1,
  Authenticated = 2,
  Role = 3,

}

export enum HTTPMethod {

  None = 0,
  Get = 1,
  Post = 2,
  Put = 3,
  Delete = 4,

}

export default class CommonConstants {

  static readonly _DATE_TIME_LONG_FORMAT_01 = "YYYY-MM-DD HH:mm:ss.SSS ZZ";
  static readonly _DATE_TIME_LONG_FORMAT_02 = "YYYY-MM-DDTHH:mm:ss.SSS@ZZ";
  static readonly _DATE_TIME_LONG_FORMAT_03 = "YYYY-MM-DD HH:mm:ss ZZ";
  static readonly _DATE_TIME_LONG_FORMAT_04 = "YYYY-MM-DD HH:mm ZZ";
  static readonly _DATE_TIME_LONG_FORMAT_05 = "YYYY-MM-DDTHH:mm:ss";
  static readonly _DATE_TIME_LONG_FORMAT_06 = "YYYY-MM-DDTHH-mm-ss@ZZ";
  static readonly _DATE_TIME_LONG_FORMAT_07 = "YYYY-MM-DDTHH-mm-ss-SSS@ZZ";
  static readonly _DATE_TIME_LONG_FORMAT_08 = "YYYY-MM-DDTHH-mm-ssZZ";

  static readonly _PREFIX_CRYPTED = "crypted://";
  static readonly _PREFIX_RSA = "RSA://";

}
