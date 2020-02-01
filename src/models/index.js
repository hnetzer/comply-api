import Sequelize from 'sequelize';

let sequelize = null;

// checks if env is Heroku, if so, sets sequelize to utilize the database hosted on heroku
if (process.env.DATABASE_URL) {
  // the application is executed on Heroku ... use the postgres database
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect:  'postgres',
    logging: false,
  })
} else {
  sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
      dialect: 'postgres',
      logging: false,
    },
  );
}

const models = {
  Company: sequelize.import('./Company'),
  Jurisdiction: sequelize.import('./Jurisdiction'),
  CompanyJurisdiction: sequelize.import('./CompanyJurisdiction'),
  Agency: sequelize.import('./Agency'),
  CompanyAgency: sequelize.import('./CompanyAgency'),
  Filing: sequelize.import('./Filing'),
  CompanyFiling: sequelize.import('./CompanyFiling'),
  User: sequelize.import('./User'),
  Office: sequelize.import('./Office')
};

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

export { sequelize };
export default models;
