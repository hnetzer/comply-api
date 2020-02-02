import express from 'express';
import passport from 'passport';

import {
  updateCompany,
  updateOffices,
  getCompany,
  updateAgencies,
} from '../controllers/companyController'

import {
  getCompanyFilings,
  createCompanyFiling,
  getFiling
} from '../controllers/companyFilingsController'


// Company Routes
const router = express.Router();
router.use(passport.authenticate('jwt', { session: false }));

router.get('/:companyId', getCompany)
router.put('/:companyId', updateCompany);
router.put('/:companyId/offices', updateOffices);
router.put('/:companyId/agencies', updateAgencies);

router.get('/:companyId/filings', getCompanyFilings);
router.post('/:companyId/filings', createCompanyFiling);
router.get('/:companyId/filings/:companyFilingId', getFiling);

module.exports = (app) => {
  app.use('/company', router);
}
