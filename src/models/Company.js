const company = (sequelize, DataTypes) => {
  const Company = sequelize.define('company', {
    name: {
      type: DataTypes.STRING,
      required: true
    },
    year_end: {
      type: DataTypes.DATEONLY,
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
      type: DataTypes.STRING,
    },
    formation_registration_date: {
      type: DataTypes.DATEONLY,
    }
  });

  Company.associate = models => {
    Company.belongsToMany(models.Jurisdiction, { through: models.CompanyJurisdiction })
  };

  return Company;
};
export default company;
