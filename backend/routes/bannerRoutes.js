const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public
router.get('/', bannerController.getAllBanners);

// Admin
router.post('/', authenticate, isAdmin, bannerController.createBanner);
router.put('/:id', authenticate, isAdmin, bannerController.updateBanner);
router.delete('/:id', authenticate, isAdmin, bannerController.deleteBanner);

module.exports = router;
