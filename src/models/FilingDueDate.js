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
    let date = null;
    switch(this.offset_type) {
      case 'year-end': {
         date = getYearEndOffsetDate(this.day_offset, this.month_offset,
          company.year_end_day, company.year_end_month, year);
        break;
      }
      case 'registration': {
        if (agencyRegistration != null) {
          date = getRegOffsetDate(this.day_offset, this.month_offset, this.month_end,
            agencyRegistration, year);
          break;
        }
      }
      case 'none':
      default: {
        date = moment().set({ year: year, month: this.fixed_month, date: this.fixed_day});
        break;
      }
    }

    return date.format('YYYY-MM-DD');
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
    const d = moment().year(year)
      .month(yearEndMonth).date(yearEndDay)
      .add({ days: dayOffset, months: monthOffset })
    return d
  }

  return FilingDueDate;
};

export default filingDueDate;
