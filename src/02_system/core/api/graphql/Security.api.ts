import { readFileSync } from 'fs';
//import { bookService } from '../services/book.service';
//import { AuthorByBookDataLoader } from '../dataloaders/author.dataloader';
//import { UserDataLoader } from '../dataloaders/user.dataloader';
import SecurityService from "../../../common/database/services/SecurityService";

export const typeDefs = readFileSync( `${ __dirname }/Security.graphql`, 'utf8' );

export const resolvers = {

  Mutation: {

    login: async ( obj: any, args: any, context: any, info: any ) => {

      return await SecurityService.login( context.TimeZoneId,
                                          context.SourceIPAddress,
                                          context.ClientId,
                                          args.Username,
                                          args.Password,
                                          null,
                                          context.Logger );

    },

    logout: async ( obj: any, args: any, context: any, info: any ) => {

      return await SecurityService.logout( context.Autorization,
                                           null,
                                           context.Logger );

    },

    tokenCheck: async ( obj: any, args: any, context: any, info: any ) => {

      return await SecurityService.tokenCheck( context.Autorization,
                                               null,
                                               context.Logger );

    },

  },

}