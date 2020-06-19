import { readFileSync } from 'fs';
import cluster from "cluster";
//import { bookService } from '../services/book.service';
//import { AuthorByBookDataLoader } from '../dataloaders/author.dataloader';
//import { UserDataLoader } from '../dataloaders/user.dataloader';
import I18NManager from "../../../../../../02_system/common/managers/I18Manager";

const debug = require( 'debug' )( 'Dev000.api' );

export const typeDefs = readFileSync( `${ __dirname }/Dev000.graphql`, 'utf8' );

export const resolvers = {

  Query: {

    getDev000V1: ( obj: any, args: any, context: any, info: any ) => {

      const strLanguage = context.Language;

      let debugMark = debug.extend( 'BB7111103C74' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
      debugMark( "Resolver => %s", "getDev000" );

      return {
               Code: 1,
               Message: I18NManager.translate( strLanguage, "Dev000" ),
               Errors: []
             };

    },

  },

  Mutation: {

    addDev000V1: ( obj: any, args: any, context: any, info: any ) => {

      const strLanguage = context.Language;

      let debugMark = debug.extend( 'CCEA3BAE4A60' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
      debugMark( "Resolver => %s", "addDev000" );

      return {
               Code: 1,
               Message: I18NManager.translate( strLanguage, "Dev000" ),
               Errors: []
             };

    },

  },

};
