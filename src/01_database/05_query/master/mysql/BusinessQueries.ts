import SystemUtilities from "../../../../02_system/common/SystemUtilities";
import CommonConstants from "../../../../02_system/common/CommonConstants";

const debug = require( 'debug' )( 'BusinessQueries' );

//import SqlString from 'sqlstring';
import CommonUtilities from "../../../../02_system/common/CommonUtilities";

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
      else if ( strName === "getLastPositionBetween" ) {

        strResult = `Select
                            B.*
                     From
                            sysUserSessionStatus As A
                            Inner Join bizDriverPosition As B On B.ShortToken = A.ShortToken
                            Inner Join bizDriverStatus As C On C.ShortToken = A.ShortToken
                     Where
                            A.LoggedOutBy Is Null -- Session not finished
                            And
                            A.LoggedOutAt Is Null -- Session not finished
                            -- And
                            -- Cast( A.UpdatedAt As DateTime )
                            --  Between
                            --  Cast( '${params.StartDateTime}' As DateTime )
                            --  And
                            --  Cast( '${params.EndDateTime}' As DateTime )
                            And
                            Cast( B.CreatedAt As DateTime )
                              Between
                              Cast( '${params.StartDateTime}' As DateTime )
                              And
                              Cast( '${params.EndDateTime}' As DateTime )
                            And
                            C.Code <> 0 -- Working and Working (Finishing)
                            Order By
                                A.ShortToken,
                                A.UserId,
                                B.CreatedAt Desc
                            Limit ${params.Limit};`;

        if ( process.env.ENV == "dev" ||
             process.env.ENV == "test" ) {

          strResult = CommonUtilities.normalizeSQLWithMultiline( strResult );

        }

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
      else if ( strName === "getCurrentDeliveryZoneOfDriverAtDate" ) {

        const strAtDate = !params.AtDate ? SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_10 ): params.AtDate;

        strResult = `Select A.* From bizDriverInDeliveryZone As A Where Date( A.StartAt ) = '${strAtDate}' And A.UserId = '${params.UserId}' Order By A.StartAt Desc Limit 1`;

      }
      else if ( strName === "getDispatcherDriverStatusAtDate" ) {

        const strGroupId = !params.GroupId ? "d7648ed4-1914-4fe4-9902-072a21db1f00": params.GroupId;
        const strAtDate = !params.AtDate ? SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_10 ): params.AtDate;

        strResult = `Select C.ShortToken As SupportToken,
                            A.Id,
                            A.Name,
                            A.Avatar,
                            B.FirstName,
                            B.LastName,
                            G.DeviceInfoParsed As Device,
                            C.Code As StatusCode,
                            C.Description As StatusDescription,
                            E.Id As DeliveryZoneId,
                            E.Name As DeliveryZone,
                            (
                              Select
                                     Z.CreatedAt
                              From
                                     sysUserSessionStatus As Z
               							  Where
                                     -- Date( Z.CreatedAt ) = '${strAtDate}'
                                     -- And
                                     Z.UserId = A.Id
                              Order By
                                     Z.CreatedAt Desc Limit 1
                            ) As LastSession
                     From
                            sysUser As A
                            Inner Join sysPerson As B On B.Id = A.PersonId
                            Left Outer Join -- bizDriverStatus As C On C.UserId = A.Id
                            (
                              Select *
                              From
                                     bizDriverStatus As Z
						                  Where
                                     Z.AtDate = '${strAtDate}'
                              Order By
                                     Z.CreatedAt Desc -- Limit 1
                            ) As C On C.UserId = A.Id
                            Left Outer Join
                            (
                              Select
                                     Z.UserId,
                                     Z.DeliveryZoneId
                              From
                                     bizDriverInDeliveryZone As Z
                              Where
                                     Date( Z.StartAt ) = '${strAtDate}'
                                     And
                                     Z.EndAt Is Null -- Not closed delivery zone
                              Order By
                                     Z.StartAt Desc -- Limit 1
                            ) As D On D.UserId = A.Id
                            Left Outer Join bizDeliveryZone As E On E.Id = D.DeliveryZoneId
                            Left Outer Join sysUserSessionStatus As F On F.ShortToken = C.ShortToken
                            Left Outer Join sysUserSessionDevice As G On G.UserSessionStatusToken = F.Token
                     Where
                            A.GroupId = '${strGroupId}' -- "d7648ed4-1914-4fe4-9902-072a21db1f00" Drivers User Group Id
                            -- And
                            -- ( Date( C.AtDate ) = '${strAtDate}' Or C.AtDate Is Null )
                            And
                            A.DisabledBy Is Null
                            And
                            A.DisabledAt Is Null
                            And
                            (
                              (
                                Select
                                       Z.CreatedAt
                                From
                                       sysUserSessionStatus As Z
              							    Where
                                       -- Date( Z.CreatedAt ) = '${strAtDate}'
                                       -- And
                                       Z.UserId = A.Id
                                Order By
                                       Z.CreatedAt Desc Limit 1
                              ) >= DATE_SUB( NOW(), INTERVAL 15 DAY )
                              Or
                              TIMESTAMP( A.CreatedAt ) >= DATE_SUB( NOW(), INTERVAL 15 DAY )
                            )
                     Order By
                            C.Code Desc,
                            E.Name Desc,
                            B.FirstName,
                            B.LastName,
                            A.Name`;

        if ( process.env.ENV == "dev" ||
             process.env.ENV == "test" ) {

          strResult = CommonUtilities.normalizeSQLWithMultiline( strResult );

        }

      }
      else if ( strName === "searchDeliveryOrder" ) {

        /*
                       A.Id,
                       A.Kind,
                       A.DriverRouteId,
                       A.DeliveryAt,
                       A.OriginId,
                       A.DestinationId,
                       A.UserId,
                       A.StatusCode,
                       A.StatusDescription,
                       A.RoutePriority,
                       A.Comment,
                       A.Tag,
                       A.CreatedBy,
                       A.CreatedAt,
                       A.UpdatedBy,
                       A.UpdatedAt,
                       C.Name,
                       C.Latitude,
                       C.Longitude,
                       C.Phone,
                       C.EMail,
                       C.Tag,
                       D.Address,
                       D.Latitude,
                       D.Longitude,
                       D.Name,
                       D.Phone,
                       D.EMail,
                       D.Comment,
                       D.Tag
        */

        strResult = `Select
                       ${params.SelectFields}
                     From
                       bizDeliveryOrder As A
                       Inner Join bizOrigin As B On B.Id = A.OriginId
                       Inner Join bizEstablishment As C On C.Id = B.EstablishmentId
                       Inner Join bizDestination As D On D.Id = A.DestinationId
                       Inner Join bizDeliveryOrderStatusStep As E On E.Kind = A.Kind And E.Code = A.StatusCode
                     Where`;
                     /*
                       Date( A.DeliveredAt ) = '2020-08-18' And
                       A.CanceledBy Is Null And
                       A.CanceledAt Is Null And
                       A.DisabledBy Is Null And
                       A.DisabledAt Is Null And
                       E.Canceled = 0 And
                       E.Last = 0
                     Order By
                       A.RoutePriority Asc,
                       A.DeliveryAt Asc`
                     */

        if ( process.env.ENV == "dev" ||
             process.env.ENV == "test" ) {

          strResult = CommonUtilities.normalizeSQLWithMultiline( strResult );

        }

      }
      else if ( strName === "searchCountDeliveryOrder" ) {

        strResult = `Select
                       Count( A.Id ) As Count
                     From
                       bizDeliveryOrder As A
                       Inner Join bizOrigin As B On B.Id = A.OriginId
                       Inner Join bizEstablishment As C On C.Id = B.EstablishmentId
                       Inner Join bizDestination As D On D.Id = A.DestinationId
                       Inner Join bizDeliveryOrderStatusStep As E On E.Kind = A.Kind And E.Code = A.StatusCode
                     Where`;

        if ( process.env.ENV == "dev" ||
             process.env.ENV == "test" ) {

          strResult = CommonUtilities.normalizeSQLWithMultiline( strResult );

        }

      }
      else if ( strName === "getActiveOrderByDriverId" ) {

        strResult = `Select
                     	      A.Id,
                            A.UserId,
                            F.Name,
                            G.FirstName,
                            G.LastName,
                            A.StatusCode,
                            A.StatusDescription,
                            A.StatusSequence,
                            B.Id As OriginId,
                            C.Name As OriginName,
                            B.Address As OriginAddress,
                            B.Latitude As OriginLatitude,
                            B.Longitude As OriginLongitude,
                            D.Id As DestinationId,
                            D.Address As DestinationAddress,
                            D.Latitude As DestinationLatitude,
                            D.Longitude As DestinationLongitude,
                            A.CreatedBy,
                            A.CreatedAt
                     From
                            bizDeliveryOrder As A
                            Inner Join bizOrigin As B On B.Id = A.OriginId
                            Inner Join bizEstablishment As C On C.Id = B.EstablishmentId
                            Inner Join bizDestination As D On D.Id = A.DestinationId
                            Inner Join bizDeliveryOrderStatusStep As E On E.Kind = A.Kind And E.Code = A.StatusCode
                            Left Outer Join sysUser As F On F.Id = A.UserId
                            Left Outer Join sysPerson As G On G.Id = F.PersonId
                     Where
                            E.Last = 0
                            And
                            E.Canceled = 0
                            And
                            A.UserId = '${params.DriverId}'`;

        if ( process.env.ENV == "dev" ||
             process.env.ENV == "test" ) {

          strResult = CommonUtilities.normalizeSQLWithMultiline( strResult );

        }

      }
      else if ( strName === "getCountActiveOrderByDriverId" ) {

        strResult = `Select
                            Count( A.Id ) As Count
                     From
                            bizDeliveryOrder As A
                            Inner Join bizOrigin As B On B.Id = A.OriginId
                            Inner Join bizEstablishment As C On C.Id = B.EstablishmentId
                            Inner Join bizDestination As D On D.Id = A.DestinationId
                            Inner Join bizDeliveryOrderStatusStep As E On E.Kind = A.Kind And E.Code = A.StatusCode
                            Left Outer Join sysUser As F On F.Id = A.UserId
                            Left Outer Join sysPerson As G On G.Id = F.PersonId
                     Where
                            E.Last = 0
                            And
                            E.Canceled = 0
                            And
                            A.UserId = '${params.DriverId}'`;

        if ( process.env.ENV == "dev" ||
             process.env.ENV == "test" ) {

          strResult = CommonUtilities.normalizeSQLWithMultiline( strResult );

        }

      }
      else if ( strName === "getAllActiveOrders" ) {

        strResult = `Select
                     	      A.Id,
                            A.UserId,
                            F.Name,
                            G.FirstName,
                            G.LastName,
                            A.StatusCode,
                            A.StatusDescription,
                            A.StatusSequence,
                            B.Id As OriginId,
                            C.Name As OriginName,
                            B.Address As OriginAddress,
                            B.Latitude As OriginLatitude,
                            B.Longitude As OriginLongitude,
                            D.Id As DestinationId,
                            D.Address As DestinationAddress,
                            D.Latitude As DestinationLatitude,
                            D.Longitude As DestinationLongitude,
                            A.CreatedBy,
                            A.CreatedAt
                     From
                            bizDeliveryOrder As A
                            Inner Join bizOrigin As B On B.Id = A.OriginId
                            Inner Join bizEstablishment As C On C.Id = B.EstablishmentId
                            Inner Join bizDestination As D On D.Id = A.DestinationId
                            Inner Join bizDeliveryOrderStatusStep As E On E.Kind = A.Kind And E.Code = A.StatusCode
                            Left Outer Join sysUser As F On F.Id = A.UserId
                            Left Outer Join sysPerson As G On G.Id = F.PersonId
                     Where
                            E.Last = 0
                            And
                            E.Canceled = 0`;

        if ( process.env.ENV == "dev" ||
             process.env.ENV == "test" ) {

          strResult = CommonUtilities.normalizeSQLWithMultiline( strResult );

        }

      }
      else if ( strName === "getAllActiveOrdersCount" ) {

        strResult = `Select
                            Count( A.Id ) As Count
                     From
                            bizDeliveryOrder As A
                            Inner Join bizOrigin As B On B.Id = A.OriginId
                            Inner Join bizEstablishment As C On C.Id = B.EstablishmentId
                            Inner Join bizDestination As D On D.Id = A.DestinationId
                            Inner Join bizDeliveryOrderStatusStep As E On E.Kind = A.Kind And E.Code = A.StatusCode
                            Left Outer Join sysUser As F On F.Id = A.UserId
                            Left Outer Join sysPerson As G On G.Id = F.PersonId
                     Where
                            E.Last = 0
                            And
                            E.Canceled = 0`;

        if ( process.env.ENV == "dev" ||
             process.env.ENV == "test" ) {

          strResult = CommonUtilities.normalizeSQLWithMultiline( strResult );

        }

      }
      else if ( strName === "getDeliveryOrderStatusById" ) {

        strResult = `Select
                            A.Id,
                            A.Kind,
                            A.StatusSequence,
                            A.StatusCode,
                            A.StatusDescription,
                            (
                              Select
                                     Z.Sequence
                     		      From
                                     bizDeliveryOrderStatusStep As Z
                     		      Where
                                     Z.Kind = A.Kind
                                     And
                                     Z.Sequence < A.StatusSequence
                                     And
                                     Z.DisabledBy Is Null
                                     And
                                     Z.DisabledAt Is Null
                     		      Limit 1
                            ) As PreviousStatusSequence,
                            (
                              Select
                                     Z.Code
                     		      From
                                     bizDeliveryOrderStatusStep As Z
                     		      Where
                                     Z.Kind = A.Kind
                                     And
                                     Z.Sequence < A.StatusSequence
                                     And
                                     Z.DisabledBy Is Null
                                     And
                                     Z.DisabledAt Is Null
                     		      Limit 1
                     	      ) As PreviousStatusCode,
                            (
                              Select
                                     Z.Description
                     		      From
                                     bizDeliveryOrderStatusStep As Z
                     		      Where
                                     Z.Kind = A.Kind
                                     And
                                     Z.Sequence < A.StatusSequence
                                     And
                                     Z.DisabledBy Is Null
                                     And
                                     Z.DisabledAt Is Null
                     		      Limit 1
                     	      ) As PreviousStatusDescription,
                            (
                              Select
                                     Z.Sequence
                     		      From
                                     bizDeliveryOrderStatusStep As Z
                     		      Where
                                     Z.Kind = A.Kind
                                     And
                                     Z.Sequence > A.StatusSequence
                                     And
                                     Z.DisabledBy Is Null
                                     And
                                     Z.DisabledAt Is Null
                     		      Limit 1
                            ) As NextStatusSequence,
                            (
                              Select
                                     Z.Code
                     		      From
                                     bizDeliveryOrderStatusStep As Z
                     		      Where
                                     Z.Kind = A.Kind
                                     And
                                     Z.Sequence > A.StatusSequence
                                     And
                                     Z.DisabledBy Is Null
                                     And
                                     Z.DisabledAt Is Null
                     		      Limit 1
                     	      ) As NextStatusCode,
                            (
                              Select
                                     Z.Description
                         	  	From
                                     bizDeliveryOrderStatusStep As Z
                         	  	Where
                                     Z.Kind = A.Kind
                                     And
                                     Z.Sequence > A.StatusSequence
                                     And
                                     Z.DisabledBy Is Null
                                     And
                                     Z.DisabledAt Is Null
                         	  	Limit 1
                         	  ) As NextStatusDescription,
                            A.CreatedBy,
                            A.CreatedAt
                     From
                            bizDeliveryOrder As A
                            Inner Join bizDeliveryOrderStatusStep As B On B.Kind = A.Kind And B.Code = A.StatusCode
                     Where
                            B.Last = 0
                            And
                            B.Canceled = 0
                            And
                            A.Id = '${params.Id}'
                     Order By
                            A.CreatedAt`;

        if ( process.env.ENV == "dev" ||
             process.env.ENV == "test" ) {

          strResult = CommonUtilities.normalizeSQLWithMultiline( strResult );

        }

      }
      else if ( strName === "getDeliveryOrderInProgressStatusByDriverId" ) {

        //In Progress status definition is = Not First (New), Not Last (Finished), Not Canceled
        strResult = `Select
                            ${params.SelectFields}
                     From
                            bizDeliveryOrder As A
                            Inner Join
                            bizDeliveryOrderStatusStep As B On
                               B.Kind = A.Kind
                               And
                               B.Code = A.StatusCode
                               And
                               B.First = 0 -- Not the fist (New)
                               And
                               B.Last = 0 -- Not the last (Finished)
                               And
                               B.Canceled = 0 -- Not canceled
                               And
                               B.DisabledBy Is Null
                               And
                               B.DisabledAt Is Null
                     Where
                            A.UserId = '${params.DriverId}'`;

        if ( process.env.ENV == "dev" ||
             process.env.ENV == "test" ) {

          strResult = CommonUtilities.normalizeSQLWithMultiline( strResult );

        }

      }
      else if ( strName === "getDeliveryOrderCurrentStatusStepByKind" ) {

        strResult = `Select
                            ${params.SelectFields}
                     From
                            bizDeliveryOrderStatusStep As A
                     Where
                            A.Kind = ${params.Kind}
                            And
                            A.Sequence = ${params.Sequence}
                     Order By
                            A.Code
                     Limit 1`;

      }
      else if ( strName === "getDeliveryOrderNextStatusStepByKind" ) {

        strResult = `Select
                            ${params.SelectFields}
                     From
                            bizDeliveryOrderStatusStep As A
                     Where
                            A.Kind = ${params.Kind}
                            And
                            A.Sequence > ${params.Sequence}
                            And
                            A.Canceled = 0
                            And
                            A.DisabledBy Is Null
                            And
                            A.DisabledAt Is Null
                     Order By
                            A.Code
                     Limit 1`;

      }
      else if ( strName === "getDeliveryOrderPreviousStatusStepByKind" ) {

        strResult = `Select
                            ${params.SelectFields}
                     From
                            bizDeliveryOrderStatusStep As A
                     Where
                            A.Kind = ${params.Kind}
                            And
                            A.Sequence < ${params.Sequence}
                            And
                            A.Canceled = 0
                            And
                            A.DisabledBy Is Null
                            And
                            A.DisabledAt Is Null
                  Order By
                            A.Code
                     Limit 1`;

      }

    }

/*
SELECT
       A.Id,
       A.Name,
       B.FirstName,
       B.LastName,
       C.Status,
       C.Description,
       E.Id As ZoneId,
       E.Name As Zone
FROM
       sysUser As A
       Inner Join sysPerson As B On B.Id = A.PersonId
       Left Outer Join bizDriverStatus As C On C.UserId = A.Id
       Left Outer Join
       (
         Select
                Z.UserId,
                Z.DeliveryZoneId
		     From
                bizDriverInDeliveryZone2 As Z
		     Where
                Date( Z.StartAt ) = '2020-08-12'
		     Order By
                Z.StartAt Desc Limit 1
	     ) As D On D.UserId = A.Id
       Left Outer Join bizDeliveryZone As E On E.Id = D.DeliveryZoneId
Where
       A.GroupId = "d7648ed4-1914-4fe4-9902-072a21db1f00" -- Driver Group Id
       And
       ( Date( C.AtDate ) = '2020-08-12' Or C.AtDate Is Null )
       And
       A.DisabledBy Is Null
       And
       A.DisabledAt Is Null
Order By
       C.Status Desc,
       E.Name,
       B.FirstName,
       B.LastName;
*/

    //Select A.UserId, A.StartAt From bizDriverInDeliveryZone As A Order By A.StartAt Limit 1,1

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
