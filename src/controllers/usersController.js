import models, { sequelize } from '../models';

const {
  UserSetting,
  Company,
  User
} = models;

const updateSettings = async (req, res, next) => {
  const userId = req.params.userId;
  if (req.user.id != userId) {
    return res.status(401).send()
  }

  const update = req.body
  await UserSetting.update(
    { notifications: update.notifications },
    { where: { user_id: userId } }
  );

  const c = await UserSetting.findOne({ where: { user_id: userId } });
  return res.status(200).json(c)
}

const getCompanies = async (req, res, next) => {
  const userId = req.params.userId;
  if (req.user.id != userId) {
    return res.status(401).send()
  }

  const companies = await Company.findAll({
    include: [{
      model: User,
      as: 'users',
      where: { id: userId },
      required: true
    }]
  })

  return res.status(200).json(companies)
}

export {
  updateSettings,
  getCompanies
}
