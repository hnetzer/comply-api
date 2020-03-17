import 'dotenv/config';
import models, { sequelize } from './models';

const {
  Jurisdiction,
  Company,
  CompanyJurisdiction,
  Agency,
  Filing,
  FilingDueDate,
  Office,
  User
} = models;

const seedJurisdictions = async () => {
  await Jurisdiction.bulkCreate([
    { name: 'Delaware', state: 'Delaware', type: 'state'},
    { name: 'California', state: 'California', type: 'state' },
    { name: 'San Francisco County', state: 'California', type: 'county' },
    { name: 'San Francisco', state: 'California', type: 'city' },
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
    company_id: company.id,
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
  await createCompanyJurisdiction('Company A', 'California')
  await createCompanyJurisdiction('Company A', 'San Francisco County')
  await createCompanyJurisdiction('Company A', 'San Francisco')
  await createCompanyJurisdiction('Company A', 'Delaware')

  // Company B
  await createCompanyJurisdiction('Company B', 'California')
  await createCompanyJurisdiction('Company B', 'Los Angeles')
  await createCompanyJurisdiction('Company B', 'Los Angeles County')
  await createCompanyJurisdiction('Company B', 'Delaware')

  // Company C
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
  await createAgency('Secretary of State', 'Delaware')
  await createAgency('Franchise Tax Board', 'California')
  await createAgency('Secretary of State', 'California')
  await createAgency('Assessor', 'San Francisco County')
  await createAgency('Tax and Treasurer', 'San Francisco')
  await createAgency('Assessor', 'Los Angeles County')
  await createAgency('Office of Finance', 'Los Angeles')
  await createAgency('Secretary of State', 'New York')
  await createAgency('Department of Finance', 'New York City')
  await createAgency('Department of Taxation and Finance', 'New York')
}

const createFiling = async ({ filing, agency, jurisdiction, due_dates }) => {
  const j = await Jurisdiction.findOne({ where: { name: jurisdiction }, raw: true });
  const a = await Agency.findOne({ where: { name: agency, jurisdiction_id: j.id }, raw: true });
  const result = await Filing.create({
    name: filing.name,
    occurrence: filing.occurrence,
    agency_id: a.id
  });

  const dates = due_dates.map(d => ({ ...d, filing_id: result.id }))
  await FilingDueDate.bulkCreate(dates)
}

const seedFilings = async () => {
  await createFiling({
    filing: { name: 'Annual Report', occurrence: 'annual'},
    agency: 'Secretary of State',
    jurisdiction: 'Delaware',
    due_dates: [
      { offset_type: 'none', fixed_month: 2, fixed_day: 1}
    ]
  })

  await createFiling({
    filing: { name: 'Statement of Information', occurrence: 'annual' },
    agency: 'Secretary of State',
    jurisdiction: 'California',
    due_dates: [
      { offset_type: 'registration', month_offset: 12 }
    ]
  })

  /*await createFiling({
    filing: { name: 'Form 100', occurrence: 'annual' },
    agency: 'Franchise Tax Board',
    jurisdiction: 'California',
    due_dates: [
      { offset_type: 'year-end', month_offset: 3, day_offset: '15' }
    ]
  })

  await createFiling({
    filing: { name: 'Form 100-ES', occurrence: 'multiple' },
    agency: 'Franchise Tax Board',
    jurisdiction: 'California',
    due_dates: [
      { offset_type: 'year-end', month_offset: 5, day_offset: '15' },
      { offset_type: 'year-end', month_offset: 8, day_offset: '15' },
    ]
  })*/

  await createFiling({
    filing: { name: 'Form 571-L', occurrence: 'annual' },
    agency: 'Assessor',
    jurisdiction: 'San Francisco County',
    due_dates: [
      { offset_type: 'none', fixed_month: 4, fixed_day: 1 }
    ]
  })

  await createFiling({
    filing: { name: 'Business License', occurrence: 'annual' },
    agency: 'Tax and Treasurer',
    jurisdiction: 'San Francisco',
    due_dates: [
      { offset_type: 'none', fixed_month: 4, fixed_day: 31 }
    ]
  })

  await createFiling({
    filing: { name: 'Payroll Tax', occurrence: 'annual' },
    agency: 'Tax and Treasurer',
    jurisdiction: 'San Francisco',
    due_dates: [
      { offset_type: 'none', fixed_month: 1, fixed_day: 28 }
    ]
  })

  await createFiling({
    filing: { name: 'Payroll Tax Estimate', occurrence: 'multiple' },
    agency: 'Tax and Treasurer',
    jurisdiction: 'San Francisco',
    due_dates: [
      { offset_type: 'none', fixed_month: 4, fixed_day: 28 },
      { offset_type: 'none', fixed_month: 6, fixed_day: 31 },
      { offset_type: 'none', fixed_month: 9, fixed_day: 31 },
    ]
  })

  await createFiling({
    filing: { name: 'Franchise Tax Estimate', occurrence: 'multiple' },
    agency: 'Secretary of State',
    jurisdiction: 'Delaware',
    due_dates: [
      { offset_type: 'none', fixed_month: 6, fixed_day: 1 },
      { offset_type: 'none', fixed_month: 9, fixed_day: 1 },
      { offset_type: 'none', fixed_month: 12, fixed_day: 1 },
    ]
  })

  await createFiling({
    filing: { name: 'Form 571-L', occurrence: 'annual' },
    agency: 'Assessor',
    jurisdiction: 'Los Angeles County',
    due_dates: [
      { offset_type: 'none', fixed_month: 4, fixed_day: 1 },
    ]
  })

  await createFiling({
    filing: { name: 'Business License', occurrence: 'annual' },
    agency: 'Office of Finance',
    jurisdiction: 'Los Angeles',
    due_dates: [
      { offset_type: 'none', fixed_month: 1, fixed_day: 28 },
    ]
  })

  await createFiling({
    filing: { name: 'Biennial Statement', occurrence: 'biennial' },
    agency: 'Secretary of State',
    jurisdiction: 'New York',
    due_dates: [
      { offset_type: 'registration', month_offset: 24 },
    ]
  })

  await createFiling({
    filing: { name: 'NYC-3', occurrence: 'annual' },
    agency: 'Department of Finance',
    jurisdiction: 'New York City',
    due_dates: [
      { offset_type: 'year-end', month_offset: 3, day_offset: '15' },
    ]
  })

  await createFiling({
    filing: { name: 'NYC-3', occurrence: 'annual' },
    agency: 'Department of Finance',
    jurisdiction: 'New York City',
    due_dates: [
      { offset_type: 'year-end', month_offset: 3, day_offset: '15' },
    ]
  })

  await createFiling({
    filing: { name: 'NYC-3', occurrence: 'annual' },
    agency: 'Department of Finance',
    jurisdiction: 'New York City',
    due_dates: [
      { offset_type: 'year-end', month_offset: 3, day_offset: '15' },
    ]
  })

  await createFiling({
    filing: { name: 'Mandatory First Installment', occurrence: 'annual' },
    agency: 'Department of Taxation and Finance',
    jurisdiction: 'New York',
    due_dates: [
      { offset_type: 'year-end', month_offset: 2, day_offset: '15' },
    ]
  })

  await createFiling({
    filing: { name: 'CT-3 Extension', occurrence: 'annual' },
    agency: 'Department of Taxation and Finance',
    jurisdiction: 'New York',
    due_dates: [
      { offset_type: 'year-end', month_offset: 3, day_offset: '15' },
    ]
  })

  await createFiling({
    filing: { name: 'CT-3', occurrence: 'annual' },
    agency: 'Department of Taxation and Finance',
    jurisdiction: 'New York',
    due_dates: [
      { offset_type: 'year-end', month_offset: 3, day_offset: '15' },
    ]
  })

  await createFiling({
    filing: { name: 'NYC-3 Estimate', occurrence: 'annual' },
    agency: 'Department of Finance',
    jurisdiction: 'New York City',
    due_dates: [
      { offset_type: 'year-end', month_offset: 3, day_offset: '15' },
    ]
  })

  /*
  await createFiling({
    filing: { name: 'CT-400 Estimate', occurrence: 'multiple' },
    agency: 'Department of Taxation and Finance',
    jurisdiction: 'New York',
    due_dates: [
      { offset_type: 'year-end', month_offset: 5, day_offset: '15' },
      { offset_type: 'year-end', month_offset: 8, day_offset: '15' },
      { offset_type: 'year-end', month_offset: 11, day_offset: '15' },
    ]
  })*/
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
