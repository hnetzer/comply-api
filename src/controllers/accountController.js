import models, { sequelize } from '../models';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const {
  Company,
  User
} = models;


// TODO: Move JWT secret to ENV variable
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
  })

  const newUser = await User.findOne({
    where: { email: user.email },
    include: {
      model: Company,
    },
    raw: true })

  req.login(newUser, { session: false }, err => {
    if (err) {
      return res.send(err)
    }

    // now generate a signed json web token with the user object
    const token = jwt.sign(newUser, 'your_jwt_secret')
    return res.json({
      user: newUser,
      token: token,
      company: comp
    });
  })
}

// TODO: Move JWT secret to ENV variable
const login = async (req, res, next) => {
  const user = req.user
  if (!user) {
    return res.status(401).send();
  }

  req.login(user, { session: false }, err => {
    if (err) {
      res.status(500).send();
    }

    const token = jwt.sign(user, 'your_jwt_secret')
    return res.json({
      user: user,
      token: token
    });
  });
}

export {
  createAccount,
  login
}
