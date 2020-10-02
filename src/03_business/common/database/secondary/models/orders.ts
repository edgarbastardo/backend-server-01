import {
         Model,
         Column,
         Table,
         PrimaryKey,
         DataType,
         BeforeValidate,
         NotEmpty,
         NotNull,
         Unique
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
  tableName: "orders",
  modelName: "orders"
} )
export class orders extends Model<orders> {

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
  @Unique
  @Column( { type: DataType.STRING( 36 ), allowNull: false } )
  id: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 36 ), allowNull: false } )
  user_id: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 36 ), allowNull: false } )
  location_id: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 36 ), allowNull: false } )
  establishment_id: string;

  @Column( { type: DataType.STRING( 36 ), allowNull: true } )
  invoice_id: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  note: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  payment_method: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  payment_method1: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  payment_method2: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  status: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  state: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  ticket: string;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  amount1: number;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  amount2: number;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  original_amount: number;

  @Column( { type: DataType.DATEONLY, allowNull: true } )
  want_delivery_date: string;

  @Column( { type: DataType.TIME, allowNull: true } )
  want_delivery_time: string;

  @Column( { type: DataType.TIME, allowNull: true } )
  time_retirement: string;

  @Column( { type: DataType.TIME, allowNull: true } )
  time_arrival_driver: string;

  @Column( { type: DataType.STRING, allowNull: true } )
  time_accepted_by_the_driver: string;

  @Column( { type: DataType.STRING, allowNull: true } )
  time_collected_by_the_driver: string;

  @Column( { type: DataType.STRING, allowNull: true } )
  time_finish: string;

  @Column( { type: DataType.STRING, allowNull: true } )
  created_at: string;

  @Column( { type: DataType.STRING, allowNull: true } )
  updated_at: string;

  @Column( { type: DataType.STRING, allowNull: true } )
  time_from_wait_by_the_driver: string;

  @Column( { type: DataType.STRING, allowNull: true } )
  time_from_wait_by_the_system: string;

  @Column( { type: DataType.STRING, allowNull: true } )
  time_in_which_the_driver_leaves_the_local: string;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  fee: number;

  @Column( { type: DataType.TIME, allowNull: true } )
  delivered: string;

  @Column( { type: DataType.INTEGER, allowNull: true } )
  extra_miles: number;

  @Column( { type: DataType.SMALLINT, allowNull: true } )
  inspected: number;

  @Column( { type: DataType.SMALLINT, allowNull: true } )
  status_number: number;

  @Column( { type: DataType.STRING( 100 ), allowNull: true } )
  client_name: string;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  fee_kk: number;

  @Column( { type: DataType.INTEGER, allowNull: true } )
  extra_miles_driver_order: number;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  order_miles_quantity: number;

  @Column( { type: DataType.INTEGER, allowNull: true } )
  catering_type: number;

  @Column( { type: DataType.INTEGER, allowNull: true } )
  qty_person_catering: number;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  fee_driver_order: number;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  fee_catering_order: number;

  @Column( { type: DataType.INTEGER, allowNull: true } )
  qty_meals: number;

  @BeforeValidate
  static beforeValidateHook( instance: orders, options: any ): void {

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
