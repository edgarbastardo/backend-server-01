import fs from 'fs'; //Load the filesystem module
import os from 'os'; //Load the os module

import FormData from 'form-data';

import SystemUtilities from "../../02_system/common/SystemUtilities";

import CommonTest from "./CommonTest";
import CommonConstants from "../../02_system/common/CommonConstants";

export default class DatabaseTestV1 {

  static async test_search_sysUserGroups( headers: any,
                                          strCode: string,
                                          strFileName: string,
                                          bIsFail: boolean,
                                          strWhere: any,
                                          strDatabaseDataKey: string,
                                          contextData: any ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.databaseRequestServiceV1.callSearch( headers, {
                                                                                      Table: "sysUserGroup",
                                                                                      Where: strWhere
                                                                                    } );

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveResult( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          contextData[ strDatabaseDataKey ] = result.output.body.Data[ 0 ];

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

  static async test_delete( headers: any,
                            strCode: string,
                            strFileName: string,
                            bIsFail: boolean,
                            strDatabaseDataKey: string,
                            contextData: any ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.binaryRequestServiceV1.callCreateAuth( headers );

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveResult( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          contextData[ strDatabaseDataKey ] = result.output.body.Data[ 0 ];

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

}
