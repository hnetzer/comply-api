'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.
      sequelize.query('ALTER TABLE jurisdictions ADD COLUMN supported boolean NOT NULL DEFAULT false;')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE jurisdictions DROP COLUMN supported;
    `);
  }
};
