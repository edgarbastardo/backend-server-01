import {
         Table,
         Model,
         DataType,
         PrimaryKey,
         Column,
         BeforeValidate,
         HasOne,
         ForeignKey,
         BelongsTo,
         BeforeCreate,
         BeforeUpdate,
         Is,
         NotNull,
         NotEmpty,
         IsUUID,
         Unique,
         Default,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";
//import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';
import CommonUtilities from "../../CommonUtilities";
//import moment from "moment-timezone";
import { UserGroup } from "./UserGroup";
import { Person } from "./Person";
import SystemUtilities from "../../SystemUtilities";
import SystemConstants from "../../SystemContants";
import bcrypt from 'bcrypt';
import CommonConstants from "../../CommonConstants";

const debug = require( 'debug' )( 'User' );

@Table( {
  timestamps: false,
} )
export class User extends Model<User> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

    /*
    if ( CommonUtilities.isNotNullOrEmpty( values ) ) {

      if ( CommonUtilities.isNullOrEmpty( values.Id ) ) {

        this.Id = SystemUtilities.getUUIDv4();

      }

      if ( values.ShortId === null ||
           values.ShortId === '0' ) {

        this.ShortId = SystemUtilities.hashString( this.id, 2, null ); //Hashes.CRC32( this.Id ).toString( 16 );

      }

    }
    */

  }

  @IsUUID(4)
  @Unique
  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  Id: string;

  @Unique
  @Column( { type: DataType.STRING( 20 ), unique: true } )
  ShortId: string;

  @NotNull
  @NotEmpty
  @IsUUID(4)
  @Column( { type: DataType.STRING( 40 ), allowNull: false } )
  @ForeignKey( () => UserGroup )
  GroupId: string;

  @IsUUID(4)
  @Column( { type: DataType.STRING( 40 ), allowNull: true } )
  @ForeignKey( () => Person )
  PersonId: string;

  @Column( { type: DataType.TINYINT, allowNull: false } )
  ForceChangePassword: number;

  @Column( { type: DataType.SMALLINT, allowNull: false } )
  ChangePasswordEvery: number;

  @Column( { type: DataType.SMALLINT, allowNull: false } )
  SessionsLimit: number;

  @Column( { type: DataType.STRING( 512 ), allowNull: true } )
  Avatar: string;

  /*
  @Is( 'Name', ( value ) => {
    if ( value ) {
      throw new Error( `This a test to see fired.` );
    }
  })
  */
  @NotNull
  @NotEmpty
  @Unique
  @Column( { type: DataType.STRING( 150 ), unique: true, allowNull: false } )
  Name: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  Password: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: false } )
  PasswordSetAt: string;

  @Column( { type: DataType.TEXT, allowNull: true } )
  Role: string;

  @Column( { type: DataType.STRING( 1024 ), allowNull: true } )
  Tag: string;

  @Column( { type: DataType.STRING( 512 ), allowNull: true } )
  Comment: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  CreatedBy: string;

  /*
  @Is( 'CreatedAt', ( value ) => {
    if ( value ) {
      throw new Error( `cannot be empty.` );
    }
  })
  */
  /*
  @Is(function hexColor(value: string): void {
    if ( value ) {
      throw new Error(`"${value}" is not a hex color value.`);
    }
  })
  */
  @NotNull
  @NotEmpty
  @Default( "null" )
  @Column( { type: DataType.STRING( 30 ), allowNull: false })
  CreatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  UpdatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  UpdatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  DisabledBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  DisabledAt: string;

  @Column( { type: DataType.TEXT, allowNull: true } )
  ExtraData: string;

  @BelongsTo( () => UserGroup, "GroupId" )
  UserGroup: UserGroup;

  @BelongsTo( () => Person, "PersonId" )
  UserPerson: Person;

  /*
  @BeforeCreate
  static beforeCreateHook( instance: User, options: any ): any {

    if ( CommonUtilities.isNullOrEmpty( instance.Id ) ) {

      instance.Id = SystemUtilities.getUUIDv4();

    }

    if ( CommonUtilities.isNullOrEmpty( instance.ShortId ) ||
         instance.ShortId === '0' ) {

      instance.ShortId = SystemUtilities.hashString( instance.Id,
                                                     2,
                                                     null ); //Hashes.CRC32( instance.Id ).toString( 16 );

    }

    instance.CreatedAt = instance.PasswordSetAt;

    if ( instance.DisabledBy ) {

      instance.DisabledAt = instance.PasswordSetAt;

    }

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: User, options: any ): any {

    delete ( instance as any ).dataValues.CreatedAt;
    delete ( instance as any ).dataValues.UpdatedAt;

    instance.UpdatedAt = SystemUtilities.getCurrentDateAndTime().format();

    if ( instance.DisabledBy === '1' ) {

      instance.DisabledAt = instance.UpdatedAt;

    }

    let debugMark = debug.extend( 'A6ED3AD1FBA0' );
    debugMark( "beforeCreateHook" );
    //return new Error( "Error_beforeCreateHook" );

  }
  */

  @BeforeValidate
  static beforeValidateHook( instance: User, options: any ): any {

    //let debugMark = debug.extend( 'A4A8FE#63F0C' );
    //debugMark( "context:\n %O", options.context );

    SystemUtilities.commonBeforeValidateHook( instance, options );

    if ( instance.Password &&
         instance.Password.startsWith( "$2b$10$" ) === false ) {

      instance.Password = bcrypt.hashSync( instance.Password, 10 );

    }

    if ( instance.isNewRecord ) {

      if ( !instance.ForceChangePassword ) {

        instance.ForceChangePassword = 0;

      }

      if ( !instance.ChangePasswordEvery ) {

        instance.ChangePasswordEvery = 0;

      }

      if ( !instance.SessionsLimit ) {

        instance.SessionsLimit = 0;

      }

      instance.PasswordSetAt = instance.CreatedAt;

    }

  }

  /*
  @BeforeUpdate
  static beforeUpdateHook( instance: UserGroup, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }
  */

  static async convertFieldValues( params: any ): Promise<any> {

    let result = null;

    try {

      result = params.Data;

      if ( params.TimeZoneId ) {

        const strTimeZoneId = params.TimeZoneId; //params.ExtraInfo.Request.header( "timezoneid" );

        result = SystemUtilities.transformObjectToTimeZone( params.Data,
                                                            strTimeZoneId,
                                                            params.Logger );

        result.PasswordSetAt = SystemUtilities.transformToTimeZone( result.PassswordSetAt,
                                                                    strTimeZoneId,
                                                                    undefined,
                                                                    params.logger );

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

      const strMark = "FED919C942E0";

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
    //return null; //return null for not show the row

  }

}