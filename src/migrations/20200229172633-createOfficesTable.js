'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'offices',
      {
        id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        address: {
          type: Sequelize.STRING
        },
        city: {
          type: Sequelize.STRING
        },
        state: {
          type: Sequelize.STRING,
        },
        zip: {
          type: Sequelize.STRING,
        },
        company_id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'companies',
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
    return queryInterface.dropTable('offices');
  }
};
