const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Bookmark = sequelize.define('Bookmark', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isUrl: true,
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true, // URL paste karte hi title nahi hoga, scraper layega
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.TEXT, // OG Image for beautiful UI
    allowNull: true,
  },
  favicon: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  domain: {
    type: DataTypes.STRING, // e.g., 'github.com' or 'youtube.com' for easy filtering
    allowNull: true,
  }
});

module.exports = Bookmark;