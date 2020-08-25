import models from '../models';

const companyAgency = (sequelize, DataTypes) => {
  const CompanyAgency = sequelize.define('company_agency', {
    registration: {
      type: DataTypes.DATEONLY,
    },
    registered: {
      type: DataTypes.BOOLEAN,
    }
  }, { underscored: true });

  CompanyAgency.associate = models => {
    CompanyAgency.belongsTo(models.Agency, { foreignKey: 'agency_id' });
    CompanyAgency.belongsTo(models.Company, { foreignKey: 'company_id' });
  };


  CompanyAgency.prototype.syncFilings = async function (year) {
    const filings = await models.Filing.findAll({
      where: { agency_id: this.agency_id, disabled: false }
    })

    const company = await models.Company.findOne({
      where: { id: this.company_id },
      raw: true 
    })

    const companyFilings = []
    for (let i=0; i< filings.length; i++) {
      const instances = await filings[i].findInstances(company, year);
      companyFilings.push(...instances)
    }

    let count = 0;
    for (let i=0; i < companyFilings.length; i++) {
      const cf = await models.CompanyFiling.createIfNotExists(companyFilings[i])
      if (cf) count++;
    }

    return count;
  }

  return CompanyAgency;
};

export default companyAgency;
