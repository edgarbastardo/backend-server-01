import { integer } from "random-js";
import {
         Model,
         Column,
         Table,
         PrimaryKey,
         DataType,
         BeforeValidate,
         Unique,
         NotEmpty,
         NotNull
         //BeforeUpdate,
         //BeforeCreate,
         //BeforeDestroy,
         //AfterFind,
       } from "sequelize-typescript";
import { BuildOptions, INTEGER, IntegerDataType } from "sequelize/types";

import SystemUtilities from "../../../../../02_system/common/SystemUtilities";

//import SYSDatabaseLogService from "../../../../../02_system/common/database/master/services/SYSDatabaseLogService";

@Table( {
  timestamps: false,
  tableName: "establishments",
  modelName: "establishments"
} )
export class establishments extends Model<establishments> {

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

  @Column( { type: DataType.INTEGER, allowNull: true } )
  ranking: number;

  @Column( { type: DataType.INTEGER, allowNull: true } )
  priority: number;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  fee: number;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  address: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  zone: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  email: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  email1: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  payableto: string;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  fee_rep: number;

  @Column( { type: DataType.INTEGER, allowNull: true } )
  fee_odin: number;

  @Column( { type: DataType.INTEGER, allowNull: true } )
  service: number;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  base_miles: number;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  fee_driver: number;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  fee_prepaid: number;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  fee_charged: number;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  extra_miles_driver: number;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  extra_miles_establishment: number;

  @Column( { type: DataType.DECIMAL( 10, 3 ), allowNull: true } )
  tax: number;

  @Column( { type: DataType.DECIMAL( 10, 3 ), allowNull: true } )
  percentage: number;

  @Column( { type: DataType.DECIMAL( 10, 3 ), allowNull: true } )
  charge_card: number;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  created_at: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  updated_at: string;

  @Column( { type: DataType.DECIMAL( 10, 3 ), allowNull: true } )
  percentage_eat24: number;

  @Column( { type: DataType.INTEGER, allowNull: true } )
  DriversFijos: number;

  @Column( { type: DataType.TINYINT, allowNull: true } )
  miles_limited: number;

  @Column( { type: DataType.DECIMAL( 10, 2 ), allowNull: true } )
  base_miles_driver: number;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  payment_method: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  routing_number: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  bank_account_number: string;

  @BeforeValidate
  static beforeValidateHook( instance: establishments, options: any ): void {

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
*/
  static async convertFieldValues( params: any ): Promise<any> {

    return await SystemUtilities.commonConvertFieldValues( params );

  }


/*  @BeforeDestroy
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
