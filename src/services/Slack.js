import { WebClient } from '@slack/web-api';

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);

const publishMessage = async (channel_id, text, blocks) => {
  try {

    const result = await web.chat.postMessage({
      channel: channel_id,
      text: text,
      blocks: blocks,
    });

    console.log('Successfully posted messages to Slack')
  }
  catch (error) {
    console.error(error);
  }
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
  createBlock
}
