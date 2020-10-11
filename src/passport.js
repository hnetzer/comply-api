import passport from 'passport';
import bcrypt from 'bcrypt';

const LocalStrategy = require('passport-local').Strategy;
const PassportJWT = require('passport-jwt');
const JWTStrategy = PassportJWT.Strategy;
const ExtractJWT = PassportJWT.ExtractJwt;
const GoogleTokenStrategy = require('passport-google-id-token');


import models from './models';
const { User, UserSetting, Company } = models;

const JWT_SECRET = process.env.JWT_SECRET
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID

// Setup Passport
let localStrategy = new LocalStrategy(async (username, password, done) => {
  let user;
    try {
      user = await User.findOne({ where: { email: username } })
      if (!user) {
        return done(null, false, { message: 'No user by that email'});
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
    const user = await User.findOne({ where: { id: jwtPayload.id } });
    if (!user) {
      return done(null, false, { message: 'Token error'});
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});


const googleSettings = { clientID: GOOGLE_CLIENT_ID }
const googleStrategy = new GoogleTokenStrategy(googleSettings, async (parsedToken, googleId, done) => {
    try {
      console.log('parsedToken', parsedToken)
      const user = await User.findOne({ google_id: googleId })
      if (!user) {
        return done(null, false, { message: 'No user with that Google ID'});
      }
    } catch (err) {
      return done(err);
    }
  }
)


passport.use(localStrategy);
passport.use(jwtStrategy);
passport.use(googleStrategy);
