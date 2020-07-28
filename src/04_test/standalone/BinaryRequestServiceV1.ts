import fs from 'fs'; //Load the filesystem module

import fetch from 'node-fetch';
import FormData from 'form-data';

import CommonUtilities from '../../02_system/common/CommonUtilities';

export class BinaryRequestServiceV1 {

  private strProtocol = "";
  private strHost = "";

  constructor ( strProtocol : string,
                strHost: string ) {

    this.strProtocol = strProtocol;
    this.strHost = strHost;

  }

  async callCreateAuth( headers: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'POST',
                        body: null, //JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/binary/auth";

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

  async callDeleteAuth( headers: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'DELETE',
                        body: null, //JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/binary/auth";

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

  async callBinarySearch( headers: any,
                           params: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'GET',
                        headers: headers,
                        body: null,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/binary/search";

      let strQueryParams = "";

      if ( params.where ) {

        strQueryParams = "?where=" + params.where;

      }

      if ( params.orderBy ) {

        if ( strQueryParams ) {

          strRequestPath = strQueryParams + "&orderBy=" + params.orderBy;

        }
        else {

          strRequestPath = "?orderBy=" + params.orderBy;

        }

      }

      if ( params.offset ) {

        if ( strQueryParams ) {

          strRequestPath = strQueryParams + "&offset=" + params.offset;

        }
        else {

          strRequestPath = "?offset=" + params.orderBy;

        }

      }

      if ( params.limit ) {

        if ( strQueryParams ) {

          strRequestPath = strQueryParams + "&limit=" + params.limit;

        }
        else {

          strRequestPath = "?limit=" + params.limit;

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

       //( options as any ).body = body;

       result.input = options;

    }
    catch ( error ) {

      console.log( error );

    }

    return result;

  }

  async callBinarySearchCount( headers: any,
                                params: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'GET',
                        headers: headers,
                        body: null,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/binary/search/count";

      let strQueryParams = "";

      if ( params.where ) {

        strQueryParams = "?where=" + params.where;

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

       //( options as any ).body = body;

       result.input = options;

    }
    catch ( error ) {

      console.log( error );

    }

    return result;

  }

  async callUploadBinaryData( headers: any,
                              body: FormData ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'POST',
                        body: body, //JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/binary";

      const callResult = await fetch( strRequestPath,
                                      options as any );

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

      ( options as any ).body = body;

      result.input = options;

    }
    catch ( error ) {

      console.log( error );

    }

    return result;

  }

  async callDownloadBinaryData( headers: any, query: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'GET',
                        body: null,
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/binary?id=" + query.Id + "&auth=" + headers.BinaryDataToken + "&thumbnail=" + query.Thumbnail;

      const callResult = await fetch( strRequestPath,
                                      options );

      const strXBodyResponse = callResult.headers.get( "x-body-response" ) as any; //callResult.headers.raw()

      const jsonXBodyResponse = CommonUtilities.parseJSON( strXBodyResponse, null );

      const strPath = query.SavePath + '/' + jsonXBodyResponse.Name;

      fs.mkdirSync( query.SavePath, { recursive: true }  );

      const destinationFileStream = fs.createWriteStream( strPath );

      await new Promise( ( resolve: any, reject: any ) => {

        callResult.body.pipe( destinationFileStream ).on( 'close', () => { resolve( true ) } ); //Wait for the stream finish to write to file system

      } );

      result.output = callResult ? {
                                     status: callResult.status,
                                     statusText: callResult.statusText,
                                     body: jsonXBodyResponse
                                   }:
                                   {
                                    status: null,
                                    statusText: null,
                                    body: { Code: "" }
                                   };

      //( options as any ).body = jsonXBodyResponse; //callResult.headers[ "X-Body-Response" ];

      result.input = options;

    }
    catch ( error ) {

      console.log( error );

    }

    return result;

  }

  async callDeleteBinaryData( headers: any,
                               query: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'DELETE',
                        body: null, //query, //JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/binary?id=" + query.Id;

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

      ( options as any ).body = query;

      result.input = options;

    }
    catch ( error ) {

      console.log( error );

    }

    return result;

  }

  async callGetBinaryDataDetails( headers: any,
                                   query: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'GET',
                        body: null,
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/binary/details?id=" + query.Id;

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

  async callDisableBulkBinary( headers: any,
                               body: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'PUT',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/binary/disable/bulk";

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

      ( options as any ).body = body;

      result.input = options;

    }
    catch ( error ) {

      console.log( error );

    }

    return result;

  }

  async callEnableBulkBinary( headers: any,
                              body: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'PUT',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/binary/enable/bulk";

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

      ( options as any ).body = body;

      result.input = options;

    }
    catch ( error ) {

      console.log( error );

    }

    return result;

  }

  async callDeleteBulkBinary( headers: any,
                              body: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'DELETE',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/binary/bulk";

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

      ( options as any ).body = body;

      result.input = options;

    }
    catch ( error ) {

      console.log( error );

    }

    return result;

  }

}
