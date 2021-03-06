//import uuidv4 from 'uuid/v4';
//import moment from 'moment-timezone';
//import os from 'os';
import cluster from 'cluster';

import CommonConstants from '../../../../02_system/common/CommonConstants';

import CommonUtilities from '../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../02_system/common/SystemUtilities';
//import Hashes from 'jshashes';

const debug = require( 'debug' )( '001_import_data_01'  ); //Ctrl+i

//Example file import files using code
export default class Import {

  static async importUp( dbConnection: any, logger: any ): Promise<any> {

    let bSuccess = false;
    let bEmptyContent = true;

    try {

      /*
      const strId = SystemUtilities.getUUIDv4();

      const strShortId = SystemUtilities.hashString( strId, 2, null );

      const strValues = "'" + strId + "','" + strShortId + "','Group01','#Administrator#','Group test created with migration','backend@system.net','" + SystemUtilities.getCurrentDateAndTime().format() + "'";

      const strSQL = `Insert Into \`sysUserGroup\`( Id, ShortId, Name, Role, Comment, CreatedBy, CreatedAt ) Values( ${strValues} )`;

      //debug( strSQL );

      await dbConnection.execute( strSQL );

      bSuccess = true;
      bEmptyContent = false;
      */

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.importUp.name;

      const strMark = "4E5FF306A170" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return { bSuccess, bEmptyContent };

  }

}