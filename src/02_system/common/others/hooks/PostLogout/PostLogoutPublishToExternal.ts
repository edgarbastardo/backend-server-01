import CommonConstants from "../../../CommonConstants";

import SystemUtilities from "../../../SystemUtilities";

import NotificationManager from "../../../managers/NotificationManager";

export default class PostLogoutPublishToExternal {

  public name = "PostLogoutPublishToExternal";

  public async init( params: any,
                     logger: any ): Promise<boolean> {

    return true;

  }

  public async process( intIndex: number,
                        strChain: string,
                        payload: any,
                        logger: any ): Promise<any> {

    if ( payload.request.body.Username === "driver03" ||
         payload.request.body.Username?.startsWith( "s.admin" ) ||
         payload.request.body.Username?.startsWith( "b.manager" )  ) {

      let strMessage = "";

      if ( payload.result.Code === "SUCCESS_LOGOUT" ) {

        strMessage = `Logout sucess for the user ${payload.request.body.Username}`

      }
      else {

        strMessage = `Logout failed for the user ${payload.request.body.Username}`

      }

      const publishPayload = {
                               body: {
                                       kind: "notification", //notification, error, warning
                                       text: strMessage,
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
                                                 }
                                               ],
                                       footer: "128452630FD1",
                                         // `Date: ${SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 )}\nHost: ${SystemUtilities.getHostName()}\nApplication: ${process.env.APP_SERVER_DATA_NAME}\nRunning from: ${SystemUtilities.strBaseRunPath}`
                                     }
                             }

      await NotificationManager.publishToExternal( publishPayload,
                                                   logger );

    }

  }

}
