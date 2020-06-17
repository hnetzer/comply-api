'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.
      sequelize.query('ALTER TABLE filing_due_dates ADD COLUMN month_end boolean NOT NULL DEFAULT false;')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE filing_due_dates DROP COLUMN month_end;
    `);
  }
};
