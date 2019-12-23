import 'dotenv/config';
import models, { sequelize } from './models';
import {
  seedJurisdictions,
  seedCompanies
} from './seeds'

const eraseDatabaseOnSync = true;

console.log('Hello Comply!');
console.log('Starting up application...')

const { Jurisdiction, Company } = models;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    await seedJurisdictions();
    await seedCompanies();
  }

  Jurisdiction.count().then(c => {
    console.log("There are " + c + " jurisdictions!")
  })

  Company.count().then(c => {
    console.log("There are " + c + " companies!")
  })
});
