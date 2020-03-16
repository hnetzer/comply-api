import Sequelize from 'sequelize';
import fs from 'fs';
import path from 'path';

// read the sequelize config file
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

let sequelize = null;

const db = {
  dialect: 'postgres',
  logging: false,
};

// if env is not development or test
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], db);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, db);
}

const models = {
  Company: sequelize.import('./Company'),
  Jurisdiction: sequelize.import('./Jurisdiction'),
  CompanyJurisdiction: sequelize.import('./CompanyJurisdiction'),
  Agency: sequelize.import('./Agency'),
  CompanyAgency: sequelize.import('./CompanyAgency'),
  Filing: sequelize.import('./Filing'),
  FilingField: sequelize.import('./FilingField'),
  FilingDueDate: sequelize.import('./FilingDueDate'),
  CompanyFiling: sequelize.import('./CompanyFiling'),
  CompanyFilingMessage: sequelize.import('./CompanyFilingMessage'),
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
