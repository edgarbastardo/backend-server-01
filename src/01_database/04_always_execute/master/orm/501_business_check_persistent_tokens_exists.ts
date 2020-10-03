import cluster from 'cluster';

import CommonConstants from '../../../../02_system/common/CommonConstants';
import SystemConstants from "../../../../02_system/common/SystemContants";

import CommonUtilities from '../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../02_system/common/SystemUtilities';

import { SYSUserSessionPersistent } from "../../../../02_system/common/database/master/models/SYSUserSessionPersistent";

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

      const userSessionPersistentEntries = [
                                             {
                                               Id: "23e0a6d8-4cc8-4cec-a2a7-7382539c1cd9",
                                               UserId: "23e0a6d8-4cc8-4cec-a2a7-7382539c1cd9", //ForeignSystem01
                                               Token: process.env.FOREIGN_SYSTEM_01_TOKEN || "1",
                                               BinaryDataToken: process.env.FOREIGN_SYSTEM_01_BINARY_DATA_TOKEN || null,
                                               SocketToken: process.env.FOREIGN_SYSTEM_01_SOCKET_TOKEN || null,
                                               Tag: "#Foreign_System#,#Foreign_System_01#,#Upload_Binary#,#Update_Binary#,#Search_Binary#,#Binary_Data_Allow_To_Define_Id#,#Binary_Data_Allow_To_Define_Date#",
                                               Comment: "Generic authorization token (API KEY)",
                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                               DisabledBy: null //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                             },
                                             {
                                               Id: "25fd1d60-3285-42ed-98e7-fe3e6e08bc4b",
                                               UserId: "25fd1d60-3285-42ed-98e7-fe3e6e08bc4b", //ForeignSystem02
                                               Token: process.env.FOREIGN_SYSTEM_02_TOKEN || "2",
                                               BinaryDataToken: process.env.FOREIGN_SYSTEM_02_BINARY_DATA_TOKEN || null,
                                               SocketToken: process.env.FOREIGN_SYSTEM_02_SOCKET_TOKEN || null,
                                               Tag: "#Foreign_System#,#Foreign_System_02#",
                                               Comment: "Generic authorization token (API KEY)",
                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                               DisabledBy: null //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                             },
                                             {
                                               Id: "2bc74668-bdca-49de-bc99-058f7f3a5e10",
                                               UserId: "4041c2d7-f7e2-44bb-b1fc-00c3a298ab03", //ForeignSystem03
                                               Token: process.env.FOREIGN_SYSTEM_03_TOKEN || "3",
                                               BinaryDataToken: process.env.FOREIGN_SYSTEM_03_BINARY_DATA_TOKEN || null,
                                               SocketToken: process.env.FOREIGN_SYSTEM_03_SOCKET_TOKEN || null,
                                               Tag: "#Foreign_System#,#Foreign_System_03#",
                                               Comment: "Generic authorization token (API KEY)",
                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                               DisabledBy: null //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                             },
                                             {
                                               Id: "047c0058-4d36-45da-b6c9-98e69e0bf831",
                                               UserId: "e4f82a85-c800-47bc-bc3a-f6a427f3da02", //ForeignSystem04
                                               Token: process.env.FOREIGN_SYSTEM_04_TOKEN || "4",
                                               BinaryDataToken: process.env.FOREIGN_SYSTEM_04_BINARY_DATA_TOKEN || null,
                                               SocketToken: process.env.FOREIGN_SYSTEM_04_SOCKET_TOKEN || null,
                                               Tag: "#Foreign_System#,#Foreign_System_04#,#Instant_Message_Server_01#,#Callback#,#Proxy#",
                                               Comment: "Authorization token (API KEY) for inbound requests (HOOK) from instant message server",
                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                               DisabledBy: null //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                             },
                                             {
                                               Id: "660f235f-66cd-4892-a866-89b86ea90303",
                                               UserId: "4607413a-3dca-4a8a-9f2b-2fee3617a990", //ForeignSystem05
                                               Token: process.env.FOREIGN_SYSTEM_05_TOKEN || "5",
                                               BinaryDataToken: process.env.FOREIGN_SYSTEM_05_BINARY_DATA_TOKEN || null,
                                               SocketToken: process.env.FOREIGN_SYSTEM_05_SOCKET_TOKEN || null,
                                               Tag: "#Foreign_System#,#Foreign_System_05#",
                                               Comment: "Generic authorization token (API KEY)",
                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                               DisabledBy: null //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                             },
                                             {
                                               Id: "3dadb777-0eba-48a4-a2f1-9dc8edf7b5bb",
                                               UserId: "73d2a3fd-0a93-4fde-84d3-e03033a7a8d7", //ForeignSystem06
                                               Token: process.env.FOREIGN_SYSTEM_06_TOKEN || "6",
                                               BinaryDataToken: process.env.FOREIGN_SYSTEM_06_BINARY_DATA_TOKEN || null,
                                               SocketToken: process.env.FOREIGN_SYSTEM_06_SOCKET_TOKEN || null,
                                               Tag: "#Foreign_System#,#Foreign_System_06#",
                                               Comment: "Generic authorization token (API KEY)",
                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                               DisabledBy: null //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                             },
                                             {
                                               Id: "0c01ad3a-b251-4e40-9f7e-40ae3716a64f",
                                               UserId: "681a4b6f-fed2-44db-a126-df2b71cd9b87", //ForeignSystem07
                                               Token: process.env.FOREIGN_SYSTEM_07_TOKEN || "7",
                                               BinaryDataToken: process.env.FOREIGN_SYSTEM_07_BINARY_DATA_TOKEN || null,
                                               SocketToken: process.env.FOREIGN_SYSTEM_07_SOCKET_TOKEN || null,
                                               Tag: "#Foreign_System#,#Foreign_System_07#",
                                               Comment: "Generic authorization token (API KEY)",
                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                               DisabledBy: null //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                             },
                                             {
                                               Id: "a60b9319-9d25-49c2-b264-8df00b2d18db",
                                               UserId: "cb3d02ac-9d51-4d46-b948-04e1375e146b", //ForeignSystem08
                                               Token: process.env.FOREIGN_SYSTEM_08_TOKEN || "8",
                                               BinaryDataToken: process.env.FOREIGN_SYSTEM_08_BINARY_DATA_TOKEN || null,
                                               SocketToken: process.env.FOREIGN_SYSTEM_08_SOCKET_TOKEN || null,
                                               Tag: "#Foreign_System#,#Foreign_System_08#",
                                               Comment: "Generic authorization token (API KEY)",
                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                               DisabledBy: null //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                             },
                                             {
                                               Id: "52b9b489-fe0f-4941-bf31-6ffdfc93f2b0",
                                               UserId: "eab1f6a3-fa2b-44c7-bf84-8ba4aba093a1", //ForeignSystem09
                                               Token: process.env.FOREIGN_SYSTEM_09_TOKEN || "9",
                                               BinaryDataToken: process.env.FOREIGN_SYSTEM_09_BINARY_DATA_TOKEN || null,
                                               SocketToken: process.env.FOREIGN_SYSTEM_09_SOCKET_TOKEN || null,
                                               Tag: "#Foreign_System#,#Foreign_System_09#",
                                               Comment: "Generic authorization token (API KEY)",
                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                               DisabledBy: null //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                             },
                                             {
                                               Id: "70643d7c-5360-4b03-a81a-e9b6250efe8f",
                                               UserId: "81d0ead1-00a8-4a05-a0e7-7a0191f04e0c", //ForeignSystem10
                                               Token: process.env.FOREIGN_SYSTEM_10_TOKEN || "10",
                                               BinaryDataToken: process.env.FOREIGN_SYSTEM_10_BINARY_DATA_TOKEN || null,
                                               SocketToken: process.env.FOREIGN_SYSTEM_10_SOCKET_TOKEN || null,
                                               Tag: "#Foreign_System#,#Foreign_System_10#",
                                               Comment: "Generic authorization token (API KEY)",
                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                               DisabledBy: null //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                             },
                                             {
                                               Id: "35969dee-f2de-47b9-8e87-4a299f5e3637",
                                               UserId: "75cc6129-ae0f-4f65-943a-ff6909317ff0", //ForeignSystem11
                                               Token: process.env.FOREIGN_SYSTEM_11_TOKEN || "11",
                                               BinaryDataToken: process.env.FOREIGN_SYSTEM_11_BINARY_DATA_TOKEN || null,
                                               SocketToken: process.env.FOREIGN_SYSTEM_11_SOCKET_TOKEN || null,
                                               Tag: "#Foreign_System#,#Foreign_System_11#",
                                               Comment: "Generic authorization token (API KEY)",
                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                               DisabledBy: null //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                             },
                                           ]

      const loopUserSessionPersistentEntriesAsync = async () => {

        await CommonUtilities.asyncForEach( userSessionPersistentEntries as any, async ( userSessionPersistentToCreate: any ) => {

          const options = {

            where: { Id: userSessionPersistentToCreate.Id },
            individualHooks: true,
            transaction: currentTransaction,

          }

          const sysUserSessionPersistentInDB = await SYSUserSessionPersistent.findOne( options );

          if ( sysUserSessionPersistentInDB === null ) {

            await SYSUserSessionPersistent.create(
                                                   userSessionPersistentToCreate,
                                                   { transaction: currentTransaction }
                                                 );

          }
          else if ( !sysUserSessionPersistentInDB.Tag ||
                    sysUserSessionPersistentInDB.Tag.includes( "#Not_Update_On_Startup#" ) === false ) {

            sysUserSessionPersistentInDB.UserId = userSessionPersistentToCreate.UserId;
            sysUserSessionPersistentInDB.Token = userSessionPersistentToCreate.Token;
            sysUserSessionPersistentInDB.BinaryDataToken = userSessionPersistentToCreate.BinaryDataToken || null;
            sysUserSessionPersistentInDB.SocketToken = userSessionPersistentToCreate.SocketToken || null;
            sysUserSessionPersistentInDB.Tag = userSessionPersistentToCreate.Tag || null;
            sysUserSessionPersistentInDB.Comment = userSessionPersistentToCreate.Comment || null;
            sysUserSessionPersistentInDB.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
            sysUserSessionPersistentInDB.UpdatedAt = null;

            await sysUserSessionPersistentInDB.update( ( sysUserSessionPersistentInDB as any ).dataValues,
                                                       options );

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
