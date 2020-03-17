
import CommonTest from "./CommonTest";

export default class UserGroupTestV1 {

  static async test_getUserGroup( headers: any,
                                  query: any,
                                  strCode: string,
                                  strFileName: string,
                                  bIsFail: boolean ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.userGroupRequestServiceV1.callGetUserGroup( headers,
                                                                                  query );

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveOutput( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          if ( query.Name === result.output.body.Data[ 0 ].Name ) {

            bResult = true;

          }
          else if ( query.Id === result.output.body.Data[ 0 ].Id ) {

            bResult = true;

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
      CommonTest.saveOutput( strFileName, result.output );

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
      CommonTest.saveOutput( strFileName, result.output );

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
      CommonTest.saveOutput( strFileName, result.output ); //"test_deleteUserGroup_TestL01_success"

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
      CommonTest.saveOutput( strFileName, result.output );

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
      CommonTest.saveOutput( strFileName, result.output );

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

  static async test_createUserGroup_TestL55( headers: any,
                                             strCode: string,
                                             strFileName: string,
                                             bMustEmptyRole: boolean,
                                             bIsFail: boolean ): Promise<boolean> {

    let bResult = null;

    try {

      const userGroupRequest = { ... CommonTest.userGroupRequestFull }; //Copy original information

      userGroupRequest.Name = "TestL55";
      userGroupRequest.Role = "#RoleL01#";
      userGroupRequest.Tag = "#TagL01#";
      userGroupRequest.Business.Role = "#Role01#,#Role02#";    //No request create
      userGroupRequest.Business.Tag = "#Tag01#,#Tag02#,#UserGroupTestV1#";  //This group not exists

      const result = await CommonTest.userGroupRequestServiceV1.callCreateUserGroup( headers,
                                                                                     userGroupRequest );

      CommonTest.saveInput( strFileName, result.input ); //"test_createUser_user01@TestL01_fail"
      result && result.output ? result.output.expected = { Code: strCode }: null; //"ERROR_USER_GROUP_NOT_FOUND"
      CommonTest.saveOutput( strFileName, result.output ); //"test_createUser_user01@TestL01_fail"

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          if ( bMustEmptyRole ) {

            bResult = result.output.body.Data[ 0 ].Role === "" &&
                      result.output.body.Data[ 0 ].Tag === "" &&
                      result.output.body.Data[ 0 ].Business.Role === "#Role01#,#Role02#" &&
                      result.output.body.Data[ 0 ].Business.Tag === "#Tag01#,#Tag02#,#UserGroupTestV1#";

            if ( bResult ) {

              CommonTest.TestL55_data = result.output.body.Data[ 0 ];

            }

          }
          else {

            bResult = result.output.body.Data[ 0 ].Role === "#RoleL01#" &&
                      result.output.body.Data[ 0 ].Tag === "#TagL01#"; // &&
                      result.output.body.Data[ 0 ].Business.Role === "#Role01#,#Role02#" &&
                      result.output.body.Data[ 0 ].Business.Tag === "#Tag01#,#Tag02#,#UserGroupTestV1#";

            if ( bResult ) {

              CommonTest.TestL55_data = result.output.body.Data[ 0 ];

            }

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

  static async test_createUserGroup_TestL56( headers: any,
                                             strCode: string,
                                             strFileName: string,
                                             bMustEmptyRole: boolean,
                                             bIsFail: boolean ): Promise<boolean> {

    let bResult = null;

    try {

      const userGroupRequest = { ... CommonTest.userGroupRequestFull }; //Copy original information

      userGroupRequest.Name = "TestL56";
      userGroupRequest.Role = "#RoleL01#";
      userGroupRequest.Tag = "#TagL01#";
      userGroupRequest.Business.Role = "#Role01#,#Role02#";    //No request create
      userGroupRequest.Business.Tag = "#Tag01#,#Tag02#,#UserGroupTestV1#";  //This group not exists

      const result = await CommonTest.userGroupRequestServiceV1.callCreateUserGroup( headers,
                                                                                     userGroupRequest );

      CommonTest.saveInput( strFileName, result.input ); //"test_createUser_user01@TestL01_fail"
      result && result.output ? result.output.expected = { Code: strCode }: null; //"ERROR_USER_GROUP_NOT_FOUND"
      CommonTest.saveOutput( strFileName, result.output ); //"test_createUser_user01@TestL01_fail"

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          if ( bMustEmptyRole ) {

            bResult = !result.output.body.Data[ 0 ].Role &&
                      !result.output.body.Data[ 0 ].Tag &&
                      result.output.body.Data[ 0 ].Business.Role === "#Role01#,#Role02#" &&
                      result.output.body.Data[ 0 ].Business.Tag === "#Tag01#,#Tag02#,#UserGroupTestV1#";

            if ( bResult ) {

              CommonTest.TestL56_data = result.output.body.Data[ 0 ];

            }

          }
          else {

            bResult = result.output.body.Data[ 0 ].Role === "#RoleL01#" &&
                      result.output.body.Data[ 0 ].Tag === "#TagL01#" &&
                      result.output.body.Data[ 0 ].Business.Role === "#Role01#,#Role02#" &&
                      result.output.body.Data[ 0 ].Business.Tag === "#Tag01#,#Tag02#,#UserGroupTestV1#";

            if ( bResult ) {

              CommonTest.TestL56_data = result.output.body.Data[ 0 ];

            }

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

  static async test_createUserGroup_TestL57( headers: any,
                                             strCode: string,
                                             strFileName: string,
                                             bMustEmptyRole: boolean,
                                             bIsFail: boolean ): Promise<boolean> {

    let bResult = null;

    try {

      const userGroupRequest = { ... CommonTest.userGroupRequestFull }; //Copy original information

      userGroupRequest.Name = "TestL57";
      userGroupRequest.Role = "#RoleL01#";
      userGroupRequest.Tag = "#TagL01#";
      userGroupRequest.Business.Role = "#Role01#,#Role02#";    //No request create
      userGroupRequest.Business.Tag = "#Tag01#,#Tag02#,#UserGroupTestV1#";  //This group not exists

      const result = await CommonTest.userGroupRequestServiceV1.callCreateUserGroup( headers,
                                                                                     userGroupRequest );

      CommonTest.saveInput( strFileName, result.input ); //"test_createUser_user01@TestL01_fail"
      result && result.output ? result.output.expected = { Code: strCode }: null; //"ERROR_USER_GROUP_NOT_FOUND"
      CommonTest.saveOutput( strFileName, result.output ); //"test_createUser_user01@TestL01_fail"

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          if ( bMustEmptyRole ) {

            bResult = result.output.body.Data[ 0 ].Name = "TestL55" &&
                      result.output.body.Data[ 0 ].Role === "" &&
                      result.output.body.Data[ 0 ].Tag === "" &&
                      result.output.body.Data[ 0 ].Business.Role === "#Role01#,#Role02#" &&
                      result.output.body.Data[ 0 ].Business.Tag === "#Tag01#,#Tag02#,#UserGroupTestV1#";

            if ( bResult ) {

              CommonTest.TestL57_data = result.output.body.Data[ 0 ];

            }

          }
          else {

            bResult = result.output.body.Data[ 0 ].Name = "TestL55" &&
                      result.output.body.Data[ 0 ].Role === "#RoleL01#" &&
                      result.output.body.Data[ 0 ].Tag === "#TagL01#" &&
                      result.output.body.Data[ 0 ].Business.Role === "#Role01#,#Role02#" &&
                      result.output.body.Data[ 0 ].Business.Tag === "#Tag01#,#Tag02#,#UserGroupTestV1#";

            if ( bResult ) {

              CommonTest.TestL57_data = result.output.body.Data[ 0 ];

            }

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

  static async test_updateUserGroup_TestL55( headers: any,
                                             strCode: string,
                                             strFileName: string,
                                             userGroupData: any,
                                             bMustEmptyRole: boolean,
                                             bIsFail: boolean ): Promise<boolean> {

    let bResult = null;

    try {

      const userGroupRequest = { ... userGroupData }; //Copy original information

      userGroupRequest.Name = "TestL45";
      userGroupRequest.Role = "#RoleL01#,#RoleL02#";
      userGroupRequest.Tag = "#TagL01#,#TagL02#";
      userGroupRequest.Business.Role = "#Role03#,#Role04#";    //No request create
      userGroupRequest.Business.Tag = "#Tag03#,#Tag04#,#UserGroupTestV1#";  //This group not exists

      const result = await CommonTest.userGroupRequestServiceV1.callUpdateUserGroup( headers,
                                                                                     userGroupRequest );

      CommonTest.saveInput( strFileName, result.input ); //"test_createUser_user01@TestL01_fail"
      result && result.output ? result.output.expected = { Code: strCode }: null; //"ERROR_USER_GROUP_NOT_FOUND"
      CommonTest.saveOutput( strFileName, result.output ); //"test_createUser_user01@TestL01_fail"

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          if ( bMustEmptyRole ) {

            bResult = result.output.body.Data[ 0 ].Name === "TestL45" &&
                      result.output.body.Data[ 0 ].Role === "" &&
                      result.output.body.Data[ 0 ].Tag === "" &&
                      result.output.body.Data[ 0 ].Business.Role === "#Role03#,#Role04#" &&
                      result.output.body.Data[ 0 ].Business.Tag === "#Tag03#,#Tag04#,#UserGroupTestV1#";

            if ( bResult ) {

              CommonTest.TestL55_data = result.output.body.Data[ 0 ];

            }

          }
          else {

            bResult = result.output.body.Data[ 0 ].Name = "TestL55" &&
                      result.output.body.Data[ 0 ].Role === "#RoleL01#,#RoleL02#" &&
                      result.output.body.Data[ 0 ].Tag === "#TagL01#,#TagL02#" &&
                      result.output.body.Data[ 0 ].Business.Role === "#Role03#,#Role04#" &&
                      result.output.body.Data[ 0 ].Business.Tag === "#Tag03#,#Tag04#,#UserGroupTestV1#";

            if ( bResult ) {

              CommonTest.TestL55_data = result.output.body.Data[ 0 ];

            }

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

  static async test_updateUserGroup_TestL56( headers: any,
                                             strCode: string,
                                             strFileName: string,
                                             userGroupData: any,
                                             bMustEmptyRole: boolean,
                                             bIsFail: boolean ): Promise<boolean> {

    let bResult = null;

    try {

      const userGroupRequest = { ... userGroupData }; //Copy original information

      userGroupRequest.Name = "TestL46";
      userGroupRequest.Role = "#RoleL01#,#RoleL02#";
      userGroupRequest.Tag = "#TagL01#,#TagL02#";
      userGroupRequest.Business.Role = "#Role03#,#Role04#";    //No request create
      userGroupRequest.Business.Tag = "#Tag03#,#Tag04#,#UserGroupTestV1#";  //This group not exists

      const result = await CommonTest.userGroupRequestServiceV1.callUpdateUserGroup( headers,
                                                                                     userGroupRequest );

      CommonTest.saveInput( strFileName, result.input ); //"test_createUser_user01@TestL01_fail"
      result && result.output ? result.output.expected = { Code: strCode }: null; //"ERROR_USER_GROUP_NOT_FOUND"
      CommonTest.saveOutput( strFileName, result.output ); //"test_createUser_user01@TestL01_fail"

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          if ( bMustEmptyRole ) {

            bResult = result.output.body.Data[ 0 ].Name === "TestL46" &&
                      !result.output.body.Data[ 0 ].Role &&
                      !result.output.body.Data[ 0 ].Tag &&
                      result.output.body.Data[ 0 ].Business.Role === "#Role03#,#Role04#" &&
                      result.output.body.Data[ 0 ].Business.Tag === "#Tag03#,#Tag04#,#UserGroupTestV1#";

            if ( bResult ) {

              CommonTest.TestL56_data = result.output.body.Data[ 0 ];

            }

          }
          else {

            bResult = result.output.body.Data[ 0 ].Name = "TestL46" &&
                      result.output.body.Data[ 0 ].Role === "#RoleL01#,#RoleL02#" &&
                      result.output.body.Data[ 0 ].Tag === "#TagL01#,#TagL02#" &&
                      result.output.body.Data[ 0 ].Business.Role === "#Role03#,#Role04#" &&
                      result.output.body.Data[ 0 ].Business.Tag === "#Tag03#,#Tag04#,#UserGroupTestV1#";

            if ( bResult ) {

              CommonTest.TestL56_data = result.output.body.Data[ 0 ];

            }

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

  static async test_updateUserGroup_TestL57( headers: any,
                                             strCode: string,
                                             strFileName: string,
                                             userGroupData: any,
                                             bMustEmptyRole: boolean,
                                             bIsFail: boolean ): Promise<boolean> {

    let bResult = null;

    try {

      const userGroupRequest = { ... userGroupData }; //Copy original information

      userGroupRequest.Name = "TestL47";
      userGroupRequest.Role = "#RoleL01#,#RoleL02#";
      userGroupRequest.Tag = "#TagL01#,#TagL02#";
      userGroupRequest.Business.Role = "#Role03#,#Role04#";    //No request create
      userGroupRequest.Business.Tag = "#Tag03#,#Tag04#,#UserGroupTestV1#";  //This group not exists

      const result = await CommonTest.userGroupRequestServiceV1.callUpdateUserGroup( headers,
                                                                                     userGroupRequest );

      CommonTest.saveInput( strFileName, result.input ); //"test_createUser_user01@TestL01_fail"
      result && result.output ? result.output.expected = { Code: strCode }: null; //"ERROR_USER_GROUP_NOT_FOUND"
      CommonTest.saveOutput( strFileName, result.output ); //"test_createUser_user01@TestL01_fail"

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          if ( bMustEmptyRole ) {

            bResult = result.output.body.Data[ 0 ].Name === "TestL47" &&
                      result.output.body.Data[ 0 ].Role === "" &&
                      result.output.body.Data[ 0 ].Tag === "" &&
                      result.output.body.Data[ 0 ].Business.Role === "#Role03#,#Role04#" &&
                      result.output.body.Data[ 0 ].Business.Tag === "#Tag03#,#Tag04#,#UserGroupTestV1#";

            if ( bResult ) {

              CommonTest.TestL57_data = result.output.body.Data[ 0 ];

            }

          }
          else {

            bResult = result.output.body.Data[ 0 ].Name === "TestL47" &&
                      result.output.body.Data[ 0 ].Role === "#RoleL01#,#RoleL02#" &&
                      result.output.body.Data[ 0 ].Tag === "#TagL01#,#TagL02#" &&
                      result.output.body.Data[ 0 ].Business.Role === "#Role03#,#Role04#" &&
                      result.output.body.Data[ 0 ].Business.Tag === "#Tag03#,#Tag04#,#UserGroupTestV1#";

            if ( bResult ) {

              CommonTest.TestL57_data = result.output.body.Data[ 0 ];

            }

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

  static async test_disableBulkUserGroup( headers: any,
                                          userGroupData: any,
                                          strCode: string,
                                          strFileName: string,
                                          bIsFail: boolean ): Promise<boolean> {

    let bResult = false;

    try {

      let result = await CommonTest.userGroupRequestServiceV1.callDisableBulkUserGroup( headers,
                                                                                        userGroupData );

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveOutput( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        bResult = true;

        if ( bIsFail === false ) {

          for ( let intIndex = 0; intIndex < result.output.body.Data.length; intIndex++ ) {

            if ( !result.output.body.Data[ intIndex ].Details.DisabledBy ||
                 !result.output.body.Data[ intIndex ].Details.DisabledAt ) {

              bResult = false;
              break;

            }

          }

        }

      }

    }
    catch ( error ) {

      bResult = false;

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_enableBulkUserGroup( headers: any,
                                         userGroupData: any,
                                         strCode: string,
                                         strFileName: string,
                                         bIsFail: boolean ): Promise<boolean> {

    let bResult = false;

    try {

      let result = await CommonTest.userGroupRequestServiceV1.callEnableBulkUserGroup( headers,
                                                                                       userGroupData );

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveOutput( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        bResult = true;

        if ( bIsFail === false ) {

          for ( let intIndex = 0; intIndex < result.output.body.Data.length; intIndex++ ) {

            if ( result.output.body.Data[ intIndex ].Details.DisabledBy ||
                 result.output.body.Data[ intIndex ].Details.DisabledAt ) {

              bResult = false;
              break;

            }

          }

        }

      }

    }
    catch ( error ) {

      bResult = false;

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_deleteBulkUserGroup( headers: any,
                                         userData: any,
                                         strCode: string,
                                         strFileName: string,
                                         bIsFail: boolean ): Promise<boolean> {

    let bResult = false;

    try {

      let result = await CommonTest.userGroupRequestServiceV1.callDeleteBulkUserGroup( headers,
                                                                                       userData ); //This request must be fail

      CommonTest.saveInput( strFileName, result.input ); //"test_deleteUser_by_name_" +  userRequest.Name + "_fail"
      result && result.output ? result.output.expected = { Code: strCode }: null; //"ERROR_CANNOT_DELETE_USER"
      CommonTest.saveOutput( strFileName, result.output ); //"test_deleteUser_by_name_" +  userRequest.Name + "_fail"

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