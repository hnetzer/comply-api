import models from './models';

const { Jurisdiction, Company, CompanyJurisdiction } = models;

const seedJurisdictions = async () => {
  await Jurisdiction.bulkCreate([
    { name: 'Delaware' },
    { name: 'California' },
    { name: 'San Francisco County' },
    { name: 'San Francisco' },
    { name: 'Federal' },
    { name: 'Los Angeles County' },
    { name: 'Los Angeles' },
    { name: 'New York' },
    { name: 'New York City' }
  ]);;
}

// TODO: dates come from moment, use moment js
const seedCompanies = async () => {
  await Company.bulkCreate([
    { name: 'Company A', year_end: '2000-12-31' },
    { name: 'Company B', year_end: '2000-06-30' },
    { name: 'Company C', year_end: '2000-12-31' },
  ])
}


const createCompanyJurisdiction = async (companyName, jurisdictionName, reg) => {
  const company = await Company.findOne({ where: { name: companyName }, raw: true });
  const jurisdiction = await Jurisdiction.findOne({ where: { name: jurisdictionName }, raw: true })

  await CompanyJurisdiction.create({
    company_id: company.id,
    jurisdiction_id: jurisdiction.id,
    registration: reg
  })
}

const seedCompanyJurisdictions = async () => {
  // Company A
  await createCompanyJurisdiction('Company A', 'Federal')
  await createCompanyJurisdiction('Company A', 'California', '2019-06-01')
  await createCompanyJurisdiction('Company A', 'San Francisco County', '2019-07-01')
  await createCompanyJurisdiction('Company A', 'San Francisco', '2019-07-01')
  await createCompanyJurisdiction('Company A', 'Delaware', '2009-06-01')

  // Company B
  await createCompanyJurisdiction('Company B', 'Federal')
  await createCompanyJurisdiction('Company B', 'California', '2019-06-01')
  await createCompanyJurisdiction('Company B', 'Los Angeles', '2019-10-01')
  await createCompanyJurisdiction('Company B', 'Los Angeles County', '2019-10-14')
  await createCompanyJurisdiction('Company B', 'Delaware', '2009-05-06')

  // Company C
  await createCompanyJurisdiction('Company C', 'Federal')
  await createCompanyJurisdiction('Company C', 'California', '2019-02-01')
  await createCompanyJurisdiction('Company C', 'San Francisco', '2018-04-06')
  await createCompanyJurisdiction('Company C', 'San Francisco County', '2018-09-01')
  await createCompanyJurisdiction('Company C', 'Delaware', '2017-01-01')
  await createCompanyJurisdiction('Company C', 'New York', '2019-03-01')
  await createCompanyJurisdiction('Company C', 'New York City', '2019-05-01')
}


export {
  seedJurisdictions,
  seedCompanies,
  seedCompanyJurisdictions
}
