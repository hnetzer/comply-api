#!/usr/bin/env node

import 'dotenv/config';
import yargs from 'yargs';
import models, { sequelize } from '../models';
import bcrypt from 'bcrypt';


// entrypoint
const start = async () => {

  var argv = process.argv;

  const firstName = argv[2].trim();
  const lastName = argv[3].trim();
  const email = argv[4].trim();
  const pass = argv[5].trim();

  console.log('Creating ADMIN with the following details:')
  console.log('first_name:', firstName)
  console.log('last_name:', lastName)
  console.log('email:', email)
  console.log('password:', pass)


  try {
    const response = await models.User.create({
      first_name: firstName,
      last_name: lastName,
      title: 'admin',
      email: email,
      password: pass,
      roles: [ 'admin' ],
      permission: [],
    })
    console.log('Admin created successfully!')
  } catch (err) {
    console.error(err)
  }
}

start()
