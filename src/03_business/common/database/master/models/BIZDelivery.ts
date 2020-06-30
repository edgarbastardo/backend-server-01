import cluster from 'cluster';

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
         NotNull,
         NotEmpty,
         IsUUID,
         Unique,
         BeforeUpdate,
         BeforeCreate,
         BeforeDestroy,
         //Default,
       } from "sequelize-typescript";

import { BuildOptions } from "sequelize/types";

import CommonUtilities from "../../../../../02_system/common/CommonUtilities";
import CommonConstants from '../../../../../02_system/common/CommonConstants';

import SystemUtilities from "../../../../../02_system/common/SystemUtilities";

import SYSDatabaseLogService from "../../../../../02_system/common/database/master/services/SYSDatabaseLogService";
import { SYSUser } from '../../../../../02_system/common/database/master/models/SYSUser';
import { BIZEstablishment } from "./BIZEstablishment";
import { BIZOrigin } from './BIZOrigin';
import { BIZDestination } from "./BIZDestination";

const debug = require( 'debug' )( 'BIZDelivery' );

@Table( {
  timestamps: false,
  tableName: "bizDelivery",
  modelName: "bizDelivery"
} )
export class BIZDelivery extends Model<BIZDelivery> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  Id: string;

  @NotNull
  @NotEmpty
  @IsUUID(4)
  @Column( { type: DataType.STRING( 40 ), allowNull: false } )
  @ForeignKey( () => BIZOrigin )
  OriginId: string;

  @NotNull
  @NotEmpty
  @IsUUID(4)
  @Column( { type: DataType.STRING( 40 ), allowNull: false } )
  @ForeignKey( () => BIZDestination )
  DestinationId: string;

  @NotNull
  @NotEmpty
  @IsUUID(4)
  @Column( { type: DataType.STRING( 40 ), allowNull: true } )
  @ForeignKey( () => SYSUser )
  DriverId: string;

  @Column( { type: DataType.STRING( 512 ), allowNull: true } )
  Comment: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: false } )
  CreatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  UpdatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  UpdatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  DisabledBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  DisabledAt: string;

  @Column( { type: DataType.JSON, allowNull: true } )
  ExtraData: string;

  @BelongsTo( () => BIZOrigin, "OriginId" )
  bizOrigin: BIZOrigin;

  @BelongsTo( () => BIZDestination, "DestinationId" )
  bizDestination: BIZDestination;

  @BelongsTo( () => SYSUser, "DriverId" )
  sysUser: SYSUser;

  @BeforeValidate
  static beforeValidateHook( instance: BIZDelivery, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  @BeforeCreate
  static beforeCreateHook( instance: BIZDelivery, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "bizDelivery",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: BIZDelivery, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValues };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "bizDelivery",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: BIZDelivery, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "bizDelivery",
                                             "delete",
                                             instance,
                                             null );

  }

  static async convertFieldValues( params: any ): Promise<any> {

    let result = null;

    try {

      result = params.Data;

      if ( params.TimeZoneId ) {

        const strTimeZoneId = params.TimeZoneId;

        result = SystemUtilities.transformObjectToTimeZone( params.Data,
                                                            strTimeZoneId,
                                                            params.Logger );

        if ( Array.isArray( params.Include ) ) {

          for ( const modelIncluded of params.Include ) {

            if ( modelIncluded.model &&
                 result[ modelIncluded.model.name ] ) {

              result[ modelIncluded.model.name ] = SystemUtilities.transformObjectToTimeZone( result[ modelIncluded.model.name ].dataValues ?
                                                                                              result[ modelIncluded.model.name ].dataValues:
                                                                                              result[ modelIncluded.model.name ],
                                                                                              strTimeZoneId,
                                                                                              params.Logger );

            }

          }

        }

      }

      if ( result.ExtraData ) {

        let extraData = result.ExtraData;

        if ( typeof extraData === "string" ) {

          extraData = CommonUtilities.parseJSON( extraData,
                                                 params.logger );

        }

        if ( extraData &&
             extraData.Private ) {

          delete extraData.Private;

        }

        if ( !params.KeepGroupExtraData ||
             params.KeepGroupExtraData === 0 ) {

          if ( extraData.Business ) {

            result.Business = extraData.Business;

            delete extraData.Business;

            if ( extraData ) {

              result.Business = { ...result.Business, ...extraData };

            }

          }
          else {

            result.Business = extraData;

          }

          delete result.ExtraData;

        }
        else {

          result.ExtraData = extraData;

        }

      }
      else {

        delete result.ExtraData;

        result.Business = {};

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.convertFieldValues.name;

      const strMark = "1499BDA8790A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( params.logger &&
           typeof params.logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        params.logger.error( error );

      }

    }

    return result;

  }

  public getPrimaryKey(): string[] {

    return [ "Id" ];

  }

}
