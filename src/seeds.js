import models from './models';

const {
  Jurisdiction,
  Company,
  CompanyJurisdiction,
  Agency,
  Filing
} = models;

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
    companyId: company.id,
    jurisdictionId: jurisdiction.id,
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

const createAgency = async (name, jurisdictionName) => {
  const jurisdiction = await Jurisdiction.findOne({ where: { name: jurisdictionName }, raw: true })

  await Agency.create({
    name: name,
    jurisdiction_id: jurisdiction.id
  })
}

const seedAgencies = async () => {
  await createAgency('internal revenue service', 'Federal')
  await createAgency('secretary of state', 'Delaware')
  await createAgency('franchise tax board', 'California')
  await createAgency('secretary of state', 'California')
  await createAgency('assessor', 'San Francisco County')
  await createAgency('tax and treasurer', 'San Francisco')
  await createAgency('assessor', 'Los Angeles County')
  await createAgency('office of finance', 'Los Angeles')
  await createAgency('secretary of state', 'New York')
  await createAgency('department of finance', 'New York City')
  await createAgency('department of taxation and finance', 'New York')
}

const createFiling = async (f, agencyName, jurisdictionName) => {
  const jurisdiction = await Jurisdiction.findOne({ where: { name: jurisdictionName }, raw: true })
  const agency = await Agency.findOne({ where: { name: agencyName, jurisdiction_id: jurisdiction.id }, raw: true })

  await Filing.create({
    name: f.name,
    agency_id: agency.id,
    due_date: f.dueDate,
    due_date_year_end_offset_months: f.dueDateYearEndOffsetMonths,
    due_date_reg_offset_months: f.dueDateRegOffestMonths
  })
}

const seedFilings = async () => {
  await createFiling({
    name: 'form 1120',
    dueDate: null,
    dueDateYearEndOffsetMonths: 3.5,
    dueDateRegOffestMonths: null
  }, 'internal revenue service', 'Federal')

  await createFiling({
    name: 'form 1099',
    dueDate: '2020-01-31',
    dueDateYearEndOffsetMonths: null,
    dueDateRegOffestMonths: null,
  }, 'internal revenue service', 'Federal')

  await createFiling({
    name: 'form 3921',
    dueDate: '2020-01-31',
    dueDateYearEndOffsetMonths: null,
    dueDateRegOffestMonths: null,
  }, 'internal revenue service', 'Federal')

  await createFiling({
    name: 'form 1120-w',
    dueDate: null,
    dueDateYearEndOffsetMonths: 3.5,
    dueDateRegOffestMonths: null,
  }, 'internal revenue service', 'Federal')

  await createFiling({
    name: 'form 1120-w',
    dueDate: null,
    dueDateYearEndOffsetMonths: 5.5,
    dueDateRegOffestMonths: null,
  }, 'internal revenue service', 'Federal')

  await createFiling({
    name: 'form 1120-w',
    dueDate: null,
    dueDateYearEndOffsetMonths: 8.5,
    dueDateRegOffestMonths: null,
  }, 'internal revenue service', 'Federal')

  await createFiling({
    name: 'form 1120-w',
    dueDate: null,
    dueDateYearEndOffsetMonths: 11.5,
    dueDateRegOffestMonths: null,
  }, 'internal revenue service', 'Federal')

  await createFiling({
    name: 'form 114',
    dueDate: '2020-04-15',
    dueDateYearEndOffsetMonths: null,
    dueDateRegOffestMonths: null,
  }, 'internal revenue service', 'Federal')

  await createFiling({
    name: 'annual report',
    dueDate: '2020-03-01',
    dueDateYearEndOffsetMonths: null,
    dueDateRegOffestMonths: null,
  }, 'secretary of state', 'Delaware')

  await createFiling({
    name: 'statement of information',
    dueDate: null,
    dueDateYearEndOffsetMonths: null,
    dueDateRegOffestMonths: 12,
  }, 'secretary of state', 'California')

  await createFiling({
    name: 'form 100',
    dueDate: null,
    dueDateYearEndOffsetMonths: 3.5,
    dueDateRegOffestMonths: null,
  }, 'franchise tax board', 'California')

  await createFiling({
    name: 'form 100-ES',
    dueDate: null,
    dueDateYearEndOffsetMonths: 5.5,
    dueDateRegOffestMonths: null,
  }, 'franchise tax board', 'California')

  await createFiling({
    name: 'form 100-ES',
    dueDate: null,
    dueDateYearEndOffsetMonths: 8.5,
    dueDateRegOffestMonths: null,
  }, 'franchise tax board', 'California')

  await createFiling({
    name: 'form 571-L',
    dueDate: '2020-05-01',
    dueDateYearEndOffsetMonths: null,
    dueDateRegOffestMonths: null,
  }, 'assessor', 'San Francisco County')

  await createFiling({
    name: 'Business License',
    dueDate: '2020-05-31',
    dueDateYearEndOffsetMonths: null,
    dueDateRegOffestMonths: null,
  }, 'tax and treasurer', 'San Francisco')

  await createFiling({
    name: 'Payroll Tax',
    dueDate: '2020-02-28',
    dueDateYearEndOffsetMonths: null,
    dueDateRegOffestMonths: null,
  }, 'tax and treasurer', 'San Francisco')

  await createFiling({
    name: 'Payroll Tax Estimate',
    dueDate: '2020-04-30',
    dueDateYearEndOffsetMonths: null,
    dueDateRegOffestMonths: null,
  }, 'tax and treasurer', 'San Francisco')

  await createFiling({
    name: 'Payroll Tax Estimate',
    dueDate: '2020-07-31',
    dueDateYearEndOffsetMonths: null,
    dueDateRegOffestMonths: null,
  }, 'tax and treasurer', 'San Francisco')

  await createFiling({
    name: 'Payroll Tax Estimate',
    dueDate: '2020-10-31',
    dueDateYearEndOffsetMonths: null,
    dueDateRegOffestMonths: null,
  }, 'tax and treasurer', 'San Francisco')

  await createFiling({
    name: 'franchise tax estimate',
    dueDate: '2020-06-01',
    dueDateYearEndOffsetMonths: null,
    dueDateRegOffestMonths: null,
  }, 'secretary of state', 'Delaware')

  await createFiling({
    name: 'franchise tax estimate',
    dueDate: '2020-09-01',
    dueDateYearEndOffsetMonths: null,
    dueDateRegOffestMonths: null,
  }, 'secretary of state', 'Delaware')

  await createFiling({
    name: 'franchise tax estimate',
    dueDate: '2020-12-01',
    dueDateYearEndOffsetMonths: null,
    dueDateRegOffestMonths: null,
  }, 'secretary of state', 'Delaware')

  await createFiling({
    name: 'form 571-L',
    dueDate: '2020-05-01',
    dueDateYearEndOffsetMonths: null,
    dueDateRegOffestMonths: null,
  }, 'assessor', 'Los Angeles County')

  await createFiling({
    name: 'business license',
    dueDate: '2020-02-28',
    dueDateYearEndOffsetMonths: null,
    dueDateRegOffestMonths: null,
  }, 'office of finance', 'Los Angeles')

  await createFiling({
    name: 'biennial statement',
    dueDate: null,
    dueDateYearEndOffsetMonths: null,
    dueDateRegOffestMonths: 24,
  }, 'secretary of state', 'New York')

  await createFiling({
    name: 'NYC-3',
    dueDate: null,
    dueDateYearEndOffsetMonths: 3.5,
    dueDateRegOffestMonths: null,
  }, 'department of finance', 'New York City')

  await createFiling({
    name: 'mandatory first installment',
    dueDate: null,
    dueDateYearEndOffsetMonths: 2.5,
    dueDateRegOffestMonths: 0,
  }, 'department of taxation and finance', 'New York')

  await createFiling({
    name: 'CT-3 extension',
    dueDate: null,
    dueDateYearEndOffsetMonths: 3.5,
    dueDateRegOffestMonths: 0,
  }, 'department of taxation and finance', 'New York')

  await createFiling({
    name: 'CT-3',
    dueDate: null,
    dueDateYearEndOffsetMonths: 3.5,
    dueDateRegOffestMonths: 0,
  }, 'department of taxation and finance', 'New York')

  await createFiling({
    name: 'NYC-3 estimate',
    dueDate: null,
    dueDateYearEndOffsetMonths: 3.5,
    dueDateRegOffestMonths: 0,
  }, 'department of finance', 'New York City')

  await createFiling({
    name: 'CT-400 estimate',
    dueDate: null,
    dueDateYearEndOffsetMonths: 5.5,
    dueDateRegOffestMonths: 0,
  }, 'department of taxation and finance', 'New York')

  await createFiling({
    name: 'CT-400 estimate',
    dueDate: null,
    dueDateYearEndOffsetMonths: 8.5,
    dueDateRegOffestMonths: 0,
  }, 'department of taxation and finance', 'New York')

  await createFiling({
    name: 'CT-400 estimate',
    dueDate: null,
    dueDateYearEndOffsetMonths: 11.5,
    dueDateRegOffestMonths: 0,
  }, 'department of taxation and finance', 'New York')
}

export {
  seedJurisdictions,
  seedCompanies,
  seedCompanyJurisdictions,
  seedAgencies,
  seedFilings
}
