'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE filings ADD COLUMN website text;
      ALTER TABLE filings ADD COLUMN description text;
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE filings DROP COLUMN website;
      ALTER TABLE filings DROP COLUMN description;
    `);
  }
};
