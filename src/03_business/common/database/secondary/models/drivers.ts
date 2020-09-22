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
  tableName: "drivers",
  modelName: "drivers"
} )
export class drivers extends Model<drivers> {

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

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  zone: string;

  @Column( { type: DataType.INTEGER, allowNull: true } )
  status: number;

  @Column( { type: DataType.INTEGER, allowNull: true } )
  active: number;

  @Column( { type: DataType.INTEGER, allowNull: false } )
  point_accumulated: number;

  @Column( { type: DataType.INTEGER, allowNull: false } )
  deliveries_completed: number;

  @Column( { type: DataType.INTEGER, allowNull: false } )
  qualification: number;

  @Column( { type: DataType.DATEONLY, allowNull: true } )
  birthday: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  social_id: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  address: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  car_model: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  license_number: string;

  @Column( { type: DataType.DATEONLY, allowNull: false } )
  insurance_expire_day: string;

  @Column( { type: DataType.DATEONLY, allowNull: false } )
  registration_expire_day: string;

  @Column( { type: DataType.TEXT, allowNull: true } )
  selfie: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  hear_about_us: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  payment_method: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  bank_name: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  routing_number: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  bank_account_number: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  tax_information: string;

  @Column( { type: DataType.TINYINT, allowNull: false } )
  show_name : number;

  @Column( { type: DataType.NOW, allowNull: false } )
  created_at: string;

  @Column( { type: DataType.NOW, allowNull: false } )
  updated_at: string;

  @BeforeValidate
  static beforeValidateHook( instance: drivers, options: any ): void {

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
