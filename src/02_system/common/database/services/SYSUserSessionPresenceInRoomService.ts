import cluster from 'cluster';

//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import CommonConstants from "../../CommonConstants";
//import SystemConstants from "../../SystemContants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

import DBConnectionManager from '../../managers/DBConnectionManager';

import BaseService from "./BaseService";
import { SYSPresenceRoom } from "../models/SYSPresenceRoom";
import { SYSUserSessionPresenceInRoom } from "../models/SYSUserSessionPresenceInRoom";

const debug = require( 'debug' )( 'SYSUserSessionPresenceInRoomService' );

export default class SYSUserSessionPresenceInRoomService extends BaseService {

  static readonly _ID = "sysUserSessionPresenceInRoomService";

  static async create( createData: any,
                       transaction: any,
                       logger: any ): Promise<SYSUserSessionPresenceInRoom | Error> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let options = {

        where: {
                 Name: createData.Name
               },
        transaction: currentTransaction,

      } as any;

      let sysPresenceRoom = await SYSPresenceRoom.findOne( options );

      if ( !sysPresenceRoom ) {

        //Create the room if not exists
        sysPresenceRoom = await SYSPresenceRoom.create(
                                                        {
                                                          Name: createData.Name,
                                                          CreatedBy: createData.CreatedBy,
                                                          CreatedAt: null
                                                        },
                                                        {
                                                          transaction: currentTransaction
                                                        }
                                                      );

      }

      options.where = {
                        UserSessionPresenceId: createData.PresenceId,
                        RoomId: sysPresenceRoom.Id
                      };

      let sysUserSessionPresenceInRoom = await SYSUserSessionPresenceInRoom.findOne( options );

      if ( !sysUserSessionPresenceInRoom ) {

        //Create association if no exists
        sysUserSessionPresenceInRoom = await SYSUserSessionPresenceInRoom.create(
                                                                                  {
                                                                                    UserSessionPresenceId: createData.PresenceId,
                                                                                    RoomId: sysPresenceRoom.Id,
                                                                                    CreatedBy: createData.CreatedBy,
                                                                                    CreatedAt: null
                                                                                  },
                                                                                  {
                                                                                    transaction: currentTransaction
                                                                                  }
                                                                                );

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = sysUserSessionPresenceInRoom;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.create.name;

      const strMark = "F7C4A23AB198" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

      result = error;

    }

    return result;

  }

}