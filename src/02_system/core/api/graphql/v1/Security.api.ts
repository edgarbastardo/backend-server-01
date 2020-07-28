import { readFileSync } from 'fs';
//import { bookService } from '../services/book.service';
//import { AuthorByBookDataLoader } from '../dataloaders/author.dataloader';
//import { UserDataLoader } from '../dataloaders/user.dataloader';
import SecurityServiceController from "../../../services/v1/SecurityService.controller";

export const typeDefs = readFileSync( `${ __dirname }/Security.graphql`, 'utf8' );

export const resolvers = {

  Mutation: {

    loginV1: async ( obj: any, args: any, context: any, info: any ) => {

      return await SecurityServiceController.login( context,
                                                    args.Username,
                                                    args.Password,
                                                    null,
                                                    context.Logger );

    },

    logoutV1: async ( obj: any, args: any, context: any, info: any ) => {

      return await SecurityServiceController.logout( context.Language,
                                                     context.Authorization,
                                                     null,
                                                     context.Logger );

    },

    tokenCheckV1: async ( obj: any, args: any, context: any, info: any ) => {

      return await SecurityServiceController.tokenCheck( { context } as any,
                                                         null,
                                                         context.Logger );

    },

  },

}
