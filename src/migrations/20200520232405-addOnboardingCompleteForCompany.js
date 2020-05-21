'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE companies ADD COLUMN onboarded BOOLEAN NOT NULL DEFAULT false;
    `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE companies DROP COLUMN onboarded;
    `);
  }
};
