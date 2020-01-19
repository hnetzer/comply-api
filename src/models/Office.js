const office = (sequelize, DataTypes) => {
  const Office = sequelize.define('office', {
    address: {
      type: DataTypes.STRING,
      required: true
    },
    city: {
      type: DataTypes.STRING,
      required: true
    },
    state: {
      type: DataTypes.STRING,
      required: true
    },
    zip: {
      type: DataTypes.STRING,
      required: true
    },
  });

  Office.associate = models => {
    Office.belongsTo(models.Company, { foreignKey: 'company_id' });
  };

  return Office;
};
export default office;
