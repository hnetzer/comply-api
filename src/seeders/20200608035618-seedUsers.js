'use strict';

const bcrypt = require('bcrypt');

const createUser = async (queryInterface, companyName, { first_name, last_name, title, email, password, roles, permissions}) => {
  let companyId = null
  if (companyName) {
    const cQuery = `SELECT id from companies where name='${companyName}';`
    const companies = await queryInterface.sequelize.query(cQuery);
    const companyRows = companies[0]
    companyId = companyRows[0].id
  }

  await queryInterface.bulkInsert('users', [{
    company_id: companyId,
    first_name: first_name,
    last_name: last_name,
    title: title,
    email: email,
    password: password,
    roles: roles,
    created_at: new Date(),
    updated_at: new Date()
  }])
}

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const password = await bcrypt.hash('test', 10);

    await createUser(queryInterface, 'Company A', {
      first_name: 'Mike',
      last_name: 'Jones',
      title: 'CFO',
      email: 'test1@thinkcomply.com',
      password: password,
      roles: [ 'client' ],
    })

    await createUser(queryInterface, 'Company B', {
      first_name: 'David',
      last_name: 'Coleman',
      title: 'Administrator',
      email: 'test2@thinkcomply.com',
      password: password,
      roles: [ 'client' ],
    })

    await createUser(queryInterface, null, {
      first_name: 'Drew',
      last_name: 'Goldman',
      title: 'admin',
      email: 'admin@thinkcomply.com',
      password: password,
      roles: [ 'admin' ],
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
