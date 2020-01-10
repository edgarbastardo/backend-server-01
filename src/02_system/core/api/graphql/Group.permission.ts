import { allow, rule, and } from 'graphql-shield';
import SystemUtilities from "../../../common/SystemUtilities";

export const permissions = {

  Query: {

    getGroup: and( SystemUtilities.ruleCheckIsAuthenticated, SystemUtilities.ruleCheckIsAuthorized ), //allow,

  },

  Mutation: {

    addGroup: and( SystemUtilities.ruleCheckIsAuthenticated, SystemUtilities.ruleCheckIsAuthorized ), //allow,

  }

};

//AccessKind: 1 Public
//AccessKind: 2 Authenticated
//AccessKind: 3 Role

export const roles = {

  getGroup: { AccessKind: 3, AllowTagAccess: "#Administrator#", Roles: [ "Administrator" ], Description: "Get group by Id" },
  searchGroup: { AccessKind: 3, AllowTagAccess: "#Administrator#", Roles: [ "Administrator" ], Description: "Search group" },
  searchGroupCount: { AccessKind: 3, AllowTagAccess: "#Administrator#", Roles: [ "Administrator" ], Description: "Search group count" },
  addGroup: { AccessKind: 3, AllowTagAccess: "#Administrator#", Roles: [ "Administrator" ], Description: "Add new group" },
  modifyGroup: { AccessKind: 3, AllowTagAccess: "#Administrator#", Roles: [ "Administrator" ], Description: "Modify the group" },
  deleteGroup: { AccessKind: 3, AllowTagAccess: "#Administrator#", Roles: [ "Administrator" ], Description: "Delete the group" }

}