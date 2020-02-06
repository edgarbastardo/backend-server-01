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