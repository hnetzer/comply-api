import express from 'express';
import passport from 'passport';

import { getFiling } from '../controllers/filingController';

// Filings Router
const router = express.Router();
router.use(passport.authenticate('jwt', { session: false }));

// Routes
router.get('/:filingId', getFiling)


module.exports = (app) =>{
  app.use('/filings', router);
}
