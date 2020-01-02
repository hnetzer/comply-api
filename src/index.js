import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import models, { sequelize } from './models';
import {
  seedJurisdictions,
  seedCompanies,
  seedCompanyJurisdictions,
  seedAgencies,
  seedFilings
} from './seeds'

const eraseDatabaseOnSync = true;

console.log('Hello Comply!');
console.log('Starting up application...')

const { Jurisdiction, Company, CompanyJurisdiction, Agency, Filing } = models;

const countSeeds = () => {
  Jurisdiction.count().then(c => {
    console.log("There are " + c + " jurisdictions!")
  })
  Company.count().then(c => {
    console.log("There are " + c + " companies!")
  })
  CompanyJurisdiction.count().then(c => {
    console.log("There are " + c + " companies jurisdictions!")
  })
  Agency.count().then(c => {
    console.log("There are " + c + " agencies!")
  })
  Filing.count().then(c => {
    console.log("There are " + c + " filings!")
  })
}

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    await seedJurisdictions();
    await seedCompanies();
    await seedCompanyJurisdictions();
    await seedAgencies();
    await seedFilings();
    countSeeds();
  }
});

const app = express();

app.use(cors());
app.get('/filings', async (req, res) => {
  const companyId = 2;
  const company = await Company.findOne({ where: { id: companyId } });

  // Jurisdictions
  const jurisdictions = await company.getJurisdictions({ raw: true })
    .map(j => ({ name: j.name, id: j.id, reg: j['company_jurisdiction.registration'] }));
  console.log(jurisdictions)

  // Agencies
  const agencies = await Agency.findAllForJurisdictionIds({ ids: jurisdictions.map(j => j.id) })
  console.log(agencies)

  // Filings
  const filings = await Filing.findAllForAgencyIds({ ids: agencies.map(a => a.id) })
  filings.forEach(f => console.log(f.get({ plain: true })))
  //console.log(filings)


  res.send('Hello World!');
});

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
);
