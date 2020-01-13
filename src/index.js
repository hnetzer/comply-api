import 'dotenv/config';
import "@babel/polyfill";
import express from 'express';
import bodyParser from 'body-parser'
import cors from 'cors';
import models, { sequelize } from './models';
import { seedData, countSeeds } from './seeds';

// Controllers
import { getFilings } from './controllers/filingController'
import { createAccount } from './controllers/accountController'

const eraseDatabaseOnSync = true;

console.log('Hello Comply!');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(cors());

// paths
app.get('/filings', getFilings);
app.post('/account', createAccount);
app.get('/status', async (req, res) => {
  res.json({
    status: "we good",
  });
});

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    await seedData();
    countSeeds();
  }

  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`),
  );
});
