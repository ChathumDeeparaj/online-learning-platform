const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class UserSession extends Model {}

UserSession.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  loginTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  logoutTime: {
    type: DataTypes.DATE
  },
  ipAddress: {
    type: DataTypes.STRING
  },
  userAgent: {
    type: DataTypes.STRING
  }
}, {
  sequelize,
  modelName: 'UserSession',
  tableName: 'user_sessions'
});

module.exports = UserSession;
