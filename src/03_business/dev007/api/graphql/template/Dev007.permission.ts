import { allow, rule, and } from 'graphql-shield';
import SystemUtilities from '../../../../../02_system/common/SystemUtilities';

const debug = require( 'debug' )( 'Dev007.permission' );

export const permissions = {

  Query: {

    getDev007: and( SystemUtilities.ruleCheckIsAuthenticated ), //allow,

  },

  Mutation: {

    addDev007: and( SystemUtilities.ruleCheckIsAuthenticated ), //allow,

  }

};

//AccessKind: 1 Public
//AccessKind: 2 Authenticated
//AccessKind: 3 Role

export const roles = {

  getDev007: { AccessKind: 3, AllowTagAccess: "#Administrator#", Roles: [ "Administrator" ], Description: "Dev007 example query" },
  addDev007: { AccessKind: 3, AllowTagAccess: "#Administrator#", Roles: [ "Administrator" ], Description: "Dev007 example mutation" },

}