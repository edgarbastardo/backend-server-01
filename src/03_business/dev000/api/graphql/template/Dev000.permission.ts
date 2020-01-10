import { allow, rule, and } from 'graphql-shield';
import SystemUtilities from '../../../../../02_system/common/SystemUtilities';

export const permissions = {

  Query: {

    getDev000: and( SystemUtilities.ruleCheckIsAuthenticated ), //allow,

  },

  Mutation: {

    addDev000: and( SystemUtilities.ruleCheckIsAuthenticated ), //allow,

  }

};

//AccessKind: 1 Public
//AccessKind: 2 Authenticated
//AccessKind: 3 Role

export const roles = {

  getDev000: { AccessKind: 3, AllowTagAccess: "#Administrator#", Roles: [ "Administrator" ], Description: "Dev000 example query" },
  addDev000: { AccessKind: 3, AllowTagAccess: "#Administrator#", Roles: [ "Administrator" ], Description: "Dev000 example mutation" },

}