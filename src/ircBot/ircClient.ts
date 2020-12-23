import * as irc from 'irc';
import { IDataPersistence } from '../database/IDataPersistence';
import getYouTubeID from 'get-youtube-id';

import { ICommandsController, CommandsController } from './CommandsController';
import { IrcMessage } from './IrcMessage';

export class IrcConfig {
  constructor(public botName: string, public server: string, public channel: string)
  {
  }
}

export interface IIrcClient {
  connect(): boolean;
  say(toChannel: string, message: string): void;
}


export class IrcClient implements IIrcClient {

  private client: irc.Client;
  private readonly config: IrcConfig;
  private readonly db: IDataPersistence;
  private readonly api_key: string;
  private readonly commandsController: ICommandsController;

  constructor(config: IrcConfig, db: IDataPersistence){
    this.config = config;
    this.db = db;
    const secrets: {[key: string]: any} = require('../../password.json');
    this.api_key = secrets.api_key;

    this.commandsController = new CommandsController(this.db, this, config, this.api_key);
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
    this.client.addListener("message", (fromUser: string, toChannel: string, message: string, _) => {
      this.commandsController.process(new IrcMessage(fromUser, toChannel, message));
    });
  }
}
