import { integer } from "random-js";
import {
         Model,
         Column,
         Table,
         PrimaryKey,
         DataType,
         BeforeValidate,
         Unique,
         NotEmpty,
         NotNull
         //BeforeUpdate,
         //BeforeCreate,
         //BeforeDestroy,
         //AfterFind,
       } from "sequelize-typescript";
import { BuildOptions, INTEGER, IntegerDataType } from "sequelize/types";

import SystemUtilities from "../../../../../02_system/common/SystemUtilities";

//import SYSDatabaseLogService from "../../../../../02_system/common/database/master/services/SYSDatabaseLogService";

@Table( {
  timestamps: false,
  tableName: "users",
  modelName: "users"
} )
export class users extends Model<users> {

  constructor( values?: any, options?: BuildOptions ) {

    super( values, options );

    /*
    if ( CommonUtilities.isNotNullOrEmpty( values ) ) {

      if ( CommonUtilities.isNullOrEmpty( values.Id ) ) {

        this.Id = SystemUtilities.getUUIDv4();

      }

      if ( CommonUtilities.isNullOrEmpty( values.ShortId ) ||
           values.ShortId === '0' ) {

        this.ShortId = SystemUtilities.hashString( this.Id, 2, null ); //Hashes.CRC32( this.Id ).toString( 16 );

      }

    }
    */

  }

  @PrimaryKey
  @Unique
  @Column( { type: DataType.STRING( 36 ), allowNull: false } )
  id: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  first_name: string;

  @NotNull
  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  last_name: string;

  @NotNull
  @Column( { type: DataType.STRING( 45 ), allowNull: false } )
  short_name: string;

  @NotNull
  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  phone: string;

  @NotNull
  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  email: string;

  @NotNull
  @Column( { type: DataType.STRING( 60 ), allowNull: false } )
  password: string;

  @NotNull
  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  role: string;

  @NotNull
  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  restriction: string;

  @Column( { type: DataType.STRING( 1500 ), allowNull: true } )
  session_id: string;

  @Column( { type: DataType.STRING( 100 ), allowNull: true } )
  remember_token: string;

  @Column( { type: DataType.STRING( 1000 ), allowNull: true } )
  auth_secret_token: string;

  @Column( { type: DataType.STRING( 60 ), allowNull: true } )
  auth_public_token: string;

  @Column( { type: DataType.STRING( 255 ), allowNull: true } )
  deleted_at: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  created_at: string;

  @NotNull
  @NotEmpty
  @Column( { type: DataType.STRING( 255 ), allowNull: false } )
  updated_at: string;



@BeforeValidate
static beforeValidateHook( instance: users, options: any ): void {

  SystemUtilities.commonBeforeValidateHook( instance, options );

}

static async convertFieldValues( params: any ): Promise<any> {

  return await SystemUtilities.commonConvertFieldValues( params );

}

/*
@BeforeCreate
static beforeCreateHook( instance: TicketImages, options: any ): void {

  SystemUtilities.commonBeforeCreateHook( instance, options );

  SYSDatabaseLogService.logTableOperation( "master",
                                            "bizExample",
                                            "create",
                                            instance,
                                            null );

  }

  @BeforeUpdate
  static beforeUpdateHook( instance: TicketImages, options: any ): void {

    const oldDataValues = { ...( instance as any )._previousDataValuess };

    SystemUtilities.commonBeforeUpdateHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "bizExample",
                                             "update",
                                             instance,
                                             oldDataValues );

  }

  @BeforeDestroy
  static beforeDestroyHook( instance: TicketImages, options: any ): void {

    SystemUtilities.commonBeforeDestroyHook( instance, options );

    SYSDatabaseLogService.logTableOperation( "master",
                                             "bizExample",
                                             "delete",
                                             instance,
                                             null );

  }
  */

  public getPrimaryKey(): string[] {

    return [ "id" ]; //Change here

  }

}
