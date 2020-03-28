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
         //AutoIncrement,
         //AfterFind,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";
import SystemUtilities from "../../SystemUtilities";

//import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';
//import moment from "moment-timezone";

//import CommonUtilities from "../../CommonUtilities";
//import SystemUtilities from "../../SystemUtilities";

@Table( {
  timestamps: false,
  tableName: "sysInstantMessageLog",
  modelName: "sysInstantMessageLog"
} )
export class SYSInstantMessageLog extends Model<SYSInstantMessageLog> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  Id: string;

  @Column( { type: DataType.STRING( 40 ), allowNull: false } )
  FromId: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  FromName: string;

  @Column( { type: DataType.STRING( 40 ), allowNull: false } )
  ToId: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  ToName: string;

  @Column( { type: DataType.STRING( 40 ), allowNull: false } )
  ToPresenceId: string;

  @Column( { type: DataType.JSON, allowNull: false } )
  Data: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: false } )
  CreatedAt: string;

  @Column( { type: DataType.JSON, allowNull: true } )
  ExtraData: string;

  @BeforeValidate
  static beforeValidateHook( instance: SYSInstantMessageLog, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

    //Never log this table!!. Because this table is a log by self

  }

  @BeforeCreate
  static beforeCreateHook( instance: SYSInstantMessageLog, options: any ): void {

    //SystemUtilities.commonBeforeCreateHook( instance, options );

    //Never log this table!!. Because this table is a log by self

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: SYSInstantMessageLog, options: any ): void {

    //SystemUtilities.commonBeforeUpdateHook( instance, options );

    //Never log this table!!. Because this table is a log by self

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: SYSInstantMessageLog, options: any ): void {

    //SystemUtilities.commonBeforeDestroyHook( instance, options );

    //Never log this table!!. Because this table is a log by self

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