import SystemUtilities from "../../02_system/common/SystemUtilities";
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

test( `isDateAndTimeBeforeAt 001`, async () => {

  const bResult = SystemUtilities.isDateAndTimeBeforeAt( "2020-02-22T14:47:13-08:00", "2020-02-21T14:47:13-08:00" );

  expect( bResult ).toBe( false )

})

test( `isDateAndTimeBeforeAt 002`, async () => {

  const bResult = SystemUtilities.isDateAndTimeBeforeAt( "2020-02-21T14:50:13-08:00", "2020-02-21T14:47:13-08:00" );

  expect( bResult ).toBe( false )

})

test( `isDateAndTimeBeforeAt 003`, async () => {

  //Different timezone Amreica/New_York -> America/Los_Angeles
  const bResult = SystemUtilities.isDateAndTimeBeforeAt( "2020-02-21T15:00:00-05:00", "2020-02-21T14:47:13-08:00" );

  expect( bResult ).toBe( true )

})

test( `isDateAndTimeBeforeAt 005`, async () => {

  //Different timezone Amreica/New_York -> America/Los_Angeles
  const bResult = SystemUtilities.isDateAndTimeBeforeAt( "2020-02-22T15:00:00-05:00", "2020-02-21T14:47:13-08:00" );

  expect( bResult ).toBe( false )

})

test( `isDateAndTimeBeforeAt 006`, async () => {

  const bResult = SystemUtilities.isDateAndTimeBeforeAt( "2020-02-20T14:47:13-08:00", "2020-02-21T14:47:13-08:00" );

  expect( bResult ).toBe( true )

})

test( `isDateAndTimeBeforeAt 006`, async () => {

  //Only 1 seconds before
  const bResult = SystemUtilities.isDateAndTimeBeforeAt( "2020-02-21T14:47:12-08:00", "2020-02-21T14:47:13-08:00" );

  expect( bResult ).toBe( true )

})

test( `isDateAndTimeBeforeAt 007`, async () => {

  const bResult = SystemUtilities.isDateAndTimeBeforeAt( "2020-02-21T14:47:13-08:00", "2020-02-21T14:47:13-08:00" );

  expect( bResult ).toBe( false )

})

    /*
    if ( cluster.isMaster && SystemUtilities.isNetworkLeader ) {

      await JobQueueManager.addJobToQueue( "SampleJob",
                                           { mydata: "my data" },
                                           null, //{ repeat: { cron: '* * * * *' } },
                                           ApplicationManager.currentInstance );

    }
    */
