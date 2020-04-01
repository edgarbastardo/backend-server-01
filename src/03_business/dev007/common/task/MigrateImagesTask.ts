import cluster from 'cluster';

import fs from 'fs';
import os from 'os';

import appRoot from 'app-root-path';

import CommonConstants from '../../../../02_system/common/CommonConstants';

import CommonUtilities from '../../../../02_system/common/CommonUtilities';
import SystemUtilities from "../../../../02_system/common/SystemUtilities";

import DBConnectionManager from '../../../../02_system/common/managers/DBConnectionManager';
import LoggerManager from '../../../../02_system/common/managers/LoggerManager';
import TicketImagesService from "../../../common/database/master/services/TicketImagesService";

let debug = require( 'debug' )( 'MigrateImagesTask' );

export default class MigrateImagesTask {

  static async runTask( transaction: any,
                        logger: any ): Promise<boolean> {

    let bResult = false;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let ticketImageList = await TicketImagesService.getLastTicketImages( currentTransaction, logger );

      if ( ticketImageList instanceof Error === false ) {

        ticketImageList = ticketImageList as any[];

        const debugMark = debug.extend( "1DD5480BD154" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

        for ( let intIndex = 0; intIndex < ticketImageList.length; intIndex++ ) {

          const strFullPath = appRoot.path +
                              "/temp/" +
                              os.hostname + "/" +
                              SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_07 ) + "/";

          fs.mkdirSync( strFullPath, { recursive: true } );

          const base64File = ticketImageList[ intIndex ].image.split( ';base64,' );

          const fileExtension = base64File[ 0 ].split( "/" );

          debugMark( "Writing to temporal file %s in the path %s",
                     ticketImageList[ intIndex ].id,
                     strFullPath );

          fs.writeFileSync(
                            strFullPath + ticketImageList[ intIndex ].id + "." + fileExtension[ 1 ],
                            base64File[ 1 ],
                            { encoding: 'base64' }
                          );

          fs.unlinkSync( strFullPath + ticketImageList[ intIndex ].id + "." + fileExtension[ 1 ] );

        }

        //If everything is ok, turn on the flag and apply the transaction
        bApplyTransaction = true;

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = MigrateImagesTask.name + "." + MigrateImagesTask.runTask.name;

      const strMark = "AED3535958E4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return bResult;

  }

}
