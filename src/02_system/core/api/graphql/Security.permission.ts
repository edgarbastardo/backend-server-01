import SystemUtilities from "../../../common/SystemUtilities";
import { allow } from "graphql-shield";
import MiddlewareManager from "../../../common/managers/MiddlewareManager";

const debug = require( 'debug' )( 'Security.permission' );

export const permissions = {

  Mutation: {

    login: allow,
    logout: MiddlewareManager.ruleCheckIsAuthenticated, //allow,
    tokenCheck: MiddlewareManager.ruleCheckIsAuthenticated, //allow,

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

export async function init( logger: any ): Promise<void> {

  //let debugMark = debug.extend( '315832C57E6C' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
  //debugMark( "Init called" );
  await MiddlewareManager.registerToBypassMiddlewareInterceptorsByPath( "tokenCheck" );
  await MiddlewareManager.registerToBypassMiddlewareInterceptorsByPath( "logout" );

}