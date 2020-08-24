'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE company_filings ADD COLUMN filing_due_date_id INTEGER NOT NULL;

      ALTER TABLE company_filings
      ADD CONSTRAINT company_filings_filing_due_date_id_fkey
      FOREIGN KEY (filing_due_date_id)
      REFERENCES filing_due_dates(id);

      ALTER TABLE company_filings ADD COLUMN year INTEGER NOT NULL;
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE company_filings DROP COLUMN filing_due_date_id;
      ALTER TABLE company_filings DROP COLUMN year;
    `);
  }
};
