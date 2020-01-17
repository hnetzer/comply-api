import models, { sequelize } from '../models';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const {
  Company,
  User
} = models;


// TODO: Re-factor this to take company_id as part of URL
const updateCompany = async (req, res, next) => {

  console.log('inside update company')
  console.log(req.body)
  console.log(req.user)

  const options = {
    where: { id: req.user.company_id }
  }
  const comp = await Company.update(req.body, options);
  const c = await Company.findOne({ where: { id: req.user.company_id }, raw: true });

  return res.status(200).json(c)
}

export {
  updateCompany
}
