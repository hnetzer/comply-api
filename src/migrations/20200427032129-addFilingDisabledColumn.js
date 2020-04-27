'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.
      sequelize.query('ALTER TABLE filings ADD COLUMN disabled boolean NOT NULL DEFAULT false;')
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
