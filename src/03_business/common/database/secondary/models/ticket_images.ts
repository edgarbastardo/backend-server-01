import {
         Model,
         Column,
         Table,
         PrimaryKey,
         DataType,
         BeforeValidate,
         Unique,
         NotNull,
         NotEmpty
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
  tableName: "ticket_images",
  modelName: "ticket_images"
} )
export class ticket_images extends Model<ticket_images> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @PrimaryKey
  @Unique
  @Column( { type: DataType.STRING( 36 ), allowNull: false } )
  id: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 36 ), allowNull: false } )
  order_id: string;

  @Column( { type: DataType.TEXT, allowNull: true } )
  image: string;

  //@Column( { type: DataType.STRING } )
  //created_at: string; //This field has default CURRENT_TIMESTAMP, you not need send data

  @Column( { type: DataType.SMALLINT, allowNull: true } )
  migrated: string;

  @Column( { type: DataType.STRING( 512 ), allowNull: true } )
  url: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  lock: string;

  @BeforeValidate
  static beforeValidateHook( instance: ticket_images, options: any ): void {

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
