import cluster from 'cluster';

/*
import os from 'os';

import uuidv4 from 'uuid/v4';
import moment from 'moment-timezone';
import bcrypt from 'bcrypt';
*/

import CommonConstants from '../../../../02_system/common/CommonConstants';
import SystemConstants from "../../../../02_system/common/SystemContants";

import CommonUtilities from '../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../02_system/common/SystemUtilities';

import { SYSUserGroup } from '../../../../02_system/common/database/master/models/SYSUserGroup';
import { SYSUser } from '../../../../02_system/common/database/master/models/SYSUser';
import { SYSPerson } from "../../../../02_system/common/database/master/models/SYSPerson";

const debug = require( 'debug' )( '502_check_business_groups_and_users_exists' );

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

      const userGroupEntries = [
                                 {
                                   Id: "d7648ed4-1914-4fe4-9902-072a21db1f00",
                                   Name: "Drivers",
                                   Role: "#Driver#,#Presence_Working#,#Upload_Binary#,#Delete_Binary#,#Update_Binary#,#Search_Binary#",
                                   Tag: "#Driver#,#Presence_Working#,#Upload_Binary#,#Delete_Binary#,#Update_Binary#,#Search_Binary#",
                                   Comment: "Created from backend startup. Group of users for drivers.",
                                   CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                 },
                                 {
                                   Id: "12bcf955-a3d0-4a48-aa72-7986d79c73b2",
                                   Name: "Administrative_Asistants",
                                   Role: "#Adm_Asistant#,#Upload_Binary#,#Delete_Binary#,#Update_Binary#,#Search_Binary#",
                                   Tag: "#Adm_Asistant#,#Upload_Binary#,#Delete_Binary#,#Update_Binary#,#Search_Binary#",
                                   Comment: "Created from backend startup. Group of users Administrative Asistants.",
                                   CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                 },
                                 {
                                   Id: "9916bd73-093d-47c8-a549-65e7edd4f171",
                                   Name: "Dispatchers",
                                   Role: "#Dispatcher#,#Upload_Binary#,#Delete_Binary#,#Update_Binary#,#Search_Binary#",
                                   Tag: "#Dispatcher#,#Upload_Binary#,#Delete_Binary#,#Update_Binary#,#Search_Binary#",
                                   Comment: "Created from backend startup. Group of users Dispatchers.",
                                   CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                 },
                                 {
                                   Id: "03e91fb3-6b70-4162-9af8-7219ce446e9f",
                                   Name: "Final_Customers",
                                   Role: "#Final_Customer#,#Upload_Binary#,#Delete_Binary#,#Update_Binary#,#Search_Binary#",
                                   Tag: "#Final_Customer#,#Upload_Binary#,#Delete_Binary#,#Update_Binary#,#Search_Binary#",
                                   Comment: "Created from backend startup. Group of users Final Customers.",
                                   CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                 },
                               ]

      const loopUserGroupEntriesAsync = async () => {

        await CommonUtilities.asyncForEach( userGroupEntries as any, async ( userGroupToCreate: any ) => {

          const options = {

                            where: { Id: userGroupToCreate.Id },
                            //individualHooks: true,
                            transaction: currentTransaction,

                          }

          const sysUserGroupInDB = await SYSUserGroup.findOne( options );

          if ( sysUserGroupInDB === null ) {

            await SYSUserGroup.create(
                                       userGroupToCreate,
                                       { transaction: currentTransaction }
                                     );

          }
          else if ( !sysUserGroupInDB.Tag ||
                     sysUserGroupInDB.Tag.includes( "#Not_Update_On_Startup#" ) === false ) {

            sysUserGroupInDB.Name = userGroupToCreate.Name;
            sysUserGroupInDB.Role = userGroupToCreate.Role;
            sysUserGroupInDB.Tag = userGroupToCreate.Tag;
            sysUserGroupInDB.Comment = userGroupToCreate.Comment;
            sysUserGroupInDB.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
            sysUserGroupInDB.DisabledBy = userGroupToCreate.DisabledBy;

            //await sysUserGroupInDB.save( { transaction: currentTransaction } );

            await sysUserGroupInDB.update( ( sysUserGroupInDB as any ).dataValues,
                                           options );

          }

        });

      };

      await loopUserGroupEntriesAsync();

      const personEntries = [
                              //Driver
                              {
                                Id: "7b598ef4-a445-4e2c-816a-0f54fca45ea2",
                                FirstName: "Driver 01",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Driver#,#driver01#",
                                Comment: "Created from backend startup. driver01.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "960d2f68-b72c-46ca-848d-47092f2af1fe",
                                FirstName: "Driver 02",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Driver#,#driver02#",
                                Comment: "Created from backend startup. driver02.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "f53d1611-0c2a-4738-b5b0-339abe20f250",
                                FirstName: "Driver 03",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Driver#,#driver03#",
                                Comment: "Created from backend startup. driver03.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "af1e0673-f00f-4c1e-95f8-6e779b0ca666",
                                FirstName: "Driver 04",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Driver#,#driver04#",
                                Comment: "Created from backend startup. driver04.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "7f9ae1d8-3e2b-4c96-bb7b-64dc5661d7f7",
                                FirstName: "Driver 05",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Driver#,#driver05#",
                                Comment: "Created from backend startup. driver05.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "20327855-eaa0-4229-a7da-a413efb27bfb",
                                FirstName: "Driver 06",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Driver#,#driver06#",
                                Comment: "Created from backend startup. driver06.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "f91618c6-8329-48f2-90dc-546525a62e0f",
                                FirstName: "Driver 07",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Driver#,#driver07#",
                                Comment: "Created from backend startup. driver07.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "9ca40075-c9ff-40e1-b9a8-60071d0e05c1",
                                FirstName: "Driver 08",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Driver#,#driver08#",
                                Comment: "Created from backend startup. driver08.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "1bf5a0d5-562d-489a-8156-4d784e1f9b76",
                                FirstName: "Driver 09",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Driver#,#driver09#",
                                Comment: "Created from backend startup. driver09.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "d3193ed0-99e5-46b1-a756-490c1cf2e78c",
                                FirstName: "Driver 10",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Driver#,#driver10#",
                                Comment: "Created from backend startup. driver10.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              //Dispatchers
                              {
                                Id: "72cf0ffc-bfa2-4f82-aec4-3e6d53da6c63",
                                FirstName: "Dispatcher 01",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Dispatcher#,#dispatcher01#",
                                Comment: "Created from backend startup. dispatcher01.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "426a0c58-51df-415d-8cd9-b401cf8049ec",
                                FirstName: "Dispatcher 02",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Dispatcher#,#dispatcher02#",
                                Comment: "Created from backend startup. dispatcher02.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "43b972fe-6e0d-44fc-b99c-71b339491bcd",
                                FirstName: "Dispatcher 03",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Dispatcher#,#dispatcher03#",
                                Comment: "Created from backend startup. dispatcher03.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "42ef10fe-dd8c-4305-801e-5628efb4189f",
                                FirstName: "Dispatcher 04",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Dispatcher#,#dispatcher04#",
                                Comment: "Created from backend startup. dispatcher04.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "d17fe937-e148-4c48-b649-bc590d1e94bb",
                                FirstName: "Dispatcher 05",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Dispatcher#,#dispatcher05#",
                                Comment: "Created from backend startup. dispatcher05.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              //Administrative Asistant
                              {
                                Id: "57795ff0-68a6-49ff-9db6-5c3f1b49fe1f",
                                FirstName: "Administrative Asistant 01",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Administrative_Asistant#,#adm01#",
                                Comment: "Created from backend startup. adm01",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "94edabbe-1d63-43e0-97e7-90d409aab80d",
                                FirstName: "Administrative Asistant 02",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Administrative_Asistant#,#adm02#",
                                Comment: "Created from backend startup. adm02.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "8566cbc0-0542-4fa7-bdf6-02b5e2eb36d9",
                                FirstName: "Administrative Asistant 03",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Administrative_Asistant#,,#adm03#",
                                Comment: "Created from backend startup. adm03.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "ad0dea09-01ca-49f8-9a4a-8ee03c981bd3",
                                FirstName: "Administrative Asistant 04",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Administrative_Asistant#,#adm04#",
                                Comment: "Created from backend startup. adm04.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "2fbee026-9953-4a4d-a7a8-a3df8ace8c4c",
                                FirstName: "Administrative Asistant 05",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Administrative_Asistant#,#adm05#",
                                Comment: "Created from backend startup. adm05.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "7c50a006-c487-4351-a03a-8dee639bb1a8",
                                FirstName: "Administrative Asistant 06",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Administrative_Asistant#,#adm06#",
                                Comment: "Created from backend startup. adm06",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "0d0294e9-ab45-4901-ba70-04ee309630b6",
                                FirstName: "Administrative Asistant 07",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Administrative_Asistant#,#adm07#",
                                Comment: "Created from backend startup. adm07.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "08b90888-4b70-48fc-b407-a2f1d4017ebb",
                                FirstName: "Administrative Asistant 08",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Administrative_Asistant#,,#adm08#",
                                Comment: "Created from backend startup. adm08.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "70cae715-22fc-4d84-9f98-0dc4e9ce67f0",
                                FirstName: "Administrative Asistant 09",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Administrative_Asistant#,#adm09#",
                                Comment: "Created from backend startup. adm09.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              },
                              {
                                Id: "45b51034-c21d-487f-b107-6273c7e1befb",
                                FirstName: "Administrative Asistant 10",
                                LastName: "",
                                Phone: "1-306-776-9999",
                                Email: "dev.test@weknock-tech.com",
                                Tag: "#Administrative_Asistant#,#adm10#",
                                Comment: "Created from backend startup. adm10.",
                                CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              }
                            ]


      const loopPersonEntriesAsync = async () => {

        await CommonUtilities.asyncForEach( personEntries as any, async ( personToCreate: any ) => {

          const options = {

                            where: { Id: personToCreate.Id },
                            //individualHooks: true,
                            transaction: currentTransaction,

                          }

          const sysPersonInDB = await SYSPerson.findOne( options );

          if ( sysPersonInDB === null ) {

            await SYSPerson.create(
                                    personToCreate,
                                    { transaction: currentTransaction }
                                  );

          }
          else if ( !sysPersonInDB.Tag ||
                    sysPersonInDB.Tag.includes( "#Not_Update_On_Startup#" ) === false ) {

            sysPersonInDB.FirstName = personToCreate.FirstName;
            sysPersonInDB.LastName = personToCreate.LastName;
            sysPersonInDB.Phone = personToCreate.Phone;
            sysPersonInDB.EMail = personToCreate.EMail;
            sysPersonInDB.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET,

            await sysPersonInDB.update( ( sysPersonInDB as any ).dataValues,
                                        options );

          }

        });

      };

      await loopPersonEntriesAsync();

      const userEntries = [
                            //Driver
                            {
                              Id: personEntries[ 0 ].Id,
                              GroupId: userGroupEntries[ 0 ].Id, //Drivers
                              PersonId: personEntries[ 0 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "driver01",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Driver#,#driver01#",
                              Comment: "Created from backend startup. driver01.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,,
                            },
                            {
                              Id: personEntries[ 1 ].Id,
                              GroupId: userGroupEntries[ 0 ].Id, //Drivers
                              PersonId: personEntries[ 1 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "driver02",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Driver#,#driver02#",
                              Comment: "Created from backend startup. driver02.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: personEntries[ 2 ].Id,
                              GroupId: userGroupEntries[ 0 ].Id, //Drivers
                              PersonId: personEntries[ 2 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "driver03",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Driver#,#driver03#",
                              Comment: "Created from backend startup. driver03.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: personEntries[ 3 ].Id,
                              GroupId: userGroupEntries[ 0 ].Id, //Drivers
                              PersonId: personEntries[ 3 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "driver04",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Driver#,#driver04#",
                              Comment: "Created from backend startup. driver04.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: personEntries[ 4 ].Id,
                              GroupId: userGroupEntries[ 0 ].Id, //Drivers
                              PersonId: personEntries[ 4 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "driver05",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Driver#,#driver05#",
                              Comment: "Created from backend startup. driver05.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: personEntries[ 5 ].Id,
                              GroupId: userGroupEntries[ 0 ].Id, //Drivers
                              PersonId: personEntries[ 5 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "driver06",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Driver#,#driver06#",
                              Comment: "Created from backend startup. driver06.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,,
                            },
                            {
                              Id: personEntries[ 6 ].Id,
                              GroupId: userGroupEntries[ 0 ].Id, //Drivers
                              PersonId: personEntries[ 6 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "driver07",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Driver#,#driver07#",
                              Comment: "Created from backend startup. driver07.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: personEntries[ 7 ].Id,
                              GroupId: userGroupEntries[ 0 ].Id, //Drivers
                              PersonId: personEntries[ 7 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "driver08",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Driver#,#driver08#",
                              Comment: "Created from backend startup. driver08.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: personEntries[ 8 ].Id,
                              GroupId: userGroupEntries[ 0 ].Id, //Drivers
                              PersonId: personEntries[ 8 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "driver09",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Driver#,#driver09#",
                              Comment: "Created from backend startup. driver09.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: personEntries[ 9 ].Id,
                              GroupId: userGroupEntries[ 0 ].Id, //Drivers
                              PersonId: personEntries[ 9 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "driver10",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Driver#,#driver10#",
                              Comment: "Created from backend startup. driver10.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            //Dispatchers
                            {
                              Id: personEntries[ 10 ].Id,
                              GroupId: userGroupEntries[ 2 ].Id, //Dispatchers
                              PersonId: personEntries[ 10 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "dispatcher01",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Dispatcher#,#dispatcher01#",
                              Comment: "Created from backend startup. dispatcher01.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: personEntries[ 11 ].Id,
                              GroupId: userGroupEntries[ 2 ].Id, //Dispatchers
                              PersonId: personEntries[ 11 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "dispatcher02",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Dispatcher#,#dispatcher02#",
                              Comment: "Created from backend startup. dispatcher02.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,,
                            },
                            {
                              Id: personEntries[ 12 ].Id,
                              GroupId: userGroupEntries[ 2 ].Id, //Dispatchers
                              PersonId: personEntries[ 12 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "dispatcher03",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Dispatcher#,#dispatcher03#",
                              Comment: "Created from backend startup. dispatcher03.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,,
                            },
                            {
                              Id: personEntries[ 13 ].Id,
                              GroupId: userGroupEntries[ 2 ].Id, //Dispatchers
                              PersonId: personEntries[ 13 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "dispatcher04",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Dispatcher#,#dispatcher04#",
                              Comment: "Created from backend startup. dispatcher04.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,,
                            },
                            {
                              Id: personEntries[ 14 ].Id,
                              GroupId: userGroupEntries[ 2 ].Id, //Dispatchers
                              PersonId: personEntries[ 14 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "dispatcher05",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Dispatcher#,#dispatcher05#",
                              Comment: "Created from backend startup. dispatcher05.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,,
                            },
                            //Administrative Asistant
                            {
                              Id: personEntries[ 15 ].Id,
                              GroupId: userGroupEntries[ 1 ].Id, //Administrative_Asistants
                              PersonId: personEntries[ 15 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "adm01",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Administrative_Asistant#,#adm01#",
                              Comment: "Created from backend startup. adm01",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,,
                            },
                            {
                              Id: personEntries[ 16 ].Id,
                              GroupId: userGroupEntries[ 1 ].Id, //Administrative_Asistants
                              PersonId: personEntries[ 16 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "adm02",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Administrative_Asistant#,#adm02#",
                              Comment: "Created from backend startup. adm02.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,,
                            },
                            {
                              Id: personEntries[ 17 ].Id,
                              GroupId: userGroupEntries[ 1 ].Id, //Administrative_Asistants
                              PersonId: personEntries[ 17 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "adm03",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Administrative_Asistant#,,#adm03#",
                              Comment: "Created from backend startup. adm03.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,,
                            },
                            {
                              Id: personEntries[ 18 ].Id,
                              GroupId: userGroupEntries[ 1 ].Id, //Administrative_Asistants
                              PersonId: personEntries[ 18 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "adm04",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Administrative_Asistant#,#adm04#",
                              Comment: "Created from backend startup. adm04.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,,
                            },
                            {
                              Id: personEntries[ 19 ].Id,
                              GroupId: userGroupEntries[ 1 ].Id, //Administrative_Asistants
                              PersonId: personEntries[ 19 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "adm05",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Administrative_Asistant#,#adm05#",
                              Comment: "Created from backend startup. adm05.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,,
                            },
                            {
                              Id: personEntries[ 20 ].Id,
                              GroupId: userGroupEntries[ 1 ].Id, //Administrative_Asistants
                              PersonId: personEntries[ 20 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "adm06",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Administrative_Asistant#,#adm06#",
                              Comment: "Created from backend startup. adm06.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,,
                            },
                            {
                              Id: personEntries[ 21 ].Id,
                              GroupId: userGroupEntries[ 1 ].Id, //Administrative_Asistants
                              PersonId: personEntries[ 21 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "adm07",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Administrative_Asistant#,#adm07#",
                              Comment: "Created from backend startup. adm07.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,,
                            },
                            {
                              Id: personEntries[ 22 ].Id,
                              GroupId: userGroupEntries[ 1 ].Id, //Administrative_Asistants
                              PersonId: personEntries[ 22 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "adm08",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Administrative_Asistant#,#adm08#",
                              Comment: "Created from backend startup. adm08.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,,
                            },
                            {
                              Id: personEntries[ 23 ].Id,
                              GroupId: userGroupEntries[ 1 ].Id, //Administrative_Asistants
                              PersonId: personEntries[ 23 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "adm09",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Administrative_Asistant#,#adm09#",
                              Comment: "Created from backend startup. adm09.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,,
                            },
                            {
                              Id: personEntries[ 24 ].Id,
                              GroupId: userGroupEntries[ 1 ].Id, //Administrative_Asistants
                              PersonId: personEntries[ 24 ].Id,
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 1,
                              Name: "adm10",
                              Password: "12345678",
                              Role: "",
                              Tag: "#Administrative_Asistant#,#adm10#",
                              Comment: "Created from backend startup. adm10.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,,
                            }
                          ]

      const loopUserEntriesAsync = async () => {

        await CommonUtilities.asyncForEach( userEntries as any, async ( userToCreate: any ) => {

          const options = {

                            where: { Id: userToCreate.Id },
                            //individualHooks: true,
                            transaction: currentTransaction,

                          }

          const sysUserInDB = await SYSUser.findOne( options );

          if ( sysUserInDB === null ) {

            await SYSUser.create(
                                  userToCreate,
                                  { transaction: currentTransaction }
                                );

          }
          else if ( !sysUserInDB.Tag ||
                    sysUserInDB.Tag.includes( "#Not_Update_On_Startup#" ) === false ) {

            sysUserInDB.Name = userToCreate.Name;
            sysUserInDB.GroupId = userToCreate.GroupId;
            sysUserInDB.PersonId = userToCreate.PersonId;
            sysUserInDB.ForceChangePassword = userToCreate.ForceChangePassword;
            sysUserInDB.ChangePasswordEvery = userToCreate.ChangePasswordEvery;
            sysUserInDB.SessionsLimit = userToCreate.SessionsLimit;
            sysUserInDB.Password = userToCreate.Password; //await bcrypt.hash( userToCreate.Password, 10 );
            sysUserInDB.Role = userToCreate.Role;
            sysUserInDB.Comment = userToCreate.Comment;
            sysUserInDB.Tag = userToCreate.Tag;
            sysUserInDB.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
            sysUserInDB.DisabledBy = userToCreate.DisabledBy;

            //await sysUserInDB.save( { transaction: currentTransaction } ),

            await sysUserInDB.update( ( sysUserInDB as any ).dataValues,
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
