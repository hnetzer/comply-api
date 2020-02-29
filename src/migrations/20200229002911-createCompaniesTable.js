'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'companies',
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
        phone: {
          type: Sequelize.STRING
        },
        type: {
          type: Sequelize.STRING
        },
        tax_class: {
          type: Sequelize.STRING
        },
        year_end_month: {
          type: Sequelize.INTEGER
        },
        year_end_day: {
          type: Sequelize.INTEGER
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
    return queryInterface.dropTable('companies');
  }
};
