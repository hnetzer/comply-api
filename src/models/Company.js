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
    }
  });

  Company.associate = models => {
    Company.belongsToMany(models.Jurisdiction, { through: models.CompanyJurisdiction })
  };

  return Company;
};
export default company;
