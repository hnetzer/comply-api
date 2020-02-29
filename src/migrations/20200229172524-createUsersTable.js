'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'users',
      {
        id: {
          allowNull: false,
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING
        },
        title: {
          type: Sequelize.STRING
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false
        },
        roles: {
          type: Sequelize.ARRAY(Sequelize.STRING)
        },
        permissions: {
          type: Sequelize.ARRAY(Sequelize.STRING)
        },
        company_id: {
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
    return queryInterface.dropTable('users');
  }
};
