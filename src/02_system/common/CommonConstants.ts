
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

}
