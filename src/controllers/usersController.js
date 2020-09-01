import models, { sequelize } from '../models';

const {
  UserSetting,
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

  const c = UserSetting.findOne({ where: { user_id: userId } });
  return res.status(200).json(c)
}

export {
  updateSettings
}
