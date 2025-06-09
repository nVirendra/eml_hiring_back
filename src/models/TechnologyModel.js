const mongoose = require('mongoose');

const TechnologySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., MERN, Flutter
//   description: String,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('TechnologyModel', TechnologySchema);
