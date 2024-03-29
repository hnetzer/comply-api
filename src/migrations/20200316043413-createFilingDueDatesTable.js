'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'filing_due_dates',
      {
        id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        offset_type: {
          type: Sequelize.ENUM('none', 'registration', 'year-end'),
          allowNull: false,
        },
        fixed_month: {
          type: Sequelize.INTEGER
        },
        fixed_day: {
          type: Sequelize.INTEGER,
        },
        month_offset: {
          type: Sequelize.INTEGER
        },
        day_offset: {
          type: Sequelize.STRING
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
    return queryInterface.dropTable('filing_due_dates');
  }
};
