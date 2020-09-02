import sendgrid from '@sendgrid/mail'

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// TODO: Move both of these to environment variables
const SENDGRID_FILING_NOTIFICATION_TEMPLATE_ID = "d-534dadc9fb28422bb12a625374cc2e53";
const SENDGRID_SANDBOX_MODE_ENABLED = process.env.SENDGRID_SANDBOX_MODE_ENABLED == 'true'
const COMPLY_FRONTEND_URL = process.env.COMPLY_FRONTEND_URL

const sendFilingNotifications = async (personalizations) => {
  if (!personalizations.length) return;

  const body = {
    personalizations: personalizations,
    from: { email: "support@thinkcomply.com" },
    template_id: SENDGRID_FILING_NOTIFICATION_TEMPLATE_ID,
    tracking_settings: {
      click_tracking: { enable: true }
    },
    mail_settings: {
      sandbox_mode: { enable: SENDGRID_SANDBOX_MODE_ENABLED }
    }
  }

  try {
    return await sendgrid.send(body);
  } catch (err) {
    console.error(err.response.body)
    return err;
  }
}

const createFilingPersonalization = (user, company, filing, companyFiling) => {
  return {
    to: [{ email: user.email, name: `${user.first_name} ${user.last_name}` }],
    dynamic_template_data: {
      first_name: user.first_name,
      company: company.name,
      filing: filing.name,
      agency: filing.agency.name,
      jurisdiction: filing.agency.jurisdiction.name,
      due_date: companyFiling.due_date,
      filing_url: `${COMPLY_FRONTEND_URL}/home/filings/${companyFiling.id}`
    }
  }
}

export default {
  createFilingPersonalization,
  sendFilingNotifications
}
