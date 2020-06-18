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

  return Company;
};
export default company;
