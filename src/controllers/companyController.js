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

const updateCompany = async (req, res, next) => {
  const companyId = req.params.companyId;
  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }

  const options = {
    where: { id: companyId }
  }

  await Company.update(req.body, options);
  const company = await Company.findOne(options);

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


   console.log('RIGHT BEFORE creating the company jurisdictions')
   console.log(companyJurisdictions)
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

  console.log('jurisdictionMap')
  console.log(jurisdictionMap)

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

const updateCompanyAgency = async (req, res, next) => {
  const companyId = req.params.companyId;
  const agencyId = req.params.agencyId;

  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }

  await CompanyAgency.update({
    registration: req.body.registration,
  }, {
    where: {
      company_id: companyId,
      agency_id: agencyId
    },
    returning: true
  });

  const updatedCompanyAgency = await CompanyAgency.findOne({
    where: {
      company_id: companyId,
      agency_id: agencyId
     },
    raw: true
  })

  return res.status(200).send(updatedCompanyAgency)
}

const getAgencies = async (req, res, next) => {
  const companyId = req.params.companyId;

  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }

  try {
    const companyAgencies = await CompanyAgency.findAll({
      where: { company_id: companyId },
      include: [{
        model: Agency,
        include: [{
          model: Jurisdiction,
        }],
      }],
      raw: true
    })

    const values = companyAgencies.map(x => ({
      registration: x.registration,
      agency_id: x.agency_id,
      name: x['agency.name'],
      jurisdiction: x['agency.jurisdiction.name'],
      jurisdiction_id: x['agency.jurisdiction.id']
    }));

   return res.status(200).json(values)
 } catch(err) {
   console.log(err)
   return res.status(500).send()
 }
}

// Admin ONLY
const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.findAll({
      include: [{
        model: Agency
      }, {
        model: User
      }, {
        model: Office
      }]
    })

   return res.status(200).json(companies)
 } catch(err) {
   console.log(err)
   return res.status(500).send()
 }
}

const adminGetCompany = async (req, res, next) => {
  const companyId = req.params.companyId;
  try {
    const company = await Company.findOne({
      where: { id: companyId },
      include: [{
        model: Agency,
        include: [{
          model: Jurisdiction
        }]
      }, {
        model: User
      }, {
        model: Office
      }]
    })

   return res.status(200).json(company)
 } catch(err) {
   console.log(err)
   return res.status(500).send()
 }
}


export {
  getCompany,
  updateCompany,
  updateOffices,
  updateAgencies,
  getAgencies,
  updateCompanyAgency,

  // admin
  getCompanies,
  adminGetCompany
}
