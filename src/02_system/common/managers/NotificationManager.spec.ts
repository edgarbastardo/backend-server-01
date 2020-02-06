import NotificationManager from "./NotificationManager";
import DBConnectionManager from "./DBConnectionManager";

require( 'dotenv' ).config(); //Read the .env file, in the root folder of project

test( `Test NotificationManager SMSGateway transport library 001`, async () => {

  DBConnectionManager.currentInstance = await DBConnectionManager.create( null ); //Init the connection to db using the orm

  DBConnectionManager.queryStatements = await DBConnectionManager.loadQueryStatement( null );

  const bResult = await NotificationManager.send(
                                                  "sms",
                                                  {
                                                    to: "3057769594",
                                                    //context: "AMERICA/NEW_YORK",
                                                    foreign_data: `{ "user": "test01" }`,
                                                    device_id: "*",
                                                    body: {
                                                            kind: "self",
                                                            text: "Hello from backend"
                                                          }
                                                  },
                                                  null,
                                                );

  await DBConnectionManager.close( null );

  expect( bResult ).toBe( true );

})
