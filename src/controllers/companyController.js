import { Op } from 'sequelize';
import fetch from 'node-fetch';
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

const GOOGLE_API_KEY = "AIzaSyCbN2Mnp6f3QTborwTZUu8saFLP_l6ph5o"


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


  const BASE_API = "https://maps.googleapis.com/maps/api/geocode/json"

  try {
   // Delete all of the existing offices first
   await Office.destroy({ where: { company_id: companyId } })

   // Create a map to dedupe all company jurisdictions
   const jurisdictionMap = {};

   for (let i=0; i < companyOffices.length; i++) {
     const office = companyOffices[i];

     const search = `${office.address} ${office.city}, ${office.state} ${office.zip}`
     const response = await fetch(`${BASE_API}?address=${search}&key=${GOOGLE_API_KEY}`)

     // Check for error codes
     if (response.status !== 200) {
       let error = await response.json()
       console.log("Error getting address details from Google")
       console.error(error)
       return;
     }

     let searchResponse = await response.json()
     if (searchResponse.status != "OK") {
       console.log("Error response from Google Geocode API")
       console.error(searchResponse.status)
       return;
     }

     console.log(`Google API responded with ${searchResponse.results.length} results`)

     const result = searchResponse.results[0];
     console.log(`Only checking the first result: ${result.formatted_address}`)

     const { city, county, state } = parseAddressComponents(result.address_components)
     console.log(`city: ${city}, county: ${county}, state: ${state}`)

     if (state != null) {
       const params = { name: state, type: 'state', state: state }
       const [instance, wasCreated] = await Jurisdiction.findOrCreate({
         where: params
       });
       jurisdictionMap[instance.id] = true;

       if (wasCreated) {
         console.log('Created a new jurisdiction', params)
       }
     }

     if (city != null && state != null) {
       const params = { name: city, type: 'city', state: state };
       const [instance, wasCreated] = await Jurisdiction.findOrCreate({
         where: params
       });
       jurisdictionMap[instance.id] = true;
       if (wasCreated) {
         console.log('Created a new jurisdiction', params)
       }
     }

     if (county != null && state != null) {
       const params = { name: county, type: 'county', state: state }
       const [instance, wasCreated] = await Jurisdiction.findOrCreate({
         where: params
       });
       jurisdictionMap[instance.id] = true;
       if (wasCreated) {
         console.log('Created a new jurisdiction', params)
       }
     }
   }

   console.log('Got all the way to creating the offices!!')

  // Create the new offices
   await Office.bulkCreate(companyOffices.map(office => {
     office.company_id = companyId;
     return office
   }))

   // Get our newly created offices
   const offices = await Office.findAll({ where: { company_id: companyId }, raw: true });

   // Figure out which jurisdictions to create
   const jurisdictionIds = Object.keys(jurisdictionMap);
   const companyJurisdictions = jurisdictionIds.map(jId => ({
     jurisdictionId: jId,
     companyId: companyId
   }))

   // Delete all of the existing company jurisdictrions first
   await CompanyJurisdiction.destroy({ where: { company_id: companyId } })

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


const parseAddressComponents = (address_components) => {
  let city = null;
  let state = null;
  let county = null;

  address_components.forEach((component, index) => {
    for (let i=0; i < component.types.length; i++) {
      const type = component.types[i];

      // Check for the city
      if (type === "locality") {
        city = component.long_name;
        break;
      }
      // Check for the county
      if (type === "administrative_area_level_2") {
        county = component.long_name;
        break;
      }

      //  Check for the state
      if (type === "administrative_area_level_1") {
        state = component.long_name;
        break;
      }
    }
  })

  return {
    city: city,
    county: county,
    state: state
  };
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
