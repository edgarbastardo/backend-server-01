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
import { Role } from "./Role";
import { Route } from "./Route";
import CommonUtilities from "../../CommonUtilities";
import moment = require("moment-timezone");
import SystemUtilities from "../../SystemUtilities";
//import SystemUtilities from "../../common/SystemUtilities";

@Table( {
  timestamps: false
} )
export class RoleHasRoute extends Model<RoleHasRoute> {

  @ForeignKey( () => Role )
  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  RoleId: string;

  //@BelongsTo(() => Parent, { foreignKey: { allowNull: false }, onDelete: 'CASCADE'})
  @ForeignKey( () => Route )
  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  RouteId: string;

  @Column( { type: DataType.STRING( 150 ) } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ) } )
  CreatedAt: string;

  @BeforeValidate
  static beforeValidateHook( instance: RoleHasRoute, options: any ): void {

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

        let debugMark = debug.extend( 'FE44B7906E09' );
        debugMark( "Before => %O", results );

        if ( Array.isArray( results ) ) {

          results.map( ( row ) => {

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