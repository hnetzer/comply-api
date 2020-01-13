const user = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    name: {
      type: DataTypes.STRING,
      required: true
    },
    role: {
      type: DataTypes.STRING,
      required: true
    },
    email: {
      type: DataTypes.STRING,
      required: true
    },
    password: {
      type: DataTypes.STRING,
      required: true
    }
  }, {
    freezeTableName: true,
    instanceMethods: {
      generateHash(password) {
          return bcrypt.hash(password, bcrypt.genSaltSync(8));
      },
      validPassword(password) {
          return bcrypt.compare(password, this.password);
      }
    }
  });

  User.associate = models => {
    User.belongsTo(models.Company, {foreignKey: 'company_id'});
  };

  return User;
};
export default user;
