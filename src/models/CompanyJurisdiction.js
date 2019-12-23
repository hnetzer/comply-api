const companyJurisdiction = (sequelize, DataTypes) => {
  const CompanyJurisdiction = sequelize.define('company_jurisdiction', {
    registration: {
      type: DataTypes.DATEONLY,
    },
  });

  CompanyJurisdiction.associate = models => {
    CompanyJurisdiction.belongsTo(models.Company, {foreignKey: 'company_id'});
    CompanyJurisdiction.belongsTo(models.Jurisdiction, {foreignKey: 'jurisdiction_id'});
  };

  return CompanyJurisdiction;
};

export default companyJurisdiction;
