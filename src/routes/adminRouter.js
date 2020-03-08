import express from 'express';
import passport from 'passport';

import { getAll, reject, updateStatus, getFiling } from '../controllers/companyFilingsController'
import {
  getJurisdictions,
  createJurisdiction,
  updateJurisdiction
} from '../controllers/jurisdictionsController'

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
router.get('/companyfilings/:companyFilingId', getFiling)
router.put('/companyfilings/:companyFilingId/reject', reject)
router.put('/companyfilings/:companyFilingId', updateStatus)

router.get('/jurisdictions', getJurisdictions)
router.post('/jurisdictions', createJurisdiction)
router.put('/jurisdictions/:jurisdictionId', updateJurisdiction)


module.exports = (app) =>{
  app.use('/admin', router);
}
