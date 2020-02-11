import SystemUtilities from "./SystemUtilities";
import appRoot from 'app-root-path';

require( 'dotenv' );

require( 'dotenv' ).config( { path: appRoot.path + "/.env.secrets" } );

test( `Test encryptRSA and decryptRSA. "Hello"`, async () => {

  const strInitialData = "Hello";

  const strEncryptedData = await SystemUtilities.encryptRSA( strInitialData,
                                                             process.env.PRIVATE_KEY_1,
                                                             null );

  const strDecryptedData = await SystemUtilities.decryptRSA( strEncryptedData,
                                                             process.env.PRIVATE_KEY_1,
                                                             null );

  expect( strDecryptedData ).toMatch( strInitialData );

})

test( `Test encryptRSA and decryptRSA. "Very long words"`, async () => {

  const strInitialData = "Very long words";

  const strEncryptedData = await SystemUtilities.encryptRSA( strInitialData,
                                                             process.env.PRIVATE_KEY_1,
                                                             null );

  const strDecryptedData = await SystemUtilities.decryptRSA( strEncryptedData,
                                                             process.env.PRIVATE_KEY_1,
                                                             null );

  expect( strDecryptedData ).toMatch( strInitialData );

})

test( `Generate RSA key`, async () => {

  const intKeyLength = 512;

  const strKey = await SystemUtilities.generateRSAKey( intKeyLength,
                                                     null );

  expect( strKey ).toMatch( /^-----BEGIN RSA PRIVATE KEY-----\\n/ );

})

    /*
    if ( cluster.isMaster && SystemUtilities.isNetworkLeader ) {

      await JobQueueManager.addJobToQueue( "SampleJob",
                                           { mydata: "my data" },
                                           null, //{ repeat: { cron: '* * * * *' } },
                                           ApplicationManager.currentInstance );

    }
    */
