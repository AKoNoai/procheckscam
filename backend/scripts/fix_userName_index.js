/*
Migration script to fix legacy `userName` unique index issues:
- Fill missing/null `userName` with existing `username` or a generated unique value
- Drop old `userName_1` index if exists
- Create a partial unique index on `userName` so only string values are indexed unique

Usage: node scripts/fix_userName_index.js
*/

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/checkscam';

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const col = User.collection;

    // Step 1: Update documents where userName is null/empty or missing
    const cursor = col.find({ $or: [ { userName: null }, { userName: '' }, { userName: { $exists: false } } ] });
    let updated = 0;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      let newUserName = '';
      if (doc.username && typeof doc.username === 'string' && doc.username.trim()) {
        newUserName = doc.username;
      } else {
        // fallback unique value using _id
        newUserName = `user_${doc._id.toString().slice(-6)}`;
      }

      // ensure newUserName is unique by adding suffix if needed
      let candidate = newUserName;
      let i = 0;
      while (await col.findOne({ userName: candidate })) {
        i += 1;
        candidate = `${newUserName}_${Math.random().toString(36).substring(2,6)}${i}`;
      }

      await col.updateOne({ _id: doc._id }, { $set: { userName: candidate } });
      updated += 1;
    }
    console.log(`Updated ${updated} users to set non-empty userName.`);

    // Step 2: Drop legacy index if it exists
    const indexes = await col.indexes();
    const userNameIndex = indexes.find(ix => ix.key && ix.key.userName === 1);
    if (userNameIndex) {
      if (userNameIndex.name !== 'userName_1') {
        console.log(`Found userName index with name: ${userNameIndex.name}`);
      } else {
        console.log('Found legacy userName_1 index, dropping it.');
      }
      try {
        await col.dropIndex(userNameIndex.name);
        console.log(`Dropped index: ${userNameIndex.name}`);
      } catch (err) {
        console.warn('Could not drop index (it may be used differently):', err.message);
      }
    } else {
      console.log('No existing userName index found.');
    }

    // Step 3: Create partial unique index on userName for string values only
    try {
      await col.createIndex({ userName: 1 }, { unique: true, partialFilterExpression: { userName: { $type: 'string' } } });
      console.log('Created partial unique index on userName');
    } catch (err) {
      console.error('Failed to create partial unique index on userName:', err.message);
    }

    console.log('Migration completed. Please restart the backend server.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
})();