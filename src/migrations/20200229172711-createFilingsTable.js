'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'filings',
      {
        id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING,
          required: true
        },
        due_date: {
          type: Sequelize.DATEONLY
        },
        due_date_year_end_offset_months: {
          type: Sequelize.FLOAT
        },
        due_date_reg_offset_months: {
          type: Sequelize.FLOAT
        },
        agency_id: {
          type: Sequelize.INTEGER,
           references: {
             model: 'agencies',
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
    return queryInterface.dropTable('filings');
  }
};
