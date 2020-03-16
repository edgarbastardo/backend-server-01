import {
         Model,
         Column,
         Table,
         PrimaryKey,
         DataType,
         ForeignKey,
         BeforeValidate,
         //AfterFind
       } from "sequelize-typescript";

import { SYSRole } from "./SYSRole";
import { SYSRoute } from "./SYSRoute";

//import moment = require("moment-timezone");

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

@Table( {
  timestamps: false,
  tableName: "sysRoleHasRoute",
  modelName: "sysRoleHasRoute"
} )
export class SYSRoleHasRoute extends Model<SYSRoleHasRoute> {

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

    if ( CommonUtilities.isNullOrEmpty( instance.CreatedAt ) ) {

      instance.CreatedAt = SystemUtilities.getCurrentDateAndTime().format(); //new Date().toISOString();

    }

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