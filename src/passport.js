import passport from 'passport';
const LocalStrategy = require('passport-local').Strategy;
const PassportJWT = require('passport-jwt');
const JWTStrategy = PassportJWT.Strategy;
const ExtractJWT = PassportJWT.ExtractJwt;

import models from './models';
const { User } = models;

// Setup Passport
let localStrategy = new LocalStrategy(async (username, password, done) => {
  let user;
    try {
      user = await User.findOne({ where: { email: username }, raw: true })
      if (!user) {
        return done(null, false, {message: 'No user by that email'});
      }
    } catch (e) {
      return done(e);
    }

    // TODO: update this to check hashed passwords
    if (user.password != password) {
      return done(null, false, { message: 'Incorrect password.' });
    }

    return done(null, user);
});


const settings = { jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), secretOrKey: 'your_jwt_secret'}
let jwtStrategy = new JWTStrategy(settings, async (jwtPayload, cb) => {
  console.log('inside the JWT strategy')
  console.log(jwtPayload)
  let user;
  try {
    user = await User.findOneById(jwtPayload.id)
    return cb(null, user);
  } catch (err) {
    return cb(err);
  }
});

passport.use(localStrategy);
passport.use(jwtStrategy);
