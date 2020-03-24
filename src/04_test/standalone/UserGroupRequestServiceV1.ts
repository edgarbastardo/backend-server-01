
import fetch from 'node-fetch';

export class UserGroupRequestServiceV1 {

  private strProtocol = "";
  private strHost = "";

  constructor ( strProtocol : string,
                strHost: string ) {

    this.strProtocol = strProtocol;
    this.strHost = strHost;

  }

  async callGetUserGroup( headers: any,
                          query: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'GET',
                        headers: headers,
                        body: null,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_DATA_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/usergroup";

      let strQueryParams = "";

      if ( query.Id ) {

        strQueryParams = "?id=" + query.Id;

      }

      if ( query.ShortId ) {

        if ( strQueryParams ) {

          strQueryParams = strQueryParams + "&shortId=" + query.ShortId;

        }
        else {

          strQueryParams = strQueryParams + "?shortId=" + query.ShortId;

        }

      }

      if ( query.Name ) {

        if ( strQueryParams ) {

          strQueryParams = strQueryParams + "&name=" + query.Name;

        }
        else {

          strQueryParams = strQueryParams + "?name=" + query.Name;

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

  async callSearchUserGroup( headers: any,
                             params: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'GET',
                        headers: headers,
                        body: null,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_DATA_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/usergroup/search";

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

  async callSearchCountUserGroup( headers: any,
                                  params: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'GET',
                        headers: headers,
                        body: null,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_DATA_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/usergroup/search/count";

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

  async callCreateUserGroup( headers: any,
                             body: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'POST',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_DATA_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/usergroup";

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

  async callUpdateUserGroup( headers: any,
                             body: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'PUT',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_DATA_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/usergroup";

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

  async callDisableBulkUserGroup( headers: any,
                                  body: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'PUT',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_DATA_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/usergroup/disable/bulk";

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

  async callEnableBulkUserGroup( headers: any,
                                 body: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'PUT',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_DATA_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/usergroup/enable/bulk";

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

  async call_deleteUserGroup( headers: any, query: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'DELETE',
                        body: null, //JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_DATA_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/usergroup?id="+query.Id+"&shortId="+query.ShortId+"&name="+query.Name;

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

  async callDeleteBulkUserGroup( headers: any,
                                 body: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'DELETE',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_DATA_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/usergroup/bulk";

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

  async callGetSettings( headers: any,
                         query: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'GET',
                        body: null,
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_DATA_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/usergroup/settings";

      let strQueryParams = "";

      if ( query.Id ) {

        strQueryParams = "?id=" + query.Id;

      }

      if ( query.ShortId ) {

        if ( strQueryParams ) {

          strQueryParams = strQueryParams + "&shortId=" + query.ShortId;

        }
        else {

          strQueryParams = strQueryParams + "?shortId=" + query.ShortId;

        }

      }

      if ( query.Name ) {

        if ( strQueryParams ) {

          strQueryParams = strQueryParams + "&name=" + query.Name;

        }
        else {

          strQueryParams = strQueryParams + "?name=" + query.Name;

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

      ( options as any ).body = null;

      result.input = options;

    }
    catch ( error ) {

      console.log( error );

    }

    return result;

  }

  async callSetSettings( headers: any,
                         query: any,
                         body: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'PUT',
                        body: JSON.stringify( body ),
                        headers: headers,
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.APP_SERVER_DATA_PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/usergroup/settings";

      let strQueryParams = "";

      if ( query.Id ) {

        strQueryParams = "?id=" + query.Id;

      }

      if ( query.ShortId ) {

        if ( strQueryParams ) {

          strQueryParams = strQueryParams + "&shortId=" + query.ShortId;

        }
        else {

          strQueryParams = strQueryParams + "?shortId=" + query.ShortId;

        }

      }

      if ( query.Name ) {

        if ( strQueryParams ) {

          strQueryParams = strQueryParams + "&name=" + query.Name;

        }
        else {

          strQueryParams = strQueryParams + "?name=" + query.Name;

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

      ( options as any ).body = body;

      result.input = options;

    }
    catch ( error ) {

      console.log( error );

    }

    return result;

  }

}