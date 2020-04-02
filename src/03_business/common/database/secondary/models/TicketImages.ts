import {
         Model,
         Column,
         Table,
         PrimaryKey,
         DataType,
         BeforeValidate,
         BeforeUpdate,
         BeforeCreate,
         BeforeDestroy,
         //AfterFind,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";

//import SystemUtilities from "../../../../../02_system/common/SystemUtilities";

//import SYSDatabaseLogService from "../../../../../02_system/common/database/master/services/SYSDatabaseLogService";

@Table( {
  timestamps: false,
  tableName: "ticket_images",
  modelName: "ticket_images"
} )
export class TicketImages extends Model<TicketImages> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 36 ), allowNull: false } )
  id: string;

  @Column( { type: DataType.STRING( 36 ), allowNull: false } )
  order_id: string;

  @Column( { type: DataType.TEXT( { length: 'medium' } ), allowNull: true } )
  image: string;

  @Column( { type: "TIMESTAMP", allowNull: true } )
  created_at: string;

  @Column( { type: DataType.TINYINT, allowNull: true } )
  migrated: number;

  @Column( { type: DataType.STRING( 512 ), allowNull: true } )
  url: string;

  @BeforeValidate
  static beforeValidateHook( instance: TicketImages, options: any ): void {

    //SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  @BeforeCreate
  static beforeCreateHook( instance: TicketImages, options: any ): void {

    /*
    SystemUtilities.commonBeforeCreateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "secondary",
                                             "ticket_images",
                                             "create",
                                             instance,
                                             null );
    */

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: TicketImages, options: any ): void {

    /*
    const oldDataValues = { ...( instance as any )._previousDataValuess };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "secondary",
                                             "ticket_images",
                                             "update",
                                             instance,
                                             oldDataValues );
    */

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: TicketImages, options: any ): void {

    /*
    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "secondary",
                                             "ticket_images",
                                             "delete",
                                             instance,
                                             null );
    */

  }

  public getPrimaryKey(): string[] {

    return [ "id" ];

  }

}