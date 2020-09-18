#!/usr/bin/env node

import 'dotenv/config';
import models, { sequelize } from '../models';

const {
  User,
  UserCompany
} = models;


// entrypoint
const start = async () => {

  console.log(`creating user company mappings for users that don't have them`)

  try {
    const users = await User.findAll({})

    console.log(`found ${users.length} users`)

    let createdCount = 0
    for (let i=0; i < users.length; i++) {
      const user = users[i].get({ plain: true});
      if (!user.company_id) {
        continue;
      }

      const s = await UserCompany.findOne({
        where: { user_id: user.id, company_id: user.company_id }
      })

      if (!s) {
        const obj = {
          user_id: user.id,
          company_id: user.company_id
        }
        console.log('object to create', obj)
        await UserCompany.create(obj)
        createdCount = createdCount + 1;
      }
    }

    console.log(`created user company mappings for ${createdCount} users`)
  } catch (err) {
    console.error(err)
  }
}

start()
