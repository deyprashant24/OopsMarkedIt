const { Collection, Bookmark } = require('../models');

// @desc    Create new collection
exports.createCollection = async (req, res) => {
  try {
    console.log("Creating collection for user:", req.user.id); // 👈 Debugging ke liye
    const { name } = req.body;
    
    const collection = await Collection.create({
      name,
      userId: req.user.id // 👈 Ensure karo ki 'userId' model mein hai
    });
    
    res.status(201).json({ success: true, data: collection });
  } catch (error) {
    console.error("Collection Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all collections with bookmark count
exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.findAll({
      where: { userId: req.user.id },
      include: [{ model: Bookmark, attributes: ['id'] }] // Count nikalne ke liye
    });
    res.status(200).json({ success: true, data: collections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update collection
exports.updateCollection = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const collection = await Collection.findOne({ 
      where: { id: req.params.id, userId: req.user.id } 
    });

    if (!collection) return res.status(404).json({ success: false, message: "Not found" });

    await collection.update({ name, description, icon });
    res.status(200).json({ success: true, data: collection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete collection
exports.deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({ 
      where: { id: req.params.id, userId: req.user.id } 
    });

    if (!collection) return res.status(404).json({ success: false, message: "Not found" });

    await collection.destroy(); // 💡 Note: Association mein onDelete: 'CASCADE' ki wajah se bookmarks safe rahenge (agar Many-to-Many hai)
    res.status(200).json({ success: true, message: "Collection deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};