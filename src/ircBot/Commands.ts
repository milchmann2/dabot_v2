/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-namespace */
import getYouTubeID from "get-youtube-id";
import { IDataPersistence } from "../database/IDataPersistence";
import { IrcClient, IrcConfig } from "./ircClient";
import request = require('request');
import { ICommandsFactory } from "./CommandsFactory";

export interface ICommand {
  name: string;
  type: CommandType;
  execute(properties: CommandProperties): void;
}

export interface IUserCommand {
  ircUsage: string;
}

// add a registry of the type you expect
export namespace ICommand {
  type Constructor<T> = {
    new(...args: any[]): T;
    readonly prototype: T;
  }
  const implementations: Constructor<ICommand>[] = [];
  export function getImplementations(): Constructor<ICommand>[] {
    return implementations;
  }
  export function register<T extends Constructor<ICommand>>(ctor: T) {
    implementations.push(ctor);
    return ctor;
  }
}

export enum CommandType {
  UserCommand,
  IrcCommand,
  QueryCommand,
  NullCommand
}

export interface CommandDependencies {
  [name: string]: any;
}

export interface CommandProperties {
  [name: string]: any;
}

@ICommand.register
export class NullCommand {

  public readonly name = 'null';
  public readonly type = CommandType.NullCommand;

  constructor(dependencies: CommandDependencies) {
  }

  execute(properties: CommandProperties): void {
  }
}

@ICommand.register
export class LogsBotCommand implements IUserCommand {

  public readonly name = 'logs';
  public readonly type = CommandType.UserCommand;
  public readonly ircUsage = "!logs"
  private readonly ircClient: IrcClient;
  private readonly database: IDataPersistence;
  private readonly ircConfig: IrcConfig;

  constructor(dependencies: CommandDependencies) {

    this.ircClient = dependencies.ircClient;
    this.database = dependencies.database;
    this.ircConfig = dependencies.ircConfig;
  }

  execute(properties: CommandProperties): void {

    const toChannel = properties['toChannel'] as string;

    const webUrl = "http://108.61.178.189:4121/";
    this.ircClient.say(toChannel, webUrl);
    this.database.Log(this.ircConfig.botName, toChannel, webUrl)
  }
}

@ICommand.register
export class YoutubeCommand {

  public readonly name = 'youtube';
  public readonly type = CommandType.QueryCommand;
  private readonly ircClient: IrcClient;
  private readonly database: IDataPersistence;
  private readonly ircConfig: IrcConfig;
  private readonly youtubeApiKey: string

  constructor(dependencies: CommandDependencies) {

    this.ircClient = dependencies.ircClient;
    this.database = dependencies.database;
    this.ircConfig = dependencies.ircConfig;
    this.youtubeApiKey = dependencies.youtubeApiKey;
  }

  execute(properties: CommandProperties): void {

    const links = properties['links'] as string[];
    const toChannel = properties['toChannel'] as string;

    links.forEach(url => {
      const id = getYouTubeID(url, { fuzzy: false });
      //console.log('id', id);
      if (id !== null){
        request(`https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${id}&key=${this.youtubeApiKey}`, { json: true }, (err, res, body) => {
          if (err) { return console.log(err); }
          const duration = this.youtubeDurationToTime(body['items'][0]['contentDetails']['duration']);
          const youtubeMessage = `[YT] ${body['items'][0]['snippet']['title']} [${duration}]`;
          this.ircClient.say(toChannel, youtubeMessage);
          this.database.Log(this.ircConfig.botName, toChannel, youtubeMessage)
        });
      }
    });
  }

  // https://gist.github.com/jrtaylor-com/42883b0e28a45b8362e7
  private youtubeDurationToTime(duration: string): string {

    let hours   = 0;
    let minutes = 0;
    let seconds = 0;

    // Remove PT from string ref: https://developers.google.com/youtube/v3/docs/videos#contentDetails.duration
    duration = duration.replace('PT','');

    // If the string contains hours parse it and remove it from our duration string
    if (duration.indexOf('H') > -1) {
      const hours_split = duration.split('H');
      hours       = parseInt(hours_split[0]);
      duration    = hours_split[1];
    }

    // If the string contains minutes parse it and remove it from our duration string
    if (duration.indexOf('M') > -1) {
      const minutes_split = duration.split('M');
      minutes       = parseInt(minutes_split[0]);
      duration      = minutes_split[1];
    }

    // If the string contains seconds parse it and remove it from our duration string
    if (duration.indexOf('S') > -1) {
      const seconds_split = duration.split('S');
      seconds       = parseInt(seconds_split[0]);
    }

    // Math the values to return seconds
    return hours ? `${hours}:${minutes}:${seconds}`
                  : `${minutes}:${seconds}`;
  }
}

@ICommand.register
export class MessageCommand {

  public readonly name = 'message';
  public readonly type = CommandType.IrcCommand;
  private readonly database: IDataPersistence;

  constructor(dependencies: CommandDependencies) {

    this.database = dependencies.database;
  }

  execute({fromUser, toChannel, message}: CommandProperties): void {

    this.database.Log(fromUser, toChannel, message)
  }
}

@ICommand.register
export class UserActivityCommand {

  public readonly name = 'userActivity';
  public readonly type = CommandType.IrcCommand;
  private readonly database: IDataPersistence;
  private readonly ircConfig: IrcConfig;

  constructor(dependencies: CommandDependencies) {

    this.database = dependencies.database;
    this.ircConfig = dependencies.ircConfig;
  }

  execute({fromUser, toChannel, message}: CommandProperties): void {

    const userActivity = `${fromUser} ${message}`;
    this.database.Log(this.ircConfig.botName, toChannel, userActivity)
  }
}

@ICommand.register
export class HelpCommand implements IUserCommand {

  public readonly name = 'help';
  public readonly type = CommandType.UserCommand;
  public readonly ircUsage = "!help"
  private readonly ircClient: IrcClient;
  private readonly database: IDataPersistence;
  private readonly ircConfig: IrcConfig;
  private readonly commandsFactory: ICommandsFactory;

  constructor(dependencies: CommandDependencies) {

    this.ircClient = dependencies.ircClient;
    this.database = dependencies.database;
    this.ircConfig = dependencies.ircConfig;
    this.commandsFactory = dependencies.commandsFactory;
  }

  execute({toChannel}: CommandProperties): void {

    const helpString = this.commandsFactory.helpString();

    this.ircClient.say(toChannel, helpString);
    this.database.Log(this.ircConfig.botName, toChannel, helpString)
  }
}

@ICommand.register
export class AddUserCommand implements IUserCommand {

  public readonly name = 'adduser';
  public readonly type = CommandType.UserCommand;
  public readonly ircUsage = "!adduser *user*"
  private readonly ircClient: IrcClient;
  private readonly database: IDataPersistence;
  private readonly ircConfig: IrcConfig;
  private readonly commandsFactory: ICommandsFactory;

  constructor(dependencies: CommandDependencies) {

    this.ircClient = dependencies.ircClient;
    this.database = dependencies.database;
    this.ircConfig = dependencies.ircConfig;
    this.commandsFactory = dependencies.commandsFactory;
  }

  async execute({toChannel, parameters}: CommandProperties): Promise<void> {

    const user = parameters[0];
    let worked = "";
    this.database.AddUser(user, user, (res) => {
      worked = res;
      this.ircClient.say(toChannel, worked);
      this.database.Log(this.ircConfig.botName, toChannel, worked)
    });
  }
}
