const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { 
  addBookmark, 
  getBookmarks, 
  updateBookmark, 
  deleteBookmark 
} = require('../controllers/bookmark.controller');

// Protect all bookmark routes (User login hona zaroori hai)
router.use(protect);

// GET /api/bookmarks (Saare marks ya Collection marks laane ke liye)
// POST /api/bookmarks (Naya mark add karne ke liye)
router.route('/')
  .get(getBookmarks)
  .post(addBookmark);

// PUT /api/bookmarks/:id (Mark ko edit karne ke liye)
// DELETE /api/bookmarks/:id (Mark ko delete karne ke liye)
router.route('/:id')
  .put(updateBookmark)
  .delete(deleteBookmark);

module.exports = router;