
const debug = require( 'debug' )( 'SystemQueries' );

import SqlString from 'sqlstring';
import SystemUtilities from "../../../../02_system/common/SystemUtilities";
import CommonConstants from '../../../../02_system/common/CommonConstants';

export default class SystemQueries {

  static getStatement( strDialect: string,
                       strName: string,
                       params: any,
                       logger: any ): string {

    let strResult = "";

    if ( strDialect === "mysql" ) {

      if ( strName === "getConfigValueData" ) {

        strResult = SqlString.format( `Select A.Default, B.Value From sysConfigMetaData As A Left Outer Join sysConfigValueData As B On B.ConfigMetaDataId = A.Id Where ( A.Id = ? And ( B.Owner Is Null Or B.Owner = ? ) )`, [ params.ConfigMetaDataId, params.Owner ] );

      }
      else if ( strName === "getConfigDefaultValueData" ) {

        strResult = SqlString.format( `Select A.Default From sysConfigMetaData As A Where ( A.Id = ? )`, [ params.ConfigMetaDataId ] );

      }
      else if ( strName === "getOldUserSessionStatus" ) {

        strResult = SqlString.format( `Select * From sysUserSessionStatus As A Where ( A.UserId = ? ) And A.LoggedOutAt Is Null Order By A.UpdatedAt Asc`, params.UserId );

      }
      else if ( strName === "getRolesFromRouteId" ) {

        strResult = SqlString.format( `Select Distinct C.Name As Role From sysRoute As A Inner Join sysRoleHasRoute As B On B.RouteId = A.Id Inner Join sysRole As C On C.Id = B.RoleId Where ( A.Id = ? )`, params.Id );

      }
      else if ( strName === "getAllowTagAccessFromRouteId" ) {

        strResult = SqlString.format( `Select A.AllowTagAccess As AllowTagAccess From sysRoute As A Where ( A.Id = ? )`, params.Id );

      }
      else if ( strName === "getCountActionTokenOnLastMinutes" ) {

        const strNow = !params.Now ? SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_05 ) : params.Now;

        strResult = SqlString.format( `Select Count( A.Id ) As Count From sysActionToken As A Where A.Kind = ? And A.Owner = ? And ( TIMESTAMP( A.CreatedAt ) >= DATE_SUB( ?, INTERVAL ? MINUTE ) )`, [ params.Kind, params.Owner, strNow, params.MinutesAgo ] );

      }
      else if ( strName === "searchUser" ) {

        strResult = `Select ${params.SelectFields} From sysUser As A Inner Join sysUserGroup As B On A.GroupId = B.Id Left Outer Join sysPerson As C On C.Id = A.PersonId Where `;

      }
      else if ( strName === "searchCountUser" ) {

        strResult = `Select Count( A.Id ) As Count From sysUser As A Inner Join sysUserGroup As B On A.GroupId = B.Id Left Outer Join sysPerson As C On C.Id = A.PersonId Where `;

      }
      else if ( strName === "searchBinaryData" ) {

        strResult = `SELECT A.* FROM sysBinaryIndex As A Where `; //( A.Category = 'test' ) And ( A.AccessKind = 1 Or A.AccessKind = 2 Or ( A.AccessKind = 3 And ( A.Owner Like '%#UName:admin01@system.net#%' Or A.Owner Like '%#UId:xxxx#%' Or A.Owner Like '%#USId:xxx#%' Or A.Owner Like '%#GName:admin01@system.net#%' Or A.Owner Like '%#GId:xxxx#%' Or A.Owner Like '%#GSId:xxx#%' ) ) )`;

      }
      else if ( strName === "searchCountBinaryData" ) {

        strResult = `Select Count( A.Id ) As Count FROM sysBinaryIndex As A Where `;

      }
      else if ( strName === "getRoutesOfRole" ) {

        strResult = SqlString.format( `SELECT B.Name, C.Path, C.AccessKind, C.RequestKind FROM sysRoleHasRoute As A Inner Join sysRole As B On A.RoleId = B.Id Inner Join sysRoute As C On C.Id = A.RouteId Where ( B.Name = ? ) Order By C.RequestKind, C.Path;`, params.Role );

      }

    }

    return strResult;

  }

}