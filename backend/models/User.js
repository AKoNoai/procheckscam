const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    // Legacy compatibility: old schemas used `userName`. Keep a field to sync and migrate.
    userName: {
        type: String,
        trim: true,
        default: ''
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    fullName: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        default: ''
    },
    services: [{
        type: String
    }],
    // Danh sách game/danh mục mà admin này phụ trách (Free Fire, Liên Quân...)
    serviceCategories: [{
        type: String,
        trim: true
    }],
    role: {
        type: String,
        enum: ['admin', 'super-admin'],
        default: 'admin'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    avatar: {
        type: String,
        default: ''
    },
    contactInfo: {
        facebook: {
            id: String,
            link: String,
            secondary: String /* Fb (phụ) */
        },
        zalo: String,
        phone: String,
        shop: String /* Shop trên CS - admin có thể điền */,
        messenger: String, /* link hoặc messenger id */
        bot: String /* link tới bot check GDV */
    },
    bankAccounts: [{
        bankName: String,
        accountNumber: String,
        accountHolder: String
    }],
    insuranceFund: {
        type: Number,
        default: 10000000
    },
    insuranceStartDate: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Update timestamp
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);
