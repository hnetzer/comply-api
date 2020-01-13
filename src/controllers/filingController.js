import models, { sequelize } from '../models';
import moment from 'moment';

const {
  Jurisdiction,
  Company,
  CompanyJurisdiction,
  Agency,
  Filing
} = models;

const getFilings = async (req, res) => {
  const companyId = req.query.companyId;
  const company = await Company.findOne({ where: { id: companyId } });

  const jurisdictions = await company.getJurisdictions({ raw: true })
    .map(j => ({ name: j.name, id: j.id, reg: j['company_jurisdiction.registration'] }));

  const cjMap = jurisdictions.reduce((map, j) => {
    map[j.id] = { name: j.name, reg: j.reg }
    return map;
  }, {});

  const agencies = await Agency.findAllForJurisdictionIds({ ids: jurisdictions.map(j => j.id) })
  const filings = await Filing.findAllForAgencyIds({ ids: agencies.map(a => a.id), companyId: company.id })

  const f = filings.map(f => {
    const filing = f.get({ plain: true })

    filing.due = filing.due_date

    if (filing.due_date_year_end_offset_months) {
      const offset = filing.due_date_year_end_offset_months;
      const yearEnd = moment(company.year_end);
      yearEnd.add(offset, 'months');
      filing.due = yearEnd.format('2020-MM-DD')
    }

    if (filing.due_date_reg_offset_months) {
      const offset = filing.due_date_reg_offset_months;
      const reg = moment(cjMap[filing.agency.jurisdiction.id].reg)
      reg.add(offset, 'months');
      filing.due = reg.format('2020-MM-DD')
    }

    return filing
  })

  res.json({
    filings: f,
    agencies: agencies,
    jurisdictions: jurisdictions,
    company: company
  });
}


export {
  getFilings
}
