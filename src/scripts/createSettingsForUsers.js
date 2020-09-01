#!/usr/bin/env node

import 'dotenv/config';
import models, { sequelize } from '../models';

const {
  User,
  UserSetting
} = models;


// entrypoint
const start = async () => {

  console.log(`creating user settings for users that don't have them`)

  try {
    const users = await User.findAll({})

    console.log(`found ${users.length} users`)

    let createdCount = 0
    for (let i=0; i < users.length; i++) {
      const user = users[i].get({ plain: true});
      const s = await UserSetting.findOne({
        where: { user_id: user.id }
      })

      if (!s) {
        await UserSetting.create({
          user_id: user.id,
          notifications: false
        })
        createdCount = createdCount + 1;
      }
    }

    console.log(`created user settings for ${createdCount} users`)
  } catch (err) {
    console.error(err)
  }
}

start()
