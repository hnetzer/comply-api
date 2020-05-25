import { Op } from 'sequelize';
import moment from 'moment';
import GoogleGeocode from '../services/GoogleGeocode'
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

  const company = await Company.findOne({
    where: { id: companyId },
    include: [{
      model: Office
    }]
  });

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


const updateOffices = async (req, res, next) => {
  const companyId = req.params.companyId;
  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }
  const companyOffices = req.body.offices;
  const company = await Company.findOne({ where: { id: companyId } });

  try {

   // First figure out what new Jurisdictions need
   // to be created from the offices addresses
   const jurisdictionMap = {};
   for (let i=0; i < companyOffices.length; i++) {
     const office = companyOffices[i];

     // Get the address components from Google API
     const addressComponents = await GoogleGeocode.getAddressComponents(office);
     const { city, county, state } = GoogleGeocode.parseAddressComponents(addressComponents);

     if (state) {
       const j = await Jurisdiction.findOrCreateState(state)
       jurisdictionMap[j.id] = true;

       if (city) {
         const j = await Jurisdiction.findOrCreateCity(city, state)
         jurisdictionMap[j.id] = true;
       }

       if (county) {
         const j = await Jurisdiction.findOrCreateCounty(county, state)
         jurisdictionMap[j.id] = true;
       }
     }
   }

   // Delete and create all of the office locations
   // TODO: should we be updating these instead?
   await Office.destroy({ where: { company_id: companyId } })
   await Office.bulkCreate(companyOffices.map(office => {
     office.company_id = companyId;
     return office
   }))

   // Delete and create all of the new company jurisdictions
   const jurisdictionIds = Object.keys(jurisdictionMap);
   const companyJurisdictions = jurisdictionIds.map(jId => ({
     jurisdictionId: jId,
     companyId: companyId
   }))
   await CompanyJurisdiction.destroy({ where: { company_id: companyId } })
   await CompanyJurisdiction.bulkCreate(companyJurisdictions);

   // Get our newly created offices
   const offices = await Office.findAll({ where: { company_id: companyId }});
   return res.status(200).json(offices)

 } catch(err) {
   console.error(err)
   return res.status(500).send()
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

   // Mark the company as being onboarded
   Company.update({
     onboarded: true
   }, {
     where: { id: companyId }
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
