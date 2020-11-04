import CommonConstants from "../../../CommonConstants";

import SystemUtilities from "../../../SystemUtilities";

import NotificationManager from "../../../managers/NotificationManager";

export default class HandleErrorPublishToExternal {

  public name = "HandleErrorPublishToExternal";

  public async init( params: any,
                     logger: any ): Promise<boolean> {

    return true;

  }

  public async process( intIndex: number,
                        strChain: string,
                        payload: any,
                        logger: any ): Promise<any> {

    try {

      const publishToExternalPayload = {
                                         body: {
                                                 kind: "error",
                                                 text: payload?.error?.message || "No error message",
                                                 fields: [
                                                           {
                                                             title: "Date",
                                                             value: SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ),
                                                             short: false
                                                           },
                                                           {
                                                             title: "Host",
                                                             value: SystemUtilities.getHostName(),
                                                             short: false
                                                           },
                                                           {
                                                             title: "Application",
                                                             value: process.env.APP_SERVER_DATA_NAME + "-" + process.env.DEPLOY_TARGET,
                                                             short: false
                                                           },
                                                           {
                                                             title: "Running from",
                                                             value: SystemUtilities.strBaseRunPath,
                                                             short: false
                                                           },
                                                           {
                                                             title: "Mark",
                                                             value: payload?.error?.mark || "No error mark",
                                                             short: false
                                                           }
                                                         ],
                                                 footer: payload?.error?.footer || "Unknown",
                                                   // `Date: ${SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 )}\nHost: ${SystemUtilities.getHostName()}\nApplication: ${process.env.APP_SERVER_DATA_NAME}\nRunning from: ${SystemUtilities.strBaseRunPath}`
                                               },
                                          channel: payload?.channel || null,
                                          transport: payload?.transport || null,
                                       }

      await NotificationManager.publishToExternal( publishToExternalPayload,
                                                   logger );

    }
    catch ( error ) {


    }

  }

}
