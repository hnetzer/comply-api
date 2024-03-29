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

      ALTER TABLE company_filings DROP COLUMN status;
      ALTER TABLE company_filings DROP COLUMN field_data;

      ALTER TABLE company_filings ALTER COLUMN due_date DROP NOT NULL;
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE company_filings DROP COLUMN filing_due_date_id;
      ALTER TABLE company_filings DROP COLUMN year;
      ALTER TABLE company_filings ADD COLUMN status text;
      ALTER TABLE company_filings ADD COLUMN field_data jsonb;
    `);
  }
};
