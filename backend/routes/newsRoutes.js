const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { authenticate, isAdmin, optionalAuthenticate } = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup upload directory for news images
const uploadRoot = path.join(__dirname, '..', 'uploads', 'news');
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadRoot);
    },
    filename: (req, file, cb) => {
        const safeBase = path
            .basename(file.originalname, path.extname(file.originalname))
            .replace(/[^a-zA-Z0-9-_]+/g, '-')
            .slice(0, 60);
        const ext = (path.extname(file.originalname) || '').toLowerCase();
        cb(null, `${Date.now()}-${safeBase}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    if (!allowed.has(ext)) {
        return cb(new Error('Chỉ cho phép tải ảnh (jpg, jpeg, png, gif, webp).'));
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Public routes
router.get('/public', newsController.getPublicNews);
router.get('/stats', newsController.getStats);
router.get('/:id', optionalAuthenticate, newsController.getNewsById);

// Admin routes
router.get('/', authenticate, isAdmin, newsController.getAllNews);
router.post('/', authenticate, isAdmin, upload.single('image'), newsController.createNews);
router.put('/:id', authenticate, isAdmin, upload.single('image'), newsController.updateNews);
router.delete('/:id', authenticate, isAdmin, newsController.deleteNews);

module.exports = router;
