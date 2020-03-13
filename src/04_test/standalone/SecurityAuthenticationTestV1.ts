import CommonTest from "./CommonTest";


export default class SecurityAuthenticationTestV1 {

  static async test_login( headers: any,
                           userData: any,
                           strCode: string,
                           strFileName: string,
                           bIsFail: boolean ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.systemSecurityAuthenticationServiceV1.callLogin( headers,
                                                                                      userData.Name,
                                                                                      userData.Password );

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveResult( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {


        if ( bIsFail === false ) {

          const strAuthorization = result.output.body.Data[ 0 ].Authorization;

          headers.Authorization = strAuthorization;

          bResult = true;

        }
        else {

          bResult = true;

        }


      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_token( headers: any,
                           strCode: string,
                           strFileName: string ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.systemSecurityAuthenticationServiceV1.callTokenCheck( headers );

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveResult( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_logout( headers: any,
                            strCode: string,
                            strFileName: string ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.systemSecurityAuthenticationServiceV1.callLogout( headers );

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveResult( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

}