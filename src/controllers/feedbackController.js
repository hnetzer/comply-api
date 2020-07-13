import sendgrid from '@sendgrid/mail'

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const sendFeedback = async (req, res, next) => {
  const user = req.user

  const subject = `Feedback from ${user.first_name} ${user.last_name} (${user.email})`;
  const message = req.body.feedback;

  const msg = {
    to: 'support@thinkcomply.com',
    from: 'feedback@thinkcomply.com',
    subject: subject,
    text: message,
  };

  try {
    const sgResponse = await sendgrid.send(msg);
  } catch (err) {
    console.error(err.response.body)
    return res.status(500).send()
  }

  return res.status(200).send()
}


export {
  sendFeedback
}
