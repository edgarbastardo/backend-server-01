//import cluster from 'cluster';

//import CommonUtilities from "../../CommonUtilities";
//import SystemUtilities from '../../SystemUtilities';

//import { SYSUser } from "../models/SYSUser";

//import DBConnectionManager from "../../managers/DBConnectionManager";

export default abstract class BaseService {

  /*
  getRelations(): any[] {

    return [];

  }

  toDTO( instance: any, params: any, logger: any ): any {

    if ( CommonUtilities.isNotNullOrEmpty( instance ) ) {

      if ( CommonUtilities.isValidTimeZone( params.TimeZoneId ) ) {

        SystemUtilities.transformModelToTimeZone( instance,
                                                  params.TimeZoneId,
                                                  logger );

      }

      return instance.dataValues;

    }

  }

  async getOneByJSONQuery( jsonQuery: any,
                           model: any,
                           transaction: any,
                           logger: any ): Promise<Object | Error> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      / *
      const Sequelize = require( 'sequelize' );
      const Op = Sequelize.Op;

      const s = Symbol.for('or');

      debug( Symbol.for('or') );

      debug( typeof Op.or );
      //Symbol(or)
      //const w = { "or": [{Id: 12}, {Id: 13}] }
      * /
     //const s = Symbol.for('or');
     //const w = { [Symbol.for('or')]: [ { Id: 'cc' }, { Id: 'dd' } ] };

     //debug( typeof w[ Symbol.for('or') ] );

     //const w1 = { "Symbol(or)": [ { Id: 'cc' }, { Id: 'dd' } ] };

     //debug( typeof w1[ "Symbol(or)" ] );


     //const w = "{ $or: [ { Id: { $eq: 'cc' } }, { Id: { $eq: 'cc' } } ] }"

     / *
      const w = {
        $or: [
          {
            Id: {
              $eq: '111'
            }
          },
          {
            Id: {
              $eq: '222'
            }
          }
        ]
      };

      const w = {
        Id: {
          $ne: null
        }
      }
      * /

      const options = {

        where: jsonQuery,
        transaction: currentTransaction,
        include: this.getRelations(),
        //raw: true,
        / *
        include: [
          { model: UserGroup },
          { model: Person },
        ],
        * /

      }

      result = await model.findOne( options );

      //result = this.toDTO( result, { TimeZoneId: strTimeZoneId }, logger );

      / *
      if ( CommonUtilities.isValidTimeZone( strTimeZoneId ) ) {

        SystemUtilities.transformModelToTimeZone( result,
                                                  strTimeZoneId,
                                                  logger );

        SystemUtilities.transformModelToTimeZone( result.dataValues.sysUserGroup,
                                                  strTimeZoneId,
                                                  logger );

        if ( CommonUtilities.isNotNullOrEmpty( result.dataValues.sysPerson ) ) {

          SystemUtilities.transformModelToTimeZone( result.dataValues.sysPerson,
                                                    strTimeZoneId,
                                                    logger );

        }

      }
      * /

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = BaseService.name + "." + this.getOneByJSONQuery.name;

      const strMark = "260807FFEFE7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction !== null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

      result = error;

    }

    return result;

  }
  */

  

}