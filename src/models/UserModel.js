const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String, required: false, default: '' },
    lastName: { type: String, required: false, default: '' },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, default: null },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['superadmin', 'admin', 'user'],
      default: 'user',
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessModel',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserModel', userSchema);
