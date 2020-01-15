import {
         Model,
         Column,
         Table,
         PrimaryKey,
         DataType,
         BelongsToMany,
         BeforeValidate,
         //AfterFind,
       } from "sequelize-typescript";
import { RoleHasRoute } from "./RoleHasRoute";
import { Route } from "./Route";
import { BuildOptions } from "sequelize/types";
//import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';
import CommonUtilities from "../../CommonUtilities";
//import moment from "moment-timezone";
import SystemUtilities from "../../SystemUtilities";
//import SystemUtilities from "../../common/SystemUtilities";

@Table( {
  timestamps: false,
} )
export class Role extends Model<Role> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

    if ( CommonUtilities.isNotNullOrEmpty( values ) ) {

      if ( CommonUtilities.isNullOrEmpty( values.Id ) ) {

        this.Id = SystemUtilities.getUUIDv4();

      }

      if ( CommonUtilities.isNullOrEmpty( values.ShortId ) ||
           values.ShortId === '0' ) {

        this.ShortId = SystemUtilities.hashString( this.id, 2, null ); //Hashes.CRC32( this.Id ).toString( 16 );

      }

    }

  }

  @PrimaryKey
  @Column( { type: DataType.STRING( 40 ) } )
  Id: string;

  @Column( { type: DataType.STRING( 20 ), unique: true } )
  ShortId: string;

  @Column( { type: DataType.STRING( 120 ), unique: true } )
  Name: string;

  @Column( { type: DataType.STRING( 1024 ), allowNull: true } )
  Tag: string;

  @Column( { type: DataType.STRING( 512 ) } )
  Comment: string;

  @Column( { type: DataType.STRING( 150 ) } )
  CreatedBy: string;

  @Column( { type: DataType.STRING( 30 ) } )
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

  @BelongsToMany( () => Route, () => RoleHasRoute )
  routes?: Route[];

  @BeforeValidate
  static beforeValidateHook( instance: Role, options: any ): void {

    if ( CommonUtilities.isNullOrEmpty( instance.Id ) ) {

      instance.Id = SystemUtilities.getUUIDv4();

    }

    if ( CommonUtilities.isNullOrEmpty( instance.ShortId ) ||
         instance.ShortId === '0' ) {

      instance.ShortId = SystemUtilities.hashString( instance.Id, 2, null ); //Hashes.CRC32( instance.Id ).toString( 16 );

    }

    if ( CommonUtilities.isNullOrEmpty( instance.CreatedAt ) ) {

      instance.CreatedAt = SystemUtilities.getCurrentDateAndTime().format(); //new Date().toISOString();

    }
    else {

      instance.UpdatedAt = SystemUtilities.getCurrentDateAndTime().format(); //new Date().toISOString();

    }

  }

  /*
  @AfterFind
  static afterFindHook( results: any, options: any ): void {

    if ( CommonUtilities.isNotNullOrEmpty( results ) &&
         CommonUtilities.isNotNullOrEmpty( options.context ) &&
         CommonUtilities.isNotNullOrEmpty( options.context.TimeZoneId ) ) {  // === "America/New_York"

      if ( CommonUtilities.isValidTimeZone( options.context.TimeZoneId ) ) {

        let debugMark = debug.extend( '615BE55AAB16' );
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