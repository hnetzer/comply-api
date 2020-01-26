const companyAgency = (sequelize, DataTypes) => {
  const CompanyAgency = sequelize.define('company_agency', {
  }, { underscored: true });

  CompanyAgency.associate = models => {
  };

  return CompanyAgency;
};

export default companyAgency;
