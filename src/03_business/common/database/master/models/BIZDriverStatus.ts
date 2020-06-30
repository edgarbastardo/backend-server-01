
import {
         Table,
         Model,
         DataType,
         PrimaryKey,
         Column,
         BeforeValidate,
         //HasOne,
         ForeignKey,
         BelongsTo,
         //BeforeCreate,
         //BeforeUpdate,
         //Is,
         NotNull,
         NotEmpty,
         IsUUID,
         Unique,
         BeforeUpdate,
         BeforeCreate,
         BeforeDestroy,
         //Default,
       } from "sequelize-typescript";

import { BuildOptions } from "sequelize/types";

import SystemUtilities from "../../../../../02_system/common/SystemUtilities";

import SYSDatabaseLogService from "../../../../../02_system/common/database/master/services/SYSDatabaseLogService";

import { SYSUser } from "../../../../../02_system/common/database/master/models/SYSUser";

@Table( {
  timestamps: false,
  tableName: "bizDriverStatus",
  modelName: "bizDriverStatus"
} )
export class BIZDriverStatus extends Model<BIZDriverStatus> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @ForeignKey( () => SYSUser )
  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ), allowNull: false } )
  UserId: string;

  @Column( { type: DataType.SMALLINT, allowNull: false } )
  Status: number;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: false } )
  CreatedAt: string;

  @Column( { type: DataType.JSON, allowNull: true } )
  ExtraData: string;

  @BelongsTo( () => SYSUser, "UserId" )
  sysUser: SYSUser;

  @BeforeValidate
  static beforeValidateHook( instance: BIZDriverStatus, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  @BeforeCreate
  static beforeCreateHook( instance: BIZDriverStatus, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "bizDriverStatus",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: BIZDriverStatus, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValues };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "bizDriverStatus",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: BIZDriverStatus, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "bizDriverStatus",
                                             "delete",
                                             instance,
                                             null );

  }

  public getPrimaryKey(): string[] {

    return [ "UserId" ];

  }

}
