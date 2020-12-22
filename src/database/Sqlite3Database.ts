import { IDataPersistence } from './IDataPersistence';
import * as Sqlite3 from 'sqlite3';

export class Sqlite3Database implements IDataPersistence{

  private readonly db: Sqlite3.Database;

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
    const sql = `SELECT * FROM Logs WHERE datetime_text >= datetime('now', '-1 days')`;
    this.db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      callback(rows);
    });
  }

  public Log(fromUser: string, toChannel: string, message: string): void {
    const datetime = new Date().toISOString().split('T');
    const millisecondIdx = datetime[1].lastIndexOf('.');
    const utcTime = `${datetime[0]} ${datetime[1].substring(0, millisecondIdx)}`;
    this.db.run(`INSERT INTO Logs(datetime_text, user, message) VALUES(?, ?, ?)`, [utcTime, fromUser, message], function(err) {
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
