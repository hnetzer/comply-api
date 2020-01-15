import passport from 'passport';
const LocalStrategy = require('passport-local').Strategy;

import models from './models';
const { User } = models;

// Setup Passport
let strategy = new LocalStrategy(async (username, password, done) => {
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

passport.use(strategy);
