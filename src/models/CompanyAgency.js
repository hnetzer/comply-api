const companyAgency = (sequelize, DataTypes) => {
  const CompanyAgency = sequelize.define('company_agency', {
    registration: {
      type: DataTypes.DATEONLY,
    },
    registered: {
      type: DataTypes.BOOLEAN,
    }
  }, { underscored: true });

  CompanyAgency.associate = models => {
    CompanyAgency.belongsTo(models.Agency, { foreignKey: 'agency_id' });
    CompanyAgency.belongsTo(models.Company, { foreignKey: 'company_id' });
  };

  return CompanyAgency;
};

export default companyAgency;
