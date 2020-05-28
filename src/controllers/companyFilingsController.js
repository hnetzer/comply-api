import { Op } from 'sequelize';
import moment from 'moment';
import models, { sequelize } from '../models';

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



// This fuction gets all the filings for a company that are unstarted
// it determines what filings a company should do based on it's agencies,
// it also calculates filing due dates based on a companies information

// TODO: Move this to the filings controller?
const getFilingsForCompany =  async (req, res, next) => {
  const companyId = req.params.companyId;
  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }

  const startDate = '2020-01-01' // req.params.startDate
  const endDate = '2021-12-31' // req.params.endDate

  const company = await Company.findOne({ where: { id: companyId } });
  const companyAgencies = await CompanyAgency.findAll({
    where: { company_id: companyId },
    raw: true,
  })
  const companyAgenciesMap = companyAgencies.reduce((acc, a) => {
    acc[a.agency_id] = a
    return acc;
  }, {})

  const filings = await Filing.findAllForCompany(companyId)

  const start = moment(startDate)
  const end = moment(endDate)

  const companyFilings = [];

  // Let's loop through all the filings for all the years asked for
  for (let year=start.year(); year <= end.year(); year++) {
    for (let i=0; i< filings.length; i++) {

      const filing = filings[i].get({ plain: true})
      const { due_dates } = filing;

      // Loop through the multiple possible due dates for each filing
      for (let j=0; j < due_dates.length; j++) {
        const { offset_type, fixed_day, fixed_month,
          month_offset, day_offset } = due_dates[j];

        let calculatedDate = null;
        switch(offset_type) {
          case 'year-end': {
            calculatedDate = getYearEndOffsetDate(day_offset, month_offset,
              company.year_end_day, company.year_end_month, year);
            break;
          }
          case 'registration': {
            const companyAgency = companyAgenciesMap[filing.agency_id]
            if (companyAgency != null) {
              calculatedDate = getRegOffsetDate(day_offset, month_offset,
                companyAgency.registration, year);
            }
            break;
          }
          case 'none':
          default: {
            calculatedDate = getDate(fixed_day, fixed_month, year)
          }
        }

        // Add the instance of this filing to the list
        companyFilings.push({
          ...filing,
          due: calculatedDate
        });
      }
    }
  }

  return res.status(200).json(companyFilings)
}

const getDate = (day, month, year) => {
  const d = moment().year(year).month(month).date(day)
  return d.format('YYYY-MM-DD')
}

const getRegOffsetDate = (dayOffset, monthOffset, regDate, year) => {
  const d = moment(regDate).set('year', year)
    .add({ days: dayOffset, months: monthOffset })
  return d.format('YYYY-MM-DD')
}

const getYearEndOffsetDate = (dayOffset, monthOffset, yearEndDay, yearEndMonth, year) => {
  const d = moment().year(year)
    .month(yearEndMonth).date(yearEndDay)
    .add({ days: dayOffset, months: monthOffset })
  return d.format('YYYY-MM-DD')
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
  if (req.user.company_id != companyId) {
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
  const companyFiling = await CompanyFiling.findById(companyFilingId)

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
