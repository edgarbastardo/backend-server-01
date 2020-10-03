import {
         Model,
         Column,
         Table,
         PrimaryKey,
         DataType,
         BelongsToMany,
         BeforeValidate,
         BeforeUpdate,
         BeforeCreate,
         BeforeDestroy,
         //AfterFind,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";

import { SYSRoleHasRoute } from "./SYSRoleHasRoute";
import { SYSRoute } from "./SYSRoute";

//import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';
//import moment from "moment-timezone";

//import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../../SystemUtilities";

import SYSDatabaseLogService from "../services/SYSDatabaseLogService";

@Table( {
  timestamps: false,
  tableName: "sysRole",
  modelName: "sysRole"
} )
export class SYSRole extends Model<SYSRole> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

    /*
    if ( CommonUtilities.isNotNullOrEmpty( values ) ) {

      if ( CommonUtilities.isNullOrEmpty( values.Id ) ) {

        this.Id = SystemUtilities.getUUIDv4();

      }

      if ( CommonUtilities.isNullOrEmpty( values.ShortId ) ||
           values.ShortId === '0' ) {

        this.ShortId = SystemUtilities.hashString( this.Id, 2, null ); //Hashes.CRC32( this.Id ).toString( 16 );

      }

    }
    */

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  Id: string;

  @Column( { type: DataType.STRING( 20 ), unique: true } )
  ShortId: string;

  @Column( { type: DataType.STRING( 120 ), unique: true } )
  Name: string;

  @Column( { type: DataType.STRING( 1024 ), allowNull: true } )
  Tag: string;

  @Column( { type: DataType.STRING( 512 ) } )
  Comment: string;

  @Column( { type: DataType.STRING( 150 ) } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 60 ) } )
  CreatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  UpdatedBy: string;

  @Column( { type: DataType.STRING( 60 ), allowNull: true } )
  UpdatedAt: string;

  @Column( { type: DataType.JSON, allowNull: true } )
  ExtraData: string;

  @BelongsToMany( () => SYSRoute, () => SYSRoleHasRoute )
  routes?: SYSRoute[];

  @BeforeValidate
  static beforeValidateHook( instance: SYSRole, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  @BeforeCreate
  static beforeCreateHook( instance: SYSRole, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysRole",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: SYSRole, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValuess };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysRole",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: SYSRole, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysRole",
                                             "delete",
                                             instance,
                                             null );

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
