import { UserInputError } from 'apollo-server-express';
import CommonUtilities from '../../../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../../../02_system/common/SystemUtilities';
import I18NManager from '../../../../../../02_system/common/managers/I18Manager';
//import { extensions } from 'sequelize/types/lib/utils/validator-extras';

const debug = require( 'debug' )( 'Dev798.validator' );

export const validators = {

  Query: {

    getDev798V1: ( resolve: any, obj: any, args: any, context: any ) => {

      const strLanguage = context.Language;

      const { Id } = args;

      const errors = [];

      if ( CommonUtilities.isNullOrEmpty( Id ) ) {

        errors.push(
                     {
                       Code: "ERROR_BAD_USER_INPUT",
                       Message: I18NManager.translateSync( strLanguage, "The Id parameter value cannot be empty" ),
                       Details: { Field: "Id" }
                     }
                   );

      }

      /*
      if ( CommonUtilities.isNotNullOrEmpty( TimeZoneId ) ) {

        errors.push(
                     {
                       Code: -1002,
                       Description: I18NManager.translateSync( strLanguage, "The TimeZoneId param cannot be empty" )
                     }
                   );

      }

      if ( CommonUtilities.isValidTimeZone( TimeZoneId ) === false ) {

        errors.push(
                     {
                       Code: -1002,
                       Description: I18NManager.translateSync( strLanguage, 'The TimeZoneId parameter value [%s] is invalid', TimeZoneId )
                     }
                   );

      }
      */

      const extensions = { "LogId": SystemUtilities.getUUIDv4(), "Errors": errors };

      if ( errors.length > 0 ) {

        const userInputError = new UserInputError(
                                                   I18NManager.translateSync( strLanguage, 'Invalid user input parameter values' ),
                                                   extensions
                                                 );

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

    addDev798V1: ( resolve: any, obj: any, args: any, context: any ) => {

      const strLanguage = context.Language;

      const { Id } = args;

      const errors = [];

      if ( CommonUtilities.isNullOrEmpty( Id ) ) {

        errors.push(
                     {
                       Code: "ERROR_BAD_USER_INPUT",
                       Message: I18NManager.translateSync( strLanguage, "The Id parameter value cannot be empty" ),
                       Details: { Field: "Id" }
                     }
                   );

      }

      /*
      if ( CommonUtilities.isNotNullOrEmpty( TimeZoneId ) ) {

        errors.push(
                     {
                       Code: -1002,
                       Description: I18NManager.translateSync( strLanguage, "The TimeZoneId param cannot be empty" )
                     }
                   );

      }

      if ( CommonUtilities.isValidTimeZone( TimeZoneId ) === false ) {

        errors.push(
                     {
                       Code: -1002,
                       Description: I18NManager.translateSync( strLanguage, 'The TimeZoneId parameter value [%s] is invalid', TimeZoneId )
                     }
                   );

      }
      */

      const extensions = { "LogId": SystemUtilities.getUUIDv4(), "Errors": errors };

      if ( errors.length > 0 ) {

        const userInputError = new UserInputError(
                                                   I18NManager.translateSync( strLanguage, 'Invalid user input parameter values' ),
                                                   extensions
                                                 );

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
