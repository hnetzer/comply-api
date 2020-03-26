import { Op } from 'sequelize';
import moment from 'moment';
import models, { sequelize } from '../models';

const {
  Company,
  CompanyAgency,
  CompanyFiling,
  CompanyFilingMessage,
  Filing,
  Agency,
  Jurisdiction,
  User
} = models;



// This fuction gets all the filings for a company that are unstarted
// it determines what filings a company should do based on it's agencies,
// it also calculates filing due dates based on a companies information

// TODO: Move this to the filings controller?
const getFilingsForCompany =  async (req, res, next) => {
  const companyId = req.params.companyId;
  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }

  const company = await Company.findOne({ where: { id: companyId } });
  const companyAgencies = await CompanyAgency.findAll({
    where: { company_id: companyId },
    raw: true,
  })

  const agencyIds = companyAgencies.map(a => a.agencyId)
  const filings = await Filing.findAllForAgencyIds({ ids: agencyIds, companyId: company.id })

  const companyAgenciesRegMap = companyAgencies.reduce((acc, a) => {
    acc[a.agency_id] = a.registration;
    return acc;
  }, {})

  /*const companyFilings = await CompanyFiling.findAll({
    where: { company_id: companyId },
    raw: true
  })

  const companyFilingsMap = companyFilings.reduce((acc, c) => {
    acc[c.filing_id] = c;
    return acc
  }, {})*/

  const now = moment()

  const f = []
  for (let i=0; i< filings.length; i++) {

    const filing = filings[i].get({ plain: true})
    const due_dates = filing.due_dates;

    for (let j=0; j < due_dates.length; j++) {
      const due_date = due_dates[j];
      let calculated_due_date = null;

      if (due_date.offset_type === 'none') {
        calculated_due_date  = moment()
          .year(now.year())
          .month(due_date.fixed_month)
          .date(due_date.fixed_day)
      } else if (due_date.offset_type === 'registration') {
        // TODO: incorporate the offset DAY
        if (companyAgenciesRegMap[filing.agency_id] == null) {
          calculated_due_date = null;
        } else {
          calculated_due_date = moment(companyAgenciesRegMap[filing.agency_id])
            .set('year', now.year())
            .add(due_date.month_offset, "months")
        }

      } else if (due_date.offset_type === 'year-end') {
        // TODO: incorporate the offset DAY
        calculated_due_date  = moment()
          .year(now.year())
          .month(company.year_end_month)
          .date(company.year_end_day)
          .add(due_date.month_offset, "months")
      }

      f.push({
        id: filing.id,
        name: filing.name,
        occurrence: filing. occurrence,
        agency: filing.agency,
        fields: filing.fields,
        due: calculated_due_date != null ? calculated_due_date.format('YYYY-MM-DD') : null
      })
    }
  }

  return res.status(200).json(f)
}

const getCompanyFilings = async (req, res, next) => {
  const companyId = req.params.companyId;
  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }

  const companyFilings = await CompanyFiling.findAll({
    where: { company_id: companyId },
    include:[{
      model: Filing,
      include: [{
        model: Agency,
        include: [{
          model: Jurisdiction
        }]
      }]
    }]
  })

  return res.status(200).send(companyFilings)
}


const createCompanyFiling =  async (req, res, next) => {
  const companyId = req.params.companyId;
  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }

  const companyFiling = await CompanyFiling.create({
    company_id: companyId,
    filing_id: req.body.filing_id,
    status: req.body.status,
    field_data: req.body.field_data,
    due_date: req.body.due_date
  }, {
    returning: true,
    raw: true
  });

  return res.status(200).send(companyFiling)
}


const updateCompanyFiling =  async (req, res, next) => {
  const companyId = req.params.companyId;
  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }

  const companyFilingId = req.params.companyFilingId

  await CompanyFiling.update({
    status: req.body.status,
    field_data: req.body.field_data,
  }, {
    where: { id: companyFilingId },
  });

  const companyFiling = await CompanyFiling.findOne({
    where: { id: companyFilingId },
    raw: true
  })

  return res.status(200).send(companyFiling)
}

// This endpoint is used by BOTH customer and admin
const getCompanyFiling =  async (req, res, next) => {
  const companyId = req.params.companyId;
  if (req.user.company_id != companyId && req.user.roles.indexOf('admin') === -1) {
    return res.status(401).send()
  }

  const companyFilingId = req.params.companyFilingId
  const companyFiling = await CompanyFiling.findOne({
    where: { id: companyFilingId },
    include: [{
      model: Filing,
      include: [{
        model: Agency,
        include: [{
          model: Jurisdiction
        }]
      }]
    }]
  })

  return res.status(200).send(companyFiling)
}


const getCompanyFilingMessages = async (req, res, next) => {
  const companyId = req.params.companyId;
  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }

  const companyFilingId = req.params.companyFilingId
  const messages = await CompanyFilingMessage.findAll({
    where: { company_filing_id: companyFilingId },
    include: [{
      model: User,
    }]
  });

  return res.status(200).send(messages)
}



// only admin uses this function right now
const getAll = async (req, res, next) => {
  const all = await CompanyFiling.findAll({
    include: [{
      model: Filing,
      include:[{
        model: Agency,
        include: [{
          model: Jurisdiction,
        }]
      }]
    }, {
      model: Company
    }],
  });

  return res.status(200).send(all)
}

// only admin can reject filings
// NOTE: need to update this to save the MESSAGE!
const reject = async (req, res, next) => {
  const companyFilingId = req.params.companyFilingId
  const userId = req.user.id //note: this is the admin user!

  const update = await CompanyFiling.update(
    { status: 'needs-follow-up' },
    { where: { id: companyFilingId } }
  );

  const companyFiling = await CompanyFiling.findOne({
    where: { id: companyFilingId },
    include: [{
      model: Filing,
      include:[{
        model: Agency,
        include: [{
          model: Jurisdiction,
        }]
      }]
    }, {
      model: Company
    }],
  });

  const { reason } = req.body
  await CompanyFilingMessage.create({
    company_filing_id: companyFilingId,
    user_id: userId,
    content: reason
  });

  return res.status(200).send(companyFiling)
}

// admin
const updateStatus =  async (req, res, next) => {
  const companyFilingId = req.params.companyFilingId

  await CompanyFiling.update({
    status: req.body.status,
  }, {
    where: { id: companyFilingId },
  });

  const companyFiling = await CompanyFiling.findOne({
    where: { id: companyFilingId },
    include: [{
      model: Filing,
      include:[{
        model: Agency,
        include: [{
          model: Jurisdiction,
        }]
      }]
    }, {
      model: Company
    }],
  });

  return res.status(200).send(companyFiling)
}

export {
  getFilingsForCompany,
  getCompanyFilings,
  createCompanyFiling,
  getCompanyFiling,
  updateCompanyFiling,
  getCompanyFilingMessages,

  //admin
  getAll,
  reject,
  updateStatus
}
