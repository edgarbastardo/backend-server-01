/*
import uuidv4 from 'uuid/v4';
import moment from 'moment-timezone';
import os from 'os';
import bcrypt from 'bcrypt';
import Hashes from 'jshashes';
*/

import CommonUtilities from '../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../02_system/common/SystemUtilities';
import SystemConstants from "../../../02_system/common/SystemContants";

import { ConfigMetaData } from "../../../02_system/common/database/models/ConfigMetaData";
import { ConfigValueData } from '../../../02_system/common/database/models/ConfigValueData';
import CommonConstants from '../../../02_system/common/CommonConstants';

const debug = require( 'debug' )( '002_check_basic_configs_exists' );

//Example file import files using code
export default class Always {

  static disabled(): boolean {

    return false;

  }

  static async execute( dbConnection: any, context: any, logger: any ): Promise<any> {

    //The dbConnection parameter is instance of ORM object (sequelize)
    let bSuccess = false;
    let bEmptyContent = true;

    try {

      //Check if exists the the basic config entries defined
      const configEntries = SystemConstants._CONFIG_METADATA_ENTRIES;

      const loopConfigEntriesAsync = async () => {

        await CommonUtilities.asyncForEach( configEntries as any, async ( configMetaDataToCreate: any ) => {

          const options = {

            where: { Name: configMetaDataToCreate.Name },

          }

          const configMetaDataInDB = await ConfigMetaData.findOne( options );

          if ( configMetaDataInDB === null ) {

            //const configMetaDataCreated = 
            await ConfigMetaData.create( configMetaDataToCreate );

            /*
            if ( configMetaDataCreated ) {

              let debugMark = debug.extend( "A7103054FB0D" );
              debugMark( configMetaDataCreated );

            }
            */

          }

        });

      }

      await loopConfigEntriesAsync();

      //Insert test data
      const configValueEntries = [
                                    {
                                      ConfigMetaDataId: "9272d39a-4545-40e2-802f-5913998cbb20", //system.authentication.ExpireTimeAuthentication
                                      Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                      Value: `{ "#System_Administrators#": { "kind": 1, "on": 2880 } }`,
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      ConfigMetaDataId: "df6f1488-cf2c-40bd-be26-134ca3381e12", //system.authentication.LoginAccessControl
                                      Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                      Value: `{ "#ccc#": { "denied": "*", "allowed": null } }`,
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      ConfigMetaDataId: "f318f541-8367-42e7-ac71-904cab35bac1", //system.binary.data.BinaryDataMaximumSize
                                      Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                      Value: `10240`,
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      ConfigMetaDataId: "c0ea3ece-277c-4490-b2c1-a06f54382520", //system.binary.data.AllowedCategory
                                      Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                      Value: `{ "#System_Administrators#": { "denied": "", "allowed": "*" }, "#Documents_Allow_01#" : { "denied": "", "allowed": "#documents#" }, "#admin01@system.net#": { "denied": "", "allowed": "#test#,#other#" }, "@__default__@": { "denied": "", "allowed": "*" } }`,
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      ConfigMetaDataId: "e2f57878-e408-4754-ac13-d7186ed451ba", //system.binary.data.AllowedMimeType
                                      Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                      Value: `{ "#System_Administrators#.other": { "denied": "#image/png#,#image/jpeg#", "allowed": "*" }, "#System_Administrators#": { "denied": "*", "allowed": "" }, "#Documents_Allow_01#" : { "denied": "", "allowed": "#application/pdf#" }, "#admin01@system.net#.test": { "denied": "#application/json#", "allowed": "#image/png#,#image/jpeg#" }, "@__default__@": { "denied": "", "allowed": "*" } }`,
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                    }
                                  ]

      const loopConfigValueEntriesAsync = async () => {

        await CommonUtilities.asyncForEach( configValueEntries as any, async ( configValueToCreate: any ) => {

          const options = {

            where: { ConfigMetaDataId: configValueToCreate.ConfigMetaDataId },

          }

          const configValueDataInDB = await ConfigValueData.findOne( options );

          if ( configValueDataInDB === null ) {

            await ConfigValueData.create( configValueToCreate );

          }
          else if ( !configValueDataInDB.Tag ||
                    configValueDataInDB.Tag.indexOf( "#NotUpdateOnStartup#" ) === -1 ) {

            configValueDataInDB.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
            configValueDataInDB.Value = configValueToCreate.Value;

            await ConfigValueData.update( ( configValueDataInDB as any ).dataValues, options );

          }

        });

      };

      //await loopConfigValueEntriesAsync();

      bSuccess = true;
      bEmptyContent = false;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.execute.name;

      const strMark = "F0170E86ADF5";

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

    }

    return { bSuccess, bEmptyContent };

  }

}