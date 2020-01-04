import Sequelize from 'sequelize';

let sequelize = null

// checks if env is Heroku, if so, sets sequelize to utilize the database hosted on heroku
console.log("Attempting to connect to the database")
if (process.env.DATABASE_URL) {
  // the application is executed on Heroku ... use the postgres database
  console.log("Looking for a Heroku connection...")
  console.log(process.env.DATABASE_URL)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect:  'postgres',
    protocol: 'postgres'
  })
} else {
  console.log("Looking for a local connection....")
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

console.log(sequelize)


const models = {
  Company: sequelize.import('./Company'),
  Jurisdiction: sequelize.import('./Jurisdiction'),
  CompanyJurisdiction: sequelize.import('./CompanyJurisdiction'),
  Agency: sequelize.import('./Agency'),
  Filing: sequelize.import('./Filing'),
};

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

console.log('At the end of the database connection...')
export { sequelize };
export default models;
