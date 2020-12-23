import getYouTubeID from "get-youtube-id";
import { IDataPersistence } from "../database/IDataPersistence";
import { IIrcClient, IrcConfig } from "./ircClient";
import { IrcMessage } from "./IrcMessage";
import request = require('request');

export interface ICommand {
  execute(): void;
}

export class LogsBotCommand implements ICommand {

  private readonly ircMessage: IrcMessage;
  private readonly ircClient: IIrcClient;
  private readonly database: IDataPersistence;
  private readonly ircConfig: IrcConfig;

  constructor(ircMessage: IrcMessage, ircClient: IIrcClient, database: IDataPersistence, ircConfig: IrcConfig) {

    this.ircMessage = ircMessage;
    this.ircClient = ircClient;
    this.database = database;
    this.ircConfig = ircConfig;
  }

  execute(): void {
    const webUrl = "http://108.61.178.189:4121/";
    this.ircClient.say(this.ircMessage.toChannel, webUrl);
    this.database.Log(this.ircConfig.botName, this.ircMessage.toChannel, webUrl)
  }
}

export class YoutubeCommand implements ICommand {

  private readonly ircMessage: IrcMessage;
  private readonly ircClient: IIrcClient;
  private readonly database: IDataPersistence;
  private readonly ircConfig: IrcConfig;
  private readonly links: string[];
  private readonly youtubeApiKey: string


  constructor(links: string[], ircMessage: IrcMessage, ircClient: IIrcClient, database: IDataPersistence, ircConfig: IrcConfig, youtubeApiKey: string) {

    this.ircMessage = ircMessage;
    this.ircClient = ircClient;
    this.database = database;
    this.ircConfig = ircConfig;
    this.links = links;
    this.youtubeApiKey = youtubeApiKey;
  }

  execute(): void {
    this.links.forEach(url => {
      const id = getYouTubeID(url, { fuzzy: false });
      //console.log('id', id);
      if (id !== null){
        request(`https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${id}&key=${this.youtubeApiKey}`, { json: true }, (err, res, body) => {
          if (err) { return console.log(err); }
          const duration = this.youtubeDurationToTime(body['items'][0]['contentDetails']['duration']);
          const youtubeMessage = `[YT] ${body['items'][0]['snippet']['title']} [${duration}]`;
          this.ircClient.say(this.ircMessage.toChannel, youtubeMessage);
          this.database.Log(this.ircConfig.botName, this.ircMessage.toChannel, youtubeMessage)
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

  private readonly ircMessage: IrcMessage;
  private readonly database: IDataPersistence;

  constructor(ircMessage: IrcMessage, database: IDataPersistence) {

    this.ircMessage = ircMessage;
    this.database = database;
  }

  execute(): void {
    this.database.Log(this.ircMessage.fromUser, this.ircMessage.toChannel, this.ircMessage.message)
  }
}
