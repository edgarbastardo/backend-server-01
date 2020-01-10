import {
         Model,
         Column,
         Table,
         PrimaryKey,
         DataType,
         BeforeValidate,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";
//import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';
import CommonUtilities from "../../CommonUtilities";
//import moment from "moment-timezone";
import SystemUtilities from "../../SystemUtilities";

@Table( {
  timestamps: false
} )
export class BinaryIndex extends Model<BinaryIndex> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

    if ( CommonUtilities.isNotNullOrEmpty( values ) ) {

      if ( CommonUtilities.isNullOrEmpty( values.Id ) ) {

        this.Id = SystemUtilities.getUUIDv4();

      }

      if ( CommonUtilities.isNullOrEmpty( values.ShortId ) ||
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

  @Column( { type: DataType.TINYINT, allowNull: false } )
  AccessKind: number;

  @Column( { type: DataType.TINYINT, allowNull: false } )
  StorageKind: number;

  @Column( { type: DataType.STRING( 30 ) } )
  ExpireAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  Hash: string;

  @Column( { type: DataType.STRING( 50 ), allowNull: false } )
  MimeType: string;

  @Column( { type: DataType.STRING( 75 ), allowNull: false } )
  Label: string;

  @Column( { type: DataType.STRING( 75 ), allowNull: false } )
  Category: string;

  @Column( { type: DataType.STRING( 2048 ), allowNull: false } )
  FilePath: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  FileName: string;

  @Column( { type: DataType.STRING( 20 ), allowNull: false } )
  FileExtension: string;

  @Column( { type: DataType.BIGINT, allowNull: false } )
  FileSize: number;

  @Column( { type: DataType.STRING( 1024 ), allowNull: true } )
  Tag: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  System: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  Context: string;

  @Column( { type: DataType.STRING( 512 ), allowNull: true } )
  Comment: string;

  @Column( { type: DataType.STRING( 2048 ), allowNull: true } )
  DenyTagAccess: string;

  @Column( { type: DataType.STRING( 2048 ), allowNull: true } )
  AllowTagAccess: string;

  @Column( { type: DataType.STRING( 40 ), allowNull: true } )
  ShareCode: string;

  @Column( { type: DataType.STRING( 2048 ), allowNull: false } )
  Owner: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: false } )
  CreatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  UpdatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  UpdatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  DisabledBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  DisabledAt: string;

  @Column( { type: DataType.TINYINT, allowNull: false } )
  ProcessNeeded: number;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  ProcessStartedAt: string;

  @Column( { type: DataType.TEXT, allowNull: true } )
  ExtraData: string;

  @BeforeValidate
  static beforeValidateHook( instance: BinaryIndex, options: any ): void {

    if ( CommonUtilities.isNullOrEmpty( instance.Id ) ) {

      instance.Id = SystemUtilities.getUUIDv4();

    }

    if ( CommonUtilities.isNullOrEmpty( instance.ShortId ) ||
         instance.ShortId === '0' ) {

      instance.ShortId = SystemUtilities.hashString( instance.Id, 2, null ); //Hashes.CRC32( instance.Id ).toString( 16 );

    }

    if ( CommonUtilities.isNullOrEmpty( instance.CreatedAt ) ) {

      instance.CreatedAt = SystemUtilities.getCurrentDateAndTime().format();

    }
    else {

      instance.UpdatedAt = SystemUtilities.getCurrentDateAndTime().format();

    }

  }

}