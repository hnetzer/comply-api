import models, { sequelize } from '../models';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const {
  Company,
  CompanyJurisdiction,
  Jurisdiction,
  User,
  Office,
} = models;

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

// TODO: Create the jurisdictions in the function to for the offices;
// TODO: Check if th user owns the company / offices
const updateOffices = async (req, res, next) => {
  const companyId = req.params.companyId;
  const offices = req.body.offices;
  const company = await Company.findOne({ where: { id: companyId } });

  // TODO: Delete all of the existing offices first
  try {
   await Office.bulkCreate(offices.map(office => {
     office.company_id = companyId;
     return office
   }))
 } catch(err) {
   console.log('Error creating offices')
   console.log(err)
   return res.status(500).json({})
 }

  const o = await Office.findAll({ where: { company_id: companyId }, raw: true });
  return res.status(200).json(o)
}

export {
  updateCompany,
  updateOffices
}
