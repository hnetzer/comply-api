const companyFilingMessage = (sequelize, DataTypes) => {
  const CompanyFilingMessage = sequelize.define('company_filing_messages', {
    content: {
      type: DataTypes.STRING,
      required: true
    }
  }, { underscored: true });

  CompanyFilingMessage.associate = models => {
    CompanyFilingMessage.belongsTo(models.CompanyFiling, { foreignKey: 'company_filing_id' });
    CompanyFilingMessage.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return CompanyFilingMessage;
};
export default companyFilingMessage;
