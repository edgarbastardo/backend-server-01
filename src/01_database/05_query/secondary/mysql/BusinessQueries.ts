const debug = require( 'debug' )( 'BusinessQueries' );

import SqlString from 'sqlstring';

export default class BusinessQueries {

  static getStatement( strDialect: string,
                       strName: string,
                       params: any,
                       logger: any ): string {

    let strResult = "";

    //Here the common business queries

    if ( strName === "getEstablishments" ) {

      if ( params.Kind ) {

        strResult = `select b.id, first_name,phone, a.email as user, address, zone, b.email as email, b.email1 as additionalemail, b.driversfijos as onsite from users as a inner join establishments as b on a.id=b.user_id where b.driversfijos = ${params.Kind} and a.deleted_at is null order by first_name;`;

      }
      else {

        strResult = `select b.id, first_name,phone, a.email as user, address, zone, b.email as email, b.email1 as additionalemail, b.driversfijos as onsite from users as a inner join establishments as b on a.id=b.user_id where a.deleted_at is null order by first_name;`;

      }

    }
    /*
    else if ( strName === "getEstablishmentsCantina" ) {

      //Cantina
      strResult = `select b.id, first_name,phone, a.email as user, address, zone, b.email as email, b.email1 as additionalemail, b.driversfijos as onsite from users as a inner join establishments as b on a.id=b.user_id where b.driversfijos = 2 and a.deleted_at is null order by first_name;`;

    }
    */
    else if ( strName === "updateOrderTip" ) {

      strResult = SqlString.format( `Update deliveries as a inner join orders as b on a.order_id=b.id Set a.tip = ?, a.tip_method='online' Where b.establishment_id = ? And date(b.created_at) = ? And b.ticket = ?`, [ params.Tip, params.EstablishmentId, params.Date, params.Ticket ] );

    }
    else if ( strName === "getDrivers" ) {

      //Pending
      strResult = `select b.id, a.first_name, a.last_name, a.phone, a.email as user from users a inner join drivers b on b.user_id = a.id where a.deleted_at is null and a.role = "driver" order by first_name, last_name;`;
      //strResult = `select a.id, a.first_name, a.last_name, a.phone, a.email as user from users a where a.deleted_at is null and a.role = "driver" order by first_name, last_name;`;

    }

    return strResult;

  }

}
