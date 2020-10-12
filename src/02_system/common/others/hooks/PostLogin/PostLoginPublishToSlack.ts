import CommonConstants from "../../../CommonConstants";

import SystemUtilities from "../../../SystemUtilities";

import NotificationManager from "../../../managers/NotificationManager";
import CacheManager from "../../../managers/CacheManager";

export default class PostLoginPublishToSlack {

  public name = "PostLoginPublishToSlack";

  public async init( params: any,
                     logger: any ): Promise<boolean> {

    return true;

  }

  public async process( intIndex: number,
                        strChain: string,
                        payload: any,
                        logger: any ): Promise<any> {

    let intCountAttempsFailed = 0;

    if ( payload.result.Code !== "SUCCESS_LOGIN" ) {

      intCountAttempsFailed = parseInt( await CacheManager.getData( payload.request.body.Username + "@login_attemps_failed",
                                                                    logger ) );

      await CacheManager.setData( payload.request.body.Username + "@login_attemps_failed",
                                  intCountAttempsFailed + 1,
                                  logger );

    }
    else {

      await CacheManager.setData( payload.request.body.Username + "@login_attemps_failed",
                                  0,
                                  logger );

    }

    if (
         (
           intCountAttempsFailed >= 2 &&
           intCountAttempsFailed <= 15
         ) ||
         payload.request.body.Username === "driver03" ||
         payload.request.body.Username?.startsWith( "s.admin" ) ||
         payload.request.body.Username?.startsWith( "b.manager" )  ) {

      let strMessage = "";
      let strNotification = "";

      if ( payload.result.Code === "SUCCESS_LOGIN" ) {

        strMessage = `Login sucess for the user ${payload.request.body.Username}`;
        strNotification = "notification";

      }
      else {

        strMessage = `Login failed for the user ${payload.request.body.Username} attemps ${intCountAttempsFailed}`;
        strNotification = "warning";

      }

      const slackPayload = {
                             body: {
                                     kind: strNotification, //notification, error, warning
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
                                     footer: "A203F2B7726D",
                                       // `Date: ${SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 )}\nHost: ${SystemUtilities.getHostName()}\nApplication: ${process.env.APP_SERVER_DATA_NAME}\nRunning from: ${SystemUtilities.strBaseRunPath}`
                                   }
                           }

      await NotificationManager.publishToExternal( slackPayload,
                                                   logger );

    }

  }

}
