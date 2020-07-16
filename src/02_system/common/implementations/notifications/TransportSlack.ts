import cluster from 'cluster';

import fetch from 'node-fetch';

import CommonConstants from "../../CommonConstants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

const debug = require( 'debug' )( 'TransportSlack' );

export default class TransportSlack {

  static client = null;

  static async init( transportOptions: any,
                     logger: any ): Promise<boolean> {

    return true;

  }

  static async send( transportOptions: any,
                     messageOptions: any,
                     logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      let strWebHook = transportOptions.target.web_hooks[ messageOptions.channel ];

      if ( !strWebHook ) {

        strWebHook = transportOptions.target.web_hooks[ "#" + messageOptions.body.kind ]; // "@__default__@" ];

      }

      if ( strWebHook === null ||
           strWebHook === undefined ) {

        strWebHook = transportOptions.target.web_hooks[ "@__default__@" ];

      }

      if ( strWebHook ) {

        const toList = CommonUtilities.trimArray( strWebHook.split( "," ) ); //CommonUtilities.trimArray( transportOptions.to.split( "," ) );

        for ( const strTo of toList ) {

          if ( strTo && strTo.trim()  ) {

            let notificationKind = { color: null, title: null };

            if ( messageOptions.body.kind === "notification" ) {

              notificationKind.color = "#36a64f";
              notificationKind.title = ":bell: Notification";

            }
            else if ( messageOptions.body.kind === "warning" ) {

              notificationKind.color = "#ffff00";
              notificationKind.title = ":warning: Warning";

            }
            else if ( messageOptions.body.kind === "error" ) {

              notificationKind.color = "#ff4000";
              notificationKind.title = ":red_circle: Error";

            }

            const notification = {
                                   //"channel": "ABCDEBF1",
                                   "attachments": [
                                                    {
                                                      "mrkdwn_in": ["text"],
                                                      "color": notificationKind.color, //"#ffff00", //"#36a64f",
                                                      "author_name": notificationKind.title, //":warning: Warning",
                                                      "text": messageOptions.body.text,
                                                      "fields": messageOptions.body.fields,
                                                      "footer": messageOptions.body.footer
                                                      /*
                                                      "fields": [
                                                                  {
                                                                    "title": "A field's title",
                                                                    "value": "This field's value",
                                                                    "short": false
                                                                  },
                                                                  {
                                                                    "title": "A short field's title",
                                                                    "value": "A short field's value",
                                                                    "short": true
                                                                  },
                                                                  {
                                                                    "title": "A second short field's title",
                                                                    "value": "A second short field's value",
                                                                    "short": true
                                                                  }
                                                                ],
                                                                */
                                                      //"thumb_url": "http://placekitten.com/g/200/200",
                                                      //"footer": "footer",
                                                      //"footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                                                      //"ts": 123456789
                                                    }
                                                  ]
                                 };

            const options = {
                              method: 'POST',
                              body: JSON.stringify( notification ) //JSON.stringify( { text: messageOptions.body.text } )
                            };

            const result = await fetch( strTo, options );

            if ( process.env.ENV === "dev" && result.ok ) {

              //const json = await result.json();
              //const body = result.body;

              let debugMark = debug.extend( '0D89CCBB12E4' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
              debugMark( "Ok published to slack" );
              //debugMark( json );
              //debugMark( body );

            }

          }

        }

       bResult = true;

      }


    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.send.name;

      const strMark = "4EB285DAC391" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    return bResult;

  }

}
