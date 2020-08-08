import cluster from 'cluster';

//import fs from 'fs'; //Load the filesystem module

import fetch from 'node-fetch';

//import FormData from 'form-data';

import CommonConstants from '../../../02_system/common/CommonConstants';

import CommonUtilities from '../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../02_system/common/SystemUtilities';

let debug = require( 'debug' )( 'VromoAPIRequestService' );

export default class VromoAPIRequestService {

  static async sendOrder( headers: any,
                          strRequestBasePath: string,
                          body: any,
                          logger: any ): Promise<any> {

    let result = { input: null, output: null, error: null };

    try {

      const options = {
                        method: 'POST',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = strRequestBasePath + "/?????";

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

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.sendOrder.name;

      const strMark = "FC796E8FE6C9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result.error = error;

    }

    return result;

  }


  /*
  static async callCreateAuth( headers: any,
                               strRequestBasePath: string ): Promise<any> {

    let result = { input: null, output: null, error: null };

    try {

      const options = {
                        method: 'POST',
                        body: null, //JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = strRequestBasePath + "/auth";

      const callResult = await fetch( strRequestPath,
                                      options );  //<-- Node fetch

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

      result.error = error;
      console.log( error );

    }

    return result;

  }

  static async callDeleteAuth( headers: any,
                               strRequestBasePath: string ): Promise<any> {

    let result = { input: null, output: null, error: null };

    try {

      const options = {
                        method: 'DELETE',
                        body: null, //JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = strRequestBasePath + "/auth";

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

      result.error = error;
      console.log( error );

    }

    return result;

  }

  static async callBinarySearch( headers: any,
                                 strRequestBasePath: string,
                                 params: any ): Promise<any> {

    let result = { input: null, output: null, error: null };

    try {

      const options = {
                        method: 'GET',
                        headers: headers,
                        body: null,
                      };

      let strRequestPath = strRequestBasePath + "/search";

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

      result.error = error;
      console.log( error );

    }

    return result;

  }

  static async callBinarySearchCount( headers: any,
                                      strRequestBasePath: string,
                                      params: any ): Promise<any> {

    let result = { input: null, output: null, error: null };

    try {

      const options = {
                        method: 'GET',
                        headers: headers,
                        body: null,
                      };

      let strRequestPath = strRequestBasePath + "/search/count";

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

      result.error = error;
      console.log( error );

    }

    return result;

  }

  static async callUploadBinaryData( headers: any,
                                     strRequestBasePath: string,
                                     body: FormData ): Promise<any> {

    let result = { input: null, output: null, error: null };

    const options = {
                      method: 'POST',
                      body: body, //JSON.stringify( body ),
                      headers: headers,
                    };

    try {

      let strRequestPath = strRequestBasePath;

      const callResult = await fetch( strRequestPath,
                                      options as any );


      let jsonResult = null;

      try {

        jsonResult = await callResult.json();

      }
      catch ( error ) {


      }

      result.output = callResult ? {
                                     status: callResult.status,
                                     statusText: callResult.statusText,
                                     body: jsonResult
                                   }:
                                   {
                                    status: null,
                                    statusText: null,
                                    body: { Code: "" }
                                   };

      ( options as any ).body = body;

    }
    catch ( error ) {

      result.error = error;
      console.log( error );

    }

    result.input = options;

    return result;

  }

  static async callDownloadBinaryData( headers: any,
                                       strRequestBasePath: string,
                                       query: any ): Promise<any> {

    let result = { input: null, output: null, error: null };

    try {

      const options = {
                        method: 'GET',
                        body: null,
                        headers: headers,
                      };

      let strRequestPath = strRequestBasePath + "?id=" + query.Id + "&auth=" + headers.BinaryDataToken + "&thumbnail=" + query.Thumbnail;

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

      result.error = error;
      console.log( error );

    }

    return result;

  }

  static async callDeleteBinaryData( headers: any,
                                     strRequestBasePath: string,
                                     query: any ): Promise<any> {

    let result = { input: null, output: null, error: null };

    try {

      const options = {
                        method: 'DELETE',
                        body: null, //query, //JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = strRequestBasePath + "?id=" + query.Id;

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

      result.error = error;
      console.log( error );

    }

    return result;

  }

  static async callGetBinaryDataDetails( headers: any,
                                         strRequestBasePath: string,
                                         query: any ): Promise<any> {

    let result = { input: null, output: null, error: null };

    try {

      const options = {
                        method: 'GET',
                        body: null,
                        headers: headers,
                      };

      let strRequestPath = strRequestBasePath + "/details?id=" + query.Id;

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

      result.error = error;
      console.log( error );

    }

    return result;

  }

  static async callDisableBulkBinary( headers: any,
                                      strRequestBasePath: string,
                                      body: any ): Promise<any> {

    let result = { input: null, output: null, error: null };

    try {

      const options = {
                        method: 'PUT',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = strRequestBasePath + "/disable/bulk";

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

      result.error = error;
      console.log( error );

    }

    return result;

  }

  static async callEnableBulkBinary( headers: any,
                                     strRequestBasePath: string,
                                     body: any ): Promise<any> {

    let result = { input: null, output: null, error: null };

    try {

      const options = {
                        method: 'PUT',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = strRequestBasePath + "/enable/bulk";

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

      result.error = error;
      console.log( error );

    }

    return result;

  }

  static async callDeleteBulkBinary( headers: any,
                                     strRequestBasePath: string,
                                     body: any ): Promise<any> {

    let result = { input: null, output: null, error: null };

    try {

      const options = {
                        method: 'DELETE',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = strRequestBasePath + "/bulk";

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

      result.error = error;
      console.log( error );

    }

    return result;

  }
  */

}
