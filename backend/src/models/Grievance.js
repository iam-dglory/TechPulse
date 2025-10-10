const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Grievance = sequelize.define('Grievance', {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM(
      'privacy_breach',
      'data_misuse',
      'algorithm_bias',
      'security_vulnerability',
      'accessibility_issue',
      'environmental_impact',
      'social_impact',
      'economic_impact',
      'government_surveillance',
      'corporate_misconduct',
      'other'
    ),
    allowNull: false,
  },
  risk_level: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium',
  },
  ai_confidence: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'AI confidence score for categorization (0-1)',
  },
  status: {
    type: DataTypes.ENUM(
      'submitted',
      'under_review',
      'investigating',
      'resolved',
      'rejected',
      'escalated'
    ),
    allowNull: false,
    defaultValue: 'submitted',
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium',
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  resolution_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  upvotes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  downvotes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  is_anonymous: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of tags for categorization',
  },
  evidence_files: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of file URLs or references',
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Geographic location data',
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
  tableName: 'grievances',
  timestamps: true,
  underscored: true,
});

module.exports = Grievance;
