import * as irc from 'irc';
import { IDataPersistence } from '../database/IDataPersistence';
import getYouTubeID from 'get-youtube-id';
import request = require('request');


export interface IIrcClient {
  connect(): boolean;
}

export class IrcConfig {
  constructor(public botName: string, public server: string, public channel: string)
  {
  }
}

export class IrcClient implements IIrcClient {
  client: irc.Client;
  config: IrcConfig;
  db: IDataPersistence;
  api_key: string;

  constructor(config: IrcConfig, db: IDataPersistence){
    this.config = config;
    this.db = db;

    const secrets: {[key: string]: any} = require('../../password.json');
    this.api_key = secrets.api_key;
  }

  public connect(): boolean {
    this.client = new irc.Client(this.config.server, this.config.botName, {
      channels: [this.config.channel]
    });

    this.addListeners();

    return true;
  }

  private addListeners(): void {
    this.client.addListener("message", (fromUser: string, toChannel: string, message: string, _) => {
      fromUser = fromUser.toLowerCase();

      // TODO temporary
      if (message === '!logs'){
        this.client.say(toChannel, "http://108.61.178.189:4121/");
      }

      const urlExpression = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
      const matches = message.match(urlExpression) || [];
      matches.forEach(url => {
        const id = getYouTubeID(url, { fuzzy: false });
        //console.log('id', id);
        if (id !== null){
          request(`https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${id}&key=${this.api_key}`, { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            const duration = this.youtubeDurationToTime(body['items'][0]['contentDetails']['duration']);
            const youtubeMessage = `[YT] ${body['items'][0]['snippet']['title']} [${duration}]`;
            this.client.say(toChannel, youtubeMessage);
            console.log(body['items'][0]['snippet']['title']);
          });
        }
      });


      // check notes for user
      // create message
        // can be command or normal message
      // process message
      this.db.Log(fromUser, toChannel, message)
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
