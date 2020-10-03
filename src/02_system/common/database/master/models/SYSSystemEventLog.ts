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
         //AutoIncrement,
         //AfterFind,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";

//import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';
//import moment from "moment-timezone";

import CommonConstants from "../../../CommonConstants";
import SystemConstants from "../../../SystemContants";

import SystemUtilities from "../../../SystemUtilities";

@Table( {
  timestamps: false,
  tableName: "sysSystemEventLog",
  modelName: "sysSystemEventLog"
} )
export class SYSSystemEventLog extends Model<SYSSystemEventLog> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @AutoIncrement
  @PrimaryKey
  @Column( { type: DataType.BIGINT } )
  Id: number;

  @Column( { type: DataType.STRING( 75 ), allowNull: false } )
  SystemId: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  SystemName: string;

  @Column( { type: DataType.STRING( 120 ), allowNull: false } )
  SubSystem: string;

  @Column( { type: DataType.STRING( 40 ), allowNull: false } )
  Token: string;

  @Column( { type: DataType.STRING( 40 ), allowNull: false } )
  UserId: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  UserName: string;

  @Column( { type: DataType.STRING( 75 ), allowNull: false } )
  Code: string;

  @Column( { type: DataType.STRING( 60 ), allowNull: false } )
  EventAt: string;

  @Column( { type: DataType.JSON, allowNull: false } )
  Data: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 60 ), allowNull: false } )
  CreatedAt: string;

  @Column( { type: DataType.JSON, allowNull: true } )
  ExtraData: string;

  @BeforeValidate
  static beforeValidateHook( instance: SYSSystemEventLog, options: any ): void {

    //SystemUtilities.commonBeforeValidateHook( instance, options );

    //Never log this table!!. Because this table is a log by self

    if ( !instance.CreatedBy ) {

      instance.CreatedBy = SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET;

    }

    instance.CreatedAt = SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_ISO8601_Millis );

  }

  @BeforeCreate
  static beforeCreateHook( instance: SYSSystemEventLog, options: any ): void {

    //SystemUtilities.commonBeforeCreateHook( instance, options );

    //Never log this table!!. Because this table is a log by self

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: SYSSystemEventLog, options: any ): void {

    //SystemUtilities.commonBeforeUpdateHook( instance, options );

    //Never log this table!!. Because this table is a log by self

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: SYSSystemEventLog, options: any ): void {

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
