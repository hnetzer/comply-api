import 'dotenv/config';
import "@babel/polyfill";
import "./passport"
import express from 'express';
import bodyParser from 'body-parser'
import cors from 'cors';
import passport from 'passport';

import models, { sequelize } from './models';

// Controllers
import { getFilings } from './controllers/filingController'
import { createAccount, login } from './controllers/accountController'
import { updateCompany, updateOffices } from './controllers/companyController'
import { getAgencies } from './controllers/agenciesController'

// Epress server
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(passport.initialize());
app.use(cors());

// Routes
app.get('/filings', getFilings);
app.get('/status', (req, res) => res.json({ status: "we good" }));

app.post('/account', createAccount);
app.post('/login', passport.authenticate('local', { session: false }), login);

// Company Routes
const companyRouter = express.Router();
companyRouter.use(passport.authenticate('jwt', { session: false }));
companyRouter.put('/:companyId', updateCompany);
companyRouter.put('/:companyId/offices', updateOffices);

app.use('/company', companyRouter);

app.get('/agencies', passport.authenticate('jwt', { session: false }), getAgencies)

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
);
