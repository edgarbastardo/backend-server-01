import SystemUtilities from "../../02_system/common/SystemUtilities";
import appRoot from 'app-root-path';
import CommonConstants from "../../02_system/common/CommonConstants";

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

test( `getRandomIntegerRangeFromString 001`, async () => {

  const intRandomNumber = SystemUtilities.getRandomIntegerRangeFromString( "random:100:1000" );

  expect( intRandomNumber ).toBeGreaterThan( 99 );
  expect( intRandomNumber ).toBeLessThan( 1001 );

})

test( `getRandomIntegerRangeFromString 002`, async () => {

  const intRandomNumber = SystemUtilities.getRandomIntegerRangeFromString( "random::1500" );

  expect( intRandomNumber ).toBeGreaterThan( 99 );
  expect( intRandomNumber ).toBeLessThan( 1501 );

})

test( `getRandomIntegerRangeFromString 003`, async () => {

  const intRandomNumber = SystemUtilities.getRandomIntegerRangeFromString( "random::" );

  expect( intRandomNumber ).toBeGreaterThan( 0 );
  expect( intRandomNumber ).toBeLessThan( 1001 );

})

test( `getRandomIntegerRangeFromString 004`, async () => {

  const intRandomNumber = SystemUtilities.getRandomIntegerRangeFromString( "::" );

  expect( intRandomNumber ).toBeGreaterThan( 0 );
  expect( intRandomNumber ).toBeLessThan( 1001 );

})

test( `getRandomIntegerRangeFromString 005`, async () => {

  const intRandomNumber = SystemUtilities.getRandomIntegerRangeFromString( ":" );

  expect( intRandomNumber ).toBeGreaterThan( 0 );
  expect( intRandomNumber ).toBeLessThan( 1001 );

})

test( `getRandomIntegerRangeFromString 006`, async () => {

  const intRandomNumber = SystemUtilities.getRandomIntegerRangeFromString( "" );

  expect( intRandomNumber ).toBeGreaterThan( 0 );
  expect( intRandomNumber ).toBeLessThan( 1001 );

})

test( `getRandomIntegerRangeFromString 007`, async () => {

  const intRandomNumber = SystemUtilities.getRandomIntegerRangeFromString( null );

  expect( intRandomNumber ).toBeGreaterThan( 0 );
  expect( intRandomNumber ).toBeLessThan( 1001 );

})

test( `getRandomIntegerRangeFromString 007`, async () => {

  const intRandomNumber = SystemUtilities.getRandomIntegerRangeFromString( null );

  expect( intRandomNumber ).toBeGreaterThan( 0 );
  expect( intRandomNumber ).toBeLessThan( 1001 );

})

test( `getCurrentDateAndTimeFromAndIncMinutes 001`, async () => {

  const incrementedDateAndTime = SystemUtilities.getCurrentDateAndTimeFromAndIncMinutes( '2020-01-01 07:00:00', 1 );

  const formattedDateAndTime = incrementedDateAndTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_05 );

  expect( formattedDateAndTime ).toEqual( "2020-01-01T07:01:00" );

})

test( `getCurrentDateAndTimeFromAndIncMinutes 002`, async () => {

  const incrementedDateAndTime = SystemUtilities.getCurrentDateAndTimeFromAndIncMinutes( '2020-01-01 07:10:00', 10 );

  const formattedDateAndTime = incrementedDateAndTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_05 );

  expect( formattedDateAndTime ).toEqual( "2020-01-01T07:20:00" );

})

test( `getCurrentDateAndTimeFromAndDecMinutes 001`, async () => {

  const incrementedDateAndTime = SystemUtilities.getCurrentDateAndTimeFromAndDecMinutes( '2020-01-01 07:00:00', 1 );

  const formattedDateAndTime = incrementedDateAndTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_05 );

  expect( formattedDateAndTime ).toEqual( "2020-01-01T06:59:00" );

})

test( `getCurrentDateAndTimeFromAndDecMinutes 002`, async () => {

  const incrementedDateAndTime = SystemUtilities.getCurrentDateAndTimeFromAndDecMinutes( '2020-01-01 07:10:00', 10 );

  const formattedDateAndTime = incrementedDateAndTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_05 );

  expect( formattedDateAndTime ).toEqual( "2020-01-01T07:00:00" );

})

test( `createSelectAliasFromFieldList`, async () => {

  const strFieldList = `A.Id,
                        A.Kind,
                        C.Name,
                        C.Latitude,
                        D.Address,
                        D.Latitude`;

  const selectFieldWithAlias = SystemUtilities.createSelectAliasFromFieldList( strFieldList, "A,C,D" );

  expect( selectFieldWithAlias ).toEqual( "A.Id As A_Id,A.Kind As A_Kind,C.Name As C_Name,C.Latitude As C_Latitude,D.Address As D_Address,D.Latitude As D_Latitude" );

})
