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

  console.log('Starting Company Filing Sync -->>>')

  let start = moment().set({ year: 2020, month: 0, date: 1 })
  let end = moment().set({ year: 2020, month: 11, date: 31 })
  console.log(`Checking all filings between ${start.format('YYYY-MM-DD')} and ${end.format('YYYY-MM-DD')}`)

  try {
    const companies = await Company.findAll({
      where: { onboarded: true, type: 'Corporation' }
    })

    let createdCountTotal = 0;
    for (let x = 0; x < companies.length; x++) {
      const company = companies[x].dataValues;

      console.log(`-------  ${company.name} ------`)

      const filings = await Filing.findAllForCompany(company.id)
      const potential = [];

      // Loop through each year that we might need to consider
      for (let year=start.year(); year <= end.year(); year++) {
        for (let i=0; i< filings.length; i++) {
          const filing = filings[i].dataValues;
          const { due_dates } = filing;

          const companyAgency = await CompanyAgency.findOne({
            where: { agency_id: filing.agency_id, company_id: company.id },
            raw: true
          })

          // Check the due dates schedule of each filing
          for (let j=0; j < due_dates.length; j++) {
            const dueDate = due_dates[j];
            const date = dueDate.calculateDate(company, companyAgency.registration, year);
            potential.push({
              company_id: company.id,
              filing_id: filing.id,
              filing_due_date_id: dueDate.id,
              year: year,
              due_date: date
            })
          }
        }
      }

      // Filter out filings that are out of the date range
      const companyFilings = potential.filter(filing => {
        if (!filing.due_date) return false;
        const due = moment(filing.due_date).unix()
        return due >= start.unix() && due <= end.unix()
      })

      companyFilings.sort((a,b) => {
        const aTime = moment(a.due).unix()
        const bTime = moment(b.due).unix()
        if (aTime > bTime) return 1;
        if (aTime < bTime) return -1;
        if (aTime === bTime) return 0;
      })

      let createdCountCompany = 0;
      for (let i=0; i < companyFilings.length; i++) {
        const cf = companyFilings[i]
        const record = await CompanyFiling.findOne({
          where: {
            company_id: cf.company_id,
            filing_id: cf.filing_id,
            filing_due_date_id: cf.filing_due_date_id,
            year: cf.year,
          }
        })

        if (!record) {
          const result = await CompanyFiling.create(cf);
          createdCountCompany++;
          createdCountTotal++;
        }
      }

      if (createdCountCompany) {
        console.log(`Created ${createdCountCompany} new company filing(s) for ${company.name}`)
      }
    }

    console.log('\n')
    console.log(`Created ${createdCountTotal} new company filings`)

  } catch (err) {
    console.error(err)
  }
}

start()
