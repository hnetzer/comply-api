'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.
      sequelize.query('ALTER TABLE users ADD COLUMN google_id TEXT;')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE users DROP COLUMN google_id;
    `);
  }
};
