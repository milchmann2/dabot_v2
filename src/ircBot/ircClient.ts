import * as irc from 'irc';
import { IDataPersistence } from '../database/IDataPersistence';

export interface IIrcClient {
  connect(): boolean;
}

export class IrcConfig {
  constructor(public botName: string, public server: string, public channel: string)
  {
  }
}

export class IrcClient implements IIrcClient {
  client: irc.Client;
  config: IrcConfig;
  db: IDataPersistence;

  constructor(config: IrcConfig, db: IDataPersistence){
    this.config = config;
    this.db = db;
  }

  public connect(): boolean {
    this.client = new irc.Client(this.config.server, this.config.botName, {
      channels: [this.config.channel]
    });

    this.addListeners();

    return true;
  }

  private addListeners(): void {
    this.client.addListener("message", (fromUser: string, toChannel: string, message: string, _) => {
      fromUser = fromUser.toLowerCase();

      // TODO temporary
      if (message === '!logs'){
        this.client.say(toChannel, "http://108.61.178.189:4121/");
      }

      // check notes for user
      // create message
        // can be command or normal message
      // process message
      this.db.Log(fromUser, toChannel, message)
    });
  }
}
