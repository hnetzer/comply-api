import bcrypt from 'bcrypt';

const user = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    name: { //NOTE: this field is deprecated
      type: DataTypes.STRING,
    },
    first_name: {
      type: DataTypes.STRING,
    },
    last_name: {
      type: DataTypes.STRING,
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
      allowNull: false
    },
    roles: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    company_id: {
      type: DataTypes.INTEGER
    }
  }, { underscored: true });

  User.associate = models => {
    // User.belongsTo(models.Company, { foreignKey: 'company_id' });
    User.belongsToMany(models.Company, { through: models.UserCompany, as: 'companies' });
    User.hasOne(models.UserSetting, { foreignKey: 'user_id', as: 'settings' });
  };

  User.beforeCreate((user, options) => {
    return bcrypt.hash(user.password, 10)
      .then(hash => {
        user.password = hash;
      })
      .catch(err => {
        throw new Error();
      });
  });

  User.prototype.checkPassword = function (password) {
    return bcrypt.compare(password, this.password);
  }

  return User;
};
export default user;
