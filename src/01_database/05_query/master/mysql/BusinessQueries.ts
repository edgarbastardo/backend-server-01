const debug = require( 'debug' )( 'BusinessQueries' );

import SqlString from 'sqlstring';

export default class BusinessQueries {

  static getStatement( strDialect: string,
                       strName: string,
                       params: any,
                       logger: any ): string {

    let strResult = "";

    //Here the common business queries

    //Example
    /*
    if ( strDialect === "mysql" ) {

      if ( strName === "getConfigValueData" ) {

        strResult = SqlString.format( `Select A.Default, B.Value From ConfigMetaData As A Left Outer Join ConfigValueData As B On B.ConfigMetaDataId = A.Id Where ( A.Id = ? And ( B.Owner Is Null Or B.Owner = ? ) )`, [ params.ConfigMetaDataId, params.Owner ] );

      }
      else if ( strName === "getOldUserSessionStatus" ) {

        strResult = SqlString.format( `Select * From UserSessionStatus As A Where ( A.UserId = ? ) And A.LoggedOutAt Is Null Order By A.UpdatedAt Asc`, params.UserId );

      }

    }
    */

    return strResult;

  }

}