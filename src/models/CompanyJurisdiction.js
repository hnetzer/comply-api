const companyJurisdiction = (sequelize, DataTypes) => {
  const CompanyJurisdiction = sequelize.define('company_jurisdiction', {
    registration: {
      type: DataTypes.DATEONLY,
    },
  });

  CompanyJurisdiction.associate = models => {
  };

  return CompanyJurisdiction;
};

export default companyJurisdiction;
