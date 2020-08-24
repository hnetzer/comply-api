import models from '../models';

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
    year: {
      type: DataTypes.INTEGER,
      required: true
    }
  }, { underscored: true });

  CompanyFiling.associate = models => {
    CompanyFiling.belongsTo(models.Company, { foreignKey: 'company_id' });
    CompanyFiling.belongsTo(models.Filing, { foreignKey: 'filing_id' });
    CompanyFiling.belongsTo(models.FilingDueDate, { foreignKey: 'filing_due_date_id' })
    CompanyFiling.hasMany(models.CompanyFilingField, { as: 'fields' });
  };

  CompanyFiling.findById = (id) => {
    return CompanyFiling.findOne({
      where: { id: id },
      include: [{
        model: models.CompanyFilingField,
        as: 'fields',
        include: [{
          model: models.FilingField
        }]
      }, {
        model: models.Company
      }, {
        model: models.Filing,
        include: [{
          model: models.Agency,
          include: [{
            model: models.Jurisdiction
          }]
        }]
      }]
    })
  }

  return CompanyFiling;
};
export default companyFiling;
