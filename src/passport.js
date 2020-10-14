import passport from 'passport';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

const LocalStrategy = require('passport-local').Strategy;
const PassportJWT = require('passport-jwt');
const JWTStrategy = PassportJWT.Strategy;
const ExtractJWT = PassportJWT.ExtractJwt;
const GoogleTokenStrategy = require('passport-google-id-token');

import models from './models';
const { User, UserSetting, Company } = models;

const JWT_SECRET = process.env.JWT_SECRET
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID

let localStrategy = new LocalStrategy(async (username, password, done) => {
  let user;
    try {
      user = await User.findOne({ where: { email: username, password: { [Op.ne]: null } } })
      if (!user) {
        return done(null, false, { message: 'User not found with those credentials' });
      }
    } catch (e) {
      return done(e);
    }

    const match = await user.checkPassword(password);
    if (!match) {
      return done(null, false, { message: 'Incorrect password.' });
    }

    console.log('Successful login from', username)
    return done(null, user.get({ plain: true }));
});


const settings = { jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), secretOrKey: JWT_SECRET }
let jwtStrategy = new JWTStrategy(settings, async (jwtPayload, done) => {
  try {
    const user = await User.findOne({
      where: { id: jwtPayload.id },
      include: [
        { model: UserSetting, as: 'settings' },
        { model: Company, as: 'companies'}
      ]
    });

    if (!user) {
      return done(null, false, { message: 'Token error' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});


const googleSettings = { clientID: GOOGLE_CLIENT_ID }
const googleSignupStrategy = new GoogleTokenStrategy(googleSettings, async (parsedToken, googleId, done) => {
    try {
      const { payload } = parsedToken;
      const user = {
        email: payload.email,
        name: payload.name,
        first_name: payload.given_name,
        last_name: payload.family_name,
        google_id: googleId
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
)

const googleLoginStrategy = new GoogleTokenStrategy(googleSettings, async (parsedToken, googleId, done) => {
    try {
      const { payload } = parsedToken;
      const user = await User.findOne({
        where: { email: payload.email, google_id: googleId }
      });

      if (!user) {
        return done(null, false, { message: 'User not found with that Google account'});
      }

      console.log('Successful login from', payload.email)
      return done(null, user.get({ plain: true }));
    } catch (err) {
      return done(err);
    }
  }
)

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


passport.use(localStrategy);
passport.use(jwtStrategy);
passport.use('google-signup', googleSignupStrategy);
passport.use('google-login', googleLoginStrategy);
