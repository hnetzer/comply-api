import models from '../models';

const companyFilingField = (sequelize, DataTypes) => {
  const CompanyFilingField = sequelize.define('company_filing_field', {
    value: {
      type: DataTypes.STRING,
    }
  }, { underscored: true });

  CompanyFilingField.associate = models => {
    CompanyFilingField.belongsTo(models.CompanyFiling, { foreignKey: 'company_filing_id' });
    CompanyFilingField.belongsTo(models.FilingField, { foreignKey: 'filing_field_id' })
  };

  return CompanyFilingField;
};

export default companyFilingField;
