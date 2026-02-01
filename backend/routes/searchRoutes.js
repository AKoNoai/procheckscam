const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get('/', searchController.searchProfiles);
router.get('/phone/:phone', searchController.checkPhone);
router.get('/facebook/:fbId', searchController.checkFacebook);

module.exports = router;
