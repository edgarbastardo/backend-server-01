/*
import uuidv4 from 'uuid/v4';
import moment from 'moment-timezone';
import os from 'os';
import Hashes from 'jshashes';
*/
//import bcrypt from 'bcrypt';
import cluster from 'cluster';

import CommonConstants from '../../../../02_system/common/CommonConstants';
import SystemConstants from "../../../../02_system/common/SystemContants";

import CommonUtilities from '../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../02_system/common/SystemUtilities';

import { SYSUserGroup } from '../../../../02_system/common/database/models/SYSUserGroup';
import { SYSUser } from '../../../../02_system/common/database/models/SYSUser';

const debug = require( 'debug' )( '001_system_check_groups_and_users_exists' );

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

      //Check if exists the System.Administrator and Business.Managers groups
      const userGroups = SystemConstants._USER_GROUPS;

      const loopUserGroupsAsync = async () => {

        await CommonUtilities.asyncForEach( userGroups as any, async ( userGroupToCreate: any ) => {

          const options = {

            where: { Id: userGroupToCreate.Id, Name: userGroupToCreate.Name },

          }

          const userGroupInDB = await SYSUserGroup.findOne( options );

          if ( userGroupInDB === null ) {

            //const userGroupCreated =
            await SYSUserGroup.create( userGroupToCreate );

            /*
            if ( userGroupCreated ) {

              let debugMark = debug.extend( "7BC3695ECE8D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );
              debugMark( userGroupCreated );

            }
            */

          }

        });

      }

      await loopUserGroupsAsync();

      //Check if exists the admin##@system.net and bmanager##@system.net users
      const users = SystemConstants._USERS;

      const loopUsersAsync = async () => {

        await CommonUtilities.asyncForEach( users as any, async ( userToCreate: any ) => {

          const options = {

            where: { Id: userToCreate.Id, Name: userToCreate.Name },

          }

          const sysUserInDB = await SYSUser.findOne( options );

          if ( sysUserInDB === null ) {

            //userToCreate.Password = await bcrypt.hash( userToCreate.Password, 10 );

            //const userCreated =
            await SYSUser.create(
                                  userToCreate,
                                  { transaction: currentTransaction }
                                );

            /*
            if ( userCreated ) {

              //debug( "%O", userCreated );

            }
            */

          }
          else if ( CommonUtilities.isNotNullOrEmpty( sysUserInDB ) && //The user exists in the db
                    CommonUtilities.isNullOrEmpty( sysUserInDB.Password ) && //The password is '', set again the default password
                    CommonUtilities.isNullOrEmpty( sysUserInDB.DisabledAt ) && //But the user is not disabled
                    ( !sysUserInDB.Tag || sysUserInDB.Tag.indexOf( "#NotUpdateOnStartup#" ) === -1 ) ) { //And not tagged to not update at startup

            sysUserInDB.Name = userToCreate.Name;
            sysUserInDB.Password = userToCreate.Password; //await bcrypt.hash( userToCreate.Password, 10 );
            sysUserInDB.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
            sysUserInDB.DisabledBy = userToCreate.DisabledBy;

            //await userInDB.save( { transaction: currentTransaction } );

            //const userUpdated =
            await sysUserInDB.update( ( sysUserInDB as any).dataValues,
                                      options );

            /*
            if ( userUpdated ) {

              //debug( "%O", userCreated );

            }
            */

          }

        });

      }

      await loopUsersAsync();

      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }

      bSuccess = true;
      bEmptyContent = false;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.execute.name;

      const strMark = "67045A015FA4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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