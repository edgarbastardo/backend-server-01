import NotificationManager from "../../../managers/NotificationManager";

export default class PublishToSlack {

  public name = "PublishToSlack";

  public async init( params: any,
                     logger: any ): Promise<boolean> {

    return true;

  }

  public async process( intIndex: number,
                        strChain: string,
                        payload: any,
                        logger: any ): Promise<any> {

    await NotificationManager.publishToExternal( payload,
                                                 logger );

  }

}
