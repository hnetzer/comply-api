import express from 'express';
import passport from 'passport';

import { updateSettings } from '../controllers/usersController';

// Filings Router
const router = express.Router();
router.use(passport.authenticate('jwt', { session: false }));

// Routes
router.put('/:userId/settings', updateSettings)

module.exports = (app) =>{
  app.use('/users', router);
}
