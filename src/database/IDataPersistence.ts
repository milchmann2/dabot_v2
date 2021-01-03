

export interface IDataPersistence {

  Log(fromUser: string, toChannel: string, message: string): void;
  Get(callback: any): void;
  AddUser(user: string, alias: string, callback: any): void;
}
