//import fs from 'fs'; //Load the filesystem module

import fetch from 'node-fetch';
//import FormData from 'form-data';

//import CommonUtilities from '../../02_system/common/CommonUtilities';

export class DatabaseRequestServiceV1 {

  private strProtocol = "";
  private strHost = "";

  constructor ( strProtocol : string,
                strHost: string ) {

    this.strProtocol = strProtocol;
    this.strHost = strHost;

  }

  async callSearch( headers: any, query: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'GET',
                        body: null, //JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/database/model/" + query.Table + "/search";

      let strQueryParams = "";

      if ( query.Where ) {

        strQueryParams = "?where=" + query.Where;

      }

      if ( query.Attributes ) {

        if ( strQueryParams ) {

          strQueryParams = strQueryParams + "&attributes=" + query.Attributes;

        }
        else {

          strQueryParams = strQueryParams + "?attributes=" + query.Attributes;

        }

      }

      if ( query.Offset ) {

        if ( strQueryParams ) {

          strQueryParams = strQueryParams + "&offset=" + query.Offset;

        }
        else {

          strQueryParams = strQueryParams + "?offset=" + query.Offset;

        }

      }

      if ( query.Limit ) {

        if ( strQueryParams ) {

          strQueryParams = strQueryParams + "&limit=" + query.Limit;

        }
        else {

          strQueryParams = strQueryParams + "?limit=" + query.Limit;

        }

      }

      if ( query.Include ) {

        if ( strQueryParams ) {

          strQueryParams = strQueryParams + "&include=" + query.Include;

        }
        else {

          strQueryParams = strQueryParams + "?include=" + query.Include;

        }

      }

      if ( query.Order ) {

        if ( strQueryParams ) {

          strQueryParams = strQueryParams + "&order=" + query.Order;

        }
        else {

          strQueryParams = strQueryParams + "?order=" + query.Order;

        }

      }

      const callResult = await fetch( strRequestPath + strQueryParams,
                                      options );

      result.output = callResult ? {
                                     status: callResult.status,
                                     statusText: callResult.statusText,
                                     body: await callResult.json()
                                   }:
                                   {
                                     status: null,
                                     statusText: null,
                                     body: { Code: "" }
                                   };

      result.input = options;

    }
    catch ( error ) {

      console.log( error );

    }

    return result;

  }

  async callDeleteBulk( headers: any, body: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'DELETE',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/database/model/" + body.Table + "/bulk";

      const callResult = await fetch( strRequestPath,
                                      options );

      result.output = callResult ? {
                                     status: callResult.status,
                                     statusText: callResult.statusText,
                                     body: await callResult.json()
                                   }:
                                   {
                                     status: null,
                                     statusText: null,
                                     body: { Code: "" }
                                   };

      result.input = options;

    }
    catch ( error ) {

      console.log( error );

    }

    return result;

  }

}