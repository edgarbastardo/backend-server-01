import {
         Table,
         Model,
         DataType,
         PrimaryKey,
         Column,
         BeforeValidate,
         HasOne,
         ForeignKey,
         BelongsTo,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";

//import uuidv4 from 'uuid/v4';
//import moment from "moment-timezone";

import { SYSUser } from "./SYSUser";
import { SYSUserGroup } from "./SYSUserGroup";

import SystemConstants from "../../SystemContants";

//import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

@Table( {
  timestamps: false,
  tableName: "sysUserSessionStatus",
  modelName: "sysUserSessionStatus"
} )
export class SYSUserSessionStatus extends Model<SYSUserSessionStatus> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

    /*
    if ( CommonUtilities.isNotNullOrEmpty( values ) &&
         CommonUtilities.isNullOrEmpty( values.Id ) ) {

      this.Id = SystemUtilities.getUUIDv4();

    }
    */

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ), allowNull: false } )
  UserId: string;

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ), allowNull: false } )
  UserGroupId: string;

  @PrimaryKey
  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  Token: string;

  @Column( { type: DataType.STRING( 40 ), allowNull: false } )
  ShortToken: string;

  @Column( { type: DataType.STRING( 40 ), allowNull: true } )
  BinaryDataToken: string;

  @Column( { type: DataType.STRING( 40 ), allowNull: true } )
  SocketToken: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  FrontendId: string;

  @Column( { type: DataType.STRING( 75 ), allowNull: true } )
  SourceIPAddress: string;

  @Column( { type: DataType.TEXT, allowNull: false } )
  Role: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  UserName: string;

  @Column( { type: DataType.TINYINT, allowNull: false } )
  ExpireKind: number;

  @Column( { type: DataType.STRING( 30 ), allowNull: false } )
  ExpireOn: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  HardLimit: string;

  @Column( { type: DataType.STRING( 1024 ), allowNull: true } )
  Tag: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: false } )
  CreatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  UpdatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: false } )
  UpdatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  LoggedOutBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  LoggedOutAt: string;

  @Column( { type: DataType.TEXT, allowNull: true } )
  ExtraData: string;

  @BelongsTo( () => SYSUser, "UserId" )
  User: SYSUser;

  @BelongsTo( () => SYSUserGroup, "UserGroupId" )
  UserGroup: SYSUserGroup;

  @BeforeValidate
  static beforeValidateHook( instance: SYSUserSessionStatus, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

    if ( !instance.ShortToken ) {

      instance.ShortToken =  SystemUtilities.hashString( instance.Token, 2, null ) + SystemUtilities.hashString( SystemUtilities.getUUIDv4(), 2, null ).substring( 4 );

    }

    /*
    if ( CommonUtilities.isNullOrEmpty( instance.CreatedAt ) ) {

      instance.CreatedAt = SystemUtilities.getCurrentDateAndTime().format();

    }
    */

    if ( !instance.UpdatedBy ) {

      instance.UpdatedBy = SystemConstants._CREATED_BY_UNKNOWN_SYSTEM_NET;

    }

    if ( !instance.UpdatedAt ) {

      instance.UpdatedAt = SystemUtilities.getCurrentDateAndTime().format();

    }

  }

}