const debug = require( 'debug' )( 'BusinessQueries' );

//import SqlString from 'sqlstring';

export default class BusinessQueries {

  static getStatement( strDialect: string,
                       strName: string,
                       params: any,
                       logger: any ): string {

    let strResult = "";

    if ( strDialect === "mysql" ) {

      if ( strName === "getLastPositionByShortToken" ) {

        strResult = `Select B.* From sysUserSessionStatus As A Inner Join bizDriverPosition As B On B.ShortToken = A.ShortToken Where A.ShortToken = '${params.ShortToken}' Order By B.CreatedAt Desc Limit ${params.Limit};`;

      }
      else if ( strName === "getLastPositionByShortTokenB" ) {

        strResult = `Select B.Accuracy As Accuracy, B.Latitude As Latitude, B.Longitude As Longitude, B.Altitude As Altitude, B.Speed As Speed From sysUserSessionStatus As A Inner Join bizDriverPosition As B On B.ShortToken = A.ShortToken Where A.ShortToken = '${params.ShortToken}' Order By B.CreatedAt Desc Limit ${params.Limit};`;

      }
      else if ( strName === "getLastPositionByUserId" ) {

        strResult = `Select B.*, C.Name As Name From sysUserSessionStatus As A Inner Join bizDriverPosition As B On B.ShortToken = A.ShortToken Inner Join sysUser C On C.Id = B.UserId Where B.UserId = '${params.UserId}' Order By B.ShortToken, B.CreatedAt Desc Limit ${params.Limit};`;

      }
      else if ( strName === "getLastPositionBetweenByShortToken" ) {

        strResult = `Select B.* From sysUserSessionStatus As A Inner Join bizDriverPosition As B On B.ShortToken = A.ShortToken Where A.ShortToken = '${params.ShortToken}' And Cast( B.CreatedAt As DateTime ) Between CAST( '${params.StartDateTime}' As DateTime ) And Cast( '${params.EndDateTime}' As DateTime ) Order By B.CreatedAt Desc Limit ${params.Limit};`;

      }
      else if ( strName === "getLastPositionBetweenByShortTokenB" ) {

        strResult = `Select B.Accuracy As Accuracy, B.Latitude As Latitude, B.Longitude As Longitude, B.Altitude As Altitude, B.Speed As Speed From sysUserSessionStatus As A Inner Join bizDriverPosition As B On B.ShortToken = A.ShortToken Where A.ShortToken = '${params.ShortToken}' And Cast( B.CreatedAt As DateTime ) Between CAST( '${params.StartDateTime}' As DateTime ) And Cast( '${params.EndDateTime}' As DateTime ) Order By B.CreatedAt Desc Limit ${params.Limit};`;

      }
      else if ( strName === "getLastPositionBetweenByUserId" ) {

        strResult = `Select B.*, C.Name As Name From sysUserSessionStatus As A Inner Join bizDriverPosition As B On B.ShortToken = A.ShortToken Inner Join sysUser C On C.Id = B.UserId Where B.UserId = '${params.UserId}' And Cast( B.CreatedAt As DateTime ) Between CAST( '${params.StartDateTime}' As DateTime ) And Cast( '${params.EndDateTime}' As DateTime ) Order By B.ShortToken, B.CreatedAt Desc Limit ${params.Limit};`;

      }
      else if ( strName === "searchEstablishment" ) {

        strResult = `Select ${params.SelectFields} From bizEstablishment As A Inner Join bizDeliveryZone As B On B.Id = A.DeliveryZoneId Where `;

      }
      else if ( strName === "searchCountEstablishment" ) {

        strResult = `Select Count( A.Id ) As Count From bizEstablishment As A Inner Join bizDeliveryZone As B On B.Id = A.DeliveryZoneId Where `;

      }
      else if ( strName === "establishmentCountInDeliveryZone" ) {

        strResult = `Select Count( A.Id ) As Count From bizEstablishment As A Inner Join bizDeliveryZone As B On B.Id = A.DeliveryZoneId Where B.Id = '${params.Id}'`

      }
      else if ( strName === "searchDeliveryZone" ) {

        strResult = `Select ${params.SelectFields} From bizDeliveryZone As A Where `;

      }
      else if ( strName === "searchCountDeliveryZone" ) {

        strResult = `Select Count( A.Id ) As Count From bizDeliveryZone As A Where `;

      }
      else if ( strName === "disableEstablishmentInDeliveryZone" ) {

        //Update bizEstablishment As A Set A.DisabledBy = 'admin01@system.net', A.DisabledAt = '2020-08-04T14:53:50-07:00' Where A.Id = '8127d7df-ef35-4073-b0f3-3b87979d5ea4';
        strResult = `Update bizEstablishment As A Set A.DisabledBy = '${params.DisabledBy}', A.DisabledAt = '${params.DisabledAt}' Where A.DeliveryZoneId = '${params.Id}'`;

      }
      else if ( strName === "enableEstablishmentInDeliveryZone" ) {

        //Update bizEstablishment As A Set A.DisabledBy = null, A.DisabledAt = null Where A.Id = '8127d7df-ef35-4073-b0f3-3b87979d5ea4';
        strResult = `Update bizEstablishment As A Set A.DisabledBy = null, A.DisabledAt = null Where A.DeliveryZoneId = '${params.Id}'`;

      }

    }

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
