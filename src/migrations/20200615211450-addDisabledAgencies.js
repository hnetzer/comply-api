'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.
      sequelize.query('ALTER TABLE agencies ADD COLUMN disabled boolean NOT NULL DEFAULT false;')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE agencies DROP COLUMN disabled;
    `);
  }
};
