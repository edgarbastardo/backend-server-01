import { UserInputError } from 'apollo-server-express';
import CommonUtilities from '../../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../../02_system/common/SystemUtilities';
//import { extensions } from 'sequelize/types/lib/utils/validator-extras';

const debug = require( 'debug' )( 'Dev000.validator' );

export const validators = {

  Query: {

    getDev000: ( resolve: any, obj: any, args: any, context: any ) => {

      const { Id } = args;

      const errors = [];

      if ( CommonUtilities.isNullOrEmpty( Id ) ) {

        errors.push( { Code: "ERROR_BAD_USER_INPUT", Message: "The Id parameter value cannot be empty", Details: { Field: "Id" } } );

      }

      /*
      if ( CommonUtilities.isNotNullOrEmpty( TimeZoneId ) ) {

        errors.push( { Code: -1002, Description: "The TimeZoneId param cannot be empty" } );

      }

      if ( CommonUtilities.isValidTimeZone( TimeZoneId ) === false ) {

        errors.push( { Code: -1002, Description: `The TimeZoneId parameter value [${TimeZoneId}] is invalid` } );

      }
      */

      const extensions = { "LogId": SystemUtilities.getUUIDv4(), "Errors": errors };

      if ( errors.length > 0 ) {

        const userInputError = new UserInputError( 'Invalid user input parameter values', extensions );

        //userInputerror.logId = SystemUtilities.getUUIDv4();

        throw userInputError;

      }
      /*
      // https://www.apollographql.com/docs/apollo-server/data/errors/
      */

      return resolve( obj, args, context );

    },

  },

  Mutation: {

    addDev000: ( resolve: any, obj: any, args: any, context: any ) => {

      const { Id } = args;

      const errors = [];

      if ( CommonUtilities.isNullOrEmpty( Id ) ) {

        errors.push( { Code: "ERROR_BAD_USER_INPUT", Message: "The Id parameter value cannot be empty", Details: { Field: "Id" } } );

      }

      /*
      if ( CommonUtilities.isNotNullOrEmpty( TimeZoneId ) ) {

        errors.push( { Code: -1002, Description: "The TimeZoneId param cannot be empty" } );

      }

      if ( CommonUtilities.isValidTimeZone( TimeZoneId ) === false ) {

        errors.push( { Code: -1002, Description: `The TimeZoneId parameter value [${TimeZoneId}] is invalid` } );

      }
      */

      const extensions = { "LogId": SystemUtilities.getUUIDv4(), "Errors": errors };

      if ( errors.length > 0 ) {

        const userInputError = new UserInputError( 'Invalid user input parameter values', extensions );

        //userInputerror.logId = SystemUtilities.getUUIDv4();

        throw userInputError;

      }
      /*
      // https://www.apollographql.com/docs/apollo-server/data/errors/
      */

      return resolve( obj, args, context );

    }

  }

};
