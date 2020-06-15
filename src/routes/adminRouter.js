import express from 'express';
import passport from 'passport';

import {
  getAll,
  reject,
  updateStatus,
  getCompanyFiling
} from '../controllers/companyFilingsController';

import {
  getJurisdictions,
  createJurisdiction,
  updateJurisdiction,
  deleteJurisdiction
} from '../controllers/jurisdictionsController';

import {
  getAgencies,
  createAgency,
  updateAgency,
  deleteAgency
} from '../controllers/agenciesController';

import {
  getAllFilings,
  createFiling,
  getFiling,
  updateFiling,
  deleteFiling
} from '../controllers/filingController';

import {
  getCompanies,
  adminGetCompany
} from '../controllers/companyController';

const adminCheck = (req, res, next) => {
  const { roles, permissions } = req.user
  if (roles.indexOf('admin') === -1) {
    res.status(401).send()
    return;
  }
  next();
}

// Filings Router
const router = express.Router();
router.use(passport.authenticate('jwt', { session: false }));
router.use(adminCheck)

// Routes
router.get('/companyfilings', getAll)
router.get('/companyfilings/:companyFilingId', getCompanyFiling)
router.put('/companyfilings/:companyFilingId/reject', reject)
router.put('/companyfilings/:companyFilingId', updateStatus)

router.get('/jurisdictions', getJurisdictions)
router.post('/jurisdictions', createJurisdiction)
router.put('/jurisdictions/:jurisdictionId', updateJurisdiction)
router.delete('/jurisdictions/:jurisdictionId', deleteJurisdiction)

router.get('/agencies', getAgencies)
router.post('/agencies', createAgency)
router.put('/agencies/:agencyId', updateAgency)
router.delete('/agencies/:agencyId', deleteAgency)

router.get('/filings', getAllFilings)
router.get('/filings/:filingId', getFiling)
router.post('/filings', createFiling)
router.put('/filings/:filingId', updateFiling)
router.delete('/filings/:filingId', deleteFiling)

router.get('/companies', getCompanies)
router.get('/companies/:companyId', adminGetCompany)

module.exports = (app) =>{
  app.use('/admin', router);
}
