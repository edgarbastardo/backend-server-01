import appRoot from 'app-root-path';
import CipherManager from "./CipherManager";

require( 'dotenv' );

require( 'dotenv' ).config( { path: appRoot.path + "/.env.secrets" } );

test( `Test CypherManager.encrypt and CypherManager.decrypt. "Hello"`, async () => {

  const strInitialData = "Hello";

  const strEncryptedData = await CipherManager.encrypt( strInitialData, null );

  const strDecryptedData = await CipherManager.decrypt( strEncryptedData, null );

  expect( strDecryptedData ).toMatch( strInitialData );

});

test( `Test CypherManager.encrypt and CypherManager.decrypt. "Very long words"`, async () => {

  const strInitialData = "Very long words";

  const strEncryptedData = await CipherManager.encrypt( strInitialData, null );

  const strDecryptedData = await CipherManager.decrypt( strEncryptedData, null );

  expect( strDecryptedData ).toMatch( strInitialData );

});