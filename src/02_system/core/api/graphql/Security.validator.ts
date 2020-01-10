import { UserInputError } from 'apollo-server-express';
import CommonUtilities from '../../../common/CommonUtilities';
import SystemUtilities from '../../../common/SystemUtilities';

export const validators = {

  Mutation: {

    login: ( resolve: any, obj: any, args: any, context: any ) => {

      const { Username, Password } = args;

      const errors = [];

      if ( CommonUtilities.isNullOrEmpty( context.ClientId ) ) {

        errors.push( { Code: "ERROR_BAD_USER_INPUT", Message: "The ClientId parameter value cannot be empty", Details: { Field: "ClientId" } } );

      }

      if ( CommonUtilities.isNullOrEmpty( Username ) ) {

        errors.push( { Code: "ERROR_BAD_USER_INPUT", Message: "The Username parameter value cannot be empty", Details: { Field: "Username" } } );

      }

      if ( CommonUtilities.isNullOrEmpty( Password ) ) {

        errors.push( { Code: "ERROR_BAD_USER_INPUT", Message: "The Password parameter value cannot be empty", Details: { Field: "Password" } } );

      }

      if ( errors.length > 0 ) {

        const extensions = { "LogId": SystemUtilities.getUUIDv4(), "errors": errors };

        const userInputError = new UserInputError( 'Invalid user input parameter values', extensions );

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
