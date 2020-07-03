import fs from "fs"; //Load the filesystem module
import path from "path";
import cluster from "cluster";

import xlsxFile from "read-excel-file/node";

import logSymbols = require( "log-symbols" );
import chalk = require( "chalk" );

import CommonConstants from "../02_system/common/CommonConstants";

import CommonUtilities from "../02_system/common/CommonUtilities";
import SystemUtilities from "../02_system/common/SystemUtilities";

import I18NManager from "../02_system/common/managers/I18Manager";
import LoggerManager from "../02_system/common/managers/LoggerManager";

import OdinRequestServiceV1 from "../03_business/common/services/OdinRequestServiceV1";
import CommonGenericRun from "./ComonGenericRun";

let debug = require( "debug" )( "BulkCreateOrder" );

const argv = require("yargs").argv;

export default class BulkCreateOrder {

  static async bulkCreateOrder( logger: any ) {

    try {

      //npm run start:run -- --files=ruta-sergios-702.xlsx,ruta-sergios-703.xlsx --server=test01.weknock-tech.com --authorization=8f5f0014-062a-492f-aa65-14d0cd25becb
      //npm run start:run -- --files=ruta-sergios-702.xlsx,ruta-sergios-703.xlsx

      let debugMark = debug.extend( "9159DCAEB587" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      debugMark( "bulkCreateOrder" );

      debugMark( "Argument files: %s", argv.files );
      debugMark( "Argument server: %s", argv.server );
      debugMark( SystemUtilities.strBaseRootPath );

      if ( argv.files ) {

        const strFullDataPath = path.join( SystemUtilities.strBaseRootPath,
                                           "/data/",
                                           SystemUtilities.getHostName(),
                                           argv.files );

        const files = fs.readdirSync( strFullDataPath )
                        .filter( ( file ) => {

                          return fs.lstatSync( path.join( strFullDataPath, file ) ).isFile()

                        } )
                        .filter( ( file ) => {

                          return file.indexOf( "." ) !== 0 && ( file.slice( -5 ) === ".xlsx" || file.slice( -4 ) === ".xls" )

                        } );

        //const files = argv.files.split( "," );

        for ( let intFileIndex = 0; intFileIndex < files.length; intFileIndex++ ) {

          let debugMark = debug.extend( ( intFileIndex + 1 ) + "-9159DCAEB587" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

          const strFullFilePath = path.join( strFullDataPath, files[ intFileIndex ] ); //SystemUtilities.strBaseRootPath + "/data/" + SystemUtilities.getHostName() + "/" + files[ intFileIndex ];

          if ( fs.existsSync( strFullFilePath ) ) {

            const strFullFilePathResult = path.join( strFullDataPath, argv.context, files[ intFileIndex ] ) + ".result";
            const strFullFilePathInput = path.join( strFullDataPath, argv.context, files[ intFileIndex ] ) + ".input";
            const strFullFilePathOutput = path.join( strFullDataPath, argv.context, files[ intFileIndex ] ) + ".output";

            if ( !fs.existsSync( strFullFilePathResult ) ) {

              let strMessage = I18NManager.translateSync( "en_US", "Reading the file %s", strFullFilePath );

              debugMark( strMessage );
              fs.writeFileSync( strFullFilePathResult, strMessage + "\n" );

              const excelRows = await xlsxFile( strFullFilePath );

              strMessage = I18NManager.translateSync( "en_US", "%s Rows found", excelRows.length );

              debugMark( strMessage );
              fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

              let intRow = 1;

              let strDefaultAuthorization = argv.authorization ? argv.authorization: process.env.ODIN_API_KEY1;

              if ( !argv.authorization ) {

                strMessage = I18NManager.translateSync( "en_US", "Warning the parameter --authorization=??? not defined using %s by default", strDefaultAuthorization );

                debugMark( strMessage );

                fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

              }
              else {

                strMessage = I18NManager.translateSync( "en_US", "Using authorization %s", strDefaultAuthorization );

                debugMark( strMessage );

                fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

              }

              const headers = {

                "Content-Type": "application/json",
                "Authorization": strDefaultAuthorization,

              }

              const strDefaultServer = argv.server ? argv.server : "http://test01.weknock-tech.com";

              if ( !argv.server ) {

                strMessage = I18NManager.translateSync( "en_US", "Warning the parameter --server=??? not defined using %s by default", strDefaultServer );

                debugMark( strMessage );

                fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

              }
              else {

                strMessage = I18NManager.translateSync( "en_US", "Using server %s", strDefaultServer );

                debugMark( strMessage );

                fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

              }

              const backend = {

                url: [ strDefaultServer ]

              }

              const columnDataPositions = CommonGenericRun.detectColumnDataPositions( excelRows[ 0 ], logger ) as any;

              let intProcesedRows = 0;

              let createdAt = null;

              for ( intRow = 1; intRow < excelRows.length; intRow++ ) {

                /*
                if ( excelRows[ intRow ][ 0 ] &&
                     excelRows[ intRow ][ 4 ] &&
                     excelRows[ intRow ][ 3 ] &&
                     excelRows[ intRow ][ 8 ] &&
                     excelRows[ intRow ][ 9 ] ) {
                       */
                if ( columnDataPositions.FieldsCount === columnDataPositions.FoundFieldsCount ) {

                  const intPhone = parseInt( CommonUtilities.clearSpecialChars( excelRows[ intRow ][ columnDataPositions.Phone ], "-() " ) ); //excelRows[ intRow ][ 6 ], "-() " ) );

                  /*
                  if ( intRow === 1 || !createdAt ) {

                    createdAt = SystemUtilities.getCurrentDateAndTimeFrom( excelRows[ intRow ][ columnDataPositions.CreatedAt ] );

                  }
                  else {

                    createdAt = SystemUtilities.getCurrentDateAndTimeFromAndIncSeconds( createdAt, 1 );

                  }
                  */

                  const body = {

                    establishment_id: excelRows[ intRow ][ columnDataPositions.Establishment ], //excelRows[ intRow ][ 0 ], //Establisment
                    zip_code: excelRows[ intRow ][ columnDataPositions.ZipCode ], //excelRows[ intRow ][ 4 ], //Zip code
                    phone: intPhone !== NaN ? intPhone: 7868062108,
                    address: excelRows[ intRow ][ columnDataPositions.Address ], //excelRows[ intRow ][ 3 ],
                    address_type: "residential",
                    city: excelRows[ intRow ][ columnDataPositions.City ], //excelRows[ intRow ][ 5 ],
                    payment_method: "cash",
                    note: excelRows[ intRow ][ columnDataPositions.Name ] + "," + excelRows[ intRow ][ columnDataPositions.Note ], //excelRows[ intRow ][ 7 ] + ", " + excelRows[ intRow ][ 2 ],
                    driver_id: excelRows[ intRow ][ columnDataPositions.Driver ], //excelRows[ intRow ][ 8 ],
                    created_at: excelRows[ intRow ][ columnDataPositions.CreatedAt ],
                    tip: 0,
                    tip_method: "cash",

                    simulate: argv.simulate,
                    check_address_and_customer: 1,
                    client_name: excelRows[ intRow ][ columnDataPositions.Name ],
                    ticket: `${excelRows[ intRow ][ columnDataPositions.Ticket ]}`,
                    qty_meals: 2

                  }

                  strMessage = I18NManager.translateSync( "en_US", "Processing the row number %s", intRow );

                  debugMark( strMessage );

                  fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

                  const result = await OdinRequestServiceV1.callCreateOrder( backend,
                                                                             headers,
                                                                             body ) as any;

                  if ( result ) {

                    if ( result.input ) {

                      fs.appendFileSync( strFullFilePathInput, JSON.stringify( result.input, null, 2 ) + "\n" );

                    }

                    if ( result.output ) {

                      fs.appendFileSync( strFullFilePathOutput, JSON.stringify( result.output, null, 2 ) + "\n" );

                      if  ( result.output.status >= 200 &&
                            result.output.status < 300 ) {

                        strMessage = I18NManager.translateSync( "en_US", chalk.green( logSymbols.success + " ok:%s:%s", intRow, result.output.body.data.id ) );

                        debugMark( strMessage );

                        fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

                        intProcesedRows += 1;

                      }
                      else {

                        strMessage = I18NManager.translateSync( "en_US", logSymbols.error + " error:%s:%s:%s", intRow, result.output.status, result.output.statusText );

                        debugMark( strMessage );

                        fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

                      }

                    }
                    else if ( result.error ) {

                      strMessage = I18NManager.translateSync( "en_US", logSymbols.error + " error:%s:%s", intRow, result.error.message );

                      debugMark( strMessage );

                      fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

                    }
                    else {

                      strMessage = I18NManager.translateSync( "en_US", logSymbols.error + " error:%s:error_no_result", intRow );

                      debugMark( strMessage );

                      fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

                    }

                  }
                  else {

                    strMessage = I18NManager.translateSync( "en_US", logSymbols.error + " error:%s:error_no_response", intRow );

                    debugMark( strMessage );

                    fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

                  }

                }
                else {

                  strMessage = I18NManager.translateSync( "en_US", logSymbols.error + " error:%s:missing_information", intRow );

                  debugMark( strMessage );

                  fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

                }

              }

              strMessage = I18NManager.translateSync( "en_US", "**** Processed %s rows, Total: %s rows ****", intProcesedRows, excelRows.length );

              debugMark( strMessage );

              fs.appendFileSync( strFullFilePathResult, strMessage + "\n" );

            }
            else {

              debugMark( "The file in the path %s already processed. If you need process again delete the .result file", strFullFilePathResult );

            }

          }
          else {

            debugMark( "The file in the path %s not exists", strFullFilePath );

          }

        }

      }
      else {

        debugMark( "No argument --files=??? defined. You must define using `npm run start:run --files=myfile01.xlsx,myfile02.xlsx` with not quotes" );

      }

      //const args = process.argv.slice( 2 );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.bulkCreateOrder.name;

      const strMark = "F71332BCED7B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( LoggerManager.mainLoggerInstance &&
           typeof LoggerManager.mainLoggerInstance.error === "function" ) {

        LoggerManager.mainLoggerInstance.error( error );

      }

    }

  }
}
