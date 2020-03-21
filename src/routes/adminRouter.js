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
  updateJurisdiction
} from '../controllers/jurisdictionsController';

import {
  getAgencies,
  createAgency,
  updateAgency
} from '../controllers/agenciesController';

import {
  getAllFilings,
  createFiling,
  getFiling,
  updateFiling
} from '../controllers/filingController';

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

router.get('/agencies', getAgencies)
router.post('/agencies', createAgency)
router.put('/agencies/:agencyId', updateAgency)

router.get('/filings', getAllFilings)
router.get('/filings/:filingId', getFiling)
router.post('/filings', createFiling)
router.put('/filings/:filingId', updateFiling)

module.exports = (app) =>{
  app.use('/admin', router);
}
