
const debug = require( 'debug' )( 'SystemQueries' );

import SqlString from 'sqlstring';

export default class SystemQueries {

  static getStatement( strDialect: string,
                       strName: string,
                       params: any,
                       logger: any ): string {

    let strResult = "";

    if ( strDialect === "mysql" ) {

      if ( strName === "getConfigValueData" ) {

        return SqlString.format( `Select A.Default, B.Value From ConfigMetaData As A Left Outer Join ConfigValueData As B On B.ConfigMetaDataId = A.Id Where ( A.Id = ? And ( B.Owner Is Null Or B.Owner = ? ) )`, [ params.ConfigMetaDataId, params.Owner ] );

      }
      else if ( strName === "getOldUserSessionStatus" ) {

        return SqlString.format( `Select * From UserSessionStatus As A Where ( A.UserId = ? ) And A.LoggedOutAt Is Null Order By A.UpdatedAt Asc`, params.UserId );

      }
      else if ( strName === "getRolesFromRouteId" ) {

        return SqlString.format( `Select Distinct C.Name As Role From Route As A Inner Join RoleHasRoute As B On B.RouteId = A.Id Inner Join Role As C On C.Id = B.RoleId Where ( A.Id = ? )`, params.Id );

      }
      else if ( strName === "getAllowTagAccessFromRouteId" ) {

        return SqlString.format( `Select A.AllowTagAccess As AllowTagAccess From Route As A Where ( A.Id = ? )`, params.Id );

      }
      else if ( strName === "getCountActionTokenOnLastMinutes" ) {

        return SqlString.format( `Select Count( A.Id ) As Count From ActionToken As A Where A.Kind = ? And A.Owner = ? And ( TIMESTAMP( A.CreatedAt ) >= DATE_SUB( NOW(), INTERVAL ? MINUTE ) )`, [ params.Kind, params.Owner, params.MinutesAgo ] );

      }

    }

    return strResult;

  }

}