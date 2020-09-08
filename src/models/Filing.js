import { Op } from 'sequelize';
import models from '../models';
import moment from 'moment'

const filing = (sequelize, DataTypes) => {
  const Filing = sequelize.define('filing', {
    name: {
      type: DataTypes.STRING,
    },
    occurrence: {
      type: DataTypes.ENUM('annual', 'multiple', 'biennial')
    },
    website: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    disabled: {
      type: DataTypes.BOOLEAN,
    },
    for_corp: {
      type: DataTypes.BOOLEAN,
    },
    for_llc: {
      type: DataTypes.BOOLEAN,
    }
  }, { underscored: true });

  Filing.associate = models => {
    Filing.belongsTo(models.Agency, {foreignKey: 'agency_id'});
    Filing.hasMany(models.FilingField, { as: 'fields' });
    Filing.hasMany(models.FilingDueDate, { as: 'due_dates' });
  };

  Filing.findAllForCompany = (companyId) => {
    return Filing.findAll({
      where: { disabled: false },
      include: [{
        model: models.Agency,
        required: true,
        where: { disabled: false },
        include: [{
          model: models.CompanyAgency,
          required: true,
          where: { company_id: companyId, registered: true  }
        }, {
          model: models.Jurisdiction
        }]
      }, {
        model: models.FilingDueDate,
        as: 'due_dates'
      }],
    })
  }

  Filing.prototype.findInstances = async function (company, year) {

    const companyAgency = await models.CompanyAgency.findOne({
      where: { agency_id: this.agency_id, company_id: company.id },
      raw: true
    })

    const dueDates = await models.FilingDueDate.findAll({
      where: { filing_id: this.id }
    })

    const instances = dueDates.map(dueDate => {
      return {
        year: year,
        company_id: company.id,
        filing_id: this.id,
        filing_due_date_id: dueDate.id,
        due_date: dueDate.calculateDate(company, companyAgency.registration, year)
      }
    })

    return instances;
  }

  Filing.findOneWithDetails = async (id) => {
    const f = await Filing.findOne({
      where: { id: id }, raw: true
    });
    const a = await models.Agency.findOne({
      where: { id: f.agency_id }, raw: true
    });
    const j = await models.Jurisdiction.findOne({
      where: { id: a.jurisdiction_id }, raw: true
    });
    f.agency = a;
    f.jurisdiction = j;
    return f;
  }

  return Filing;
};
export default filing;
