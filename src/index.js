import 'dotenv/config';
import "@babel/polyfill";
import "./passport"
import express from 'express';
import bodyParser from 'body-parser'
import cors from 'cors';
import passport from 'passport';

import models, { sequelize } from './models';
import { seedData, countSeeds } from './seeds';

// Controllers
import { getFilings } from './controllers/filingController'
import { createAccount } from './controllers/accountController'
import { updateCompany } from './controllers/companyController'

const eraseDatabaseOnSync = false;

// Epress server
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(passport.initialize());
app.use(cors());

// Routes
app.get('/filings', getFilings);
app.post('/account', createAccount);
app.put('/company', passport.authenticate('jwt', { session: false }), updateCompany);
app.get('/status', (req, res) => res.json({ status: "we good" }));


/*app.post('/login', async (req, res) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: 'An error occured',
        user: user
      });
    }

    req.login(user, { session: false }, err => {
      if (err) {
        res.send(err)
      }

      // now generate a signed json web token with the user object
      const token = jwt.sign(user, 'your_jwt_secret')
      return res.json({
        user: user,
        token: token
      });
    })(req, res);
  });
});*/


sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    await seedData();
    countSeeds();
  }

  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`),
  );
});
