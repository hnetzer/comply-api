'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'company_jurisdictions',
      {
        company_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'companies',
            key: 'id'
          }
        },
        jurisdiction_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'jurisdictions',
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
    return queryInterface.dropTable('company_jurisdictions');
  }
};
