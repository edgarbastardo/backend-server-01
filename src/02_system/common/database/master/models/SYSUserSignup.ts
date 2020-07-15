import cluster from 'cluster';

import {
         Table,
         Model,
         DataType,
         PrimaryKey,
         Column,
         BeforeValidate,
         //HasOne,
         //ForeignKey,
         //BelongsTo,
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

//import bcrypt from 'bcrypt';

import CommonConstants from "../../../CommonConstants";

import CommonUtilities from "../../../CommonUtilities";
import SystemUtilities from "../../../SystemUtilities";

import CipherManager from "../../../managers/CipherManager";

import SYSDatabaseLogService from '../services/SYSDatabaseLogService';

const debug = require( 'debug' )( 'SYSUserSignup' );

@Table( {
  timestamps: false,
  tableName: "sysUserSignup",
  modelName: "sysUserSignup"
} )
export class SYSUserSignup extends Model<SYSUserSignup> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @IsUUID(4)
  @Unique
  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  Id: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 75 ), allowNull: false } )
  Kind: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 75 ), allowNull: false } )
  FrontendId: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 40 ), allowNull: false } )
  Token: string;

  @Column( { type: DataType.SMALLINT, allowNull: false } )
  Status: number;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  Name: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 75 ), allowNull: false } )
  FirstName: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 75 ), allowNull: false } )
  LastName: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  EMail: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  Phone: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  Password: string;

  @Column( { type: DataType.STRING( 512 ), allowNull: true } )
  Comment: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  CreatedBy: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 30 ), allowNull: false })
  CreatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  UpdatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  UpdatedAt: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 30 ), allowNull: false } )
  ExpireAt: string;

  @Column( { type: DataType.JSON, allowNull: true } )
  ExtraData: string;

  @BeforeValidate
  static async beforeValidateHook( instance: SYSUserSignup, options: any ): Promise<any> {

    SystemUtilities.commonBeforeValidateHook( instance, options );

    if ( instance.Password &&
         instance.Password.startsWith( CommonConstants._PREFIX_CRYPTED ) === false ) {

      instance.Password = await CipherManager.encrypt( instance.Password, null );

    }

  }

  @BeforeCreate
  static beforeCreateHook( instance: SYSUserSignup, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysUserSignup",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: SYSUserSignup, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValues };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysUserSignup",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: SYSUserSignup, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysUserSignup",
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

          for ( const modelToInclude of params.Include ) {

            if ( modelToInclude.model &&
                 result[ modelToInclude.model.name ] ) {

              result[ modelToInclude.model.name ] = SystemUtilities.transformObjectToTimeZone( result[ modelToInclude.model.name ].dataValues,
                                                                                               strTimeZoneId,
                                                                                               params.Logger );

            }

          }

        }

        if ( Array.isArray( params.Exclude ) ) {

          for ( const modelToExclude of params.Exclude ) {

            if ( modelToExclude.model &&
                 result[ modelToExclude.model.name ] ) {

              delete result[ modelToExclude.model.name ];

            }

          }

        }

      }

      if ( params.FilterFields === 1 ) {

        delete result.Password; //Not return the password

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.convertFieldValues.name;

      const strMark = "458C892909DB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
