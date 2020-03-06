//import appRoot from 'app-root-path';

import GeoMapManager from "../../02_system/common/managers/GeoMapManager";
import DBConnectionManager from "../../02_system/common/managers/DBConnectionManager";

require( 'dotenv' ).config(); //Read the .env file, in the root folder of project

test( `Test geocodeServiceUsingAddress 001`, async () => {

  DBConnectionManager.dbConnection = await DBConnectionManager.connect( null ); //Init the connection to db using the orm

  DBConnectionManager.queryStatements = await DBConnectionManager.loadQueryStatement( null );

  const geocodeResult = await GeoMapManager.geocodeServiceUsingAddress( [ "1625 s walnut street, wa 98233, suite 102" ], false, null );

  const geocodeData = await GeoMapManager.parseGeocodeResponse( geocodeResult, null );

  await DBConnectionManager.close( null );

  expect( geocodeData[ 0 ].formattedAddress ).toEqual( "1625 S Walnut St #102, Burlington, WA 98233, USA" );

})

test( `Test geocodeServiceUsingAddress 002`, async () => {

  DBConnectionManager.dbConnection = await DBConnectionManager.connect( null ); //Init the connection to db using the orm

  DBConnectionManager.queryStatements = await DBConnectionManager.loadQueryStatement( null );

  const geocodeResult = await GeoMapManager.geocodeServiceUsingAddress( [ "9361 sw 171 avenue FL 33196" ], false, null );

  const geocodeData = await GeoMapManager.parseGeocodeResponse( geocodeResult, null );

  await DBConnectionManager.close( null );

  expect( geocodeData[ 0 ].formattedAddress ).toEqual( "9361 SW 171st Ave, Miami, FL 33196, USA" );

})

test( `Test geocodeServiceUsingAddress 003`, async () => {

  DBConnectionManager.dbConnection = await DBConnectionManager.connect( null ); //Init the connection to db using the orm

  DBConnectionManager.queryStatements = await DBConnectionManager.loadQueryStatement( null );

  const geocodeResult = await GeoMapManager.geocodeServiceUsingAddress( [ "14250 sw 136 street FL 33186" ], false, null );

  const geocodeData = await GeoMapManager.parseGeocodeResponse( geocodeResult, null );

  await DBConnectionManager.close( null );

  expect( geocodeData[ 0 ].formattedAddress ).toEqual( "14250 SW 136th St, Miami, FL 33186, USA" );

})


test( `Test geocodeServiceUsingAddress 004`, async () => {

  DBConnectionManager.dbConnection = await DBConnectionManager.connect( null ); //Init the connection to db using the orm

  DBConnectionManager.queryStatements = await DBConnectionManager.loadQueryStatement( null );

  const geocodeResult = await GeoMapManager.geocodeServiceUsingAddress( [ "1234 sw No exists FL 33177" ], false, null );

  const geocodeData = await GeoMapManager.parseGeocodeResponse( geocodeResult, null );

  await DBConnectionManager.close( null );

  expect( geocodeData[ 0 ].formattedAddress ).toEqual( "Miami, FL 33177, USA" );

})

test( `Test geocodeServiceUsingAddress 005`, async () => {

  DBConnectionManager.dbConnection = await DBConnectionManager.connect( null ); //Init the connection to db using the orm

  DBConnectionManager.queryStatements = await DBConnectionManager.loadQueryStatement( null );

  const geocodeResult = await GeoMapManager.geocodeServiceUsingAddress( [ "1625 s walnut street, wa 98233, suite 102" ], true, null );

  //const geocodeData = await GeoMapManager.parseGeocodeResponse( geocodeResult, null );

  await DBConnectionManager.close( null );

  expect( geocodeResult[ 0 ].formattedAddress ).toEqual( "1625 S Walnut St #102, Burlington, WA 98233, USA" );

})

test( `Test geocodeServiceUsingAddress 006`, async () => {

  DBConnectionManager.dbConnection = await DBConnectionManager.connect( null ); //Init the connection to db using the orm

  DBConnectionManager.queryStatements = await DBConnectionManager.loadQueryStatement( null );

  const geocodeResult = await GeoMapManager.geocodeServiceUsingAddress( [ "9361 sw 171 avenue FL 33196" ], true, null );

  //const geocodeData = await GeoMapManager.parseGeocodeResponse( geocodeResult, null );

  await DBConnectionManager.close( null );

  expect( geocodeResult[ 0 ].formattedAddress ).toEqual( "9361 SW 171st Ave, Miami, FL 33196, USA" );

})

test( `Test geocodeServiceUsingAddress 007`, async () => {

  DBConnectionManager.dbConnection = await DBConnectionManager.connect( null ); //Init the connection to db using the orm

  DBConnectionManager.queryStatements = await DBConnectionManager.loadQueryStatement( null );

  const geocodeResult = await GeoMapManager.geocodeServiceUsingAddress( [ "14250 sw 136 street FL 33186" ], true, null );

  //const geocodeData = await GeoMapManager.parseGeocodeResponse( geocodeResult, null );

  await DBConnectionManager.close( null );

  expect( geocodeResult[ 0 ].formattedAddress ).toEqual( "14250 SW 136th St, Miami, FL 33186, USA" );

})


test( `Test geocodeServiceUsingAddress 008`, async () => {

  DBConnectionManager.dbConnection = await DBConnectionManager.connect( null ); //Init the connection to db using the orm

  DBConnectionManager.queryStatements = await DBConnectionManager.loadQueryStatement( null );

  const geocodeResult = await GeoMapManager.geocodeServiceUsingAddress( [ "1234 sw No exists FL 33177" ], true, null );

  //const geocodeData = await GeoMapManager.parseGeocodeResponse( geocodeResult, null );

  await DBConnectionManager.close( null );

  expect( geocodeResult[ 0 ].formattedAddress ).toEqual( "Miami, FL 33177, USA" );

})
