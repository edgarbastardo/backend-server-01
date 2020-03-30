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

import SYSDatabaseLogService from "../services/SYSDatabaseLogService";
import { SYSUserSessionPresence } from "./SYSUserSessionPresence";
import { SYSPresenceRoom } from "./SYSPresenceRoom";

@Table( {
  timestamps: false,
  tableName: "sysUserSessionPresenceInRoom",
  modelName: "sysUserSessionPresenceInRoom"
} )
export class SYSUserSessionPresenceInRoom extends Model<SYSUserSessionPresenceInRoom> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @ForeignKey( () => SYSUserSessionPresence )
  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  UserSessionPresenceId: string;

  @ForeignKey( () => SYSPresenceRoom )
  @Column( { type: DataType.STRING( 40 ) } )
  RoomId: string;

  @Column( { type: DataType.STRING( 150 ) } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ) } )
  CreatedAt: string;

  @BeforeValidate
  static beforeValidateHook( instance: SYSUserSessionPresenceInRoom, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  @BeforeCreate
  static beforeCreateHook( instance: SYSUserSessionPresenceInRoom, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysUserSessionPresenceInRoom",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: SYSUserSessionPresenceInRoom, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValuess };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysUserSessionPresenceInRoom",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: SYSUserSessionPresenceInRoom, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysUserSessionPresenceInRoom",
                                             "delete",
                                             instance,
                                             null );

  }

  public getPrimaryKey(): string[] {

    return [ "UserSessionPresenceId", "RoomId" ];

  }

}