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
  tableName: "sysDBImportedData",
  modelName: "sysDBImportedData"
} )
export class SYSDBImportedData extends Model<SYSDBImportedData> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

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

  @Column( { type: DataType.STRING( 60 ) } )
  CreatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  UpdatedBy: string;

  @Column( { type: DataType.STRING( 60 ), allowNull: true } )
  UpdatedAt: string;

  @BeforeValidate
  static beforeValidateHook( instance: SYSDBImportedData, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  @BeforeCreate
  static beforeCreateHook( instance: SYSDBImportedData, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    instance.SystemId = os.hostname();

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysDBImportedData",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: SYSDBImportedData, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValues };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    instance.SystemId = os.hostname();

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysDBImportedData",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: SYSDBImportedData, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysDBImportedData",
                                             "delete",
                                             instance,
                                             null );

  }

  public getPrimaryKey(): string[] {

    return [ "Id" ];

  }

}
