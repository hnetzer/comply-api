import models from '../models';

const companyFiling = (sequelize, DataTypes) => {
  const CompanyFiling = sequelize.define('company_filing', {
    due_date: {
      type: DataTypes.DATEONLY
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

  CompanyFiling.createIfNotExists = async function ({ company_id, filing_id,
    filing_due_date_id, year, due_date }) {

    const cf = {
      company_id: company_id,
      filing_id: filing_id,
      filing_due_date_id: filing_due_date_id,
      year: year
    }

    const record = await CompanyFiling.findOne({
      where: cf
    })

    if (!record) {
      const result = await CompanyFiling.create({ ...cf, due_date: due_date });
      return result;
    }
    return null;
  }

  return CompanyFiling;
};
export default companyFiling;
