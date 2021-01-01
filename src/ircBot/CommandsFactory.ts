import { IDataPersistence } from "../database/IDataPersistence";
import { ICommand, LogsBotCommand, MessageCommand, UserActivityCommand, YoutubeCommand } from "./Commands";
import { IrcClient, IrcConfig } from "./ircClient";



export interface ICommandsFactory {
  get(name: string): ICommand;
}

export class CommandsFactory implements ICommandsFactory {

  private readonly commands: {[name: string]: ICommand} = {};

  constructor(ircClient: IrcClient, database: IDataPersistence, ircConfig: IrcConfig, youtubeApiKey: string) {
    this.commands.logs = new LogsBotCommand(ircClient, database, ircConfig);
    this.commands.youtube = new YoutubeCommand(ircClient, database, ircConfig, youtubeApiKey);
    this.commands.message = new MessageCommand(database);
    this.commands.userActivity = new UserActivityCommand(database, ircConfig);
  }

  get(name: string): ICommand {
    return this.commands[name];
  }
}
