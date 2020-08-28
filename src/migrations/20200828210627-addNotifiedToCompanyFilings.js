'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE company_filings ADD COLUMN notified BOOLEAN NOT NULL DEFAULT false;;
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE company_filings DROP COLUMN notified;
    `);
  }
};
