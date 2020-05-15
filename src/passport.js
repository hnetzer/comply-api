import passport from 'passport';
import bcrypt from 'bcrypt';

const LocalStrategy = require('passport-local').Strategy;
const PassportJWT = require('passport-jwt');
const JWTStrategy = PassportJWT.Strategy;
const ExtractJWT = PassportJWT.ExtractJwt;

import models from './models';
const { User } = models;

const JWT_SECRET = process.env.JWT_SECRET

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
    // TODO: update this to check hashed passwords
    if (!match) {
      return done(null, false, { message: 'Incorrect password.' });
    }

    return done(null, user.get({ plain: true }));
});


const settings = { jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), secretOrKey: JWT_SECRET }
let jwtStrategy = new JWTStrategy(settings, async (jwtPayload, done) => {
  let user;
  try {
    user = await User.findOne({ where: { id: jwtPayload.id }, raw: true });

    // TODO: Do we need to check anything here?
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

passport.use(localStrategy);
passport.use(jwtStrategy);
