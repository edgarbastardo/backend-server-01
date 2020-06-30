
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

import { SYSUserGroup } from "../../../../../02_system/common/database/master/models/SYSUserGroup";
import { BIZEstablishment } from "./BIZEstablishment";

@Table( {
  timestamps: false,
  tableName: "bizEstablishmentInUserGroup",
  modelName: "bizEstablishmentInUserGroup"
} )
export class BIZEstablishmentInUserGroup extends Model<BIZEstablishmentInUserGroup> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @ForeignKey( () => SYSUserGroup )
  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ), allowNull: false } )
  UserGroupId: string;

  @ForeignKey( () => BIZEstablishment )
  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ), allowNull: false } )
  EstablishmentId: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: false } )
  CreatedAt: string;

  @Column( { type: DataType.JSON, allowNull: true } )
  ExtraData: string;

  @BelongsTo( () => SYSUserGroup, "UserGroupId" )
  sysUserGroup: SYSUserGroup;

  @BelongsTo( () => BIZEstablishment, "EstablishmentId" )
  bizEstablishment: BIZEstablishment;

  @BeforeValidate
  static beforeValidateHook( instance: BIZEstablishmentInUserGroup, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  @BeforeCreate
  static beforeCreateHook( instance: BIZEstablishmentInUserGroup, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "bizEstablishmentInUserGroup",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: BIZEstablishmentInUserGroup, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValues };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "bizEstablishmentInUserGroup",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: BIZEstablishmentInUserGroup, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "bizEstablishmentInUserGroup",
                                             "delete",
                                             instance,
                                             null );

  }

  public getPrimaryKey(): string[] {

    return [ "UserGroupId", "EstablishmentId" ];

  }

}
