/**
 * err format;
 * {
 *      message:'Err message',
 *      name ' 'ERROR_CODE,
 *      ...
 * }
 */

/**
 *  Request Query format

 {
   where:{},
   order:[],
   offset:10,
   limit: 10,
   attributes:[],
   include:[]

 }

 */

import { Request } from 'express';
import { Model, FindOptions, Includeable, FindAttributeOptions } from 'sequelize';
//import { Sequelize } from 'sequelize-typescript';
import CommonUtilities from '../../common/CommonUtilities';
import SystemUtilities from '../../common/SystemUtilities';
import BaseService from '../../common/database/services/BaseService';
import CommonConstants from '../../common/CommonConstants';
import I18NManager from '../../common/managers/I18Manager';

const debug = require( 'debug' )( 'ModelToRestAPIServiceController' );

export class CustomModel extends Model {

  //

}

export class ModelToRestAPIServiceController extends BaseService {

  static readonly _ID = "ModelToRestAPIServiceController";

  //private model: typeof ExModel = null;

  static sequelizeModelList: {

    [key: string]: typeof Model;

  } = null;

  /*
  public constructor( model: typeof ExModel, connection: Sequelize ) {

    //this.model = model;
    this.sequelizeModelList = connection.models;

  }
  */

  static async get( model: typeof CustomModel,
                    request: Request,
                    attributesExclude: string[] = null,
                    logger: any = null ): Promise<any> {

    let result = null;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      let whereFnResult = null;
      let includeFnResult = null;
      let attributesFnResult = null;

      whereFnResult = this.formatWhereStr(

        request.query && request.query.where ? request.query.where: {},
        logger

      );

      if ( whereFnResult.IsError ) {

        result = {
                   StatusCode: 400,
                   Code: 'ERROR_WRONG_WHERE_FORMAT',
                   Message: await I18NManager.translate( strLanguage, 'Query parameter \'where\' format error' ),
                   Mark: '3308D6A4C648',
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_WRONG_WHERE_FORMAT',
                               Message: await I18NManager.translate( strLanguage, 'Query parameter \'where\' format error' ),
                               Details: I18NManager.translate( strLanguage, `Valid examples are where={ '$or': [ { 'Id': { '$eq': 1 } }, { 'Id': { '$eq': 2 } } ] }, or where={ '$and': [ { 'Id': { '$eq': 1 } }, { 'Id': { '$eq': 2 } } ] }, or where={ '$or': [ { 'process': { '$like': '%\\00%' } }, { 'id': { '$eq': 500 } } ] }` )
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else {

        // Include
        includeFnResult = this.formatIncludeStr(

          request.query && request.query.include ? request.query.include : [],
          logger

        );

        if ( includeFnResult.IsError ) {

          result = {
                     StatusCode: 400,
                     Code: 'ERROR_WRONG_INCLUDE_FORMAT',
                     Message: await I18NManager.translate( strLanguage, 'Query parameter \'include\' format error' ),
                     Mark: 'A17D19DAF07E',
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_WRONG_INCLUDE_FORMAT',
                                 Message: await I18NManager.translate( strLanguage, 'Query parameter \'include\' format error' ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else {

          attributesFnResult = this.formatAttributesStr(

            request.query && request.query.attributes ? request.query.attributes: [],
            logger

          );

          if ( attributesFnResult.IsError ) {

            result = {
                       StatusCode: 400,
                       Code: 'ERROR_WRONG_ATTRIBUTES_FORMAT',
                       Message: await I18NManager.translate( strLanguage, 'Query parameter \'attributes\' format error' ),
                       Mark: '73178B2D81D5',
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_WRONG_ATTRIBUTES_FORMAT',
                                   Message: await I18NManager.translate( strLanguage, 'Query parameter \'attributes\' format error' ),
                                   Details: `The right format is atributes=[ "valid_field_name_1", "valid_field_name_2" ] in the url. Use ?atributes=... for only one parameter or &atributes=... for concatenate more of one query parameters`
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     };

          }
          else {

            let filter: FindOptions = {

              where: whereFnResult.Result,
              include: includeFnResult.Result,

            };

            if ( request.query.attributes ) {

              filter.attributes = attributesFnResult.Result; //JSON.parse( req.query.attributes );

            }

            if ( attributesExclude ) {

              let attributes: FindAttributeOptions;

              if ( Array.isArray( filter.attributes ) ) {

                attributes = {

                  include: filter.attributes,
                  exclude: attributesExclude,

                };

              }
              else {

                filter.attributes = filter.attributes || { include: [], exclude: [] };

                attributes = {

                  include: filter.attributes.include,
                  exclude: attributesExclude.concat( filter.attributes.exclude ),

                };

              }

              filter.attributes = attributes;

            }

            //ANCHOR
            const modelInDB = await model.findOne( filter );

            const dataFound = [];

            if ( modelInDB ) {

              let modelData = modelInDB.get();

              if ( ( model as any).convertFieldValues ) { //The hook is defined?

                const tempModelData = await ( model as any).convertFieldValues(
                                                                                {
                                                                                  Data: modelData,
                                                                                  FilterFields: 1, //Force to remove fields like password and value
                                                                                  TimeZoneId: request.header( "timezoneid" ),
                                                                                  Include: includeFnResult.Result,
                                                                                  Logger: logger,
                                                                                  ExtraInfo: {
                                                                                              Request: request
                                                                                            }
                                                                                }
                                                                              );

                if ( tempModelData ) {

                  modelData = tempModelData;

                }
                else {

                  modelData = null;

                }

              }

              if ( modelData ) {

                dataFound.push( modelData );

              }

            }

            result = {
                       StatusCode: 200,
                       Code: 'SUCCESS_GET',
                       Message: await I18NManager.translate( strLanguage, 'Sucess get the information' ),
                       Mark: '17BC08C03272',
                       LogId: null,
                       IsError: false,
                       Errors: [],
                       Warnings: [],
                       Count: dataFound.length,
                       Data: dataFound
                     };

          }

        }

      }


    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.get.name;

      const strMark = "775973814907";

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
                 StatusCode: 500,
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

    return result;

  }

  static async search( model: typeof CustomModel,
                       request: Request,
                       attributesExclude: string[] = null,
                       intDefaultMaxRows: number = 200,
                       logger: any = null ): Promise<any> {

    let result = null;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      let includeFnResult = null;
      let orderFnResult = null;
      let whereFnResult = null;
      let attributesFnResult = null;

      whereFnResult = this.formatWhereStr(

        request.query && request.query.where ? request.query.where: {},
        logger

      );

      if ( whereFnResult.IsError ) {

        result = {
                   StatusCode: 400,
                   Code: 'ERROR_WRONG_WHERE_FORMAT',
                   Message: await I18NManager.translate( strLanguage, 'Query parameter \'where\' format error' ),
                   Mark: 'B81F215FB722',
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_WRONG_WHERE_FORMAT',
                               Message: await I18NManager.translate( strLanguage, 'Query parameter \'where\' format error' ),
                               Details: I18NManager.translate( strLanguage, `Valid examples are where={ '$or': [ { 'Id': { '$eq': 1 } }, { 'Id': { '$eq': 2 } } ] }, or where={ '$and': [ { 'Id': { '$eq': 1 } }, { 'Id': { '$eq': 2 } } ] }, or where={ '$or': [ { 'process': { '$like': '%\\00%' } }, { 'id': { '$eq': 500 } } ] }` )
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else {

        // Include
        includeFnResult = this.formatIncludeStr(

          request.query && request.query.include ? request.query.include : [],
          logger

        );

        if ( includeFnResult.IsError ) {

          result = {
                     StatusCode: 400,
                     Code: 'ERROR_WRONG_INCLUDE_FORMAT',
                     Message: await I18NManager.translate( strLanguage, 'Query parameter \'include\' format error' ),
                     Mark: '5B06A3DD6871',
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_WRONG_INCLUDE_FORMAT',
                                 Message: await I18NManager.translate( strLanguage, 'Query parameter \'include\' format error' ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else {

          // Order
          orderFnResult = this.formatOrderStr(

            request.query && request.query.order ? request.query.order : [],
            logger

          );

          if ( orderFnResult.IsError ) {

            result = {
                       StatusCode: 400,
                       Code: 'ERROR_WRONG_ORDER_FORMAT',
                       Message: await I18NManager.translate( strLanguage, 'Query parameter \'order\' format error' ),
                       Mark: '7E2B9BB2C8D1',
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_WRONG_ORDER_FORMAT',
                                   Message: await I18NManager.translate( strLanguage, 'Query parameter \'order\' format error' ),
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     };

          }
          else {

            attributesFnResult = this.formatAttributesStr(

              request.query && request.query.attributes ? request.query.attributes: [],
              logger

            );

            if ( attributesFnResult.IsError ) {

              result = {
                         StatusCode: 400,
                         Code: 'ERROR_WRONG_ATTRIBUTES_FORMAT',
                         Message: await I18NManager.translate( strLanguage, 'Query parameter \'attributes\' format error' ),
                         Mark: '00E981270A7E',
                         LogId: null,
                         IsError: true,
                         Errors: [
                                   {
                                     Code: 'ERROR_WRONG_ATTRIBUTES_FORMAT',
                                     Message: await I18NManager.translate( strLanguage, 'Query parameter \'attributes\' format error' ),
                                     Details: `The right format is atributes=[ "valid_field_name_1", "valid_field_name_2" ] in the url. Use ?atributes=... for only one parameter or &atributes=... for concatenate more of one query parameters in the url.`
                                   }
                                 ],
                         Warnings: [],
                         Count: 0,
                         Data: []
                       };

            }

          }

        }

      }

      if ( !result ) { //if no error

        let intLimit = intDefaultMaxRows;

        const warnings = [];

        if ( request.query.limit && isNaN( request.query.limit ) === false && parseInt( request.query.limit ) <= intDefaultMaxRows ) {

          intLimit = parseInt( request.query.limit );

        }
        else {

          warnings.push(
                         {
                           Code: 'WARNING_DATA_LIMITED_TO_MAX',
                           Message: await I18NManager.translate( strLanguage, 'Data limited to the maximun of %s rows', intLimit ),
                           Details: I18NManager.translate( strLanguage, 'To protect to server and client of large result set of data, the default maximun rows is %s, you must use \'offset\' and \'limit\' query parameters to paginate large result set of data.', intLimit )
                         }
                       );

        }

        let filter: FindOptions = {

          where: whereFnResult.Result,
          offset: request.query.offset && !isNaN( request.query.offset ) ? parseInt( request.query.offset ) : 0,
          limit:  intLimit,
          order: orderFnResult.Result,
          include: includeFnResult.Result,

        };

        if ( request.query.attributes ) {

          filter.attributes = attributesFnResult.Result; //JSON.parse( req.query.attributes );

        }

        if ( attributesExclude ) {

          let attributes: FindAttributeOptions;

          if ( Array.isArray( filter.attributes ) ) {

            attributes = {

              include: filter.attributes,
              exclude: attributesExclude,

            };

          }
          else {

            filter.attributes = filter.attributes || { include: [], exclude: [] };

            attributes = {

              include: filter.attributes.include,
              exclude: attributesExclude.concat( filter.attributes.exclude ),

            };

          }

          filter.attributes = attributes;

        }

        // ANCHOR
        const modelInDBList = await model.findAll( filter );

        let dataFound = [];

        if ( ( model as any).convertFieldValues ) { //The hook is defined?

          for ( const modelInDB of modelInDBList ) {

            if ( modelInDB ) {

              let modelData = modelInDB.get();

              const tempModelData = await ( model as any).convertFieldValues(
                                                                              {
                                                                                Data: modelData,
                                                                                FilterFields: 1, //Force to remove fields like password and value
                                                                                TimeZoneId: request.header( "timezoneid" ),
                                                                                Include: includeFnResult.Result,
                                                                                Logger: logger,
                                                                                ExtraInfo: {
                                                                                             Request: request
                                                                                           }
                                                                              }
                                                                            );

              if ( tempModelData ) {

                modelData = tempModelData;

              }
              else {

                modelData = null;

              }

              if ( modelData ) {

                dataFound.push( modelData );

              }

            }

          }

        }
        else {

          dataFound = modelInDBList;

        }

        result = {
                   StatusCode: 200,
                   Code: 'SUCCESS_SEARCH',
                   Message: await I18NManager.translate( strLanguage, 'Sucess search the information' ),
                   Mark: '545F8DE9950F',
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: warnings,
                   Count: dataFound.length,
                   Data: dataFound
                 };

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.search.name;

      const strMark = "70A15A967313";

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
                 StatusCode: 500,
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

    return result;

  }

  static async searchCount( model: typeof CustomModel,
                            request: Request,
                            logger: any = null ): Promise<any> {

    let result = null;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      let includeFnResult = null;
      let whereFnResult = null;

      whereFnResult = this.formatWhereStr(

        request.query && request.query.where ? request.query.where: {},
        logger

      );

      if ( whereFnResult.IsError ) {

        result = {
                   StatusCode: 400,
                   Code: 'ERROR_WRONG_WHERE_FORMAT',
                   Message: await I18NManager.translate( strLanguage, 'Query parameter \'where\' format error' ),
                   Mark: '126F342F0F0E',
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_WRONG_WHERE_FORMAT',
                               Message: await I18NManager.translate( strLanguage, 'Query parameter \'where\' format error' ),
                               Details: I18NManager.translate( strLanguage, `Valid examples are where={ '$or': [ { 'Id': { '$eq': 1 } }, { 'Id': { '$eq': 2 } } ] }, or where={ '$and': [ { 'Id': { '$eq': 1 } }, { 'Id': { '$eq': 2 } } ] }, or where={ '$or': [ { 'process': { '$like': '%\\00%' } }, { 'id': { '$eq': 500 } } ] }` )
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else {

        // Include
        includeFnResult = this.formatIncludeStr(

          request.query && request.query.include ? request.query.include : [],
          logger

        );

        if ( includeFnResult.IsError ) {

          result = {
                     StatusCode: 400,
                     Code: 'ERROR_WRONG_INCLUDE_FORMAT',
                     Message: await I18NManager.translate( strLanguage, 'Query parameter \'include\' format error' ),
                     Mark: 'DB99B13E8999',
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_WRONG_INCLUDE_FORMAT',
                                 Message: await I18NManager.translate( strLanguage, 'Query parameter \'include\' format error' ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }
        else {

          let filter: FindOptions = {

            where: whereFnResult.Result,
            include: includeFnResult.Result,

          };

          const intCount = await model.count( filter );

          result = {
                     StatusCode: 200,
                     Code: 'SUCCESS_SEARCH_COUNT',
                     Message: await I18NManager.translate( strLanguage, 'Sucess count the information' ),
                     Mark: 'D0C4F28783EA',
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: 1,
                     Data: [
                             {
                               Count: intCount
                             }
                           ]
                   };

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.searchCount.name;

      const strMark = "D7CA4FF281CD";

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
                 StatusCode: 500,
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

    return result;

  }

  static async create( model: typeof CustomModel,
                       request: Request,
                       attributesExclude: string[] = null,
                       logger: any = null ): Promise<any> {

    let result = null;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const options = { context: context };

      const bodyData = request.body;

      delete bodyData[ "CreatedBy" ];
      delete bodyData[ "CreatedAt" ];
      delete bodyData[ "UpdatedBy" ];
      delete bodyData[ "UpdatedAt" ];

      if ( bodyData[ "DisabledBy" ] !== "1" &&
           bodyData[ "DisabledBy" ] !== "0" ) {

        delete bodyData[ "DisabledBy" ];

      }

      delete bodyData[ "DisabledAt" ];

      const modelCreatedInDB = await model.create( bodyData, options as any );

      let createdData = modelCreatedInDB.get();

      if ( attributesExclude ) {

        for ( let i = 0; i < attributesExclude.length; i++ ) {

          delete createdData[ attributesExclude[ i ] ];

        }

      }

      result = {
                 StatusCode: 201,
                 Code: 'SUCCESS_CREATE',
                 Message: await I18NManager.translate( strLanguage, 'Sucess created the information' ),
                 Mark: "275AF508CF64",
                 LogId: null,
                 IsError: false,
                 Errors: [],
                 Warnings: [],
                 Count: 1,
                 Data: [ createdData ]
               };

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.create.name;

      const strMark = "51EF4BAB9FB3";

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

      if ( error.name === "SequelizeValidationError" ) {

        result = {
                   StatusCode: 400,
                   Code: error.code,
                   Message: error.message,
                   Mark: strMark,
                   LogId: error.LogId,
                   IsError: true,
                   Errors: [
                             {
                               Code: error.name,
                               Message: error.message,
                               Details:  await SystemUtilities.processErrorListDetails( error.errors ) //error.errors
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else {

        result = {
                   StatusCode: 500,
                   Code: 'ERROR_UNEXPECTED',
                   Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                   Mark: strMark,
                   LogId: error.LogId,
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

    }

    return result;

  }

  static async bulkCreate( model: typeof CustomModel,
                           request: Request,
                           attributesExclude: string[] = null,
                           intDefaultMaxRows: number = 200,
                           logger: any = null ): Promise<any> {

    let result = null;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      if ( request.body.bulk && request.body.bulk.length > 0 ) {

        if ( request.body.bulk.length <= intDefaultMaxRows ) {

          const createdData = [];
          const warnings = [];
          const errors = [];

          for ( let intIndex = 0; intIndex < request.body.bulk.length; intIndex++ ) {

            try {

              const bodyData = request.body.bulk[ intIndex ];

              delete bodyData[ "CreatedBy" ];
              delete bodyData[ "CreatedAt" ];
              delete bodyData[ "UpdatedBy" ];
              delete bodyData[ "UpdatedAt" ];

              if ( bodyData[ "DisabledBy" ] !== "1" &&
                   bodyData[ "DisabledBy" ] !== "0" ) {

                delete bodyData[ "DisabledBy" ];

              }

              delete bodyData[ "DisabledAt" ];

              const modelCreatedInDB = await model.create( bodyData );

              let data = modelCreatedInDB.get();

              if ( attributesExclude ) {

                for ( let i = 0; i < attributesExclude.length; i++ ) {

                  delete data[ attributesExclude[ i ] ];

                }

              }

              createdData.push( data );

            }
            catch ( error ) {

              const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

              sourcePosition.method = this.name + "." + this.bulkCreate.name;

              const strMark = "DDA7B927197F";

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

              warnings.push(
                            {
                              Code: 'WARNING_CANNOT_CREATE_DATA',
                              Message: await I18NManager.translate( strLanguage, 'Cannot create the information at the index %s', intIndex ),
                              Details: { Index: intIndex }
                            }
                          );

              errors.push(
                            {
                              Code: error.name,
                              Message: error.message,
                              Details: await SystemUtilities.processErrorDetails( error ) //error
                            }
                        );

            }

          }

          let intStatusCode = -1;
          let strCode = "";
          let strMessage = "";
          let bIsError = false;

          if ( errors.length === 0 ) {

            intStatusCode = 200
            strCode = 'SUCCESS_CREATE_BULK';
            strMessage = await I18NManager.translate( strLanguage, 'Sucess created ALL information' );

          }
          else if ( errors.length === request.body.bulk.length ) {

            intStatusCode = 400
            strCode = 'ERROR_CREATE_BULK';
            strMessage = await I18NManager.translate( strLanguage, 'Cannot create ANY new information. Please check the errors and warnings section' );
            bIsError = true;

          }
          else {

            intStatusCode = 202
            strCode = 'WARNING_CHECK_ERRORS_AND_WARNINGS';
            strMessage = await I18NManager.translate( strLanguage, 'Not all information has been created. Please check the errors and warnings section' );

          }

          result = {
                     StatusCode: intStatusCode,
                     Code: strCode,
                     Message: strMessage,
                     Mark: '05C1A40B10F9',
                     LogId: null,
                     IsError: bIsError,
                     Errors: errors,
                     Warnings: warnings,
                     Count: request.body.bulk.length - errors.length,
                     Data: createdData
                   };

        }
        else {

          result = {
                     StatusCode: 400,
                     Code: 'ERROR_WRONG_BULK_FORMAT',
                     Message: await I18NManager.translate( strLanguage, 'The field \'bulk\' must be a array with maximun %s elements', intDefaultMaxRows ),
                     Mark: 'C8D2D8FD1BAE',
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_WRONG_BULK_FORMAT',
                                 Message: await I18NManager.translate( strLanguage, 'The field \'bulk\' must be a array with maximun %s elements', intDefaultMaxRows ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }

      }
      else {

          result = {
                     StatusCode: 400,
                     Code: 'ERROR_WRONG_BULK_FORMAT',
                     Message: await I18NManager.translate( strLanguage, 'The field \'bulk\' must be a array with at less 1 element' ),
                     Mark: 'D56ECA63D091',
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_WRONG_BULK_FORMAT',
                                 Message: await I18NManager.translate( strLanguage, 'The field \'bulk\' must be a array with at less 1 element' ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.bulkCreate.name;

      const strMark = "033EE1274C6D";

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
                 StatusCode: 500,
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

    return result;

  }

  static async update( model: typeof CustomModel,
                       request: Request,
                       attributesExclude: string[] = null,
                       logger: any = null ): Promise<any> {

    let result = null;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      let whereFnResult =  null;

      whereFnResult = this.formatWhereStr(

        request.body && request.body.where ? request.body.where: {},
        logger

      );

      if ( whereFnResult.IsError ||
           Object.keys( whereFnResult.Result ).length == 0 ) {

        result = {
                   StatusCode: 400,
                   Code: 'ERROR_WRONG_WHERE_FORMAT',
                   Message: await I18NManager.translate( strLanguage, 'Query parameter \'where\' format error' ),
                   Mark: '69C56831D2F1',
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_WRONG_WHERE_FORMAT',
                               Message: await I18NManager.translate( strLanguage, 'Query parameter \'where\' format error' ),
                               Details: I18NManager.translate( strLanguage, `Valid examples are where={ '$or': [ { 'Id': { '$eq': 1 } }, { 'Id': { '$eq': 2 } } ] }, or where={ '$and': [ { 'Id': { '$eq': 1 } }, { 'Id': { '$eq': 2 } } ] }, or where={ '$or': [ { 'process': { '$like': '%\\00%' } }, { 'id': { '$eq': 500 } } ] }` )
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else {

        let filter: FindOptions = {

          where: whereFnResult.Result,

        };

        const modelInDB = await model.findOne( filter );

        if ( !modelInDB ) {

          result = {
                      StatusCode: 404,
                      Code: 'ERROR_RECORD_NOT_FOUND',
                      Message: await I18NManager.translate( strLanguage, 'Record not found' ),
                      LogId: null,
                      IsError: true,
                      Errors: [
                                {
                                  Code: 'ERROR_RECORD_NOT_FOUND',
                                  Message: await I18NManager.translate( strLanguage, 'Record not found' ),
                                  Details: null
                                }
                              ],
                      Warnings: [],
                      Count: 0,
                      Data: []
                    };

        }
        else {

          const bodyData = request.body.data;

          delete bodyData[ "CreatedBy" ];
          delete bodyData[ "CreatedAt" ];
          delete bodyData[ "UpdatedBy" ];
          delete bodyData[ "UpdatedAt" ];

          if ( bodyData[ "DisabledBy" ] !== "1" &&
               bodyData[ "DisabledBy" ] !== "0" ) {

            delete bodyData[ "DisabledBy" ];

          }

          delete bodyData[ "DisabledAt" ];

          const modelUpdatedInDB = await modelInDB.update( bodyData );

          let updatedData = modelUpdatedInDB.get();

          if ( attributesExclude ) {

            for ( let i = 0; i < attributesExclude.length; i++ ) {

              delete updatedData[ attributesExclude[ i ] ];

            }

          }

          result = {
                     StatusCode: 200,
                     Code: 'SUCCESS_UPDATE',
                     Message: await I18NManager.translate( strLanguage, 'Sucess updated the information' ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: 1,
                     Data: [ updatedData ]
                   };

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.update.name;

      const strMark = "2C530E9EC49B";

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
                 StatusCode: 500,
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

    return result;

  }

  static async bulkUpdate( model: typeof CustomModel,
                           request: Request,
                           attributesExclude: string[] = null,
                           intDefaultMaxRows: number = 200,
                           logger: any = null ): Promise<any> {

    let result = null;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      if ( request.body.bulk && request.body.bulk.length > 0 ) {

        if ( request.body.bulk.length <= intDefaultMaxRows ) {

          const updatedData = [];
          const warnings = [];
          const errors = [];

          for ( let intIndex = 0; intIndex < request.body.bulk.length; intIndex++ ) {

            try {

              let whereFnResult =  null;

              whereFnResult = this.formatWhereStr(

                request.body.bulk[ intIndex ].where ? request.body.bulk[ intIndex ].where: {},
                logger

              );

              if ( whereFnResult.IsError ||
                   Object.keys( whereFnResult.Result ).length == 0 ) {

                warnings.push(
                               {
                                 Code: 'WARNING_CANNOT_UPDATE_DATA',
                                 Message: await I18NManager.translate( strLanguage, 'Cannot update the information at the index %s', intIndex ),
                                 Details: { Index: intIndex }
                               }
                             );

                errors.push(
                             {
                               StatusCode: 400,
                               Code: 'ERROR_WRONG_WHERE_FORMAT',
                               Message: await I18NManager.translate( strLanguage, 'Query parameter \'where\' format error' ),
                               Mark: '46EA0B6920D8',
                               LogId: null,
                               IsError: true,
                               Errors: [
                                         {
                                           Code: 'ERROR_WRONG_WHERE_FORMAT',
                                           Message: await I18NManager.translate( strLanguage, 'Query parameter \'where\' format error' ),
                                           Details: I18NManager.translate( strLanguage, `Valid examples are where={ '$or': [ { 'Id': { '$eq': 1 } }, { 'Id': { '$eq': 2 } } ] }, or where={ '$and': [ { 'Id': { '$eq': 1 } }, { 'Id': { '$eq': 2 } } ] }, or where={ '$or': [ { 'process': { '$like': '%\\00%' } }, { 'id': { '$eq': 500 } } ] }` )
                                          }
                                       ],
                               Warnings: [],
                               Count: 0,
                               Data: []
                             }
                           );

              }
              else {

                let filter: FindOptions = {

                  where: whereFnResult.Result,

                };

                const modelInDB = await model.findOne( filter );

                if ( !modelInDB ) {

                  warnings.push(
                                {
                                  Code: 'WARNING_CANNOT_UPDATE_DATA',
                                  Message: await I18NManager.translate( strLanguage, 'Cannot update the information at the index %s', intIndex ),
                                  Details: { Index: intIndex }
                                }
                              );

                  errors.push(
                               {
                                 StatusCode: 404,
                                 Code: 'ERROR_RECORD_NOT_FOUND',
                                 Message: await I18NManager.translate( strLanguage, 'Record not found' ),
                                 LogId: null,
                                 IsError: true,
                                 Errors: [
                                           {
                                             Code: 'ERROR_RECORD_NOT_FOUND',
                                             Message: await I18NManager.translate( strLanguage, 'Record not found' ),
                                             Details: null
                                           }
                                         ],
                                 Warnings: [],
                                 Count: 0,
                                 Data: []
                               }
                             );

                }
                else {

                  const bodyData = request.body.bulk[ intIndex ].data;

                  delete bodyData[ "CreatedBy" ];
                  delete bodyData[ "CreatedAt" ];
                  delete bodyData[ "UpdatedBy" ];
                  delete bodyData[ "UpdatedAt" ];

                  if ( bodyData[ "DisabledBy" ] !== "1" &&
                       bodyData[ "DisabledBy" ] !== "0" ) {

                    delete bodyData[ "DisabledBy" ];

                  }

                  delete bodyData[ "DisabledAt" ];

                  const modelUpdatedInDB = await modelInDB.update( bodyData );

                  let data = modelUpdatedInDB.get();

                  if ( attributesExclude ) {

                    for ( let i = 0; i < attributesExclude.length; i++ ) {

                      delete data[ attributesExclude[ i ] ];

                    }

                  }

                  updatedData.push( data );

                }

              }

            }
            catch ( error ) {

              const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

              sourcePosition.method = this.name + "." + this.bulkUpdate.name;

              const strMark = "05404E6E4238";

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

              warnings.push(
                             {
                               Code: 'WARNING_CANNOT_UPDATE_DATA',
                               Message: await I18NManager.translate( strLanguage, 'Cannot update the information at the index %s', intIndex ),
                               Details: { Index: intIndex }
                             }
                           );

              errors.push(
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         );

            }

          }

          let intStatusCode = -1;
          let strCode = "";
          let strMessage = "";
          let bIsError = false;

          if ( errors.length === 0 ) {

            intStatusCode = 200
            strCode = 'SUCCESS_UPDATE_BULK';
            strMessage = await I18NManager.translate( strLanguage, 'Sucess updated ALL information' );

          }
          else if ( errors.length === request.body.bulk.length ) {

            intStatusCode = 400
            strCode = 'ERROR_UPDATE_BULK';
            strMessage = await I18NManager.translate( strLanguage, 'Cannot update ANY information. Please check the errors and warnings section' );
            bIsError = true;

          }
          else {

            intStatusCode = 202
            strCode = 'WARNING_CHECK_ERRORS_AND_WARNINGS';
            strMessage = await I18NManager.translate( strLanguage, 'Not all information has been updated. Please check the errors and warnings section' );

          }

          result = {
                     StatusCode: intStatusCode,
                     Code: strCode,
                     Message: strMessage,
                     LogId: null,
                     IsError: bIsError,
                     Errors: errors,
                     Warnings: warnings,
                     Count: request.body.bulk.length - errors.length,
                     Data: updatedData
                   };

        }
        else {

          result = {
                     StatusCode: 400,
                     Code: 'ERROR_WRONG_BULK_FORMAT',
                     Message: await I18NManager.translate( strLanguage, 'The field \'bulk\' must be a array with maximun %s elements', intDefaultMaxRows ),
                     Mark: 'FFCD9E96FB0E',
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_WRONG_BULK_FORMAT',
                                 Message: await I18NManager.translate( strLanguage, 'The field \'bulk\' must be a array with maximun %s elements', intDefaultMaxRows ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }

      }
      else {

          result = {
                     StatusCode: 400,
                     Code: 'ERROR_WRONG_BULK_FORMAT',
                     Message: await I18NManager.translate( strLanguage, 'The field \'bulk\' must be a array with at less 1 element' ),
                     Mark: '85D4A82588B9',
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_WRONG_BULK_FORMAT',
                                 Message: await I18NManager.translate( strLanguage, 'The field \'bulk\' must be a array with at less 1 element' ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.bulkUpdate.name;

      const strMark = "24CB5D02D407";

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
                 StatusCode: 500,
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

    return result;

  }

  static async delete( model: typeof CustomModel,
                       request: Request,
                       logger: any = null ): Promise<any> {

    let result = null;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      let whereFnResult =  null;

      whereFnResult = this.formatWhereStr(

        request.body && request.body.where ? request.body.where: {},
        logger

      );

      if ( whereFnResult.IsError ||
           Object.keys( whereFnResult.Result ).length == 0 ) {

        result = {
                   StatusCode: 400,
                   Code: 'ERROR_WRONG_WHERE_FORMAT',
                   Message: await I18NManager.translate( strLanguage, 'Query parameter \'where\' format error' ),
                   Mark: '101C16C68A46',
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: 'ERROR_WRONG_WHERE_FORMAT',
                               Message: await I18NManager.translate( strLanguage, 'Query parameter \'where\' format error' ),
                               Details: I18NManager.translate( strLanguage, `Valid examples are where={ '$or': [ { 'Id': { '$eq': 1 } }, { 'Id': { '$eq': 2 } } ] }, or where={ '$and': [ { 'Id': { '$eq': 1 } }, { 'Id': { '$eq': 2 } } ] }, or where={ '$or': [ { 'process': { '$like': '%\\00%' } }, { 'id': { '$eq': 500 } } ] }` )
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else {

        let filter: FindOptions = {

          where: whereFnResult.Result,

        };

        const modelInDB = await model.findOne( filter );

        if ( !modelInDB ) {

          result = {
            StatusCode: 404,
            Code: 'ERROR_RECORD_NOT_FOUND',
            Message: await I18NManager.translate( strLanguage, 'Record not found' ),
            LogId: null,
            IsError: true,
            Errors: [
              {
                Code: 'ERROR_RECORD_NOT_FOUND',
                Message: await I18NManager.translate( strLanguage, 'Record not found' ),
                Details: null
              }
            ],
            Warnings: [],
            Count: 0,
            Data: []
          };

        }
        else {

          modelInDB.destroy()

          result = {
            StatusCode: 200,
            Code: 'SUCCESS_DELETE',
            Message: await I18NManager.translate( strLanguage, 'Sucess delete the information' ),
            LogId: null,
            IsError: false,
            Errors: [],
            Warnings: [],
            Count: 1,
            Data: []
          };

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.delete.name;

      const strMark = "464594DE5A13";

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
                 StatusCode: 500,
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

    return result;

  }

  static async bulkDelete( model: typeof CustomModel,
                           request: Request,
                           intDefaultMaxRows: number = 200,
                           logger: any = null ): Promise<any> {

    let result = null;

    let strLanguage = "";

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      if ( request.body.bulk && request.body.bulk.length > 0 ) {

        if ( request.body.bulk.length <= intDefaultMaxRows ) {

          const warnings = [];
          const errors = [];

          for ( let intIndex = 0; intIndex < request.body.bulk.length; intIndex++ ) {

            try {

              let whereFnResult =  null;

              whereFnResult = this.formatWhereStr(

                request.body.bulk[ intIndex ].where ? request.body.bulk[ intIndex ].where: {},
                logger

              );

              if ( whereFnResult.IsError ||
                   Object.keys( whereFnResult.Result ).length == 0 ) {

                warnings.push(
                               {
                                 Code: 'WARNING_CANNOT_DELETE_DATA',
                                 Message: await I18NManager.translate( strLanguage, 'Cannot delete the information at the index %s', intIndex ),
                                 Details: { Index: intIndex }
                               }
                             );

                errors.push(
                             {
                               StatusCode: 400,
                               Code: 'ERROR_WRONG_WHERE_FORMAT',
                               Message: await I18NManager.translate( strLanguage, 'Query parameter \'where\' format error' ),
                               Mark: 'DF7908C22E32',
                               LogId: null,
                               IsError: true,
                               Errors: [
                                         {
                                           Code: 'ERROR_WRONG_WHERE_FORMAT',
                                           Message: await I18NManager.translate( strLanguage, 'Query parameter \'where\' format error' ),
                                           Details: I18NManager.translate( strLanguage, `Valid examples are where={ '$or': [ { 'Id': { '$eq': 1 } }, { 'Id': { '$eq': 2 } } ] }, or where={ '$and': [ { 'Id': { '$eq': 1 } }, { 'Id': { '$eq': 2 } } ] }, or where={ '$or': [ { 'process': { '$like': '%\\00%' } }, { 'id': { '$eq': 500 } } ] }` )
                                         }
                                       ],
                               Warnings: [],
                               Count: 0,
                               Data: []
                             }
                           );

              }
              else {

                let filter: FindOptions = {

                  where: whereFnResult.Result,

                };

                const modelInDB = await model.findOne( filter );

                if ( !modelInDB ) {

                  warnings.push(
                                {
                                  Code: 'WARNING_CANNOT_DELETE_DATA',
                                  Message: await I18NManager.translate( strLanguage, 'Cannot delete the information at the index %s', intIndex ),
                                  Details: { Index: intIndex }
                                }
                              );

                  errors.push(
                               {
                                 StatusCode: 404,
                                 Code: 'ERROR_RECORD_NOT_FOUND',
                                 Message: await I18NManager.translate( strLanguage, 'Record not found' ),
                                 LogId: null,
                                 IsError: true,
                                 Errors: [
                                           {
                                             Code: 'ERROR_RECORD_NOT_FOUND',
                                             Message: await I18NManager.translate( strLanguage, 'Record not found' ),
                                             Details: null
                                           }
                                         ],
                                 Warnings: [],
                                 Count: 0,
                                 Data: []
                               }
                             );

                }
                else {

                  await modelInDB.destroy();

                }

              }

            }
            catch ( error ) {

              const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

              sourcePosition.method = this.name + "." + this.bulkDelete.name;

              const strMark = "5CA65932A193";

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

              warnings.push(
                             {
                               Code: 'WARNING_CANNOT_DELETE_DATA',
                               Message: await I18NManager.translate( strLanguage, 'Cannot delete the information at the index %s', intIndex ),
                               Details: { Index: intIndex }
                             }
                           );

              errors.push(
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         );

            }

          }

          let intStatusCode = -1;
          let strCode = "";
          let strMessage = "";
          let bIsError = false;

          if ( errors.length === 0 ) {

            intStatusCode = 200
            strCode = 'SUCCESS_DELETE_BULK';
            strMessage = await I18NManager.translate( strLanguage, 'Sucess deleted the ALL information' );

          }
          else if ( errors.length === request.body.bulk.length ) {

            intStatusCode = 400
            strCode = 'ERROR_DELETE_BULK';
            strMessage = await I18NManager.translate( strLanguage, 'Cannot delete ANY information. Please check the errors and warnings section' );
            bIsError = true;

          }
          else {

            intStatusCode = 202
            strCode = 'WARNING_CHECK_ERRORS_AND_WARNINGS';
            strMessage = await I18NManager.translate( strLanguage, 'Not all information has been deleted. Please check the errors and warnings section' );

          }

          result = {
                     StatusCode: intStatusCode,
                     Code: strCode,
                     Message: strMessage,
                     Mark: 'D29E6A276E7E',
                     LogId: null,
                     IsError: bIsError,
                     Errors: errors,
                     Warnings: warnings,
                     Count: request.body.bulk.length - errors.length,
                     Data: []
                   };

        }
        else {

          result = {
                     StatusCode: 400,
                     Code: 'ERROR_WRONG_BULK_FORMAT',
                     Message: await I18NManager.translate( strLanguage, 'The field \'bulk\' must be a array with maximun %s elements', intDefaultMaxRows ),
                     Mark: 'EE06E3FE408C',
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_WRONG_BULK_FORMAT',
                                 Message: await I18NManager.translate( strLanguage, 'The field \'bulk\' must be a array with maximun %s elements', intDefaultMaxRows ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }

      }
      else {

          result = {
                     StatusCode: 400,
                     Code: 'ERROR_WRONG_BULK_FORMAT',
                     Message: await I18NManager.translate( strLanguage, 'The field \'bulk\' must be a array with at less 1 element' ),
                     Mark: '5736792DDB37',
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_WRONG_BULK_FORMAT',
                                 Message: await I18NManager.translate( strLanguage, 'The field \'bulk\' must be a array with at less 1 element' ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.bulkDelete.name;

      const strMark = "EBFF5CC4163A";

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
                 StatusCode: 500,
                 Code: 'ERROR_UNEXPECTED',
                 Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                 Mark: strMark,
                 LogId: error.LogId,
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

    return result;

  }

  private static formatWhereStr( whereObject: any, logger: any = null ) : { Result: object, IsError: boolean, Errors: any[] } {

    let result = { Result: null, IsError: true, Errors: [] };

    try {

      const data = typeof( whereObject ) == "string" ? JSON.parse( whereObject ) : whereObject;

      result = { Result: data, IsError: false, Errors: [] };

    }
    catch ( error ) {

      result = { Result: null, IsError: true, Errors: [ error ] };

    }

    return result;

  }

  private static formatAttributesStr( attributesArray: any, logger: any = null ) : { Result: object, IsError: boolean, Errors: any[] } {

    let result = { Result: null, IsError: true, Errors: [] };

    try {

      const data = typeof( attributesArray ) == "string" ? JSON.parse( attributesArray ) : attributesArray;

      result = { Result: data, IsError: false, Errors: [] };

    }
    catch ( error ) {

      result = { Result: null, IsError: true, Errors: [ error ] };

    }

    return result;

  }

  private static formatIncludeStr( includeArray: any, logger: any ): { Result: Includeable[]; IsError: boolean, Errors: any[] } {

    let result = { Result: null, IsError: true, Errors: [] };

    try {

      if ( Array.isArray( includeArray ) === false ) {

        includeArray = JSON.parse( includeArray );

      }

      if ( Array.isArray( includeArray ) ) {

        let bError = false;
        let include = [];

        for ( let i = 0; i < includeArray.length; i++ ) {

          let includeItem: Includeable = {

            model: ModelToRestAPIServiceController.sequelizeModelList[ includeArray[i].model ],
            as: includeArray[i].as ? includeArray[i].as : includeArray[i].model,
            attributes: includeArray[i].attributes ? includeArray[i].attributes : undefined,
            where: includeArray[i].where ? includeArray[i].where : undefined,

          };

          if ( !includeArray[ i ].attributes ) {

            delete includeItem.attributes;

          };

          if ( includeArray[ i ].include ) {

            let result = this.formatIncludeStr( includeArray[i].include, logger );

            if ( result.IsError ) {

              bError = true;
              //return { formattedInclude: null, error: true };
              break;

            }

            includeItem.include = result.Result;

          }

          include.push( includeItem );

        }

        if ( bError === false ) {

          result = { Result: include, IsError: false, Errors: [] };

        }

      }

    }
    catch ( error ) {

      result = { Result: null, IsError: true, Errors: [ error ] };

    }

    return result;

  }

  private static formatOrderStr( orderArray: any, logger: any ): { Result: any[]; IsError: boolean; Errors: any[] } {

    let result = { Result: null, IsError: true, Errors: [] };

    try {

      if ( Array.isArray( orderArray ) === false ) {

        orderArray= JSON.parse( orderArray );

      }

      if ( Array.isArray( orderArray ) ) {

        let order = [];

        for ( let i = 0; i < orderArray.length; i++ ) {

          if ( orderArray[ i ][ 0 ].indexOf( '.' ) > 0 ) {

            let index = orderArray[ i ][ 0 ].indexOf( '.' );
            let arr = [];

            arr.push( ModelToRestAPIServiceController.sequelizeModelList[ orderArray[ i ][ 0 ].substring( 0, index ) ] );

            arr.push( orderArray[ i ][ 0 ].substring( index + 1 ) );

            for ( let j = 1; j < orderArray[ i ].length; j++ ) {

              arr.push( orderArray[ i ][ j ] );

            }

            order.push( arr );

          }
          else {

            order.push( orderArray[ i ] );

          }

        }

        result = { Result: order, IsError: false, Errors: [] };

      }

    }
    catch ( error ) {

      result = { Result: null, IsError: true, Errors: [ error ] };

    }

    return result;

  }

}
