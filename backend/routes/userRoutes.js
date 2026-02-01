const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin, isSuperAdmin } = require('../middleware/auth');



// Public route
router.get('/', userController.getAllUsers);

// Protected routes
router.use(authenticate);
router.use(isAdmin);
router.post('/upload-avatar', userController.uploadAvatar);
router.put('/profile/me', userController.updateMyProfile);
router.put('/update-email', userController.updateMyEmail);
router.put('/update-password', userController.updateMyPassword);
router.put('/update-profile', userController.updateProfile);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/toggle-status', userController.toggleUserStatus);

module.exports = router;
