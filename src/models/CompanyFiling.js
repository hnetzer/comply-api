const companyFiling = (sequelize, DataTypes) => {
  const CompanyFiling = sequelize.define('company_filing', {
    status: {
      type: DataTypes.STRING,
      required: true
    },
    field_data: {
      type: DataTypes.JSONB,
      required: true
    },
    due_date: {
      type: DataTypes.DATEONLY,
      required: true
    },
  }, { underscored: true });

  CompanyFiling.associate = models => {
    CompanyFiling.belongsTo(models.Company, { foreignKey: 'company_id' });
    CompanyFiling.belongsTo(models.Filing, { foreignKey: 'filing_id' });
  };

  return CompanyFiling;
};
export default companyFiling;