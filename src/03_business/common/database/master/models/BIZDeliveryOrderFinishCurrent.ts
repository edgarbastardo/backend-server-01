//import cluster from "cluster";

import {
         Table,
         Model,
         DataType,
         PrimaryKey,
         Column,
         BeforeValidate,
         //HasOne,
         ForeignKey,
         BelongsTo,
         //BeforeCreate,
         //BeforeUpdate,
         //Is,
         //NotNull,
         //NotEmpty,
         //IsUUID,
         //Unique,
         BeforeUpdate,
         BeforeCreate,
         BeforeDestroy,
         //Default,
       } from "sequelize-typescript";

import { BuildOptions } from "sequelize/types";

//import CommonUtilities from "../../../../../02_system/common/CommonUtilities";
//import CommonConstants from "../../../../../02_system/common/CommonConstants";

import SystemUtilities from "../../../../../02_system/common/SystemUtilities";

import SYSDatabaseLogService from "../../../../../02_system/common/database/master/services/SYSDatabaseLogService";

import { BIZDeliveryOrder } from "./BIZDeliveryOrder";
import { BIZDeliveryOrderFinish } from "./BIZDeliveryOrderFinish";

const debug = require( "debug" )( "BIZDeliveryOrderFinishCurrent" );

@Table( {
  timestamps: false,
  tableName: "bizDeliveryOrderFinishCurrent",
  modelName: "bizDeliveryOrderFinishCurrent"
} )
export class BIZDeliveryOrderFinishCurrent extends Model<BIZDeliveryOrderFinishCurrent> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  @ForeignKey( () => BIZDeliveryOrder )
  DeliveryOrderId: string;

  @Column( { type: DataType.STRING( 40 ) } )
  @ForeignKey( () => BIZDeliveryOrderFinish )
  DeliveryOrderFinishId: string;

  @Column( { type: DataType.STRING( 1024 ), allowNull: true } )
  Tag: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: false } )
  CreatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  UpdatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  UpdatedAt: string;

  @Column( { type: DataType.JSON, allowNull: true } )
  ExtraData: string;

  @BelongsTo( () => BIZDeliveryOrder, "DeliveryOrderId" )
  bizDeliveryOrder: BIZDeliveryOrder;

  @BelongsTo( () => BIZDeliveryOrderFinish, "DeliveryOrderFinishId" )
  bizDeliveryOrderFinish: BIZDeliveryOrderFinish;

  @BeforeValidate
  static beforeValidateHook( instance: BIZDeliveryOrderFinish, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  @BeforeCreate
  static beforeCreateHook( instance: BIZDeliveryOrderFinish, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "bizDeliveryOrderFinishCurrent",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: BIZDeliveryOrderFinish, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValues };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "bizDeliveryOrderFinishCurrent",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: BIZDeliveryOrderFinish, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "bizDeliveryOrderFinishCurrent",
                                             "delete",
                                             instance,
                                             null );

  }

  static async convertFieldValues( params: any ): Promise<any> {

    return await SystemUtilities.commonConvertFieldValues( params );

  }

  public getPrimaryKey(): string[] {

    return [
             "DeliveryOrderId"
           ];

  }

}
