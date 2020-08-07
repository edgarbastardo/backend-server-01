import { readFileSync } from 'fs';
import cluster from "cluster";
//import { bookService } from '../services/book.service';
//import { AuthorByBookDataLoader } from '../dataloaders/author.dataloader';
//import { UserDataLoader } from '../dataloaders/user.dataloader';
import I18NManager from "../../../../../02_system/common/managers/I18Manager";

const debug = require( 'debug' )( 'Dev007.api' );

export const typeDefs = readFileSync( `${ __dirname }/Dev007.graphql`, 'utf8' );

export const resolvers = {

  Query: {

    getDev000: ( obj: any, args: any, context: any, info: any ) => {

      const strLanguage = context.Language;

      let debugMark = debug.extend( 'FC12015DBFFB' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
      debugMark( "Resolver => %s", "getDev007" );

      return {
               Code: 1,
               Message: I18NManager.translate( strLanguage, "Dev007" ),
               Errors: []
             };

    },

  },

  Mutation: {

    addDev000: ( obj: any, args: any, context: any, info: any ) => {

      const strLanguage = context.Language;

      let debugMark = debug.extend( '0494F39DB26C' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
      debugMark( "Resolver => %s", "addDev007" );

      return {
               Code: 1,
               Message: I18NManager.translate( strLanguage, "Dev007" ),
               Errors: []
             };

    },

  },

};
