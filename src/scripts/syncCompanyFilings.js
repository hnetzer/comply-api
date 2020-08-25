#!/usr/bin/env node

import 'dotenv/config';
import models, { sequelize } from '../models';
import moment from 'moment'

const {
  Company,
  CompanyAgency,
  CompanyFiling,
  Filing,
  FilingDueDate,
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

    let createdCountTotal = 0;
    for (let x = 0; x < companies.length; x++) {
      const company = companies[x].dataValues;
      const filings = await Filing.findAllForCompany(company.id)
      let potential = [];

      // Get all of the company filing instances for the years we need to consider
      for (let year=start.year(); year <= end.year(); year++) {
        for (let i=0; i< filings.length; i++) {
          const instances = await filings[i].findInstances(company, year);
          potential.push(...instances)
        }
      }

      // Filter out filings that are out of the date range
      const companyFilings = potential.filter(filing => {
        if (!filing.due_date) return false;
        const due = moment(filing.due_date).unix()
        return due >= start.unix() && due <= end.unix()
      })

      // Create the company filings if they don't exist yet
      for (let i=0; i < companyFilings.length; i++) {
        const cf= await CompanyFiling.createIfNotExists(companyFilings[i])
        if (cf) {
          createdCountTotal++;
        }
      }
    }

    console.log(`Created ${createdCountTotal} new company filings`)
  } catch (err) {
    console.error(err)
  }
}

start()
