import NotificationManager from "../../../managers/NotificationManager";
import LoggerManager from "../../../managers/LoggerManager";

export default class PublishToRedisOnTopic {

  public name = "PublishToRedisOnTopic";

  public async init( params: any,
                     logger: any ): Promise<boolean> {

    return true;

  }

  public async process( intIndex: number,
                        strChain: string,
                        payload: any,
                        logger: any ): Promise<any> {

    return await NotificationManager.publishOnTopic( "SystemEvent",
                                                     payload,
                                                     LoggerManager.mainLoggerInstance );

  }

}
