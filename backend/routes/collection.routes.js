const express = require('express');
const router = express.Router();
const { createCollection, getCollections } = require('../controllers/collection.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // 👈 Ye zaroori hai taaki user ID mil sake

router.route('/')
  .get(getCollections)
  .post(createCollection); // 👈 Ye POST method hi folder banata hai

module.exports = router;