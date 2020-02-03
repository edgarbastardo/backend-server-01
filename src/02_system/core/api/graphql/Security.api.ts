import { readFileSync } from 'fs';
//import { bookService } from '../services/book.service';
//import { AuthorByBookDataLoader } from '../dataloaders/author.dataloader';
//import { UserDataLoader } from '../dataloaders/user.dataloader';
import SecurityServiceController from "../../services/SecurityService.controller";

export const typeDefs = readFileSync( `${ __dirname }/Security.graphql`, 'utf8' );

export const resolvers = {

  Mutation: {

    login: async ( obj: any, args: any, context: any, info: any ) => {

      return await SecurityServiceController.login( context.TimeZoneId,
                                                    context.SourceIPAddress,
                                                    context.FrontendId,
                                                    args.Username,
                                                    args.Password,
                                                    null,
                                                    context.Logger );

    },

    logout: async ( obj: any, args: any, context: any, info: any ) => {

      return await SecurityServiceController.logout( context.Autorization,
                                           null,
                                           context.Logger );

    },

    tokenCheck: async ( obj: any, args: any, context: any, info: any ) => {

      return await SecurityServiceController.tokenCheck( context.Autorization,
                                               null,
                                               context.Logger );

    },

  },

}