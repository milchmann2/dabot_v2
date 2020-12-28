import { IDataPersistence } from './database/IDataPersistence';
import { Sqlite3Database } from './database/Sqlite3Database';
import { IrcClient, IrcConfig } from './ircBot/ircClient';
import { IWebServer, WebServer } from './server';
import * as fs from 'fs';
import { CommandsController } from './ircBot/CommandsController';

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

  const configPath = "./" + process.argv[2]; //+ 'config.json';
  //const configPath = "./" + 'config.json'
  const config = getConfig(configPath);
  if (config == null){
    return;
  }

  const database: IDataPersistence = new Sqlite3Database();
  const ircClient: IrcClient = new IrcClient(config);
  const webServer: IWebServer = new WebServer(database);
  const secrets: {[key: string]: any} = require('../password.json');
  const api_key = secrets.api_key;
  const commandsController = new CommandsController(database, ircClient, config, api_key);

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



