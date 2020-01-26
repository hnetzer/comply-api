import { Op } from 'sequelize';
import models from '../models';

const filing = (sequelize, DataTypes) => {
  const Filing = sequelize.define('filing', {
    name: {
      type: DataTypes.STRING,
    },
    due_date: {
      type: DataTypes.DATEONLY,
    },
    due_date_year_end_offset_months: {
      type: DataTypes.FLOAT,
    },
    due_date_reg_offset_months: {
      type: DataTypes.FLOAT
    }
  }, { underscored: true });

  Filing.associate = models => {
    Filing.belongsTo(models.Agency, {foreignKey: 'agency_id'});
  };

  Filing.findAllForAgencyIds = ({ ids }) => {
    return Filing.findAll({
      where: { agency_id: { [Op.in]: ids } },
      include: [{
        model: models.Agency,
        include:[{
          model: models.Jurisdiction,
        }]
      }],
    })
  }

  return Filing;
};
export default filing;
