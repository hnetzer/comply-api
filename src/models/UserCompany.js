const userCompany = (sequelize, DataTypes) => {
  const UserCompany = sequelize.define('user_company', {
  }, { underscored: true });

  UserCompany.associate = models => {
  };

  return UserCompany;
};

export default userCompany;
