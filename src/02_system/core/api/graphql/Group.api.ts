import { readFileSync } from 'fs';
//import { bookService } from '../services/book.service';
//import { AuthorByBookDataLoader } from '../dataloaders/author.dataloader';
//import { UserDataLoader } from '../dataloaders/user.dataloader';

const debug = require( 'debug' )( 'Group.api' );

export const typeDefs = readFileSync( `${ __dirname }/Group.graphql`, 'utf8' );

export const resolvers = {

  Query: {

    getGroup: ( obj: any, args: any, context: any, info: any ) => {

      let debugMark = debug.extend( 'FE44B7906E09' );
      debugMark( "Resolver => %s", "getGroup" );

      return { Code: 1, Message: "Ok", Errors: [] };

    },

  },

  Mutation: {

    addGroup: ( obj: any, args: any, context: any, info: any ) => {

      let debugMark = debug.extend( '1375D08305F2' );
      debugMark( "%s", args.Group.Name );
      debugMark( "%s", args.Group.Comment );

      return { Code: 1, Message: "Ok", Errors: [] };

    },

  },

  /*
  Book: {

    creator: ({ creatorId }, args, context, info) => {
            const userDataLoader = UserDataLoader.getInstance(context);

            return userDataLoader.load(creatorId);
    },

    authors: ({ id }, args, context, info) => {
            const authorByBookDataLoader = AuthorByBookDataLoader.getInstance(context);

            return authorByBookDataLoader.load(id);
    }
  }
    */
};
