const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: String,
  imageUrl: { type: String, required: true },
  link: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

bannerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Banner', bannerSchema);
