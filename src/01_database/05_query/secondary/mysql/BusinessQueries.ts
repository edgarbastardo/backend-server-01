const debug = require( 'debug' )( 'BusinessQueries' );

import SqlString from 'sqlstring';

import CommonConstants from '../../../../02_system/common/CommonConstants';

import SystemUtilities from '../../../../02_system/common/SystemUtilities';

export default class BusinessQueries {

  static getStatement( strDialect: string,
                       strName: string,
                       params: any,
                       logger: any ): string {

    let strResult = "";

    //Here the common business queries

    if ( strDialect === "mysql" ) {

      if ( strName === "getNewOrdersWithNoDriver" ) {

        const strNow = !params.Now ? SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_05 ) : params.Now;

        strResult = SqlString.format( `Select ${params.SelectFields} From orders As A Where A.user_id = null and ( TIMESTAMP( A.created_at ) <= DATE_SUB( ?, INTERVAL 5 MINUTE ) ) Order By A.created_at Desc Limit ${params.MaxRows}`, strNow );

      }

      /*
      if ( strName === "getLastTicketImages" ) {

        const strNow = !params.Now ? SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_05 ) : params.Now;

        strResult = SqlString.format( `Select ${params.SelectFields} From ticket_images As A Inner Join orders As B On B.id = A.order_id Where A.url Is Null And A.migrated = 0 And ( A.lock Is Null Or TIMESTAMP( A.lock ) <= DATE_SUB( ?, INTERVAL 5 MINUTE ) ) Order By A.created_at Desc Limit ${params.MaxRows}`, strNow );

      }
      else if ( strName === "getOldUserSessionStatus" ) {

        strResult = `Update deliveries as a inner join orders as b on a.order_id=b.id Set Tip = ${params.Tip} Where b.establishment_id = '${params.EstablishmentId}' And date(b.created_at) = '${params.Date}' And b.ticket = '${params.Ticket}';`;

      }
      */

    }

    return strResult;

  }

}
