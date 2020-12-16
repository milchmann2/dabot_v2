

export interface IDataPersistence {

  Log(fromUser: string, toChannel: string, message: string): void;
  Get(callback: any): void;
}
