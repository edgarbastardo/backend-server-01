//import uuidv4 from 'uuid/v4';
//import moment from 'moment-timezone';
//import os from 'os';
import cluster from 'cluster';

import CommonUtilities from '../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../02_system/common/SystemUtilities';
import CommonConstants from '../../../../02_system/common/CommonConstants';
//import Hashes from 'jshashes';

const debug = require( 'debug' )( '005_migrate_02' );

//Example file migrate files using code
export default class Migrate {

  static async migrateUp( dbConnection: any, logger: any ): Promise<any> {

    let bSuccess = false;
    let bEmptyContent = true;

    try {

      let strSQL = "Select Action From sysRoute limit 1, 1";

      try {

        //Check field Action exists
        await dbConnection.execute( strSQL );

      }
      catch ( error ) {

        //The field Action NOT exists. Must be created

        strSQL = `ALTER TABLE \`sysRoute\` ADD COLUMN \`Action\` VARCHAR(75) NULL AFTER \`Path\``;

        await dbConnection.execute( strSQL );

        strSQL = `ALTER TABLE \`sysRoute\` ADD UNIQUE INDEX \`UNQ_sysRoute_Action_idx\` (\`Action\` ASC)`;

        await dbConnection.execute( strSQL );

      }

      /*
      ALTER TABLE `BackendServer01DB`.`sysRoute`
      ADD COLUMN `Action` VARCHAR(75) NULL AFTER `Path`;

      ALTER TABLE `BackendServer01DB`.`sysRoute`
      ADD UNIQUE INDEX `UNQ_sysRoute_Action_idx` (`Action` ASC);

      const strId = SystemUtilities.getUUIDv4();

      const strShortId = SystemUtilities.hashString( strId, 2, null );

      const strValues = "'" + strId + "','" + strShortId + "','Group01','#Administrator#','Group test created with migration','backend@system.net','" + moment().format() + "'";

      const strSQL = `Insert Into \`sysUserGroup\`( Id, ShortId, Name, Role, Comment, CreatedBy, CreatedAt ) Values( ${strValues} )`;

      await dbConnection.execute( strSQL );

      bSuccess = true;
      bEmptyContent = false;
      */

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.migrateUp.name;

      const strMark = "6C9E8CDB8358" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
