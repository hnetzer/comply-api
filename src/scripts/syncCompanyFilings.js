#!/usr/bin/env node

import 'dotenv/config';
import models, { sequelize } from '../models';
import moment from 'moment'

const {
  Company,
} = models;


// entrypoint
const start = async () => {

  let start = moment().set({ year: 2020, month: 0, date: 1 })
  let end = moment().set({ year: 2020, month: 11, date: 31 })

  console.log(`Starting company filing sync (${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')})`)

  try {
    const companies = await Company.findAll({
      where: { onboarded: true, type: 'Corporation' }
    })

    let count = 0;
    for (let x = 0; x < companies.length; x++) {
      const company = companies[x];
      for (let year=start.year(); year <= end.year(); year++) {
          const created = await company.syncFilings(year)
          count = count + created;
        }
      }
    console.log(`Created ${count} new company filings`)
  } catch (err) {
    console.error(err)
  }
}

start()
