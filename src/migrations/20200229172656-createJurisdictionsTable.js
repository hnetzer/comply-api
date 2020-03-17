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
          allowNull: false,
          type: Sequelize.STRING
        },
        state: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        type: {
          allowNull: false,
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
