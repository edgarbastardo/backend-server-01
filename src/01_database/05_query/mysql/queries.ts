
const debug = require( 'debug' )( 'queries' );

class Queries {

  static getStatement( strName: string, params: any ): string {

    let strResult = "";

    if ( strName === "getConfigValueData" ) {

      return `Select A.Default, B.Value From ConfigMetaData As A Left Outer Join ConfigValueData As B On B.ConfigMetaDataId = A.Id Where ( A.Id = '${params.ConfigMetaDataId}' And ( B.Owner Is Null Or B.Owner = '${params.Owner}' ) )`;

    }
    else if ( strName === "getOldUserSessionStatus" ) {

      return `Select * From UserSessionStatus As A Where A.UserId = '${params.UserId}' And A.LoggedOutAt Is Null Order By A.UpdatedAt Asc`;

    }

    return strResult;

  }

}

export default Queries;