import os from 'os';

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
//import moment from "moment-timezone";

//import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../../SystemUtilities";
import SYSDatabaseLogService from '../services/SYSDatabaseLogService';

@Table( {
  timestamps: false,
  tableName: "sysDBMigratedData",
  modelName: "sysDBMigratedData"
  // validate: {
  //   validateDefault( this: SYSDBMigratedData ): void {
  //   }
  // }
} )
export class SYSDBMigratedData extends Model<SYSDBMigratedData> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

    /*
    if ( CommonUtilities.isNotNullOrEmpty( values ) &&
         CommonUtilities.isNullOrEmpty( values.Id ) ) {

      this.Id = SystemUtilities.getUUIDv4();

    }

    if ( CommonUtilities.isNullOrEmpty( values.SystemId ) ) {

      values.SystemId = os.hostname();

    }
    */

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  Id: string;

  @Column( { type: DataType.STRING( 75 ) } )
  SystemId: string;

  @Column( { type: DataType.STRING( 2048 ) } )
  FilePath: string;

  @Column( { type: DataType.STRING( 512 ) } )
  FileName: string;

  @Column( { type: DataType.STRING( 20 ) } )
  FullPathCheckSum: string;

  @Column( { type: DataType.STRING( 20 ) } )
  ContentCheckSum: string;

  @Column( { type: DataType.TINYINT } )
  Success: number;

  @Column( { type: DataType.STRING( 150 ) } )
  Comment: string;

  @Column( { type: DataType.STRING( 150 ) } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ) } )
  CreatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  UpdatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  UpdatedAt: string;

  @BeforeValidate
  static beforeValidateHook( instance: SYSDBMigratedData, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

    /*
    if ( CommonUtilities.isNullOrEmpty( instance.Id ) ) {

      instance.Id = SystemUtilities.getUUIDv4();

    }

    if ( CommonUtilities.isNullOrEmpty( instance.SystemId ) ) {

      instance.SystemId = os.hostname();

    }

    if ( CommonUtilities.isNullOrEmpty( instance.CreatedAt ) ) {

      instance.CreatedAt = SystemUtilities.getCurrentDateAndTime().format();

    }
    else {

      instance.UpdatedAt = SystemUtilities.getCurrentDateAndTime().format(); //new Date().toISOString();

    }
    */

  }

  @BeforeCreate
  static beforeCreateHook( instance: SYSDBMigratedData, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    instance.SystemId = os.hostname();

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysDBMigratedData",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: SYSDBMigratedData, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValues };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    instance.SystemId = os.hostname();

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysDBMigratedData",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: SYSDBMigratedData, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysDBMigratedData",
                                             "delete",
                                             instance,
                                             null );

  }

  public getPrimaryKey(): string[] {

    return [ "Id" ];

  }

}
