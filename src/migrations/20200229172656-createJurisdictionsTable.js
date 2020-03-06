'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'jurisdictions',
      {
        id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          required: true,
          type: Sequelize.STRING
        },
        state: {
          type: Sequelize.STRING,
        },
        type: {
          type: Sequelize.STRING,
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('jurisdictions');
  }
};
