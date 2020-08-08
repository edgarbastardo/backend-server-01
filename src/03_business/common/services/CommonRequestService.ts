import cluster from 'cluster';
import fs from 'fs'; //Load the filesystem module
import os from 'os'; //Load the os module

import SystemUtilities from "../../../02_system/common/SystemUtilities";
import CommonConstants from '../../../02_system/common/CommonConstants';
import CommonUtilities from '../../../02_system/common/CommonUtilities';

let debug = require( 'debug' )( 'CommonRequestService' );

export default class CommonRequestService {

  static intSequence = 0;

  static formatSequence( intSequence: number ): string {

    let strResult = "";

    if ( intSequence < 10 ) {

      strResult = "000000" + intSequence;

    }
    else if ( intSequence < 100 ) {

      strResult = "00000" + intSequence;

    }
    else if ( intSequence < 1000 ) {

      strResult = "0000" + intSequence;

    }
    else if ( intSequence < 10000 ) {

      strResult = "000" + intSequence;

    }
    else if ( intSequence < 100000 ) {

      strResult = "00" + intSequence;

    }
    else if ( intSequence < 1000000 ) {

      strResult = "0" + intSequence;

    }
    else {

      strResult = intSequence.toString();

    }

    return strResult;

  }

  static saveInput( strFileName: string, inputs: any, logger: any ) {

    try {

      const strPath = SystemUtilities.strBaseRootPath +
                      "/logs/" +
                      os.hostname + "/" +
                      SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_08 ) +
                      "/upload/result/";

      fs.mkdirSync( strPath, { recursive: true } );

      CommonRequestService.intSequence += 1;

      fs.writeFileSync( strPath + CommonRequestService.formatSequence( CommonRequestService.intSequence ) + "_" + strFileName + "_input.json", JSON.stringify( inputs, null, 2 ) );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = CommonRequestService.name + "." + CommonRequestService.saveInput.name;

      const strMark = "FE9443BF6FCA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof logger.error === "function" ) {

        logger.error( error );

      }

    }

  }

  static saveOutput( strFileName: string, result: any, logger: any ) {

    try {

      const strPath = SystemUtilities.strBaseRootPath +
                      "/logs/" +
                      os.hostname + "/" +
                      SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_08 ) +
                      "/upload/result/";

      fs.mkdirSync( strPath, { recursive: true } );

      const strFullFilePath = strPath + CommonRequestService.formatSequence( CommonRequestService.intSequence ) + "_" + strFileName + "_output.json";

      fs.writeFileSync( strFullFilePath, JSON.stringify( result, null, 2 ) );

      if ( result.error ) {

        const strMark = "A06AA430767A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

        const debugMark = debug.extend( strMark );

        debugMark( "Error data present. Log saved to file: [%s]", strFullFilePath );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = CommonRequestService.name + "." + CommonRequestService.saveOutput.name;

      const strMark = "F7C3E87CA18C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof logger.error === "function" ) {

        logger.error( error );

      }

    }

  }


}