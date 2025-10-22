const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class PageView extends Model {}

PageView.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: { // Can be null for anonymous users
      model: 'Users',
      key: 'id'
    }
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING
  }
}, {
  sequelize,
  modelName: 'PageView',
  tableName: 'page_views',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { fields: ['path'] },
    { fields: ['userId'] }
  ]
});

module.exports = PageView;
