const mongoose = require('mongoose');
const { ENV } = require('./env');

const connectDB = async () => {
  const uri = ENV.MONGO_URI;
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
  }
};

module.exports = connectDB;
