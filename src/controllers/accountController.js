import models, { sequelize } from '../models';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const {
  Company,
  User
} = models;

const createAccount = async (req, res, next) => {

  const { user, company } = req.body;

  const count = await User.count({ where: { email: user.email } });
  if (count > 0) {
    return res.status(400).json({
      message: 'An account with that email already exists'
    })
  }

  const comp = await Company.create({
    name: company.name,
    phone: company.phone
  });

  // TODO: Add validation here
  await User.create({
    name: user.name,
    title: user.role,
    email: user.email,
    password: user.password,
    company_id: comp.id
  }, {
    returning: true
  })

  const newUser = await User.findOne({ where: { email: user.email }, raw: true })

  req.login(newUser, { session: false }, err => {
    if (err) {
      return res.send(err)
    }
    console.log('inside passport authentication')
    console.log('generating token')
    // now generate a signed json web token with the user object
    const token = jwt.sign(newUser, 'your_jwt_secret')
    return res.json({
      user: newUser,
      token: token
    });
  })

}

export {
  createAccount
}
