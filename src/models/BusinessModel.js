const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    industry: { type: String, required: false, default: '' },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String, required: false, default: '' },
    logoUrl: { type: String, required: false, default: '' },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserModel',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BusinessModel', businessSchema);
