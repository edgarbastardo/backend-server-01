import {
         Model,
         Column,
         Table,
         //CreatedAt,
         //UpdatedAt,
         PrimaryKey,
         DataType,
         BelongsToMany,
         //BeforeCreate,
         //AfterFind,
         //IsUUID,
         //BeforeSave,
         BeforeValidate,
         BeforeUpdate,
         BeforeCreate,
         BeforeDestroy,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";
//import { Sequelize as OriginSequelize, Utils } from "sequelize";

//import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';
//import moment from 'moment-timezone';

import { SYSRoleHasRoute } from "./SYSRoleHasRoute";
import { SYSRole } from "./SYSRole";

//import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

import SYSDatabaseLogService from "../services/SYSDatabaseLogService";

@Table( {
  timestamps: false,
  tableName: "sysRoute",
  modelName: "sysRoute"
} )
export class SYSRoute extends Model<SYSRoute> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

    /*
    if ( CommonUtilities.isNotNullOrEmpty( values ) &&
         CommonUtilities.isNullOrEmpty( values.Id ) &&
         CommonUtilities.isNotNullOrEmpty( values.RequestKind ) &&
         CommonUtilities.isNotNullOrEmpty( values.Path ) ) {

      this.Id = SystemUtilities.hashString( values.RequestKind + ":" + values.Path, 1, null ); //xxxhash algoritm

    }
    */

  }

  //@IsUUID(4)
  //@Length( { max: 40 } )
  @PrimaryKey
  @Column( { type: DataType.STRING( 20 ) } )
  Id: string;

  @Column( { type: DataType.TINYINT().UNSIGNED } )
  AccessKind: number;

  @Column( { type: DataType.TINYINT().UNSIGNED } )
  RequestKind: number;

  @Column( { type: DataType.STRING( 2048 ) } )
  Path: string;

  @Column( { type: DataType.STRING( 1024 ), allowNull: true  } )
  AllowTagAccess: string;

  @Column( { type: DataType.STRING( 1024 ), allowNull: true } )
  Tag: string;

  @Column( { type: DataType.STRING( 512 ) } )
  Description: string;

  @Column( { type: DataType.STRING( 150 ) } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ) } )
  CreatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  UpdatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  UpdatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  DisabledBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  DisabledAt: string;

  @Column( { type: DataType.JSON, allowNull: true } )
  ExtraData: string;

  @BelongsToMany( () => SYSRole, () => SYSRoleHasRoute )
  Roles: SYSRole[];

  @BeforeValidate
  static beforeValidateHook( instance: SYSRoute, options: any ): void {

    if ( !instance.Id &&
         instance.RequestKind &&
         instance.Path ) {

      instance.Id = SystemUtilities.hashString( instance.RequestKind + ":" + instance.Path, 1, null );

    }

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  @BeforeCreate
  static beforeCreateHook( instance: SYSRoute, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysRoute",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: SYSRoute, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValuess };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysRoute",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: SYSRoute, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysRoute",
                                             "delete",
                                             instance,
                                             null );

  }

  public getPrimaryKey(): string[] {

    return [ "Id" ];

  }

  /*
  @BeforeSave
  static beforeSaveHook( instance: Route, options: any ): void {

    instance.PathHash = SystemUtilities.hashString( instance.RequestKind + ":" + instance.Path, 2, null ); //Hashes.CRC32( instance.RequestKind + ":" + instance.Path ).toString( 16 );

    if ( instance.CreatedAt == null ) {

      instance.CreatedAt = new Date().toISOString();

    }
    else {

      instance.UpdatedAt = new Date().toISOString();

    }

    //let debugMark = debug.extend( 'B54E0A8CEE1F' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
    //debugMark( "BeforeSave => %O", instance );

  }
  */

  /*
  @BeforeUpdate
  static beforeUpdate( target: any, propertyName: string ): void {

    //let debugMark = debug.extend( '1D1840C32CA9' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
    //debugMark( "BeforeSave => %O", target );

  }
  */

  /*
  @AfterFind
  static afterFindHook( results: any, options: any ): void {

    //let debugMark = debug.extend( '86EEE23D9F5E' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
    //debugMark( "afterFindHook => %O", options );
    //debugMark( CommonUtilities.isNotNullOrEmpty( options.context ) );
    //debugMark( CommonUtilities.isNotNullOrEmpty( options.context.TimeZoneId ) );

    if ( CommonUtilities.isNotNullOrEmpty( results ) &&
         CommonUtilities.isNotNullOrEmpty( options.context ) &&
         CommonUtilities.isNotNullOrEmpty( options.context.TimeZoneId ) ) {  // === "America/New_York"

      if ( CommonUtilities.isValidTimeZone( options.context.TimeZoneId ) ) {

        //let debugMark = debug.extend( '2DDF16CE7935' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
        //debugMark( "Before => %O", results );

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