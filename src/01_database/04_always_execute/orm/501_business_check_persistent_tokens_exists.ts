import cluster from 'cluster';

import CommonConstants from '../../../02_system/common/CommonConstants';
import SystemConstants from "../../../02_system/common/SystemContants";

import CommonUtilities from '../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../02_system/common/SystemUtilities';

import { SYSUserSessionPersistent } from "../../../02_system/common/database/models/SYSUserSessionPersistent";

const debug = require( 'debug' )( '501_business_check_persistent_tokens_exists' );

//Example file import files using code
export default class Always {

  static disabled(): boolean {

    return false;

  }

  static async execute( dbConnection: any, context: any, logger: any ): Promise<any> {

    //The dbConnection parameter is instance of ORM object (sequelize)
    let bSuccess = false;
    let bEmptyContent = true;

    let currentTransaction = null;

    try {

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

      }

      //Migration code here

      const userSessionPersistentEntries = [
                                            //  {
                                            //    Id: "23e0a6d8-4cc8-4cec-a2a7-7382539c1cd9",
                                            //    UserId: "23e0a6d8-4cc8-4cec-a2a7-7382539c1cd9",
                                            //    Token: "5e187e17-ec3c-4536-bac7-593bffcba0c8",
                                            //    BinaryDataToken: "593bffcba0c8",
                                            //    Tag: "#ForeignSystem01#,#BinaryDataAllowToDefineId#,#BinaryDataAllowToDefineDate#",
                                            //    Comment: "Generic authorization token (API KEY)",
                                            //    CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                            //  },
                                            //  {
                                            //    Id: "25fd1d60-3285-42ed-98e7-fe3e6e08bc4b",
                                            //    UserId: "25fd1d60-3285-42ed-98e7-fe3e6e08bc4b",
                                            //    Token: "30dd38f1-64f3-4d4f-9359-bbeb7d9750b7",
                                            //    BinaryDataToken: "bbeb7d9750b7",
                                            //    Tag: "#ForeignSystem02#",
                                            //    Comment: "Generic authorization token (API KEY)",
                                            //    CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                            // },
                                            // {
                                            //    Id: "2bc74668-bdca-49de-bc99-058f7f3a5e10",
                                            //    UserId: "4041c2d7-f7e2-44bb-b1fc-00c3a298ab03",
                                            //    Token: "13293244-277f-46fd-8f61-22a38b6fc81e",
                                            //    BinaryDataToken: "22a38b6fc81e",
                                            //    Tag: "#ForeignSystem03#",
                                            //    Comment: "Generic authorization token (API KEY)",
                                            //    CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                            //  },
                                          ]

      const loopUserSessionPersistentEntriesAsync = async () => {

        await CommonUtilities.asyncForEach( userSessionPersistentEntries as any, async ( userSessionPersistentToCreate: any ) => {

          const options = {

            where: { Id: userSessionPersistentToCreate.Id },

          }

          const userSessionPersistent = await SYSUserSessionPersistent.findOne( options );

          if ( userSessionPersistent === null ) {

            await SYSUserSessionPersistent.create( userSessionPersistentToCreate );

          }
          else if ( !userSessionPersistent.Tag ||
                    userSessionPersistent.Tag.indexOf( "#NotUpdateOnStartup#" ) === -1 ) {

            userSessionPersistent.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

            await SYSUserSessionPersistent.update( ( userSessionPersistent as any ).dataValues, options );

          }

        });

      };

      await loopUserSessionPersistentEntriesAsync();

      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }

      bSuccess = true;
      bEmptyContent = false;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.execute.name;

      const strMark = "06FA91985E8E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

      if ( currentTransaction !== null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

    }

    return { bSuccess, bEmptyContent };

  }

}