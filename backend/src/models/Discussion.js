const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Discussion = sequelize.define('Discussion', {
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
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM(
      'ai_ethics',
      'privacy_rights',
      'digital_rights',
      'tech_policy',
      'government_tech',
      'corporate_responsibility',
      'research_discussion',
      'policy_analysis',
      'community_news',
      'general_tech'
    ),
    allowNull: false,
  },
  discussion_type: {
    type: DataTypes.ENUM('question', 'debate', 'announcement', 'analysis', 'poll'),
    allowNull: false,
    defaultValue: 'question',
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
  views: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  comment_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  is_pinned: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  is_locked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of discussion tags',
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of file attachments',
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
  tableName: 'discussions',
  timestamps: true,
  underscored: true,
});

module.exports = Discussion;
