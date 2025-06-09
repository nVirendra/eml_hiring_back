const mongoose = require('mongoose');

const CandidateResponseSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  candidateInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    position: {
      type: String,
      trim: true
    }
  },
  responses: [{
    questionId: {
      type: String,
      required: true
    },
    questionText: String,
    questionType: {
      type: String,
      enum: ['number', 'select', 'checkbox']
    },
    answer: mongoose.Schema.Types.Mixed, // Can be string, number, or array
    pointsEarned: {
      type: Number,
      default: 0
    }
  }],
  totalScore: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'selected', 'rejected'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

module.exports = mongoose.Model('CandidateResponseModel',CandidateResponseSchema);