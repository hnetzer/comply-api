import models from '../models';

const company = (sequelize, DataTypes) => {
  const Company = sequelize.define('company', {
    name: {
      type: DataTypes.STRING,
      required: true
    },
    phone: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
    tax_class: {
      type: DataTypes.STRING,
    },
    year_end_month: {
      type: DataTypes.INTEGER,
    },
    year_end_day: {
      type: DataTypes.INTEGER,
    },
    formation_state: {
      type: DataTypes.STRING
    },
    onboarded: {
      type: DataTypes.BOOLEAN
    },
    wants_premium: {
      type: DataTypes.BOOLEAN
    }
  }, { underscored: true });

  Company.associate = models => {
    Company.belongsToMany(models.Jurisdiction, { through: models.CompanyJurisdiction })
    Company.belongsToMany(models.Agency, { through: models.CompanyAgency})
    Company.hasMany(models.Office, { foreignKey: 'company_id' })
    Company.hasMany(models.User, { foreignKey: 'company_id' })
    Company.hasMany(models.CompanyFiling, { foreignKey: 'company_id' })
  };

  Company.prototype.syncFilings = async function(year) {
    const companyAgencies = await models.CompanyAgency.findAll({
      where: { company_id: this.id, registered: true }
    })

    let count = 0;
    for (let i=0; i< companyAgencies.length; i++) {
      const created = await companyAgencies[i].syncFilings(year)
      if (created) {
        count = count + created;
      }
    }

    return count;
  }

  return Company;
};
export default company;
