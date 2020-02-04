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
         Default,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";
import bcrypt from 'bcrypt';

import CommonConstants from "../../CommonConstants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";
import CipherManager from "../../managers/CipherManager";

const debug = require( 'debug' )( 'UserSignup' );

@Table( {
  timestamps: false,
} )
export class UserSignup extends Model<UserSignup> {

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

  @Column( { type: DataType.TEXT, allowNull: true } )
  ExtraData: string;

  @BeforeValidate
  static async beforeValidateHook( instance: UserSignup, options: any ): Promise<any> {

    //let debugMark = debug.extend( 'A4A8FE#63F0C' );
    //debugMark( "context:\n %O", options.context );

    SystemUtilities.commonBeforeValidateHook( instance, options );

    if ( instance.Password &&
         instance.Password.startsWith( CommonConstants._PREFIX_CRYPTED ) === false ) {

      instance.Password = await CipherManager.encrypt( instance.Password, null );

    }

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

              result[ modelIncluded.model.name ] = SystemUtilities.transformObjectToTimeZone( result[ modelIncluded.model.name ].dataValues,
                                                                                              strTimeZoneId,
                                                                                              params.Logger );

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

      const strMark = "458C892909DB";

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

}