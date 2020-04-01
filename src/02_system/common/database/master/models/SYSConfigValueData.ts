//import cluster from 'cluster';

import {
         Table,
         Model,
         DataType,
         PrimaryKey,
         Column,
         BeforeValidate,
         BeforeUpdate,
         BeforeCreate,
         BeforeDestroy,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";

//import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';
//import moment from "moment-timezone";

//import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../../SystemUtilities";
import SYSDatabaseLogService from '../services/SYSDatabaseLogService';

const debug = require( 'debug' )( 'SYSConfigValueData' );

@Table( {
  timestamps: false,
  tableName: "sysConfigValueData",
  modelName: "sysConfigValueData"
} )
export class SYSConfigValueData extends Model<SYSConfigValueData> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

    /*
    if ( CommonUtilities.isNotNullOrEmpty( values ) ) {

      if ( CommonUtilities.isNullOrEmpty( values.Id ) ) {

        this.Id = SystemUtilities.getUUIDv4();

      }

      if ( CommonUtilities.isNullOrEmpty( values.ShortId ) ) {

        this.ShortId = SystemUtilities.hashString( this.Id, 2, null ); //Hashes.CRC32( this.Id ).toString( 16 );

      }

    }
    */

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  ConfigMetaDataId: string;

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  Owner: string;

  @Column( { type: DataType.TEXT } )
  Value: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  ValueLabel: string;

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
  static beforeValidateHook( instance: SYSConfigValueData, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  @BeforeCreate
  static beforeCreateHook( instance: SYSConfigValueData, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysConfigValueData",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: SYSConfigValueData, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValues };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysConfigValueData",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: SYSConfigValueData, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

  }

  public getPrimaryKey(): string[] {

    return [ "ConfigMetaDataId", "Owner" ];

  }

}