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
         //Default,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";
import bcrypt from 'bcrypt';

import CommonConstants from "../../CommonConstants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

import { UserGroup } from "./UserGroup";
import { Person } from "./Person";

const debug = require( 'debug' )( 'User' );

@Table( {
  timestamps: false,
} )
export class User extends Model<User> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

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

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  ExpireAt: string;

  @Column( { type: DataType.STRING( 1024 ), allowNull: true } )
  Tag: string;

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

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  DisabledBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  DisabledAt: string;

  @Column( { type: DataType.TEXT, allowNull: true } )
  ExtraData: string;

  @BelongsTo( () => UserGroup, "GroupId" )
  UserGroup: UserGroup;

  //@BelongsTo( () => Person, "PersonId" )
  //UserPerson: Person;

  @BelongsTo( () => Person, "PersonId" )
  Person: Person;

  @BeforeValidate
  static beforeValidateHook( instance: User, options: any ): any {

    //let debugMark = debug.extend( 'A4A8FE#63F0C' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
    //debugMark( "context:\n %O", options.context );

    SystemUtilities.commonBeforeValidateHook( instance, options );

    if ( instance.Password &&
         instance.Password.startsWith( "$2b$10$" ) === false ) {

      instance.Password = bcrypt.hashSync( instance.Password, 10 );

    }

    //if ( instance.isNewRecord ) {
    if ( !options ||
         !options.type ||
         options.type.toUpperCase() === "BULKCREATE" ||
         options.type.toUpperCase() === "CREATE" ) {

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

      if ( result.ExtraData ) {

        const extraData = CommonUtilities.parseJSON( result.ExtraData,
                                                     params.logger );

        if ( extraData &&
             extraData.Private ) {

          delete extraData.Private;

        }

        result.ExtraData = extraData;

      }

      if ( result.Person &&
           result.Person.ExtraData ) {

        const extraData = CommonUtilities.parseJSON( result.Person.ExtraData,
                                                     params.logger );

        if ( extraData &&
             extraData.Private ) {

          delete extraData.Private;

        }

        result.Person.ExtraData = extraData;

      }

      if ( result.UserGroup &&
           result.UserGroup.ExtraData ) {

        const extraData = CommonUtilities.parseJSON( result.UserGroup.ExtraData,
                                                     params.logger );

        if ( extraData &&
             extraData.Private ) {

          delete extraData.Private;

        }

        result.UserGroup.ExtraData = extraData;

      }

      if ( params.FilterFields === 1 ) {

        delete result.Password; //Not return the password

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.convertFieldValues.name;

      const strMark = "FED919C942E0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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