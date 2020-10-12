import cluster from 'cluster';

import CommonConstants from "../../CommonConstants";

import SystemUtilities from "../../SystemUtilities";

//import CacheManager from "../../managers/CacheManager";

const debug = require( 'debug' )( 'SampleRunnable' );

export default class SampleRunnable {

  public name = "Sample_Runnable"; //Adm_Driver_On_Demand_2020-10-10-10-20-Dev???
                                   //Adm_Main_2020-10-10-10-20-Dev???

  public description = "Sample runnable module";

  public async init( params: any,
                     logger: any ): Promise<boolean> {

    return true;

  }

  public async run( strName: string,
                    payload: any,
                    logger: any ): Promise<any> {

    let debugMark = debug.extend( 'C5881FD9995B' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );

    debugMark( "Start time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );

    debugMark( "Sample runnable [%s] run method called", strName );

    debugMark( "Finish time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );

  }

}
