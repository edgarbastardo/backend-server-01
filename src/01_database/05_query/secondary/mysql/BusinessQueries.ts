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

      if ( strName === "getLastTicketImages" ) {

        const strNow = !params.Now ? SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_05 ) : params.Now;

        strResult = SqlString.format( `Select ${params.SelectFields} From ticket_images As A Inner Join orders As B On B.id = A.order_id Where A.url Is Null And A.migrated = 0 And ( A.lock Is Null Or TIMESTAMP( A.lock ) <= DATE_SUB( ?, INTERVAL 5 MINUTE ) ) Order By A.created_at Desc Limit ${params.MaxRows}`, strNow );

      }
      /*
      else if ( strName === "getOldUserSessionStatus" ) {

        strResult = SqlString.format( `Update deliveries as a inner join orders as b on a.order_id=b.id Set a.tip = ?, a.tip_method='online' Where b.establishment_id = ? And date(b.created_at) = ? And b.ticket = ?`, [ params.Tip, params.EstablishmentId, params.Date, params.Ticket ] );

      }
      else if ( strName === "getDrivers" ) {

        //Pending
        strResult = `select b.id, a.first_name, a.last_name, a.phone, a.email as user from users a inner join drivers b on b.user_id = a.id where a.deleted_at is null and a.role = "driver" order by first_name, last_name;`;
        //strResult = `select a.id, a.first_name, a.last_name, a.phone, a.email as user from users a where a.deleted_at is null and a.role = "driver" order by first_name, last_name;`;

      }
      */

    }

    return strResult;

  }

}
