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

const createUser = async (req, res, next) => {
  const user = req.body;

  if (isNullOrEmpty(user.email)) {
    return res.status(400).json({
      message: 'An email address is required for all users'
    })
  }

  const existingUser = await User.findOne({ where: { email: user.email } });
  if (existingUser) {
    if (existingUser.password.length > 0) {
      return res.status(400).json({
        message: 'An account with that email already exists'
      })
    }

    // User has not completed the signup flow yet
    if (!existingUser.password) {
      return res.status(200).json(existingUser)
    }
  }

  const newUser = await User.create({
    ...user,
    roles: ['client'],
    permission: []
  })

  // const channelId = process.env.SLACK_CHANNEL_ID
  // const message = `New signup :tada: ${user.first_name} ${user.last_name} (${user.email}) - ${user.title} @ ${user.company}`
  // Slack.publishMessage(channelId, message)

  return res.status(200).json(newUser)
}

const updateUser = async (req, res, next) => {
  const userId = req.params.userId
  const u = req.body
  const user = User.findOne({ where: { id: userId, email: u.email }})
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
  createUser,
  updateUser,
  login
}
