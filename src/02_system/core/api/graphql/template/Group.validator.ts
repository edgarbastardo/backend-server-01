import { UserInputError } from 'apollo-server-express';
import CommonUtilities from '../../../../common/CommonUtilities';
import SystemUtilities from '../../../../common/SystemUtilities';
import I18NManager from '../../../../common/managers/I18Manager';
//import { extensions } from 'sequelize/types/lib/utils/validator-extras';

export const validators = {

  Query: {

    getGroup: ( resolve: any, obj: any, args: any, context: any ) => {

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
      elseif ( CommonUtilities.isNotNullOrEmpty( TimeZoneId ) &&
               CommonUtilities.isValidTimeZone( TimeZoneId ) === false ) {

        errors.push(
                     {
                       Code: -1002,
                       Description: I18NManager.translateSync( strLanguage, `The TimeZoneId parameter value [${TimeZoneId}] is invalid` )
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
      if ( args.input !== 'expected' ) {

         throw new UserInputError(
                                   'Form Arguments invalid',
                                   { invalidArgs: Object.keys(args), }
                                 );

      };
      */
      /*
      const { first, offset } = args;

      if ( first && !( first >= 1 && first <= 100 ) ) {
        throw new UserInputError('You can query maximum 100 records!');
      }
      if ( offset && offset < 1 ) {
        throw new UserInputError('Offset must be a positive integer!');
      }
      */

      return resolve( obj, args, context );

    }

  }

};
