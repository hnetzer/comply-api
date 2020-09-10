'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE filings ADD COLUMN for_llc BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE filings ADD COLUMN for_corp BOOLEAN NOT NULL DEFAULT false;

      ALTER TABLE jurisdictions RENAME COLUMN supported TO corp_supported;
      ALTER TABLE jurisdictions ADD COLUMN llc_supported BOOLEAN NOT NULL DEFAULT false;
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE filings DROP COLUMN for_llc;
      ALTER TABLE filings DROP COLUMN for_corp;
      ALTER TABLE jurisdictions RENAME COLUMN corp_supported TO supported;
      ALTER TABLE jurisdictions DROP COLUMN llc_supported;
    `);
  }
};
