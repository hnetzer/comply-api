import { WebClient } from '@slack/web-api';

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);

const publishMessage = async (channel_id, text) => {
  try {

    const result = await web.chat.postMessage({
      channel: channel_id,
      text: text
    });

    console.log('successfully posted messages to Slack')
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
}

export default {
  publishMessage
}
