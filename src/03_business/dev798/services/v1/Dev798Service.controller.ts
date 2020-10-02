
import cluster from 'cluster';

import {
  Request,
  Response
} from 'express';
//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

//import SystemConstants from "../../../02_system/common/SystemContants";
import CommonConstants from "../../../../02_system/common/CommonConstants";

import SystemUtilities from "../../../../02_system/common/SystemUtilities";
import CommonUtilities from "../../../../02_system/common/CommonUtilities";

import DBConnectionManager from '../../../../02_system/common/managers/DBConnectionManager';
import BaseService from "../../../../02_system/common/database/master/services/BaseService";
import I18NManager from "../../../../02_system/common/managers/I18Manager";
import ordersService from '../../../common/database/secondary/services/ordersService';
import { existedDirectiveNameMessage } from 'graphql/validation/rules/UniqueDirectiveNames';
import { create } from 'archiver';

const debug = require( 'debug' )( 'Dev798ServicesController' );

export default class Dev798ServicesController extends BaseService {

  //Common business services

  static async createDeliveryOrder( request: Request,
                                    response: Response,
                                    transaction: any,
                                    logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by MiddlewareManager.middlewareSetContext function

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let OrderRules = {
                        OrderId: [ "required", "string" ],
                        user_id: [ "required", "string" ],
                        location_id: [ "required", "string" ],
                        establishment_id: [ "required", "string" ],
                        invoice_id: [ "present", "string" ],
                        note: [ "present", "string" ],
                        payment_method: [ "present", "string" ],
                        payment_method1: [ "present", "string" ],
                        payment_method2: [ "present", "string" ],
                        status: [ "present", "string" ],
                        state: [ "present", "string" ],
                        ticket: [ "present", "string" ],
                        amount1: [ "present" ],
                        amount2: [ "present" ],
                        original_amount: [ "present" ],
                        want_delivery_date: [ "present", "string" ],
                        want_delivery_time: [ "present", "string" ],
                        time_retirement: [ "present", "string" ],
                        time_arrival_driver: [ "present", "string" ],
                        time_accepted_by_the_driver: [ "present", "string" ],
                        time_collected_by_the_driver: [ "present", "string" ],
                        time_finish: [ "present", "string" ],
                        created_at: [ "present", "string" ],
                        updated_at: [ "present", "string" ],
                        time_from_wait_by_the_driver: [ "present", "string" ],
                        time_from_wait_by_the_system: [ "present", "string" ],
                        time_in_which_the_driver_leaves_the_local: [ "present", "string" ],
                        fee: [ "present" ],
                        delivered: [ "present" ],
                        extra_miles: [ "present", "integer" ],
                        inspected: [ "present", "integer" ],
                        status_number: [ "present", "integer" ],
                        client_name: [ "present", "string" ],
                        fee_kk: [ "present" ],
                        extra_miles_driver_order: [ "present", "integer" ],
                        order_miles_quantity: [ "present" ],
                        catering_type: [ "present", "integer" ],
                        qty_person_catering: [ "present", "integer" ],
                        fee_driver_order: [ "present" ],
                        fee_catering_order: [ "present" ],
                        qty_meals: [ "present", "integer" ],
                        LocationState: ["present","string"],
                        LocationCity: ["present","string"],
                        LocationAddress: ["present","string"],
                        LocationPhone: ["present","string"],
                        LocationZipCode: ["present","string"]
                        };

      let validator = SystemUtilities.createCustomValidatorSync( request.body,
                                                                 OrderRules,
                                                                 null,
                                                                 logger );

      if ( validator.passes() ) { //Validate request.body field values


        const OrderInDB = await ordersService.createOrUpdate( {
                                                                  id: request.body.id,
                                                                  user_id: request.body.user_id,
                                                                  location_id: request.body.location_id,
                                                                  establishment_id: request.body.establishment_id,
                                                                  invoice_id: request.body.invoice_id,
                                                                  note: request.body.note,
                                                                  payment_method: request.body.payment_method,
                                                                  payment_method1: request.body.payment_method1,
                                                                  payment_method2: request.body.payment_method2,
                                                                  status: request.body.status,
                                                                  state: request.body.state,
                                                                  ticket: request.body.ticket,
                                                                  amount1: request.body.amount1,
                                                                  amount2: request.body.amount2,
                                                                  original_amount: request.body.original_amount,
                                                                  want_delivery_date: request.body.want_delivery_date,
                                                                  want_delivery_time: request.body.want_delivery_time,
                                                                  time_retirement: request.body.time_retirement,
                                                                  time_arrival_driver: request.body.time_arrival_driver,
                                                                  time_accepted_by_the_driver: request.body.time_accepted_by_the_driver,
                                                                  time_collected_by_the_driver: request.body.time_collected_by_the_driver,
                                                                  time_finish: request.body.time_finish,
                                                                  created_at: request.body.created_at,
                                                                  updated_at: request.body.updated_at,
                                                                  time_from_wait_by_the_driver: request.body.time_from_wait_by_the_driver,
                                                                  time_from_wait_by_the_system: request.body.time_from_wait_by_the_system,
                                                                  time_in_which_the_driver_leaves_the_local: request.body.time_in_which_the_driver_leaves_the_local,
                                                                  fee: request.body.fee,
                                                                  delivered: request.body.delivered,
                                                                  extra_miles: request.body.extra_miles,
                                                                  inspected: request.body.inspected,
                                                                  status_number: request.body.status_number,
                                                                  client_name: request.body.client_name,
                                                                  fee_kk: request.body.fee_kk,
                                                                  extra_miles_driver_order: request.body.extra_miles_driver_order,
                                                                  order_miles_quantity: request.body.order_miles_quantity,
                                                                  catering_type: request.body.catering_type,
                                                                  qty_person_catering: request.body.qty_person_catering,
                                                                  fee_driver_order: request.body.fee_driver_order,
                                                                  fee_catering_order: request.body.fee_catering_order,
                                                                  qty_meals:request.body.qty_meals
                                                                },
                                                                true,
                                                                currentTransaction,
                                                                logger );

        if ( OrderInDB instanceof Error ) {

          const error = OrderInDB;

          result = {
                     StatusCode: 500, //Internal server error
                     Code: "ERROR_UNEXPECTED",
                     Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                     Mark: "ECE00D3385F9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: error.name,
                                 Message: error.message,
                                 Details: await SystemUtilities.processErrorDetails( error ) //error
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else {

          let modelData = ( OrderInDB as any ).dataValues;

          result = {
                    StatusCode: 200, //Ok
                    Code: "SUCCESS_ORDERS_CREATE",
                    Message: await I18NManager.translate( strLanguage, "Success orders create." ),
                    Mark: "D63F3238E4C1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                    LogId: null,
                    IsError: false,
                    Errors: [],
                    Warnings: [],
                    Count: 1,
                    Data: [
                            modelData
                          ]
                   }

              bApplyTransaction = true;

            }

          }

      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                   Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                   Mark: "246713E60C38" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_FIELD_VALUES_ARE_INVALID",
                               Message: await I18NManager.translate( strLanguage, "One or more field values are invalid" ),
                               Details: validator.errors.all()
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 }

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createDeliveryOrder.name;

      const strMark = "7CB7E6F12094" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = {
                 StatusCode: 500, //Internal server error
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                 LogId: error.LogId,
                 Mark: strMark,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {

        }

      }

    }

    return result;

  }

}
