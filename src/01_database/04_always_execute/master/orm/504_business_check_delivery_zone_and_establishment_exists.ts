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
                                      Id: "d7de58d5-961a-4da9-b5c9-c609d790e59d",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "Bandeja Paisa",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. Bandeja Paisa",
                                      Tag: "#Delivery_Zone#,#Bandeja_Paisa#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "547063bf-14a8-450d-a36c-4f8ce4b3b1e8",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "Casa Cuba",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. Casa Cuba",
                                      Tag: "#Delivery_Zone#,#Casa_Cuba#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "2f1e1493-0744-4234-bebf-fd641ece2b59",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "La Carreta Bird Road",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. La Carreta Bird Road",
                                      Tag: "#Delivery_Zone#,#La_Carreta_Bird_Road#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "8488d43a-b9a6-4805-9441-1b4fd9ea2798",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "La Carreta Hialeah",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. La Carreta Hialeah",
                                      Tag: "#Delivery_Zone#,#La_Carreta_Hialeah#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "6b82b904-3ae8-4bc2-8b5f-0ace48d63eb6",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "La Carreta Kendall",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. La Carreta Kendall",
                                      Tag: "#Delivery_Zone#,#La_Carreta_Kendall#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "f31d1ecb-c71f-4217-a50a-d20983690289",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "Latin Cafe Brickell",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. Latin Cafe Brickell",
                                      Tag: "#Delivery_Zone#,#Latin_Cafe_Brickell#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "8f8bec6a-add7-4cc3-b0a9-0c4dc92b2ce7",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "Latin Cafe Hialeah",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. Latin Cafe Hialeah",
                                      Tag: "#Delivery_Zone#,#Latin_Cafe_Hialeah#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "23a7309f-9070-4a13-8e60-8034fa07ee03",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "My Roots Doral",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. My Roots Doral",
                                      Tag: "#Delivery_Zone#,#My_Roots_Doral#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "5d297a90-5378-4b63-befa-bf16af6f4387",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "Rice Biscayne",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. Rice Biscayne",
                                      Tag: "#Delivery_Zone#,#Rice_Biscayne#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "02a4ad90-e251-4ada-98a7-e84d6c9d49c8",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "Rice Coral Gables",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. Rice Coral Gables",
                                      Tag: "#Delivery_Zone#,#Rice_Coral_Gables#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "44156bea-d0e0-4e43-ae8a-07603b4e5901",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "Roots Juicebar",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. Roots_Juicebar",
                                      Tag: "#Delivery_Zone#,#Roots_Juicebar#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "c986fc10-d08f-455e-9be4-e3b8249ca8df",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "Sergios Doral",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. Sergios_Doral",
                                      Tag: "#Delivery_Zone#,#Sergios_Doral#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "bc70f6f4-29dc-4b5a-9aa7-1773f8a61be5",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "Sergios Kendall 107",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. Sergios Kendall 107",
                                      Tag: "#Delivery_Zone#,#Sergios_Kendall_107#",
                                      CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                      DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                    },
                                    {
                                      Id: "7ad5c432-1e44-4bfc-996b-0f6c5a362faa",
                                      Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                      Name: "Sergios London Square",
                                      DistanceUnit: 0, //1 = Miles, 1 Kilometers
                                      DistanceCalcKind: 0, //Algoritm to use to calculate the delivery price
                                      DistanceBase: 4, //4 miles
                                      DistanceMax: 10, //10 Miles
                                      DistanceExtraCalcKind: 0, //Algoritm to use to calculate the extra distance delivery price
                                      DistanceExtraByUnit: 1.66, //Price for aditional distance unit
                                      DeliveryByDriverMax: 3, //3 delivery maximun
                                      Comment: "Created from backend startup. Sergios London Square",
                                      Tag: "#Delivery_Zone#,#Sergios_London_Square#",
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
                                       Id: deliveryZoneEntries[ 0 ].Id, //Bandeja Paisa
                                       DeliveryZoneId: deliveryZoneEntries[ 0 ].Id, //Bandeja Paisa
                                       Kind: deliveryZoneEntries[ 0 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Bandeja Paisa",
                                       Address: "9511 West Flagler St, Miami, FL 33174",
                                       Latitude: "25,7699185",
                                       Longitude: "-80,3530852",
                                       EMail: "carolina@torocol.com",
                                       Phone: "1-305-226-1551",
                                       Comment: "Created from backend startup. Bandeja Paisa",
                                       Tag: "#Establishment#,#Bandeja_Paisa#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: deliveryZoneEntries[ 1 ].Id, //Casa Cuba
                                       DeliveryZoneId: deliveryZoneEntries[ 1 ].Id, //Casa Cuba
                                       Kind: deliveryZoneEntries[ 1 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Casa Cuba",
                                       Address: "5859 SW 73rd st, Miami, FL 33143",
                                       Latitude: "25,7036793",
                                       Longitude: "-80,2907212",
                                       EMail: "dayamig@casacubasomi.com",
                                       Phone: "1-305-709-1214",
                                       Comment: "Created from backend startup. Casa Cuba",
                                       Tag: "#Establishment#,#Casa_Cuba#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: deliveryZoneEntries[ 2 ].Id, //La Carreta Bird Road
                                       DeliveryZoneId: deliveryZoneEntries[ 2 ].Id, //La Carreta Bird Road
                                       Kind: deliveryZoneEntries[ 2 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "La Carreta Bird Road",
                                       Address: "8650 Bird  Road, Miami, FL 33155",
                                       Latitude: "25,7327984",
                                       Longitude: "-80,3368159",
                                       EMail: "norailysb@lacarreta.com",
                                       Phone: "1-305-553-8383",
                                       Comment: "Created from backend startup. La Carreta Bird Road",
                                       Tag: "#Establishment#,#La_Carreta_Bird_Road#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: deliveryZoneEntries[ 3 ].Id, //La Carreta Hialeah
                                       DeliveryZoneId: deliveryZoneEntries[ 3 ].Id, //La Carreta Hialeah
                                       Kind: deliveryZoneEntries[ 3 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "La Carreta Hialeah",
                                       Address: "5350 W 16th Ave, Miami, FL 33012",
                                       Latitude: "25,8709963",
                                       Longitude: "-80,3178413",
                                       EMail: "fabiolama@lacarreta.com",
                                       Phone: "1-305-823-5200",
                                       Comment: "Created from backend startup. La Carreta Hialeah",
                                       Tag: "#Establishment#,#La_Carreta_Hialeah#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: deliveryZoneEntries[ 4 ].Id, //La Carreta Kendall
                                       DeliveryZoneId: deliveryZoneEntries[ 4 ].Id, //La Carreta Kendall
                                       Kind: deliveryZoneEntries[ 4 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "La Carreta Kendall",
                                       Address: "11740 SW 88th St, Miami, FL 33186",
                                       Latitude: "25,6857711",
                                       Longitude: "-80,3877595",
                                       EMail: "melbar@lacarreta.com",
                                       Phone: "1-305-596-5973",
                                       Comment: "Created from backend startup. La Carreta Kendall",
                                       Tag: "#Establishment#,#La_Carreta_Kendall#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: deliveryZoneEntries[ 5 ].Id, //Latin Cafe Brickell
                                       DeliveryZoneId: deliveryZoneEntries[ 5 ].Id, //Latin Cafe Brickell
                                       Kind: deliveryZoneEntries[ 5 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Latin Cafe Brickell",
                                       Address: "1053 Brickell Plaza, Miami, FL 33131",
                                       Latitude: "25,7636799",
                                       Longitude: "-80,1946646",
                                       EMail: "ejc@latincafe.com",
                                       Phone: "1-305-646-1400",
                                       Comment: "Created from backend startup. Latin_Cafe_Brickell",
                                       Tag: "#Establishment#,#Latin_Cafe_Brickell#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: deliveryZoneEntries[ 6 ].Id, //Latin Cafe Hialeah
                                       DeliveryZoneId: deliveryZoneEntries[ 6 ].Id, //Latin Cafe Hialeah
                                       Kind: deliveryZoneEntries[ 6 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Latin Cafe Hialeah",
                                       Address: "1192 W 49th St, Hialeah, FL 33012",
                                       Latitude: "25,8661938",
                                       Longitude: "-80,3086429",
                                       EMail: "ejc@latincafe.com",
                                       Phone: "1-305-820-1919",
                                       Comment: "Created from backend startup. Latin Cafe Hialeah",
                                       Tag: "#Establishment#,#Latin_Cafe_Hialeah#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: deliveryZoneEntries[ 7 ].Id, //My Roots Doral
                                       DeliveryZoneId: deliveryZoneEntries[ 7 ].Id, //My Roots Doral
                                       Kind: deliveryZoneEntries[ 7 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "My Roots Doral",
                                       Address: "4237 Northwest 107th Avenue, Doral, Fl 33178",
                                       Latitude: "25,8129947",
                                       Longitude: "-80,3711203",
                                       EMail: "rootsjuicebarmiami@gmail.com",
                                       Phone: "1-305-418-0479",
                                       Comment: "Created from backend startup. My Roots Doral",
                                       Tag: "#Establishment#,#My_Roots_Doral#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: deliveryZoneEntries[ 8 ].Id, //Rice Biscayne
                                       DeliveryZoneId: deliveryZoneEntries[ 8 ].Id, //Rice Biscayne
                                       Kind: deliveryZoneEntries[ 8 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Rice Biscayne",
                                       Address: "2500 Biscayne Blvd, Miami, FL 33137",
                                       Latitude: "25,801519",
                                       Longitude: "-80,1916379",
                                       EMail: "esi@ricekitchen.com",
                                       Phone: "1-305-705-6090",
                                       Comment: "Created from backend startup. Rice Biscayne",
                                       Tag: "#Establishment#,#Rice_Biscayne#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: deliveryZoneEntries[ 9 ].Id, //Rice Coral Gables
                                       DeliveryZoneId: deliveryZoneEntries[ 9 ].Id, //Rice Coral Gables
                                       Kind: deliveryZoneEntries[ 9 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Rice Coral Gables",
                                       Address: "164 Giralda Ave, Coral Gables, FL 33134",
                                       Latitude: "25,7512018",
                                       Longitude: "-80,2602433",
                                       EMail: "esi@ricekitchen.com",
                                       Phone: "1-305-200-5282",
                                       Comment: "Created from backend startup. Rice Coral Gables",
                                       Tag: "#Establishment#,#Rice_Coral_Gables#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: deliveryZoneEntries[ 10 ].Id, //Roots Juicebar
                                       DeliveryZoneId: deliveryZoneEntries[ 10 ].Id, //Roots Juicebar
                                       Kind: deliveryZoneEntries[ 10 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Roots Juicebar",
                                       Address: "8530 SW 124th Ave, Miami, FL 33183",
                                       Latitude: "25,6885664",
                                       Longitude: "-80,396627",
                                       EMail: "rootsjuicebarmiami@gmail.com",
                                       Phone: "1-786-534-5087",
                                       Comment: "Created from backend startup. Roots Juicebar",
                                       Tag: "#Establishment#,#Roots_Juicebar#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: deliveryZoneEntries[ 11 ].Id, //Sergios Doral
                                       DeliveryZoneId: deliveryZoneEntries[ 11 ].Id, //Sergios Doral
                                       Kind: deliveryZoneEntries[ 11 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Sergios Doral",
                                       Address: "1640 NW 87th Ave, Miami, FL 33172",
                                       Latitude: "25,7882905",
                                       Longitude: "-80,3399489",
                                       EMail: "mercedes@weknock.com",
                                       Phone: "1-786-360-6890",
                                       Comment: "Created from backend startup. Sergios Doral",
                                       Tag: "#Establishment#,#Sergios_Doral#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: deliveryZoneEntries[ 12 ].Id, //Sergios Kendall 107
                                       DeliveryZoneId: deliveryZoneEntries[ 12 ].Id, //Sergios Kendall 107
                                       Kind: deliveryZoneEntries[ 12 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Sergios Kendall 107",
                                       Address: "8807 SW 107th Ave, Miami, FL 33176",
                                       Latitude: "25,6863118",
                                       Longitude: "-80,366814",
                                       EMail: "mercedes@weknock.com",
                                       Phone: "1-305-275-2880",
                                       Comment: "Created from backend startup. Sergios Kendall 107",
                                       Tag: "#Establishment#,#Sergios_Kendall_107#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     },
                                     {
                                       Id: deliveryZoneEntries[ 13 ].Id, //Sergios London Square
                                       DeliveryZoneId: deliveryZoneEntries[ 13 ].Id, //Sergios London Square
                                       Kind: deliveryZoneEntries[ 13 ].Kind, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                       Name: "Sergios London Square",
                                       Address: "13550 SW 120th St, Miami, FL 33186",
                                       Latitude: "25,6551499",
                                       Longitude: "-80,4168448",
                                       EMail: "mercedes@weknock.com",
                                       Phone: "1-305-547-9717",
                                       Comment: "Created from backend startup. Sergios London Square",
                                       Tag: "#Establishment#,#Sergios_London_Square#",
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                       DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                     }
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
