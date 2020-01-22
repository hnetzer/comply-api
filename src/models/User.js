import bcrypt from 'bcrypt';

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
