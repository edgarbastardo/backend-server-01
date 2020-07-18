//import fs from 'fs'; //Load the filesystem module
//import os from 'os'; //Load the os module

//import FormData from 'form-data';

//import CommonConstants from "../../02_system/common/CommonConstants";

//import SystemUtilities from "../../02_system/common/SystemUtilities";

import CommonTest from "./CommonTest";

export default class DatabaseTestV1 {

  static async test_search_sysUserGroups( headers: any,
                                          strCode: string,
                                          strTest: string,
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

      result.input.Test = strTest;
      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode, Test: strTest }: null;
      CommonTest.saveOutput( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          contextData[ strDatabaseDataKey ] = result.output.body.Data;

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

  static async test_search_sysPerson( headers: any,
                                      strCode: string,
                                      strFileName: string,
                                      bIsFail: boolean,
                                      strWhere: any,
                                      strDatabaseDataKey: string,
                                      contextData: any ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.databaseRequestServiceV1.callSearch( headers, {
                                                                                      Table: "sysPerson",
                                                                                      Where: strWhere
                                                                                    } );

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveOutput( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          contextData[ strDatabaseDataKey ] = result.output.body.Data;

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

  static async test_search_sysBinaryIndex( headers: any,
                                           strCode: string,
                                           strFileName: string,
                                           bIsFail: boolean,
                                           strWhere: any,
                                           strDatabaseDataKey: string,
                                           contextData: any ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.databaseRequestServiceV1.callSearch( headers, {
                                                                                      Table: "sysBinaryIndex",
                                                                                      Where: strWhere
                                                                                    } );

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveOutput( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          contextData[ strDatabaseDataKey ] = result.output.body.Data;

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

  static async test_deleteBulk( headers: any,
                                strCode: string,
                                strFileName: string,
                                bIsFail: boolean,
                                strTable: string,
                                strDatabaseDataKey: string,
                                contextData: any ): Promise<boolean> {

    let bResult = false;

    try {

      const dataToDelete = { Table: "", bulk: [] };

      const databaseData = contextData[ strDatabaseDataKey ];

      if ( databaseData.length > 0 ) {

        for ( let intIndex = 0; intIndex < databaseData.length; intIndex++ ) {

          dataToDelete.bulk.push( { where: { Id: databaseData[ intIndex ].Id } } );

        }

        dataToDelete.Table = strTable;

        const result = await CommonTest.databaseRequestServiceV1.callDeleteBulk( headers, dataToDelete );

        CommonTest.saveInput( strFileName, result.input );
        result && result.output ? result.output.expected = { Code: strCode }: null;
        CommonTest.saveOutput( strFileName, result.output );

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
      else {

        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

}
