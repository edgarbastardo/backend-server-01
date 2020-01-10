import {
         Model,
         Column,
         Table,
         //CreatedAt,
         //UpdatedAt,
         PrimaryKey,
         DataType,
         BelongsToMany,
         //BeforeCreate,
         //AfterFind,
         //IsUUID,
         //BeforeSave,
         BeforeValidate,
       } from "sequelize-typescript";
//import { Sequelize as OriginSequelize, Utils } from "sequelize";
import { RoleHasRoute } from "./RoleHasRoute";
import { Role } from "./Role";
//import uuidv4 from 'uuid/v4';
//import Hashes from 'jshashes';
import CommonUtilities from "../../CommonUtilities";
import { BuildOptions } from "sequelize/types";
//import moment from 'moment-timezone';
import SystemUtilities from "../../SystemUtilities";
import moment = require("moment-timezone");

@Table( {
  timestamps: false
} )
export class Route extends Model<Route> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

    if ( CommonUtilities.isNotNullOrEmpty( values ) &&
         CommonUtilities.isNullOrEmpty( values.Id ) &&
         CommonUtilities.isNotNullOrEmpty( values.RequestKind ) &&
         CommonUtilities.isNotNullOrEmpty( values.Path ) ) {

      this.Id = SystemUtilities.hashString( values.RequestKind + ":" + values.Path, 1, null ); //xxxhash algoritm

    }

  }

  //@IsUUID(4)
  //@Length( { max: 40 } )
  @PrimaryKey
  @Column( { type: DataType.STRING( 20 ) } )
  Id: string;

  @Column( { type: DataType.TINYINT().UNSIGNED } )
  AccessKind: number;

  @Column( { type: DataType.TINYINT().UNSIGNED } )
  RequestKind: number;

  @Column( { type: DataType.STRING( 2048 ) } )
  Path: string;

  @Column( { type: DataType.STRING( 1024 ), allowNull: true  } )
  AllowTagAccess: string;

  @Column( { type: DataType.STRING( 1024 ), allowNull: true } )
  Tag: string;

  @Column( { type: DataType.STRING( 512 ) } )
  Description: string;

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

  @BelongsToMany( () => Role, () => RoleHasRoute )
  Roles: Role[];

  @BeforeValidate
  static beforeValidateHook( instance: Route, options: any ): void {

    if ( CommonUtilities.isNullOrEmpty( instance.Id ) &&
         CommonUtilities.isNotNullOrEmpty( instance.RequestKind ) &&
         CommonUtilities.isNotNullOrEmpty( instance.Path ) ) {

      instance.Id = SystemUtilities.hashString( instance.RequestKind + ":" + instance.Path, 1, null );

    }

    if ( CommonUtilities.isNullOrEmpty( instance.CreatedAt ) ) {

      instance.CreatedAt = SystemUtilities.getCurrentDateAndTime().format(); //new Date().toISOString();

    }
    else {

      instance.UpdatedAt = SystemUtilities.getCurrentDateAndTime().format(); //new Date().toISOString();

    }

  }

  /*
  @BeforeSave
  static beforeSaveHook( instance: Route, options: any ): void {

    instance.PathHash = SystemUtilities.hashString( instance.RequestKind + ":" + instance.Path, 2, null ); //Hashes.CRC32( instance.RequestKind + ":" + instance.Path ).toString( 16 );

    if ( instance.CreatedAt == null ) {

      instance.CreatedAt = new Date().toISOString();

    }
    else {

      instance.UpdatedAt = new Date().toISOString();

    }

    //let debugMark = debug.extend( 'B54E0A8CEE1F' );
    //debugMark( "BeforeSave => %O", instance );

  }
  */

  /*
  @BeforeUpdate
  static beforeUpdate( target: any, propertyName: string ): void {

    //let debugMark = debug.extend( '1D1840C32CA9' );
    //debugMark( "BeforeSave => %O", target );

  }
  */

  /*
  @AfterFind
  static afterFindHook( results: any, options: any ): void {

    //let debugMark = debug.extend( '86EEE23D9F5E' );
    //debugMark( "afterFindHook => %O", options );
    //debugMark( CommonUtilities.isNotNullOrEmpty( options.context ) );
    //debugMark( CommonUtilities.isNotNullOrEmpty( options.context.TimeZoneId ) );

    if ( CommonUtilities.isNotNullOrEmpty( results ) &&
         CommonUtilities.isNotNullOrEmpty( options.context ) &&
         CommonUtilities.isNotNullOrEmpty( options.context.TimeZoneId ) ) {  // === "America/New_York"

      if ( CommonUtilities.isValidTimeZone( options.context.TimeZoneId ) ) {

        //let debugMark = debug.extend( '2DDF16CE7935' );
        //debugMark( "Before => %O", results );

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