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
  Filing
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
  const jurisdictions = await Jurisdiction.findAll({ raw: true });
  const jurisdictionMap = jurisdictions.reduce((acc, j) => {
    acc[j.name.toLowerCase()] = j.id;
    return acc
  }, {})

  const cjs = []
  offices.forEach(office => {
    if (office.city.toLowerCase().trim() === 'san francisco') {
      cjs.push({ companyId: companyId, jurisdictionId: jurisdictionMap['san francisco']})
      cjs.push({ companyId: companyId, jurisdictionId: jurisdictionMap['san francisco county']})
      cjs.push({ companyId: companyId, jurisdictionId: jurisdictionMap['california']})
    }

    if (office.city.toLowerCase().trim() === 'los angeles') {
      cjs.push({ companyId: companyId, jurisdictionId: jurisdictionMap['los angeles']})
      cjs.push({ companyId: companyId, jurisdictionId: jurisdictionMap['los angeles county']})
      cjs.push({ companyId: companyId, jurisdictionId: jurisdictionMap['california']})
    }

    if (office.city.toLowerCase().trim() === 'new york') {
      cjs.push({ companyId: companyId, jurisdictionId: jurisdictionMap['new york city']})
      cjs.push({ companyId: companyId, jurisdictionId: jurisdictionMap['new york']})
    }
  });

  cjs.push({ companyId: companyId, jurisdictionId: jurisdictionMap['federal']})
  return cjs;
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

export {
  getCompany,
  updateCompany,
  updateOffices,
  updateAgencies,
  getCompanyFilings,
}
