const companyAgency = (sequelize, DataTypes) => {
  const CompanyAgency = sequelize.define('company_agency', {
    registration: {
      type: DataTypes.DATEONLY,
    },
  }, { underscored: true });

  CompanyAgency.associate = models => {
  };

  return CompanyAgency;
};

export default companyAgency;
