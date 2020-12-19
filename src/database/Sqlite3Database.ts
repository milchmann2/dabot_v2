import { IDataPersistence } from './IDataPersistence';
import * as Sqlite3 from 'sqlite3';

export class Sqlite3Database implements IDataPersistence{

  db: Sqlite3.Database;

  constructor() {
    // in memory db: ':memory:'
    this.db = new (Sqlite3.verbose()).Database('./logs.db', (err) => {
      if (err) {
        return console.error(err.message);
      }

      console.log('Connected to SQlite database logs.db.');

      this.db.run('CREATE TABLE IF NOT EXISTS Logs(datetime_text text, user text, message text)');
    });

  }

  public Get(callback: any): void {
    const sql = `SELECT * FROM Logs`;
    this.db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      callback(rows);
    });
  }

  public Log(fromUser: string, toChannel: string, message: string): void {
    this.db.run(`INSERT INTO Logs(datetime_text, user, message) VALUES(?, ?, ?)`, [(new Date().toUTCString()), fromUser, message], function(err) {
      if (err) {
        return console.log(err.message);
      }
      // get the last insert id
      //console.log(`Rowid ${this.lastID}: ${fromUser} - ${message}`);
    });
  }

}

// db.close((err) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log('Database connection closed.');
// })
