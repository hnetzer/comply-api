import models, { sequelize } from '../models';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import Slack from '../services/Slack';

const {
  Company,
  User
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
  await User.create({
    first_name: user.first_name,
    last_name: user.last_name,
    title: user.title,
    email: user.email,
    password: user.password,
    roles: ['client'],
    permission: [],
    company_id: comp.id
  })

  const newUser = await User.findOne({
    where: { email: user.email },
    include: {
      model: Company,
    },
    raw: true })

  const channelId = process.env.SLACK_CHANNEL_ID
  const message = `New signup :tada: ${user.first_name} ${user.last_name} (${user.email}) - ${user.title} @ ${user.company}`
  Slack.publishMessage(channelId, message)

  req.login(newUser, { session: false }, err => {
    if (err) {
      return res.send(err)
    }

    // now generate a signed json web token with the user object
    const token = jwt.sign(newUser, JWT_SECRET)
    return res.json({
      user: newUser,
      token: token,
      company: comp
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

    const company = await Company.findOne({
      where: {
        id: user.company_id
      }
    })

    const token = jwt.sign(user, JWT_SECRET)
    return res.json({
      user: user,
      token: token,
      company: company
    });
  });
}

export {
  createAccount,
  login
}
