const debug = require( 'debug' )( 'BusinessQueries' );

export default class BusinessQueries {

  static getStatement( strName: string,
                       params: any,
                       logger: any ): string {

    let strResult = "";

    //Here the common business queries

    //Example
    /*
    if ( strName === "getConfigValueData" ) {

      return `Select A.Default, B.Value From ConfigMetaData As A Left Outer Join ConfigValueData As B On B.ConfigMetaDataId = A.Id Where ( A.Id = '${params.ConfigMetaDataId}' And ( B.Owner Is Null Or B.Owner = '${params.Owner}' ) )`;

    }
    else if ( strName === "getOldUserSessionStatus" ) {

      return `Select * From UserSessionStatus As A Where A.UserId = '${params.UserId}' And A.LoggedOutAt Is Null Order By A.UpdatedAt Asc`;

    }
    */

    return strResult;

  }

}