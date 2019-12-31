import 'dotenv/config';
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

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    await seedJurisdictions();
    await seedCompanies();
    await seedCompanyJurisdictions();
    await seedAgencies();
    await seedFilings();
  }

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
});
