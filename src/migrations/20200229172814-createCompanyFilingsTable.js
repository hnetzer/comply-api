'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'company_filings',
      {
        id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false
        },
        field_data: {
          type: Sequelize.JSONB,
          allowNull: false
        },
        due_date: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        company_id: {
          allowNull: false,
          type: Sequelize.INTEGER,
           references: {
             model: 'companies',
             key: 'id'
           }
        },
        filing_id: {
          allowNull: false,
          type: Sequelize.INTEGER,
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
    return queryInterface.dropTable('company_filings');
  }
};
