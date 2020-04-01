import {
         Table,
         Model,
         DataType,
         PrimaryKey,
         Column,
         BeforeValidate,
         BeforeCreate,
         BeforeUpdate,
         BeforeDestroy,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";

//import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';
//import moment from "moment-timezone";

//import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../../SystemUtilities";
import SYSDatabaseLogService from "../services/SYSDatabaseLogService";

//const debug = require( 'debug' )( 'SYSConfigMetaData' );

@Table( {
  timestamps: false,
  tableName: "sysConfigMetaData",
  modelName: "sysConfigMetaData"
} )
export class SYSConfigMetaData extends Model<SYSConfigMetaData> {

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

  @Column( { type: DataType.STRING( 50 ) } )
  Scope: string;

  @Column( { type: DataType.STRING( 75 ) } )
  Owner: string;

  @Column( { type: DataType.STRING( 50 ) } )
  Category: string;

  @Column( { type: DataType.STRING( 150 ), unique: true } )
  Name: string;

  @Column( { type: DataType.STRING( 200 ) } )
  Label: string;

  @Column( { type: DataType.STRING( 512 ) } )
  Description: string;

  @Column( { type: DataType.SMALLINT } )
  ListOrder: number;

  @Column( { type: DataType.TINYINT } )
  Hidden: number;

  @Column( { type: DataType.TINYINT } )
  Private: number;

  @Column( { type: DataType.TEXT, allowNull: true } )
  Default: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  DefaultLabel: string;

  @Column( { type: DataType.STRING( 2048 ), allowNull: true } )
  DenyTagAccessR: string;

  @Column( { type: DataType.STRING( 2048 ), allowNull: true } )
  DenyTagAccessW: string;

  @Column( { type: DataType.STRING( 2048 ) } )
  AllowTagAccessR: string;

  @Column( { type: DataType.STRING( 2048 ) } )
  AllowTagAccessW: string;

  @Column( { type: DataType.TEXT, allowNull: true } )
  Example: string;

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

  @Column( { type: DataType.JSON, allowNull: true } )
  ExtraData: string;

  @BeforeValidate
  static beforeValidateHook( instance: SYSConfigMetaData, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  @BeforeCreate
  static beforeCreateHook( instance: SYSConfigMetaData, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysConfigMetaData",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: SYSConfigMetaData, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValues };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysConfigMetaData",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: SYSConfigMetaData, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysConfigMetaData",
                                             "delete",
                                             instance,
                                             null );

  }

  public getPrimaryKey(): string[] {

    return [ "Id" ];

  }

}