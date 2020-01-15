const user = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    name: {
      type: DataTypes.STRING,
      required: true
    },
    title: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      required: true
    }
  });

  User.associate = models => {
    User.belongsTo(models.Company, {foreignKey: 'company_id'});
  };

  return User;
};
export default user;
