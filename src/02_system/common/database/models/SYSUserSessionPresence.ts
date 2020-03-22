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
         ForeignKey,
         //AfterFind,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";

import SystemUtilities from "../../SystemUtilities";

import { SYSUserSessionStatus } from "./SYSUserSessionStatus";

import SYSDatabaseLogService from "../services/SYSDatabaseLogService";

@Table( {
  timestamps: false,
  tableName: "sysUserSessionPresence",
  modelName: "sysUserSessionPresence"
} )
export class SYSUserSessionPresence extends Model<SYSUserSessionPresence> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @ForeignKey( () => SYSUserSessionStatus )
  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  UserSessionStatusToken: string;

  @Column( { type: DataType.STRING( 75 ) } )
  PresenceId: string;

  @Column( { type: DataType.STRING( 120 ) } )
  Server: string;

  @Column( { type: DataType.STRING( 2048 ) } )
  Room: string;

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
  static beforeValidateHook( instance: SYSUserSessionPresence, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  @BeforeCreate
  static beforeCreateHook( instance: SYSUserSessionPresence, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysUserSessionPresence",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: SYSUserSessionPresence, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValuess };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysUserSessionPresence",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: SYSUserSessionPresence, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysUserSessionPresence",
                                             "delete",
                                             instance,
                                             null );

  }

  public getPrimaryKey(): string[] {

    return [ "UserSessionStatusToken" ];

  }

}