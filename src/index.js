import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import moment from 'moment';
import models, { sequelize } from './models';
import { seedData, countSeeds } from './seeds'

const eraseDatabaseOnSync = true;
const {
  Jurisdiction,
  Company,
  CompanyJurisdiction,
  Agency,
  Filing
} = models;

console.log('Hello Comply!');

const app = express();
app.use(cors());
app.get('/filings', async (req, res) => {
  const companyId = 2;
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

  res.json(f);
});


sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    await seedData();
    countSeeds();
  }

  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`),
  );
});
