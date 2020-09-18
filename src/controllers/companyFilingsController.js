import { Op } from 'sequelize';
import moment from 'moment';
import models, { sequelize } from '../models';
import { userCanAccessCompany } from '../auth';

const {
  Company,
  CompanyAgency,
  FilingDueDate,
  CompanyFiling,
  CompanyFilingField,
  CompanyFilingMessage,
  Filing,
  FilingField,
  Agency,
  Jurisdiction,
  User
} = models;


const getCompanyFilings = async (req, res, next) => {
  const companyId = req.params.companyId;

  if (!userCanAccessCompany(req.user, companyId) && req.user.roles.indexOf('admin') === -1) {
    return res.status(401).send()
  }

  // Override default start and end dates with query params
  let start = moment()
  let end = moment().add(1, 'y')
  if (req.query.startDate != null && req.query.endDate != null) {
    start = moment(req.query.startDate)
    end = moment(req.query.endDate)
  }

  const filterByDate = {
    [Op.gte]: start.format('YYYY-MM-DD'),
    [Op.lte]: end.format('YYYY-MM-DD')
  }

  let dueDateFilter = filterByDate
  if (req.query.unscheduled) {
    dueDateFilter = {
      [Op.or]: [filterByDate, null]
    }
  }

  const companyFilings = await CompanyFiling.findAll({
    where: {
      company_id: companyId,
      due_date: dueDateFilter
    },
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

  const { filing_id, status, due_date, fields } = req.body;

  const result = await CompanyFiling.create({
    company_id: companyId,
    filing_id: filing_id,
    status: status,
    due_date: due_date
  });

  const field_data = fields.map(f => ({ ...f, company_filing_id: result.id }))
  await CompanyFilingField.bulkCreate(field_data)

  const companyFiling = await CompanyFiling.findById(result.id)

  return res.status(200).send(companyFiling)
}


const updateCompanyFiling =  async (req, res, next) => {
  const companyId = req.params.companyId;
  if (req.user.company_id != companyId && req.user.roles.indexOf('admin') === -1) {
    return res.status(401).send()
  }

  const companyFilingId = req.params.companyFilingId
  const { status, fields } = req.body
  await CompanyFiling.update({
    status: req.body.status,
  }, {
    where: { id: companyFilingId },
  });

  for (let i=0; i < fields.length; i++) {
    const field = fields[i]
    if (field.id) {
      await CompanyFilingField.update({
        value: field.value
      }, {
        where: {
          id: field.id,
          company_filing_id: companyFilingId,
          filing_field_id: field.filing_field_id
        }
      })
    } else {
      // This could be a new field that we've added
      await CompanyFilingField.create({
        value: field.value,
        company_filing_id: companyFilingId,
        filing_field_id: field.filing_field_id
      })
    }
  }

  const companyFiling = await CompanyFiling.findById(companyFilingId)
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
    }, {
      model: CompanyFilingField,
      as: 'fields',
      include: [{
        model: FilingField
      }]
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

  const companyFiling = await CompanyFiling.findById(companyFilingId)

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

  const companyFiling = await CompanyFiling.findById(companyFilingId)

  return res.status(200).send(companyFiling)
}

export {
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
