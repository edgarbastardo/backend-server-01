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

        strResult = SqlString.format( `Select * From ticket_images As A Where A.migrated = 0 And ( A.lock Is Null Or TIMESTAMP( A.lock ) <= DATE_SUB( ?, INTERVAL 5 MINUTE ) ) Order By A.created_at Desc Limit 3`, strNow );

      }
      /*
      else if ( strName === "getOldUserSessionStatus" ) {

        strResult = SqlString.format( `Select * From UserSessionStatus As A Where ( A.UserId = ? ) And A.LoggedOutAt Is Null Order By A.UpdatedAt Asc`, params.UserId );

      }
      */

    }

    return strResult;

  }

}