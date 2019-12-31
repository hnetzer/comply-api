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
    due__date_reg_offset_months: {
      type: DataTypes.FLOAT
    }
  });

  Filing.associate = models => {
    Filing.belongsTo(models.Agency, {foreignKey: 'agency_id'});
  };

  return Filing;
};
export default filing;
