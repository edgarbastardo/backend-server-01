import cluster from 'cluster';

import {
         Table,
         Model,
         DataType,
         PrimaryKey,
         Column,
         BeforeValidate,
         BeforeUpdate,
         BeforeCreate,
         BeforeDestroy,
         Unique
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";

//import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';

import CommonConstants from "../../../CommonConstants";

import CommonUtilities from "../../../CommonUtilities";
import SystemUtilities from "../../../SystemUtilities";

import SYSDatabaseLogService from '../services/SYSDatabaseLogService';

const debug = require( 'debug' )( 'SYSPerson' );

@Table( {
  timestamps: false,
  tableName: "sysPerson",
  modelName: "sysPerson"
} )
export class SYSPerson extends Model<SYSPerson> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @Unique
  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  Id: string;

  @Column( { type: DataType.STRING( 20 ), unique: true } )
  ShortId: string;

  @Column( { type: DataType.STRING( 40 ), allowNull: true } )
  ImageId: string;

  @Column( { type: DataType.TEXT, allowNull: true } )
  Title: string;

  @Column( { type: DataType.STRING( 75 ) } )
  FirstName: string;

  @Column( { type: DataType.STRING( 75 ), allowNull: true } )
  LastName: string;

  @Column( { type: DataType.STRING( 75 ), allowNull: true } )
  NickName: string;

  @Column( { type: DataType.STRING( 40 ), allowNull: true } )
  Abbreviation: string;

  @Column( { type: DataType.TINYINT, allowNull: true } )
  Gender: number;

  @Column( { type: DataType.DATEONLY, allowNull: true } )
  BirthDate: Date;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  Phone: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  EMail: string;

  @Column( { type: DataType.STRING( 512 ), allowNull: true } )
  Address: string;

  @Column( { type: DataType.STRING( 1024 ), allowNull: true } )
  Tag: string;

  @Column( { type: DataType.STRING( 512 ), allowNull: true } )
  Comment: string;

  @Column( { type: DataType.STRING( 150 ) } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ) } )
  CreatedAt: string;

  @Column( { type: DataType.STRING( 150 ), allowNull: true } )
  UpdatedBy: string;

  @Column( { type: DataType.STRING( 30 ), allowNull: true } )
  UpdatedAt: string;

  @Column( { type: DataType.JSON, allowNull: true } )
  ExtraData: string;

  @BeforeValidate
  static beforeValidateHook( instance: SYSPerson, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  @BeforeCreate
  static beforeCreateHook( instance: SYSPerson, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysPerson",
                                             "create",
                                             instance,
                                             null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: SYSPerson, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValuess };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysPerson",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: SYSPerson, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "sysPerson",
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

      const strMark = "00C1EE2E2728" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  /*
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

              result[ modelToInclude.model.name ] = SystemUtilities.transformObjectToTimeZone( result[ modelToInclude.model.name ].dataValues ?
                                                                                               result[ modelToInclude.model.name ].dataValues:
                                                                                               result[ modelToInclude.model.name ],
                                                                                               strTimeZoneId,
                                                                                               params.Logger );

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

        if ( !params.KeepPersonExtraData ||
             params.KeepPersonExtraData === 0 ) {

          result.Business = extraData;

          delete result.ExtraData;

        }
        else {

          result.ExtraData = extraData;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.convertFieldValues.name;

      const strMark = "98805E57AE91" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
