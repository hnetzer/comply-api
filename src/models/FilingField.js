import models from '../models';

const filingField = (sequelize, DataTypes) => {
  const FilingField = sequelize.define('filing_field', {
    name: {
      type: DataTypes.STRING,
    },
    helper_text: {
      type: DataTypes.STRING
    },
    type: {
      type: DataTypes.STRING
    },
    order: {
      type: DataTypes.INTEGER
    }
  }, { underscored: true });

  FilingField.associate = models => {
    FilingField.belongsTo(models.Filing, { foreignKey: 'filing_id' });
  };

  return FilingField;
};

export default filingField;
