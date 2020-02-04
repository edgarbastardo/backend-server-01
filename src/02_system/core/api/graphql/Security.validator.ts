import { UserInputError } from 'apollo-server-express';
import CommonUtilities from '../../../common/CommonUtilities';
import SystemUtilities from '../../../common/SystemUtilities';
import I18NManager from '../../../common/managers/I18Manager';

export const validators = {

  Mutation: {

    login: ( resolve: any, obj: any, args: any, context: any ) => {

      const strLanguage = context.Language;

      const { Username, Password } = args;

      const errors = [];

      if ( CommonUtilities.isNullOrEmpty( context.FrontendId ) ) {

        errors.push(
                     {
                       Code: "ERROR_BAD_USER_INPUT",
                       Message: I18NManager.translateSync( strLanguage, "The FrontendId parameter value cannot be empty" ),
                       Details: { Field: "FrontendId" } 
                     }
                   );

      }

      if ( CommonUtilities.isNullOrEmpty( Username ) ) {

        errors.push(
                     {
                       Code: "ERROR_BAD_USER_INPUT",
                       Message: I18NManager.translateSync( strLanguage, "The Username parameter value cannot be empty" ),
                       Details: { Field: "Username" }
                     }
                   );

      }

      if ( CommonUtilities.isNullOrEmpty( Password ) ) {

        errors.push(
                     {
                       Code: "ERROR_BAD_USER_INPUT",
                       Message: I18NManager.translateSync( strLanguage, "The Password parameter value cannot be empty" ),
                       Details: { Field: "Password" }
                     }
                   );

      }

      if ( errors.length > 0 ) {

        const extensions = { "LogId": SystemUtilities.getUUIDv4(), "errors": errors };

        const userInputError = new UserInputError(
                                                   I18NManager.translateSync( strLanguage, 'Invalid user input parameter values' ),
                                                   extensions
                                                 );

        throw userInputError;

      }

      return resolve( obj, args, context );

    },

    logout: ( resolve: any, obj: any, args: any, context: any ) => {

      return resolve( obj, args, context ); //No validation needed

    },

    tokenCheck: ( resolve: any, obj: any, args: any, context: any ) => {

      return resolve( obj, args, context ); //No validation needed

    }

  }

};
