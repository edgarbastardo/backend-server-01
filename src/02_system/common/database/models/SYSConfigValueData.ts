import {
         Table,
         Model,
         DataType,
         PrimaryKey,
         Column,
         BeforeValidate,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";

//import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';
//import moment from "moment-timezone";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

@Table( {
  timestamps: false,
  tableName: "sysConfigValueData",
  modelName: "sysConfigValueData"
} )
export class SYSConfigValueData extends Model<SYSConfigValueData> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

    /*
    if ( CommonUtilities.isNotNullOrEmpty( values ) ) {

      if ( CommonUtilities.isNullOrEmpty( values.Id ) ) {

        this.Id = SystemUtilities.getUUIDv4();

      }

      if ( CommonUtilities.isNullOrEmpty( values.ShortId ) ) {

        this.ShortId = SystemUtilities.hashString( this.Id, 2, null ); //Hashes.CRC32( this.Id ).toString( 16 );

      }

    }
    */

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  ConfigMetaDataId: string;

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  Owner: string;

  @Column( { type: DataType.TEXT } )
  Value: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  ValueLabel: string;

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

  @Column( { type: DataType.TEXT, allowNull: true } )
  ExtraData: string;

  @BeforeValidate
  static beforeValidateHook( instance: SYSConfigValueData, options: any ): void {

    /*
    if ( CommonUtilities.isNullOrEmpty( instance.Id ) ) {

      instance.Id = SystemUtilities.getUUIDv4();

    }

    if ( CommonUtilities.isNullOrEmpty( instance.ShortId ) ) {

      instance.ShortId = SystemUtilities.hashString( instance.Id, 2, null ); //Hashes.CRC32( instance.Id ).toString( 16 );

    }
    */

    if ( CommonUtilities.isNullOrEmpty( instance.CreatedAt ) ) {

      instance.CreatedAt = SystemUtilities.getCurrentDateAndTime().format();

    }
    else {

      instance.UpdatedAt = SystemUtilities.getCurrentDateAndTime().format();

    }

  }

}