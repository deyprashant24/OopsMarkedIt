const User = require('./User');
const Bookmark = require('./Bookmark');
const Collection = require('./Collection');

// 1. User <-> Collection (One-to-Many)
User.hasMany(Collection, { foreignKey: 'userId', onDelete: 'CASCADE' });
Collection.belongsTo(User, { foreignKey: 'userId' });

// 2. User <-> Bookmark (One-to-Many)
User.hasMany(Bookmark, { foreignKey: 'userId', onDelete: 'CASCADE' });
Bookmark.belongsTo(User, { foreignKey: 'userId' });

// 3. Bookmark <-> Collection (Many-to-Many)
// Ek bookmark multiple collections mein ho sakta hai
Bookmark.belongsToMany(Collection, { through: 'BookmarkCollections' });
Collection.belongsToMany(Bookmark, { through: 'BookmarkCollections' });

module.exports = { User, Bookmark, Collection };