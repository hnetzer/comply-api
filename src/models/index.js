import Sequelize from 'sequelize';

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    dialect: 'postgres',
    logging: false,
  },
);

const models = {
  Company: sequelize.import('./Company'),
  Jurisdiction: sequelize.import('./Jurisdiction'),
  CompanyJurisdiction: sequelize.import('./CompanyJurisdiction'),
};

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

export { sequelize };
export default models;
