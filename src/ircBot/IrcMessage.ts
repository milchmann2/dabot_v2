export class IrcMessage {

  constructor(
    public readonly fromUser: string,
    public readonly toChannel: string,
    public readonly message: string)
  {
  }
}
