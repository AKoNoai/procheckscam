const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const { authenticate, isAdmin, optionalAuthenticate } = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup upload directory for marketplace images
const uploadRoot = path.join(__dirname, '..', 'uploads', 'marketplace');
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
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 10 // Max 10 images
    }
});

const maybeUploadImages = (req, res, next) => {
    if (req.is('multipart/form-data')) {
        return upload.array('images', 10)(req, res, next);
    }
    return next();
};

// Public routes
router.get('/public', marketplaceController.getPublicListings);
router.get('/stats', marketplaceController.getStats);
router.get('/:id', optionalAuthenticate, marketplaceController.getListing);
router.get('/:id/comments', marketplaceController.getComments);

// User routes (require authentication)
router.post('/', optionalAuthenticate, maybeUploadImages, marketplaceController.createListing);
router.post('/:id/comments', optionalAuthenticate, marketplaceController.addComment);
router.patch('/:id/sold', authenticate, marketplaceController.markAsSold);

// Admin routes
router.get('/', authenticate, isAdmin, marketplaceController.getAllListings);
router.patch('/:id/approve', authenticate, isAdmin, marketplaceController.approveListing);
router.patch('/:id/reject', authenticate, isAdmin, marketplaceController.rejectListing);
router.delete('/:id', authenticate, isAdmin, marketplaceController.deleteListing);
router.delete('/:id/comments/:commentId', authenticate, isAdmin, marketplaceController.deleteComment);

module.exports = router;
