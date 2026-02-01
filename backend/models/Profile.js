const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String,
        default: ''
    },
    contactInfo: {
        facebook: {
            id: String,
            link: String
        },
        zalo: String,
        website: String,
        phone: String
    },
    bankAccounts: [{
        bankName: String,
        accountNumber: String,
        accountHolder: String
    }],
    insuranceFund: {
        type: Number,
        default: 0
    },
    riskLevel: {
        type: String,
        enum: ['safe', 'warning', 'danger', 'unknown'],
        default: 'unknown'
    },
    reportCount: {
        positive: { type: Number, default: 0 },
        negative: { type: Number, default: 0 }
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

profileSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Profile', profileSchema);
