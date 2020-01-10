import { readFileSync } from 'fs';
//import { bookService } from '../services/book.service';
//import { AuthorByBookDataLoader } from '../dataloaders/author.dataloader';
//import { UserDataLoader } from '../dataloaders/user.dataloader';

const debug = require( 'debug' )( 'Dev007.api' );

export const typeDefs = readFileSync( `${ __dirname }/Dev007.graphql`, 'utf8' );

export const resolvers = {

  Query: {

    getDev007: ( obj: any, args: any, context: any, info: any ) => {

      let debugMark = debug.extend( '08070E41E25E' );
      debugMark( "Resolver => %s", "getDev007" );

      return { Code: 1, Message: "Dev007", Errors: [] };

    },

  },

  Mutation: {

    addDev007: ( obj: any, args: any, context: any, info: any ) => {

      let debugMark = debug.extend( '077086A85E70' );
      debugMark( "Resolver => %s", "addDev007" );

      return { Code: 1, Message: "Dev007", Errors: [] };

    },

  },

};
