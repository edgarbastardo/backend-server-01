
import fetch from 'node-fetch';

export class SystemSecurityAuthenticationServiceV1 {

  private strProtocol = "";
  private strHost = "";

  constructor ( strProtocol : string,
                strHost: string ) {

    this.strProtocol = strProtocol;
    this.strHost = strHost;

  }

  async callLogin( headers: any,
                    strUser: string,
                    strPassword: string ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const body = {
                     Username: strUser,
                     Password: strPassword
                   }

      const options = {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify( body ),
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/security/authentication/login";

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

  async callTokenCheck( headers: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'POST',
                        headers: headers,
                        body: null, //JSON.stringify( body ),
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/security/authentication/token/check";

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

  async callLogout( headers: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: 'POST',
                        headers: headers,
                        body: null, //JSON.stringify( body ),
                      };

      let strRequestPath = this.strProtocol + this.strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;

      strRequestPath = strRequestPath + "/v1/system/security/authentication/logout";

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