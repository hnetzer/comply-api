'use strict';

const createOffice = async (queryInterface, companyName, { address, city, state, zip }) => {
  const query = `SELECT id from companies where name='${companyName}';`
  const companies = await queryInterface.sequelize.query(query);
  const companyRows = companies[0]

  await queryInterface.bulkInsert('offices', [{
    company_id: companyRows[0].id,
    address: address,
    city: city,
    state: state,
    zip: zip,
    created_at: new Date(),
    updated_at: new Date()
  }])
}

const createCompanyJurisdiction = async (queryInterface, companyName, jurisdictionName) => {
  const cQuery = `SELECT id from companies where name='${companyName}';`
  const companies = await queryInterface.sequelize.query(cQuery);
  const companyRows = companies[0]

  const jQuery = `SELECT id from jurisdictions where name='${jurisdictionName}';`
  const jurisdictions = await queryInterface.sequelize.query(jQuery);
  const jurisdictionRows = jurisdictions[0]

  await queryInterface.bulkInsert('company_jurisdictions', [{
    company_id: companyRows[0].id,
    jurisdiction_id: jurisdictionRows[0].id,
    created_at: new Date(),
    updated_at: new Date()
  }])
}

module.exports = {
  up: async (queryInterface, Sequelize) => {

    // First create the companies
    await queryInterface.bulkInsert('companies', [
      { name: 'Company A',
        year_end_month: 11,
        year_end_day: 31,
        type: 'Corporation',
        tax_class: 'C Corp',
        formation_state: 'Delaware',
        onboarded: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Company B',
        year_end_month: 5,
        year_end_day: 30,
        type: 'Corporation',
        tax_class: 'C Corp',
        formation_state: 'California',
        onboarded: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    const sfOffice = {
      address: '1601 Mission St. #800',
      city: 'Oakland',
      state: 'California',
      zip: '94110'
    }
    const nyOffice = {
      address: '320 W 37th St.',
      city: 'New York',
      state: 'New York',
      zip: '10018'
    }

    // Next create the offices
    await createOffice(queryInterface, 'Company A', sfOffice)
    await createOffice(queryInterface, 'Company B', sfOffice)
    await createOffice(queryInterface, 'Company B', nyOffice)

    // Finally associate the companies to jurisdictions
    await createCompanyJurisdiction(queryInterface, 'Company A', 'California')
    await createCompanyJurisdiction(queryInterface, 'Company A', 'San Francisco County')
    await createCompanyJurisdiction(queryInterface, 'Company A', 'San Francisco')
    await createCompanyJurisdiction(queryInterface, 'Company A', 'Delaware')

    await createCompanyJurisdiction(queryInterface, 'Company B', 'California')
    await createCompanyJurisdiction(queryInterface, 'Company B', 'San Francisco')
    await createCompanyJurisdiction(queryInterface, 'Company B', 'San Francisco County')
    await createCompanyJurisdiction(queryInterface, 'Company B', 'New York')
    await createCompanyJurisdiction(queryInterface, 'Company B', 'New York City')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('company_jurisdictions', null, {});
    await queryInterface.bulkDelete('offices', null, {});
    await queryInterface.bulkDelete('companies', null, {});
  }
};
