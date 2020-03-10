
import fetch from 'node-fetch';

export class UserRequestServiceV1 {

  private strProtocol = "";
  private strHost = "";

  constructor ( strProtocol : string,
                strHost: string ) {

    this.strProtocol = strProtocol;
    this.strHost = strHost;

  }

  async callProfile( headers: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'GET',
                        headers: headers,
                        body: null,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/user/profile";

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

  async callSearchUser( headers: any,
                        params: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'GET',
                        headers: headers,
                        body: null,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/user/search";

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

  async callSearchCountUser( headers: any,
                             params: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'GET',
                        headers: headers,
                        body: null,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/user/search/count";

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

  async callChangePassword( headers: any,
                            body: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'PUT',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/user/password/change";

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

  async callCreateUser( headers: any,
                        body: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'POST',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/user";

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

  async callUpdateUser( headers: any,
                        body: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'PUT',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/user";

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

  async callDisableBulkUser( headers: any,
                             body: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'PUT',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/user/disable/bulk";

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

  async callEnableBulkUser( headers: any,
                            body: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'PUT',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/user/enable/bulk";

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

  async callMoveBulkUser( headers: any,
                          body: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'PUT',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/user/move/bulk";

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

  async callDeleteUser( headers: any,
                        query: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'DELETE',
                        body: null, //JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/user?id="+query.Id+"&shortId="+query.ShortId+"&name="+query.Name;

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

  async callDeleteBulkUser( headers: any,
                            body: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'DELETE',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/user/bulk";

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
