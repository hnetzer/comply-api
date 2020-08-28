#!/usr/bin/env node

import 'dotenv/config';
import models, { sequelize } from '../models';

import moment from 'moment';
import Slack from '../services/Slack';

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

  console.log(`Notifying for filings due within 6 weeks from today`)
  console.log(`${today.format('YYYY-MM-DD')} to ${sixWeeks.format('YYYY-MM-DD')}`)

  try {
    const filings = await CompanyFiling.findAllNotNotified({
      dueStart: today.format('YYYY-MM-DD'),
      dueEnd: sixWeeks.format('YYYY-MM-DD')
    })

    console.log(`Found ${filings.length} where notifications need to be sent`)

    const messages = [];

    for (let i=0; i < filings.length; i++) {
      const companyFiling = filings[i].get({ plain: true});
      const { filing, due_date, company } = companyFiling;
      const user = company.users[0];
      const agency = filing.agency;
      const jurisdiction = agency.jurisdiction;

      const message = `:email: Notified ${user.first_name} ${user.last_name} ` +
      `(${user.email}) @ ${company.name} that their _${filing.name}_ for ` +
      `_${agency.name}_, _${jurisdiction.name}_ is due *${moment(due_date).format('MMM, Do, YYYY')}*`
      messages.push(message)

      await filings[i].update({ notified: true });
    }

    const channelId = process.env.SLACK_CHANNEL_ID
    const header = Slack.createBlock(`:mailbox: Notification summary for today: *${today.format('MMMM Do, YYYY')}* \n\n`)
    let blocks = messages.map(m => Slack.createBlock(m))

    console.log(`Sent notifications for ${messages.length} filings`)

    if (!blocks.length) {
      blocks = [Slack.createBlock("[no notifications were sent today]")]
    }

    Slack.publishMessage(channelId, null, [header, ...blocks])


  } catch (err) {
    console.error(err)
  }
}

start()
