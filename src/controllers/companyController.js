import models, { sequelize } from '../models';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const {
  Company,
  User
} = models;

const updateCompany = async (req, res, next) => {

  console.log('inside the update company controller')
  console.log(req.body)
  console.log(req)


}

export {
  updateCompany
}
