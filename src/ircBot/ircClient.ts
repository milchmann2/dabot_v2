import * as irc from 'irc';
import { IDataPersistence } from '../database/IDataPersistence';
import { ICommandsController, CommandsController } from './CommandsController';
import { IrcMessage } from './IrcMessage';
import { EventEmitter } from 'events';

export class IrcConfig {
  constructor(public botName: string, public server: string, public channel: string)
  {
  }
}

export declare interface IrcClient {
  connect(): boolean;
  say(toChannel: string, message: string): void;
  on(event: 'message', listener: (ircMessage: IrcMessage) => void): this;
  //on(event: string, listener: Function): this;
}


export class IrcClient extends EventEmitter {

  private client: irc.Client;
  private readonly config: IrcConfig;

  constructor(config: IrcConfig){

    super();
    this.config = config;
  }

  public connect(): boolean {
    this.client = new irc.Client(this.config.server, this.config.botName, {
      channels: [this.config.channel]
    });

    this.addListeners();

    return true;
  }

  public say(toChannel: string, message: string): void {
    this.client.say(toChannel, message);
  }

  private addListeners(): void {
    this.client.addListener("message", (fromUser: string, toChannel: string, message: string) => {
      this.emit('message', new IrcMessage(fromUser, toChannel, message));
    });
  }
}
