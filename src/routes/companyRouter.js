import express from 'express';
import passport from 'passport';

import {
  updateCompany,
  createCompany,
  updateOffices,
  getCompany,
  setWantsPremium,
} from '../controllers/companyController'

import {
  updateCompanyAgencies,
  getCompanyAgencies,
  updateCompanyAgency,
} from '../controllers/companyAgencyController'

import {
  getCompanyJurisdictions
} from '../controllers/companyJurisdictionController'

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

router.post('/', createCompany)
router.get('/:companyId', getCompany)
router.put('/:companyId', updateCompany);
router.put('/:companyId/premium', setWantsPremium);
router.put('/:companyId/offices', updateOffices);

router.get('/:companyId/companyagencies', getCompanyAgencies);
router.put('/:companyId/companyagencies', updateCompanyAgencies);
router.put('/:companyId/companyagencies/:agencyId', updateCompanyAgency);

router.get('/:companyId/jurisdictions', getCompanyJurisdictions);

// Company Filing Endpoints
router.get('/:companyId/companyfilings', getCompanyFilings)
router.post('/:companyId/companyfilings', createCompanyFiling);
router.get('/:companyId/companyfilings/:companyFilingId', getCompanyFiling);
router.put('/:companyId/companyfilings/:companyFilingId', updateCompanyFiling);

router.get('/:companyId/companyfilings/:companyFilingId/messages', getCompanyFilingMessages);

module.exports = (app) => {
  app.use('/company', router);
}
