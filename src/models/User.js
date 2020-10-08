import models from '../models';
import bcrypt from 'bcrypt';
import { emailIsValid, isNullOrEmpty } from '../utils'

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
      type: DataTypes.STRING
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

  User.beforeCreate(async (user, options) => {
    try {
      if (isNullOrEmpty(user.email ) || !emailIsValid(user.email)) {
        throw new Error("A valid email is required for all users")
        return;
      }

      if (!isNullOrEmpty(user.password)) {
        user.password = await bcrypt.hash()
      } else {
        delete user.password;
      }

      if (isNullOrEmpty(user.first_name)) { delete user.first_name };
      if (isNullOrEmpty(user.last_name)) { delete user.last_name };
      if (isNullOrEmpty(user.title)) { delete user.title };
    } catch (err) {
      throw new Error(err);
    }
  });

  User.afterCreate(async (user, option) => {
    return models.UserSetting.create({
      user_id: user.id,
      notifications: false
    })
  })

  User.beforeUpdate(async (user, options) => {
    try {
      if (!isNullOrEmpty(user.password)) {
        user.password = await bcrypt.hash(user.password, 10)
      } else {
        delete user.password;
      }

      if (isNullOrEmpty(user.first_name)) { delete user.first_name };
      if (isNullOrEmpty(user.last_name)) { delete user.last_name };
      if (isNullOrEmpty(user.title)) { delete user.title };
      if (isNullOrEmpty(user.email)) { delete user.email };
    } catch (err) {
      throw new Error(err);
    }
  });

  User.prototype.checkPassword = function (password) {
    return bcrypt.compare(password, this.password);
  }

  User.prototype.toJSON =  function () {
    var values = Object.assign({}, this.get());

    delete values.password;
    return values;
  }

  return User;
};
export default user;
