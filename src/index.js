import 'dotenv/config';
import "@babel/polyfill";
import "./passport"
import express from 'express';
import bodyParser from 'body-parser'
import cors from 'cors';
import passport from 'passport';

import models, { sequelize } from './models';

// Controllers
import { getFiling } from './controllers/filingController';
import { createUser, signup, login } from './controllers/accountController';
import { getAgenciesForCompany } from './controllers/agenciesController';
import { sendFeedback } from './controllers/feedbackController';

// Routers
import CompanyRouter from './routes/companyRouter';
import UsersRouter from './routes/usersRouter';
import FilingsRouter from './routes/filingsRouter';
import AdminRouter from './routes/adminRouter';

// Epress server
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(passport.initialize());
app.use(cors());

// Routes
app.post('/users', createUser);
app.put('/users/:userId', signup);
app.post('/login', passport.authenticate('local', { session: false }), login);
app.get('/agencies', passport.authenticate('jwt', { session: false }), getAgenciesForCompany);
app.post('/feedback', passport.authenticate('jwt', { session: false }), sendFeedback);
app.get('/status', (req, res) => res.json({ status: "we good" }));


app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
);

// I think this should probably return our JWT token?
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => { res.redirect('/'); }
);


// Set other routers
FilingsRouter(app);
UsersRouter(app);
CompanyRouter(app);
AdminRouter(app);

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
);
