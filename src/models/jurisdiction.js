const jurisdiction = (sequelize, DataTypes) => {
  const Jurisdiction = sequelize.define('jurisdiction', {
    name: DataTypes.STRING,
  });

  Jurisdiction.associate = models => {
  };
  return Jurisdiction;
};
export default jurisdiction;
