import { ICommandsFactory } from "./CommandsFactory";
import { IrcClient } from "./ircClient";
import { IrcMessage } from "./IrcMessage";


export interface ICommandsController {
  process(ircMessage: IrcMessage): void;
}

export class CommandsController implements ICommandsController {

  private readonly commands: ICommandsFactory;

  constructor(commands: ICommandsFactory) {

    this.commands = commands;
  }

  public process(ircMessage: IrcMessage): void {

    this.commands.get('message').execute({
      'fromUser': ircMessage.fromUser,
      'toChannel': ircMessage.toChannel,
      'message': ircMessage.message
    });

    if (ircMessage.message === '!logs'){
      this.commands.get('logs').execute({
        'toChannel': ircMessage.toChannel
      });
    }

    const urlExpression = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
    const matches = ircMessage.message.match(urlExpression) || [];
    if (matches.length > 0){
      this.commands.get('youtube').execute({
        'links': matches,
        'toChannel': ircMessage.toChannel
      });
    }

    // check notes for user
    // create message
      // can be command or normal message
    // process message
  }

  public processUserActivity(ircMessage: IrcMessage): void {

    this.commands.get('userActivity').execute({
      'fromUser': ircMessage.fromUser,
      'toChannel': ircMessage.toChannel,
      'message': ircMessage.message
    });
  }
}
