import models, { sequelize } from '../models';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { emailIsValid, isNullOrEmpty } from '../utils'
import Slack from '../services/Slack';

const {
  Company,
  User,
  UserSetting,
  UserCompany
} = models;

const JWT_SECRET = process.env.JWT_SECRET

const createAccount = async (req, res, next) => {
  const user = req.user // When

  if (isNullOrEmpty(user.email)) {
    return res.status(400).json({
      message: 'An email address is required for all users'
    })
  }

  const count = await User.count({ where: { email: user.email } });
  if (count > 0) {
    return res.status(400).json({
      message: 'An account with that email already exists'
    })
  }

  try {
    const newUser = await User.create({
      email: user.email,
      password: user.password,
      name: user.name,
      first_name: user.first_name,
      last_name: user.last_name,
      google_id: user.google_id
    });

    const company = await models.Company.create({ name: '' })

    await models.UserSetting.create({ user_id: newUser.id, notifications: false })
    await models.UserCompany.create({ user_id: newUser.id, company_id: company.id })
    await newUser.update({ company_id: company.id })

    const rawUser = newUser.get({ plain: true })


    // const channelId = process.env.SLACK_CHANNEL_ID
    // const message = `New signup :tada: ${user.first_name} ${user.last_name} (${user.email}) - ${user.title} @ ${user.company}`
    // Slack.publishMessage(channelId, message)

    return req.login(rawUser, { session: false }, async (err) => {
       if (err) {
         return res.send(err)
       }

       const companies = await Company.findAll({
         include: [{
           model: User,
           as: 'users',
           where: { id: rawUser.id }
         }]
       })

       // now generate a signed json web token with the user object
       const token = jwt.sign(rawUser, JWT_SECRET)
       return res.json({
         user: rawUser,
         token: token,
         company: companies[0],
         companies: companies
       });
     })

  } catch (err) {
    console.log(err)
    return res.send(err)
  }
}

const login = async (req, res, next) => {
  const user = req.user
  if (!user) {
    return res.status(401).send();
  }

  req.login(user, { session: false }, async (err) => {
    if (err) {
      res.status(500).send();
    }

    const companies = await Company.findAll({
      include: [{
        model: User,
        as: 'users',
        where: { id: user.id }
      }]
    })

    const token = jwt.sign(user, JWT_SECRET)
    return res.json({
      user: user,
      token: token,
      company: companies[0],
      companies: companies
    });
  });
}


export {
  createAccount,
  login
}
