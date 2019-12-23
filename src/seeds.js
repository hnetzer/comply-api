import models from './models';

const { Jurisdiction, Company } = models;

const seedJurisdictions = async () => {
  await Jurisdiction.bulkCreate([
    { name: 'delaware' },
    { name: 'california' },
    { name: 'san francisco county' },
    { name: 'san francisco' },
    { name: 'federal' },
    { name: 'los angeles county' },
    { name: 'los angeles' },
    { name: 'new york' },
    { name: 'new york city' }
  ]);;
}

// TODO: dates come from moment, use moment js
const seedCompanies = async () => {
  await Company.bulkCreate([
    { name: 'Company A', yearEnd: '2000-12-31' },
    { name: 'Company B', yearEnd: '2000-06-30' },
    { name: 'Company C', yearEnd: '2000-12-31' },
  ])
}

export {
  seedJurisdictions,
  seedCompanies
}
