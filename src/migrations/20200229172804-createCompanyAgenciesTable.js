'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'company_agencies',
      {
        registration: {
          type: Sequelize.DATEONLY
        },
        company_id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'companies',
            key: 'id'
          }
        },
        agency_id: {
          allowNull: false,
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
    return queryInterface.dropTable('company_agencies');
  }
};
