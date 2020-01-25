const jurisdiction = (sequelize, DataTypes) => {
  const Jurisdiction = sequelize.define('jurisdiction', {
    name: DataTypes.STRING,
    // state: DataTypes.STRING,
    // type: DataTypes.STRING
  });

  Jurisdiction.associate = models => {
    Jurisdiction.belongsToMany(models.Company, { through: models.CompanyJurisdiction })
  };

  return Jurisdiction;
};
export default jurisdiction;
