const companyJurisdiction = (sequelize, DataTypes) => {
  const CompanyJurisdiction = sequelize.define('company_jurisdiction', {
  }, { underscored: true });

  CompanyJurisdiction.associate = models => {
  };

  return CompanyJurisdiction;
};

export default companyJurisdiction;
