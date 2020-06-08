'use strict';

const createAgency = async (queryInterface, agencyName, jurisdictionName) => {
  const query = `SELECT id from jurisdictions where name='${jurisdictionName}';`
  const jurisdictions = await queryInterface.sequelize.query(query);
  const jurisdictionRows = jurisdictions[0]
  await queryInterface.bulkInsert('agencies', [{
    name: agencyName,
    jurisdiction_id: jurisdictionRows[0].id,
    created_at: new Date(),
    updated_at: new Date()
  }])
}

module.exports = {
  up: async (queryInterface, Sequelize) => {

    // First create all of the jurisdictions
    await queryInterface.bulkInsert('jurisdictions', [
      { name: 'Delaware', state: 'Delaware', type: 'state', created_at: new Date(), updated_at: new Date() },
      { name: 'California', state: 'California', type: 'state', created_at: new Date(), updated_at: new Date() },
      { name: 'San Francisco County', state: 'California', type: 'county', created_at: new Date(), updated_at: new Date() },
      { name: 'San Francisco', state: 'California', type: 'city', created_at: new Date(), updated_at: new Date() },
      { name: 'Los Angeles County', state: 'California', type: 'county', created_at: new Date(), updated_at: new Date() },
      { name: 'Los Angeles', state: 'California', type: 'city', created_at: new Date(), updated_at: new Date() },
      { name: 'New York', state: 'New York', type: 'state', created_at: new Date(), updated_at: new Date() },
      { name: 'New York City', state: 'New York', type: 'state', created_at: new Date(), updated_at: new Date() }
    ]);

    // Next create the agencies
    await createAgency(queryInterface, 'Secretary of State', 'Delaware')
    await createAgency(queryInterface,'Franchise Tax Board', 'California')
    await createAgency(queryInterface, 'Secretary of State', 'California')
    await createAgency(queryInterface, 'Assessor', 'San Francisco County')
    await createAgency(queryInterface, 'Tax and Treasurer', 'San Francisco')
    await createAgency(queryInterface, 'Assessor', 'Los Angeles County')
    await createAgency(queryInterface, 'Office of Finance', 'Los Angeles')
    await createAgency(queryInterface, 'Secretary of State', 'New York')
    await createAgency(queryInterface, 'Department of Finance', 'New York City')
    await createAgency(queryInterface, 'Department of Taxation and Finance', 'New York')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('agencies', null, {});
    await queryInterface.bulkDelete('jurisdictions', null, {});
  }
};
