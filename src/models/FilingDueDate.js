import models from '../models';
import moment from 'moment';

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

  FilingDueDate.prototype.calculateDate = function (company, agencyRegistration, year) {
    switch(this.offset_type) {
      case 'year-end': {
        const date = getYearEndOffsetDate(this.day_offset, this.month_offset,
          company.year_end_day, company.year_end_month, year);
        return date.format('YYYY-MM-DD');
      }
      case 'registration': {
        if (!agencyRegistration) {
          return null;
        }
        const date = getRegOffsetDate(this.day_offset, this.month_offset, this.month_end,
          agencyRegistration, year);
        return date.format('YYYY-MM-DD');
      }
      case 'none':
      default: {
        const date = moment().set({ year: year, month: this.fixed_month, date: this.fixed_day});
        return date.format('YYYY-MM-DD');
      }
    }

    return null;
  }

  // Helper function for calculate date
  const getRegOffsetDate = (dayOffset, monthOffset, month_end, regDate, year) => {
    const d = moment(regDate).add({ months: monthOffset }).set('year', year)
    if (month_end) {
      d.endOf('month')
    } else {
      d.add({ days: dayOffset })
    }

    return d
  }

  // Helper function for calculate date
  const getYearEndOffsetDate = (dayOffset, monthOffset, yearEndDay, yearEndMonth, year) => {
    const d = moment().month(yearEndMonth).date(yearEndDay)
      .add({ days: dayOffset, months: monthOffset })
      .set('year', year)
    return d
  }

  return FilingDueDate;
};

export default filingDueDate;
