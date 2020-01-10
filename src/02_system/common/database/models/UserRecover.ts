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
import SystemUtilities from "../../SystemUtilities";

@Table( {
  timestamps: false,
} )
export class UserRecover extends Model<UserRecover> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

    if ( CommonUtilities.isNotNullOrEmpty( values ) &&
         CommonUtilities.isNullOrEmpty( values.Id ) ) {

      this.Id = SystemUtilities.getUUIDv4();

    }

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  Id: string;

  @Column( { type: DataType.STRING( 40 ) } )
  @ForeignKey( () => User )
  UserId: string;

  @Column( { type: DataType.STRING( 40 ) } )
  Token: string;

  @Column( { type: DataType.STRING( 512 ), allowNull: true } )
  Comment: string;

  @Column( { type: DataType.STRING( 150 ) } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ) } )
  CreatedAt: string;

  @Column( { type: DataType.TEXT, allowNull: true } )
  ExtraData: string;

  @BelongsTo( () => User, "UserId" )
  User: User;

  @BeforeValidate
  static beforeValidateHook( instance: UserRecover, options: any ): void {

    if ( CommonUtilities.isNullOrEmpty( instance.CreatedAt ) ) {

      instance.CreatedAt = SystemUtilities.getCurrentDateAndTime().format();

    }

  }

}