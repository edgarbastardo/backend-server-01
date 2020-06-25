
import fetch from 'node-fetch';

let debug = require( 'debug' )( 'OdinRequestServiceV1' );

export default class OdinRequestServiceV1 {

  static async callCreateOrder( backend: any,
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

      const strRequestURL = backend.url[ 0 ] + "/api/v1/orders";

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

      const strMark = "9563E5554706";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );

      result.error = error;

    }

    return result;

  }

}
