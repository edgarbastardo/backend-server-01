import crypto from "crypto";
import fs from 'fs'; //Load the filesystem module
import path from 'path';
import os from "os";
import cluster from "cluster";

import glob from "glob";

import moment, { Moment } from "moment-timezone";
import XXHash from 'xxhashjs';
//import  from "moment-timezone";
import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';
import crc from 'node-crc';
import { CRC32Stream } from 'crc32-stream';
import readChunk from 'read-chunk';
import fileType from 'file-type';
//import { loggers } from "winston";

import { UAParser } from 'ua-parser-js';

import archiver, { ArchiverError } from 'archiver';

import NodeRSA from 'node-rsa';

import Validator from 'validatorjs';

import { Random } from "random-js";

import CommonConstants from "./CommonConstants";
import SystemConstants from "./SystemContants";

import CommonUtilities from "./CommonUtilities";

import SYSUserService from "./database/master/services/SYSUserService";
import SYSUserSessionStatusService from "./database/master/services/SYSUserSessionStatusService";
import SYSUserSessionPersistentService from "./database/master/services/SYSUserSessionPersistentService";
import SYSRoleService from "./database/master/services/SYSRoleService";

import CacheManager from "./managers/CacheManager";
import LoggerManager from "./managers/LoggerManager";
import I18NManager from "./managers/I18Manager";
import { SYSUserSessionStatus } from "./database/master/models/SYSUserSessionStatus";

const debug = require( 'debug' )( 'SystemUtilities' );

export default class SystemUtilities {

  static startRun: Moment = null;
  static strAPPName = null;
  static strBaseRunPath: string = null;
  static strBaseRootPath: string = null;
  static bIsNetworkLeader: boolean = false;
  static NetworkLeaderFrom: Moment = null;
  static strNetworkId = null;

  static info = {
                  release: null
                } //Fill with the info.json in the root of project

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

  static isDateAndTimeBeforeAt( strAt: string, strDateTime: string ): boolean {

    let bResult = false;

    try {

      bResult = strDateTime ? moment( strAt ).tz( CommonUtilities.getCurrentTimeZoneId() ).isBefore( strDateTime ) : false;

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

  static isDateAndTimeAfterAt( strAt: string, strDateTime: string ): boolean {

    let bResult = false;

    try {

      bResult = strDateTime ? moment( strAt ).tz( CommonUtilities.getCurrentTimeZoneId() ).isAfter( strDateTime ) : false;

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

  static getCurrentDateAndTimeFromAndIncMinutes( at: any, intMinutes: number ): any {

    let result = null;

    try {

      result = moment( at ).tz( CommonUtilities.getCurrentTimeZoneId() ).add( intMinutes, "minutes" );

    }
    catch ( error ) {


    }

    return result;

  }

  static getCurrentDateAndTimeFromAndDecMinutes( at: any, intMinutes: number ): any {

    let result = null;

    try {

      result = moment( at ).tz( CommonUtilities.getCurrentTimeZoneId() ).subtract( intMinutes, "minutes" );

    }
    catch ( error ) {


    }

    return result;

  }

  static getCurrentDateAndTimeFromAndIncSeconds( at: any, intSeconds: number ): any {

    let result = null;

    try {

      result = moment( at ).tz( CommonUtilities.getCurrentTimeZoneId() ).add( intSeconds, "seconds" );

    }
    catch ( error ) {


    }

    return result;

  }

  static getCurrentDateAndTimeFromAndDecSeconds( at: any, intSeconds: number ): any {

    let result = null;

    try {

      result = moment( at ).tz( CommonUtilities.getCurrentTimeZoneId() ).subtract( intSeconds, "seconds" );

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

      const strMark = "22B953090E53" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                              logger: any ): any {

    let result = null;

    try {

      result = moment( at ).tz( strTimeZoneId ).format( strDateFormat );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.transformToTimeZone.name;

      const strMark = "698D544926FD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( intAlgorimts === 1 ) {

        strResult = XXHash.h64( strToHash, _SEED ).toString( 16 );

      }
      else if ( intAlgorimts === 2 ) {

        strResult = crc.crc32( Buffer.from( strToHash, 'utf8' ) ).toString( 'hex' ); //Hashes.CRC32( strToHash ).toString( 16 );

      }
      else {

        strResult = strToHash;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.hashString.name;

      const strMark = "272864A729F7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      const strMark = "645AC1C7F0D2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static checkUserSessionStatusExpired( userSessionStatus: any,
                                        logger: any ): any {

    let result = { Expired: false, Duration: null };

    try {

      if ( userSessionStatus.ExpireKind === 0 ) { //Expired time calculated from UpdatedAt

        const bLimitIsExpired = SystemUtilities.isDateAndTimeAfter( userSessionStatus.HardLimit );

        if ( bLimitIsExpired ) {

          const duration = moment.duration(
                                            {
                                              seconds: SystemUtilities.getCurrentDateAndTime().diff( userSessionStatus.HardLimit, "seconds" )
                                            }
                                          );

          result = { Expired: bLimitIsExpired, Duration: duration };

        }
        else {

          //Check UpdateAt field not more old to ExpireOn minutes
          const duration = moment.duration( { seconds: SystemUtilities.getCurrentDateAndTime().diff( userSessionStatus.UpdatedAt, "seconds" ) } );

          result = {
                     Expired: duration.asSeconds() / 60 >= userSessionStatus.ExpireOn || bLimitIsExpired,
                     Duration: duration
                   };

        }

      }
      else if ( userSessionStatus.ExpireKind === 1 ) { //Expired time calculated from CreatedAt

        const bLimitIsExpired = SystemUtilities.isDateAndTimeAfter( userSessionStatus.HardLimit );

        if ( bLimitIsExpired ) {

          const duration = moment.duration(
                                            {
                                              seconds: SystemUtilities.getCurrentDateAndTime().diff( userSessionStatus.HardLimit, "seconds" )
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
                                              seconds: SystemUtilities.getCurrentDateAndTime().diff( userSessionStatus.CreatedAt, "seconds" )
                                            }
                                          );

          result = {
                     Expired: duration.asSeconds() / 60 >= userSessionStatus.ExpireOn,
                     Duration: duration
                   };

        }

      }
      else if ( userSessionStatus.ExpireKind === 2 ) { //Fixed date and time to expire

        const duration = moment.duration(
                                          {
                                            seconds: SystemUtilities.getCurrentDateAndTime().diff( userSessionStatus.ExpireOn, "seconds" )
                                          }
                                        );

        result = { Expired: duration.asSeconds() > 0, Duration: duration };

      }
      else if ( userSessionStatus.ExpireKind === 3 &&  //Persistent session token
                userSessionStatus.ExpireOn ) {         //Expired time calculated unsing ExpireOn field

        const expireOn = moment( userSessionStatus.ExpireOn );

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

      const strMark = "48F8E318CD0B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( bForceReadFromDB === false &&
           process.env.USER_SESION_STATUS_FROM_CACHE === "1" ) {

        const strJSONUserSessionStatus = await CacheManager.getData( strToken,
                                                                     logger ); //First try with cache

        result = CommonUtilities.parseJSON( strJSONUserSessionStatus,
                                            logger ); //Try to parse and transform to json object

        bFromCache = true;

      }

      let strUserRole = "";
      let strUserGroupRole = "";

      if ( !result ) { //Is not in cache or is not valid json struct

        // ANCHOR  getUserSessionPersistentByToken
        let sysUserSessionPersistent = await SYSUserSessionPersistentService.getUserSessionPersistentByToken( strToken,
                                                                                                              null,
                                                                                                              logger ); //Find in the database

        let sysUserSessionPersistentData = null;

        if ( sysUserSessionPersistent ) {

          sysUserSessionPersistentData = ( sysUserSessionPersistent as any ).dataValues; //Get only the basic json struct object with field values from the orm model

          const sysUserInDB = await SYSUserService.getById( sysUserSessionPersistentData.UserId,
                                                            null,
                                                            null,
                                                            logger );

          strUserRole = sysUserInDB.Role;

          const sysUserGroupInDB = sysUserInDB.sysUserGroup;

          strUserGroupRole = sysUserGroupInDB.Role;

          if ( sysUserInDB.sysPerson ) {

            const sysPerson = sysUserInDB.sysPerson;

            sysUserSessionPersistentData[ "PersonId" ] = sysPerson.Id;
            sysUserSessionPersistentData[ "Title" ] = sysPerson.Title;
            sysUserSessionPersistentData[ "FirstName" ] = sysPerson.FirstName;
            sysUserSessionPersistentData[ "LastName" ] = sysPerson.LastName;
            sysUserSessionPersistentData[ "EMail" ] = sysPerson.EMail;
            sysUserSessionPersistentData[ "Phone" ] = sysPerson.Phone;

          }
          else {

            sysUserSessionPersistentData[ "PersonId" ] = "";
            sysUserSessionPersistentData[ "Title" ] = "";
            sysUserSessionPersistentData[ "FirstName" ] = "";
            sysUserSessionPersistentData[ "LastName" ] = "";
            sysUserSessionPersistentData[ "EMail" ] = "";
            sysUserSessionPersistentData[ "Phone" ] = "";

          }

          sysUserSessionPersistentData[ "UserName" ] = sysUserInDB.Name;
          sysUserSessionPersistentData[ "UserTag" ] = sysUserInDB.Tag;
          sysUserSessionPersistentData[ "UserGroupId" ] = sysUserGroupInDB.Id;
          sysUserSessionPersistentData[ "UserGroupName" ] = sysUserGroupInDB.Name;
          sysUserSessionPersistentData[ "UserGroupTag" ] = sysUserGroupInDB.Tag;

          const jsonExtraData = CommonUtilities.parseJSON( sysUserSessionPersistentData[ "ExtraData" ],
                                                           logger );

          delete sysUserSessionPersistentData[ "ExtraData" ];

          if ( jsonExtraData ) {

            if ( jsonExtraData.Private ) {

              delete jsonExtraData.Private;

            }

            if ( jsonExtraData.Business ) {

              sysUserSessionPersistentData[ "Business" ] = jsonExtraData.Business;

            }
            else {

              sysUserSessionPersistentData[ "Business" ] = {};

            }

          }
          else {

            sysUserSessionPersistentData[ "Business" ] = {};

          }

          bFromCache = false;

        }

        if ( sysUserSessionPersistentData &&
             !sysUserSessionPersistentData.DisabledAt &&
             SystemUtilities.checkUserSessionStatusExpired( sysUserSessionPersistentData, logger ).Expired === false &&
             bUpdateAt ) {

          result = await SYSUserSessionStatusService.getUserSessionStatusByToken( strToken,
                                                                                  null,
                                                                                  logger );

          const strRolesMerged = SystemUtilities.mergeTokens( strUserGroupRole,
                                                              strUserRole,
                                                              true,
                                                              logger );

          const expireAt = SystemUtilities.selectMoreCloseTimeBetweenTwo( sysUserSessionPersistentData.DisabledAt,
                                                                          sysUserSessionPersistentData.ExpireAt );

          if ( !result ) {

            //Insert new entry in the session status table
            result = {
                       UserId: sysUserSessionPersistentData.UserId,
                       //UserName: sysUserSessionPersistentData.UserName,
                       UserName: sysUserSessionPersistentData[ "UserName" ],
                       UserGroupId: sysUserSessionPersistentData[ "UserGroupId" ],
                       Token: strToken,
                       BinaryDataToken: sysUserSessionPersistentData[ "BinaryDataToken" ],
                       SocketToken: sysUserSessionPersistentData[ "SocketToken" ],
                       FrontendId: requestContext && requestContext.FrontendId ? requestContext.FrontendId: "Unknown_FrontendId",
                       SourceIPAddress: requestContext && requestContext.SourceIPAddress ? requestContext.SourceIPAddress: "Unknown_IP",
                       Role: strRolesMerged,
                       ExpireKind: 3,
                       ExpireOn: expireAt,
                       HardLimit: null,
                       Tag: sysUserSessionPersistentData[ "Tag" ],
                       CreatedBy: sysUserSessionPersistentData[ "UserName" ],
                       UpdatedBy: sysUserSessionPersistentData[ "UserName" ],
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
          result[ "PersonId" ] = sysUserSessionPersistentData[ "PersonId" ];
          result[ "Title" ] = sysUserSessionPersistentData[ "Title" ];
          result[ "FirstName" ] = sysUserSessionPersistentData[ "FirstName" ];
          result[ "LastName" ] = sysUserSessionPersistentData[ "LastName" ];
          result[ "EMail" ] = sysUserSessionPersistentData[ "EMail" ];
          result[ "Phone" ] = sysUserSessionPersistentData[ "Phone" ];

          result[ "UserTag" ] = sysUserSessionPersistentData[ "UserTag" ];
          result[ "UserGroupName" ] =  sysUserSessionPersistentData[ "UserGroupName" ];
          result[ "UserGroupTag" ] =  sysUserSessionPersistentData[ "UserGroupTag" ];

        }

      }

      if ( result &&
           SystemUtilities.checkUserSessionStatusExpired( result, logger ).Expired === false &&
           bUpdateAt ) {

        await SystemUtilities.createOrUpdateUserSessionStatus( strToken,
                                                               result,
                                                               bFromCache === false, //Set roles?
                                                               strUserGroupRole,     //User group roles
                                                               strUserRole,          //User roles
                                                               false,                //Force update?
                                                               1,                    //Only 1 try
                                                               7 * 1000,             //Second
                                                               transaction,
                                                               logger );

      }

    }

    if ( result ) {

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

      if ( bForceReadFromDB === false &&
           process.env.USER_SESION_STATUS_FROM_CACHE === "1" ) {

        const strJSONUserSessionStatus = await CacheManager.getData( strToken,
                                                                     logger ); //First try with cache

        result = CommonUtilities.parseJSON( strJSONUserSessionStatus,
                                            logger ); //Try to parse and transform to json object

        if ( result &&
             !result.UserGroupName ) {

          let debugMark = debug.extend( 'AA5A6DE536DF' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
          debugMark( "Warning userSessionStatus.UserGroupName is null or undefined" );

        }

        bFromCache = result !== null;

      }

      let strUserRole = "";
      let strUserGroupRole = "";

      if ( !result ) { //Is not in cache or is not valid json struct

        // ANCHOR  getUserSessionStatusByToken
        result = await SYSUserSessionStatusService.getUserSessionStatusByToken( strToken,
                                                                                null,
                                                                                logger ); //Find in the database

        if ( result ) {

          //result = ( result as any ).dataValues; //Get only the basic json struct object with field values from the orm model

          //Add additional info to memory cache struct
          const sysUserInDB = await SYSUserService.getById( result.UserId,
                                                            null,
                                                            null,
                                                            logger );

          strUserRole = sysUserInDB.Role;

          const sysUserGroupInDB = sysUserInDB.sysUserGroup;
          // const sysUserGroupInDB = await SYSUserGroupService.getById( sysUserInDB.GroupId,
          //                                                             null,
          //                                                             null,
          //                                                             logger );

          strUserGroupRole = sysUserGroupInDB.Role;

          if ( sysUserInDB.sysPerson ) {

            const sysPerson = sysUserInDB.sysPerson;
            // const PersonInfo = await SYSPersonService.getById( sysUserInDB.PersonId,
            //                                                    null,
            //                                                    null,
            //                                                    logger );

            result[ "PersonId" ] = sysPerson.Id;
            result[ "Title" ] = sysPerson.Title;
            result[ "FirstName" ] = sysPerson.FirstName;
            result[ "LastName" ] = sysPerson.LastName;
            result[ "EMail" ] = sysPerson.EMail;
            result[ "Phone" ] = sysPerson.Phone;

          }
          else {

            result[ "PersonId" ] = "";
            result[ "Title" ] = "";
            result[ "FirstName" ] = "";
            result[ "LastName" ] = "";
            result[ "EMail" ] = "";
            result[ "Phone" ] = "";

          }

          result[ "UserTag" ] = sysUserInDB.Tag;
          result[ "UserGroupId" ] = sysUserGroupInDB.Id;
          result[ "UserGroupName" ] = sysUserGroupInDB.Name;
          result[ "UserGroupTag" ] = sysUserGroupInDB.Tag;

          let jsonExtraData = { Private: null, Business: null } as any;

          if ( typeof result[ "ExtraData" ] === "string" ) {

            jsonExtraData = CommonUtilities.parseJSON( result[ "ExtraData" ], logger );

          }
          else if ( typeof result[ "ExtraData" ] === "object" ) {

            jsonExtraData = result[ "ExtraData" ];

          }

          delete result[ "ExtraData" ];

          if ( jsonExtraData ) {

            if ( jsonExtraData.Private ) {

              delete jsonExtraData.Private;

            }

            if ( jsonExtraData.Business ) {

              result[ "Business" ] = jsonExtraData.Business;

            }
            else {

              result[ "Business" ] = {};

            }

          }
          else {

            result[ "Business" ] = {};

          }

          result.UpdatedBy = sysUserInDB.Name;

          bFromCache = false;

        }

      }

      if ( result &&
           !result.LoggedOutAt &&
           SystemUtilities.checkUserSessionStatusExpired( result, logger ).Expired === false &&
           bUpdateAt ) {

        result.IsValid = true;

        await SystemUtilities.createOrUpdateUserSessionStatus( strToken,
                                                               result,
                                                               bFromCache === false, //Set roles?
                                                               strUserGroupRole,     //User group roles
                                                               strUserRole,          //User roles
                                                               false,                //Force update?
                                                               1,                    //Only 1 try
                                                               7 * 1000,             //Second
                                                               transaction,
                                                               logger );

      }
      else if ( result ) {

        result.IsValid = false;

      }

    }

    if ( result ) {

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
                                                logger: any ):Promise<SYSUserSessionStatus> {

    let result = null;

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
                                                          SystemConstants._LOCK_RESOURCE_UPDATE_SESSION_STATUS + strToken,
                                                          intLockSeconds, //7 * 1000, //7 seconds
                                                          intTryLock, //1, //Only one try
                                                          undefined, //Default 5000 milliseconds
                                                          logger );

        if ( CommonUtilities.isNotNullOrEmpty( lockedResource ) ||
             bForceUpdate ) { //Stay sure we had the resource locked or forced to updated is true

          if ( !userSessionStatus.UserGroupName ) {

            let debugMark = debug.extend( 'E9008B789BF0' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
            debugMark( "Warning userSessionStatus.UserGroupName is null or undefined" );

          }
          await CacheManager.setDataWithTTL( strToken,
                                             JSON.stringify( userSessionStatus ),
                                             300, //5 minutes in seconds
                                             logger ); //Refresh the token in the central cache

          const dataToWriteToDB = {
                                    UserId: userSessionStatus.UserId,
                                    Token: userSessionStatus.Token,
                                    UpdatedAt: userSessionStatus.UpdatedAt
                                  }

          if ( userSessionStatus.BinaryDataToken !== undefined ) {

            dataToWriteToDB[ 'BinaryDataToken' ] = userSessionStatus.BinaryDataToken;

          }

          if ( userSessionStatus.SocketToken !== undefined ) {

            dataToWriteToDB[ 'SocketToken' ] = userSessionStatus.SocketToken;

          }

          if ( userSessionStatus.Tag !== undefined ) {

            dataToWriteToDB[ 'Tag' ] = userSessionStatus.Tag;

          }

          if ( userSessionStatus.ExtraData !== undefined ) {

            dataToWriteToDB[ 'ExtraData' ] = userSessionStatus.ExtraData;

          }

          if ( userSessionStatus.LoggedOutBy !== undefined ) {

            dataToWriteToDB[ 'LoggedOutBy' ] = userSessionStatus.LoggedOutBy;

          }

          if ( userSessionStatus.LoggedOutAt !== undefined ) {

            dataToWriteToDB[ 'LoggedOutAt' ] = userSessionStatus.LoggedOutAt;

          }

          result = await SYSUserSessionStatusService.createOrUpdate( userSessionStatus.UserId,
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

        const strMark = "815DAACA4B52" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

        result = error;

      }

      //Release the write access for another process. VERY IMPORTANT!!!
      if ( CommonUtilities.isNotNullOrEmpty( lockedResource ) ) {

        await CacheManager.unlockResource( lockedResource,
                                           logger );

      }

    }

    return result;

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

        result = await SYSRoleService.getRolesFromRouteId( strId,
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
                                                              SystemConstants._LOCK_RESOURCE_UPDATE_ROLES_OF_ROUTE + strId + "@roles",
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

            const strMark = "F2B3156AC7C2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      sourcePosition.method = this.name + "." + this.getInfoFromSessionStatus.name;

      const strMark = "AEBB674F7EA8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

        //const regularExpresion = /#.*?#/gi;

        for ( const strRole of roleSet1 ) {

          if ( strRole.startsWith( "-#" ) === false ) {

            const roleSplitted = strRole.match( /#.*?#/gi ) //regularExpresion.exec( strRole ); //strRole.split( /#.*?#/gi );

            if ( roleSplitted &&
                 roleSetInBlackList.indexOf( roleSplitted[ 0 ] ) === -1 &&
                 mergedRoleSet.indexOf( roleSplitted[ 0 ] ) === -1 ) {

              mergedRoleSet.push( strRole );

            }

          }

        }

      }

      //#.*?# -> #Hola1#+#Hola2#
      if ( roleSet2.length > 0 ) {

        //const regularExpresion = /#.*?#/gi;

        for ( const strRole of roleSet2 ) {

          if ( strRole.startsWith( "-#" ) === false ) {

            const roleSplitted = strRole.match( /#.*?#/gi ) //regularExpresion.exec( strRole ); //strRole.split( /#.*?#/gi );

            if ( roleSplitted &&
                 roleSetInBlackList.indexOf( roleSplitted[ 0 ] ) === -1 &&
                 mergedRoleSet.indexOf( roleSplitted[ 0 ] ) === -1 ) {

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

      const strMark = "49AE680B4870" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    let result = { warnings: [], tag: "" };

    try {

      if ( userDataResponse.ForceChangePassword === 1 ) {

        result.warnings.push(
                              {
                                Code: "WARNING_FORCE_CHANGE_PASSSWORD",
                                Message: I18NManager.translateSync( strLanguage, "Change of password is required by the system" ),
                                Details: {
                                            ForceChangePassword: 1
                                          },
                              }
                            );

        result.tag = "#FORCE_CHANGE_PASSSWORD#";

      }

      if ( userDataResponse.ChangePasswordEvery > 0 ) { //In days

        const duration = moment.duration( { minutes: SystemUtilities.getCurrentDateAndTime().diff( userDataResponse.PasswordSetAt, "minutes" ) } );

        if ( ( duration.asMinutes() * 60 * 24 ) > userDataResponse.ChangePasswordEvery ) {

          result.warnings.push(
                                {
                                  Code: "WARNING_PASSSWORD_EXPIRED",
                                  Message: I18NManager.translateSync( strLanguage, "Change of password is required by it is expired" ),
                                  Details: duration.humanize()
                                }
                              );

          result.tag = !result.tag ? "#PASSSWORD_EXPIRED#" : result.tag + ",#PASSSWORD_EXPIRED#";

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.dectectUserWarnings.name;

      const strMark = "C3322F4A5AD7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      const strMark = "23879CF471D9" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

                                                    const strMark = "C0709DD4C024" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    models.forEach( ( model: any, intIndex: number ) => {

      Object.keys( model.rawAttributes ).forEach( ( attribute ) => {

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

    rows.forEach( ( row ) => {

      let newRow: any[] = [];

      models.forEach( ( model: any, intIndex: number ) => {

        let newDataStruct = {};

        Object.keys( model.rawAttributes ).forEach( ( attribute ) => {

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

    rows.forEach( ( row ) => {

      let newRow: any = {};

      models.forEach( ( model: any, intIndex: number ) => {

        let newDataStruct = {};

        Object.keys( model.rawAttributes ).forEach( ( attribute ) => {

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

  static transformRowValuesToSingleRootNestedObject( rows: any[],
                                                     models: any[],
                                                     alias: string[],
                                                     bIncludeUndefined: boolean = false ) {

    let result: any[] = [];

    rows.forEach( ( row ) => {

      let newRow: any = {};

      models.forEach( ( model: any, intIndex: number ) => {

        let newDataStruct = {};

        Object.keys( model.rawAttributes ).forEach( ( attribute ) => {

          if ( row[ alias[ intIndex ] + "_" + attribute ] !== undefined || bIncludeUndefined === true  ) {

            newDataStruct[ attribute ] = row[ alias[ intIndex ] + "_" + attribute ];

          }

        } );

        if ( intIndex === 0 ) {

          newRow = newDataStruct;

        }
        else {

          newRow[ model.name ] = newDataStruct;

        }

      } );

      result.push( newRow );

    });

    return result;

  }

  static transformRowValuesToNestedObject( rows: any[],
                                           models: any[],
                                           alias: string[],
                                           bIncludeUndefined: boolean = false ) {

    let result: any[] = [];

    rows.forEach( ( row ) => {

      let newRow: any = {};

      let strRoot = "";

      models.forEach( ( model: any, intIndex: number ) => {

        let newDataStruct = {};

        Object.keys( model.rawAttributes ).forEach( ( attribute ) => {

          if ( row[ alias[ intIndex ] + "_" + attribute ] !== undefined || bIncludeUndefined === true  ) {

            newDataStruct[ attribute ] = row[ alias[ intIndex ] + "_" + attribute ];

          }

        } );

        if ( intIndex === 0 ) {

          newRow[ model.name ] = newDataStruct;

          strRoot = model.name;

        }
        else {

          newRow[ strRoot ][ model.name ] = newDataStruct;

        }

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

    rows.forEach( ( row ) => {

      let newRow: any[] = [];

      models.forEach( ( model: any, intIndex: number ) => {

        let newDataStruct = {};

        Object.keys( model.rawAttributes ).forEach( ( attribute ) => {

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

      //options.skip = [];

      if ( instance.rawAttributes[ "Id" ] &&
           !instance.Id ) {

        instance.Id = SystemUtilities.getUUIDv4();

      }

      if ( instance.rawAttributes[ "ShortId" ] &&
           instance.rawAttributes[ "Id" ] &&
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
      if ( instance.isNewRecord === true ) { // &&
          /* ( !options ||
             !options.type  ||
             options.type.toUpperCase() === "BULKCREATE" ||
             options.type.toUpperCase() === "CREATE" ) {
               */

        if ( instance.rawAttributes[ "CreatedBy" ] &&
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

        if ( instance.rawAttributes[ "CreatedAt" ] &&
             !instance.createdAt ) {

          instance.CreatedAt = SystemUtilities.getCurrentDateAndTime().format();

        }

      }
      /*
      else {

        //instance.isNewRecord = false;
        //instance._changed[ "UpdatedAt" ] = true;

        if ( instance.rawAttributes[ "UpdatedBy" ] ) {

          if ( options.context &&
               options.context.UserSessionStatus &&
               options.context.UserSessionStatus.Name ) {

            instance.UpdatedBy = ( instance as any ).options.context.UserSessionStatus.Name;

          }
          else if ( instance.UpdatedBy === null ) {

            instance.UpdatedBy = SystemConstants._CREATED_BY_UNKNOWN_SYSTEM_NET;

          }

          / *
          const intIndexUpdatedBy = options.skip.indexOf( "UpdatedBy" );

          if ( intIndexUpdatedBy >= 0 ) {

            options.skip.splice( intIndexUpdatedBy, 1 );

          }
          * /

        }

        if ( instance.rawAttributes[ "UpdatedAt" ] ) {

          instance.UpdatedAt = SystemUtilities.getCurrentDateAndTime().format(); //( instance as any )._previousDataValues.CreatedAt;

          / *
          const intIndexUpdatedAt = options.skip.indexOf( "UpdatedAt" );

          if ( intIndexUpdatedAt >= 0 ) {

            options.skip.splice( intIndexUpdatedAt, 1 );

          }
          * /

        }

      }

      if ( instance.rawAttributes[ "DisabledBy" ] ) {

        if ( instance.DisabledBy === "1" ||
             ( instance.DisabledBy &&
               instance.DisabledBy.startsWith( "1@" ) ) ) {

          if ( options.context &&
               options.context.UserSessionStatus &&
               options.context.UserSessionStatus.Name ) {

            instance.DisabledBy = ( instance as any ).options.context.UserSessionStatus.Name;

          }
          else if ( instance.DisabledBy.startsWith( "1@" ) ) {

            const strDisabledBy = instance.DisabledBy.substring( 2 ).trim();

            instance.DisabledBy = strDisabledBy ? strDisabledBy : SystemConstants._CREATED_BY_UNKNOWN_SYSTEM_NET;

          }
          else { //if ( instance.DisabledBy === null ) {

            instance.DisabledBy = SystemConstants._CREATED_BY_UNKNOWN_SYSTEM_NET;

          }

          if ( instance.rawAttributes[ "DisabledAt" ] ) {

            instance.DisabledAt = SystemUtilities.getCurrentDateAndTime().format();

            / *
            const intIndexDisabledAt = options.skip.indexOf( "DisabledAt" );

            if ( intIndexDisabledAt >= 0 ) {

              options.skip.splice( intIndexDisabledAt, 1 );

            }
            * /

          }

        }
        else if ( instance.DisabledBy === "0" ) {

          instance.DisabledBy = null;
          instance.DisabledAt = null;

          / *
          const intIndexDisabledBy = options.skip.indexOf( "DisabledBy" );

          if ( intIndexDisabledBy >= 0 ) {

            options.skip.splice( intIndexDisabledBy, 1 );

          }

          const intIndexDisabledAt = options.skip.indexOf( "DisabledAt" );

          if ( intIndexDisabledAt >= 0 ) {

            options.skip.splice( intIndexDisabledAt, 1 );

          }
          * /

        }

      }
      */

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.commonBeforeValidateHook.name;

      const strMark = "9132A5362A48" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  public static commonBeforeCreateHook( instance: any, options: any ) {

    try {

      if ( instance.isNewRecord ) {

        if ( instance.rawAttributes[ "DisabledBy" ] ) {

          if ( instance.DisabledBy === "1" ||
               ( instance.DisabledBy &&
                 instance.DisabledBy.startsWith( "1@" ) ) ) {

            if ( options.context &&
                 options.context.UserSessionStatus &&
                 options.context.UserSessionStatus.Name ) {

              instance.DisabledBy = ( instance as any ).options.context.UserSessionStatus.Name;

            }
            else if ( instance.DisabledBy.startsWith( "1@" ) ) {

              const strDisabledBy = instance.DisabledBy.substring( 2 ).trim();

              instance.DisabledBy = strDisabledBy ? strDisabledBy : SystemConstants._CREATED_BY_UNKNOWN_SYSTEM_NET;

            }
            else {

              instance.DisabledBy = SystemConstants._CREATED_BY_UNKNOWN_SYSTEM_NET;

            }

            if ( instance.rawAttributes[ "DisabledAt" ] ) {

              instance.DisabledAt = SystemUtilities.getCurrentDateAndTime().format();

            }

          }
          else if ( instance.DisabledBy === "0" ) {

            instance.DisabledBy = null;
            instance.DisabledAt = null;

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.commonBeforeCreateHook.name;

      const strMark = "614287AEE870" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  public static commonBeforeUpdateHook( instance: any, options: any ) {

    try {

      if ( instance.isNewRecord === false ) {

        if ( instance.rawAttributes[ "UpdatedBy" ] ) {

          if ( options.context &&
               options.context.UserSessionStatus &&
               options.context.UserSessionStatus.Name ) {

            instance.UpdatedBy = ( instance as any ).options.context.UserSessionStatus.Name;

          }
          else if ( instance.UpdatedBy === null ) {

            instance.UpdatedBy = SystemConstants._CREATED_BY_UNKNOWN_SYSTEM_NET;

          }

        }

        if ( instance.rawAttributes[ "UpdatedAt" ] ) {

          instance.UpdatedAt = SystemUtilities.getCurrentDateAndTime().format(); //( instance as any )._previousDataValues.CreatedAt;

        }

      }

      if ( instance.rawAttributes[ "DisabledBy" ] ) {

        if ( instance.DisabledBy === "1" ||
             ( instance.DisabledBy &&
               instance.DisabledBy.startsWith( "1@" ) ) ) {

          if ( options.context &&
               options.context.UserSessionStatus &&
               options.context.UserSessionStatus.Name ) {

            instance.DisabledBy = ( instance as any ).options.context.UserSessionStatus.Name;

          }
          else if ( instance.DisabledBy.startsWith( "1@" ) ) {

            const strDisabledBy = instance.DisabledBy.substring( 2 ).trim();

            instance.DisabledBy = strDisabledBy ? strDisabledBy : SystemConstants._CREATED_BY_UNKNOWN_SYSTEM_NET;

          }
          else { //if ( instance.DisabledBy === null ) {

            instance.DisabledBy = SystemConstants._CREATED_BY_UNKNOWN_SYSTEM_NET;

          }

          if ( instance.rawAttributes[ "DisabledAt" ] ) {

            instance.DisabledAt = SystemUtilities.getCurrentDateAndTime().format();

          }

        }
        else if ( instance.DisabledBy === "0" ) {

          instance.DisabledBy = null;
          instance.DisabledAt = null;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.commonBeforeUpdateHook.name;

      const strMark = "78D3E3DDAD87" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  public static commonBeforeDestroyHook( instance: any, options: any ) {

    try {

      //

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.commonBeforeDestroyHook.name;

      const strMark = "778A7C602725" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      const strMark = "E08D2A4FF967" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      const strMark = "B6B697C1A31A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      const strMark = "EB50EEE59B04" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

                            }

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

                            }

                            return bResult;

                          },
                          'The :attribute phone number is not in the format of list X-XXX-XXX-XXXX, XX-XXX-XXX-XXXX or XXX-XXX-XXX-XXXX.'
                        );

      Validator.register(
                          'dateInFormat01',
                          function( value: any, requirement, attribute ) {

                            return CommonUtilities.isValidDateInFormat01( value );

                          },
                          'The :attribute is not in the format YYYY-MM-DD and valid date value.'
                        );

      if ( registerCallback ) {

        registerCallback( Validator, logger );

      }

      result = new Validator( data, rules );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createCustomValidatorSync.name;

      const strMark = "BA9782941B37" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

          if ( ( error as any ).extensions &&
               ( error as any ).extensions.exception ) {

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

      const strMark = "4130BD6D754D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

          if ( ( error as any ).extensions &&
               ( error as any ).extensions.exception ) {

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

      const strMark = "4130BD6D754D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      const strMark = "A5C68BF888B6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      const strMark = "CD80D976E0AD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static countWorkers( workers: any ): number {

    let intResult = 0;

    for ( const strWorkerId in workers ) {

      intResult += ( cluster.workers[ strWorkerId ] ? 1 : 0 );

    }

    return intResult;

  }

  static broadcastMessageToWorkers( message: any ): number {

    let intResult = 0;

    for ( const strWorkerId in cluster.workers ) {

      const worker = cluster.workers[ strWorkerId ];

      if ( worker ) {

        worker.send( message );

      }

    }

    return intResult;

  }

  static getHTTPWorkerProcessCount(): number {

    let intResult = 0;

    let strHTTPWorkerProcessCount = process.env.HTTP_WORKER_PROCESS_COUNT;

    if ( strHTTPWorkerProcessCount === "detect" ) {

      intResult = os.cpus().length;

    }
    else if ( isNaN( parseInt( strHTTPWorkerProcessCount ) ) === false ) {

      intResult = parseInt( strHTTPWorkerProcessCount );

    }

    return intResult

  }

  static getJOBWorkerProcessCount(): number {

    let intResult = 0;

    let strJOBWorkerProcessCount = process.env.JOB_WORKER_PROCESS_COUNT;

    if ( strJOBWorkerProcessCount === "detect" ) {

      intResult = os.cpus().length;

    }
    else if ( isNaN( parseInt( strJOBWorkerProcessCount ) ) === false ) {

      intResult = parseInt( strJOBWorkerProcessCount );

    }

    return intResult

  }

  static async getFileHash( strFilename: string,
                            strAlgorithm: string = "md5",
                            logger: any ): Promise<string> {

    let strResult = "";

    try {

      strResult = await new Promise<string>( ( resolve, reject ) => {

        // Algorithm depends on availability of OpenSSL on platform
        // Another algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
        let checkSum = strAlgorithm !== "crc32" ? crypto.createHash( strAlgorithm ): new CRC32Stream();

        try {

          let readStream = fs.createReadStream( strFilename )

          if ( strAlgorithm !== "crc32" ) {

            readStream.on( 'data', function ( data: any ) {

              checkSum.update( data )

            } );

          }
          else {

            readStream.pipe( checkSum );

          }

          // making digest
          readStream.on( 'end', function () {

            const strHash = checkSum.digest( 'hex' );

            if ( strAlgorithm === "crc32" ) {

              checkSum.end();

            }

            return resolve( strHash );

          } );

        }
        catch ( error ) {

          return reject( "" );

        }

      } );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getFileHash.name;

      const strMark = "FCC11802D957" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async deleteFilesPrefixedBy( strFullPath: string,
                                      strPrefix: string,
                                      logger: any ): Promise<Error|boolean> {

    let result = false;

    try {

      let fileList = glob.sync( strPrefix + ".*",
                                {
                                  cwd: strFullPath,
                                  nodir: true
                                } );

      if ( fileList &&
           fileList.length > 0 ) {

        for ( let intIndex = 0; intIndex < fileList.length; intIndex++ ) {

          try {

            fs.unlinkSync( path.join( strFullPath, fileList[ intIndex ] ) );

          }
          catch ( error ) {

            //

          }

        }

        result = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.deleteFilesPrefixedBy.name;

      const strMark = "0EFD62556CFB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = error;

    }

    return result;

  }

  static async moveFilesPrefixedBy( strFullOldPath: string,
                                    strFullNewPath: string,
                                    strPrefix: string,
                                    logger: any ): Promise<Error|boolean> {

    let result = false;

    try {

      let fileList = glob.sync( strPrefix + ".*",
                                {
                                  cwd: strFullOldPath,
                                  nodir: true
                                } );

      if ( fileList &&
           fileList.length > 0 ) {

        fs.mkdirSync( strFullNewPath, { recursive: true } );

        for ( let intIndex = 0; intIndex < fileList.length; intIndex++ ) {

          try {

            fs.renameSync( path.join( strFullOldPath, fileList[ intIndex ] ),
                           path.join( strFullNewPath, fileList[ intIndex ] ) );

          }
          catch ( error ) {

            //

          }

        }

        result = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.moveFilesPrefixedBy.name;

      const strMark = "63CB0E245A23" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = error;

    }

    return result;

  }

  static getHostName(): string {

    return os.hostname();

  }

  static getSystemId(): string {

    let strResult = "";

    if ( process.env.USE_NETWORK_ID_AS_SERVER_NAME === "1" &&
         SystemUtilities.strNetworkId ) {

      strResult = SystemUtilities.strNetworkId;

    }
    else {

      strResult = SystemUtilities.getHostName();

    }

    return strResult;

  }

  static getParseDeviceInfo( strParseDeviceInfo: string ): any {

    let result = null;

    try {

      result = new UAParser( strParseDeviceInfo ).getResult();

      delete result.ua;

    }
    catch ( error ) {

      result = {

                 browser: {

                   name: "Unknown",
                   version: "Unknown"

                 },

                 engine: {

                   name: "Unknown",
                   version: "Unknown"

                 },

                 os: {

                   name: "Unknown",
                   version: "Unknown"

                 },

                 device: {

                   model: "Unknown",
                   type: "Unknown",
                   vendor: "Unknown"

                 },

                 cpu: {

                   architecture: "Unknown"

                 }

               };

    }

    return result;

  }

  static getRandomIntegerRange( intMin: number,
                                intMax: number ): number {

    let intResult = 0;

    try {

      const random = new Random(); // uses the nativeMath engine

      intResult = random.integer( intMin, intMax );

    }
    catch ( error ) {


    }

    return intResult;


  }

  static getRandomIntegerRangeFromString( strRange: string | "random:0:1000" ): number {

    let intResult = 0;

    try {

      let rangeList = strRange ? strRange.split( ":" ): [ "random" , "0", "1000" ];

      if ( rangeList[ 0 ].toLocaleLowerCase() === "random" ) {

        rangeList.splice( 0, 1 );

      }

      let intMin = 0;
      let intMax = 1000;

      if ( rangeList.length >= 1 &&
           isNaN( parseInt( rangeList[ 0 ] ) ) === false ) {

        intMin = Number.parseInt( rangeList[ 0 ] );

      }

      if ( rangeList.length >= 2 &&
           isNaN( parseInt( rangeList[ 1 ] ) ) === false ) {

        intMax = Number.parseInt( rangeList[ 1 ] );

      }

      const random = new Random();

      intResult = random.integer( intMin, intMax );

    }
    catch ( error ) {


    }

    return intResult;


  }

}
