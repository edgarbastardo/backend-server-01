//import SystemUtilities from "../../../../common/SystemUtilities";

import { allow } from "graphql-shield";

import MiddlewareManager from "../../../../common/managers/MiddlewareManager";

const debug = require( 'debug' )( 'Security.permission' );

export const permissions = {

  Mutation: {

    loginV1: allow,
    logoutV1: MiddlewareManager.ruleCheckIsAuthenticated, //allow,
    tokenCheckV1: MiddlewareManager.ruleCheckIsAuthenticated, //allow,

  }

};

//AccessKind: 1 Public
//AccessKind: 2 Authenticated
//AccessKind: 3 Role

export const roles = {

  loginV1: { AccessKind: 1, AllowTagAccess: "#Public#", Action: "graphql.loginV1", Roles: [ "Public" ], Description: "Create a new authentication token using credentials" },
  logoutV1: { AccessKind: 2, AllowTagAccess: "#Authenticated#", Action: "graphql.logoutV1", Roles: [ "Authenticated" ], Description: "Made the authentication token invalid" },
  tokenCheckV1: { AccessKind: 2, AllowTagAccess: "#Authenticated#", Action: "graphql.tokenCheckV1", Roles: [ "Authenticated" ], Description: "Check if authentication token is valid" }

}

export async function init( logger: any ): Promise<void> {

  //let debugMark = debug.extend( '315832C57E6C' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
  //debugMark( "Init called" );
  await MiddlewareManager.registerToBypassMiddlewareInterceptorsByPath( "v1TokenCheck" );
  await MiddlewareManager.registerToBypassMiddlewareInterceptorsByPath( "v1Logout" );

}
