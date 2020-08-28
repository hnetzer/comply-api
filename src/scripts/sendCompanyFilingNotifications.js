#!/usr/bin/env node

import 'dotenv/config';
import models, { sequelize } from '../models';
import { Op } from 'sequelize';
import moment from 'moment'

const {
  CompanyFiling,
  Company,
  Filing,
  User,
  Agency,
  Jurisdiction
} = models;


// entrypoint
const start = async () => {

  const today = moment();
  const sixWeeks = moment().add({ weeks: 6 })

  console.log(`Checking for filings due within 6 weeks from today`)
  console.log(`${today.format('YYYY-MM-DD')} to ${sixWeeks.format('YYYY-MM-DD')}`)

  try {
    const filings = await CompanyFiling.findAll({
      where: {
        [Op.and]: [
          { due_date: { [Op.gte]: today.format('YYYY-MM-DD') } },
          { due_date: { [Op.lte]: sixWeeks.format('YYYY-MM-DD') } },
          { notified: false }
        ]
      },
      include: [{
        model: Company,
        include: [{
          model: User
        }]
      }, {
        model: Filing,
        include: [{
          model: Agency,
          include: [{
            model: Jurisdiction
          }]
        }]
      }]
    })

    console.log(`Found ${filings.length} where notifications need to be sent`)

    for (let i=0; i < filings.length; i++) {
      const companyFiling = filings[i].get({ plain: true});
      const { filing, due_date, company } = companyFiling;
      const user = company.users[0];
      const agency = filing.agency;
      const jurisdiction = agency.jurisdiction;

      console.log(`
        Notify ${user.first_name} ${user.last_name} (${user.email}) @ ${company.name} that their
        ${filing.name} for ${agency.name}, ${jurisdiction.name} is due in 6 weeks.`)
    }



  } catch (err) {
    console.error(err)
  }
}

start()
