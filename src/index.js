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
import { createAccount, login, checkEmail } from './controllers/accountController';
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
app.post('/signup', (req, res, next) => { req.user = req.body; next(); },  createAccount);
app.post('/signup/google', passport.authenticate('google-signup', { session: false }), createAccount);
app.get('/signup/:email', checkEmail)

app.post('/login', passport.authenticate('local', { session: false }), login);
app.post('/login/google', passport.authenticate('google-login', { session: false }), login);

app.get('/agencies', passport.authenticate('jwt', { session: false }), getAgenciesForCompany);
app.post('/feedback', passport.authenticate('jwt', { session: false }), sendFeedback);
app.get('/status', (req, res) => res.json({ status: "we good" }));


// Set other routers
FilingsRouter(app);
UsersRouter(app);
CompanyRouter(app);
AdminRouter(app);

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
);
