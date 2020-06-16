/*
import uuidv4 from 'uuid/v4';
import moment from 'moment-timezone';
import os from 'os';
import bcrypt from 'bcrypt';
*/
import cluster from 'cluster';

import CommonConstants from '../../../../02_system/common/CommonConstants';
import SystemConstants from "../../../../02_system/common/SystemContants";

import CommonUtilities from '../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../02_system/common/SystemUtilities';

import { SYSUser } from '../../../../02_system/common/database/master/models/SYSUser';
import { SYSUserGroup } from '../../../../02_system/common/database/master/models/SYSUserGroup';

const debug = require( 'debug' )( '003_system_check_foreign_systems_groups_and_users_exists' );

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

      const userGroupEntries = [
                                 {
                                   Id: "fe0476b1-d550-4b32-8731-1aa4c8a2c9bd",
                                   Name: "Foreign_Systems",
                                   Role: "#Foreign_Systems#",
                                   Tag: "#Foreign_Systems#",
                                   Comment: "Created from backend startup. Group of users associated to persistent sessions tokens and foreign systems.",
                                   CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   DisabledBy: "1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                 },
                               ]

      const loopUserGroupEntriesAsync = async () => {

        await CommonUtilities.asyncForEach( userGroupEntries as any, async ( userGroupToCreate: any ) => {

          const options = {

            where: { Id: userGroupToCreate.Id },
            individualHooks: true,
            transaction: currentTransaction,

          }

          const userGroupInDB = await SYSUserGroup.findOne( options );

          if ( userGroupInDB === null ) {

            await SYSUserGroup.create(
                                       userGroupToCreate,
                                       { transaction: currentTransaction }
                                     );

          }
          else if ( !userGroupInDB.Tag ||
                     userGroupInDB.Tag.indexOf( "#NotUpdateOnStartup#" ) === -1 ) {

            userGroupInDB.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
            userGroupInDB.DisabledBy = userGroupToCreate.DisabledBy;

            //await userGroupInDB.save( { transaction: currentTransaction } );

            await userGroupInDB.update( ( userGroupInDB as any ).dataValues,
                                        options );

          }

        });

      };

      await loopUserGroupEntriesAsync();

      const userEntries = [
                            {
                              Id: "23e0a6d8-4cc8-4cec-a2a7-7382539c1cd9",
                              GroupId: "fe0476b1-d550-4b32-8731-1aa4c8a2c9bd",
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 0,
                              Name: "ForeignSystem01",
                              Password: "@",
                              Role: "#UploadBinary#,#Update_Binary#,#Search_Binary#",
                              Tag: "#ForeignSystem#,#ForeignSystem01#",
                              Comment: "Created from backend startup.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: "25fd1d60-3285-42ed-98e7-fe3e6e08bc4b",
                              GroupId: "fe0476b1-d550-4b32-8731-1aa4c8a2c9bd",
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 0,
                              Name: "ForeignSystem02",
                              Password: "@",
                              Role: null,
                              Tag: "#ForeignSystem#,#ForeignSystem02#",
                              Comment: "Created from backend startup.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: "4041c2d7-f7e2-44bb-b1fc-00c3a298ab03",
                              GroupId: "fe0476b1-d550-4b32-8731-1aa4c8a2c9bd",
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 0,
                              Name: "ForeignSystem03",
                              Password: "@",
                              Role: null,
                              Tag: "#ForeignSystem#,#ForeignSystem03#",
                              Comment: "Created from backend startup.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: "e4f82a85-c800-47bc-bc3a-f6a427f3da02",
                              GroupId: "fe0476b1-d550-4b32-8731-1aa4c8a2c9bd",
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 0,
                              Name: "ForeignSystem04",
                              Password: "@",
                              Role: null,
                              Tag: "#ForeignSystem#,#ForeignSystem04#",
                              Comment: "Created from backend startup.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: "4607413a-3dca-4a8a-9f2b-2fee3617a990",
                              GroupId: "fe0476b1-d550-4b32-8731-1aa4c8a2c9bd",
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 0,
                              Name: "ForeignSystem05",
                              Password: "@",
                              Role: null,
                              Tag: "#ForeignSystem#,#ForeignSystem05#",
                              Comment: "Created from backend startup.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: "73d2a3fd-0a93-4fde-84d3-e03033a7a8d7",
                              GroupId: "fe0476b1-d550-4b32-8731-1aa4c8a2c9bd",
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 0,
                              Name: "ForeignSystem06",
                              Password: "@",
                              Role: null,
                              Tag: "#ForeignSystem#,#ForeignSystem06#",
                              Comment: "Created from backend startup.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: "681a4b6f-fed2-44db-a126-df2b71cd9b87",
                              GroupId: "fe0476b1-d550-4b32-8731-1aa4c8a2c9bd",
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 0,
                              Name: "ForeignSystem07",
                              Password: "@",
                              Role: null,
                              Tag: "#ForeignSystem#,#ForeignSystem07#",
                              Comment: "Created from backend startup.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: "cb3d02ac-9d51-4d46-b948-04e1375e146b",
                              GroupId: "fe0476b1-d550-4b32-8731-1aa4c8a2c9bd",
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 0,
                              Name: "ForeignSystem08",
                              Password: "@",
                              Role: null,
                              Tag: "#ForeignSystem#,#ForeignSystem08#",
                              Comment: "Created from backend startup.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: "eab1f6a3-fa2b-44c7-bf84-8ba4aba093a1",
                              GroupId: "fe0476b1-d550-4b32-8731-1aa4c8a2c9bd",
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 0,
                              Name: "ForeignSystem09",
                              Password: "@",
                              Role: null,
                              Tag: "#ForeignSystem#,#ForeignSystem09#",
                              Comment: "Created from backend startup.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: "81d0ead1-00a8-4a05-a0e7-7a0191f04e0c",
                              GroupId: "fe0476b1-d550-4b32-8731-1aa4c8a2c9bd",
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 0,
                              Name: "ForeignSystem10",
                              Password: "@",
                              Role: null,
                              Tag: "#ForeignSystem#,#ForeignSystem10#",
                              Comment: "Created from backend startup.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                          ]

      const loopUserEntriesAsync = async () => {

        await CommonUtilities.asyncForEach( userEntries as any, async ( userToCreate: any ) => {

          const options = {

            where: { Id: userToCreate.Id },
            individualHooks: true,
            transaction: currentTransaction,

          }

          const sysUserInDB = await SYSUser.findOne( options );

          if ( sysUserInDB === null ) {

            await SYSUser.create( userToCreate );

          }
          else if ( !sysUserInDB.Tag ||
                    sysUserInDB.Tag.indexOf( "#NotUpdateOnStartup#" ) === -1 ) {

            //sysUserInDB.Name = userToCreate.Name;
            //sysUserInDB.Password = userToCreate.Password; //await bcrypt.hash( userToCreate.Password, 10 );
            userToCreate.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
            userToCreate.UpdatedAt = null;

            await sysUserInDB.update( userToCreate,
                                      options );

          }

        });

      };

      await loopUserEntriesAsync();

      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }

      bSuccess = true;
      bEmptyContent = false;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.execute.name;

      const strMark = "2E18A4C3D9F0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
