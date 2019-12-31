const agency = (sequelize, DataTypes) => {
  const Agency = sequelize.define('agency', {
    name: {
      type: DataTypes.STRING,
    },
  });

  Agency.associate = models => {
    Agency.belongsTo(models.Jurisdiction, {foreignKey: 'jurisdiction_id'});
  };

  return Agency;
};
export default agency;
