import { IDataPersistence } from "../database/IDataPersistence";
import { ICommand, LogsBotCommand, MessageCommand, YoutubeCommand } from "./Commands";
import { IIrcClient, IrcClient, IrcConfig } from "./ircClient";
import { IrcMessage } from "./IrcMessage";


export interface ICommandsController {
  process(ircMessage: IrcMessage): void;
}


export class CommandsController implements ICommandsController {

  private readonly database: IDataPersistence;
  private readonly ircClient: IIrcClient;
  private readonly ircConfig: IrcConfig;
  private readonly youtubeApiKey: string;

  constructor(database: IDataPersistence, ircClient: IIrcClient, ircConfig: IrcConfig, youtubeApiKey: string) {

    this.database = database;
    this.ircClient = ircClient;
    this.ircConfig = ircConfig;
    this.youtubeApiKey = youtubeApiKey;
  }

  public process(ircMessage: IrcMessage): void {

    let command: ICommand;

    command = new MessageCommand(ircMessage, this.database);
    command.execute();

    if (ircMessage.message === '!logs'){
      command = new LogsBotCommand(ircMessage, this.ircClient, this.database,  this.ircConfig);
      command.execute();
    }

    const urlExpression = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
    const matches = ircMessage.message.match(urlExpression) || [];
    if (matches.length > 0){
      command = new YoutubeCommand(matches, ircMessage, this.ircClient, this.database, this.ircConfig, this.youtubeApiKey);
      command.execute();
    }

    // check notes for user
    // create message
      // can be command or normal message
    // process message
  }
}
