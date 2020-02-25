import SystemUtilities from "../../02_system/common/SystemUtilities";
import appRoot from 'app-root-path';
import CommonUtilities from "../../02_system/common/CommonUtilities";

require( 'dotenv' );

require( 'dotenv' ).config( { path: appRoot.path + "/.env.secrets" } );

test( `Test normalizeWhitespaces 001`, async () => {

  const strResult = CommonUtilities.normalizeWhitespaces( "  sirlordt@gmail.com,   tomas.moreno@gmail.com,   ninfarave@hotmail.com    " );

  expect( strResult ).toEqual( "sirlordt@gmail.com, tomas.moreno@gmail.com, ninfarave@hotmail.com" );

});

test( `Test maskEMailList 001`, async () => {

  const strResult = CommonUtilities.maskEMailList( "  sirlordt@gmail.com,   tomas.moreno@gmail.com,   ninfarave@hotmail.com    " );

  expect( strResult ).toEqual( "sir****t@gmail.com, tom********o@gmail.com, nin*****e@hotmail.com" );

});

test( `Test maskPhoneList 001`, async () => {

  const strResult = CommonUtilities.maskPhoneList( "  1-305-776-9595,   1-786-806-2188,   1-786-806-2121    " );

  expect( strResult ).toEqual( "1-305*******95, 1-786*******88, 1-786*******21" );

});

test( `Test formatPhoneNumber 001`, async () => {

  const strResult = CommonUtilities.formatPhoneNumber( "3058869192" );

  expect( strResult ).toEqual( "1-305-886-9192" );

});

test( `Test formatPhoneNumber 002`, async () => {

  const strResult = CommonUtilities.formatPhoneNumber( "8869192" );

  expect( strResult ).toEqual( "" );

});

test( `Test formatPhoneNumber 003`, async () => {

  const strResult = CommonUtilities.formatPhoneNumber( "13058869192" );

  expect( strResult ).toEqual( "1-305-886-9192" );

});

test( `Test wellFormattedPhoneNumberList 001`, async () => {

  const strResult = CommonUtilities.wellFormattedPhoneNumberList( "3058869192, 8869192, 17861239192" );

  expect( strResult ).toEqual( "1-305-886-9192,1-786-123-9192" );

});

test( `Test wellFormattedPhoneNumberList 002`, async () => {

  const strResult = CommonUtilities.wellFormattedPhoneNumberList( "3058869192" );

  expect( strResult ).toEqual( "1-305-886-9192" );

});

test( `Test wellFormattedPhoneNumberList 003`, async () => {

  const strResult = CommonUtilities.wellFormattedPhoneNumberList( "  3058869192,     er ,   , 23485  " );

  expect( strResult ).toEqual( "1-305-886-9192" );

});

test( `Test clearFormatPhoneNumberList 001`, async () => {

  const strResult = CommonUtilities.clearFormatPhoneNumberList( "1-305-886-9192,1-786-123-9192" );

  expect( strResult ).toEqual( "13058869192,17861239192" );

});

test( `Test addTag 001`, async () => {

  const strResult = CommonUtilities.addTag( "#Tag01#,#Tag02#", "#Tag03#" );

  expect( strResult ).toEqual( "#Tag01#,#Tag02#,#Tag03#" );

});

test( `Test addTag 002`, async () => {

  const strResult = CommonUtilities.addTag( "", "#Tag03#" );

  expect( strResult ).toEqual( "#Tag03#" );

});

test( `Test addTag 003`, async () => {

  const strResult = CommonUtilities.addTag( null, "#Tag03#" );

  expect( strResult ).toEqual( "#Tag03#" );

});

test( `Test removeTag 001`, async () => {

  const strResult = CommonUtilities.removeTag( "#Tag01#,#Tag02#,#Tag03#", "#Tag02#" );

  expect( strResult ).toEqual( "#Tag01#,#Tag03#" );

});

test( `Test removeTag 002`, async () => {

  const strResult = CommonUtilities.removeTag( "", "#Tag02#" );

  expect( strResult ).toEqual( "" );

});

test( `Test removeTag 003`, async () => {

  const strResult = CommonUtilities.removeTag( null, "#Tag02#" );

  expect( strResult ).toEqual( null );

});

test( `Test isValidDateInFormat01 001`, async () => {

  const bResult = CommonUtilities.isValidDateInFormat01( "2019-10-10" );

  expect( bResult ).toEqual( true );

});

test( `Test isValidDateInFormat01 002`, async () => {

  const bResult = CommonUtilities.isValidDateInFormat01( "2019-20-10" );

  expect( bResult ).toEqual( false );

});

test( `Test isValidDateInFormat01 003`, async () => {

  const bResult = CommonUtilities.isValidDateInFormat01( "19-01-10" );

  expect( bResult ).toEqual( false );

});

test( `Test isValidDateInFormat01 004`, async () => {

  const bResult = CommonUtilities.isValidDateInFormat01( "2019-01-45" );

  expect( bResult ).toEqual( false );

});