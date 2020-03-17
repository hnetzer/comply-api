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
          allowNull: false
        },
        occurrence: {
          type: Sequelize.ENUM('annual', 'multiple', 'biennial'),
          allowNull: false
        },
        agency_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
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
