import cluster from 'cluster';

import {
         Model,
         Column,
         Table,
         PrimaryKey,
         DataType,
         BeforeValidate,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";

//import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';
//import moment from "moment-timezone";
import CommonConstants from "../../CommonConstants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

const debug = require( 'debug' )( 'SYSBinaryIndex' );

@Table( {
  timestamps: false,
  tableName: "sysBinaryIndex",
  modelName: "sysBinaryIndex"
} )
export class SYSBinaryIndex extends Model<SYSBinaryIndex> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  Id: string;

  @Column( { type: DataType.STRING( 20 ), unique: true } )
  ShortId: string;

  @Column( { type: DataType.TINYINT, allowNull: false } )
  AccessKind: number;

  @Column( { type: DataType.TINYINT, allowNull: false } )
  StorageKind: number;

  @Column( { type: DataType.STRING( 30 ) } )
  ExpireAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  Hash: string;

  @Column( { type: DataType.STRING( 50 ), allowNull: false } )
  MimeType: string;

  @Column( { type: DataType.STRING( 75 ), allowNull: false } )
  Label: string;

  @Column( { type: DataType.STRING( 75 ), allowNull: false } )
  Category: string;

  @Column( { type: DataType.STRING( 2048 ), allowNull: false } )
  FilePath: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  FileName: string;

  @Column( { type: DataType.STRING( 20 ), allowNull: false } )
  FileExtension: string;

  @Column( { type: DataType.BIGINT, allowNull: false } )
  FileSize: number;

  @Column( { type: DataType.STRING( 1024 ), allowNull: true } )
  Tag: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: false } )
  System: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  Context: string;

  @Column( { type: DataType.STRING( 512 ), allowNull: true } )
  Comment: string;

  //@Column( { type: DataType.STRING( 2048 ), allowNull: true } )
  //DenyTagAccess: string;

  //@Column( { type: DataType.STRING( 2048 ), allowNull: true } )
  //AllowTagAccess: string;

  @Column( { type: DataType.STRING( 40 ), allowNull: true } )
  ShareCode: string;

  @Column( { type: DataType.STRING( 2048 ), allowNull: false } )
  Owner: string;

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

  @Column( { type: DataType.TINYINT, allowNull: false } )
  ProcessNeeded: number;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  ProcessStartedAt: string;

  @Column( { type: DataType.TEXT, allowNull: true } )
  ExtraData: string;

  @BeforeValidate
  static beforeValidateHook( instance: SYSBinaryIndex, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

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

        //

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

  }

}