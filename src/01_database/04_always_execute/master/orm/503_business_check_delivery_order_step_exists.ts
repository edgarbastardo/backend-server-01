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
import { BIZDeliveryOrderStatusStep } from "../../../../03_business/common/database/master/models/BIZDeliveryOrderStatusStep";

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

      const deliveryOrderStatusStepEntries = [
                                               {
                                                 Id: "1ce17e5e-55dc-4def-be56-e875169c1ffe",
                                                 Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                                 First: 1, //Must be 1 because is the first of sequence
                                                 Last: 0,
                                                 Canceled: 0,
                                                 Sequence: 0,
                                                 Code: 100,
                                                 Description: "New",
                                                 Tag: "#Delivery_Order_Status_Step#,#New#",
                                                 Comment: "Created from backend startup. New",
                                                 CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                 DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                               },
                                               {
                                                 Id: "075ea056-ff2b-4c7f-9b26-ab78b82d7970",
                                                 Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                                 First: 0,
                                                 Last: 0,
                                                 Canceled: 0,
                                                 Sequence: 1,
                                                 Code: 200,
                                                 Description: "On Way",
                                                 Tag: "#Delivery_Order_Status_Step#,#On_Way#",
                                                 Comment: "Created from backend startup. On Way",
                                                 CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                 DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                               },
                                               {
                                                 Id: "4bbae43a-ddcd-4048-b7fb-a4c256e1991c",
                                                 Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                                 First: 0,
                                                 Last: 1,
                                                 Canceled: 0,
                                                 Sequence: 2,
                                                 Code: 300,
                                                 Description: "Delivered",
                                                 Tag: "#Delivery_Order_Status_Step#,#Delivered#",
                                                 Comment: "Created from backend startup. Delivered",
                                                 CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                 DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                               },
                                               {
                                                 Id: "0bd98d9e-aa02-4d8b-931f-1baa553b3611",
                                                 Kind: 1, //0 = Driver on demand, 1 = Driver exclusive, 2 = Driver by route
                                                 First: 0,
                                                 Last: 1,
                                                 Canceled: 1, //This status step is canceled
                                                 Sequence: 1000,
                                                 Code: 1000,
                                                 Description: "Canceled",
                                                 Tag: "#Delivery_Order_Status_Step#,#Canceled#",
                                                 Comment: "Created from backend startup. Canceled",
                                                 CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                                 DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                               },
                                             ]

      const loopDeliveryOrderStepAsync = async () => {

        await CommonUtilities.asyncForEach( deliveryOrderStatusStepEntries as any, async ( deliveryOrderStatusStepToCreate: any ) => {

          const options = {

                            where: { Id: deliveryOrderStatusStepToCreate.Id },
                            //individualHooks: true,
                            transaction: currentTransaction,

                          }

          const sysDeliveryOrderStatusStepInDB = await BIZDeliveryOrderStatusStep.findOne( options );

          if ( sysDeliveryOrderStatusStepInDB === null ) {

            await BIZDeliveryOrderStatusStep.create(
                                                     deliveryOrderStatusStepToCreate,
                                                     { transaction: currentTransaction }
                                                   );

          }
          else if ( !sysDeliveryOrderStatusStepInDB.Tag ||
                     sysDeliveryOrderStatusStepInDB.Tag.includes( "#Not_Update_On_Startup#" ) === false ) {

            sysDeliveryOrderStatusStepInDB.Kind = deliveryOrderStatusStepToCreate.Kind;
            sysDeliveryOrderStatusStepInDB.First = deliveryOrderStatusStepToCreate.First;
            sysDeliveryOrderStatusStepInDB.Last = deliveryOrderStatusStepToCreate.Last;
            sysDeliveryOrderStatusStepInDB.Canceled = deliveryOrderStatusStepToCreate.Canceled;
            sysDeliveryOrderStatusStepInDB.Sequence = deliveryOrderStatusStepToCreate.Sequence;
            sysDeliveryOrderStatusStepInDB.Code = deliveryOrderStatusStepToCreate.Code;
            sysDeliveryOrderStatusStepInDB.Description = deliveryOrderStatusStepToCreate.Description;
            sysDeliveryOrderStatusStepInDB.Tag = deliveryOrderStatusStepToCreate.Tag;
            sysDeliveryOrderStatusStepInDB.Comment = deliveryOrderStatusStepToCreate.Comment;
            sysDeliveryOrderStatusStepInDB.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
            sysDeliveryOrderStatusStepInDB.DisabledBy = deliveryOrderStatusStepToCreate.DisabledBy;

            //await sysUserGroupInDB.save( { transaction: currentTransaction } );

            await sysDeliveryOrderStatusStepInDB.update( ( sysDeliveryOrderStatusStepInDB as any ).dataValues,
                                                           options );

          }

        });

      };

      await loopDeliveryOrderStepAsync();

      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }

      bSuccess = true;
      bEmptyContent = false;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.execute.name;

      const strMark = "3B51C8F35764" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
