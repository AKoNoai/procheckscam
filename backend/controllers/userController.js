const User = require('../models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage for avatar uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error('File không hợp lệ, chỉ nhận jpg/png/gif'));
    }
});

// Get all users (admins)
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, isActive, search } = req.query;
        
        const query = {};
        
        // Exclude super-admin from the list (only show regular admins)
        // Super-admin is managed in Settings page
        if (role) {
            query.role = role;
        } else {
            query.role = { $ne: 'super-admin' };
        }
        
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { fullName: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy người dùng' 
            });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create new user (admin)
exports.createUser = async (req, res) => {
    try {
        const { password, fullName, role, avatar, services, serviceCategories } = req.body;

        // Validate
        if (!fullName) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng nhập họ tên' 
            });
        }

        // Auto-generate unique username and email
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const username = `admin_${randomStr}_${timestamp}`;
        const email = `${username}@checkscam.local`;

        // Only super-admin can create super-admin
        if (role === 'super-admin' && req.user.role !== 'super-admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Bạn không có quyền tạo Super Admin' 
            });
        }

        let servicesArray = [];
        if (Array.isArray(services)) {
            servicesArray = services;
        } else if (typeof services === 'string') {
            servicesArray = services
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean);
        }

        let serviceCategoriesArray = [];
        if (Array.isArray(serviceCategories)) {
            serviceCategoriesArray = serviceCategories;
        } else if (typeof serviceCategories === 'string') {
            serviceCategoriesArray = serviceCategories
                .split(/[,\n]/)
                .map((s) => s.trim())
                .filter(Boolean);
        }

        const user = new User({
            username,
            // also set legacy 'userName' (some databases may still have this index from older schema)
            userName: username,
            email,
            password: password || 'nopassword123',
            fullName,
            avatar: avatar || '',
            role: role || 'admin',
            services: servicesArray,
            serviceCategories: serviceCategoriesArray
        });

        // Try saving; if duplicate key error for legacy userName occurs, attempt a safe retry
        try {
            await user.save();
        } catch (err) {
            console.error('Error saving user (first attempt):', err);
            if (err && err.code === 11000) {
                // Determine which key caused duplicate
                const dupKeys = err.keyValue ? Object.keys(err.keyValue) : [];
                if (dupKeys.includes('userName') || (err.message && err.message.includes('userName'))) {
                    // Make userName unique and retry once
                    const retrySuffix = Math.random().toString(36).substring(2, 8);
                    user.userName = `${username}_${retrySuffix}`;
                    try {
                        await user.save();
                    } catch (err2) {
                        console.error('Retry save failed:', err2);
                        return res.status(400).json({ success: false, message: 'Lỗi trùng khóa khi tạo người dùng (userName). Vui lòng thử lại hoặc liên hệ quản trị.' });
                    }
                } else {
                    return res.status(400).json({ success: false, message: err.message });
                }
            } else {
                return res.status(400).json({ success: false, message: err.message });
            }
        }

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({ 
            success: true, 
            message: 'Tạo người dùng thành công',
            data: userResponse 
        });
    } catch (error) {
        console.error('createUser error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { 
            username, email, fullName, role, isActive, avatar, 
            contactInfo, bankAccounts, insuranceFund, insuranceStartDate,
            nickname, services, serviceCategories
        } = req.body;
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy người dùng' 
            });
        }

        // Only super-admin can update super-admin or change role to super-admin
        if ((user.role === 'super-admin' || role === 'super-admin') && req.user.role !== 'super-admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Bạn không có quyền chỉnh sửa Super Admin' 
            });
        }

        // Check if username or email already exists (excluding current user)
        if (username || email) {
            const existingUser = await User.findOne({
                _id: { $ne: userId },
                $or: [
                    ...(username ? [{ username }] : []),
                    ...(email ? [{ email }] : [])
                ]
            });

            if (existingUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Tên đăng nhập hoặc email đã tồn tại' 
                });
            }
        }

        // Update fields
        if (username) {
            user.username = username;
            // keep legacy field in sync if it exists in DB
            user.userName = username;
        }
        if (email) user.email = email;
        if (fullName) user.fullName = fullName;
        if (role) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;
        if (avatar !== undefined) user.avatar = avatar;
        if (contactInfo) user.contactInfo = contactInfo;
        if (bankAccounts) user.bankAccounts = bankAccounts;
        if (insuranceFund !== undefined) user.insuranceFund = insuranceFund;
        if (insuranceStartDate) user.insuranceStartDate = insuranceStartDate;
        if (nickname !== undefined) user.nickname = nickname;
        if (services !== undefined) {
            user.services = Array.isArray(services)
                ? services
                : (typeof services === 'string'
                    ? services.split('\n').map(s => s.trim()).filter(Boolean)
                    : []);
        }

        if (serviceCategories !== undefined) {
            if (Array.isArray(serviceCategories)) {
                user.serviceCategories = serviceCategories;
            } else if (typeof serviceCategories === 'string') {
                user.serviceCategories = serviceCategories
                    .split(/[\,\n]/)
                    .map((s) => s.trim())
                    .filter(Boolean);
            } else {
                user.serviceCategories = [];
            }
        }
        
        user.updatedAt = Date.now();
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({ 
            success: true, 
            message: 'Cập nhật người dùng thành công',
            data: userResponse 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Upload avatar
exports.uploadAvatar = [
    upload.single('avatar'),
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Không có file tải lên' });
        }
        const url = `/uploads/${req.file.filename}`;
        res.json({ success: true, url });
    }
];

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Cannot delete yourself
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Không thể tự xóa tài khoản của mình' 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy người dùng' 
            });
        }

        // Only super-admin can delete super-admin
        if (user.role === 'super-admin' && req.user.role !== 'super-admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Bạn không có quyền xóa Super Admin' 
            });
        }

        await User.findByIdAndDelete(userId);

        res.json({ 
            success: true, 
            message: 'Xóa người dùng thành công' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle user active status
exports.toggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy người dùng' 
            });
        }

        // Cannot toggle yourself
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Không thể tự vô hiệu hóa tài khoản của mình' 
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({ 
            success: true, 
            message: `${user.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'} tài khoản thành công`,
            data: { isActive: user.isActive }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update my profile (admin tự update thông tin của mình)
exports.updateMyProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { 
            fullName, 
            avatar, 
            contactInfo, 
            bankAccounts, 
            insuranceFund,
            insuranceStartDate,
            nickname,
            services,
            serviceCategories
        } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy người dùng' 
            });
        }

        // Update fields
        if (fullName) user.fullName = fullName;
        if (avatar) user.avatar = avatar;
        if (contactInfo) user.contactInfo = contactInfo;
        if (bankAccounts) user.bankAccounts = bankAccounts;
        if (insuranceFund !== undefined) user.insuranceFund = insuranceFund;
        if (insuranceStartDate) user.insuranceStartDate = insuranceStartDate;
        if (nickname !== undefined) user.nickname = nickname;
        if (services !== undefined) {
            user.services = Array.isArray(services)
                ? services
                : (typeof services === 'string'
                    ? services.split('\n').map(s => s.trim()).filter(Boolean)
                    : []);
        }

        if (serviceCategories !== undefined) {
            if (Array.isArray(serviceCategories)) {
                user.serviceCategories = serviceCategories;
            } else if (typeof serviceCategories === 'string') {
                user.serviceCategories = serviceCategories
                    .split(/[,\n]/)
                    .map((s) => s.trim())
                    .filter(Boolean);
            } else {
                user.serviceCategories = [];
            }
        }
        
        user.updatedAt = Date.now();
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({ 
            success: true, 
            message: 'Cập nhật thông tin thành công',
            data: userResponse
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update email (admin self)
exports.updateMyEmail = async (req, res) => {
    try {
        const { currentPassword, newEmail } = req.body;

        if (!currentPassword || !newEmail) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin'
            });
        }

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
            });
        }

        // Check if new email already exists
        const emailExists = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: 'Email này đã được sử dụng'
            });
        }

        // Update email
        user.email = newEmail;
        user.updatedAt = Date.now();
        await user.save();

        res.json({
            success: true,
            message: 'Cập nhật email thành công'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update password (admin self)
exports.updateMyPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
            });
        }

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
            });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.updatedAt = Date.now();
        await user.save();

        res.json({
            success: true,
            message: 'Cập nhật mật khẩu thành công'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update profile (avatar, fullName, username)
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, username, avatar } = req.body;

        if (!fullName || !username) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Check if username already exists
        if (username !== user.username) {
            const usernameExists = await User.findOne({ username, _id: { $ne: user._id } });
            if (usernameExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên đăng nhập đã được sử dụng'
                });
            }
        }

        user.fullName = fullName;
        user.username = username;
        if (avatar) user.avatar = avatar;
        user.updatedAt = Date.now();
        await user.save();

        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};