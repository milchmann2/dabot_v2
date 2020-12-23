import { IDataPersistence } from './database/IDataPersistence';
import { Sqlite3Database } from './database/Sqlite3Database';
import { IIrcClient, IrcClient, IrcConfig } from './ircBot/ircClient';
import { IWebServer, WebServer } from './server';
import * as fs from 'fs';

try{
  startServer();

}
catch (e){
  console.log(e);
}

function startServer() {
  if (process.argv.length < 3) {
    console.log("Not enough parameters. Config file missing!");
  }

  const configPath = "./" + process.argv[2];
  const config = getConfig(configPath);
  if (config == null){
    return;
  }

  const database: IDataPersistence = new Sqlite3Database();
  const ircClient: IIrcClient = new IrcClient(config, database);
  const webServer: IWebServer = new WebServer(database);

  ircClient.connect();
  console.log("irc connected")
  webServer.startServer();
  console.log("webserver connected")
}

function getConfig (configPath) {
  if (fs.existsSync(configPath)) {
    console.log("Config found. Starting IRC Client.");
    const jsonConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    return new IrcConfig(jsonConfig["botName"], jsonConfig["server"], jsonConfig["channel"]);
  } else {
    console.log("Config file does not exist!");
    return null;
  }
}



