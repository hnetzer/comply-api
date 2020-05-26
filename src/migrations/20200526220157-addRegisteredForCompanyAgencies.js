'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE company_agencies ADD COLUMN registered BOOLEAN NOT NULL DEFAULT false;
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE company_agencies DROP COLUMN registered;
    `);
  }
};
