import passport from 'passport';
import passportJWT from 'passport-jwt';
import serviceUser from '../service/serviceUser.js';
import dotenv from 'dotenv';

dotenv.config();
const secret = process.env.TOKEN_SECRET;

const ExtractJWT = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;

const params = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(params, function (payload, done) {

    serviceUser
      .findUserById(payload.id)
      .then((user) => {

        if (!user) {
          return done(new Error('User not found'));
        }

        const currentTimestamp = Date.now() / 1000;
        if (payload.exp < currentTimestamp) {
          return done(null, false, { message: 'Token has expired' });
        }

        return done(null, user);
      })
      .catch(error => {
        console.log(error);
        done(error);
      });
  })
);
