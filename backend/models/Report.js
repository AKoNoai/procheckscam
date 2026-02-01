const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporterName: {
        type: String,
        required: false
    },
    reporterEmail: {
        type: String,
        required: false
    },
    reporterZalo: {
        type: String
    },
    reporterPhone: String,
    targetName: {
        type: String,
        required: false
    },
    targetContact: {
        phone: String,
        facebook: String,
        zalo: String,
        bankAccount: String
        ,
        bankName: String,
        website: String
    },
    channel: {
        type: String,
        enum: ['bank', 'website'],
        required: false
    },
    reportType: {
        type: String,
        enum: ['scam', 'fraud', 'fake-profile', 'other'],
        default: 'scam'
    },
    category: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    evidence: [{
        type: String, // URL to images/documents
    }],
    amount: {
        type: Number,
        default: 0
    },
    agreement: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'resolved'],
        default: 'pending'
    },
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
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

reportSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Report', reportSchema);
