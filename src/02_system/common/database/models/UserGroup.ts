import {
         Table,
         Model,
         DataType,
         PrimaryKey,
         Column,
         BeforeValidate,
         BeforeUpdate,
         AfterUpdate,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";
//import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';
//import moment from "moment-timezone";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

const debug = require( 'debug' )( 'UserGroup' );

@Table( {
  timestamps: false,
} )
export class UserGroup extends Model<UserGroup> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

    if ( CommonUtilities.isNotNullOrEmpty( values ) ) {

      if ( CommonUtilities.isNullOrEmpty( values.Id ) ) {

        this.Id = SystemUtilities.getUUIDv4();

      }

      if ( values.ShortId === null ||
           values.ShortId === '0' ) {

        this.ShortId = SystemUtilities.hashString( this.id, 2, null ); //Hashes.CRC32( this.Id ).toString( 16 );

      }

    }

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  Id: string;

  @Column( { type: DataType.STRING( 20 ), unique: true } )
  ShortId: string;

  @Column( { type: DataType.STRING( 75 ), unique: true } )
  Name: string;

  @Column( { type: DataType.TEXT, allowNull: true } )
  Role: string;

  @Column( { type: DataType.STRING( 2048 ), allowNull: true } )
  DenyTagAccess: string;

  @Column( { type: DataType.STRING( 2048 ), allowNull: true } )
  AllowTagAccess: string;

  @Column( { type: DataType.STRING( 1024 ), allowNull: true } )
  Tag: string;

  @Column( { type: DataType.STRING( 512 ), allowNull: true } )
  Comment: string;

  @Column( { type: DataType.STRING( 150 ) } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ) } )
  CreatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  UpdatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  UpdatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  DisabledBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  DisabledAt: string;

  @Column( { type: DataType.TEXT, allowNull: true } )
  ExtraData: string;

  @BeforeValidate
  static beforeValidateHook( instance: UserGroup, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

    //let debugMark = debug.extend( '7B6D8B57ED8B' );
    //debugMark( "%O", instance );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: UserGroup, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );
    //instance.UpdatedAt = SystemUtilities.getCurrentDateAndTime().format();

  }

  /*
  @AfterUpdate
  static afterUpdateHook( instance: UserGroup, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }
  */

}