// backend/models/Collection.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db').sequelize;

const Collection = sequelize.define('Collection', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  icon: {
    type: DataTypes.STRING, // Emoji ya Lucide icon name store karne ke liye
    defaultValue: 'Folder'
  }
});

module.exports = Collection;