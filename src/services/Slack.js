import { WebClient } from '@slack/web-api';
import moment from 'moment';

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);

const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID

const publishMessage = async (channel_id, text, blocks) => {
  try {

    const result = await web.chat.postMessage({
      channel: channel_id,
      text: text,
      blocks: blocks,
    });

    return result;
  }
  catch (error) {
    console.error(error);
    return error;
  }
}

const publishFilingNotifications = async (messages) => {
  const headerMessage = `:mailbox: Notification summary for today: `+
  `*${moment().format('MMMM Do, YYYY')}* \n\n`
  const header = createBlock(headerMessage)

  let blocks = messages.map(m => createBlock(m))

  console.log(`Sent notifications for ${messages.length} filings`)

  if (!blocks.length) {
    blocks = [createBlock("[no notifications were sent today]")]
  }

  publishMessage(SLACK_CHANNEL_ID, null, [header, ...blocks])
}

const createFilingNotification = (user, company, filing, companyFiling) => {
  const agency = filing.agency;
  const jurisdiction = agency.jurisdiction;

  return `:email: Notified ${user.first_name} ${user.last_name} ` +
  `(${user.email}) @ ${company.name} that their _${filing.name}_ for ` +
  `_${agency.name}_, _${jurisdiction.name}_ is due ` +
  `*${moment(companyFiling.due_date).format('MMM, Do, YYYY')}*`
}

const createBlock = (markdown) => {
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: markdown
    }
  }
}

export default {
  publishMessage,
  createBlock,
  createFilingNotification,
  publishFilingNotifications
}
