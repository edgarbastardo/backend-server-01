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
import os from 'os';
import CommonUtilities from "../../CommonUtilities";
import moment from "moment-timezone";
import SystemUtilities from "../../SystemUtilities";

@Table( {
  timestamps: false,
} )
export class DBImportedData extends Model<DBImportedData> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

    if ( CommonUtilities.isNotNullOrEmpty( values ) &&
         CommonUtilities.isNullOrEmpty( values.Id ) ) {

      this.Id = SystemUtilities.getUUIDv4();

    }

    if ( CommonUtilities.isNullOrEmpty( values.SystemId ) ) {

      values.SystemId = os.hostname();

    }

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  Id: string;

  @Column( { type: DataType.STRING( 75 ) } )
  SystemId: string;

  @Column( { type: DataType.STRING( 2048 ) } )
  FilePath: string;

  @Column( { type: DataType.STRING( 512 ) } )
  FileName: string;

  @Column( { type: DataType.STRING( 20 ) } )
  FullPathCheckSum: string;

  @Column( { type: DataType.STRING( 20 ) } )
  ContentCheckSum: string;

  @Column( { type: DataType.TINYINT } )
  Success: number;

  @Column( { type: DataType.STRING( 150 ) } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ) } )
  CreatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  UpdatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  UpdatedAt: string;

  @BeforeValidate
  static beforeValidateHook( instance: DBImportedData, options: any ): void {

    if ( CommonUtilities.isNullOrEmpty( instance.Id ) ) {

      instance.Id = SystemUtilities.getUUIDv4();

    }

    if ( CommonUtilities.isNullOrEmpty( instance.SystemId ) ) {

      instance.SystemId = os.hostname();

    }

    if ( CommonUtilities.isNullOrEmpty( instance.CreatedAt ) ) {

      instance.CreatedAt = SystemUtilities.getCurrentDateAndTime().format();

    }
    else {

      instance.UpdatedAt = SystemUtilities.getCurrentDateAndTime().format(); //new Date().toISOString();

    }

  }

}