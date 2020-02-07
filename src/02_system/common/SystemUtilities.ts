import moment, { Moment } from "moment-timezone";
import XXHash from 'xxhashjs';
//import  from "moment-timezone";
import uuidv4 from 'uuid/v4';
import Hashes from 'jshashes';
import readChunk from 'read-chunk';
import fileType from 'file-type';
import { Request, Response, NextFunction } from 'express';
import { rule } from "graphql-shield";
import { ApolloError } from "apollo-server-errors";
//import { loggers } from "winston";
import fs from 'fs'; //Load the filesystem module
import path from 'path';

import archiver, { ArchiverError } from 'archiver';

import NodeRSA from 'node-rsa';

import Validator from 'validatorjs';

import CommonConstants from "./CommonConstants";
import SystemConstants from "./SystemContants";

import CommonUtilities from "./CommonUtilities";

import PersonService from "./database/services/PersonService";
import UserGroupService from "./database/services/UserGroupService";
import UserService from "./database/services/UserService";
import UserSessionStatusService from "./database/services/UserSessionStatusService";
import UserSessionPersistentService from "./database/services/UserSessionPersistentService";
import RoleService from "./database/services/RoleService";

import CacheManager from "./managers/CacheManager";
import LoggerManager from "./managers/LoggerManager";
import I18NManager from "./managers/I18Manager";

const debug = require( 'debug' )( 'SystemUtilities' );

export default class SystemUtilities {

  static startRun: Moment = null;
  static baseRunPath: string = null;
  static baseRootPath: string = null;
  static isNetworkLeader: boolean = false;
  static isNetworkLeaderAt: Moment = null;

  static getCurrentDateAndTime(): any {

    let result = null;

    try {

      result = moment().tz( CommonUtilities.getCurrentTimeZoneId() );

    }
    catch ( error ) {


    }

    return result;

  }

  static getCurrentDateAndTimeFrom( at: any ): any {

    let result = null;

    try {

      if ( at ) {

        if ( moment( at ).isValid() ) {

          result = moment( at ).tz( CommonUtilities.getCurrentTimeZoneId() );

        }

      }

    }
    catch ( error ) {


    }

    return result;

  }

  static selectMoreCloseTimeBetweenTwo( strDateTime1: string,
                                        strDateTime2: string ): any {

    let result = null;

    try {

      let dateTime1 = null;
      let dateTime2 = null;

      if ( strDateTime1 ) {

        dateTime1 = moment( strDateTime1 );

      }

      if ( strDateTime2 ) {

        dateTime2 = moment( strDateTime2 );

      }

      if ( dateTime1 && dateTime2 ) {

        if ( dateTime1.isBefore( dateTime2 ) ) {

          result = strDateTime1;

        }
        else if ( dateTime2.isBefore( dateTime1 ) ) {

          result = strDateTime2;

        }

      }
      else if ( dateTime1 ) {

        result = strDateTime1;

      }
      else if ( dateTime2 ) {

        result = strDateTime2;

      }

    }
    catch ( error ) {


    }

    return result;

  }

  static isDateAndTimeBefore( strDateTime: string ): boolean {

    let bResult = false;

    try {

      bResult = strDateTime ? moment().tz( CommonUtilities.getCurrentTimeZoneId() ).isBefore( strDateTime ) : false;

    }
    catch ( error ) {


    }

    return bResult;

  }

  static isDateAndTimeAfter( strDateTime: string ): boolean {

    let bResult = false;

    try {

      bResult = strDateTime ? moment().tz( CommonUtilities.getCurrentTimeZoneId() ).isAfter( strDateTime ) : false;

    }
    catch ( error ) {


    }

    return bResult;

  }

  static getCurrentDateAndTimeIncDays( intDays: number ): any {

    let result = null;

    try {

      result = moment().tz( CommonUtilities.getCurrentTimeZoneId() ).add( intDays, "days" );

    }
    catch ( error ) {


    }

    return result;

  }

  static getCurrentDateAndTimeDecDays( intDays: number ): any {

    let result = null;

    try {

      result = moment().tz( CommonUtilities.getCurrentTimeZoneId() ).subtract( intDays, "days" ); //moment().format( CommonUtilities.getCurrentTimeZoneId() );

    }
    catch ( error ) {


    }

    return result;

  }

  static getCurrentDateAndTimeIncMinutes( intMinutes: number ): any {

    let result = null;

    try {

      result = moment().tz( CommonUtilities.getCurrentTimeZoneId() ).add( intMinutes, "minutes" );

    }
    catch ( error ) {


    }

    return result;

  }

  static transformObjectToTimeZone( row: any, strTimeZoneId: string, logger: any ): any {

    try {

      if ( CommonUtilities.isNotNullOrEmpty( row.CreatedAt ) ) {

        row.CreatedAt = moment( row.CreatedAt ).tz( strTimeZoneId ).format();

      }

      if ( CommonUtilities.isNotNullOrEmpty( row.UpdatedAt ) ) {

        row.UpdatedAt = moment( row.UpdatedAt ).tz( strTimeZoneId ).format();

      }

      if ( CommonUtilities.isNotNullOrEmpty( row.DisabledAt ) ) {

        row.DisabledAt = moment( row.DisabledAt ).tz( strTimeZoneId ).format();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.transformObjectToTimeZone.name;

      const strMark = "22B953090E53";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return row;

  }

  static transformModelToTimeZone( model: any, strTimeZoneId: string, logger: any ): any {

    if ( CommonUtilities.isNotNullOrEmpty( model ) &&
         CommonUtilities.isNotNullOrEmpty( model.dataValues ) ) {

      this.transformObjectToTimeZone( model.dataValues, strTimeZoneId, logger );

    }

    return model;

  }

  static transformToTimeZone( at: any,
                              strTimeZoneId: string,
                              strDateFormat: string,
                              logger: any ) {

    let result = null;

    try {

      result = moment( at ).tz( strTimeZoneId ).format( strDateFormat );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.transformToTimeZone.name;

      const strMark = "698D544926FD";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return result;

  }

  static hashString( strToHash: string, intAlgorimts: number = 1, logger: any ): string {

    const _SEED = 0xDEADBEEF;

    let strResult: string = null;

    try {

      if ( intAlgorimts == 1 ) {

        strResult = XXHash.h64( strToHash, _SEED ).toString( 16 );

      }
      else if ( intAlgorimts == 2 ) {

        strResult = Hashes.CRC32( strToHash ).toString( 16 );

      }
      else {

        strResult = strToHash;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.hashString.name;

      const strMark = "272864A729F7";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return strResult;

  }

  static getUUIDv4(): string {

    return uuidv4();

  }

  /*
  //checkUserSessionStatusPersistentExpired
  static checkUserSessionStatusPersistentExpired( sessionPersistenStatus: any,
                                                  logger: any ): any {

    let result = { Expired: false, Duration: null };

    try {

      / *
      if ( sessionPersistenStatus.HardLimit ) { //Expired time calculated from Limit

        //Check ExpireAt field not more old to current date time
        const duration = moment.duration( { seconds: SystemUtilities.getCurrentDateAndTime().diff( sessionPersistenStatus.HardLimit, "seconds" ) } );

        result = { Expired: duration.asSeconds() >= 0, Duration: duration };

      }
      else
      * /
      if ( sessionPersistenStatus.ExpireKind === 3 &&
           sessionPersistenStatus.ExpireOn ) { //Expired time calculated unsing ExpireOn field

        const expireOn = moment( sessionPersistenStatus.ExpireOn );

        if ( expireOn.isValid() ) {

          //Check CreatedAt field not more old to ExpireOn minutes
          const duration = moment.duration( { seconds: SystemUtilities.getCurrentDateAndTime().diff( expireOn, "seconds" ) } );

          result = { Expired: duration.asSeconds() >= 0, Duration: duration };

        }

      }

      / *
      if ( result.Expired === false &&
           CommonUtilities.isNotNullOrEmpty( sessionStatus.LoggedOutAt ) ) {

        const duration = moment.duration( { seconds: SystemUtilities.getCurrentDateAndTime().diff( sessionStatus.LoggedOutAt, "seconds" ) } );

        result = { Expired: true, Duration: duration };

      }
      * /

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkUserSessionStatusPersistentExpired.name;

      const strMark = "645AC1C7F0D2";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return result;

  }
  */

  static checkUserSessionStatusExpired( sessionStatus: any,
                                        logger: any ): any {

    let result = { Expired: false, Duration: null };

    try {

      if ( sessionStatus.ExpireKind === 0 ) { //Expired time calculated from UpdatedAt

        const bLimitIsExpired = SystemUtilities.isDateAndTimeAfter( sessionStatus.HardLimit );

        if ( bLimitIsExpired ) {

          const duration = moment.duration(
                                            {
                                              seconds: SystemUtilities.getCurrentDateAndTime().diff( sessionStatus.HardLimit, "seconds" )
                                            }
                                          );

          result = { Expired: bLimitIsExpired, Duration: duration };

        }
        else {

          //Check UpdateAt field not more old to ExpireOn minutes
          const duration = moment.duration( { seconds: SystemUtilities.getCurrentDateAndTime().diff( sessionStatus.UpdatedAt, "seconds" ) } );

          result = {
                     Expired: duration.asSeconds() / 60 >= sessionStatus.ExpireOn || bLimitIsExpired,
                     Duration: duration
                   };

        }

      }
      else if ( sessionStatus.ExpireKind === 1 ) { //Expired time calculated from CreatedAt

        const bLimitIsExpired = SystemUtilities.isDateAndTimeAfter( sessionStatus.HardLimit );

        if ( bLimitIsExpired ) {

          const duration = moment.duration(
                                            {
                                              seconds: SystemUtilities.getCurrentDateAndTime().diff( sessionStatus.HardLimit, "seconds" )
                                            }
                                          );

          result = {
                     Expired: bLimitIsExpired,
                     Duration: duration
                   };

        }
        else {

          //Check CreatedAt field not more old to ExpireOn minutes
          const duration = moment.duration(
                                            {
                                              seconds: SystemUtilities.getCurrentDateAndTime().diff( sessionStatus.CreatedAt, "seconds" )
                                            }
                                          );

          result = {
                     Expired: duration.asSeconds() / 60 >= sessionStatus.ExpireOn,
                     Duration: duration
                   };

        }

      }
      else if ( sessionStatus.ExpireKind === 2 ) { //Fixed date and time to expire

        const duration = moment.duration(
                                          {
                                            seconds: SystemUtilities.getCurrentDateAndTime().diff( sessionStatus.ExpireOn, "seconds" )
                                          }
                                        );

        result = { Expired: duration.asSeconds() > 0, Duration: duration };

      }
      else if ( sessionStatus.ExpireKind === 3 &&  //Persistent session token
                sessionStatus.ExpireOn ) {         //Expired time calculated unsing ExpireOn field

        const expireOn = moment( sessionStatus.ExpireOn );

        if ( expireOn.isValid() ) {

          //Check CreatedAt field not more old to ExpireOn minutes
          const duration = moment.duration(
                                            {
                                              seconds: SystemUtilities.getCurrentDateAndTime().diff( expireOn, "seconds" )
                                            }
                                          );

          result = {
                     Expired: duration.asSeconds() >= 0,
                     Duration: duration
                   };

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkUserSessionStatusExpired.name;

      const strMark = "48F8E318CD0B";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return result;

  }

  static async getUserSessionStatusPersistent( strToken: string,
                                               requestContext: any,
                                               bUpdateAt: boolean,
                                               bForceReadFromDB: boolean,
                                               transaction: any,
                                               logger: any ):Promise<any> {

    let result = null;

    let bFromCache = false;

    if ( CommonUtilities.isNotNullOrEmpty( strToken ) ) {

      if ( bForceReadFromDB === false ||
           process.env.USER_SESION_STATUS_FROM_CACHE === "1" ) {

        const strJSONUserSessionStatus = await CacheManager.getData( strToken,
                                                                     logger ); //First try with cache

        result = CommonUtilities.parseJSON( strJSONUserSessionStatus,
                                            logger ); //Try to parse and transform to json object

        bFromCache = true;

      }

      let userRoles = "";
      let groupRoles = "";

      if ( CommonUtilities.isNullOrEmpty( result ) ) { //Is not in cache or is not valid json struct

        // ANCHOR  getUserSessionPersistentByToken
        let sessionPersistent = await UserSessionPersistentService.getUserSessionPersistentByToken( strToken,
                                                                                                    null,
                                                                                                    logger ); //Find in the database

        if ( CommonUtilities.isNotNullOrEmpty( sessionPersistent ) ) {

          sessionPersistent = ( sessionPersistent as any ).dataValues; //Get only the basic json struct object with field values from the orm model

          const UserInfo = await UserService.getById( sessionPersistent.UserId,
                                                      null,
                                                      null,
                                                      logger );

          userRoles = ( UserInfo as any ).dataValues.Role;

          const GroupInfo = await UserGroupService.getById( UserInfo.GroupId,
                                                            null,
                                                            null,
                                                            logger );

          groupRoles = ( GroupInfo as any ).dataValues.Role;

          if ( UserInfo.PersonId ) {

            const PersonInfo = await PersonService.getById( UserInfo.PersonId,
                                                            null,
                                                            null,
                                                            logger );

            sessionPersistent[ "PersonId" ] = PersonInfo.Id;
            sessionPersistent[ "Title" ] = PersonInfo.Title;
            sessionPersistent[ "FirstName" ] = PersonInfo.FirstName;
            sessionPersistent[ "LastName" ] = PersonInfo.LastName;
            sessionPersistent[ "EMail" ] = PersonInfo.EMail;
            sessionPersistent[ "Phone" ] = PersonInfo.Phone;

          }
          else {

            sessionPersistent[ "PersonId" ] = "";
            sessionPersistent[ "Title" ] = "";
            sessionPersistent[ "FirstName" ] = "";
            sessionPersistent[ "LastName" ] = "";
            sessionPersistent[ "EMail" ] = "";
            sessionPersistent[ "Phone" ] = "";

          }

          //sessionPersistent[ "UserName" ] = UserInfo.Name;
          sessionPersistent[ "UserTag" ] = UserInfo.Tag;
          sessionPersistent[ "UserGroupId" ] = GroupInfo.Id;
          sessionPersistent[ "UserGroupName" ] = GroupInfo.Name;
          sessionPersistent[ "UserGroupTag" ] = GroupInfo.Tag;

          bFromCache = false;

        }

        if ( CommonUtilities.isNotNullOrEmpty( sessionPersistent ) &&
             CommonUtilities.isNullOrEmpty( sessionPersistent.DisabledAt ) &&
             SystemUtilities.checkUserSessionStatusExpired( sessionPersistent, logger ).Expired === false &&
             bUpdateAt ) {

          result = UserSessionStatusService.getUserSessionStatusByToken( strToken,
                                                                         null,
                                                                         logger );

          const strRolesMerged = SystemUtilities.mergeTokens( groupRoles,
                                                              userRoles,
                                                              true,
                                                              logger );

          const expireAt = SystemUtilities.selectMoreCloseTimeBetweenTwo( sessionPersistent.DisabledAt,
                                                                          sessionPersistent.ExpireAt );

          if ( CommonUtilities.isNullOrEmpty( result ) ) {

            //Insert new entry in the session status table
            result = {
                       UserId: sessionPersistent.UserId,
                       UserGroupId: sessionPersistent[ "UserGroupId" ],
                       Token: strToken,
                       BinaryDataToken: sessionPersistent[ "BinaryDataToken" ],
                       SocketToken: sessionPersistent[ "SocketToken" ],
                       FrontendId: requestContext && requestContext.FrontendId ? requestContext.FrontendId: "Unknown_FrontendId",
                       SourceIPAddress: requestContext && requestContext.SourceIPAddress ? requestContext.SourceIPAddress: "Unknown_IP",
                       Role: strRolesMerged,
                       UserName: sessionPersistent[ "User" ],
                       ExpireKind: 3,
                       ExpireOn: expireAt,
                       HardLimit: null,
                       Tag: sessionPersistent[ "Tag" ],
                       CreatedBy: sessionPersistent[ "User" ],
                       UpdatedBy: sessionPersistent[ "User" ],
                     };

          }
          else {

            result = ( result as any ).dataValues; //Get only the basic json struct object with field values from the orm model

            //Update the entry in the session status table
            result.Role = strRolesMerged;
            result.ExpireKind = 3;
            result.ExpireOn = expireAt;
            result.HardLimit = null;

          }

          //Add additional info to memory cache struct
          result[ "PersonId" ] = sessionPersistent[ "PersonId" ];
          result[ "Title" ] = sessionPersistent[ "Title" ];
          result[ "FirstName" ] = sessionPersistent[ "FirstName" ];
          result[ "LastName" ] = sessionPersistent[ "LastName" ];
          result[ "EMail" ] = sessionPersistent[ "EMail" ];
          result[ "Phone" ] = sessionPersistent[ "Phone" ];

          result[ "Group" ] = sessionPersistent[ "Group" ];

        }

      }

      if ( CommonUtilities.isNotNullOrEmpty( result ) &&
           SystemUtilities.checkUserSessionStatusExpired( result, logger ).Expired === false &&
           bUpdateAt ) {

        SystemUtilities.createOrUpdateUserSessionStatus( strToken,
                                                         result,
                                                         bFromCache === false, //Set roles?
                                                         groupRoles,
                                                         userRoles,
                                                         false,    //Force update?
                                                         1,        //Only 1 try
                                                         7 * 1000, //Second
                                                         transaction,
                                                         logger );

      }

    }

    if ( CommonUtilities.isNotNullOrEmpty( result ) ) {

      result.FromCache = bFromCache;

    }

    return result;

  }

  static async getUserSessionStatusTemporal( strToken: string,
                                             requestContext: any,
                                             bUpdateAt: boolean,
                                             bForceReadFromDB: boolean,
                                             transaction: any,
                                             logger: any ):Promise<any> {

    let result = null;

    let bFromCache = false;

    if ( CommonUtilities.isNotNullOrEmpty( strToken ) ) {

      if ( bForceReadFromDB === false ||
           process.env.USER_SESION_STATUS_FROM_CACHE === "1" ) {

        const strJSONUserSessionStatus = await CacheManager.getData( strToken,
                                                                     logger ); //First try with cache

        result = CommonUtilities.parseJSON( strJSONUserSessionStatus,
                                            logger ); //Try to parse and transform to json object

        bFromCache = true;

      }

      let userRoles = "";
      let groupRoles = "";

      if ( CommonUtilities.isNullOrEmpty( result ) ) { //Is not in cache or is not valid json struct

        // ANCHOR  getUserSessionStatusByToken
        result = await UserSessionStatusService.getUserSessionStatusByToken( strToken,
                                                                             null,
                                                                             logger ); //Find in the database

        if ( CommonUtilities.isNotNullOrEmpty( result ) ) {

          result = ( result as any ).dataValues; //Get only the basic json struct object with field values from the orm model

          //Add additional info to memory cache struct
          const UserInfo = await UserService.getById( result.UserId,
                                                      null,
                                                      null,
                                                      logger );

          userRoles = ( UserInfo as any ).dataValues.Role;

          const GroupInfo = await UserGroupService.getById( UserInfo.GroupId,
                                                            null,
                                                            null,
                                                            logger );

          groupRoles = ( GroupInfo as any ).dataValues.Role;

          if ( UserInfo.PersonId ) {

            const PersonInfo = await PersonService.getById( UserInfo.PersonId,
                                                            null,
                                                            null,
                                                            logger );

            result[ "PersonId" ] = PersonInfo.Id;
            result[ "Title" ] = PersonInfo.Title;
            result[ "FirstName" ] = PersonInfo.FirstName;
            result[ "LastName" ] = PersonInfo.LastName;
            result[ "EMail" ] = PersonInfo.EMail;
            result[ "Phone" ] = PersonInfo.Phone;

          }
          else {

            result[ "PersonId" ] = "";
            result[ "Title" ] = "";
            result[ "FirstName" ] = "";
            result[ "LastName" ] = "";
            result[ "EMail" ] = "";
            result[ "Phone" ] = "";

          }

          result[ "UserTag" ] = UserInfo.Tag;
          result[ "UserGroupId" ] = GroupInfo.Id;
          result[ "UserGroupName" ] = GroupInfo.Name;
          result[ "UserGroupTag" ] = GroupInfo.Tag;
          result.UpdatedBy = UserInfo.Name;

          bFromCache = false;

        }

      }

      if ( CommonUtilities.isNotNullOrEmpty( result ) &&
           CommonUtilities.isNullOrEmpty( result.LoggedOutAt ) &&
           SystemUtilities.checkUserSessionStatusExpired( result, logger ).Expired === false &&
           bUpdateAt ) {

        SystemUtilities.createOrUpdateUserSessionStatus( strToken,
                                                         result,
                                                         bFromCache === false, //Set roles?
                                                         groupRoles,
                                                         userRoles,
                                                         false,    //Force update?
                                                         1,        //Only 1 try
                                                         7 * 1000, //Second
                                                         transaction,
                                                         logger );

      }

    }

    if ( CommonUtilities.isNotNullOrEmpty( result ) ) {

      result.FromCache = bFromCache;

    }

    return result;

  }

  static async createOrUpdateUserSessionStatus( strToken: string,
                                                userSessionStatus: any,
                                                bSetRoles: boolean,
                                                groupRoles: any,
                                                userRoles: any,
                                                bForceUpdate: boolean,
                                                intTryLock: number,
                                                intLockSeconds: number,
                                                transaction: any,
                                                logger: any ) {

    //Check UpdateAt field not more old to 15 seconds aprox
    const duration = moment.duration(
                                      {
                                        seconds: SystemUtilities.getCurrentDateAndTime().diff( userSessionStatus.UpdatedAt, "seconds" )
                                      }
                                    );

    if ( duration.asSeconds() >= 15 ||
         bForceUpdate ) { //The updated is old to 15 seconds or force update set to true

      if ( bSetRoles &&
           groupRoles !== null &&
           groupRoles !== undefined &&
           userRoles !== null &&
           userRoles !== undefined ) { //Only if not taked from cache

        const strRolesMerged = SystemUtilities.mergeTokens( groupRoles,
                                                            userRoles,
                                                            true,
                                                            logger );

        userSessionStatus.Role = strRolesMerged; //Update the roles

      }

      userSessionStatus.UpdatedAt = SystemUtilities.getCurrentDateAndTime().format(); //Update to current date and time

      let lockedResource = null;

      try {

        //We need write the shared resource and going to block temporally the write access
        lockedResource = await CacheManager.lockResource( undefined, //Default = CacheManager.currentInstance,
                                                          SystemConstants._LOCK_RESOURCE_UPDATE_SESSION_STATUS,
                                                          intLockSeconds, //7 * 1000, //7 seconds
                                                          intTryLock, //1, //Only one try
                                                          undefined, //Default 5000 milliseconds
                                                          logger );

        if ( CommonUtilities.isNotNullOrEmpty( lockedResource ) ||
             bForceUpdate ) { //Stay sure we had the resource locked or forced to updated is true

          await CacheManager.setDataWithTTL( strToken,
                                             JSON.stringify( userSessionStatus ),
                                             300, //5 minutes in seconds
                                             logger ); //Refresh the token in the central cache

          const dataToWriteToDB = {
                                    UserId: userSessionStatus.UserId,
                                    Token: userSessionStatus.Token,
                                    UpdatedAt: userSessionStatus.UpdatedAt
                                  }

          if ( userSessionStatus.BinaryDataToken ) {

            dataToWriteToDB[ 'BinaryDataToken' ] = userSessionStatus.BinaryDataToken;

          }

          if ( userSessionStatus.SocketToken ) {

            dataToWriteToDB[ 'SocketToken' ] = userSessionStatus.SocketToken;

          }

          await UserSessionStatusService.createOrUpdate( userSessionStatus.UserId,
                                                         strToken,
                                                         dataToWriteToDB,
                                                         true,
                                                         transaction,
                                                         logger ); //Refresh the UpdatedAt field in central db

        }

      }
      catch ( error ) {

        const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

        sourcePosition.method = this.name + "." + this.getUserSessionStatus.name;

        const strMark = "815DAACA4B52";

        const debugMark = debug.extend( strMark );

        debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
        debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( "Catched on: %O", sourcePosition );

        error.mark = strMark;
        error.logId = SystemUtilities.getUUIDv4();

        if ( logger && typeof logger.error === "function" ) {

          error.catchedOn = sourcePosition;
          logger.error( error );

        }

      }

      //Release the write access for another process. VERY IMPORTANT!!!
      if ( CommonUtilities.isNotNullOrEmpty( lockedResource ) ) {

        await CacheManager.unlockResource( lockedResource,
                                          logger );

      }

    }

    //}

  }

  static async getUserSessionStatus( strToken: string,
                                     requestContext: any,
                                     bUpdateAt: boolean,
                                     bForceReadFromDB: boolean,
                                     transaction: any,
                                     logger: any ):Promise<any> {

    let result = null;

    if ( strToken.startsWith( "p:" ) ) {

      result = await SystemUtilities.getUserSessionStatusPersistent( strToken,
                                                                     requestContext,
                                                                     bUpdateAt,
                                                                     bForceReadFromDB,
                                                                     transaction,
                                                                     logger )

    }
    else {

      result = await SystemUtilities.getUserSessionStatusTemporal( strToken,
                                                                   requestContext,
                                                                   bUpdateAt,
                                                                   bForceReadFromDB,
                                                                   transaction,
                                                                   logger )

    }

    return result;

  }

  static async getRoleOfRoute( intRequestKind: number,
                               strPath: string,
                               bUpdateAt: boolean,
                               logger: any ):Promise<any> {

    let result = [];

    let bFromCache = false;

    if ( intRequestKind >= 0 &&
         CommonUtilities.isNotNullOrEmpty( strPath ) ) {

      const strId = SystemUtilities.hashString( intRequestKind + ":" + strPath,
                                                1,
                                                logger );

      if ( process.env.ROLES_OF_ROUTE_FROM_CACHE === "1" ) {

        const strRolesFromRouteList = await CacheManager.getData( strId + "@roles",
                                                                  logger ); //First try with cache

        result = CommonUtilities.parseArray( strRolesFromRouteList, logger );

        bFromCache = CommonUtilities.isNotNullOrEmpty( result );

      }

      if ( CommonUtilities.isNullOrEmpty( result ) ) { //Is not in cache or is not valid json struct

        result = await RoleService.getRolesFromRouteId( strId,
                                                        null,
                                                        logger ); //Find in the database

      }

      if ( CommonUtilities.isNotNullOrEmpty( result ) &&
           bFromCache === false &&
           bUpdateAt ) {

          let lockedResource = null;

          try {

            //We need write the shared resource and going to block temporally the write access
            lockedResource = await CacheManager.lockResource( undefined, //Default = CacheManager.currentInstance,
                                                              SystemConstants._LOCK_RESOURCE_UPDATE_ROLES_OF_ROUTE,
                                                              3 * 1000, //3 seconds
                                                              1, //Only one try
                                                              3000, //2 Seconds
                                                              logger );

            if ( CommonUtilities.isNotNullOrEmpty( lockedResource ) ) { //Stay sure we had the resource locked

              await CacheManager.setDataWithTTL( strId + "@roles",
                                                 result.toString(),
                                                 300, //5 minutes in seconds
                                                 logger ); //Refresh the token in the central cache

            }

          }
          catch ( error ) {

            const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

            sourcePosition.method = this.name + "." + this.getRoleOfRoute.name;

            const strMark = "F2B3156AC7C2";

            const debugMark = debug.extend( strMark );

            debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
            debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            debugMark( "Catched on: %O", sourcePosition );

            error.mark = strMark;
            error.logId = SystemUtilities.getUUIDv4();

            if ( logger && typeof logger.error === "function" ) {

              error.catchedOn = sourcePosition;
              logger.error( error );

            }

          }

          //Release the write access for another process. VERY IMPORTANT!!!
          if ( CommonUtilities.isNotNullOrEmpty( lockedResource ) ) {

            await CacheManager.unlockResource( lockedResource,
                                               logger );

          }

      }

    }

    if ( CommonUtilities.isNotNullOrEmpty( result ) ) {

      result.push( "FromCache=" + ( bFromCache ? "true" : "false" ) );

    }

    return result;

  }

  static getInfoFromSessionStatus( sessionStatus: any,
                                   strFieldName: string,
                                   logger: any ): string {

    let strResult = null;

    try {

      if ( sessionStatus !== null ) {

        strResult = sessionStatus[ strFieldName ] ? sessionStatus[ strFieldName ] : null;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.middlewareSetContext.name;

      const strMark = "AEBB674F7EA8";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return strResult;

  }

  //Anchor middlewareSetContext
  static async middlewareSetContext( request: Request,
                                     response: Response,
                                     next: NextFunction ) {

    const logger = LoggerManager.mainLoggerInstance;

    let strLanguage = "";

    try {

      const strAuthorization = request.header( "authorization" );
      let strTimeZoneId = request.header( "timezoneid" );
      let strFrontendId = request.header( "frontendid" ) || "";
      let strSourceIPAddress = request.header( "x-forwarded-for" ) || request.header( "X-Forwarded-For" ); //req.ip;
      strLanguage = request.header( "language" );

      if ( CommonUtilities.isNullOrEmpty( strTimeZoneId ) ) {

        strTimeZoneId = CommonUtilities.getCurrentTimeZoneId();

      }

      if ( CommonUtilities.isNullOrEmpty( strLanguage ) ) {

        strLanguage = CommonUtilities.getCurrentLanguage();

      }

      if ( CommonUtilities.isNullOrEmpty( strSourceIPAddress ) ) {

        strSourceIPAddress = request.ip;

      }

      let userSessionStatus = null;

      ( request as any ).context = {
                                     Authorization: strAuthorization,
                                     Logger: logger,
                                     TimeZoneId: strTimeZoneId,
                                     Language: strLanguage,
                                     SourceIPAddress:  strSourceIPAddress,
                                     FrontendId: strFrontendId,
                                     UserSessionStatus: userSessionStatus
                                   };

      if ( CommonUtilities.isNotNullOrEmpty( strAuthorization ) ) {

        userSessionStatus = await SystemUtilities.getUserSessionStatus( strAuthorization,
                                                                        ( request as any ).context,
                                                                        true,
                                                                        false,
                                                                        null,
                                                                        logger );

      }

      ( request as any ).context.UserSessionStatus = userSessionStatus;

      next(); //Continue to next middleware

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.middlewareSetContext.name;

      const strMark = "A7BA900D7B56";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

      const result = {
                       StatusCode: 500,
                       Code: 'ERROR_UNEXPECTED',
                       Message: await I18NManager.translate( strLanguage, 'Unexpected error. Please read the server log for more details.' ),
                       Mark: strMark,
                       LogId: error.LogId,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: error.name,
                                   Message: error.message,
                                   Details: await SystemUtilities.processErrorDetails( error ) //error
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     };

      response.status( result.StatusCode ).send( result );

    }

    return response;

  }

  // ANCHOR middlewareCheckIsAuthenticated
  static async middlewareCheckIsAuthenticated( request: Request,
                                               response: Response,
                                               next: NextFunction ): Promise<any> {

    const context = ( request as any ).context; //context is injected by SystemUtilities.middlewareSetContext function

    const strLanguage = context ? context.Language : null; //Context is set from previous chain function middlewareSetContext

    const logger = context ? context.Logger : null; //Context is set from previous chain function middlewareSetContext

    let userSessionStatus = context ? context.UserSessionStatus : null; //Context is set from previous chain function middlewareSetContext

    let authorization: { Expired: false, Duration: any };
    let bAuthorizationInvalidLoggedOut = false;
    let bAuthorizationInvalid = false;
    let result = null;

    if ( CommonUtilities.isNotNullOrEmpty( userSessionStatus ) ) {

      if ( CommonUtilities.isNullOrEmpty( userSessionStatus.LoggedOutAt ) ) {

        authorization = SystemUtilities.checkUserSessionStatusExpired( userSessionStatus, logger );

      }
      else {

        bAuthorizationInvalidLoggedOut = true;

      }

    }
    else {

      bAuthorizationInvalid = true;

    }

    if ( bAuthorizationInvalid ) {

      result = {
                 StatusCode: 401, //Unauthorized
                 Code: 'ERROR_INVALID_AUTHORIZATION_TOKEN',
                 Message: await I18NManager.translate( strLanguage, 'Authorization token provided is invalid' ),
                 Mark: 'FAE37676EA49',
                 LogId: null,
                 IsError: true,
                 Errors: [
                           {
                             Code: 'ERROR_INVALID_AUTHORIZATION_TOKEN',
                             Message: await I18NManager.translate( strLanguage, 'Authorization token provided is invalid' ),
                             Details: null
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

    }
    else if ( bAuthorizationInvalidLoggedOut ) {

      result = {
                 StatusCode: 401, //Unauthorized
                 Code: 'ERROR_LOGGED_OUT_AUTHORIZATION_TOKEN',
                 Message: await I18NManager.translate( strLanguage, 'Authorization token provided is logged out' ),
                 Mark: '0C28D66DFBC1',
                 LogId: null,
                 IsError: true,
                 Errors: [
                           {
                             Code: 'ERROR_LOGGED_OUT_AUTHORIZATION_TOKEN',
                             Message: await I18NManager.translate( strLanguage, 'Authorization token provided is logged out' ),
                             Details: null
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

    }
    else if ( authorization.Expired ) {

      let timeAgo = null;

      if ( authorization.Duration &&
           authorization.Duration.asSeconds ) {

        timeAgo = authorization.Duration.humanize();

      }

      result = {
                 StatusCode: 401, //Unauthorized
                 Code: 'ERROR_EXPIRED_AUTHORIZATION_TOKEN',
                 Message: await I18NManager.translate( strLanguage, 'Authorization token provided is expired' ),
                 Mark: 'C6E335E5DC71',
                 LogId: null,
                 IsError: true,
                 Errors: [
                           {
                             Code: 'ERROR_EXPIRED_AUTHORIZATION_TOKEN',
                             Message: await I18NManager.translate( strLanguage, 'Authorization token provided is expired' ),
                             Details: timeAgo
                           }
                          ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

    }

    if ( ( request as any ).returnResult === 1 ) {

      if ( result === null ) {

        result = {
                   StatusCode: 200, //Ok
                 }

      }

      return result;

    }
    else if ( result === null ) {

      if ( next ) {

        next(); //Ok is fine continue to next middleware function in the chain

      }

    }
    else if ( response ) {

      response.status( result.StatusCode ).send( result );

    }

  }

  static async middlewareCheckIsAuthorized( request: Request,
                                            response: Response,
                                            next: NextFunction ) {

    const context = ( request as any ).context; //context is injected by SystemUtilities.middlewareSetContext function

    const strLanguage = context ? context.Language : null; //Context is set from previous chain function middlewareSetContext

    const logger = context ? context.Logger : null; //Context is set from previous chain function middlewareSetContext

    let userSessionStatus = context ? context.UserSessionStatus : null; //Context is set from previous chain function middlewareSetContext

    let strPath = request.route && request.route.path ? request.route.path : request.path;

    if ( process.env.SERVER_ROOT_PATH ) {

      strPath = strPath.substr( process.env.SERVER_ROOT_PATH.length, strPath.length );

    }

    const roles = await SystemUtilities.getRoleOfRoute( CommonUtilities.getRequestKindFromHTTPMethodString( request.method ), //Always post
                                                        strPath,
                                                        true,
                                                        logger );

    const bIsAuthorized = CommonUtilities.isInList( roles,
                                                    userSessionStatus.Role,
                                                    logger );

    if ( bIsAuthorized === false ) {

      const result = {
                       StatusCode: 403, //Forbiden
                       Code: 'ERROR_FORBIDEN_ACCESS',
                       Message: await I18NManager.translate( strLanguage, 'Not authorized to access' ),
                       LogId: null,
                       Mark: '1ED45DB6E425',
                       IsError: true,
                       Errors: [
                                 {
                                   Code: 'ERROR_FORBIDEN_ACCESS',
                                   Message: await I18NManager.translate( strLanguage, 'Not authorized to access' ),
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     };

      response.status( result.StatusCode ).send( result );

      //return response;

    }
    else {

      next();  //Ok is fine continue to next middleware function in the chain

    }

  }

  // ANCHOR ruleCheckIsAuthenticated
  static ruleCheckIsAuthenticated = rule() (

    async ( obj, args, context, info ) => {

      let result: any = false;
      //let sessionExpired = false;
      let session: { Expired: false, Duration: any };
      let bSessionInvalidLoggedOut = false;
      let bSessionInvalid = false;

      const strLanguage = context.Language;

      const logger = context.Logger;

      //const strAuthorization = context.Authorization;
      const userSessionStatus = context.UserSessionStatus;
      //const strTimeZoneId = context.TimeZoneId;

      if ( CommonUtilities.isNotNullOrEmpty( userSessionStatus ) ) {

        if ( CommonUtilities.isNullOrEmpty( userSessionStatus.LoggedOutAt ) ) {

          session = SystemUtilities.checkUserSessionStatusExpired( userSessionStatus, logger );

        }
        else {

          bSessionInvalidLoggedOut = true;

        }

      }
      else {

        bSessionInvalid = true;

      }

      if ( bSessionInvalid ) {

        const extensions = { StatusCode: 401, LogId: SystemUtilities.getUUIDv4() };

        result = new ApolloError(
                                  await I18NManager.translate( strLanguage, "Authorization token provided is invalid" ),
                                  "ERROR_INVALID_AUTHORIZATION_TOKEN",
                                  extensions
                                );

      }
      else if ( bSessionInvalidLoggedOut ) {

        const extensions = { StatusCode: 401, "LogId": SystemUtilities.getUUIDv4() };

        result = new ApolloError(
                                  await I18NManager.translate( strLanguage, "Authorization token provided is logged out" ),
                                  "ERROR_LOGGED_OUT_AUTHORIZATION_TOKEN",
                                  extensions
                                );

      }
      else if ( session.Expired ) {

        const errors = [];

        if ( session.Duration &&
             session.Duration.asSeconds ) {

          const timeAgo = session.Duration.humanize();

          errors.push(
                       {
                         Code: "ERROR_EXPIRED_AUTHORIZATION_TOKEN",
                         Message: await I18NManager.translate( strLanguage, "Authorization token provided is expired" ),
                         Details: timeAgo
                       }
                      );

        }
        else {

          errors.push(
                       {
                         Code: "ERROR_EXPIRED_AUTHORIZATION_TOKEN",
                         Message: await I18NManager.translate( strLanguage, "Authorization token provided is expired" ),
                         Details: null
                       }
                      );

        }

        const extensions = {
                             StatusCode: 401,
                             "LogId": SystemUtilities.getUUIDv4(),
                             "errors": errors
                           };

        result = new ApolloError(
                                  await I18NManager.translate( strLanguage, "Authorization token provided is expired" ),
                                  "ERROR_EXPIRED_AUTHORIZATION_TOKEN",
                                  extensions
                                );

      }
      else {

        result = true;

      }

      return result;

    }

  );

  static ruleCheckIsAuthorized = rule() (

    async ( obj, args, context, info ) => {

      let result: any = false;
      const logger = context.Logger;

      const userSessionStatus = context.UserSessionStatus;

      const roles = await SystemUtilities.getRoleOfRoute( 2, //Always post
                                                          info.fieldName,
                                                          true,
                                                          logger );

      result = CommonUtilities.isInList( roles,
                                         userSessionStatus.Role,
                                         logger );

      if ( result === false ) {

        const extensions = { StatusCode: 403, "LogId": SystemUtilities.getUUIDv4() };

        result = new ApolloError( "Not authorized to access", "ERROR_FORBIDEN_ACCESS", extensions );

      }

      return result;

      /*
      const strJSONUserSessionStatus = await CacheManager.getData( context.Authorization, logger );

      let jsonUserSessionStatus = CommonUtilities.parseJSON( strJSONUserSessionStatus, logger );;

      if ( CommonUtilities.isNullOrEmpty( strJSONUserSessionStatus ) ) {

        //jsonUserSessionStatus = CommonUtilities.parseJSON( strJSONUserSessionStatus, logger );
        jsonUserSessionStatus = UserSessionStatusService.getUserSessionStatusByToken( context.Authorization, null, logger );

        if ( CommonUtilities.isNotNullOrEmpty( jsonUserSessionStatus ) ) {

          jsonUserSessionStatus = ( jsonUserSessionStatus as any ).dataValues;

        }

      }
      */

      /*
      let currentTransaction = null;

      let bApplyTansaction = false;

      try {

        const dbConnection = DBConnectionManager.currentInstance;

        if ( currentTransaction == null ) {

          currentTransaction = await dbConnection.transaction();

          bApplyTansaction = true;

        }

        const group = await GroupService.getGroupById( strAuthorization,
                                                       strTimeZoneId,
                                                       currentTransaction,
                                                       logger );

        const roles = await RoleService.getRolesWithRoutePath( 2,
                                                               info.fieldName,
                                                               currentTransaction,
                                                               logger );

        let debugMark = debug.extend( '3CE5884F81E8' );
        debugMark( "%O", group );
        debugMark( "%O", roles );

        if ( currentTransaction != null &&
             currentTransaction.finished !== "rollback" &&
             bApplyTansaction ) {

           await currentTransaction.commit();

        }

      }
      catch ( error ) {

        const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

        sourcePosition.method = this.name + "." + this.isAuthorized.name;

        const strMark = "412C4050943A";

        const debugMark = debug.extend( strMark );

        debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
        debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( "Catched on: %O", sourcePosition );

        error.mark = strMark;
        error.logId = SystemUtilities.getUUIDv4();

        if ( logger && typeof logger.error === "function" ) {

          error.catchedOn = sourcePosition;
          logger.error( error );

        }

      }
      */
      /*
      let debugMark = debug.extend( '7FA6BB676F4F' );
      //debugMark( "obj => %O", obj );
      debugMark( "authorization => %s", strAuthorization );
      debugMark( "args => %O", args );
      debugMark( "context => %O", context );
      debugMark( "info.fieldName => %s", info.fieldName );
      */

      //return context.authUser && context.authUser.role === 'USER_MANAGER';
      return true;

    }

  );

  static mergeTokens( strTokenSet1: string,
                      strTokenSet2: string,
                      bExcludeMinusPrefix: boolean,
                      logger: any ) {

    let strResult = "";

    try {

      const mergedRoleSet = [];
      const roleSetInBlackList = [];

      const roleSet1 = CommonUtilities.isNotNullOrEmpty( strTokenSet1 ) ? strTokenSet1.split( "," ) : [];
      const roleSet2 = CommonUtilities.isNotNullOrEmpty( strTokenSet2 ) ? strTokenSet2.split( "," ) : [];

      if ( roleSet1.length > 0 && bExcludeMinusPrefix ) {

        for ( const strRole of roleSet1 ) {

          if ( strRole.startsWith( "-#" ) &&
               roleSetInBlackList.indexOf( strRole.substr( 1 ) ) === -1 ) {

            roleSetInBlackList.push( strRole.substr( 1 ) );

          }

        }

      }

      if ( roleSet2.length > 0 && bExcludeMinusPrefix ) {

        for ( const strRole of roleSet2 ) {

          if ( strRole.startsWith( "-#" ) &&
               roleSetInBlackList.indexOf( strRole.substr( 1 ) ) === -1 ) {

            roleSetInBlackList.push( strRole.substr( 1 ) );

          }

        }

      }

      if ( roleSet1.length > 0 ) {

        for ( const strRole of roleSet1 ) {

          if ( strRole.startsWith( "-#" ) === false ) {

            if ( roleSetInBlackList.indexOf( strRole ) === -1 &&
                 mergedRoleSet.indexOf( strRole ) === -1 ) {

              mergedRoleSet.push( strRole );

            }

          }

        }

      }

      if ( roleSet2.length > 0 ) {

        for ( const strRole of roleSet2 ) {

          if ( strRole.startsWith( "-#" ) === false ) {

            if ( roleSetInBlackList.indexOf( strRole ) === -1 &&
                 mergedRoleSet.indexOf( strRole ) === -1 ) {

              mergedRoleSet.push( strRole );

            }

          }

        }

      }

      strResult = mergedRoleSet.toString();

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.mergeTokens.name;

      const strMark = "49AE680B4870";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return strResult;

  }

  static dectectUserWarnings( strLanguage: string,
                              userDataResponse: any,
                              logger: any ) {

    let result = [];

    try {

      if ( userDataResponse.ForceChangePassword === 1 ) {

        result.push(
                     {
                       Code: "WARNING_FORCE_CHANGE_PASSSWORD",
                       Message: I18NManager.translateSync( strLanguage, "Change of password is required by the system" ),
                       Details: {
                                  ForceChangePassword: 1
                                },
                     }
                   );

      }

      if ( userDataResponse.ChangePasswordEvery > 0 ) { //In days

        const duration = moment.duration( { minutes: SystemUtilities.getCurrentDateAndTime().diff( userDataResponse.PasswordSetAt, "minutes" ) } );

        if ( ( duration.asMinutes() * 60 * 24 ) > userDataResponse.ChangePasswordEvery ) {

          result.push(
                       {
                         Code: "WARNING_PASSSWORD_EXPIRED",
                         Message: I18NManager.translateSync( strLanguage, "Change of password is required by it is expired" ),
                         Details: duration.humanize()
                       }
                     );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.dectectUserWarnings.name;

      const strMark = "C3322F4A5AD7";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return result;

  }

  static getMimeType( strFullFilePath: string,
                      strDefaultMimeType: string,
                      logger: any ): any {

    let result = null;

    try {

      const buffer = readChunk.sync( strFullFilePath, 0, fileType.minimumBytes );

      const fileTypeDetected = fileType( buffer );

      if ( fileTypeDetected ) {

        result = fileTypeDetected;

      }
      else {

        const fixExtension = {
                               "markdown": "md",
                             };

        const mime = require( 'mime' );

        let strExtension = mime.extension( strDefaultMimeType );

        if ( fixExtension[ strExtension ] !== undefined ) {

          strExtension = fixExtension[ strExtension ];

        }

        result = {
                   ext: strExtension ? strExtension : 'unknown',
                   mime: strDefaultMimeType ? strDefaultMimeType : 'unknown'
                 };

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.dectectUserWarnings.name;

      const strMark = "23879CF471D9";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return result;

  }

  static isValidDateTime( strDateTime: string ): boolean {

    const dateTime = moment( strDateTime );

    return dateTime.isValid();

  }

  static zipDirectory( strSource: string,
                       strZipFullFilePath: string,
                       logger: any ): Promise<boolean> {

    const archive = archiver(
                              'zip',
                              {
                                zlib: {
                                        level: 9
                                      }
                              }
                            );
    const stream = fs.createWriteStream( strZipFullFilePath );

    return new Promise( ( resolve, reject ) => {

      const strPath = path.basename( strSource );

      archive.directory( strSource, strPath ).on( 'error',
                                                  ( error: ArchiverError ) => {

                                                    const strMark = "C0709DD4C024";

                                                    if ( logger &&
                                                        typeof logger.error === "function" ) {

                                                      ( error as any ).mark = strMark;
                                                      ( error as any ).logId = SystemUtilities.getUUIDv4();

                                                      logger.error( error );

                                                    }

                                                    reject( false );

                                                  }

                                                )
                                              .pipe( stream );

      stream.on( 'close', () => resolve( true ) );

      archive.finalize();

    });

  }

  static createSelectAliasFromModels( models: any[],
                                      alias: string[],
                                      filterKind: number = 0,
                                      filter: string[] = [] ) {

    let strResult = "";

    models.map( ( model: any, intIndex: number ) => {

      Object.keys( model.rawAttributes ).map( ( attribute ) => {

        let bAddField: boolean = true;

        if ( filterKind === 1 ) { //Include

          if ( filter.indexOf( alias[ intIndex ] + "_" + attribute ) >= 0 ) {

            bAddField = true;

          }
          else {

            bAddField = false;

          }

        }
        else if ( filterKind === -1 ) { //Exclude

          if ( filter.indexOf( alias[ intIndex ] + "_" + attribute ) < 0 ) {

            bAddField = true;

          }
          else {

            bAddField = false;

          }

        }
        //else if ( filterKind === 0 ) { } //Ignore include all fields names

        if ( bAddField ) {

          if ( strResult === "" ) {

            strResult = alias[ intIndex ] + "." + attribute + " As " + alias[ intIndex ] + "_" + attribute;

          }
          else {

            strResult = strResult + "," + alias[ intIndex ] + "." +  attribute + " As " + alias[ intIndex ] + "_" + attribute;

          }

        }

      } );

    } );

    return strResult;

  }

  static transformRowValuesToObjectArray( rows: any[],
                                          models: any[],
                                          alias: string[],
                                          bIncludeUndefined: boolean = false ) {

    let result: any[] = [];

    rows.map( ( row ) => {

      let newRow: any[] = [];

      models.map( ( model: any, intIndex: number ) => {

        let newDataStruct = {};

        Object.keys( model.rawAttributes ).map( ( attribute ) => {

          if ( row[ alias[ intIndex ] + "_" + attribute ] !== undefined || bIncludeUndefined === true  ) {

            newDataStruct[ attribute ] = row[ alias[ intIndex ] + "_" + attribute ];

          }

        } );

        newRow.push( newDataStruct );

      } );

      result.push( newRow );

    });

    return result;

  }

  static transformRowValuesToObject( rows: any[],
                                     models: any[],
                                     alias: string[],
                                     bIncludeUndefined: boolean = false ) {

    let result: any[] = [];

    rows.map( ( row ) => {

      let newRow: any = {};

      models.map( ( model: any, intIndex: number ) => {

        let newDataStruct = {};

        Object.keys( model.rawAttributes ).map( ( attribute ) => {

          if ( row[ alias[ intIndex ] + "_" + attribute ] !== undefined || bIncludeUndefined === true  ) {

            newDataStruct[ attribute ] = row[ alias[ intIndex ] + "_" + attribute ];

          }

        } );

        newRow[ model.name ] = newDataStruct;

      } );

      result.push( newRow );

    });

    return result;

  }

  static transformRowValuesToModelArray( rows: any[],
                                         models: any[],
                                         alias: string[],
                                         bIncludeUndefined: boolean = false,
                                         dataTransformers: object[] = [] ) {

    let result: any[] = [];

    rows.map( ( row ) => {

      let newRow: any[] = [];

      models.map( ( model: any, intIndex: number ) => {

        let newDataStruct = {};

        Object.keys( model.rawAttributes ).map( ( attribute ) => {

          if ( row[ alias[ intIndex ] + "_" + attribute ] !== undefined || bIncludeUndefined === true  ) {

            newDataStruct[ attribute ] = row[ alias[ intIndex ] + "_" + attribute ];

          }

        } );

        newRow.push( model.build( newDataStruct ) ); //Create the sequelize model no persited, later you can call sequealize.save make persist to the db.

      } );

      result.push( newRow );

    });

    return result;

  }

  public static commonBeforeValidateHook( instance: any, options: any ) {

    try {

      if ( instance.rawAttributes[ "Id" ] !== null &&
           !instance.Id ) {

        instance.Id = SystemUtilities.getUUIDv4();

      }

      if ( instance.rawAttributes[ "ShortId" ] !== null &&
           instance.rawAttributes[ "Id" ] !== null &&
           ( !instance.ShortId ||
             instance.ShortId === '0' ) ) {

        instance.ShortId = SystemUtilities.hashString( instance.Id,
                                                       2,
                                                       null ); //Hashes.CRC32( instance.Id ).toString( 16 );

      }

      /*
      if ( options.type === "BULKUPDATE" ||
           options.type === "UPDATE" ) {  //!options.where ) {
      */
      if ( !options ||
           !options.type ||
           options.type.toUpperCase() === "BULKCREATE" ||
           options.type.toUpperCase() === "CREATE" ) {

        if ( instance.rawAttributes[ "CreatedBy" ] !== null &&
             !instance.createdBy  ) {

          if ( options.context &&
               options.context.UserSessionStatus &&
               options.context.UserSessionStatus.Name ) {

            instance.CreatedBy = ( instance as any ).options.context.UserSessionStatus.Name;

          }
          else if ( instance.CreatedBy === null ) {

            instance.CreatedBy = SystemConstants._CREATED_BY_UNKNOWN_SYSTEM_NET

          }

        }

        if ( instance.rawAttributes[ "CreatedAt" ] !== null &&
             !instance.createdAt ) {

          instance.CreatedAt = SystemUtilities.getCurrentDateAndTime().format();

        }

      }
      else {

        if ( instance.rawAttributes[ "UpdatedBy" ] !== null ) {

          if ( options.context &&
               options.context.UserSessionStatus &&
               options.context.UserSessionStatus.Name ) {

            instance.dataValues.UpdatedBy = ( instance as any ).options.context.UserSessionStatus.Name;

          }
          else if ( instance.UpdatedBy === null ) {

            instance.dataValues.UpdatedBy = SystemConstants._CREATED_BY_UNKNOWN_SYSTEM_NET;

          }

        }

        if ( instance.rawAttributes[ "UpdatedAt" ] !== null ) {

          instance.dataValues.UpdatedAt = SystemUtilities.getCurrentDateAndTime().format(); //( instance as any )._previousDataValues.CreatedAt;

        }

      }

      if ( instance.rawAttributes[ "DisabledBy" ] !== null ) {

        if ( instance.DisabledBy === "1" ||
             ( instance.DisabledBy &&
               instance.DisabledBy.startsWith( "1@" ) ) ) {

          if ( options.context &&
              options.context.UserSessionStatus &&
              options.context.UserSessionStatus.Name ) {

            instance.dataValues.DisabledBy = ( instance as any ).options.context.UserSessionStatus.Name;

          }
          else if ( instance.DisabledBy.startsWith( "1@" ) ) {

            const strDisabledBy = instance.DisabledBy.substring( 2 ).trim();

            instance.dataValues.DisabledBy = strDisabledBy ? strDisabledBy : SystemConstants._CREATED_BY_UNKNOWN_SYSTEM_NET;

          }
          else { //if ( instance.DisabledBy === null ) {

            instance.dataValues.DisabledBy = SystemConstants._CREATED_BY_UNKNOWN_SYSTEM_NET;

          }

          if ( instance.rawAttributes[ "DisabledAt" ] !== null ) {

            instance.dataValues.DisabledAt = SystemUtilities.getCurrentDateAndTime().format();

          }

        }
        else if ( instance.DisabledBy === "0" ) {

          instance.dataValues.DisabledBy = null;
          instance.dataValues.DisabledAt = null;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.commonBeforeValidateHook.name;

      const strMark = "9132A5362A48";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( options.context &&
           options.context.logger &&
           typeof options.context.logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        options.context.logger.error( error );

      }
      else if ( LoggerManager.mainLoggerInstance &&
                typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        error.catchedOn = sourcePosition;
        LoggerManager.mainLoggerInstance.error( error );

      }

    }

  }

  public static async generateRSAKey( intBits: number,
                                      logger: any ):Promise<string> {

    let strResult = null;

    try {

      const key = new NodeRSA( { b: intBits } );

      strResult = key.exportKey( "pkcs1" );

      strResult = strResult.replace( /\n/g, "\\n" );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.encryptRSA.name;

      const strMark = "E08D2A4FF967";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof LoggerManager.mainLoggerInstance === "function" ) {

        error.catchedOn = sourcePosition;
        LoggerManager.mainLoggerInstance.error( error );

      }

    }

    return strResult;

 }

  public static async encryptRSA( strDecryptedData: string,
                                  strKey: string,
                                  logger: any ):Promise<string> {

    let strResult = null;

    try {

      const key = new NodeRSA( strKey ); // NodeRSA( { b: 512 } );

      strResult = key.encrypt( strDecryptedData, "base64" );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.encryptRSA.name;

      const strMark = "B6B697C1A31A";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof LoggerManager.mainLoggerInstance === "function" ) {

        error.catchedOn = sourcePosition;
        LoggerManager.mainLoggerInstance.error( error );

      }

    }

    return strResult;

  }

  public static async decryptRSA( strEncryptedData: string,
                                  strKey: string,
                                  logger: any ):Promise<string> {

    let strResult = null;

    try {

      const key = new NodeRSA( strKey );

      strResult = key.decrypt( strEncryptedData, "utf8" );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.decryptRSA.name;

      const strMark = "EB50EEE59B04";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof LoggerManager.mainLoggerInstance === "function" ) {

        error.catchedOn = sourcePosition;
        LoggerManager.mainLoggerInstance.error( error );

      }

    }

    return strResult;

  }

  public static createCustomValidatorSync( data: any,
                                           rules: any,
                                           registerCallback: Function,
                                           logger: any ): any {

    let result = null;

    try {

      Validator.register(
                          'emailList',
                          function( value: any, requirement, attribute ) {

                            let bResult: boolean;

                            const valueList = value ? value.split( "," ): [];

                            for ( let strCurrentValue of valueList ) {

                              const matchResult = strCurrentValue.trim().match( /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/g );

                              bResult = matchResult && matchResult.length === 1;

                              if ( bResult === false ) {

                                break;

                              }

                            };

                            return bResult;

                          },
                          'The :attribute is not in the format of list user1@domain.com, user2@domain.com or user1@domain.com.'
                        );

      Validator.register(
                          'phoneUS',
                          function( value: any, requirement, attribute ) {

                            return value.match( /(\d{1,3}-)?(\d{3}-){2}\d{4}/g ); //  /^\d{1-3}-\d{3}-\d{3}-\d{4}$/ );

                          },
                          'The :attribute phone number is not in the format X-XXX-XXX-XXXX.'
                        );

      Validator.register(
                          'phoneUSList',
                          function( value: any, requirement, attribute ) {

                            let bResult: boolean;

                            const valueList = value ? value.split( "," ): [];

                            for ( let strCurrentValue of valueList ) {

                              const matchResult = strCurrentValue.trim().match( /(\d{1,3}-)?(\d{3}-){2}\d{4}/g ); ///^\d{3}-\d{3}-\d{4}$/g );

                              bResult = matchResult && matchResult.length === 1;

                              if ( bResult === false ) {

                                break;

                              }

                            };

                            return bResult;

                          },
                          'The :attribute phone number is not in the format of list X-XXX-XXX-XXXX, XX-XXX-XXX-XXXX or XXX-XXX-XXX-XXXX.'
                        );

      if ( registerCallback ) {

        registerCallback( Validator, logger );

      }

      result = new Validator( data, rules );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createCustomValidatorSync.name;

      const strMark = "BA9782941B37";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger &&
           typeof LoggerManager.mainLoggerInstance === "function" ) {

        error.catchedOn = sourcePosition;
        LoggerManager.mainLoggerInstance.error( error );

      }

    }

    return result;

  }

  public static processErrorDetailsSync( error: any ):any {

    let result = null;

    try {

      if ( error &&
           error instanceof Error ) {

        if ( process.env.ENV !== "prod" ) {

          if ( ( error as any ).extensions.exception ) {

            result = ( error as any ).extensions.exception

          }
          else {

            result = error;

          }

        }
        else {

          result = null;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.processErrorDetails.name;

      const strMark = "4130BD6D754D";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

    }

    return result

  }

  public static async processErrorDetails( error: any ): Promise<any> {

    let result = null;

    try {

      if ( error &&
           error instanceof Error ) {

        if ( process.env.ENV !== "prod" ) {

          if ( ( error as any ).extensions.exception ) {

            result = ( error as any ).extensions.exception

          }
          else {

            result = error;

          }

        }
        else {

          result = null;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.processErrorDetails.name;

      const strMark = "4130BD6D754D";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

    }

    return result

  }

  public static async processErrorListDetails( errors: any ): Promise<any> {

    let result = null;

    try {

      if ( errors ) {

        if ( process.env.ENV !== "prod" ) {

          result = errors;

        }
        else {

          result = null;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.processErrorListDetails.name;

      const strMark = "A5C68BF888B6";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

    }

    return result

  }

  public static async processErrorDetailsStack( error: any ): Promise<any> {

    let result = null;

    try {

      if ( error &&
           error instanceof Error ) {

        if ( process.env.ENV !== "prod" ) {

          result = error.stack ? CommonUtilities.formatErrorStack( error.stack ) : error

        }
        else {

          result = null;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.processErrorDetails.name;

      const strMark = "CD80D976E0AD";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

    }

    return result;

  }

  public static async dateTimeIsAfterToSeconds( dateTime: any, intCount: number ): Promise<boolean> {

    let bResult = false;

    const duration = moment.duration(
                                      {
                                        seconds: SystemUtilities.getCurrentDateAndTime().diff( dateTime, "seconds" )
                                      }
                                    );

    const intSeconds = duration.asSeconds();

    if ( intSeconds >= intCount ) {

      bResult = true;

    }

    return bResult;

  }
}
