import {
         Model,
         Column,
         Table,
         PrimaryKey,
         DataType,
         ForeignKey,
         BeforeValidate,
         BeforeUpdate,
         BeforeCreate,
         BeforeDestroy,
         //AfterFind
       } from "sequelize-typescript";
import { BuildOptions } from "sequelize/types";

import { SYSRole } from "./SYSRole";
import { SYSRoute } from "./SYSRoute";

//import moment = require("moment-timezone");

//import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

import SYSRoleHasRouteService from "../services/SYSRoleHasRouteService";

@Table( {
  timestamps: false,
  tableName: "sysRoleHasRoute",
  modelName: "sysRoleHasRoute"
} )
export class SYSRoleHasRoute extends Model<SYSRoleHasRoute> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

  }

  @ForeignKey( () => SYSRole )
  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  RoleId: string;

  //@BelongsTo(() => Parent, { foreignKey: { allowNull: false }, onDelete: 'CASCADE'})
  @ForeignKey( () => SYSRoute )
  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  RouteId: string;

  @Column( { type: DataType.STRING( 150 ) } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ) } )
  CreatedAt: string;

  @BeforeValidate
  static beforeValidateHook( instance: SYSRoleHasRoute, options: any ): void {

    SystemUtilities.commonBeforeValidateHook( instance, options );

  }

  @BeforeCreate
  static beforeCreateHook( instance: SYSRoleHasRouteService, options: any ): void {

    SystemUtilities.commonBeforeCreateHook( instance, options );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: SYSRoleHasRouteService, options: any ): void {

    SystemUtilities.commonBeforeUpdateHook( instance, options );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: SYSRoleHasRouteService, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

  }

  /*
  @AfterFind
  static afterFindHook( results: any, options: any ): void {

    if ( CommonUtilities.isNotNullOrEmpty( results ) &&
         CommonUtilities.isNotNullOrEmpty( options.context ) &&
         CommonUtilities.isNotNullOrEmpty( options.context.TimeZoneId ) ) {  // === "America/New_York"

      if ( CommonUtilities.isValidTimeZone( options.context.TimeZoneId ) ) {

        let debugMark = debug.extend( 'FE44B7906E09' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
        debugMark( "Before => %O", results );

        if ( Array.isArray( results ) ) {

          results.forEach( ( row ) => {

            SystemUtilities.transformModelTimeZoneFromUTC( row.dataValues, options.context.TimeZoneId );

          } );

        }
        else if ( CommonUtilities.isNotNullOrEmpty( results.dataValues ) ) {

          SystemUtilities.transformModelTimeZoneFromUTC( results.dataValues, options.context.TimeZoneId );

        }

      }

    }

  }
  */

}