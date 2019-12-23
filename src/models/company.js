const company = (sequelize, DataTypes) => {
  const Company = sequelize.define('company', {
    name: {
      type: DataTypes.STRING,
    },
    yearEnd: {
      type: DataTypes.DATEONLY,
    },
  });

  Company.associate = models => {
  };

  return Company;
};
export default company;
