import 'dotenv/config';
import models, { sequelize } from './models';

const {
  Jurisdiction,
  Company,
  CompanyJurisdiction,
  Agency,
  Filing,
  Office,
  User
} = models;

const seedJurisdictions = async () => {
  await Jurisdiction.bulkCreate([
    { name: 'Delaware', state: 'Delaware', type: 'state'},
    { name: 'California', state: 'California', type: 'state' },
    { name: 'San Francisco County', state: 'California', type: 'county' },
    { name: 'San Francisco', state: 'California', type: 'city' },
    { name: 'Federal', state: null, type: 'federal' },
    { name: 'Los Angeles County', state: 'California', type: 'county' },
    { name: 'Los Angeles', state: 'California', type: 'city' },
    { name: 'New York', state: 'New York', type: 'state' },
    { name: 'New York City', state: 'New York', type: 'state' }
  ]);;
}

// TODO: dates come from moment, use moment js
const seedCompanies = async () => {
  await Company.bulkCreate([
    { name: 'Company A', year_end_month: 11, year_end_day: 31, type: 'Corporation', tax_class: 'C Corp', phone: '4125510569' },
    { name: 'Company B', year_end_month: 5, year_end_day: 30, type: 'Corporation', tax_class: 'C Corp', phone: '4125510569' },
    { name: 'Company C', year_end_month: 11, year_end_day: 31, type: 'Corporation', tax_class: 'C Corp', phone: '4125510569' },
  ])
}

const createOffice = async (companyName, { address, city, state, zip }) => {
  const company = await Company.findOne({ where: { name: companyName }, raw: true });
  await Office.create({
    companyId: company.id,
    address: address,
    city: city,
    state: state,
    zip: zip
  })
}

const seedOffices = async () => {
  const sfOffice = { address: '1601 Mission St. #800', city: 'Oakland', state: 'California', zip: '94110' }
  const nyOffice = { address: '320 W 37th St.', city: 'New York', state: 'New York', zip: '10018' }
  const laOffice = { address: '1901 Avenue of the Stars #2000', city: 'Los Angeles', state: 'California', zip: '90067' }

  await createOffice('Company A', sfOffice)
  await createOffice('Company B', laOffice)
  await createOffice('Company C', sfOffice)
  await createOffice('Company C', nyOffice)
}

const createCompanyJurisdiction = async (companyName, jurisdictionName) => {
  const company = await Company.findOne({ where: { name: companyName }, raw: true });
  const jurisdiction = await Jurisdiction.findOne({ where: { name: jurisdictionName }, raw: true })

  await CompanyJurisdiction.create({
    companyId: company.id,
    jurisdictionId: jurisdiction.id
  })
}

const seedCompanyJurisdictions = async () => {
  // Company A
  await createCompanyJurisdiction('Company A', 'Federal')
  await createCompanyJurisdiction('Company A', 'California')
  await createCompanyJurisdiction('Company A', 'San Francisco County')
  await createCompanyJurisdiction('Company A', 'San Francisco')
  await createCompanyJurisdiction('Company A', 'Delaware')

  // Company B
  await createCompanyJurisdiction('Company B', 'Federal')
  await createCompanyJurisdiction('Company B', 'California')
  await createCompanyJurisdiction('Company B', 'Los Angeles')
  await createCompanyJurisdiction('Company B', 'Los Angeles County')
  await createCompanyJurisdiction('Company B', 'Delaware')

  // Company C
  await createCompanyJurisdiction('Company C', 'Federal')
  await createCompanyJurisdiction('Company C', 'California')
  await createCompanyJurisdiction('Company C', 'San Francisco')
  await createCompanyJurisdiction('Company C', 'San Francisco County')
  await createCompanyJurisdiction('Company C', 'Delaware')
  await createCompanyJurisdiction('Company C', 'New York')
  await createCompanyJurisdiction('Company C', 'New York City')
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

const createUser = async (companyName, { name, title, email, password, roles, permissions}) => {
  let companyId = null
  if (companyName) {
    const company = await Company.findOne({ where: { name: companyName }, raw: true });
    companyId = company.id
  }

  await User.create({
    company_id: companyId,
    name: name,
    title: title,
    email: email,
    password: password,
    roles: roles,
    permissions: permissions
  })

}

const seedUsers = async () => {
  await createUser('Company A', {
    name: 'Finance Guy',
    title: 'CFO',
    email: 'test_a@corp.com',
    password: 'test',
    roles: [ 'client' ],
    permissions: [],
  })

  await createUser('Company B', {
    name: 'Ops Person',
    title: 'Administrator',
    email: 'test_b@corp.com',
    password: 'test',
    roles: [ 'client' ],
    permissions: [],
  })

  await createUser('Company C', {
    name: 'CEO Person',
    title: 'CEO',
    email: 'test_c@corp.com',
    password: 'test',
    roles: [ 'client' ],
    permissions: [],
  })

  await createUser(null, {
    name: 'Admin Account',
    title: 'admin',
    email: 'admin@comply.co',
    password: 'test',
    roles: [ 'admin' ],
    permissions: [],
  })
}

const countSeeds = () => {
  Jurisdiction.count().then(c => {
    console.log("There are " + c + " jurisdictions!")
  })
  Company.count().then(c => {
    console.log("There are " + c + " companies!")
  })
  Office.count().then(c => {
    console.log("There are " + c + " offices!")
  })
  User.count().then(c => {
    console.log("There are " + c + " users!")
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

const seedData = async () => {
  await seedJurisdictions();
  await seedCompanies();
  await seedOffices();
  await seedUsers();
  await seedCompanyJurisdictions();
  await seedAgencies();
  await seedFilings();
}

const DROP_TABLES_IF_EXIST = true;

// entrypoint
const start = async () => {
  await seedData();
  countSeeds();
}

start()
