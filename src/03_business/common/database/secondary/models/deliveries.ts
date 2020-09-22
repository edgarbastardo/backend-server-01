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
  tableName: "deliveries",
  modelName: "deliveries"
} )
export class deliveries extends Model<deliveries> {

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
  driver_id: string;

  @Column( { type: DataType.STRING( 36 ), allowNull: false } )
  order_id: string;

  @Column( { type: DataType.INTEGER, allowNull: false } )
  qualification: number;
  
  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  tip1: number;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  tip2: number;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  tip: number;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  tip_method: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  tip_method1: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  tip_method2: string;

  @Column( { type: DataType.NOW, allowNull: true } )
  tip_validated_at: string;

  @Column( { type: DataType.NOW, allowNull: true } )
  created_at: string;

  @Column( { type: DataType.NOW, allowNull: true } )
  updated_at: string;

  @BeforeValidate
  static beforeValidateHook( instance: deliveries, options: any ): void {

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
