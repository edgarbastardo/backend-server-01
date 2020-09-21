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
  tableName: "orders",
  modelName: "orders"
} )
export class orders extends Model<orders> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 36 ), allowNull: false } )
  id: string;

  @Column( { type: DataType.STRING( 36 ), allowNull: false } )
  user_id: string;

  @Column( { type: DataType.STRING( 36 ), allowNull: false } )
  location_id: string;

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

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  status: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  state: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  ticket: string;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  amount1: number;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  amount2: number;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  original_amount: number;

  @Column( { type: DataType.DATE, allowNull: true } )
  want_delivery_date: string;

  @Column( { type: DataType.TIME, allowNull: true } )
  want_delivery_time: string;

  @Column( { type: DataType.TIME, allowNull: true } )
  time_retirement: string;

  @Column( { type: DataType.TIME, allowNull: true } )
  time_arrival_driver: string;

  //You need complete the fields

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
