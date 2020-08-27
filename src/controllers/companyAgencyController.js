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


const updateCompanyAgencies = async (req, res, next) => {
  const companyId = req.params.companyId;
  const companyAgencies = req.body;

  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }
  const company = await Company.findOne({ where: { id: companyId } });

  try {

   for (let i=0; i < companyAgencies.length; i++) {
     const companyAgency = companyAgencies[i];
     console.log(companyAgency)
     const instance = await CompanyAgency.findOne({
       where: { company_id: company.id, agency_id: companyAgency.agency_id }
     });

     if (instance) {
       await instance.update({
         registration: companyAgency.registration,
         registered: companyAgency.registered
       })
     } else {
       await CompanyAgency.create({
         company_id: company.id,
         agency_id: companyAgency.agency_id,
         registration: companyAgency.registration,
         registered: companyAgency.registered
       })
     }
   }


   // Create all of the company filings
   company.syncFilings(moment().year())

   // Mark the company as being onboarded
   Company.update({
     onboarded: true
   }, {
     where: { id: companyId }
   })



   const response = await CompanyAgency.findAll({
     where: { company_id: companyId },
     include: [{
       model: Agency,
       include: [{
         model: Jurisdiction,
       }],
     }],
   })

   return res.status(200).json(response)
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

  const companyAgency = await CompanyAgency.findOne({
    where: { company_id: companyId, agency_id: agencyId }
  })

  const count = await companyAgency.updateCompanyFilings()
  console.log(`Updated ${count} filing due dates`)

  return res.status(200).send(companyAgency)
}

const getCompanyAgencies = async (req, res, next) => {
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
    })

   return res.status(200).json(companyAgencies)
 } catch(err) {
   console.log(err)
   return res.status(500).send()
 }
}


export {
  updateCompanyAgencies,
  getCompanyAgencies,
  updateCompanyAgency,
}
