import SystemUtilities from "../../../common/SystemUtilities";
import { allow } from "graphql-shield";

export const permissions = {

  Mutation: {

    login: allow,
    logout: SystemUtilities.ruleCheckIsAuthenticated, //allow,
    tokenCheck: SystemUtilities.ruleCheckIsAuthenticated, //allow,

  }

};

//AccessKind: 1 Public
//AccessKind: 2 Authenticated
//AccessKind: 3 Role

export const roles = {

  login: { AccessKind: 1, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Create a new authentication token using credentials" },
  logout: { AccessKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Made the authentication token invalid" },
  tokenCheck: { AccessKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Check if authentication token is valid" }

}