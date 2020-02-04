import { Op } from 'sequelize';
import moment from 'moment';
import models, { sequelize } from '../models';

const {
  Company,
  CompanyAgency,
  CompanyFiling,
  Filing
} = models;


const getCompanyFilings =  async (req, res, next) => {
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

  const companyFilings = await CompanyFiling.findAll({
    where: { company_id: companyId },
    raw: true
  })

  const companyFilingsMap = companyFilings.reduce((acc, c) => {
    acc[c.filing_id] = c;
    return acc
  }, {})


  const f = filings.map(f => {
    const filing = f.get({ plain: true })

    // If this years filing has already been started
    const companyFiling = companyFilingsMap[filing.id]
    if (companyFiling) {
      filing.companyFilingId = companyFiling.id;
      filing.status = companyFiling.status;
      filing.due = companyFiling.due_date;
      return filing
    }

    // Otherwise let's figure out the due_date
    filing.due = filing.due_date
    if (filing.due_date_year_end_offset_months) {
      const offset = filing.due_date_year_end_offset_months;
      const yearEnd = moment().year(2020).month(company.year_end_month).date(company.year_end_day);
      yearEnd.add(offset, 'months');
      filing.due = yearEnd.format('2020-MM-DD')
    }

    /* if (filing.due_date_reg_offset_months) {
      const offset = filing.due_date_reg_offset_months;
      const reg = moment(cjMap[filing.agency.jurisdiction.id].reg)
      reg.add(offset, 'months');
      filing.due = reg.format('2020-MM-DD')
    } */

    return filing
  })
  return res.status(200).json(f)
}

// TODO: should calculate due date on the server probably
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

// TODO: should calculate due date on the server probably
const updateCompanyFiling =  async (req, res, next) => {
  const companyId = req.params.companyId;
  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }

  const companyFilingId = req.params.companyFilingId

  const companyFiling = await CompanyFiling.update({
    status: req.body.status,
    field_data: req.body.field_data,
  }, {
    where: { id: companyFilingId },
  });

  return res.status(200).send({})
}

// TODO: should calculate due date on the server probably
const getFiling =  async (req, res, next) => {
  const companyId = req.params.companyId;
  if (req.user.company_id != companyId) {
    return res.status(401).send()
  }

  const companyFilingId = req.params.companyFilingId
  const companyFiling = await CompanyFiling.findOne({
    where: { id: companyFilingId },
    raw: true
  })

  const filing = await Filing.findOneWithDetails(companyFiling.filing_id)

  companyFiling.filing = filing;
  return res.status(200).send(companyFiling)
}

export {
  getCompanyFilings,
  createCompanyFiling,
  getFiling,
  updateCompanyFiling
}
