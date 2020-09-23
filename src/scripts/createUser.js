#!/usr/bin/env node

import 'dotenv/config';
import yargs from 'yargs';
import models, { sequelize } from '../models';
import bcrypt from 'bcrypt';


/*
  Sample command

  npm run create-user '{ "first_name": "Michael", "last_name": "Scott", "email": "michael+1@office.com", "password": "test", "company_ids": [ 36, 37], "notifications": true }'
*/

// entrypoint
const start = async () => {

  var argv = process.argv;

  const userString = argv[2].trim();
  console.log('userString', userString)
  const user = JSON.parse(userString);

  console.log('Creating user with the following details:')
  console.log('first_name:', user.first_name)
  console.log('last_name:', user.last_name)
  console.log('email:', user.email)
  console.log('password:', user.password)
  console.log('notifications:', user.notifications)
  console.log('company_ids', user.company_ids)

  if (!user.company_ids.length) {
    console.log('Aborting! A user must have 1 or more company_ids')
    return 1;
  }

  try {

    const u = await models.User.findOne({ where: { email: user.email } });
    if (u) {
      console.log(`Aborting! User with email ${u.email} already exists`)
      return 1;
    }

    const companyIds = user.company_ids;
    for (let i=0; i < companyIds.length; i++) {
      const companyId = companyIds[i]
      const company = await models.Company.findOne({ where: { id: companyId } });
      if (!company) {
        console.log(`Aborting! Could not find company with id = ${companyId}`)
        return 1;
      }
    }

    const newUser = await models.User.create({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password: user.password,
      roles: [ 'client' ],
      permission: [],
      company_id: user.company_ids[0]
    })

    const newUserCompanies = await models.UserCompany.bulkCreate(companyIds.map(companyId => ({
      user_id: newUser.id,
      company_id: companyId,
    })))

    const newUserSetting = await models.UserSetting.create({
      user_id: newUser.id,
      notifications: user.notifications
    })

    console.log(`New user created successfully [user_id: ${newUser.id}] `)

  } catch (err) {
    console.error(err)
  }
}

start()
