import models, { sequelize } from '../models';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const {
  Company,
  CompanyJurisdiction,
  Jurisdiction,
  User
} = models;


// TODO: Re-factor this to take company_id as part of URL
const updateCompany = async (req, res, next) => {
  const companyId = req.user.company_id;
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

  const c = await Company.findOne({
    where: { id: req.user.company_id },
    include: [{
      model: Jurisdiction,
    }],
    raw: true });

  return res.status(200).json(c)
}

export {
  updateCompany
}
