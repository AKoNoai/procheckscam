const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify token and authenticate user
exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Không có token xác thực' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Người dùng không tồn tại' 
            });
        }

        if (!user.isActive) {
            return res.status(401).json({ 
                success: false, 
                message: 'Tài khoản đã bị vô hiệu hóa' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Token không hợp lệ' 
        });
    }
};

// Optionally authenticate user if token is present (never blocks anonymous requests)
exports.optionalAuthenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return next();

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user && user.isActive) {
            req.user = user;
        }
        next();
    } catch (error) {
        // Ignore invalid tokens for optional auth
        next();
    }
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super-admin')) {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Bạn không có quyền truy cập' 
        });
    }
};

// Check if user is super admin
exports.isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'super-admin') {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Chỉ Super Admin mới có quyền thực hiện thao tác này' 
        });
    }
};
