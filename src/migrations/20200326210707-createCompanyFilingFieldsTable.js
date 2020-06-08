'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'company_filing_fields',
      {
        id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        company_filing_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'company_filings',
            key: 'id'
          }
        },
        filing_field_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'filing_fields',
            key: 'id'
          }
        },
        value: {
          type: Sequelize.STRING,
          allowNull: false
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
      return queryInterface.dropTable('company_filing_fields');
  }
};
