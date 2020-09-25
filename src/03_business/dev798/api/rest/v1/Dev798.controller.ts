import cluster from 'cluster';
import CommonConstants from '../../../../../02_system/common/CommonConstants';
import CommonUtilities from '../../../../../02_system/common/CommonUtilities'; 
import { ticket_images as ticket_image } from '../../../../../03_business/common/database/secondary/models/ticket_images';
import BaseService from '../../../../../02_system/common/database/master/services/BaseService';
import DBConnectionManager from '../../../../../02_system/common/managers/DBConnectionManager';
import SystemConstants from '../../../../../02_system/common/SystemContants';
import SystemUtilities from '../../../../../02_system/common/SystemUtilities';
import { id } from 'inversify';

//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';


const debug = require( 'debug' )( 'ticket_imagesService' );

export default class ticket_imagesService extends BaseService {

  static readonly _ID = "ticket_imagesService";

  static async createOrUpdate(
                               strID:string,
                               strOrderId: string,
                               strImage: string,
                               strMigrated: string,
                               strURL: string,
                               strLock: string,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<ticket_image> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      if ( currentTransaction === null ) {

        const dbConnection = DBConnectionManager.getDBConnection( "master" );

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { "Id": strID },
        transaction: currentTransaction,

      }

      let ticket_imageInDB = await ticket_image.findOne( options );

      if ( CommonUtilities.isNullOrEmpty( ticket_imageInDB ) ) {

        ticket_imageInDB = await ticket_image.create(
                                                      {
                                                        order_id:strOrderId,
                                                        image: strImage,
                                                        migrated: strMigrated,
                                                        url:strURL,
                                                        lock:strLock,
                                                        CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
                                                      },
                                                      { transaction: currentTransaction }
                                                    );

      }
      else if ( bUpdate ) {

        ticket_imageInDB.order_id = strOrderId;
        ticket_imageInDB.image = strImage;
        ticket_imageInDB.migrated = strMigrated;
        ticket_imageInDB.url = strURL;
        ticket_imageInDB.lock = strLock;

        await ticket_imageInDB.update( ( ticket_imageInDB as any ).dataValues,
                                   options );

        ticket_imageInDB = await ticket_image.findOne( options );

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

      result = ticket_imageInDB;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "8D3BF98073F2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
