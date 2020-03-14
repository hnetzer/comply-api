'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'filing_fields',
      {
        id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        helper_text: {
          type: Sequelize.STRING
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        order: {
          type: Sequelize.INTEGER
        },
        filing_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'filings',
            key: 'id'
          }
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
      return queryInterface.dropTable('filing_fields');
  }
};
