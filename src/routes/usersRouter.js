import express from 'express';
import passport from 'passport';

import { updateSettings, getCompanies } from '../controllers/usersController';

// Filings Router
const router = express.Router();
router.use(passport.authenticate('jwt', { session: false }));

// Routes
router.put('/:userId/settings', updateSettings)
router.get('/:userId/companies', getCompanies)

module.exports = (app) =>{
  app.use('/users', router);
}
