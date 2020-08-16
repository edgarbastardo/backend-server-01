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

import { BIZDeliveryZone } from '../../../../03_business/common/database/master/models/BIZDeliveryZone';
import { BIZEstablishment } from "../../../../03_business/common/database/master/models/BIZEstablishment";

const debug = require( 'debug' )( '502_check_business_delivery_order_step_exists' );

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

      const deliveryZoneEntries = [
                                    {
                                      Id: "c4c2f68d-9dc6-454f-9d3d-9ae53b0cab98",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "Delivery Zone 01",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. Delivery Zone 01",
                                      Tag: "#Delivery_Zone#,#Delivery_Zone_01#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "f0d7ecbf-b1b1-4566-bad9-1ec543a5b0cb",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "Delivery Zone 02",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. Delivery Zone 02",
                                      Tag: "#Delivery_Zone#,#Delivery_Zone_02#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "9dd6f13c-428e-4cdb-912d-f8c9e2863874",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "Delivery Zone 03",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. Delivery Zone 03",
                                      Tag: "#Delivery_Zone#,#Delivery_Zone_03#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "120305a8-8132-4305-967b-4c5c705bee38",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "Delivery Zone 04",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. Delivery Zone 04",
                                      Tag: "#Delivery_Zone#,#Delivery_Zone_04#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "6188f48f-59cc-4289-bc37-74894e238f7c",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "Delivery Zone 05",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. Delivery Zone 05",
                                      Tag: "#Delivery_Zone#,#Delivery_Zone_05#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "83cc17e6-e5bb-4a5b-b680-fbac5ca2a069",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "Delivery Zone 06",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. Delivery Zone 06",
                                      Tag: "#Delivery_Zone#,#Delivery_Zone_06#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    }
                                  ]

      const loopDeliveryZoneAsync = async () => {

        await CommonUtilities.asyncForEach( deliveryZoneEntries as any, async ( deliveryZoneToCreate: any ) => {

          const options = {

                            where: { Id: deliveryZoneToCreate.Id },
                            //individualHooks: true,
                            transaction: currentTransaction,

                          }

          const sysDeliveryZoneInDB = await BIZDeliveryZone.findOne( options );

          if ( sysDeliveryZoneInDB === null ) {

            await BIZDeliveryZone.create(
                                          deliveryZoneToCreate,
                                          { transaction: currentTransaction }
                                        );

          }
          else if ( !sysDeliveryZoneInDB.Tag ||
                     sysDeliveryZoneInDB.Tag.includes( "#Not_Update_On_Startup#" ) === false ) {

            sysDeliveryZoneInDB.Kind = deliveryZoneToCreate.Kind;
            sysDeliveryZoneInDB.Name = deliveryZoneToCreate.Name;
            sysDeliveryZoneInDB.DistanceUnit = deliveryZoneToCreate.DistanceUnit, //1 = Miles, 1 Kilometers
            sysDeliveryZoneInDB.DistanceCalcKind = deliveryZoneToCreate.DistanceCalcKind, //Algoritm to use to calculate the delivery price
            sysDeliveryZoneInDB.DistanceBase = deliveryZoneToCreate.DistanceBase, //4 miles
            sysDeliveryZoneInDB.DistanceMax = deliveryZoneToCreate.DistanceMax, //10 Miles
            sysDeliveryZoneInDB.DistanceExtraCalcKind = deliveryZoneToCreate.DistanceExtraCalcKind, //Algoritm to use to calculate the extra distance delivery price
            sysDeliveryZoneInDB.DistanceExtraByUnit = deliveryZoneToCreate.DistanceExtraByUnit, //Price for aditional distance unit
            sysDeliveryZoneInDB.DeliveryByDriverMax = deliveryZoneToCreate.DeliveryByDriverMax, //3 delivery maximun
            sysDeliveryZoneInDB.Tag = deliveryZoneToCreate.Tag;
            sysDeliveryZoneInDB.Comment = deliveryZoneToCreate.Comment;
            sysDeliveryZoneInDB.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
            sysDeliveryZoneInDB.DisabledBy = deliveryZoneToCreate.DisabledBy;

            //await sysUserGroupInDB.save( { transaction: currentTransaction } );

            await sysDeliveryZoneInDB.update( ( sysDeliveryZoneInDB as any ).dataValues,
                                              options );

          }

        });

      };

      await loopDeliveryZoneAsync();

      const establishmentEntries = [
                                     {
                                       Id: deliveryZoneEntries[ 0 ].Id, //Delivery Zone 01
                                       DeliveryZoneId: deliveryZoneEntries[ 0 ].Id, //Delivery Zone 01
                                       Kind: deliveryZoneEntries[ 0 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Establishment 01 DZ01",
                                       Address: "1234S Salmon St. Unit I999, 99999 FL",
                                       Latitude: "1",
                                       Longitude: "1",
                                       EMail: "dev.test@weknock-tech.com",
                                       Phone: "1-305-776-9999",
                                       Comment: "Created from backend startup. Establishment 01",
                                       Tag: "#Establishment#,#Establishment_01#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: deliveryZoneEntries[ 1 ].Id, //Delivery Zone 02
                                       DeliveryZoneId: deliveryZoneEntries[ 1 ].Id, //Delivery Zone 02
                                       Kind: deliveryZoneEntries[ 1 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Establishment 02 DZ02",
                                       Address: "1234S Block St. Unit I999, 99999 FL",
                                       Latitude: "1",
                                       Longitude: "1",
                                       EMail: "dev.test@weknock-tech.com",
                                       Phone: "1-305-776-9999",
                                       Comment: "Created from backend startup. Establishment 02",
                                       Tag: "#Establishment#,#Establishment_02#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: deliveryZoneEntries[ 2 ].Id, //Delivery Zone 03
                                       DeliveryZoneId: deliveryZoneEntries[ 2 ].Id, //Delivery Zone 03
                                       Kind: deliveryZoneEntries[ 2 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Establishment 03 DZ03",
                                       Address: "1234S Space St. Unit I999, 99999 FL",
                                       Latitude: "1",
                                       Longitude: "1",
                                       EMail: "dev.test@weknock-tech.com",
                                       Phone: "1-305-776-9999",
                                       Comment: "Created from backend startup. Establishment 03",
                                       Tag: "#Establishment#,#Establishment_03#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: deliveryZoneEntries[ 3 ].Id, //Delivery Zone 04
                                       DeliveryZoneId: deliveryZoneEntries[ 3 ].Id, //Delivery Zone 04
                                       Kind: deliveryZoneEntries[ 3 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Establishment 04 DZ04",
                                       Address: "1234S Jam St. Unit I999, 99999 FL",
                                       Latitude: "1",
                                       Longitude: "1",
                                       EMail: "dev.test@weknock-tech.com",
                                       Phone: "1-305-776-9999",
                                       Comment: "Created from backend startup. Establishment 04",
                                       Tag: "#Establishment#,#Establishment_04#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: deliveryZoneEntries[ 4 ].Id, //Delivery Zone 05
                                       DeliveryZoneId: deliveryZoneEntries[ 4 ].Id, //Delivery Zone 05
                                       Kind: deliveryZoneEntries[ 4 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Establishment 05 DZ05",
                                       Address: "1234S Butter St. Unit I999, 99999 FL",
                                       Latitude: "1",
                                       Longitude: "1",
                                       EMail: "dev.test@weknock-tech.com",
                                       Phone: "1-305-776-9999",
                                       Comment: "Created from backend startup. Establishment 05",
                                       Tag: "#Establishment#,#Establishment_05#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: "dec3d9d6-95e0-4a93-9192-69f938123eaf",
                                       DeliveryZoneId: deliveryZoneEntries[ 3 ].Id, //Delivery Zone 04
                                       Kind: deliveryZoneEntries[ 3 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Establishment 06 DZ04",
                                       Address: "1234S Mosquitto St. Unit I999, 99999 FL",
                                       Latitude: "1",
                                       Longitude: "1",
                                       EMail: "dev.test@weknock-tech.com",
                                       Phone: "1-305-776-9999",
                                       Comment: "Created from backend startup. Establishment 06",
                                       Tag: "#Establishment#,#Establishment_05#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: "052a42d1-4d90-49bd-85be-e63190bb2620",
                                       DeliveryZoneId: deliveryZoneEntries[ 3 ].Id, //Delivery Zone 04
                                       Kind: deliveryZoneEntries[ 3 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Establishment 07 DZ04",
                                       Address: "1234S Flower St. Unit I999, 99999 FL",
                                       Latitude: "1",
                                       Longitude: "1",
                                       EMail: "dev.test@weknock-tech.com",
                                       Phone: "1-305-776-9999",
                                       Comment: "Created from backend startup. Establishment 07",
                                       Tag: "#Establishment#,#Establishment_05#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: "15c3a8eb-002f-4a36-a9d4-3fbc78cef59e",
                                       DeliveryZoneId: deliveryZoneEntries[ 4 ].Id, //Delivery Zone 05
                                       Kind: deliveryZoneEntries[ 4 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Establishment 08 DZ05",
                                       Address: "1234S Apex St. Unit I999, 99999 FL",
                                       Latitude: "1",
                                       Longitude: "1",
                                       EMail: "dev.test@weknock-tech.com",
                                       Phone: "1-305-776-9999",
                                       Comment: "Created from backend startup. Establishment 08",
                                       Tag: "#Establishment#,#Establishment_05#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                   ]

      const loopEstablishmentAsync = async () => {

        await CommonUtilities.asyncForEach( establishmentEntries as any, async ( establishmentToCreate: any ) => {

          const options = {

                            where: { Id: establishmentToCreate.Id },
                            //individualHooks: true,
                            transaction: currentTransaction,

                          }

          const sysEstablishmentInDB = await BIZEstablishment.findOne( options );

          if ( sysEstablishmentInDB === null ) {

            await BIZEstablishment.create(
                                           establishmentToCreate,
                                           { transaction: currentTransaction }
                                         );

          }
          else if ( !sysEstablishmentInDB.Tag ||
                     sysEstablishmentInDB.Tag.includes( "#Not_Update_On_Startup#" ) === false ) {

            sysEstablishmentInDB.DeliveryZoneId = establishmentToCreate.DeliveryZoneId;
            sysEstablishmentInDB.Kind = establishmentToCreate.Kind;
            sysEstablishmentInDB.Name = establishmentToCreate.Name;
            sysEstablishmentInDB.Address = establishmentToCreate.Address;
            sysEstablishmentInDB.Latitude = establishmentToCreate.Latitude;
            sysEstablishmentInDB.Longitude = establishmentToCreate.Longitude;
            sysEstablishmentInDB.EMail = establishmentToCreate.EMail;
            sysEstablishmentInDB.Phone = establishmentToCreate.Phone;
            sysEstablishmentInDB.Comment = establishmentToCreate.Comment;
            sysEstablishmentInDB.Tag = establishmentToCreate.Tag;
            sysEstablishmentInDB.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
            sysEstablishmentInDB.DisabledBy = establishmentToCreate.DisabledBy;

            //await sysUserGroupInDB.save( { transaction: currentTransaction } );

            await sysEstablishmentInDB.update( ( sysEstablishmentInDB as any ).dataValues,
                                               options );

          }

        });

      };

      await loopEstablishmentAsync();

      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }

      bSuccess = true;
      bEmptyContent = false;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.execute.name;

      const strMark = "F2BAAE700CA8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
