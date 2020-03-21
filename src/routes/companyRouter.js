import express from 'express';
import passport from 'passport';

import {
  updateCompany,
  updateOffices,
  getCompany,
  updateAgencies,
  getAgencies,
  updateCompanyAgency
} from '../controllers/companyController'

import {
  getCompanyFilings,
  createCompanyFiling,
  getCompanyFiling,
  updateCompanyFiling,
  getCompanyFilingMessages
} from '../controllers/companyFilingsController'


// Company Routes
const router = express.Router();
router.use(passport.authenticate('jwt', { session: false }));

router.get('/:companyId', getCompany)
router.put('/:companyId', updateCompany);
router.put('/:companyId/offices', updateOffices);
router.put('/:companyId/agencies', updateAgencies);

router.put('/:companyId/companyagencies/:agencyId', updateCompanyAgency);

router.get('/:companyId/filings', getCompanyFilings);
router.get('/:companyId/agencies', getAgencies);

// TODO: change these URLS to be /companyfiling not /filing
router.post('/:companyId/filings', createCompanyFiling);
router.get('/:companyId/filings/:companyFilingId', getCompanyFiling);
router.put('/:companyId/filings/:companyFilingId', updateCompanyFiling);

router.get('/:companyId/companyfilings/:companyFilingId/messages', getCompanyFilingMessages);

module.exports = (app) => {
  app.use('/company', router);
}
