import {
         Model,
         Column,
         Table,
         PrimaryKey,
         DataType,
         //BelongsToMany,
         BeforeValidate,
         BeforeUpdate,
         BeforeCreate,
         BeforeDestroy,
         AutoIncrement,
         //AfterFind,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";


//import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';
//import moment from "moment-timezone";

//import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../../SystemUtilities";

@Table( {
  timestamps: false,
  tableName: "sysDatabaseLog",
  modelName: "sysDatabaseLog"
} )
export class SYSDatabaseLog extends Model<SYSDatabaseLog> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @AutoIncrement
  @PrimaryKey
  @Column( { type: DataType.BIGINT } )
  Id: number;

  @Column( { type: DataType.STRING( 10 ), allowNull: false } )
  Operation: string;

  @Column( { type: DataType.STRING( 120 ), allowNull: false } )
  Database: string;

  @Column( { type: DataType.STRING( 120 ), allowNull: false } )
  Table: string;

  @Column( { type: DataType.JSON, allowNull: false } )
  Data: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: false } )
  CreatedAt: string;

  @Column( { type: DataType.JSON, allowNull: true } )
  ExtraData: string;

  @BeforeValidate
  static beforeValidateHook( instance: SYSDatabaseLog, options: any ): void {

    //SystemUtilities.commonBeforeValidateHook( instance, options );

    //Never log this table!!. About recursion issue!!!

  }

  @BeforeCreate
  static beforeCreateHook( instance: SYSDatabaseLog, options: any ): void {

    //SystemUtilities.commonBeforeCreateHook( instance, options );

    //Never log this table!!. About recursion issue!!!

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: SYSDatabaseLog, options: any ): void {

    //SystemUtilities.commonBeforeUpdateHook( instance, options );

    //Never log this table!!. About recursion issue!!!

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: SYSDatabaseLog, options: any ): void {

    //SystemUtilities.commonBeforeDestroyHook( instance, options );

    //Never log this table!!. About recursion issue!!!

  }

  public getPrimaryKey(): string[] {

    return [ "Id" ];

  }

  /*
  @AfterFind
  static afterFindHook( results: any, options: any ): void {

    if ( CommonUtilities.isNotNullOrEmpty( results ) &&
         CommonUtilities.isNotNullOrEmpty( options.context ) &&
         CommonUtilities.isNotNullOrEmpty( options.context.TimeZoneId ) ) {  // === "America/New_York"

      if ( CommonUtilities.isValidTimeZone( options.context.TimeZoneId ) ) {

        let debugMark = debug.extend( '615BE55AAB16' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
        debugMark( "Before => %O", results );

        if ( Array.isArray( results ) ) {

          results.forEach( ( row ) => {

            SystemUtilities.transformModelTimeZoneFromUTC( row.dataValues, options.context.TimeZoneId );

          } );

        }
        else if ( CommonUtilities.isNotNullOrEmpty( results.dataValues ) ) {

          SystemUtilities.transformModelTimeZoneFromUTC( results.dataValues, options.context.TimeZoneId );

        }

      }

    }

  }
  */

}