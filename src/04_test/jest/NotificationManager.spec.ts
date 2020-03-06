import NotificationManager from "../../02_system/common/managers/NotificationManager";
import DBConnectionManager from "../../02_system/common/managers/DBConnectionManager";

require( 'dotenv' ).config(); //Read the .env file, in the root folder of project

test( `Test NotificationManager SMSGateway transport library 001`, async () => {

  DBConnectionManager.dbConnection = await DBConnectionManager.connect( null ); //Init the connection to db using the orm

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

    //import appRoot from 'app-root-path';

    /*
    await NotificationManager.send(
                                    "email",
                                    {
                                      from: "hefesto.weknock.tech.com@gmail.com",
                                      to: "hefesto.weknock.tech.com@gmail.com",
                                      subject: "SIGNUP FOR NEW USER ACCOUNT",
                                      body: {
                                              kind: "template",
                                              file: "email-signup-web.pug",
                                              language: "en_US",
                                              variables: { userName: "test01", activationCode: "0123456789" }
                                              //kind: "embedded",
                                              //text: "Hello",
                                              //html: "<b>Hello</b>"
                                            }
                                    },
                                    LoggerManager.mainLoggerInstance
                                  );
    */

    /*
    await NotificationManager.send(
                                    "sms",
                                    {
                                      to: "3057769594",
                                      //context: "AMERICA/NEW_YORK",
                                      foreign_data: `{ "user": "test01" }`,
                                      //device_id: "*",
                                      body: {
                                              kind: "self",
                                              text: "Hello from backend"
                                            }
                                    },
                                    LoggerManager.mainLoggerInstance
                                  );
    */

    /*
    if ( await NotificationManager.getConfigServiceType( "push",
                                                         LoggerManager.mainLoggerInstance ) === "one_signal" ) {

      await NotificationManager.send(
                                      "push",
                                      {
                                        headings: {
                                                    'en': 'Notification Test Title',
                                                    'es': 'Notificación de Prueba Título',
                                                  },
                                        contents: {
                                                    'en': 'Notification Text Body',
                                                    'es': 'Notificación de Prueba Cuerpo',
                                                  },
                                        include_player_ids: [ "27fb1942-b9a8-4f9a-85f6-1c1f9f90ead0" ],
                                        // included_segments: [ "Subscribed Users", "Active Users" ],
                                        data: { Test: 1 },
                                        // filters: [
                                        //   { field: 'tag', key: 'level', relation: '>', value: 10 }
                                        // ]
                                      },
                                      LoggerManager.mainLoggerInstance
                                    );

    }
    */
