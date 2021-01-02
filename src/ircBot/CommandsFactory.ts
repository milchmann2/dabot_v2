import { IDataPersistence } from "../database/IDataPersistence";
import { CommandDependencies, CommandType, ICommand, IUserCommand } from "./Commands";
import { IrcClient, IrcConfig } from "./ircClient";



export interface ICommandsFactory {
  get(name: string): ICommand;
  helpString(): string;
}

export class CommandsFactory implements ICommandsFactory {

  private readonly commands: {[name: string]: ICommand} = {};

  constructor(ircClient: IrcClient, database: IDataPersistence, ircConfig: IrcConfig, youtubeApiKey: string) {

    const commandsDependencies: CommandDependencies = {
      ircClient,
      database,
      ircConfig,
      youtubeApiKey,
      'commandsFactory': this
    };

    ICommand.getImplementations().forEach(commandCtor => {
      const command = new commandCtor(commandsDependencies);
      this.commands[command.name] = command;
    });
  }

  get(name: string): ICommand {
    const commandName = name in this.commands ? name : 'null';
    return this.commands[commandName];
  }

  helpString(): string {

    let helpString = "";
    for (const commandName in this.commands) {
      const command = this.commands[commandName];
      if (command.type == CommandType.UserCommand) {
        helpString += (<IUserCommand><unknown>command).ircUsage + ' ; ';
      }
    }

    return helpString;
  }
}
