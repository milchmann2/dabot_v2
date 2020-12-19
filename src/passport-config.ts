import { Strategy as LocalStrategy } from 'passport-local';
import * as bcrypt from 'bcrypt';
import { PassportStatic } from 'passport';

function initialize(passport: PassportStatic, secrets: any): void {
  const authenticateUser = async (user, password, done) => {
    try {
      if (await bcrypt.compare(password, secrets.password)){
        return done(null, secrets.password);
      } else {
        done(null, false, {message: "wrong pw"});
      }
    } catch (e) {
      return done(e);
    }
  }
  passport.use(new LocalStrategy({ usernameField: "password" }, authenticateUser));

  passport.serializeUser((user, done) => {
   done(null, user);
 })
 passport.deserializeUser((id, done) => {
     return done(null, id);
 })
}

export { initialize as initializePassport };
