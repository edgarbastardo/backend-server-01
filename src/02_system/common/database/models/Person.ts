import {
         Table,
         Model,
         DataType,
         PrimaryKey,
         Column,
         BeforeValidate,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";
//import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';
import cluster from 'cluster';

import CommonConstants from "../../CommonConstants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

const debug = require( 'debug' )( 'Person' );

@Table( {
  timestamps: false,
} )
export class Person extends Model<Person> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  Id: string;

  @Column( { type: DataType.STRING( 20 ), unique: true } )
  ShortId: string;

  @Column( { type: DataType.STRING( 40 ), allowNull: true } )
  ImageId: string;

  @Column( { type: DataType.TEXT, allowNull: true } )
  Title: string;

  @Column( { type: DataType.STRING( 75 ) } )
  FirstName: string;

  @Column( { type: DataType.STRING( 75 ), allowNull: true } )
  LastName: string;

  @Column( { type: DataType.STRING( 75 ), allowNull: true } )
  NickName: string;

  @Column( { type: DataType.STRING( 40 ), allowNull: true } )
  Abbreviation: string;

  @Column( { type: DataType.TINYINT, allowNull: true } )
  Gender: number;

  @Column( { type: DataType.DATEONLY, allowNull: true } )
  BirthDate: Date;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  Phone: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  EMail: string;

  @Column( { type: DataType.STRING( 512 ), allowNull: true } )
  Address: string;

  @Column( { type: DataType.STRING( 1024 ), allowNull: true } )
  Tag: string;

  @Column( { type: DataType.STRING( 512 ), allowNull: true } )
  Comment: string;

  @Column( { type: DataType.STRING( 150 ) } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ) } )
  CreatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  UpdatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  UpdatedAt: string;

  @Column( { type: DataType.TEXT, allowNull: true } )
  ExtraData: string;

  @BeforeValidate
  static beforeValidateHook( instance: Person, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  static async convertFieldValues( params: any ): Promise<any> {

    let result = null;

    try {

      result = params.Data;

      if ( params.TimeZoneId ) {

        const strTimeZoneId = params.TimeZoneId;

        result = SystemUtilities.transformObjectToTimeZone( params.Data,
                                                            strTimeZoneId,
                                                            params.Logger );

        if ( Array.isArray( params.Include ) ) {

          for ( const modelIncluded of params.Include ) {

            if ( modelIncluded.model &&
                 result[ modelIncluded.model.name ] ) {

              result[ modelIncluded.model.name ] = SystemUtilities.transformObjectToTimeZone( result[ modelIncluded.model.name ].dataValues,
                                                                                              strTimeZoneId,
                                                                                              params.Logger );

            }

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.convertFieldValues.name;

      const strMark = "98805E57AE91" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( params.logger &&
           typeof params.logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        params.logger.error( error );

      }

    }

    return result;

  }

}