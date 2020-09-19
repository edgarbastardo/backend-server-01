import { readFileSync } from 'fs';
import cluster from "cluster";
//import { bookService } from '../services/book.service';
//import { AuthorByBookDataLoader } from '../dataloaders/author.dataloader';
//import { UserDataLoader } from '../dataloaders/user.dataloader';
import I18NManager from "../../../../../../02_system/common/managers/I18Manager";

const debug = require( 'debug' )( 'Dev798.api' );

export const typeDefs = readFileSync( `${ __dirname }/Dev798.graphql`, 'utf8' );

export const resolvers = {

  Query: {

    getDev798V1: ( obj: any, args: any, context: any, info: any ) => {

      const strLanguage = context.Language;

      let debugMark = debug.extend( '<Change_Code>' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
      debugMark( "Resolver => %s", "getDev798" );

      return {
               Code: 1,
               Message: I18NManager.translate( strLanguage, "Dev798" ),
               Errors: []
             };

    },

  },

  Mutation: {

    addDev798V1: ( obj: any, args: any, context: any, info: any ) => {

      const strLanguage = context.Language;

      let debugMark = debug.extend( 'CCEA3BAE4A60' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
      debugMark( "Resolver => %s", "addDev798" );

      return {
               Code: 1,
               Message: I18NManager.translate( strLanguage, "Dev798" ),
               Errors: []
             };

    },

  },

};
