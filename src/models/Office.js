const office = (sequelize, DataTypes) => {
  const Office = sequelize.define('office', {
    type: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, { underscored: true });

  Office.associate = models => {
    Office.belongsTo(models.Company, { foreignKey: 'company_id' });
  };

  return Office;
};
export default office;
