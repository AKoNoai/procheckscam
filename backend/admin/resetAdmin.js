const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const resetAdminPassword = async () => {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/checkscam');
        
		console.log('✅ Đã kết nối MongoDB');

		// Find and update admin
		const admin = await User.findOne({ username: 'admin' });
        
		if (!admin) {
			console.log('❌ Không tìm thấy admin!');
			process.exit(1);
		}

		// Reset password and ensure legacy userName field is present
		admin.password = 'admin123';
		admin.isActive = true;
		admin.userName = admin.username || 'admin';
		await admin.save();
        
		console.log('✅ Reset mật khẩu Admin thành công!');
		console.log('=====================================');
		console.log('Username: admin');
		console.log('Password: admin123');
		console.log('=====================================');
        
		process.exit(0);
	} catch (error) {
		console.error('❌ Lỗi:', error.message);
		process.exit(1);
	}
};

resetAdminPassword();
