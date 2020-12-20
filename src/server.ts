import express = require('express');
import flash = require('express-flash');
import session = require('express-session');
import passport = require("passport");
import * as bcrypt from 'bcrypt';
import { initializePassport } from './passport-config';
import { IDataPersistence } from './database/IDataPersistence';

export interface IWebServer {
  startServer(): void;
}

export class WebServer implements IWebServer {

  app: express.Express;
  port: number;
  database: IDataPersistence;

  constructor (database: IDataPersistence) {
    this.database = database;

    this.app = express();
    this.port = 4121;//Number(process.env.PORT) || 4000;
    // check if this works

    const secrets: {[key: string]: any} = require('../password.json');
    initializePassport(passport, secrets);

    this.app.set('view-engine', 'ejs')
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(flash());
    this.app.use(session({
      secret: secrets.session_secret,
      resave: false,
      saveUninitialized: false
    }));
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.app.get('/', this.checkNotAuthenticated, (req, res) => {
      res.render('login.ejs');
    });

    this.app.post('/', this.checkNotAuthenticated, passport.authenticate('local', {
      successRedirect: '/logs',
      failureRedirect: '/',
      failureFlash: true
    }));

    this.app.get('/logs', this.checkAuthenticated, (req, res) => {
      this.database.Get((rows) => {
        const logs: any[] = [];
        rows.forEach(x => {
          logs.push({datetime: x.datetime_text, user: x.user, message: x.message});
        });

        res.render('logs.ejs', { messages: logs });
      });
    })

    this.app.delete('/logout', (req, res) => {
      req.logOut();
      res.redirect('/');
    })
  }

  public startServer(): void {
    this.app.listen(this.port, () => {
      console.log(`Server is running in http://localhost: ${this.port}`)
    });
  }

  private checkAuthenticated(req, res, next) {
    console.log('checkauth')
    if (req.isAuthenticated()) {
      console.log('checkauth is')
      return next();
    }
    console.log('checkauth is not')
    res.redirect('/');
  }

  private checkNotAuthenticated(req, res, next) {
    console.log('checknot')
    if (req.isAuthenticated()) {
      console.log('checknot is')
      return res.redirect('/logs');
    }
    console.log('checknot is not')
    next();
  }
}

// npm install localtunnel -g
// start webserver
// lt --port 3000 --subdomain yoursubdomain
