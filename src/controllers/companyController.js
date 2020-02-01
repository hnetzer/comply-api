import { Op } from 'sequelize';
import moment from 'moment';
import models, { sequelize } from '../models';

const {
  Company,
  CompanyJurisdiction,
  Jurisdiction,
  User,
  Office,
  CompanyAgency,
  Agency,
  Filing,
  CompanyFiling
} = models;


const getCompany = async (req, res, next) => {
  const companyId = req.params.companyId

  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }

  const company = await Company.findOne({ where: { id: companyId }, raw: true });
  const agencyIds = await CompanyAgency.findAll({
    where: { company_id: companyId },
    raw: true,
  })

  const agencies = await Agency.findAll({
    where: { id: agencyIds.map(a => a.agencyId) },
    raw: true
  })

  company.agencies = agencies;

  return res.status(200).json(company)
}

  // TODO: make sure the user owns that company
const updateCompany = async (req, res, next) => {
  const companyId = req.params.companyId;
  const options = {
    where: { id: companyId }
  }

  await Company.update(req.body, options);
  const company = await Company.findOne(options);

  const jurisdiction = req.body.jurisdiction
  if(jurisdiction) {
    const j = await Jurisdiction.findOne({
      where: { name: req.body.jurisdiction.name }
    });

    j.CompanyJurisdiction = {
      registration: jurisdiction.registration
    }

    await company.setJurisdictions([j], { through: { registration: jurisdiction.registration }})
  }

  const c = await Company.findOne({ where: { id: req.user.company_id }, raw: true });
  return res.status(200).json(c)
}

// TODO: Check if th user owns the company / offices
const updateOffices = async (req, res, next) => {
  const companyId = req.params.companyId;
  const companyOffices = req.body.offices;
  const company = await Company.findOne({ where: { id: companyId } });

  try {
   // Delete all of the existing offices first
   await Office.destroy({ where: { company_id: companyId } })

  // Create the new offices
   await Office.bulkCreate(companyOffices.map(office => {
     office.company_id = companyId;
     return office
   }))

   // Get our newly created offices
   const offices = await Office.findAll({ where: { company_id: companyId }, raw: true });

   // Figure out which jurisdictions to create
   const companyJurisdictions = await getCompanyJurisdictions(companyId, offices)

   // Create the jurisdictions
   await CompanyJurisdiction.bulkCreate(companyJurisdictions);

   return res.status(200).json(offices)

 } catch(err) {
   console.log(err)
   return res.status(500).send()
 }
}


// Helper function to map office locations -> jurisdictions;
const getCompanyJurisdictions = async (companyId, offices) => {
  const existing = await CompanyJurisdiction.findOne({
    where: { companyId: companyId },
    raw: true
  });
  const jurisdictions = await Jurisdiction.findAll({});
  const jurisdictionMap = jurisdictions.reduce((acc, j) => {
    acc[j.name.toLowerCase()] = j.id;
    return acc
  }, {});

  const existingJId = existing.jurisdictionId

  const cjs = []
  offices.forEach(office => {
    if (office.city.toLowerCase().trim() === 'san francisco') {
      addCJHelper(companyId, 'san francisco', existingJId, jurisdictionMap, cjs)
      addCJHelper(companyId, 'san francisco county', existingJId, jurisdictionMap, cjs)
      addCJHelper(companyId, 'california', existingJId, jurisdictionMap, cjs)
    }

    if (office.city.toLowerCase().trim() === 'los angeles') {
      addCJHelper(companyId, 'los angeles', existingJId, jurisdictionMap, cjs)
      addCJHelper(companyId, 'los angeles county', existingJId, jurisdictionMap, cjs)
      addCJHelper(companyId, 'california', existingJId, jurisdictionMap, cjs)
    }

    if (office.city.toLowerCase().trim() === 'new york') {
      addCJHelper(companyId, 'new york city', existingJId, jurisdictionMap, cjs)
      addCJHelper(companyId, 'new york', existingJId, jurisdictionMap, cjs)
    }
  });

  cjs.push({ companyId: companyId, jurisdictionId: jurisdictionMap['federal']})
  return cjs;
}

const addCJHelper = (companyId, jName, existingJId, map, array) => {
  const jId = map[jName];
  if(jId != existingJId) {
    array.push({ companyId: companyId, jurisdictionId: jId})
  }
}

const updateAgencies = async (req, res, next) => {
  const companyId = req.params.companyId;
  const agencyIds = req.body.agencies;

  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }

  const company = await Company.findOne({ where: { id: companyId } });

  try {
   // Delete all of the existing company agencies
   await CompanyAgency.destroy({ where: { company_id: companyId } })

   // Create the new company agencies
   const companyAgencies = agencyIds.map(id => ({ agencyId: id, companyId: req.user.company_id }))

   await CompanyAgency.bulkCreate(companyAgencies)

   const agencies = await Agency.findAll({
     where: { id: agencyIds },
     raw: true
   })

   return res.status(200).json(agencies)

 } catch(err) {
   console.log(err)
   return res.status(500).send()
 }
}

const getCompanyFilings =  async (req, res, next) => {
  const companyId = req.params.companyId;

  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }

  const company = await Company.findOne({ where: { id: companyId } });
  const companyAgencies = await CompanyAgency.findAll({
    where: { company_id: companyId },
    raw: true,
  })

  const agencyIds = companyAgencies.map(a => a.agencyId)
  const filings = await Filing.findAllForAgencyIds({ ids: agencyIds, companyId: company.id })

  const f = filings.map(f => {
    const filing = f.get({ plain: true })

    filing.due = filing.due_date

    if (filing.due_date_year_end_offset_months) {
      const offset = filing.due_date_year_end_offset_months;
      const yearEnd = moment().year(2020).month(company.year_end_month).date(company.year_end_day);
      yearEnd.add(offset, 'months');
      filing.due = yearEnd.format('2020-MM-DD')
    }

    /* if (filing.due_date_reg_offset_months) {
      const offset = filing.due_date_reg_offset_months;
      const reg = moment(cjMap[filing.agency.jurisdiction.id].reg)
      reg.add(offset, 'months');
      filing.due = reg.format('2020-MM-DD')
    } */
    return filing
  })
  return res.status(200).json(f)
}


// TODO: should calculate due date on the server probably
const createCompanyFiling =  async (req, res, next) => {
  const companyId = req.params.companyId;
  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }

  const filingId = req.params.filingId;

  await CompanyFiling.create({
    company_id: companyId,
    filing_id: filingId,
    status: req.body.status,
    field_data: req.body.field_data,
    due_date: req.body.due_date
  });

  return res.status(200).send()
}

export {
  getCompany,
  updateCompany,
  updateOffices,
  updateAgencies,
  getCompanyFilings,
  createCompanyFiling,
}
