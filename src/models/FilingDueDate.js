import models from '../models';

const filingDueDate = (sequelize, DataTypes) => {
  const FilingDueDate = sequelize.define('filing_due_date', {
    offset_type: {
      type: DataTypes.ENUM('none', 'registration', 'year-end'),
    },
    fixed_month: {
      type: DataTypes.INTEGER
    },
    fixed_day: {
      type: DataTypes.INTEGER
    },
    month_offset: {
      type: DataTypes.INTEGER
    },
    day_offset: {
      type: DataTypes.INTEGER
    },
    month_end: {
      type: DataTypes.BOOLEAN
    },
  }, { underscored: true });

  FilingDueDate.associate = models => {
    FilingDueDate.belongsTo(models.Filing, { foreignKey: 'filing_id' });
  };

  return FilingDueDate;
};

export default filingDueDate;
