import SystemUtilities from "./SystemUtilities";
import appRoot from 'app-root-path';
import CommonUtilities from "./CommonUtilities";

require( 'dotenv' );

require( 'dotenv' ).config( { path: appRoot.path + "/.env.secrets" } );

test( `Test normalizeWhitespaces 001`, async () => {

  const strResult = CommonUtilities.normalizeWhitespaces( "  sirlordt@gmail.com,   tomas.moreno@gmail.com,   ninfarave@hotmail.com    " );

  expect( strResult ).toMatch( "sirlordt@gmail.com, tomas.moreno@gmail.com, ninfarave@hotmail.com" );

});

test( `Test maskEMailList 001`, async () => {

  const strResult = CommonUtilities.maskEMailList( "  sirlordt@gmail.com,   tomas.moreno@gmail.com,   ninfarave@hotmail.com    " );

  expect( strResult ).toMatch( "sir****t@gmail.com, tom********o@gmail.com, nin*****e@hotmail.com" );

});

test( `Test maskPhoneList 001`, async () => {

  const strResult = CommonUtilities.maskPhoneList( "  1-305-776-9595,   1-786-806-2188,   1-786-806-2121    " );

  expect( strResult ).toMatch( "1-305*******95, 1-786*******88, 1-786*******21" );

});

test( `Test formatPhoneNumber 001`, async () => {

  const strResult = CommonUtilities.formatPhoneNumber( "3058869192" );

  expect( strResult ).toMatch( "1-305-886-9192" );

});

test( `Test formatPhoneNumber 002`, async () => {

  const strResult = CommonUtilities.formatPhoneNumber( "8869192" );

  expect( strResult ).toMatch( "" );

});

test( `Test formatPhoneNumber 003`, async () => {

  const strResult = CommonUtilities.formatPhoneNumber( "13058869192" );

  expect( strResult ).toMatch( "1-305-886-9192" );

});

test( `Test wellFormatedPhoneNumberList 001`, async () => {

  const strResult = CommonUtilities.wellFormatedPhoneNumberList( "3058869192, 8869192, 17861239192" );

  expect( strResult ).toMatch( "1-305-886-9192,1-786-123-9192" );

});

test( `Test wellFormatedPhoneNumberList 002`, async () => {

  const strResult = CommonUtilities.wellFormatedPhoneNumberList( "3058869192" );

  expect( strResult ).toMatch( "1-305-886-9192" );

});

test( `Test wellFormatedPhoneNumberList 003`, async () => {

  const strResult = CommonUtilities.wellFormatedPhoneNumberList( "  3058869192,     er ,   , 23485  " );

  expect( strResult ).toMatch( "1-305-886-9192" );

});

test( `Test clearFormatPhoneNumberList 001`, async () => {

  const strResult = CommonUtilities.clearFormatPhoneNumberList( "1-305-886-9192,1-786-123-9192" );

  expect( strResult ).toMatch( "13058869192,17861239192" );

});