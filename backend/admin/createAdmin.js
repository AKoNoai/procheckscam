const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createSuperAdmin = async () => {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/checkscam', {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
        
		console.log('✅ Đã kết nối MongoDB');

		// Check if super admin already exists
		const existingAdmin = await User.findOne({ username: 'admin' });
        
		if (existingAdmin) {
			console.log('⚠️  Super Admin đã tồn tại!');
			console.log('Username:', existingAdmin.username);
			console.log('Email:', existingAdmin.email);
			process.exit(0);
		}

		// Create super admin
		const admin = new User({
			username: 'admin',
			userName: 'admin',
			email: 'admin@checkscam.com',
			password: 'admin123',
			fullName: 'Super Administrator',
			role: 'super-admin',
			isActive: true
		});

		await admin.save();
        
		console.log('✅ Tạo Super Admin thành công!');
		console.log('=====================================');
		console.log('Username: admin');
		console.log('Password: admin123');
		console.log('Email: admin@checkscam.com');
		console.log('Role: super-admin');
		console.log('=====================================');
		console.log('Bạn có thể đăng nhập tại: http://localhost:3000/admin/login');
        
		process.exit(0);
	} catch (error) {
		console.error('❌ Lỗi:', error.message);
		process.exit(1);
	}
};

createSuperAdmin();
