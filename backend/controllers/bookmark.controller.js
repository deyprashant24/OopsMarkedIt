const { Bookmark, Collection } = require('../models');
const scrapeMetadata = require('../utils/scraper');

// @desc    Add new bookmark
// @route   POST /api/bookmarks
// @access  Private
exports.addBookmark = async (req, res) => {
  try {
    const { url, collectionId } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    // 1. Scrape Metadata
    const metadata = await scrapeMetadata(url);

    // 2. Save to Database
    const bookmark = await Bookmark.create({
      url,
      title: metadata.title,
      description: metadata.description,
      imageUrl: metadata.imageUrl,
      favicon: metadata.favicon,
      domain: metadata.domain,
      userId: req.user.id // Protected route se aayega
    });

    // 3. Collection Mapping (Agar user ne folder select kiya hai)
    if (collectionId) {
      const collection = await Collection.findByPk(collectionId);
      if (collection) {
        await bookmark.addCollection(collection); 
      }
    }

    res.status(201).json({ success: true, data: bookmark, message: 'Bookmark added successfully' });
  } catch (error) {
    console.error("Add Bookmark Error:", error);
    res.status(500).json({ success: false, message: 'Failed to add bookmark' });
  }
};

// @desc    Get bookmarks (All OR by Collection)
// @route   GET /api/bookmarks?collectionId=...
// @access  Private
exports.getBookmarks = async (req, res) => {
  try {
    const { collectionId } = req.query; // 👈 URL se collectionId nikalenge

    // 🔥 Agar collectionId bheji gayi hai, toh sirf us folder ke marks laao
    if (collectionId) {
      const collection = await Collection.findOne({
        where: { id: collectionId, userId: req.user.id },
        include: [{ 
          model: Bookmark,
          through: { attributes: [] } // Junction table ka extra data hide karne ke liye
        }]
      });

      if (!collection) {
        return res.status(404).json({ success: false, message: 'Collection not found' });
      }

      // Naye marks upar dikhane ke liye sort karenge
      const sortedBookmarks = collection.Bookmarks.sort((a, b) => b.createdAt - a.createdAt);

      return res.status(200).json({
        success: true,
        count: sortedBookmarks.length,
        data: sortedBookmarks
      });
    }

    // 🌟 Agar collectionId NAHI hai, toh "All Marks" (Dashboard) ke liye sab le aao
    const bookmarks = await Bookmark.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, count: bookmarks.length, data: bookmarks });
  } catch (error) {
    console.error("Get Bookmarks Error:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update a bookmark (Manual Edit)
// @route   PUT /api/bookmarks/:id
// @access  Private
exports.updateBookmark = async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    
    // Sirf wahi mark update hoga jo is logged-in user ka hai
    const bookmark = await Bookmark.findOne({ 
      where: { id: req.params.id, userId: req.user.id } 
    });

    if (!bookmark) {
      return res.status(404).json({ success: false, message: "Bookmark not found" });
    }

    await bookmark.update({ title, description, imageUrl });

    res.status(200).json({ success: true, data: bookmark, message: "Bookmark updated" });
  } catch (error) {
    console.error("Update Bookmark Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a bookmark
// @route   DELETE /api/bookmarks/:id
// @access  Private
exports.deleteBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({ 
      where: { id: req.params.id, userId: req.user.id } 
    });

    if (!bookmark) {
      return res.status(404).json({ success: false, message: "Bookmark not found" });
    }

    await bookmark.destroy();

    res.status(200).json({ success: true, message: "Bookmark deleted successfully" });
  } catch (error) {
    console.error("Delete Bookmark Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};