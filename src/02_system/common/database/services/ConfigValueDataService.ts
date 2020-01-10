//import { UserGroup } from "../models/UserGroup";
import DBConnectionManager from "../../managers/DBConnectionManager";
import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from '../../SystemUtilities';
import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,
import BaseService from "./BaseService";
import SystemConstants from "../../SystemContants";
import CommonConstants from "../../CommonConstants";

const debug = require( 'debug' )( 'ConfigValueDataService' );

export default class ConfigValueDataService extends BaseService {

  static readonly _ID = "ConfigValueDataService";

  static async getConfigValueData( strConfigMetaDataId: string,
                                   strOnwer: string,
                                   transaction: any,
                                   logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const strSQL = DBConnectionManager.getStatement( "getConfigValueData",
                                                       {
                                                         ConfigMetaDataId: strConfigMetaDataId,
                                                         Owner: strOnwer
                                                       },
                                                       logger );

      const rows = await dbConnection.query( strSQL,
                                             {
                                               raw: true,
                                               type: QueryTypes.SELECT,
                                               transaction: currentTransaction
                                             } );

      if ( CommonUtilities.isNotNullOrEmpty( rows ) ) {

        result = {
                   Value: rows[ 0 ].Value ? rows[ 0 ].Value : null,
                   Default: rows[ 0 ].Default ? rows[ 0 ].Default : null
                 };

      }

      if ( currentTransaction != null &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigValueData.name;

      const strMark = "0AFC109A813E";

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

      if ( currentTransaction != null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( ex ) {


        }

      }

    }

    return result;

  }

  static searchInTags( jsonConfig: any,
                       strTag: string,
                       strPostfix: string,
                       logger: any ):any {

    let result = null;

    try {

      const tags = strTag ? strTag.split( "," ) : [];

      for ( let intIndex = 0; intIndex < tags.length; intIndex++ ) {

        if ( jsonConfig[ tags[ intIndex ] + "." + strPostfix ] ) {

          result = jsonConfig[ tags[ intIndex ] + "." + strPostfix ];
          break;

        }
        else if ( jsonConfig[ tags[ intIndex ] ] ) {

          result = jsonConfig[ tags[ intIndex ] ];
          break;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.searchInTags.name;

      const strMark = "9BD05E9C665D";

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

    return result;

  }

  static async getConfigValueDataFromSession( userSessionStatus: any,
                                              strConfigId: string,
                                              strConfigOwner: string,
                                              strPostfix: string,
                                              transaction: any,
                                              logger: any ): Promise<any> {

    let result = null;

    const configData = await ConfigValueDataService.getConfigValueData( strConfigId,
                                                                        strConfigOwner,
                                                                        transaction,
                                                                        logger );

    try {

      let jsonConfig = null;

      if ( configData.Value ) {

        jsonConfig = CommonUtilities.parseJSON( configData.Value,
                                                logger );

      }

      if ( jsonConfig ) {

        if ( jsonConfig[ "#" + userSessionStatus.UserId + "#." + strPostfix ] ) {

          jsonConfig = jsonConfig[ "#" + userSessionStatus.UserId + "#." + strPostfix ];

        }
        else if ( jsonConfig[ "#" + userSessionStatus.UserId + "#" ] ) {

          jsonConfig = jsonConfig[ "#" + userSessionStatus.UserId + "#" ];

        }
        else if ( jsonConfig[ "#" + userSessionStatus.UserName + "#." + strPostfix ] ) {

          jsonConfig = jsonConfig[ "#" + userSessionStatus.UserName + "#." + strPostfix ];

        }
        else if ( jsonConfig[ "#" + userSessionStatus.UserName + "#" ] ) {

          jsonConfig = jsonConfig[ "#" + userSessionStatus.UserName + "#" ];

        }
        else {

          let searchConfigData = ConfigValueDataService.searchInTags( jsonConfig,
                                                                      userSessionStatus.UserTag,
                                                                      strPostfix,
                                                                      logger );

          if ( searchConfigData === null ) {

            if ( jsonConfig[ "#" + userSessionStatus.UserGroupId + "#." + strPostfix ] ) {

              jsonConfig = jsonConfig[ "#" + userSessionStatus.UserGroupId + "#." + strPostfix ];

            }
            else if ( jsonConfig[ "#" + userSessionStatus.UserGroupId + "#" ] ) {

              jsonConfig = jsonConfig[ "#" + userSessionStatus.UserGroupId + "#" ];

            }
            else if ( jsonConfig[ "#" + userSessionStatus.UserGroupName + "#." + strPostfix ] ) {

              jsonConfig = jsonConfig[ "#" + userSessionStatus.UserGroupName + "#." + strPostfix ];

            }
            else if ( jsonConfig[ "#" + userSessionStatus.UserGroupName + "#" ] ) {

              jsonConfig = jsonConfig[ "#" + userSessionStatus.UserGroupName + "#" ];

            }
            else {

              searchConfigData = ConfigValueDataService.searchInTags( jsonConfig,
                                                                      userSessionStatus.UserGroupTag,
                                                                      strPostfix,
                                                                      logger );

              if ( searchConfigData === null ) {

                jsonConfig = jsonConfig[ "@__default__@" ];

              }
              else {

                jsonConfig = searchConfigData;

              }

            }

          }
          else {

            jsonConfig = searchConfigData;

          }

        }

      }

      if ( jsonConfig === null ) {

        jsonConfig = CommonUtilities.parseJSON( configData.Default,
                                                logger );

        if ( jsonConfig ) {

          jsonConfig = jsonConfig[ "@__default__@" ];

        }

      }

      if ( jsonConfig ) {

        result = jsonConfig;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigValueDataFromSession.name;

      const strMark = "DEDAE9D19840";

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

    return result;

  }

  /*
  static async getConfigValueDataSingle( userSessionStatus: any,
                                         strConfigId: string,
                                         strConfigOwner: string,
                                         strCategory: string,
                                         transaction: any,
                                         logger: any ): Promise<any> {

    let result = "";

    const configData = await ConfigValueDataService.getConfigValueData( strConfigId,
                                                                        strConfigOwner,
                                                                        transaction,
                                                                        logger );

    try {

      let jsonConfig = null;

      if ( configData.Value ) {

        jsonConfig = CommonUtilities.parseJSON( configData.Value,
                                                logger );

      }

      if ( jsonConfig ) {

        if ( jsonConfig[ "#" + userSessionStatus.UserId + "#." + strCategory ] ) {

          jsonConfig = jsonConfig[ "#" + userSessionStatus.UserId + "#." + strCategory ];

        }
        else if ( jsonConfig[ "#" + userSessionStatus.UserId + "#" ] ) {

          jsonConfig = jsonConfig[ "#" + userSessionStatus.UserId + "#" ];

        }
        else if ( jsonConfig[ "#" + userSessionStatus.UserName + "#." + strCategory ] ) {

          jsonConfig = jsonConfig[ "#" + userSessionStatus.UserName + "#." + strCategory ];

        }
        else if ( jsonConfig[ "#" + userSessionStatus.UserName + "#" ] ) {

          jsonConfig = jsonConfig[ "#" + userSessionStatus.UserName + "#" ];

        }
        else {

          let searchConfigData = ConfigValueDataService.searchInTags( jsonConfig,
                                                                      userSessionStatus.UserTag,
                                                                      strCategory,
                                                                      logger );

          if ( searchConfigData === null ) {

            if ( jsonConfig[ "#" + userSessionStatus.UserGroupId + "#." + strCategory ] ) {

              jsonConfig = jsonConfig[ "#" + userSessionStatus.UserGroupId + "#." + strCategory ];

            }
            else if ( jsonConfig[ "#" + userSessionStatus.UserGroupId + "#" ] ) {

              jsonConfig = jsonConfig[ "#" + userSessionStatus.UserGroupId + "#" ];

            }
            else if ( jsonConfig[ "#" + userSessionStatus.UserGroupName + "#." + strCategory ] ) {

              jsonConfig = jsonConfig[ "#" + userSessionStatus.UserGroupName + "#." + strCategory ];

            }
            else if ( jsonConfig[ "#" + userSessionStatus.UserGroupName + "#" ] ) {

              jsonConfig = jsonConfig[ "#" + userSessionStatus.UserGroupName + "#" ];

            }
            else {

              searchConfigData = ConfigValueDataService.searchInTags( jsonConfig,
                                                                      userSessionStatus.UserGroupTag,
                                                                      strCategory,
                                                                      logger );

              if ( searchConfigData === null ) {

                jsonConfig = jsonConfig[ "@__default__@" ];

              }
              else {

                jsonConfig = searchConfigData;

              }

            }

          }
          else {

            jsonConfig = searchConfigData;

          }

        }

      }

      if ( jsonConfig === null ) { //No specific config found?

        jsonConfig = CommonUtilities.parseJSON( configData.Default, //Use the value from field Default from table ConfigMetaData
                                                logger );

        if ( jsonConfig ) {

          jsonConfig = jsonConfig[ "@__default__@" ];

        }

      }

      if ( jsonConfig ) {

        result = jsonConfig;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigValueDataSingle.name;

      const strMark = "F93ACA141D7E";

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

    return result;

  }
  */

  static async getConfigValueDataObjectDeniedAllowed( userSessionStatus: any,
                                                       strConfigId: string,
                                                       strConfigOwner: string,
                                                       strPostfix: string,
                                                       transaction: any,
                                                       logger: any ): Promise<any> {

    let result = { allowed: "*", denied: null }; //Default allow all

    const configData = await ConfigValueDataService.getConfigValueDataFromSession( userSessionStatus,
                                                                                   strConfigId,
                                                                                   strConfigOwner,
                                                                                   strPostfix,
                                                                                   transaction,
                                                                                   logger );

    if ( configData &&
         configData.allowed !== undefined &&
         configData.denied !== undefined ) {

      result = configData;

    }

    return result;

  }

  static async checkAllowed( userSessionStatus: any,
                             strConfigId: string,
                             strConfigOwner: string,
                             strDataToCheck: string,
                             strPostfix: string,
                             transaction: any,
                             bForceResultZeroToOne: boolean,
                             logger: any ): Promise<any> {

    let result = { value: 0, allowed: "*", denied: "" };

    try {

      const configData = await ConfigValueDataService.getConfigValueDataObjectDeniedAllowed( userSessionStatus,
                                                                                             strConfigId,
                                                                                             strConfigOwner,
                                                                                             strPostfix,
                                                                                             transaction,
                                                                                             logger );

      result.denied = configData.denied;
      result.allowed = configData.allowed;

      if ( CommonUtilities.isNotNullOrEmpty( result.denied ) ) {

        if ( result.denied === SystemConstants._VALUE_ANY ) {

          result.value = -1; //Explicit denied

        }
        else if ( result.denied.includes( "#" + strDataToCheck + "#" ) ) {

          result.value = -1; //Explicit denied

        }

        result.denied = configData.denied.replace( new RegExp( "\\#", "gi" ), "" ).split( "," );

      }

      if ( CommonUtilities.isNotNullOrEmpty( result.allowed ) ) {

        if ( result.value == 0 ) {

          if ( result.allowed === SystemConstants._VALUE_ANY ) {

            result.value = 1; //Explicit allowed

          }
          else if ( result.allowed.includes( "#" + strDataToCheck + "#" ) ) {

            result.value = 1; //Explicit allowed

          }
          else if ( CommonUtilities.isNotNullOrEmpty( result.allowed ) ) {

            result.value = -1; //If defined allowed list and is not in the list then deny

          }

          //result.allowed = configData.allowed.replace( new RegExp( "\\#", "gi" ), "" ).split( "," );

        }

        if ( result.denied === SystemConstants._VALUE_ANY ) {

          ( result as any ).allowed = [];

        }
        else {

          result.allowed = configData.allowed.replace( new RegExp( "\\#", "gi" ), "" ).split( "," );

        }

      }

      if ( result.denied === SystemConstants._VALUE_ANY ) {

        ( result as any ).denied = [ SystemConstants._VALUE_ANY ];

      }
      else if ( CommonUtilities.isNullOrEmpty( result.denied ) ) {

        ( result as any ).denied = [];

      }

      if ( result.allowed === SystemConstants._VALUE_ANY ) {

        ( result as any ).allowed = [ SystemConstants._VALUE_ANY ];

      }
      else if ( CommonUtilities.isNullOrEmpty( result.allowed ) ) {

        ( result as any ).allowed = [];

      }

      if ( result.value == 0 &&
           bForceResultZeroToOne ) {

        result.value = 1;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkAllowed.name;

      const strMark = "537A7376C91E";

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

    return result;

  }

}