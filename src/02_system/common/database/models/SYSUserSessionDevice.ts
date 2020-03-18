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

import SystemUtilities from "../../SystemUtilities";

import SYSDatabaseLogService from "../services/SYSDatabaseLogService";

@Table( {
  timestamps: false,
  tableName: "sysUserSessionDevice",
  modelName: "sysUserSessionDevice"
} )
export class SYSUserSessionDevice extends Model<SYSUserSessionDevice> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  UserSessionStatusToken: string;

  @Column( { type: DataType.STRING( 175 ) } )
  PushToken: string;

  @Column( { type: DataType.STRING( 250 ) } )
  Device: string;

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
  static beforeValidateHook( instance: SYSUserSessionDevice, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  @BeforeCreate
  static beforeCreateHook( instance: SYSUserSessionDevice, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysUserSessionDevice",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: SYSUserSessionDevice, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValuess };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysUserSessionDevice",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: SYSUserSessionDevice, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysUserSessionDevice",
                                             "delete",
                                             instance,
                                             null );

  }

  public getPrimaryKey(): string[] {

    return [ "UserSessionStatusToken" ];

  }

}