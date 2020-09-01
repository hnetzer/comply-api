'use strict';

const userSetting = (sequelize, DataTypes) => {
  const UserSetting = sequelize.define('user_settings', {
    notifications: {
      type: DataTypes.BOOLEAN,
      default: false,
      allowNull: false,
    }
  }, {});


  UserSetting.associate = models => {
    UserSetting.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return UserSetting;
};


export default userSetting;
