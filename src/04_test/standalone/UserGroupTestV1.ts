
import CommonTest from "./CommonTest";

export default class UserGroupTestV1 {

  static async test_searchUserGroup( headers: any,
                                     params: any,
                                     strCode: string,
                                     strFileName: string,
                                     intConditionType: number,
                                     intCount: number,
                                     bIsFail: boolean ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.userGroupRequestServiceV1.callSearchUserGroup( headers,
                                                                                    params );

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveResult( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          if ( intConditionType === 0 ) {       //<=

            bResult = result.output.body.Count <= intCount;

          }
          else if ( intConditionType === 1 ) {  //>=

            bResult = result.output.body.Count >= intCount;

          }
          else if ( intConditionType === 2 ) {  //===

            bResult = result.output.body.Count === intCount;

          }
          else if ( intConditionType === 3 ) {  //!==

            bResult = result.output.body.Count !== intCount;

          }

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

  static async test_searchCountUserGroup( headers: any,
                                          params: any,
                                          strCode: string,
                                          strFileName: string,
                                          intConditionType: number,
                                          intCount: number,
                                          bIsFail: boolean ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.userGroupRequestServiceV1.callSearchCountUserGroup( headers,
                                                                                          params );

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveResult( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          if ( intConditionType === 0 ) {       //<=

            bResult = result.output.body.Data[ 0 ].Count <= intCount;

          }
          else if ( intConditionType === 1 ) {  //>=

            bResult = result.output.body.Data[ 0 ].Count >= intCount;

          }
          else if ( intConditionType === 2 ) {  //===

            bResult = result.output.body.Data[ 0 ].Count === intCount;

          }
          else if ( intConditionType === 3 ) {  //!==

            bResult = result.output.body.Data[ 0 ].Count !== intCount;

          }

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

  static async test_deleteUserGroup( headers: any,
                                     groupData: any,
                                     strCode: string,
                                     strFileName: string ): Promise<boolean> {

    let bResult = false;

    try {

      let userGroupRequest = {} as any;

      if ( groupData.Id ) {

        userGroupRequest.Id = groupData.Id;

      }
      else {

        userGroupRequest.Name = groupData.Name //"TestL01";

      }

      let result = await CommonTest.userGroupRequestServiceV1.call_deleteUserGroup( headers,
                                                                                    userGroupRequest ); //This request must be success

      CommonTest.saveInput( strFileName, result.input ); //"test_deleteUserGroup_TestL01_success"
      result && result.output ? result.output.expected = { Code: strCode }: null; //"SUCCESS_USER_GROUP_DELETE"
      CommonTest.saveResult( strFileName, result.output ); //"test_deleteUserGroup_TestL01_success"

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) { //"SUCCESS_USER_GROUP_DELETE"

        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_getSettings( headers: any,
                                 query: any,
                                 strCode: string,
                                 strFileName: string,
                                 keyList: string[],
                                 valueList: string[] ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.userGroupRequestServiceV1.callGetSettings( headers,
                                                                                 query );

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveResult( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( keyList && valueList ) {

          let bFailValue = false;

          for ( let intIndex = 0; intIndex < keyList.length; intIndex++ ) {

            if ( result.output.body.Data[ 0 ][ keyList[ intIndex ] ] !== valueList[ intIndex ] ) {

              bFailValue = true;
              break;

            }

          }

          bResult = !bFailValue;

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

  static async test_setSettings( headers: any,
                                 query: any,
                                 body: any,
                                 strCode: string,
                                 strFileName: string,
                                 keyList: string[],
                                 valueList: string[],
                                 bIsFail: boolean ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.userGroupRequestServiceV1.callSetSettings( headers,
                                                                                 query,
                                                                                 body );

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveResult( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail ) {

          if ( keyList && valueList ) {

            let bFailValue = false;

            for ( let intIndex = 0; intIndex < keyList.length; intIndex++ ) {

              if ( result.output.body.Data[ 0 ][ keyList[ intIndex ] ] !== valueList[ intIndex ] ) {

                bFailValue = true;
                break;

              }

            }

            bResult = !bFailValue;

          }

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