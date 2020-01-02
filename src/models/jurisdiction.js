const jurisdiction = (sequelize, DataTypes) => {
  const Jurisdiction = sequelize.define('jurisdiction', {
    name: DataTypes.STRING,
  });

  Jurisdiction.associate = models => {
    Jurisdiction.belongsToMany(models.Company, { through: models.CompanyJurisdiction })
  };

  Jurisdiction.getIdsForCompany = async ({ companyId }) => {
    const CompanyJurisdiction = sequelize.models.CompanyJurisdiction;

    const ids = await CompanyJurisdiction
      .findAll({ where: { company_id: companyId }, raw: true })
      .map(j => j.jurisdiction_id)

    return ids;
  }
  return Jurisdiction;
};
export default jurisdiction;
