'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.
      sequelize.query('ALTER TABLE company_filings ALTER COLUMN field_data DROP NOT NULL;')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(``);
  }
};
