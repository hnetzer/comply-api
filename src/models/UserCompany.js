const userCompany = (sequelize, DataTypes) => {
  const UserCompany = sequelize.define('user_company', {
  }, { underscored: true });

  UserCompany.associate = models => {
    UserCompany.belongsTo(models.User, { foreignKey: 'user_id' });
    UserCompany.belongsTo(models.Company, { foreignKey: 'company_id' });
  };

  return UserCompany;
};

export default userCompany;
