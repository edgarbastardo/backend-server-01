import cluster from 'cluster';

//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import CommonConstants from '../../../CommonConstants';

import CommonUtilities from '../../../CommonUtilities';
import SystemUtilities from '../../../SystemUtilities';

import DBConnectionManager from '../../../managers/DBConnectionManager';
import I18NManager from "../../../managers/I18Manager";

const debug = require( 'debug' )( 'SystemRuleOnlyWorkingTag' );

export default class SystemRuleOnlyWorkingTag {

  static readonly _ID = "SystemRuleOnlyWorkingTag";

  async filterList( userSessionStatus: any,
                    userPresenceList: any[],
                    transaction: any,
                    options: any,
                    logger: any ): Promise<any[]> {

    let result = userPresenceList;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const resultFilteredList = [];

      for ( let intIndex = 0; intIndex < userPresenceList.length; intIndex++ ) {

        const userPresence = userPresenceList[ intIndex ];

        if ( ( userPresence.sysUser.Role && userPresence.sysUser.Role.includes( "#PresenceWorking#" ) ) ||
             ( userPresence.sysUserGroup.Role && userPresence.sysUserGroup.Role.includes( "#PresenceWorking#" ) ) ) {

          if ( userPresence.sysUserSessionStatus.Tag.includes( "#Working#" ) ) {

            resultFilteredList.push( userPresence );

          }

        }
        else {

          resultFilteredList.push( userPresence );

        }

      }

      result = resultFilteredList;

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = SystemRuleOnlyWorkingTag.name + "." + this.filterList.name;

      const strMark = "D248677E1EC7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

    }

    return result;

  }

}