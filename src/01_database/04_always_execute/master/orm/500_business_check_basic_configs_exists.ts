/*
import uuidv4 from 'uuid/v4';
import moment from 'moment-timezone';
import os from 'os';
import bcrypt from 'bcrypt';
import Hashes from 'jshashes';
*/
import cluster from 'cluster';

import CommonConstants from '../../../../02_system/common/CommonConstants';
import SystemConstants from "../../../../02_system/common/SystemContants";

import BusinessConstants from '../../../../03_business/common/BusinessConstants';

import CommonUtilities from '../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../02_system/common/SystemUtilities';

import { SYSConfigMetaData } from "../../../../02_system/common/database/master/models/SYSConfigMetaData";
import { SYSConfigValueData } from '../../../../02_system/common/database/master/models/SYSConfigValueData';

const debug = require( 'debug' )( '500_business_check_basic_configs_exists' );

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

      //Check if exists the the basic config entries defined
      const configEntries = BusinessConstants._CONFIG_METADATA_ENTRIES;

      const loopConfigEntriesAsync = async () => {

        await CommonUtilities.asyncForEach( configEntries as any, async ( configMetaDataToCreate: any ) => {

          const options = {

            where: { Name: configMetaDataToCreate.Name },
            //individualHooks: true,
            transaction: currentTransaction,

          }

          const configMetaDataInDB = await SYSConfigMetaData.findOne( options );

          if ( configMetaDataInDB === null ) {

            //const configMetaDataCreated =
            await SYSConfigMetaData.create( configMetaDataToCreate );

            /*
            if ( configMetaDataCreated ) {

              let debugMark = debug.extend( "A7103054FB0D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );
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
                                     ConfigMetaDataId: SystemConstants._CONFIG_ENTRY_General_Default_Information.Id,
                                     Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                     Value: JSON.stringify(
                                                            {
                                                              "sys_admin_email": process.env.SYSTEM_ADMIN_EMAIL || "admin@mycompany.com",
                                                              "sys_admin_phone": process.env.SYSTEM_ADMIN_PHONE || "+1-336-776-9897",
                                                              "feed_back_email": process.env.FEED_BACK_EMAIL || "feedback@mycompany.com",
                                                              "no_response_email": process.env.NO_RESPONSE_EMAIL || "no-response@mycompany.com",
                                                              "company_name": process.env.COMPANY_NAME || "MY COMPANY LLC",
                                                              "company_address": process.env.COMPANY_ADDRESS || "1234N Murdock St, Coral Gables, FL98284, Florida, USA, Office 102",
                                                              "company_zip_code": process.env.COMPANY_ZIP_CODE || "FL98284",
                                                              "company_phone": process.env.COMPANY_PHONE || "1-989-345-6789, 1-456-345-6789",
                                                              "company_web": process.env.COMPANY_WEB || "https://www.mycompanyweb.com, https://www.othercompanyweb.com",
                                                              "company_email": process.env.COMPANY_EMAIL || "admin@mycompany.com, other@mydomain.com"
                                                            }
                                                          ),
                                     CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   },
                                    // {
                                    //   ConfigMetaDataId: "", //system.authentication.LoginAccessControl
                                    //   Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                    //   Value: `{ "#ccc#": { "denied": "*", "allowed": null } }`,
                                    //   CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                    // },
                                    // {
                                    //   ConfigMetaDataId: "", //system.binary.data.BinaryDataMaximumSize
                                    //   Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                    //   Value: `10240`,
                                    //   CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                    // },
                                    // {
                                    //   ConfigMetaDataId: "",
                                    //   Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                    //   Value: ``,
                                    //   CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                    // },
                                    // {
                                    //   ConfigMetaDataId: "",
                                    //   Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                    //   Value: ``,
                                    //   CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                    // },
                                    // {
                                    //   ConfigMetaDataId: "",
                                    //   Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                    //   Value: ``,
                                    //   CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                    // },
                                    // {
                                    //   ConfigMetaDataId: "",
                                    //   Owner: SystemConstants._USER_BACKEND_SYSTEM_NET_NAME,
                                    //   Value: ``,
                                    //   CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                    // }
                                  ]

      const loopConfigValueEntriesAsync = async () => {

        await CommonUtilities.asyncForEach( configValueEntries as any, async ( configValueToCreate: any ) => {

          const options = {

            where: { ConfigMetaDataId: configValueToCreate.ConfigMetaDataId },
            //individualHooks: true,
            transaction: currentTransaction,

          }

          const sysConfigValueDataInDB = await SYSConfigValueData.findOne( options );

          if ( sysConfigValueDataInDB === null ) {

            await SYSConfigValueData.create(
                                             configValueToCreate,
                                             { transaction: currentTransaction }
                                           );

          }
          else if ( !sysConfigValueDataInDB.Tag ||
                    sysConfigValueDataInDB.Tag.includes( "#Not_Update_On_Startup#" ) === false ) {

            sysConfigValueDataInDB.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
            sysConfigValueDataInDB.Value = configValueToCreate.Value;

            //await sysConfigValueDataInDB.save( { transaction: currentTransaction } );

            await sysConfigValueDataInDB.update( ( sysConfigValueDataInDB as any ).dataValues,
                                                 options );

          }

        });

      };

      await loopConfigValueEntriesAsync();

      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }

      bSuccess = true;
      bEmptyContent = false;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.execute.name;

      const strMark = "F0170E86ADF5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
