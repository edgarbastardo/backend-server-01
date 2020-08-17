import cluster from 'cluster';

import {
         Model,
         Column,
         Table,
         PrimaryKey,
         DataType,
         //BelongsToMany,
         BeforeValidate,
         BeforeUpdate,
         BeforeCreate,
         BeforeDestroy,
         ForeignKey,
         //AfterFind,
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";

import CommonConstants from '../../../CommonConstants';

import CommonUtilities from "../../../CommonUtilities";
import SystemUtilities from "../../../SystemUtilities";

import { SYSUserSessionStatus } from "./SYSUserSessionStatus";

import SYSDatabaseLogService from "../services/SYSDatabaseLogService";

const debug = require( 'debug' )( 'SYSUserSessionDevice' );

@Table( {
  timestamps: false,
  tableName: "sysUserSessionDevice",
  modelName: "sysUserSessionDevice"
} )
export class SYSUserSessionDevice extends Model<SYSUserSessionDevice> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @ForeignKey( () => SYSUserSessionStatus )
  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ), allowNull: false } )
  UserSessionStatusToken: string;

  @Column( { type: DataType.STRING( 175 ), allowNull: true } )
  PushToken: string;

  @Column( { type: DataType.STRING( 512 ), allowNull: false } )
  DeviceInfoRaw: string;

  @Column( { type: DataType.STRING( 250 ), allowNull: false } )
  DeviceInfoParsed: string;

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

  @BeforeValidate
  static beforeValidateHook( instance: SYSUserSessionDevice, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  @BeforeCreate
  static beforeCreateHook( instance: SYSUserSessionDevice, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysUserSessionDevice",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: SYSUserSessionDevice, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValuess };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysUserSessionDevice",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: SYSUserSessionDevice, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysUserSessionDevice",
                                             "delete",
                                             instance,
                                             null );

  }

  public getPrimaryKey(): string[] {

    return [ "UserSessionStatusToken" ];

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

      const strMark = "960D23349703" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( result.DeviceInfoParsed ) {

        result.DeviceInfoParsed = CommonUtilities.parseJSON( result.DeviceInfoParsed,
                                                             params.logger );

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

      const strMark = "E3BC7ECE9074" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
  */

}
