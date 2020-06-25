import cluster from 'cluster';

import CommonConstants from "../02_system/common/CommonConstants";

import CommonUtilities from "../02_system/common/CommonUtilities";
import SystemUtilities from "../02_system/common/SystemUtilities";

let debug = require( 'debug' )( 'CommonGenericRun' );

export default class CommonGenericRun {

  public static detectColumnDataPositions( headers: string[], logger: any ): {} {

    let result = {

      Establishment: -1,
      Ticket: -1,
      Name: -1,
      Address: -1,
      ZipCode: -1,
      City: -1,
      Phone: -1,
      Note: -1,
      Driver: -1,
      CreatedAt: -1

    }

    let intFieldsCount = Object.keys( result ).length;
    let intFoundFieldsCount = 0;

    try {

      for ( let intIndexHeader = 0; intIndexHeader < headers.length; intIndexHeader++ ) {

        if ( headers[ intIndexHeader ] ) {

          const strHeader = headers[ intIndexHeader ].trim().toLowerCase();

          if ( strHeader === "establishment" ) {

            if ( result.Establishment === -1 ) {

              result.Establishment = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader  === "#ticket" ||
                    strHeader  === "ticket" ) {

            if ( result.Ticket === -1 ) {

              result.Ticket = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader === "name" ) {

            if ( result.Name === -1 ) {

              result.Name = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader === "address" ) {

            if ( result.Address === -1 ) {

              result.Address = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader === "zipcode" ||
                    strHeader === "zip code" ||
                    strHeader === "zip_code" ) {

            if ( result.ZipCode === -1 ) {

              result.ZipCode = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader === "city" ) {

            if ( result.City === -1 ) {

              result.City = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader === "phone" ) {

            if ( result.Phone === -1 ) {

              result.Phone = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader === "note" ) {

            if ( result.Note === -1 ) {

              result.Note = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader === "driver" ) {

            if ( result.Driver === -1 ) {

              result.Driver = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }
          else if ( strHeader === "created_at" ||
                    strHeader === "created at" ||
                    strHeader === "createdat" ) {

            if ( result.CreatedAt === -1 ) {

              result.CreatedAt = intIndexHeader;

              intFoundFieldsCount += 1;

            }

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = CommonGenericRun.name + "." + this.detectColumnDataPositions.name;

      const strMark = "45924FF5765D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    result[ "FieldsCount" ] = intFieldsCount;
    result[ "FoundFieldsCount" ] = intFoundFieldsCount;

    return result;

  }

}
