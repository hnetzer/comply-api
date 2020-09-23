#!/usr/bin/env node

import 'dotenv/config';
import models, { sequelize } from '../models';

import moment from 'moment';
import Slack from '../services/Slack';
import SendGrid from '../services/SendGrid';

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

  const fiveWeeks = moment().add({ weeks: 5 });
  const sixWeeks = moment().add({ weeks: 6 });

  console.log(`Notifying for filings due between 5 and 6 weeks from today`)
  console.log(`${fiveWeeks.format('YYYY-MM-DD')} to ${sixWeeks.format('YYYY-MM-DD')}`)

  try {
    const filingsBetweenDates = await CompanyFiling.findAllBetweenDates({
      dueStart: fiveWeeks.format('YYYY-MM-DD'),
      dueEnd: sixWeeks.format('YYYY-MM-DD')
    })

    // Filter out only the users that want to be notified
    const filings = filingsBetweenDates.filter((f,i) => {
      const companyFiling = f.get({ plain: true});
      const { company } = companyFiling;
      return company.users.reduce((acc, user) => {
        return acc || (user.settings && user.settings.notifications)
      }, false)
    })

    console.log(`Found ${filings.length} filings where notifications need to be sent`)

    const emailPersonalizations = [];
    const slackMessages = [];

    for (let i=0; i < filings.length; i++) {
      const companyFiling = filings[i].get({ plain: true});
      const { filing, due_date, company } = companyFiling;
      const agency = filing.agency;
      const jurisdiction = agency.jurisdiction;

      for (let j=0; j < company.users.length; j++) {
        const user = company.users[j]
        if (user.settings.notifications) {
          const slack = Slack.createFilingNotification(user, company, filing, companyFiling)
          slackMessages.push(slack)

          const email = SendGrid.createFilingPersonalization(user, company, filing, companyFiling)
          emailPersonalizations.push(email)
        }
      }
    }

    console.log(`Sending ${emailPersonalizations.length} notification emails`)

    const sgResponse = await SendGrid.sendFilingNotifications(emailPersonalizations);
    console.log('SendGrid response: ', sgResponse)

    const slackResponse = await Slack.publishFilingNotifications(slackMessages);
    console.log('Slack response: ', slackResponse)

    for (let i=0; i < filings.length; i++) {
      await filings[i].update({ notified: true })
    }

  } catch (err) {
    console.error(err)
  }
}


start()
