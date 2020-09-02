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
    const filings = await CompanyFiling.findAllForNotifications({
      dueStart: fiveWeeks.format('YYYY-MM-DD'),
      dueEnd: sixWeeks.format('YYYY-MM-DD')
    })

    console.log(`Found ${filings.length} where notifications need to be sent`)

    const emailPersonalizations = [];
    const slackMessages = [];

    for (let i=0; i < filings.length; i++) {
      const companyFiling = filings[i].get({ plain: true});
      const { filing, due_date, company } = companyFiling;
      const user = company.users[0];
      const agency = filing.agency;
      const jurisdiction = agency.jurisdiction;

      const slack = Slack.createFilingNotification(user, company, filing, companyFiling)
      slackMessages.push(slack)

      const email = SendGrid.createFilingPersonalization(user, company, filing, companyFiling)
      emailPersonalizations.push(email)
    }

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
