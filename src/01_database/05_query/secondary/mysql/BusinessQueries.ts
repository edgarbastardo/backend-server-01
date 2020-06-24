const debug = require( 'debug' )( 'BusinessQueries' );

import SqlString from 'sqlstring';

export default class BusinessQueries {

  static getStatement( strDialect: string,
                       strName: string,
                       params: any,
                       logger: any ): string {

    let strResult = "";

    //Here the common business queries

    if ( strDialect === "mysql" ) {

      if ( strName === "getEstablishments" ) {

        strResult = `select b.id, first_name,phone, a.email as user, address, zone, b.email as email, b.email1 as additionalemail, driversfijos as onsite from users as a inner join establishments as b on a.id=b.user_id where a.deleted_at is null order by first_name;`;

      }
      else if ( strName === "updateOrderTip" ) {

        strResult = `Update deliveries as a inner join orders as b on a.order_id=b.id Set a.tip = ${params.Tip} Where b.establishment_id = '${params.EstablishmentId}' And date(b.created_at) = '${params.Date}' And b.ticket = '${params.Ticket}';`;

      }
      else if ( strName === "getDrivers" ) {

        strResult = `select b.id, first_name,phone, a.email as user, address, zone, b.email as email, b.email1 as additionalemail, driversfijos as onsite from users as a inner join establishments as b on a.id=b.user_id where a.deleted_at is null order by first_name;`;

      }

    }

    return strResult;

  }

}
