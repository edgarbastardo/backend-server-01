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

import { SYSUserGroup } from "./SYSUserGroup";
import { SYSPerson } from "./SYSPerson";

import CommonConstants from "../../CommonConstants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

const debug = require( 'debug' )( 'SYSUser' );

@Table( {
  timestamps: false,
  tableName: "sysUser",
  modelName: "sysUser"
} )
export class SYSUser extends Model<SYSUser> {

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
  @ForeignKey( () => SYSUserGroup )
  GroupId: string;

  @IsUUID(4)
  @Column( { type: DataType.STRING( 40 ), allowNull: true } )
  @ForeignKey( () => SYSPerson )
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

  @BelongsTo( () => SYSUserGroup, "GroupId" )
  sysUserGroup: SYSUserGroup;

  //@BelongsTo( () => Person, "PersonId" )
  //UserPerson: Person;

  @BelongsTo( () => SYSPerson, "PersonId" )
  sysPerson: SYSPerson;

  @BeforeValidate
  static beforeValidateHook( instance: SYSUser, options: any ): any {

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

      if ( result.sysPerson ) {

        if ( !result.sysPerson.Id ) {

          result.sysPerson = null;

        }
        else if ( result.sysPerson.ExtraData ) {

          result.sysPerson = result.sysPerson.dataValues ? result.sysPerson.dataValues: result.sysPerson;

          const extraData = CommonUtilities.parseJSON( result.sysPerson.ExtraData,
                                                       params.logger );

          if ( extraData &&
              extraData.Private ) {

            delete extraData.Private;

          }

          if ( !params.KeepPersonExtraData ||
                params.KeepPersonExtraData === 0 ) {

            if ( extraData.Business ) {

              result.sysPerson.Business = extraData.Business;

              delete extraData.Business;

              if ( extraData ) {

                result.sysPerson.Business = { ...result.sysPerson.Business, ...extraData };

              }

            }
            else {

              result.sysPerson.Business = extraData;

            }

            delete result.sysPerson.ExtraData;

          }
          else {

            result.sysPerson.ExtraData = extraData;

          }

        }
        else {

          if ( !params.KeepPersonExtraData ||
               params.KeepPersonExtraData === 0 ) {

            delete result.sysPerson.ExtraData;

            result.sysPerson.Business = {};

          }

        }

      }

      if ( result.sysUserGroup ) {

        if ( !result.sysUserGroup.Id ) {

          result.sysUserGroup = null;

        }
        else if ( result.sysUserGroup.ExtraData ) {

          result.sysUserGroup = result.sysUserGroup.dataValues ? result.sysUserGroup.dataValues: result.sysUserGroup;

          const extraData = CommonUtilities.parseJSON( result.sysUserGroup.ExtraData,
                                                      params.logger );

          if ( extraData &&
              extraData.Private ) {

            delete extraData.Private;

          }

          if ( !params.KeepGroupExtraData ||
              params.KeepGroupExtraData === 0 ) {

            if ( extraData.Business ) {

              result.sysUserGroup.Business = extraData.Business;

              delete extraData.Business;

              if ( extraData ) {

                result.sysUserGroup.Business = { ...result.sysUserGroup.Business, ...extraData };

              }

            }
            else {

              result.sysUserGroup.Business = extraData;

            }

            delete result.sysUserGroup.ExtraData;

          }
          else {

            result.sysUserGroup.ExtraData = extraData;

          }

        }
        else {

          if ( !params.KeepPersonExtraData ||
               params.KeepPersonExtraData === 0 ) {

            delete result.sysUserGroup.ExtraData;

            result.sysUserGroup.Business = {};

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