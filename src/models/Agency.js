import { Op } from 'sequelize';

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
    return Agency.findAll({ where: { jurisdiction_id: { [Op.in]: ids } }, raw: true })
  }

  return Agency;
};
export default agency;
