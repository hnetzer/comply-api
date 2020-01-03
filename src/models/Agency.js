import { Op } from 'sequelize';
import models from '../models';

const agency = (sequelize, DataTypes) => {
  const Agency = sequelize.define('agency', {
    name: {
      type: DataTypes.STRING,
    },
  });

  Agency.associate = models => {
    Agency.belongsTo(models.Jurisdiction, {foreignKey: 'jurisdiction_id'});
  };

  Agency.findAllForJurisdictionIds = ({ ids }) => {
    return Agency.findAll({
      where: { jurisdiction_id: { [Op.in]: ids } },
      include: [{
        model: models.Jurisdiction,
      }],
    })
  }

  return Agency;
};
export default agency;
