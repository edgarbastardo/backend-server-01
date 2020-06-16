import cluster from 'cluster';
import path from 'path';

import { AccessKind, HTTPMethod } from "./CommonConstants";

const debug = require( 'debug' )( 'CommonUtilities' );

export default class CommonUtilities {

  static msleep( n: number ) {

    Atomics.wait( new Int32Array( new SharedArrayBuffer( 4 ) ), 0, 0, n );

  }

  static sleep( n: number ) {

    CommonUtilities.msleep( n * 1000 );

  }

  static isNotNullOrEmpty( value: any ): boolean {

    let bResult: boolean = false;

    if ( value !== null &&
         value !== undefined &&
         ( ( ( typeof value ) !== "string" || value.trim() !== "" ) &&
           ( Array.isArray( value ) === false || value.length > 0 ) &&
           ( ( typeof value ) !== "object" || Object.keys( value ).length > 0 ) ) ) {

      bResult = true;

    }

    return bResult;

  }

  static isNullOrEmpty( value: any ): boolean {

    let bResult: boolean = false;

    if ( value === null ||
         value === undefined ||
         ( ( ( typeof value ) === "string" && value.trim() === "" ) ||
           ( Array.isArray( value ) && value.length === 0 ) ||
           ( ( typeof value ) === "object" && Object.keys( value ).length === 0 ) ) ) {

      bResult = true;

    }

    return bResult;

  }

  static getAccessKindFromString( strAccessKind: string ): AccessKind {

    let result: AccessKind;

    strAccessKind = strAccessKind.toLocaleLowerCase();

    if ( strAccessKind === "public" ) {

      result = AccessKind.Public;

    }
    else if ( strAccessKind === "authenticated" ) {

      result = AccessKind.Authenticated;

    }
    else if ( strAccessKind === "role" ) {

      result = AccessKind.Role;

    }

    return result;

  }

  static getAccessKindFromNumber( intAccessKind: number ): string {

    let strResult: string;

    if ( intAccessKind === 1 ) {

      strResult = "Public";

    }
    else if ( intAccessKind === 2 ) {

      strResult = "Authenticated";

    }
    else if ( intAccessKind === 3 ) {

      strResult = "Role";

    }

    return strResult;

  }

  static getRequestKindFromString( strHTTPMethod: string ): number {

    let result: number;

    strHTTPMethod = strHTTPMethod.toLocaleLowerCase();

    if ( strHTTPMethod === "get" ) {

      result = 1;

    }
    else if ( strHTTPMethod === "post" ) {

      result = 2;

    }
    else if ( strHTTPMethod === "put" ) {

      result = 3;

    }
    else if ( strHTTPMethod === "delete" ) {

      result = 4;

    }

    return result;

  }

  static getRequestKindFromNumber( intRequestKind: number ): string {

    let strResult: string;

    if ( intRequestKind === 1 ) {

      strResult = "Get";

    }
    else if ( intRequestKind === 2 ) {

      strResult = "Post";

    }
    else if ( intRequestKind === 3 ) {

      strResult = "Put";

    }
    else if ( intRequestKind === 4 ) {

      strResult = "Delete";

    }

    return strResult;

  }

  static getActionFromNumber( intAction: number ): string {

    let strResult: string;

    if ( intAction === 1 ) {

      strResult = "Get";

    }
    else if ( intAction === 2 ) {

      strResult = "Create";

    }
    else if ( intAction === 3 ) {

      strResult = "Update";

    }
    else if ( intAction === 4 ) {

      strResult = "Delete";

    }

    return strResult;

  }

  static getActionFromString( strAction: string ): number {

    let intResult: number;

    strAction = strAction.toLocaleLowerCase();

    if ( strAction === "Get" ) {

      intResult = 1;

    }
    else if ( strAction === "Create" ) {

      intResult = 2;

    }
    else if ( strAction === "Update" ) {

      intResult = 3;

    }
    else if ( strAction === "Delete" ) {

      intResult = 4;

    }

    return intResult;

  }

  static getHTTPMethodFromString( strHTTPMethod: string ): HTTPMethod {

    let result: HTTPMethod;

    strHTTPMethod = strHTTPMethod.toLocaleLowerCase();

    if ( strHTTPMethod === "get" ) {

      result = HTTPMethod.Get;

    }
    else if ( strHTTPMethod === "post" ) {

      result = HTTPMethod.Post;

    }
    else if ( strHTTPMethod === "put" ) {

      result = HTTPMethod.Put;

    }
    else if ( strHTTPMethod === "delete" ) {

      result = HTTPMethod.Delete;

    }

    return result;

  }

  static getStringFromHttpMethod( httpMethod: HTTPMethod ): string {

    let strResult: string;

    if ( httpMethod === HTTPMethod.Get ) {

      strResult = "get";

    }
    else if ( httpMethod === HTTPMethod.Post ) {

      strResult = "post";

    }
    else if ( httpMethod === HTTPMethod.Put ) {

      strResult = "put";

    }
    else if ( httpMethod === HTTPMethod.Delete ) {

      strResult = "delete";

    }

    return strResult;

  }

  static isValidTimeZone( tz: any ) {

    let bResult = false;

    try {

      if ( !Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone ) {

        throw 'Time zones are not available in this environment';

      }

      if ( tz ) {

        Intl.DateTimeFormat( undefined, { timeZone:  tz } ).format( new Date() );
        //let debugMark = debug.extend( '39AE8190588D' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
        //debugMark( "Valid!!" );
        bResult = true;

      }

    }
    catch ( error ) {

      //let debugMark = debug.extend( 'BDA1708B1AAE' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
      //debugMark( "Invalid!!" );
      //return false;

    }

    return bResult;

  }

  static getCurrentTimeZoneId(): string {

    let strResult = "";

    if ( CommonUtilities.isNotNullOrEmpty( process.env.TZ ) &&
         CommonUtilities.isValidTimeZone( process.env.TZ ) ) {

      strResult = process.env.TZ;

    }
    else {

      strResult = Intl && Intl.DateTimeFormat().resolvedOptions().timeZone;

    }

    return strResult;

  }

  static getCurrentLanguage(): string {

    let strResult = "";

    if ( CommonUtilities.isNotNullOrEmpty( process.env.LANG ) ) {

      strResult = process.env.LANG;

    }
    else {

      strResult = "en_US"; //English of USA

    }

    return strResult;

  }

  static async asyncForEach( array: [],
                             callback: any ) {

    for ( let index = 0; index < array.length; index++ ) {

      await callback( array[ index ], index, array );

    }

  }

  static checkObjectWithFunctionDefined( objectToTest: any,
                                         functionName: string ): boolean {

    let bResult = false;

    if ( this.isNotNullOrEmpty( objectToTest ) &&
         typeof objectToTest[ functionName ] === 'function' ) {

      bResult = true;

    }

    return bResult;

  }

  static getSourceCodePosition( intFormat: number = 0 ): any {

    /*
    Error:
      at Function.getSourceCodePosition (/home/dsistemas/Escritorio/Node_JS/26-10-2019/backend-server-01/src/system/common/common.utilities.ts:190:21)
      at /home/dsistemas/Escritorio/Node_JS/26-10-2019/backend-server-01/src/server.ts:76:34
      at Generator.next (<anonymous>)
      at fulfilled (/home/dsistemas/Escritorio/Node_JS/26-10-2019/backend-server-01/src/server.ts:5:58)
    */
    let result = null;

    //let strMethodName = "";
    let strFile = "";
    let strFunctionName: string = null;
    let intLine = -1;
    let intColumn = -1;

    try {

      const stack = new Error().stack;

      //let debugMark = debug.extend( 'B4FC6014F2E3' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
      //debugMark( "%O", stack );

      // package.json => build: --async-stack-trace node build/server.js And tsconfig.json => "target": "es2018"
      const strPosition = stack.split( "\n" )[ 2 ].split( ":" );

      strFile = strPosition[ 0 ].trim();

      if ( strFile.indexOf( "(" ) !== -1 ) {

        strFunctionName = strFile.substr( 0, strFile.indexOf( "(" ) - 1 );

        if ( strFunctionName.startsWith( "at" ) ) {

          strFunctionName = strFunctionName.replace( "at", "" ).trim();

        }

        strFile = strFile.substr( strFile.indexOf( "(" ) + 1 );

      }
      else {

        strFunctionName = strFile.substr( 0, strFile.indexOf( "at" ) - 1 );
        strFile = strFile.substr( strFile.indexOf( "at " ) + 3 ).trim();

      }

      if ( strPosition.length >= 1 ) {

        intLine = parseInt( strPosition[ 1 ] );

      }

      if ( strPosition.length >= 2 ) {

        intColumn = parseInt( strPosition[ 2 ] );

      }

    }
    catch ( error ) {

      const strMark = "F0FCDAA2D175" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );

    }

    if ( intFormat === 0 ) {

      const strFuncName = strFunctionName ? strFunctionName + ":" : "";

      result = `${strFile}:${strFuncName}${intLine}:${intColumn}`;

    }
    else {

      result = {
                 file: strFile,
                 line: intLine,
                 column: intColumn,
                 function: strFunctionName ? strFunctionName: "Unknown"
               };

    }

    return result;

  }

  static formatErrorStack( stack: string ): string[] {

    let result = [];

    try {

      result = stack.split( "at " ); //.splice( 0, 1 );

      result.splice( 0, 1 );

    }
    catch ( error ) {


    }

    return result;

  }

  static deleteObjectFields( dataObject: any, fieldNamesToRemove: string[], logger: any ): any {

    let result = dataObject;

    try {

      if ( CommonUtilities.isNotNullOrEmpty( dataObject ) ) {

        result = Object.assign( {}, dataObject );

        fieldNamesToRemove.forEach( ( strFieldName: string, intIndex: number ) => {

          delete result[ strFieldName ];

        } );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.deleteObjectFields.name;

      const strMark = "1DFC6EF03869" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      //error.logId = SystemUtilities.getUUIDv4(); //Circular reference not allowed and not like import the uuid library dependence

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return result;

  }

  static parseJSON( strJSONToParse: string, logger: any ): any {

    let result = {}; //Safe empty object

    try {

      result = JSON.parse( strJSONToParse );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.parseJSON.name;

      const strMark = "D72A94FD3E4B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      //error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return result;

  }

  static jsonToString( jsonToString: any, logger: any ): string {

    let strResult = null;

    try {

      strResult = JSON.stringify( jsonToString );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.parseJSON.name;

      const strMark = "5F6F9C6E5A03" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      //error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return strResult;

  }

  static parseArray( strListToParse: string = "", logger: any ): any {

    let result = []; //Safe empty array

    try {

      result = strListToParse !== null ? strListToParse.split( "," ) : [];

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.parseArray.name;

      const strMark = "76DCD9E795FB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      //error.logId = SystemUtilities.getUUIDv4(); //Circular reference not allowed and not like import the uuid library dependence

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return result;

  }

  static isInMultiSimpleList( strList1: string,
                              strDivisor: string,
                              strList2: string,
                              bSensibleCase: boolean,
                              logger: any ): boolean {

    let bResult = false;

    try {

      if ( CommonUtilities.isNotNullOrEmpty( strList1 ) &&
           CommonUtilities.isNotNullOrEmpty( strList2 ) ) {

        const strLocalList1 = bSensibleCase === false ? strList1.toLowerCase() : strList1;

        const list2 = bSensibleCase === false ? strList2.toLowerCase().split( strDivisor ) : strList2.split( strDivisor );

        for ( let strItem of list2 ) {

          if ( strLocalList1.includes( strItem ) ) {

            bResult = true;
            break;

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.isInMultiSimpleList.name;

      const strMark = "94B310399AF5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      //error.logId = SystemUtilities.getUUIDv4(); //Circular reference not allowed and not like import the uuid library dependence

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return bResult;

  }

  static isInList( list1: string[],
                   list2: string[],
                   logger: any ): boolean {

    let bResult = false;

    try {

      if ( CommonUtilities.isNotNullOrEmpty( list1 ) &&
           CommonUtilities.isNotNullOrEmpty( list2 ) ) {

        for ( let strItem of list1 ) {

          if ( list2.includes( strItem ) ) {

            bResult = true;
            break;

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.isInList.name;

      const strMark = "4AB0242741A9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      //error.logId = SystemUtilities.getUUIDv4(); //Circular reference not allowed and not like import the uuid library dependence

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return bResult;

  }

  static clearSpecialChars( data: string, strSpecialChars = `!@#$^&%*()+=-[]\/\\{}|:<>?,."'_` ): string {

    let result = data;

    try {

      for ( let i = 0; i < strSpecialChars.length; i++ ) {

        result = result.replace( new RegExp( "\\" + strSpecialChars[ i ], "gi" ), "" );

      }

    }
    catch ( error ) {


    }

    return result;

  }

  static unaccent( src: string ): string {

    let s: string = src; //"À,Á,Â,Ä,È,É,Ê,Ë,Ì,Í,Î,Ï,Ò,Ó,Ô,Ö,Ù,Ú,Û,Ü,à,á,â,ä,è,é,ê,ë,ì,í,î,ï,ò,ó,ô,ö,ù,ú,û,ü";

    try {

      s = s.replace( new RegExp( "[àáâä]", "g" ), "a" );
      s = s.replace( new RegExp( "[èéêë]", "g" ), "e" );
      s = s.replace( new RegExp( "[ìíîï]", "g" ), "i" );
      s = s.replace( new RegExp( "[òóôö]", "g" ), "o" );
      s = s.replace( new RegExp( "[ùúûü]", "g" ), "u" );

      s = s.replace( new RegExp( "[ÀÁÂÄ]", "g" ), "A" );
      s = s.replace( new RegExp( "[ÈÉÊË]", "g" ), "E" );
      s = s.replace( new RegExp( "[ÌÍÎÏ]", "g" ), "I" );
      s = s.replace( new RegExp( "[ÒÓÔÖ]", "g" ), "O" );
      s = s.replace( new RegExp( "[ÙÚÛÜ]", "g" ), "U" );

    }
    catch ( error ) {


    }

    return s;

  }

  static getFileExtension( strFileName: string ): string {

    return path.extname( strFileName );

  }

  static countLowerCasePositions( strWord: string ): number {

    let intResult = -1;

    try {

      if ( strWord ) {

        intResult = ( strWord.match(/[a-z]/g) || [] ).length;

      }

    }
    catch ( error ) {


    }

    return intResult;

  }

  static countUpperCasePositions( strWord: string ): number {

    let intResult = -1;

    try {

      if ( strWord ) {

        intResult = ( strWord.match(/[A-Z]/g) || [] ).length;

      }

    }
    catch ( error ) {


    }

    return intResult;

  }

  static countDigitPositions( strWord: string ): number {

    let intResult = -1;

    try {

      if ( strWord ) {

        intResult = ( strWord.match(/[0-9]/g) || [] ).length;

      }

    }
    catch ( error ) {


    }

    return intResult;

  }

  static countSymbolPositions( strWord: string, strSymbols: string ): number {

    let intResult = -1;

    try {

      if ( strWord ) {

        let intCount = 0;

        strSymbols = !strSymbols ? "#$%&()[]{}=-_:.¿?*@|¡!*+/\\;,": strSymbols;

        for ( let intPosition = 0; intPosition < strWord.length; intPosition++ ) {

          if ( strSymbols.includes( strWord.charAt( intPosition ) ) ) {

            intCount += 1;

          }

        }

        intResult = intCount;

      }

    }
    catch ( error ) {


    }

    return intResult;

  }

  static toLowerCase( data: string ): string {

    let strResult = "";

    try {

      if ( data ) {

        strResult = data.toLowerCase();

      }

    }
    catch ( error ) {


    }

    return strResult;

  }

  static toUpperCase( data: string ): string {

    let strResult = "";

    try {

      if ( data ) {

        strResult = data.toUpperCase();

      }

    }
    catch ( error ) {


    }

    return strResult;

  }

  public static isValidPhoneNumber( strPhone: string ): boolean {

    let bResult = false;

    try {

      const matchResult = strPhone.match( /(\d{1,3}-)?(\d{3}-){2}\d{4}/g );

      bResult = matchResult && matchResult.length === 1;

    }
    catch ( error ) {

      //

    }

    return bResult;

  }

  public static isValidPhoneNumberList( strPhoneList: string ): boolean {

    let bResult = false;

    try {

      const valueList = strPhoneList ? strPhoneList.split( "," ): [];

      for ( let strCurrentValue of valueList ) {

        const matchResult = strCurrentValue.trim().match( /(\d{1,3}-)?(\d{3}-){2}\d{4}/g ); ///^\d{3}-\d{3}-\d{4}$/g );

        bResult = matchResult && matchResult.length === 1;

        if ( bResult === false ) {

          break;

        }

      }

    }
    catch ( error ) {

      //

    }

    return bResult;

  }

  public static clearFormatPhoneNumberList( strPhoneList: string ): string {

    let strResult = strPhoneList;

    try {

      let clearFormattedPhoneList = [];

      const phoneList = strPhoneList.split( "," );

      for ( const strPhone of phoneList ) {

        if ( strPhone ) {

          const strPhoneTrimed = strPhone.trim();

          if ( strPhoneTrimed ) {

            clearFormattedPhoneList.push( strPhoneTrimed.trim().replace( /\-/g, "" ) );

          }

        }

      }

      strResult = clearFormattedPhoneList.join( "," );

    }
    catch ( error ) {

      //

    }

    return strResult;

  }

  public static formatPhoneNumber( strPhoneNumber: string ): string {

    let strResult = "";

    try {

      const strCleaned = ( '' + strPhoneNumber ).replace( /\D/g, '' );

      const match = strCleaned.match( /^(\d{1,3})?(\d{3})(\d{3})(\d{4})$/ );
      //const match = strCleaned.match( /(\d{1,3}-)?(\d{3}-){2}\d{4}/g );
      //const match = strCleaned.match( /^(1|)?(\d{3})(\d{3})(\d{4})$/ );

      if ( match ) {

        const strInternationalCode = ( !match[ 1 ] ? '1' : match[ 1 ] );

        strResult = [ strInternationalCode, '-', match[ 2 ], '-', match[ 3 ], '-', match[ 4 ] ].join( '' );

      }

    }
    catch ( error ) {

      //

    }

    return strResult;

  }

  public static wellFormattedPhoneNumberList( strPhoneList: string ): string {

    let strResult = strPhoneList;

    try {

      let wellFormattedPhoneList = [];

      const phoneList = strPhoneList.split( "," );

      for ( const strPhone of phoneList ) {

        if ( strPhone ) {

          const strPhoneFormatted = CommonUtilities.formatPhoneNumber( strPhone.trim() );

          if ( strPhoneFormatted ) {

            wellFormattedPhoneList.push( strPhoneFormatted );

          }

        }

      }

      strResult = wellFormattedPhoneList.join( "," );

    }
    catch ( error ) {

      //

    }

    return strResult;

  }

  public static isValidEMail( strEMail: string ): boolean {

    let bResult = false;

    try {

      const matchResult = strEMail.match( /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/g );

      bResult = matchResult && matchResult.length === 1;

    }
    catch ( error ) {

      //

    }

    return bResult;

  }

  public static isValidEMailList( strEMailList: string ): boolean {

    let bResult = false;

    try {

      const valueList = strEMailList ? strEMailList.split( "," ): [];

      for ( let strCurrentValue of valueList ) {

        const matchResult = strCurrentValue.trim().match( /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/g );

        bResult = matchResult && matchResult.length === 1;

        if ( bResult === false ) {

          break;

        }

      }

    }
    catch ( error ) {

      //

    }

    return bResult;

  }

  public static normalizeWhitespaces( strValue: string ): string {

    let strResult = "";

    try {

      // Replace all whitespace blocks with single spaces.
      strResult = strValue != null ? strValue.trim().replace( / +/g, " " ) : "";

    }
    catch ( error ) {


    }

    return strResult;

  }

  public static formatTitle( strValue: string ): string {

    let result = [];

    try {

      let strValueNormalized = this.normalizeWhitespaces( strValue );

      const wordList = strValueNormalized.toLowerCase().split( " " );

      for ( let intWordIndex = 0; intWordIndex < wordList.length; intWordIndex++ ) {

        let strWord = wordList[ intWordIndex ][ 0 ].toUpperCase() + wordList[ intWordIndex ].slice( 1 );

        result.push( strWord );

      }

    }
    catch ( error ) {

      //

    }

    return result.join( " " );

    //return strValue != null ? strValue.trim().replace( / +/g, " " ) : "";

  }

  public static maskEMailList( strEMail: string ): string {

    let strResult = "";

    if ( strEMail ) {

      const emailList = strEMail.split( "," );

      for ( let intIndex = 0; intIndex < emailList.length; intIndex++ ) {

          let strCurrentEmail = emailList[ intIndex ].trim();

          if ( strCurrentEmail != null && strCurrentEmail.includes( " " ) ) {

            strCurrentEmail = this.normalizeWhitespaces( strCurrentEmail ).split( " " )[ 0 ]; //Asumme the format "sirlordt@gmail.com Name"

          }

          if ( this.isValidEMail( strCurrentEmail ) ) {

            strResult = strResult + ", " + strCurrentEmail.replace( /(?<=.{3}).(?=[^@]*?.@)/g, "*" );

          }

      }

      strResult = strResult.substring( 2 );

    }

    return strResult;

  }

  public static replaceRange( strExpression: string,
                              intStart: number,
                              intEnd: number,
                              strSubstitute: string ): string {

    return strExpression.substring( 0, intStart ) +
           strSubstitute +
           strExpression.substring( intEnd );

  }

  public static maskPhoneList( strPhone: string ): string {

    let strResult = "";

    if ( strPhone ) {

      const phoneList = strPhone.split( "," );

      for ( let intIndex = 0; intIndex < phoneList.length; intIndex++ ) {

          let strCurrentPhone = phoneList[ intIndex ].trim();

          if ( strCurrentPhone != null && strCurrentPhone.includes( " " ) ) {

            strCurrentPhone = this.normalizeWhitespaces( strCurrentPhone ).split( " " )[ 0 ]; //Asumme the format "sirlordt@gmail.com Name"

          }

          if ( this.isValidPhoneNumber( strCurrentPhone ) ) {

            strResult = strResult + ", " + this.replaceRange( strCurrentPhone,
                                                              5,
                                                              strCurrentPhone.length - 2,
                                                              "*".repeat( strCurrentPhone.length - 7 ) );

          }

      }

      strResult = strResult.substring( 2 );

    }

    return strResult;

  }

  public static maskPassword( strPassword: string ): string {

    let strResult = "";

    if ( strPassword ) {

      strResult = this.replaceRange( strPassword,
                                     2,
                                     strPassword.length - 2,
                                     "*".repeat( strPassword.length - 4 ) );

    }

    return strResult;

  }

  public static trimArray( array: string[] ): string[] {

    let result = [];

    try {

      for ( const strItem of array ) {

        result.push( strItem.trim() );

      }

    }
    catch ( error ) {

      //

    }

    return result;

  }

  public static trimArrayFromString( strArray: string ): string[] {

    let result = [];

    try {

      const temp = strArray.split( "," );

      for ( const strItem of temp ) {

        result.push( strItem.trim() );

      }

    }
    catch ( error ) {

      //

    }

    return result;

  }

  public static addTag( strCurrentTagList: string, strTag: string ): string {

    let strResult = strCurrentTagList;

    try {

      if ( !strCurrentTagList ) {

        strResult = strTag;

      }
      else if ( strCurrentTagList.includes( strTag ) === false ) {

        strResult = strCurrentTagList + "," + strTag;

      }

    }
    catch ( error ) {

      //

    }

    return strResult;

  }

  public static removeTag( strCurrentTagList: string, strTag: string ): string {

    let strResult = strCurrentTagList;

    try {

      if ( strCurrentTagList && strCurrentTagList.includes( strTag ) ) {

        const regExp1 = new RegExp( `${strTag}(,)?`, "g" );
        const regExp2 = new RegExp( `(,)?${strTag}`, "g" );

        strResult = strCurrentTagList.replace( regExp1, "" );
        strResult = strResult.replace( regExp2, "" );

      }

    }
    catch ( error ) {

      //

    }

    return strResult;

  }

  public static getSubTagFromComposeTag( strTagList: string, strTag: string ): string[] {

    let result = [];

    try {

      const tagList = strTagList.split( "," );

      for ( const strCurrentTag of tagList ) {

        if ( strCurrentTag.startsWith( strTag ) ) {

          const subTagList = CommonUtilities.trimArray( strCurrentTag.split( "+" ) );

          if ( subTagList ) {

            result = subTagList;

          }

        }

      }

    }
    catch ( error ) {


    }

    return result;

  }

  public static tranformTagListToWhere( tagList: string[],
                                        strPrefix: string,
                                        strLogicOperator: string ): string {

    let strResult = "";

    try {

      for ( const strCurrentTag of tagList ) {

        if ( strCurrentTag.startsWith( "#GId:" ) ) {

          if ( !strResult ) {

            strResult = strPrefix + ".Id = '" + strCurrentTag.replace( "#GId:", "" ).replace( "#", "'" );

          }
          else {

            strResult = strResult + strLogicOperator + " " + strPrefix + ".Id = '" + strCurrentTag.replace( "#GId:", "" ).replace( "#", "'" );

          }

        }
        else if ( strCurrentTag.startsWith( "#UId:" ) ) {

          if ( !strResult ) {

            strResult = strPrefix + ".Id = '" + strCurrentTag.replace( "#UId:", "" ).replace( "#", "'" );

          }
          else {

            strResult = strResult + strLogicOperator + " " + strPrefix + ".Id = '" + strCurrentTag.replace( "#UId:", "" ).replace( "#", "'" );

          }

        }
        else if ( strCurrentTag.startsWith( "#GName:" ) ) {

          if ( !strResult ) {

            strResult = strPrefix + ".Name = '" + strCurrentTag.replace( "#GName:", "" ).replace( "#", "'" );

          }
          else {

            strResult = strResult + strLogicOperator + " " + strPrefix + ".Name = '" + strCurrentTag.replace( "#GName:", "" ).replace( "#", "'" );

          }

        }
        else if ( strCurrentTag.startsWith( "#UName:" ) ) {

          if ( !strResult ) {

            strResult = strPrefix + ".Name = '" + strCurrentTag.replace( "#UName:", "" ).replace( "#", "'" );

          }
          else {

            strResult = strResult + strLogicOperator + " " + strPrefix + ".Name = '" + strCurrentTag.replace( "#UName:", "" ).replace( "#", "'" );

          }

        }
        else if ( strCurrentTag.startsWith( "#GSId:" ) ) {

          if ( !strResult ) {

            strResult = strPrefix + ".ShortId = '" + strCurrentTag.replace( "#GSId:", "" ).replace( "#", "'" );

          }
          else {

            strResult = strResult  + strLogicOperator + " " + strPrefix + ".ShortId = '" + strCurrentTag.replace( "#GSId:", "" ).replace( "#", "'" );

          }

        }
        else if ( strCurrentTag.startsWith( "#USId:" ) ) {

          if ( !strResult ) {

            strResult = strPrefix + ".ShortId = '" + strCurrentTag.replace( "#USId:", "" ).replace( "#", "'" );

          }
          else {

            strResult = strResult  + strLogicOperator + " " + strPrefix + ".ShortId = '" + strCurrentTag.replace( "#USId:", "" ).replace( "#", "'" );

          }

        }

      }

      if ( strResult ) {

        strResult = "( " + strResult + " )";

      }

    }
    catch ( error ) {

      //

    }

    return strResult;

  }

  public static isValidDateInFormat01( strDate: string ): boolean {

    let bResult = false;

    try {

      const regExp = /^\d{4}-\d{2}-\d{2}$/;

      if ( strDate.match( regExp ) ) {

        const date = new Date( strDate );

        const dateAsNum = date.getTime();

        if ( dateAsNum && isNaN( dateAsNum ) === false ) {

          bResult = date.toISOString().slice( 0,10 ) === strDate;

        }

      }

    }
    catch ( error ) {

      //

    }

    return bResult;

  }

  public static getFirstLetters( strExpresion: string ): string[] {

    let result = [];

    try {

      const words = CommonUtilities.normalizeWhitespaces( strExpresion ).split( " " );

      for ( const strWord of words ) {

        result.push( strWord.charAt( 0 ) );

      }

    }
    catch ( error ) {

      //

    }

    return result;

  }

}
