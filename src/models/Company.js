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
    Company.belongsToMany(models.Agency, { through: models.CompanyAgency })
    Company.belongsToMany(models.User, { through: models.UserCompany, as:'users' })
    Company.hasMany(models.Office, { foreignKey: 'company_id' })
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

  Company.prototype.syncAgencies = async function(jurisdictionId) {
    const agencies = await models.Agency.findAll({
      where: { jurisdiction_id: jurisdictionId, disabled: false },
      raw: true
    })

    for (let i=0; i < agencies.length; i++) {
      const agencyId = agencies[i].id
      await models.CompanyAgency.findOrCreate({
        where: { company_id: this.id, agencyId: agencyId }
      })
    }

    return await models.CompanyAgency.findAll({
      where: { company_id: this.id },
      include: [{
        model: models.Agency,
        required: true,
        where: { jurisdiction_id: jurisdictionId }
      }]
    })
  }

  Company.findAllByJurisdictionType = async ({ jurisdictionId, type }) => {
    return await Company.findAll({
      where: { type: type },
      include: [{
        model: models.Jurisdiction,
        where: { id: jurisdictionId },
        required: true
      }]
    })
  }


  return Company;
};
export default company;
