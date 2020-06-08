'use strict';

const createFiling = async (queryInterface, { filing, agency, jurisdiction, due_dates }) => {
  const jQuery = `SELECT id from jurisdictions where name='${jurisdiction}';`
  const jurisdictions = await queryInterface.sequelize.query(jQuery);
  const jurisdictionRows = jurisdictions[0];

  const aQuery = `
    SELECT id
    from agencies
    where name='${agency}' and jurisdiction_id=${jurisdictionRows[0].id};
  `
  const agencies = await queryInterface.sequelize.query(aQuery);
  const agencyRows = agencies[0];

  await queryInterface.bulkInsert('filings', [{
    name: filing.name,
    occurrence: filing.occurrence,
    agency_id: agencyRows[0].id,
    created_at: new Date(),
    updated_at: new Date()
  }])

  const fQuery = `
    SELECT id
    FROM filings
    WHERE name='${filing.name}' AND agency_id=${agencyRows[0].id};
  `
  const filings = await queryInterface.sequelize.query(fQuery);
  const filingsRows = filings[0];

  const dates = due_dates.map(d => ({
    ...d,
    filing_id: filingsRows[0].id,
    created_at: new Date(),
    updated_at: new Date()
  }))

  await queryInterface.bulkInsert('filing_due_dates', dates)
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await createFiling(queryInterface, {
      filing: { name: 'Annual Report', occurrence: 'annual'},
      agency: 'Secretary of State',
      jurisdiction: 'Delaware',
      due_dates: [
        { offset_type: 'none', fixed_month: 2, fixed_day: 1}
      ]
    })

    await createFiling(queryInterface, {
      filing: { name: 'Statement of Information', occurrence: 'annual' },
      agency: 'Secretary of State',
      jurisdiction: 'California',
      due_dates: [
        { offset_type: 'registration', month_offset: 11 }
      ]
    })


    await createFiling(queryInterface, {
      filing: { name: 'Form 571-L', occurrence: 'annual' },
      agency: 'Assessor',
      jurisdiction: 'San Francisco County',
      due_dates: [
        { offset_type: 'none', fixed_month: 4, fixed_day: 1 }
      ]
    })

    await createFiling(queryInterface, {
      filing: { name: 'Business License', occurrence: 'annual' },
      agency: 'Tax and Treasurer',
      jurisdiction: 'San Francisco',
      due_dates: [
        { offset_type: 'none', fixed_month: 4, fixed_day: 31 }
      ]
    })

    await createFiling(queryInterface, {
      filing: { name: 'Payroll Tax', occurrence: 'annual' },
      agency: 'Tax and Treasurer',
      jurisdiction: 'San Francisco',
      due_dates: [
        { offset_type: 'none', fixed_month: 1, fixed_day: 28 }
      ]
    })

    await createFiling(queryInterface, {
      filing: { name: 'Payroll Tax Estimate', occurrence: 'multiple' },
      agency: 'Tax and Treasurer',
      jurisdiction: 'San Francisco',
      due_dates: [
        { offset_type: 'none', fixed_month: 4, fixed_day: 28 },
        { offset_type: 'none', fixed_month: 6, fixed_day: 31 },
        { offset_type: 'none', fixed_month: 9, fixed_day: 31 },
      ]
    })

    await createFiling(queryInterface, {
      filing: { name: 'Franchise Tax Estimate', occurrence: 'multiple' },
      agency: 'Secretary of State',
      jurisdiction: 'Delaware',
      due_dates: [
        { offset_type: 'none', fixed_month: 6, fixed_day: 1 },
        { offset_type: 'none', fixed_month: 9, fixed_day: 1 },
        { offset_type: 'none', fixed_month: 11, fixed_day: 1 },
      ]
    })

    await createFiling(queryInterface, {
      filing: { name: 'Form 571-L', occurrence: 'annual' },
      agency: 'Assessor',
      jurisdiction: 'Los Angeles County',
      due_dates: [
        { offset_type: 'none', fixed_month: 4, fixed_day: 1 },
      ]
    })

    await createFiling(queryInterface, {
      filing: { name: 'Business License', occurrence: 'annual' },
      agency: 'Office of Finance',
      jurisdiction: 'Los Angeles',
      due_dates: [
        { offset_type: 'none', fixed_month: 1, fixed_day: 28 },
      ]
    })

    await createFiling(queryInterface, {
      filing: { name: 'Biennial Statement', occurrence: 'biennial' },
      agency: 'Secretary of State',
      jurisdiction: 'New York',
      due_dates: [
        { offset_type: 'registration', month_offset: 24 },
      ]
    })

    await createFiling(queryInterface, {
      filing: { name: 'NYC-3', occurrence: 'annual' },
      agency: 'Department of Finance',
      jurisdiction: 'New York City',
      due_dates: [
        { offset_type: 'year-end', month_offset: 3, day_offset: '15' },
      ]
    })

    await createFiling(queryInterface, {
      filing: { name: 'NYC-3', occurrence: 'annual' },
      agency: 'Department of Finance',
      jurisdiction: 'New York City',
      due_dates: [
        { offset_type: 'year-end', month_offset: 3, day_offset: '15' },
      ]
    })

    await createFiling(queryInterface, {
      filing: { name: 'NYC-3', occurrence: 'annual' },
      agency: 'Department of Finance',
      jurisdiction: 'New York City',
      due_dates: [
        { offset_type: 'year-end', month_offset: 3, day_offset: '15' },
      ]
    })

    await createFiling(queryInterface, {
      filing: { name: 'Mandatory First Installment', occurrence: 'annual' },
      agency: 'Department of Taxation and Finance',
      jurisdiction: 'New York',
      due_dates: [
        { offset_type: 'year-end', month_offset: 2, day_offset: '15' },
      ]
    })

    await createFiling(queryInterface, {
      filing: { name: 'CT-3 Extension', occurrence: 'annual' },
      agency: 'Department of Taxation and Finance',
      jurisdiction: 'New York',
      due_dates: [
        { offset_type: 'year-end', month_offset: 3, day_offset: '15' },
      ]
    })

    await createFiling(queryInterface, {
      filing: { name: 'CT-3', occurrence: 'annual' },
      agency: 'Department of Taxation and Finance',
      jurisdiction: 'New York',
      due_dates: [
        { offset_type: 'year-end', month_offset: 3, day_offset: '15' },
      ]
    })

    await createFiling(queryInterface, {
      filing: { name: 'NYC-3 Estimate', occurrence: 'annual' },
      agency: 'Department of Finance',
      jurisdiction: 'New York City',
      due_dates: [
        { offset_type: 'year-end', month_offset: 3, day_offset: '15' },
      ]
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('filing_due_dates', null, {});
    await queryInterface.bulkDelete('filings', null, {});
  }
};
