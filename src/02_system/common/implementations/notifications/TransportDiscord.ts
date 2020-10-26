import cluster from 'cluster';

import fetch from 'node-fetch';

import CommonConstants from "../../CommonConstants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

const debug = require( 'debug' )( 'TransportDiscord' );

export default class TransportDiscord {

  static client = null;

  static async init( transportOptions: any,
                     logger: any ): Promise<boolean> {

    return true;

  }

  static transformColor( strHexColor: string ): number {

    let intResult = 0;

    try {

      intResult = Number.parseInt( strHexColor.replace( "#", "0x" ) );

    }
    catch ( error ) {


    }

    return intResult;

  }

  static transformFields( fields: [any] ): any {

    let result = [];

    try {

      for ( let intIndex = 0; intIndex < fields.length; intIndex++ ) {

        const field = {
                        name: fields[ intIndex ].title,
                        value: fields[ intIndex ].value,
                        inline: fields[ intIndex ].short || false
                      };

        result.push( field );

      }

    }
    catch ( error ) {


    }

    return result;

  }

  static async send( transportOptions: any,
                     messageOptions: any,
                     logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      let webHook = transportOptions.target.web_hooks[ messageOptions.channel ];

      if ( !webHook ) {

        webHook = transportOptions.target.web_hooks[ "#" + messageOptions.body.kind ]; // "@__default__@" ];

      }

      if ( webHook === null ||
           webHook === undefined ) {

        webHook = transportOptions.target.web_hooks[ "@__default__@" ];

      }

      if ( webHook ) {

        let toList = [];

        if ( typeof( webHook ) === "string" ) {

          toList = CommonUtilities.trimArray( webHook.split( "," ) ); //CommonUtilities.trimArray( transportOptions.to.split( "," ) );

        }
        else if ( Array.isArray( webHook ) ) {

          toList = webHook;

        }

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
                                   "username": "Notification System",
                                   "embeds": [
                                               {
                                                 "title": notificationKind.title, //":warning: Warning",
                                                 "color": `${this.transformColor( notificationKind.color )}`, //"#ffff00", //"#36a64f",
                                                 "description": messageOptions.body.text,
                                                 "fields": this.transformFields( messageOptions.body.fields ),
                                                 "footer": {
                                                             "text": messageOptions.body.footer
                                                           }
                                               }
                                             ]
                                 };

            const options = {
                              method: 'POST',
                              headers: {
                                         "Content-Type": "application/json"
                                       },
                              body: JSON.stringify( notification ) //JSON.stringify( { text: messageOptions.body.text } )
                            };

            const result = await fetch( strTo, options );

            if ( process.env.ENV === "dev" && result.ok ) {

              //const json = await result.json();
              //const body = result.body;

              let debugMark = debug.extend( '1BF68150CC99' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
              debugMark( "Ok published to discord" );
              //debugMark( json );
              //debugMark( body );

            }

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.send.name;

      const strMark = "27CD67CCDEAF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
