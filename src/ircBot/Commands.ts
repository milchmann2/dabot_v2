import getYouTubeID from "get-youtube-id";
import { IDataPersistence } from "../database/IDataPersistence";
import { IrcClient, IrcConfig } from "./ircClient";
import { IrcMessage } from "./IrcMessage";
import request = require('request');

export interface CommandProperties {
  [name: string]: any;
}

export interface ICommand {
  execute(properties: CommandProperties): void;
}

export class LogsBotCommand implements ICommand {

  private readonly ircClient: IrcClient;
  private readonly database: IDataPersistence;
  private readonly ircConfig: IrcConfig;

  constructor(ircClient: IrcClient, database: IDataPersistence, ircConfig: IrcConfig) {

    this.ircClient = ircClient;
    this.database = database;
    this.ircConfig = ircConfig;
  }

  execute(properties: CommandProperties): void {

    const toChannel = properties['toChannel'] as string;

    const webUrl = "http://108.61.178.189:4121/";
    this.ircClient.say(toChannel, webUrl);
    this.database.Log(this.ircConfig.botName, toChannel, webUrl)
  }
}

export class YoutubeCommand implements ICommand {

  private readonly ircMessage: IrcMessage;
  private readonly ircClient: IrcClient;
  private readonly database: IDataPersistence;
  private readonly ircConfig: IrcConfig;
  private readonly links: string[];
  private readonly youtubeApiKey: string

  constructor(ircClient: IrcClient, database: IDataPersistence, ircConfig: IrcConfig, youtubeApiKey: string) {

    this.ircClient = ircClient;
    this.database = database;
    this.ircConfig = ircConfig;
    this.youtubeApiKey = youtubeApiKey;
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

export class MessageCommand implements ICommand {

  private readonly database: IDataPersistence;

  constructor(database: IDataPersistence) {

    this.database = database;
  }

  execute({fromUser, toChannel, message}: CommandProperties): void {

    this.database.Log(fromUser, toChannel, message)
  }
}

export class UserActivityCommand implements ICommand {

  private readonly database: IDataPersistence;
  private readonly ircConfig: IrcConfig;

  constructor(database: IDataPersistence, ircConfig: IrcConfig) {

    this.database = database;
    this.ircConfig = ircConfig;
  }

  execute({fromUser, toChannel, message}: CommandProperties): void {

    const userActivity = `${fromUser} ${message}`;
    this.database.Log(this.ircConfig.botName, toChannel, userActivity)
  }
}
