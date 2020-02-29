import express from 'express';
import passport from 'passport';

import { getAll, reject, updateStatus } from '../controllers/companyFilingsController'

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
router.put('/companyfilings/:companyFilingId/reject', reject)
router.put('/companyfilings/:companyFilingId', updateStatus)


module.exports = (app) =>{
  app.use('/admin', router);
}
