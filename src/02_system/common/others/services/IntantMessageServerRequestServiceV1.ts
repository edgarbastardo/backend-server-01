
import fetch from 'node-fetch';

let debug = require( 'debug' )( 'IntantMessageServerRequestServiceV1' );

export default class IntantMessageServerRequestServiceV1 {

  static async callDisconnectUser( strRequestURL: string,
                                   headers: any,
                                   body: any ): Promise<{ input: any, output: any, error: Error }> {

    const result: any = {

      input: null,
      output: null,
      error: null

    };

    try {

      const options: any = {

        method: "POST",
        headers,
        body: JSON.stringify( body )

      };

      const callResult = await fetch( strRequestURL,
                                      options );

      result.output = callResult ? {
        status: callResult.status,
        statusText: callResult.statusText,
        body: await callResult.json()
      } :
        {
          status: null,
          statusText: null,
          body: {
            Code: ""
          }
        };

      options.body = body;
      result.input = options;

    }
    catch ( error ) {

      const strMark = "4040EECD311D";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );

      result.error = error;

    }

    return result;

  }

}
