import {
         Model,
         Column,
         Table,
         PrimaryKey,
         DataType,
         BeforeValidate,
         //BeforeUpdate,
         //BeforeCreate,
         //BeforeDestroy,
         //AfterFind,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";

import SystemUtilities from "../../../../../02_system/common/SystemUtilities";

//import SYSDatabaseLogService from "../../../../../02_system/common/database/master/services/SYSDatabaseLogService";

@Table( {
  timestamps: false,
  tableName: "locations",
  modelName: "locations"
} )
export class locations extends Model<locations> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

    /*
    if ( CommonUtilities.isNotNullOrEmpty( values ) ) {

      if ( CommonUtilities.isNullOrEmpty( values.Id ) ) {

        this.Id = SystemUtilities.getUUIDv4();

      }

      if ( CommonUtilities.isNullOrEmpty( values.ShortId ) ||
           values.ShortId === '0' ) {

        this.ShortId = SystemUtilities.hashString( this.Id, 2, null ); //Hashes.CRC32( this.Id ).toString( 16 );

      }

    }
    */

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 36 ), allowNull: false } )
  id: string;

  @Column( { type: DataType.STRING( 36 ), allowNull: false } )
  user_id: string;

  @Column( { type: DataType.STRING( 36 ), allowNull: false } )
  zip_code_id: string;

  @Column( { type: DataType.STRING( 36 ), allowNull: false } )
  phone_id: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  state: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  city: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  address: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  number: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  gate_code: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  description: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  address_status: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  address_type: string;

  @Column( { type: DataType.NOW, allowNull: true } )
  deleted_at: string;

  @Column( { type: DataType.NOW, allowNull: false } )
  created_at: string;

  @Column( { type: DataType.NOW, allowNull: false } )
  updated_at: string;

  @BeforeValidate
  static beforeValidateHook( instance: locations, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  /*
  @BeforeCreate
  static beforeCreateHook( instance: TicketImages, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "bizExample",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: TicketImages, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValuess };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "bizExample",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: TicketImages, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "bizExample",
                                             "delete",
                                             instance,
                                             null );

  }
  */

  public getPrimaryKey(): string[] {

    return [ "id" ]; //Change here

  }

}
