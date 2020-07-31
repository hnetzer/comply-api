'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE company_agencies ALTER COLUMN registered SET DEFAULT true;
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE company_agencies ALTER COLUMN registered SET DEFAULT false;
    `);
  }
};
