const jurisdiction = (sequelize, DataTypes) => {
  const Jurisdiction = sequelize.define('jurisdiction', {
    name: DataTypes.STRING,
    state: DataTypes.STRING,
    type: DataTypes.STRING,
    llc_supported: DataTypes.BOOLEAN,
    corp_supported: DataTypes.BOOLEAN,
    disabled: DataTypes.BOOLEAN
  }, { underscored: true });

  Jurisdiction.associate = models => {
    Jurisdiction.belongsToMany(models.Company, { through: models.CompanyJurisdiction })
    Jurisdiction.hasMany(models.Agency, { foreignKey: 'jurisdiction_id' })
  };

  Jurisdiction.findOrCreateState = async (stateName) => {
    const params = { name: stateName, type: 'state', state: stateName, disabled: false }
    const [instance, wasCreated] = await Jurisdiction.findOrCreate({
      where: params
    });
    if (wasCreated) console.log('Created a new jurisdiction: ', params);
    return instance;
  }

  Jurisdiction.findOrCreateCity = async (cityName, stateName) => {
    const params = { name: cityName, type: 'city', state: stateName, disabled: false }
    const [instance, wasCreated] = await Jurisdiction.findOrCreate({
      where: params
    });
    if (wasCreated) console.log('Created a new jurisdiction: ', params);
    return instance
  }

  Jurisdiction.findOrCreateCounty = async (countyName, stateName) => {
    const params = { name: countyName, type: 'county', state: stateName, disabled: false }
    const [instance, wasCreated] = await Jurisdiction.findOrCreate({
      where: params
    });
    if (wasCreated) console.log('Created a new jurisdiction: ', params);
    return instance;
  }

  return Jurisdiction;
};
export default jurisdiction;
