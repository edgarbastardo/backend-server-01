import fs from 'fs'; //Load the filesystem module
import os from 'os'; //Load the os module

import FormData from 'form-data';

import SystemUtilities from "../../02_system/common/SystemUtilities";

import CommonTest from "./CommonTest";
import CommonConstants from "../../02_system/common/CommonConstants";

export default class BinaryTestV1 {

  static async test_createAuth( headers: any,
                                strCode: string,
                                strFileName: string,
                                bIsFail: boolean ): Promise<boolean> {

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

          const strAuth = result.output.body.Data[ 0 ].Auth;

          headers.BinaryDataToken = strAuth;

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

  static async test_deleteAuth( headers: any,
                                strCode: string,
                                strFileName: string,
                                bIsFail: boolean ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.binaryRequestServiceV1.callDeleteAuth( headers );

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveResult( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          headers.BinaryDataToken = null;

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

  static async test_uploadImageTiger( headers: any,
                                      strCode: string,
                                      strFileName: string,
                                      strUploadBinaryDataKey: string,
                                      contextData: any ): Promise<boolean> {

    let bResult = false;

    try {

      //const binaryRequest = { ... binaryRequestFull }; //Copy original information
      const strPath = SystemUtilities.baseRootPath +
                      "/test/input/data/images/tiger.jpg";

      const strFileCheckSum = await SystemUtilities.getFileHash( strPath, "md5", null );

      const binaryRequest = new FormData();

      binaryRequest.append( "File", fs.createReadStream( strPath ) );
      binaryRequest.append( "AccessKind", "2" );  //1 = Public, 2 = Authenticated, 3 = Role
      binaryRequest.append( "StorageKind", "0" ); //0 = Persistent 1 = Temporal
      binaryRequest.append( "Category", "Test" );
      binaryRequest.append( "Label", "Tiger File" );
      binaryRequest.append( "Tag", "#Tiger#,#Image#,#Test#" );
      binaryRequest.append( "Context", JSON.stringify( { "MyData": "Tiger", ...contextData } ) );
      binaryRequest.append( "Comment", "A tiger image..." );

      let headersMultipart = { ...headers, ...binaryRequest.getHeaders() }; //"multipart/form-data";

      delete headersMultipart[ "Content-Type" ];

      const result = await CommonTest.binaryRequestServiceV1.callUploadBinaryData( headersMultipart, binaryRequest ); //This request must be fail

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;;
      CommonTest.saveResult( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        CommonTest.upload_binary_data[ strUploadBinaryDataKey ] = result.output.body.Data[ 0 ];
        CommonTest.upload_binary_data[ strUploadBinaryDataKey ].FileCheckSum = "md5://" + strFileCheckSum;
        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_uploadImageTower( headers: any,
                                      strCode: string,
                                      strFileName: string,
                                      strUploadBinaryDataKey: string,
                                      contextData: any ): Promise<boolean> {

    let bResult = false;

    try {

      //const binaryRequest = { ... binaryRequestFull }; //Copy original information
      const strPath = SystemUtilities.baseRootPath +
                      "/test/input/data/images/tower.jpg";

      const strFileCheckSum = await SystemUtilities.getFileHash( strPath, "md5", null );

      const binaryRequest = new FormData();

      binaryRequest.append( "File", fs.createReadStream( strPath ) );
      binaryRequest.append( "AccessKind", "2" );  //1 = Public, 2 = Authenticated, 3 = Role
      binaryRequest.append( "StorageKind", "0" ); //0 = Persistent 1 = Temporal
      binaryRequest.append( "Category", "Test" );
      binaryRequest.append( "Label", "Tower File" );
      binaryRequest.append( "Tag", "#Tower#,#Image#,#Test#" );
      binaryRequest.append( "Context", JSON.stringify( { "MyData": "Tower", ...contextData } ) );
      binaryRequest.append( "Comment", "A tower image..." );

      let headersMultipart = { ...headers, ...binaryRequest.getHeaders() }; //"multipart/form-data";

      delete headersMultipart[ "Content-Type" ];

      const result = await CommonTest.binaryRequestServiceV1.callUploadBinaryData( headersMultipart, binaryRequest ); //This request must be fail

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveResult( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        CommonTest.upload_binary_data[ strUploadBinaryDataKey ] = result.output.body.Data[ 0 ];
        CommonTest.upload_binary_data[ strUploadBinaryDataKey ].FileCheckSum = "md5://" + strFileCheckSum;
        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_uploadImageRoad( headers: any,
                                     strCode: string,
                                     strFileName: string,
                                     strUploadBinaryDataKey: string,
                                     contextData: any ): Promise<boolean> {

    let bResult = false;

    try {

      //const binaryRequest = { ... binaryRequestFull }; //Copy original information
      const strPath = SystemUtilities.baseRootPath +
                      "/test/input/data/images/road.jpg";

      const binaryRequest = new FormData();

      binaryRequest.append( "File", fs.createReadStream( strPath ) );
      binaryRequest.append( "AccessKind", "2" );  //1 = Public, 2 = Authenticated, 3 = Role
      binaryRequest.append( "StorageKind", "0" ); //0 = Persistent 1 = Temporal
      binaryRequest.append( "Category", "Test" );
      binaryRequest.append( "Label", "Road File" );
      binaryRequest.append( "Tag", "#Road#,#Image#,#Test#" );
      binaryRequest.append( "Context", JSON.stringify( { "MyData": "Road", ...contextData } ) );
      binaryRequest.append( "Comment", "A road image..." );

      let headersMultipart = { ...headers, ...binaryRequest.getHeaders() }; //"multipart/form-data";

      delete headersMultipart[ "Content-Type" ];

      const result = await CommonTest.binaryRequestServiceV1.callUploadBinaryData( headersMultipart, binaryRequest ); //This request must be fail

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveResult( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        CommonTest.upload_binary_data[ strUploadBinaryDataKey ] = result.output.body.Data[ 0 ];
        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_uploadImageCastle( headers: any,
                                       strCode: string,
                                       strFileName: string,
                                       strUploadBinaryDataKey: string,
                                       contextData: any ): Promise<boolean> {

    let bResult = false;

    try {

      //const binaryRequest = { ... binaryRequestFull }; //Copy original information
      const strPath = SystemUtilities.baseRootPath +
                      "/test/input/data/images/castle.jpg";

      const binaryRequest = new FormData();

      binaryRequest.append( "File", fs.createReadStream( strPath ) );
      binaryRequest.append( "AccessKind", "2" );  //1 = Public, 2 = Authenticated, 3 = Role
      binaryRequest.append( "StorageKind", "0" ); //0 = Persistent 1 = Temporal
      binaryRequest.append( "Category", "Test" );
      binaryRequest.append( "Label", "Castle File" );
      binaryRequest.append( "Tag", "#Castle#,#Image#,#Test#" );
      binaryRequest.append( "Context", JSON.stringify( { "MyData": "Castle", ...contextData } ) );
      binaryRequest.append( "Comment", "A castle image..." );

      let headersMultipart = { ...headers, ...binaryRequest.getHeaders() }; //"multipart/form-data";

      delete headersMultipart[ "Content-Type" ];

      const result = await CommonTest.binaryRequestServiceV1.callUploadBinaryData( headersMultipart, binaryRequest ); //This request must be fail

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveResult( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        CommonTest.upload_binary_data[ strUploadBinaryDataKey ] = result.output.body.Data[ 0 ];
        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_downloadImageThumbnail( headers: any,
                                            strCode: string,
                                            strFileName: string,
                                            strUploadBinaryDataKey: string ): Promise<boolean> {

    let bResult = false;

    try {

      const strPath = SystemUtilities.baseRootPath +
                      "/test/standalone/result/" +
                      os.hostname + "/" +
                      SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_08 ) +
                      "/data/" + strUploadBinaryDataKey + "_thumbnail";

      const result = await CommonTest.binaryRequestServiceV1.callDownloadBinaryData( headers,
                                                                                    {
                                                                                      Id: CommonTest.upload_binary_data[ strUploadBinaryDataKey ].Id,
                                                                                      Thumbnail: 1,
                                                                                      SavePath: strPath
                                                                                    } ); //This request must be success

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

  static async test_downloadImage( headers: any,
                                   strCode: string,
                                   strFileName: string,
                                   strUploadBinaryDataKey: string,
                                   strCheckSum: string ): Promise<boolean> {

    let bResult = false;

    try {

      const strPath = SystemUtilities.baseRootPath +
                      "/test/standalone/result/" +
                      os.hostname + "/" +
                      SystemUtilities.startRun.format( CommonConstants._DATE_TIME_LONG_FORMAT_08 ) +
                      "/data/" + strUploadBinaryDataKey + "_full";

      const result = await CommonTest.binaryRequestServiceV1.callDownloadBinaryData( headers,
                                                                                    {
                                                                                      Id: CommonTest.upload_binary_data[ strUploadBinaryDataKey ].Id,
                                                                                      Thumbnail: 0,
                                                                                      SavePath: strPath
                                                                                    } ); //This request must be success

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveResult( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( strCheckSum ) {

          const checkSum = strCheckSum.split( "://" );

          const strCalculatedCheckSum = await SystemUtilities.getFileHash( strPath + "/" + result.output.body.Name, checkSum[ 0 ], null );

          if ( strCalculatedCheckSum === checkSum[ 1 ] ) {

            bResult = true;

          }

        }
        else if ( CommonTest.upload_binary_data[ strUploadBinaryDataKey ].FileCheckSum ) {

          const checkSum = CommonTest.upload_binary_data[ strUploadBinaryDataKey ].FileCheckSum.split( "://" );

          const strCalculatedCheckSum = await SystemUtilities.getFileHash( strPath + "/" + result.output.body.Name, checkSum[ 0 ], null );

          if ( strCalculatedCheckSum === checkSum[ 1 ] ) {

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

  static async test_deleteImage( headers: any,
                                 strCode: string,
                                 strFileName: string,
                                 strUploadBinaryDataKey: string ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.binaryRequestServiceV1.callDeleteBinaryData( headers,
                                                                                  {
                                                                                    Id: CommonTest.upload_binary_data[ strUploadBinaryDataKey ].Id,
                                                                                  } ); //This request must be success

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

  static async test_getImageDetails( headers: any,
                                     strCode: string,
                                     strFileName: string,
                                     strUploadBinaryDataKey: string ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.binaryRequestServiceV1.callGetBinaryDataDetails( headers,
                                                                                      {
                                                                                        Id: CommonTest.upload_binary_data[ strUploadBinaryDataKey ].Id,
                                                                                      } ); //This request must be success

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

  static async test_binarySearch( headers: any,
                                  params: any,
                                  strCode: string,
                                  strFileName: string,
                                  intConditionType: number,
                                  intCount: number ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.binaryRequestServiceV1.callBinarySearch( headers,
                                                                    params );

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveResult( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

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

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_binarySearchCount( headers: any,
                                       params: any,
                                       strCode: string,
                                       strFileName: string,
                                       intConditionType: number,
                                       intCount: number ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.binaryRequestServiceV1.callBinarySearchCount( headers,
                                                                        params );

      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode }: null;
      CommonTest.saveResult( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

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

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

}