const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  technology: {
    type: String,
    required: true,
    trim: true
  },
  questions: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['number', 'select', 'checkbox'],
      required: true
    },
    question: {
      type: String,
      required: true
    },
    options: [{
      label: String,
      value: String,
      points: {
        type: Number,
        default: 0
      }
    }],
    scoring: {
      type: Map,
      of: Number,
      default: {}
    }
  }],
  createdBy: {
    type: String,
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FormModel',FormSchema);