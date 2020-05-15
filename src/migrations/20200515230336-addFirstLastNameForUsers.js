'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE users ADD COLUMN first_name varchar(255);
      ALTER TABLE users ADD COLUMN last_name varchar(255);
      `);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`
      ALTER TABLE users DROP COLUMN first_name;
      ALTER TABLE users DROP COLUMN last_name;
      `);
  }
};
