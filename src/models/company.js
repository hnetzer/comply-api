const company = (sequelize, DataTypes) => {
  const Company = sequelize.define('company', {
    name: {
      type: DataTypes.STRING,
    },
    year_end: {
      type: DataTypes.DATEONLY,
    },
  });

  Company.associate = models => {
    Company.belongsToMany(models.Jurisdiction, { through: models.CompanyJurisdiction })
  };

  return Company;
};
export default company;
