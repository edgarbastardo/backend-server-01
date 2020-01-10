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
import CommonUtilities from "../../CommonUtilities";
import moment from "moment-timezone";
import { User } from "./User";
//import SystemUtilities from "../../SystemUtilities";
import { UserGroup } from "./UserGroup";
import SystemUtilities from "../../SystemUtilities";

@Table( {
  timestamps: false,
} )
export class UserSessionStatus extends Model<UserSessionStatus> {

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
  @Column( { type: DataType.STRING( 40 ) } )
  UserId: string;

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  UserGroupId: string;

  @PrimaryKey
  @Column( { type: DataType.STRING( 150 ) } )
  Token: string;

  @Column( { type: DataType.STRING( 40 ), allowNull: true } )
  BinaryDataToken: string;

  @Column( { type: DataType.STRING( 40 ), allowNull: true } )
  SocketToken: string;

  @Column( { type: DataType.STRING( 150 ) } )
  ClientId: string;

  @Column( { type: DataType.STRING( 75 ), allowNull: true } )
  SourceIPAddress: string;

  @Column( { type: DataType.TEXT } )
  Role: string;

  @Column( { type: DataType.STRING( 150 ) } )
  UserName: string;

  @Column( { type: DataType.TINYINT } )
  ExpireKind: number;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  ExpireOn: string;

  @Column( { type: DataType.STRING( 1024 ), allowNull: true } )
  Tag: string;

  @Column( { type: DataType.STRING( 150 ) } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ) } )
  CreatedAt: string;

  @Column( { type: DataType.STRING( 150 ) } )
  UpdatedBy: string;

  @Column( { type: DataType.STRING( 30 ) } )
  UpdatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  LoggedOutBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  LoggedOutAt: string;

  @Column( { type: DataType.TEXT, allowNull: true } )
  ExtraData: string;

  @BelongsTo( () => User, "UserId" )
  User: User;

  @BelongsTo( () => UserGroup, "UserGroupId" )
  UserGroup: UserGroup;

  @BeforeValidate
  static beforeValidateHook( instance: UserSessionStatus, options: any ): void {

    if ( CommonUtilities.isNullOrEmpty( instance.CreatedAt ) ) {

      instance.CreatedAt = SystemUtilities.getCurrentDateAndTime().format();

    }

    if ( CommonUtilities.isNullOrEmpty( instance.LoggedOutAt ) ||
         CommonUtilities.isNullOrEmpty( instance.UpdatedAt ) ) {

      instance.UpdatedAt = SystemUtilities.getCurrentDateAndTime().format();

    }

  }

}