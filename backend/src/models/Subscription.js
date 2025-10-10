const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  plan_type: {
    type: DataTypes.ENUM('free', 'basic', 'pro', 'enterprise'),
    allowNull: false,
    defaultValue: 'free',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'cancelled', 'expired'),
    allowNull: false,
    defaultValue: 'active',
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  auto_renew: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'stripe, paypal, etc.',
  },
  payment_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'External payment system ID',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD',
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Available features for this subscription',
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'subscriptions',
  timestamps: true,
  underscored: true,
});

module.exports = Subscription;
