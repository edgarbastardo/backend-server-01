import { readFileSync } from 'fs';
//import { bookService } from '../services/book.service';
//import { AuthorByBookDataLoader } from '../dataloaders/author.dataloader';
//import { UserDataLoader } from '../dataloaders/user.dataloader';

const debug = require( 'debug' )( 'Dev000.api' );

export const typeDefs = readFileSync( `${ __dirname }/Dev000.graphql`, 'utf8' );

export const resolvers = {

  Query: {

    getDev000: ( obj: any, args: any, context: any, info: any ) => {

      let debugMark = debug.extend( 'BB7111103C74' );
      debugMark( "Resolver => %s", "getDev000" );

      return { Code: 1, Message: "Dev000", Errors: [] };

    },

  },

  Mutation: {

    addDev000: ( obj: any, args: any, context: any, info: any ) => {

      let debugMark = debug.extend( 'CCEA3BAE4A60' );
      debugMark( "Resolver => %s", "addDev000" );

      return { Code: 1, Message: "Dev000", Errors: [] };

    },

  },

};
