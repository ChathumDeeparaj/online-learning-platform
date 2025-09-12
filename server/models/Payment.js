// server/models/Payment.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Course = require('./Course');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: User,
      key: 'id'
    }
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'course_id',
    references: {
      model: Course,
      key: 'id'
    }
  },
  stripeSessionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'stripe_session_id'
  },
  stripePaymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'stripe_payment_intent_id'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'canceled', 'refunded'),
    defaultValue: 'pending',
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'payment_method'
  },
  receiptUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'receipt_url'
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'refund_amount'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'paid_at'
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'refunded_at'
  }
}, {
  tableName: 'payments',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['course_id']
    },
    {
      fields: ['stripe_session_id']
    },
    {
      fields: ['status']
    }
  ]
});

// Define associations
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Payment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Course.hasMany(Payment, { foreignKey: 'courseId', as: 'payments' });

module.exports = Payment;