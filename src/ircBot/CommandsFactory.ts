import { IDataPersistence } from "../database/IDataPersistence";
import { CommandDependencies, ICommand } from "./Commands";
import { IrcClient, IrcConfig } from "./ircClient";



export interface ICommandsFactory {
  get(name: string): ICommand;
}

export class CommandsFactory implements ICommandsFactory {

  private readonly commands: {[name: string]: ICommand} = {};

  constructor(ircClient: IrcClient, database: IDataPersistence, ircConfig: IrcConfig, youtubeApiKey: string) {

    const commandsDependencies: CommandDependencies = {
      ircClient,
      database,
      ircConfig,
      youtubeApiKey
    };

    ICommand.getImplementations().forEach(commandCtor => {
      const command = new commandCtor(commandsDependencies);
      this.commands[command.commandType] = command;
    })
  }

  get(name: string): ICommand {
    return this.commands[name];
  }
}
