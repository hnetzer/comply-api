import models, { sequelize } from '../models';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import Slack from '../services/Slack';

const {
  Company,
  User,
  UserSetting,
  UserCompany
} = models;

const JWT_SECRET = process.env.JWT_SECRET

// TODO: Move JWT secret to ENV variable
const createAccount = async (req, res, next) => {

  const user = req.body;
  const count = await User.count({ where: { email: user.email } });
  if (count > 0) {
    return res.status(400).json({
      message: 'An account with that email already exists'
    })
  }

  const comp = await Company.create({
    name: user.company,
  });

  // TODO: Add validation here
  const u = await User.create({
    first_name: user.first_name,
    last_name: user.last_name,
    title: user.title,
    email: user.email,
    password: user.password,
    roles: ['client'],
    permission: [],
    company_id: comp.id
  })

  await UserSetting.create({
    user_id: u.id,
    notifications: false
  })

  await UserCompany.create({
    user_id: u.id,
    company_id: comp.id
  })

  const newUser = await User.findOne({
    where: { email: user.email },
    include: [{
      model: Company,
      as: 'companies'
    }],
    raw: true })

  const channelId = process.env.SLACK_CHANNEL_ID
  const message = `New signup :tada: ${user.first_name} ${user.last_name} (${user.email}) - ${user.title} @ ${user.company}`
  Slack.publishMessage(channelId, message)

  req.login(newUser, { session: false }, async (err) => {
    if (err) {
      return res.send(err)
    }

    const companies = await Company.findAll({
      include: [{
        model: User,
        as: 'users',
        where: { id: newUser.id }
      }]
    })

    // now generate a signed json web token with the user object
    const token = jwt.sign(newUser, JWT_SECRET)
    return res.json({
      user: newUser,
      token: token,
      company: companies[0],
      companies: companies
    });
  })
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
