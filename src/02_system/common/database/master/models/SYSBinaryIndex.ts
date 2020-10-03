import cluster from 'cluster';

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
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";

//import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';
//import moment from "moment-timezone";
import CommonConstants from "../../../CommonConstants";

import CommonUtilities from "../../../CommonUtilities";
import SystemUtilities from "../../../SystemUtilities";
import SYSDatabaseLogService from '../services/SYSDatabaseLogService';

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

  @Column( { type: DataType.STRING( 60 ) } )
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

  @Column( { type: DataType.STRING( 60 ), allowNull: false } )
  CreatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  UpdatedBy: string;

  @Column( { type: DataType.STRING( 60 ), allowNull: true } )
  UpdatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  DisabledBy: string;

  @Column( { type: DataType.STRING( 60 ), allowNull: true } )
  DisabledAt: string;

  @Column( { type: DataType.TINYINT, allowNull: false } )
  ProcessNeeded: number;

  @Column( { type: DataType.STRING( 60 ), allowNull: true } )
  ProcessStartedAt: string;

  @Column( { type: DataType.JSON, allowNull: true } )
  ExtraData: string;

  @BeforeValidate
  static beforeValidateHook( instance: SYSBinaryIndex, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );
  }

  @BeforeCreate
  static beforeCreateHook( instance: SYSBinaryIndex, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysBinaryIndex",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: SYSBinaryIndex, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValues };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysBinaryIndex",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: SYSBinaryIndex, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysBinaryIndex",
                                             "delete",
                                             instance,
                                             null );

  }

  static async convertFieldValues( params: any ): Promise<any> {

    return await SystemUtilities.commonConvertFieldValues( params );

    /*
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

              if ( params.FilterFields === 1 ) {

                delete result[ modelIncluded.model.name ].Password; //Delete fields password

              }
              else if ( params.FilterFields?.length > 0 ) {

                delete result[ modelIncluded.model.name ].Password; //Delete fields password

                result[ modelIncluded.model.name ] = CommonUtilities.deleteObjectFields( result[ modelIncluded.model.name ],
                                                                                         params.FilterFields,
                                                                                         params.logger );

              }

              if ( params.IncludeFields?.length > 0 ) {

                result[ modelIncluded.model.name ] = CommonUtilities.includeObjectFields( result[ modelIncluded.model.name ],
                                                                                          params.IncludeFields,
                                                                                          params.logger );

              }

              if ( result[ modelIncluded.model.name ].ExtraData ) {

                let extraData = result[ modelIncluded.model.name ].ExtraData;

                if ( typeof extraData === "string" ) {

                  extraData = CommonUtilities.parseJSON( extraData,
                                                         params.logger );

                }

                if ( extraData &&
                     extraData.Private ) {

                  delete extraData.Private;

                }

                if ( !params.KeepExtraData ||
                     params.KeepExtraData === 0 ) {

                  if ( extraData.Business ) {

                    result[ modelIncluded.model.name ].Business = extraData.Business;

                    delete extraData.Business;

                    if ( extraData ) {

                      result[ modelIncluded.model.name ].Business = { ...result[ modelIncluded.model.name ].Business, ...extraData };

                    }

                  }
                  else {

                    result[ modelIncluded.model.name ].Business = extraData;

                  }

                  delete result[ modelIncluded.model.name ].ExtraData;

                }
                else {

                  result[ modelIncluded.model.name ].ExtraData = extraData;

                }

              }

            }

          }

        }

        if ( Array.isArray( params.Exclude ) ) {

          for ( const modelToExcluded of params.Exclude ) {

            if ( modelToExcluded.model &&
                 result[ modelToExcluded.model.name ] ) {

              delete result[ modelToExcluded.model.name ];

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

        if ( !params.KeepExtraData ||
             params.KeepExtraData === 0 ) {

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

      const strMark = "7E8EF3428998" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
    */

  }

  /*
  static async convertFieldValues( params: any ): Promise<any> {

    let result = null;

    try {

      result = params.Data;

      if ( params.TimeZoneId ) {

        const strTimeZoneId = params.TimeZoneId; //params.ExtraInfo.Request.header( "timezoneid" );

        result = SystemUtilities.transformObjectToTimeZone( params.Data,
                                                            strTimeZoneId,
                                                            params.Logger );

        result.ExpireAt = SystemUtilities.transformToTimeZone( result.ExpireAt,
                                                               strTimeZoneId,
                                                               undefined,
                                                               params.logger );

        if ( Array.isArray( params.Include ) ) {

          for ( const modelToInclude of params.Include ) {

            if ( modelToInclude.model &&
                 result[ modelToInclude.model.name ] ) {

              result[ modelToInclude.model.name ] = SystemUtilities.transformObjectToTimeZone( result[ modelToInclude.model.name ].dataValues ?
                                                                                               result[ modelToInclude.model.name ].dataValues:
                                                                                               result[ modelToInclude.model.name ],
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
  */

  public getPrimaryKey(): string[] {

    return [ "Id" ];

  }

}
