import { Op } from 'sequelize';
import models from '../models';

const filing = (sequelize, DataTypes) => {
  const Filing = sequelize.define('filing', {
    name: {
      type: DataTypes.STRING,
    },
    occurrence: {
      type: DataTypes.ENUM('annual', 'multiple', 'biennial')
    },
    disabled: {
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
