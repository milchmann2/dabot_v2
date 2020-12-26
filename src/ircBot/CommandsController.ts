import { IDataPersistence } from "../database/IDataPersistence";
import { ICommand, LogsBotCommand, MessageCommand, YoutubeCommand } from "./Commands";
import { IrcClient, IrcConfig } from "./ircClient";
import { IrcMessage } from "./IrcMessage";


export interface ICommandsController {
  process(ircMessage: IrcMessage): void;
}

export class CommandsController implements ICommandsController {

  private readonly database: IDataPersistence;
  private readonly ircClient: IrcClient;
  private readonly ircConfig: IrcConfig;
  private readonly youtubeApiKey: string;
  private readonly commands: {[name: string]: ICommand} = {};

  constructor(database: IDataPersistence, ircClient: IrcClient, ircConfig: IrcConfig, youtubeApiKey: string) {

    this.database = database;
    this.ircClient = ircClient;
    this.ircConfig = ircConfig;
    this.youtubeApiKey = youtubeApiKey;

    this.loadCommands();

    this.ircClient.on("message", msg => this.process(msg));
  }

  private loadCommands() {
    this.commands['logs'] = new LogsBotCommand(this.ircClient, this.database, this.ircConfig);
    this.commands['youtube'] = new YoutubeCommand(this.ircClient, this.database, this.ircConfig, this.youtubeApiKey);
    this.commands['message'] = new MessageCommand(this.database);
  }

  public process(ircMessage: IrcMessage): void {

    this.commands['message'].execute({
      'fromUser': ircMessage.fromUser,
      'toChannel': ircMessage.toChannel,
      'message': ircMessage.message
    });

    if (ircMessage.message === '!logs'){
      this.commands['logs'].execute({
        'toChannel': ircMessage.toChannel
      });
    }

    const urlExpression = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
    const matches = ircMessage.message.match(urlExpression) || [];
    if (matches.length > 0){
      this.commands['youtube'].execute({
        'links': matches,
        'toChannel': ircMessage.toChannel
      });
    }

    // check notes for user
    // create message
      // can be command or normal message
    // process message
  }
}
